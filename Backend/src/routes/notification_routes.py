from flask import Blueprint, request, jsonify
from src.extentions import db
from src.models.notification import Notification
from src.models.user import User
from flask_jwt_extended import jwt_required, get_jwt_identity

notification_bp = Blueprint('notification', __name__)

@notification_bp.route('/notifications', methods=['GET'])
@jwt_required()
def get_notifications():
    """Get all notifications for current user"""
    current_user_id = int(get_jwt_identity())
    
    # Pagination
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 20, type=int)
    
    notifications = Notification.query.filter_by(
        user_id=current_user_id
    ).order_by(Notification.created_at.desc()).paginate(
        page=page, per_page=per_page, error_out=False
    )
    
    return jsonify({
        'notifications': [n.to_dict() for n in notifications.items],
        'total': notifications.total,
        'page': page,
        'pages': notifications.pages,
        'unread_count': Notification.query.filter_by(
            user_id=current_user_id, 
            is_read=False
        ).count()
    }), 200

@notification_bp.route('/notifications/<int:notification_id>/read', methods=['PUT'])
@jwt_required()
def mark_notification_read(notification_id):
    """Mark a specific notification as read"""
    current_user_id = int(get_jwt_identity())
    
    notification = Notification.query.get(notification_id)
    if not notification or notification.user_id != current_user_id:
        return jsonify({'error': 'Notification not found'}), 404
    
    notification.is_read = True
    db.session.commit()
    
    return jsonify({'message': 'Notification marked as read'}), 200

@notification_bp.route('/notifications/read-all', methods=['PUT'])
@jwt_required()
def mark_all_read():
    """Mark all notifications as read"""
    current_user_id = int(get_jwt_identity())
    
    Notification.query.filter_by(
        user_id=current_user_id, 
        is_read=False
    ).update({'is_read': True})
    
    db.session.commit()
    
    return jsonify({'message': 'All notifications marked as read'}), 200

@notification_bp.route('/notifications/<int:notification_id>', methods=['DELETE'])
@jwt_required()
def delete_notification(notification_id):
    """Delete a notification"""
    current_user_id = int(get_jwt_identity())
    
    notification = Notification.query.get(notification_id)
    if not notification or notification.user_id != current_user_id:
        return jsonify({'error': 'Notification not found'}), 404
    
    db.session.delete(notification)
    db.session.commit()
    
    return jsonify({'message': 'Notification deleted'}), 200