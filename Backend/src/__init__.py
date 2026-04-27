import os
from flask import Flask
from flask_cors import CORS
from werkzeug.security import generate_password_hash

from src.extentions import db, bcrypt, jwt, mail, socketio
from src.config import config


def create_app(config_name=None):
    """Application Factory"""

    # =========================
    # CONFIG
    # =========================
    if config_name is None:
        config_name = os.environ.get('FLASK_ENV', 'production')

    app = Flask(__name__)
    app.config.from_object(config[config_name])

    # =========================
    # EXTENSIONS
    # =========================
    db.init_app(app)
    bcrypt.init_app(app)
    jwt.init_app(app)
    mail.init_app(app)

    # ⚠️ PythonAnywhere FIX (no real websockets)
    socketio.init_app(
        app,
        cors_allowed_origins="*",
        async_mode="threading"
    )

    # =========================
    # CORS
    # =========================
    CORS(app, origins="*", allow_headers=["Content-Type", "Authorization"])

    # =========================
    # UPLOAD FOLDERS
    # =========================
    base_upload = app.config.get('UPLOAD_FOLDER', 'uploads')

    os.makedirs(base_upload, exist_ok=True)
    os.makedirs(os.path.join(base_upload, 'assignments'), exist_ok=True)
    os.makedirs(os.path.join(base_upload, 'profiles'), exist_ok=True)

    # =========================
    # BLUEPRINTS
    # =========================
    register_blueprints(app)

    # =========================
    # DEFAULT ADMIN
    # =========================
    create_default_admin(app)

    return app


# ======================================================
# BLUEPRINT REGISTRATION
# ======================================================
def register_blueprints(app):
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


# ======================================================
# DEFAULT ADMIN CREATION (RUNS ON STARTUP)
# ======================================================
def create_default_admin(app):
    from src.extentions import db
    from src.models.user import User  # change if your model name differs

    with app.app_context():
        admin_email = "admin@lms.com"

        existing_admin = User.query.filter_by(email=admin_email).first()

        if not existing_admin:
            admin = User(
                email=admin_email,
                password=generate_password_hash("Admin@123456"),
                role="admin"
            )

            db.session.add(admin)
            db.session.commit()
            print("✅ Default admin created")
        else:
            print("ℹ️ Admin already exists")