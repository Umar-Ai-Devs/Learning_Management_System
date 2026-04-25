from flask import Blueprint, request, jsonify
from src.extentions import db, bcrypt, jwt
from src.models.user import User
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from datetime import datetime, timedelta
import re

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/auth/login', methods=['POST'])
def login():
    """Login user - works for all roles (students, teachers, admins)"""
    data = request.get_json() if request.is_json else request.form
    
    email = data.get('email')
    password = data.get('password')
    
    if not email or not password:
        return jsonify({'error': 'Email and password are required'}), 400
    
    user = User.query.filter_by(email=email).first()
    
    if not user:
        return jsonify({'error': 'User not found'}), 404
    
    if not bcrypt.check_password_hash(user.password, password):
        return jsonify({'error': 'Invalid password'}), 401
    
    # Check if account is active
    if not user.is_active:
        return jsonify({'error': 'Account is deactivated. Contact admin.'}), 403
    
    # Update last login
    user.last_login = datetime.utcnow()
    db.session.commit()
    
    # Create token - identity MUST be a string
    token = create_access_token(
    identity=str(user.id),  # <-- CONVERT TO STRING
    additional_claims={
        "user_id": user.id,
        "email": user.email,
        "role": user.role,
        "name": user.name
    },
    expires_delta=timedelta(days=7)
)
    
    return jsonify({
        'token': token,
        'user': user.to_dict()
    }), 200

@auth_bp.route('/auth/me', methods=['GET'])
@jwt_required()
def get_current_user():
    """Get current user information"""
    current_user_id = get_jwt_identity()  # This will be a string
    user = User.query.get(int(current_user_id))  # Convert back to int for query
    
    if not user:
        return jsonify({'error': 'User not found'}), 404
    
    return jsonify(user.to_dict()), 200

@auth_bp.route('/auth/change-password', methods=['POST'])
@jwt_required()
def change_password():
    """Change password for logged-in user"""
    current_user_id = get_jwt_identity()
    user = User.query.get(int(current_user_id))
    data = request.get_json() if request.is_json else request.form
    
    old_password = data.get('old_password')
    new_password = data.get('new_password')
    
    if not old_password or not new_password:
        return jsonify({'error': 'Both old and new passwords are required'}), 400
    
    if len(new_password) < 6:
        return jsonify({'error': 'New password must be at least 6 characters'}), 400
    
    if not bcrypt.check_password_hash(user.password, old_password):
        return jsonify({'error': 'Invalid old password'}), 401
    
    user.password = bcrypt.generate_password_hash(new_password).decode('utf-8')
    db.session.commit()
    
    return jsonify({'message': 'Password changed successfully'}), 200

@auth_bp.route('/auth/update-profile', methods=['PUT'])
@jwt_required()
def update_profile():
    """Update user profile (name and email)"""
    current_user_id = get_jwt_identity()
    user = User.query.get(int(current_user_id))
    data = request.get_json() if request.is_json else request.form
    
    name = data.get('name')
    email = data.get('email')
    
    if name:
        user.name = name
    
    if email:
        # Check if email is already taken by another user
        existing_user = User.query.filter(User.email == email, User.id != user.id).first()
        if existing_user:
            return jsonify({'error': 'Email already taken'}), 400
        user.email = email
    
    db.session.commit()
    
    return jsonify({
        'message': 'Profile updated successfully',
        'user': user.to_dict()
    }), 200