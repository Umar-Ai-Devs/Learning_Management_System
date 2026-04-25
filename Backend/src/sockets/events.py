from src.extentions import socketio
from flask_socketio import emit, join_room, leave_room, disconnect
from flask_jwt_extended import decode_token
from src.models.user import User
from src.models.notification import Notification
from src.extentions import db
import jwt

# Store active connections
active_users = {}  # {user_id: [session_ids]}
user_rooms = {}    # {user_id: [room_names]}

@socketio.on('connect')
def handle_connect():
    """Handle client connection"""
    print(f'Client connected: {request.sid}')
    
    # Get token from headers
    token = request.headers.get('Authorization', '').replace('Bearer ', '')
    
    if token:
        try:
            # Decode token to get user info
            decoded = decode_token(token)
            user_id = decoded['sub']
            
            # Store connection
            if user_id not in active_users:
                active_users[user_id] = []
            active_users[user_id].append(request.sid)
            
            # Join user's personal room
            user_room = f"user_{user_id}"
            join_room(user_room)
            
            if user_id not in user_rooms:
                user_rooms[user_id] = []
            user_rooms[user_id].append(user_room)
            
            # Send unread notifications count
            unread_count = Notification.query.filter_by(
                user_id=int(user_id), 
                is_read=False
            ).count()
            
            emit('connection_established', {
                'status': 'connected',
                'user_id': user_id,
                'unread_count': unread_count
            }, room=request.sid)
            
            print(f"User {user_id} connected. Active users: {len(active_users)}")
            
        except Exception as e:
            print(f"Auth error: {e}")
            emit('auth_error', {'message': 'Invalid token'}, room=request.sid)
            disconnect()

@socketio.on('disconnect')
def handle_disconnect():
    """Handle client disconnection"""
    print(f'Client disconnected: {request.sid}')
    
    # Remove from active users
    for user_id, sessions in list(active_users.items()):
        if request.sid in sessions:
            sessions.remove(request.sid)
            if not sessions:
                del active_users[user_id]
            break

@socketio.on('join_course_room')
def handle_join_course_room(data):
    """Join a course-specific room for real-time updates"""
    course_id = data.get('course_id')
    token = request.headers.get('Authorization', '').replace('Bearer ', '')
    
    if token and course_id:
        try:
            decoded = decode_token(token)
            user_id = decoded['sub']
            
            course_room = f"course_{course_id}"
            join_room(course_room)
            
            print(f"User {user_id} joined course room: {course_room}")
            emit('joined_course', {'course_id': course_id}, room=request.sid)
            
        except Exception as e:
            print(f"Error joining course room: {e}")

@socketio.on('mark_notification_read')
def handle_mark_read(data):
    """Mark notification as read"""
    notification_id = data.get('notification_id')
    token = request.headers.get('Authorization', '').replace('Bearer ', '')
    
    if token and notification_id:
        try:
            decoded = decode_token(token)
            user_id = int(decoded['sub'])
            
            notification = Notification.query.get(notification_id)
            if notification and notification.user_id == user_id:
                notification.is_read = True
                db.session.commit()
                
                # Get updated unread count
                unread_count = Notification.query.filter_by(
                    user_id=user_id, 
                    is_read=False
                ).count()
                
                emit('notification_read', {
                    'notification_id': notification_id,
                    'unread_count': unread_count
                }, room=f"user_{user_id}")
                
        except Exception as e:
            print(f"Error marking notification read: {e}")

def send_notification_to_user(user_id, title, message, type, data=None):
    """Send notification to specific user"""
    try:
        # Save to database
        notification = Notification(
            user_id=user_id,
            title=title,
            message=message,
            type=type,
            data=data,
            is_read=False
        )
        db.session.add(notification)
        db.session.commit()
        
        # Get unread count
        unread_count = Notification.query.filter_by(
            user_id=user_id, 
            is_read=False
        ).count()
        
        # Send real-time via Socket.IO
        socketio.emit('new_notification', {
            'notification': notification.to_dict(),
            'unread_count': unread_count
        }, room=f"user_{user_id}")
        
        return notification
        
    except Exception as e:
        print(f"Error sending notification: {e}")
        return None

def broadcast_to_course(course_id, event, data):
    """Broadcast event to all users in a course"""
    socketio.emit(event, data, room=f"course_{course_id}")

def notify_course_students(course_id, title, message, type, data=None):
    """Send notification to all students in a course"""
    from src.models.course import Course
    from src.models.enrollment import Enrollment
    
    course = Course.query.get(course_id)
    if course:
        enrollments = Enrollment.query.filter_by(course_id=course_id, status='active').all()
        
        for enrollment in enrollments:
            send_notification_to_user(
                enrollment.student_id,
                title,
                message,
                type,
                data
            )