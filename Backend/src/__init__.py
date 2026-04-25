from flask import Flask
from flask_cors import CORS
from src.extentions import db, bcrypt, jwt, mail, socketio
from src.config import config
import os


def create_app(config_name=None):
    """Application Factory"""

    if config_name is None:
        config_name = os.environ.get('FLASK_ENV', 'production')

    app = Flask(__name__)
    app.config.from_object(config[config_name])

    # Initialize extensions
    db.init_app(app)
    bcrypt.init_app(app)
    jwt.init_app(app)
    mail.init_app(app)
    socketio.init_app(app, cors_allowed_origins="*")

    # CORS setup
    CORS(app, origins="*", allow_headers=["Content-Type", "Authorization"])

    # Create upload folders safely
    os.makedirs(app.config.get('UPLOAD_FOLDER', 'uploads'), exist_ok=True)
    os.makedirs(app.config.get('ASSIGNMENT_UPLOAD_FOLDER', 'uploads/assignments'), exist_ok=True)
    os.makedirs(app.config.get('PROFILE_UPLOAD_FOLDER', 'uploads/profiles'), exist_ok=True)

    # Register blueprints
    register_blueprints(app)

    # IMPORTANT:
    # ❌ DO NOT call db.create_all() here on production (PythonAnywhere)
    # It causes crashes if DB is not ready

    return app


def register_blueprints(app):
    """Register all routes"""

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