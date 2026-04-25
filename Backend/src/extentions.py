from flask_sqlalchemy import SQLAlchemy
from flask_bcrypt import Bcrypt
from flask_jwt_extended import JWTManager
from flask_mail import Mail
from flask_socketio import SocketIO

db = SQLAlchemy()
bcrypt = Bcrypt()
jwt = JWTManager()
mail = Mail()

# SocketIO (let it auto-detect async mode)
socketio = SocketIO(cors_allowed_origins="*", async_mode="threading")

# JWT Callbacks

@jwt.user_identity_loader
def user_identity_lookup(user):
    """Convert user object to string identity"""
    return str(user)


@jwt.user_lookup_loader
def user_lookup_callback(_jwt_header, jwt_data):
    """Load user from database using identity"""
    from src.models.user import User
    identity = jwt_data["sub"]
    return User.query.get(int(identity))


@jwt.expired_token_loader
def expired_token_callback(jwt_header, jwt_data):
    from flask import jsonify
    return jsonify({
        'error': 'Token expired',
        'message': 'Your session has expired. Please login again.'
    }), 401


@jwt.invalid_token_loader
def invalid_token_callback(error):
    from flask import jsonify
    return jsonify({
        'error': 'Invalid token',
        'message': 'Invalid authentication token. Please login again.'
    }), 401


@jwt.unauthorized_loader
def unauthorized_callback(error):
    from flask import jsonify
    return jsonify({
        'error': 'Missing token',
        'message': 'Authentication token is missing.'
    }), 401