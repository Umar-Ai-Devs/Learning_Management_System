from flask import Flask, jsonify
from flask_cors import CORS
from src.extentions import db, bcrypt, jwt, mail, socketio
from src.config import config  # This should work now
import os

def create_app(config_name=None):
    """Application factory"""
    if config_name is None:
        config_name = os.environ.get('FLASK_ENV', 'development')
    
    app = Flask(__name__)
    app.config.from_object(config[config_name])
    
    # Initialize extensions
    db.init_app(app)
    bcrypt.init_app(app)
    jwt.init_app(app)
    mail.init_app(app)
    socketio.init_app(app, cors_allowed_origins="*")
    
    # Configure CORS
    CORS(app, origins="*", allow_headers=["Content-Type", "Authorization"])
    
    # Create upload directories
    os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)
    os.makedirs(app.config['ASSIGNMENT_UPLOAD_FOLDER'], exist_ok=True)
    os.makedirs(app.config['PROFILE_UPLOAD_FOLDER'], exist_ok=True)
    
    # Register blueprints
    register_blueprints(app)
    
    # Create tables
    with app.app_context():
        db.create_all()
        create_default_admin()
        
    return app

def register_blueprints(app):
    """Register all blueprints"""
    from src.routes.auth import auth_bp
    from src.routes.student import student_bp
    from src.routes.teacher import teacher_bp
    from src.routes.attendance import attendance_bp
    from src.routes.admin import admin_bp
    from src.routes.student_crud import student_crud_bp
    from src.routes.teacher_crud import teacher_crud_bp
    from src.routes.notification_routes import notification_bp
    
    app.register_blueprint(auth_bp, url_prefix='/api')
    app.register_blueprint(student_bp, url_prefix='/api')
    app.register_blueprint(teacher_bp, url_prefix='/api')
    app.register_blueprint(attendance_bp, url_prefix='/api')
    app.register_blueprint(admin_bp, url_prefix='/api')
    app.register_blueprint(student_crud_bp, url_prefix='/api')
    app.register_blueprint(teacher_crud_bp, url_prefix='/api')
    app.register_blueprint(notification_bp, url_prefix='/api')

def create_default_admin():
    """Create default admin user if not exists"""
    from src.models.user import User
    from src.extentions import bcrypt
    
    admin_email = "admin@lms.com"
    if not User.query.filter_by(email=admin_email).first():
        default_admin = User(
            name="System Administrator",
            email=admin_email,
            password=bcrypt.generate_password_hash("Admin@123456").decode('utf-8'),
            role="admin",
            is_active=True
        )
        db.session.add(default_admin)
        db.session.commit()
        print("=" * 60)
        print("✅ Default Admin Created!")
        print(f"📧 Email: {admin_email}")
        print(f"🔑 Password: Admin@123456")
        print("=" * 60)