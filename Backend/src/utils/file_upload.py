import os
import uuid
from werkzeug.utils import secure_filename
from flask import current_app
from datetime import datetime

def allowed_file(filename):
    """Check if file extension is allowed"""
    if not filename:
        return False
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in current_app.config['ALLOWED_EXTENSIONS']

def get_file_extension(filename):
    """Get file extension"""
    return filename.rsplit('.', 1)[1].lower() if '.' in filename else ''

def save_assignment_file(file, student_id, assignment_id):
    """Save assignment file and return file path"""
    if not file or not allowed_file(file.filename):
        return None
    
    # Create unique filename
    original_filename = secure_filename(file.filename)
    extension = get_file_extension(original_filename)
    unique_filename = f"assignment_{assignment_id}_student_{student_id}_{datetime.now().strftime('%Y%m%d_%H%M%S')}.{extension}"
    
    # Ensure upload directory exists
    upload_dir = current_app.config['ASSIGNMENT_UPLOAD_FOLDER']
    os.makedirs(upload_dir, exist_ok=True)
    
    # Save file
    file_path = os.path.join(upload_dir, unique_filename)
    file.save(file_path)
    
    # Return relative path for database storage
    return f"uploads/assignments/{unique_filename}"

def save_profile_image(file, user_id):
    """Save profile image and return file path"""
    if not file or not allowed_file(file.filename):
        return None
    
    original_filename = secure_filename(file.filename)
    extension = get_file_extension(original_filename)
    unique_filename = f"profile_{user_id}_{datetime.now().strftime('%Y%m%d_%H%M%S')}.{extension}"
    
    upload_dir = current_app.config['PROFILE_UPLOAD_FOLDER']
    os.makedirs(upload_dir, exist_ok=True)
    
    file_path = os.path.join(upload_dir, unique_filename)
    file.save(file_path)
    
    return f"uploads/profiles/{unique_filename}"

def delete_file(file_path):
    """Delete a file from the filesystem"""
    if file_path and os.path.exists(file_path):
        os.remove(file_path)
        return True
    return False