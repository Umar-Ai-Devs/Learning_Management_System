from flask import Blueprint, request, jsonify, send_file, current_app
from src.extentions import db
from src.models.user import User
from src.models.course import Course
from src.models.enrollment import Enrollment
from src.models.assignments import Assignment
from src.models.submission import Submission
from src.sockets.events import send_notification_to_user, broadcast_to_course
from src.utils.file_upload import save_assignment_file, allowed_file
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import datetime
import os

student_crud_bp = Blueprint('student_crud', __name__)

# Helper function to check if user is student
def is_student(user_id):
    user = User.query.get(user_id)
    return user and user.role == 'student'

# ============ COURSE MANAGEMENT FOR STUDENTS ============

@student_crud_bp.route('/student/courses', methods=['GET'])
@jwt_required()
def get_available_courses():
    """Get all available courses for students"""
    current_user_id = int(get_jwt_identity())
    
    if not is_student(current_user_id):
        return jsonify({'error': 'Access denied. Student only.'}), 403
    
    # Get all active courses
    courses = Course.query.filter_by(is_active=True).all()
    
    # Get enrolled course IDs for this student
    enrolled_courses = Enrollment.query.filter_by(
        student_id=current_user_id,
        status='active'
    ).with_entities(Enrollment.course_id).all()
    
    enrolled_ids = [ec[0] for ec in enrolled_courses]
    
    # Mark which courses are enrolled
    courses_data = []
    for course in courses:
        course_dict = course.to_dict()
        course_dict['is_enrolled'] = course.id in enrolled_ids
        courses_data.append(course_dict)
    
    return jsonify({
        'courses': courses_data,
        'count': len(courses_data)
    }), 200

@student_crud_bp.route('/student/my-courses', methods=['GET'])
@jwt_required()
def get_my_enrolled_courses():
    """Get courses enrolled by current student"""
    current_user_id = int(get_jwt_identity())
    
    if not is_student(current_user_id):
        return jsonify({'error': 'Access denied. Student only.'}), 403
    
    enrollments = Enrollment.query.filter_by(
        student_id=current_user_id,
        status='active'
    ).all()
    
    courses = [enrollment.course.to_dict() for enrollment in enrollments]
    
    return jsonify({
        'courses': courses,
        'count': len(courses)
    }), 200

@student_crud_bp.route('/student/courses/enroll/<int:course_id>', methods=['POST'])
@jwt_required()
def enroll_in_course(course_id):
    """Enroll in a course"""
    current_user_id = int(get_jwt_identity())
    
    if not is_student(current_user_id):
        return jsonify({'error': 'Access denied. Student only.'}), 403
    
    # Check if course exists
    course = Course.query.get(course_id)
    if not course:
        return jsonify({'error': 'Course not found'}), 404
    
    # Check if already enrolled
    existing = Enrollment.query.filter_by(
        student_id=current_user_id,
        course_id=course_id
    ).first()
    
    if existing:
        return jsonify({'error': 'Already enrolled in this course'}), 400
    
    # Create enrollment
    enrollment = Enrollment(
        student_id=current_user_id,
        course_id=course_id,
        status='active'
    )
    
    db.session.add(enrollment)
    db.session.commit()
    
    return jsonify({
        'message': f'Successfully enrolled in {course.title}',
        'enrollment': enrollment.to_dict()
    }), 201

@student_crud_bp.route('/student/courses/drop/<int:course_id>', methods=['DELETE'])
@jwt_required()
def drop_course(course_id):
    """Drop a course"""
    current_user_id = int(get_jwt_identity())
    
    if not is_student(current_user_id):
        return jsonify({'error': 'Access denied. Student only.'}), 403
    
    enrollment = Enrollment.query.filter_by(
        student_id=current_user_id,
        course_id=course_id
    ).first()
    
    if not enrollment:
        return jsonify({'error': 'Not enrolled in this course'}), 404
    
    # Update status to dropped instead of deleting
    enrollment.status = 'dropped'
    db.session.commit()
    
    return jsonify({'message': 'Course dropped successfully'}), 200

# ============ ASSIGNMENT MANAGEMENT ============

@student_crud_bp.route('/student/assignments', methods=['GET'])
@jwt_required()
def get_my_assignments():
    """Get all assignments for student's enrolled courses"""
    current_user_id = int(get_jwt_identity())
    
    if not is_student(current_user_id):
        return jsonify({'error': 'Access denied. Student only.'}), 403
    
    # Get enrolled course IDs
    enrollments = Enrollment.query.filter_by(
        student_id=current_user_id,
        status='active'
    ).all()
    
    course_ids = [e.course_id for e in enrollments]
    
    # Get assignments for those courses
    assignments = Assignment.query.filter(
        Assignment.course_id.in_(course_ids)
    ).all()
    
    # Check which assignments are submitted
    submissions = Submission.query.filter_by(student_id=current_user_id).all()
    submitted_ids = [s.assignment_id for s in submissions]
    
    assignments_data = []
    for assignment in assignments:
        assignment_dict = assignment.to_dict()
        assignment_dict['is_submitted'] = assignment.id in submitted_ids
        assignment_dict['is_overdue'] = assignment.due_date < datetime.utcnow()
        assignments_data.append(assignment_dict)
    
    return jsonify({
        'assignments': assignments_data,
        'count': len(assignments_data)
    }), 200

@student_crud_bp.route('/student/assignments/<int:assignment_id>/submit', methods=['POST'])
@jwt_required()
def submit_assignment(assignment_id):
    """Submit assignment with file upload"""
    current_user_id = int(get_jwt_identity())
    
    if not is_student(current_user_id):
        return jsonify({'error': 'Access denied. Student only.'}), 403
    
    assignment = Assignment.query.get(assignment_id)
    if not assignment:
        return jsonify({'error': 'Assignment not found'}), 404
    
    existing = Submission.query.filter_by(
        assignment_id=assignment_id,
        student_id=current_user_id
    ).first()
    
    if existing:
        return jsonify({'error': 'Already submitted'}), 400
    
    submission_text = request.form.get('submission_text')
    file = request.files.get('file')
    
    if not submission_text and not file:
        return jsonify({'error': 'Either submission text or file is required'}), 400
    
    submission = Submission(
        assignment_id=assignment_id,
        student_id=current_user_id,
        submission_text=submission_text
    )
    
    if file and allowed_file(file.filename):
        file_path = save_assignment_file(file, current_user_id, assignment_id)
        if file_path:
            submission.file_path = file_path
            submission.file_name = file.filename
            submission.file_size = len(file.read()) if hasattr(file, 'read') else 0
            submission.file_type = file.content_type
            file.seek(0)
    
    db.session.add(submission)
    db.session.commit()
    
    student = User.query.get(current_user_id)
    teacher_id = assignment.course.teacher_id
    
    notification_message = f"{student.name} has submitted the assignment '{assignment.title}'"
    if submission.file_path:
        notification_message += f" with file: {file.filename}"
    
    send_notification_to_user(
        teacher_id,
        f"New Submission: {assignment.title}",
        notification_message,
        'submission',
        {
            'submission_id': submission.id,
            'assignment_id': assignment_id,
            'student_id': current_user_id,
            'student_name': student.name,
            'course_id': assignment.course_id,
            'has_file': bool(submission.file_path),
            'file_name': submission.file_name
        }
    )
    
    broadcast_to_course(assignment.course_id, 'submission_received', {
        'assignment_id': assignment_id,
        'student_id': current_user_id,
        'student_name': student.name,
        'submission_time': datetime.utcnow().isoformat(),
        'has_file': bool(submission.file_path),
        'file_name': submission.file_name
    })
    
    return jsonify({
        'message': 'Assignment submitted successfully',
        'submission': submission.to_dict()
    }), 201

@student_crud_bp.route('/student/submissions', methods=['GET'])
@jwt_required()
def get_my_submissions():
    """Get all submissions by current student"""
    current_user_id = int(get_jwt_identity())
    
    if not is_student(current_user_id):
        return jsonify({'error': 'Access denied. Student only.'}), 403
    
    submissions = Submission.query.filter_by(student_id=current_user_id).all()
    
    return jsonify({
        'submissions': [s.to_dict() for s in submissions],
        'count': len(submissions)
    }), 200

# ============ SUBMISSION DOWNLOAD ============

@student_crud_bp.route('/student/submissions/<int:submission_id>/download', methods=['GET'])
@jwt_required()
def download_submission_file(submission_id):
    """Download submission file"""
    current_user_id = int(get_jwt_identity())
    
    submission = Submission.query.get(submission_id)
    if not submission:
        return jsonify({'error': 'Submission not found'}), 404
    
    user = User.query.get(current_user_id)
    is_owner = (submission.student_id == current_user_id)
    is_teacher = (user.role == 'teacher' and submission.assignment.course.teacher_id == current_user_id)
    is_admin = (user.role == 'admin')
    
    if not (is_owner or is_teacher or is_admin):
        return jsonify({'error': 'Access denied'}), 403
    
    abs_path = os.path.join(current_app.root_path, submission.file_path) if submission.file_path else None
    if not abs_path or not os.path.exists(abs_path):
        return jsonify({'error': 'File not found'}), 404
    
    return send_file(
        abs_path,
        as_attachment=True,
        download_name=submission.file_name,
        mimetype=submission.file_type
    )

# ============ GRADE VIEWING ============

@student_crud_bp.route('/student/grades', methods=['GET'])
@jwt_required()
def get_my_grades():
    """Get grades for all enrolled courses"""
    current_user_id = int(get_jwt_identity())
    
    if not is_student(current_user_id):
        return jsonify({'error': 'Access denied. Student only.'}), 403
    
    enrollments = Enrollment.query.filter_by(student_id=current_user_id).all()
    
    grades = []
    for enrollment in enrollments:
        grades.append({
            'course_id': enrollment.course_id,
            'course_title': enrollment.course.title,
            'course_code': enrollment.course.code,
            'grade': enrollment.grade,
            'status': enrollment.status
        })
    
    # Calculate GPA (simplified)
    grade_points = {'A': 4.0, 'B': 3.0, 'C': 2.0, 'D': 1.0, 'F': 0.0}
    total_points = 0
    graded_courses = 0
    
    for grade_info in grades:
        if grade_info['grade'] in grade_points:
            total_points += grade_points[grade_info['grade']]
            graded_courses += 1
    
    gpa = total_points / graded_courses if graded_courses > 0 else 0
    
    return jsonify({
        'grades': grades,
        'gpa': round(gpa, 2),
        'total_courses': len(grades)
    }), 200

