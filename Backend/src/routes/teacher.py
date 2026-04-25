from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from src.models.user import User
from src.extentions import db


teacher_bp = Blueprint('teacher', __name__)

@teacher_bp.route('/teacher/dashboard', methods=['GET'])
@jwt_required()
def teacher_dashboard():
    current_user_id = int(get_jwt_identity())
    user = User.query.get(current_user_id)
    
    if not user or user.role not in ['teacher', 'admin']:
        return jsonify({'error': 'Access denied. Teacher or Admin only.'}), 403
    
    return jsonify({
        'message': f'Welcome {user.name} to Teacher Dashboard',
        'user': user.to_dict()
    }), 200


@teacher_bp.route('/teacher/deactivate', methods=['POST'])
@jwt_required()
def deactivate_teacher():
    current_user_id = int(get_jwt_identity())
    user = User.query.get(current_user_id)
    
    if not user or user.role not in ['teacher', 'admin']:
        return jsonify({'error': 'Access denied. Teacher or Admin only.'}), 403
    
    user.is_active = False
    db.session.commit()
    
    return jsonify({'message': 'Teacher account deactivated. Contact admin to reactivate.'}), 200




@teacher_bp.route('/teacher/activate', methods=['POST'])
@jwt_required()
def activate_teacher():
    current_user_id = int(get_jwt_identity())
    user = User.query.get(current_user_id)
    
    if not user or user.role not in ['teacher', 'admin']:
        return jsonify({'error': 'Access denied. Teacher or Admin only.'}), 403
    
    user.is_active = True
    db.session.commit()
    
    return jsonify({'message': 'Teacher account activated.'}), 200


@teacher_bp.route('/teacher/profile', methods=['GET'])
@jwt_required()
def get_teacher_profile():
    current_user_id = int(get_jwt_identity())
    user = User.query.get(current_user_id)
    
    if not user or user.role not in ['teacher', 'admin']:
        return jsonify({'error': 'Access denied. Teacher or Admin only.'}), 403
    
    return jsonify(user.to_dict()), 200


@teacher_bp.route('/teacher/profile', methods=['PUT'])
@jwt_required()
def update_teacher_profile():
    current_user_id = int(get_jwt_identity())
    user = User.query.get(current_user_id)
    
    if not user or user.role not in ['teacher', 'admin']:
        return jsonify({'error': 'Access denied. Teacher or Admin only.'}), 403
    
    data = request.get_json() if request.is_json else request.form
    
    # Allow updating name and email for teachers
    name = data.get('name')
    email = data.get('email')
    
    if name:
        user.name = name
    if email:
        user.email = email
    
    db.session.commit()
    
    return jsonify({
        'message': 'Teacher profile updated successfully',
        'user': user.to_dict()
    }), 200


#Delete teacher account (admin only)
@teacher_bp.route('/teacher/delete', methods=['DELETE'])
@jwt_required()
def delete_teacher_account():
    current_user_id = int(get_jwt_identity())
    user = User.query.get(current_user_id)
    
    if not user or user.role != 'admin':
        return jsonify({'error': 'Access denied. Admin only.'}), 403
    
    # Prevent admin from deleting themselves
    if current_user_id == user.id:
        return jsonify({'error': 'Cannot delete your own account'}), 400
    
    db.session.delete(user)
    db.session.commit()
    
    return jsonify({'message': 'Teacher account deleted successfully'}), 200
