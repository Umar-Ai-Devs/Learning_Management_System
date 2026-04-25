from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from src.models.user import User

student_bp = Blueprint('student', __name__)

@student_bp.route('/student/dashboard', methods=['GET'])
@jwt_required()
def student_dashboard():
    current_user_id = get_jwt_identity()
    user = User.query.get(int(current_user_id))
    
    if not user or user.role != 'student':
        return jsonify({'error': 'Access denied. Student only.'}), 403
    
    return jsonify({
        'message': f'Welcome {user.name} to Student Dashboard',
        'user': user.to_dict()
    }), 200