import os
from datetime import timedelta
from dotenv import load_dotenv

load_dotenv()


class Config:
    """Base configuration"""

    # Flask
    SECRET_KEY = os.environ.get('SECRET_KEY', 'dev-secret-key-change-in-production')
    DEBUG = False
    TESTING = False

    # ==============================
    # DATABASE (IMPORTANT FIX HERE)
    # ==============================
    SQLALCHEMY_DATABASE_URI = os.environ.get(
        'DATABASE_URL',
        'mysql+pymysql://umaraidevs:YOUR_PASSWORD@umaraidevs.mysql.pythonanywhere-services.com/db_lms_1'
    )

    SQLALCHEMY_TRACK_MODIFICATIONS = False

    SQLALCHEMY_ENGINE_OPTIONS = {
        'pool_size': int(os.environ.get('DATABASE_POOL_SIZE', 10)),
        'pool_recycle': int(os.environ.get('DATABASE_POOL_RECYCLE', 3600)),
        'pool_pre_ping': True
    }

    # JWT
    JWT_SECRET_KEY = os.environ.get('JWT_SECRET_KEY', 'jwt-secret-key-change-this')
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(days=7)
    JWT_TOKEN_LOCATION = ['headers']
    JWT_HEADER_NAME = 'Authorization'
    JWT_HEADER_TYPE = 'Bearer'

    # File Uploads
    UPLOAD_FOLDER = os.environ.get('UPLOAD_FOLDER', 'uploads')
    MAX_CONTENT_LENGTH = int(os.environ.get('MAX_CONTENT_LENGTH', 16 * 1024 * 1024))

    ALLOWED_EXTENSIONS = {'pdf', 'doc', 'docx', 'txt', 'zip', 'jpg', 'png'}

    ASSIGNMENT_UPLOAD_FOLDER = os.path.join(UPLOAD_FOLDER, 'assignments')
    PROFILE_UPLOAD_FOLDER = os.path.join(UPLOAD_FOLDER, 'profiles')

    # CORS
    CORS_ORIGINS = os.environ.get('CORS_ORIGINS', '*').split(',')

    # Email
    MAIL_SERVER = os.environ.get('MAIL_SERVER', 'smtp.gmail.com')
    MAIL_PORT = int(os.environ.get('MAIL_PORT', 587))
    MAIL_USE_TLS = True
    MAIL_USERNAME = os.environ.get('MAIL_USERNAME')
    MAIL_PASSWORD = os.environ.get('MAIL_PASSWORD')
    MAIL_DEFAULT_SENDER = os.environ.get('MAIL_DEFAULT_SENDER', 'noreply@lms.com')

    # Redis
    REDIS_URL = os.environ.get('REDIS_URL', 'redis://localhost:6379/0')


class DevelopmentConfig(Config):
    DEBUG = True
    SQLALCHEMY_DATABASE_URI = os.environ.get(
        'DEV_DATABASE_URL',
        'mysql+pymysql://root:@localhost/lms_dev'
    )


class TestingConfig(Config):
    DEBUG = False
    TESTING = True
    SQLALCHEMY_DATABASE_URI = 'sqlite:///:memory:'
    JWT_SECRET_KEY = 'test-jwt-secret'


class ProductionConfig(Config):
    """Production (PythonAnywhere)"""

    DEBUG = False
    TESTING = False

    # Force PythonAnywhere DB in production
    SQLALCHEMY_DATABASE_URI = os.environ.get(
        'DATABASE_URL',
        'mysql+pymysql://umaraidevs:YOUR_PASSWORD@umaraidevs.mysql.pythonanywhere-services.com/db_lms_1'
    )

    SESSION_COOKIE_SECURE = True
    SESSION_COOKIE_HTTPONLY = True
    SESSION_COOKIE_SAMESITE = 'Lax'
    REMEMBER_COOKIE_SECURE = True


# Configuration mapping
config = {
    'development': DevelopmentConfig,
    'testing': TestingConfig,
    'production': ProductionConfig,
    'default': DevelopmentConfig
}