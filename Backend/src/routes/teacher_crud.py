from flask import Blueprint, request, jsonify, send_file, current_app
from src.extentions import db
from src.models.user import User
from src.models.course import Course
from src.models.enrollment import Enrollment
from src.models.assignments import Assignment
from src.models.submission import Submission
from src.sockets.events import send_notification_to_user, broadcast_to_course, notify_course_students
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import datetime
import os

teacher_crud_bp = Blueprint('teacher_crud', __name__)

# Helper function to check if user is teacher
def is_teacher(user_id):
    user = User.query.get(user_id)
    return user and user.role == 'teacher'

# ============ COURSE MANAGEMENT ============

@teacher_crud_bp.route('/teacher/courses', methods=['GET'])
@jwt_required()
def teacher_get_my_courses():
    """Get all courses taught by current teacher"""
    current_user_id = int(get_jwt_identity())
    
    if not is_teacher(current_user_id):
        return jsonify({'error': 'Access denied. Teacher only.'}), 403
    
    courses = Course.query.filter_by(teacher_id=current_user_id).all()
    
    return jsonify({
        'courses': [course.to_dict() for course in courses],
        'count': len(courses)
    }), 200

@teacher_crud_bp.route('/teacher/courses', methods=['POST'])
@jwt_required()
def teacher_create_new_course():
    """Create a new course"""
    current_user_id = int(get_jwt_identity())
    
    if not is_teacher(current_user_id):
        return jsonify({'error': 'Access denied. Teacher only.'}), 403
    
    data = request.get_json() if request.is_json else request.form
    
    title = data.get('title')
    description = data.get('description')
    code = data.get('code')
    credits = data.get('credits', 3)
    
    if not title or not code:
        return jsonify({'error': 'Title and course code are required'}), 400
    
    # Check if course code exists
    existing = Course.query.filter_by(code=code).first()
    if existing:
        return jsonify({'error': 'Course code already exists'}), 400
    
    course = Course(
        title=title,
        description=description,
        code=code,
        credits=credits,
        teacher_id=current_user_id,
        is_active=True
    )
    
    db.session.add(course)
    db.session.commit()
    
    return jsonify({
        'message': 'Course created successfully',
        'course': course.to_dict()
    }), 201

@teacher_crud_bp.route('/teacher/courses/<int:course_id>', methods=['PUT'])
@jwt_required()
def teacher_update_course(course_id):
    """Update course details"""
    current_user_id = int(get_jwt_identity())
    
    if not is_teacher(current_user_id):
        return jsonify({'error': 'Access denied. Teacher only.'}), 403
    
    course = Course.query.get(course_id)
    if not course:
        return jsonify({'error': 'Course not found'}), 404
    
    if course.teacher_id != current_user_id:
        return jsonify({'error': 'You can only update your own courses'}), 403
    
    data = request.get_json() if request.is_json else request.form
    
    if 'title' in data:
        course.title = data['title']
    if 'description' in data:
        course.description = data['description']
    if 'credits' in data:
        course.credits = data['credits']
    if 'is_active' in data:
        course.is_active = data['is_active']
    
    course.updated_at = datetime.utcnow()
    db.session.commit()
    
    return jsonify({
        'message': 'Course updated successfully',
        'course': course.to_dict()
    }), 200

@teacher_crud_bp.route('/teacher/courses/<int:course_id>', methods=['DELETE'])
@jwt_required()
def teacher_delete_course(course_id):
    """Delete a course"""
    current_user_id = int(get_jwt_identity())
    
    if not is_teacher(current_user_id):
        return jsonify({'error': 'Access denied. Teacher only.'}), 403
    
    course = Course.query.get(course_id)
    if not course:
        return jsonify({'error': 'Course not found'}), 404
    
    if course.teacher_id != current_user_id:
        return jsonify({'error': 'You can only delete your own courses'}), 403
    
    db.session.delete(course)
    db.session.commit()
    
    return jsonify({'message': 'Course deleted successfully'}), 200

# ============ STUDENT MANAGEMENT FOR TEACHERS ============

@teacher_crud_bp.route('/teacher/courses/<int:course_id>/students', methods=['GET'])
@jwt_required()
def teacher_get_course_students(course_id):
    """Get all students enrolled in a course"""
    current_user_id = int(get_jwt_identity())
    
    if not is_teacher(current_user_id):
        return jsonify({'error': 'Access denied. Teacher only.'}), 403
    
    course = Course.query.get(course_id)
    if not course:
        return jsonify({'error': 'Course not found'}), 404
    
    if course.teacher_id != current_user_id:
        return jsonify({'error': 'You can only view your own courses'}), 403
    
    enrollments = Enrollment.query.filter_by(course_id=course_id, status='active').all()
    
    students = []
    for enrollment in enrollments:
        student = enrollment.student
        students.append({
            'enrollment_id': enrollment.id,
            'student_id': student.id,
            'name': student.name,
            'email': student.email,
            'roll_number': student.roll_number,
            'semester': student.semester,
            'department': student.department,
            'grade': enrollment.grade,
            'enrollment_date': enrollment.enrollment_date.isoformat()
        })
    
    return jsonify({
        'course': course.to_dict(),
        'students': students,
        'count': len(students)
    }), 200

@teacher_crud_bp.route('/teacher/courses/<int:course_id>/students/<int:student_id>/grade', methods=['PUT'])
@jwt_required()
def teacher_update_student_grade(course_id, student_id):
    """Update grade for a student in a course"""
    current_user_id = int(get_jwt_identity())
    
    if not is_teacher(current_user_id):
        return jsonify({'error': 'Access denied. Teacher only.'}), 403
    
    course = Course.query.get(course_id)
    if not course:
        return jsonify({'error': 'Course not found'}), 404
    
    if course.teacher_id != current_user_id:
        return jsonify({'error': 'You can only grade your own courses'}), 403
    
    enrollment = Enrollment.query.filter_by(
        course_id=course_id,
        student_id=student_id
    ).first()
    
    if not enrollment:
        return jsonify({'error': 'Student not enrolled in this course'}), 404
    
    data = request.get_json() if request.is_json else request.form
    grade = data.get('grade')
    
    if grade not in ['A', 'B', 'C', 'D', 'F', None]:
        return jsonify({'error': 'Invalid grade. Must be A, B, C, D, or F'}), 400
    
    enrollment.grade = grade
    db.session.commit()
    
    # Send notification to student
    if grade:
        send_notification_to_user(
            student_id,
            "Grade Updated",
            f"Your grade for {course.title} has been updated to {grade}",
            'grade',
            {'course_id': course_id, 'grade': grade}
        )
    
    return jsonify({
        'message': f'Grade updated to {grade} for {enrollment.student.name}',
        'student': enrollment.student.name,
        'grade': grade
    }), 200

# ============ ASSIGNMENT MANAGEMENT ============

@teacher_crud_bp.route('/teacher/assignments', methods=['GET'])
@jwt_required()
def teacher_get_assignments():
    """Get all assignments for teacher's courses"""
    current_user_id = int(get_jwt_identity())
    
    if not is_teacher(current_user_id):
        return jsonify({'error': 'Access denied. Teacher only.'}), 403
    
    assignments = Assignment.query.join(Course).filter(
        Course.teacher_id == current_user_id
    ).all()
    
    return jsonify({
        'assignments': [a.to_dict() for a in assignments],
        'count': len(assignments)
    }), 200

@teacher_crud_bp.route('/teacher/courses/<int:course_id>/assignments', methods=['POST'])
@jwt_required()
def teacher_create_assignment(course_id):
    """Create an assignment for a course"""
    current_user_id = int(get_jwt_identity())
    
    if not is_teacher(current_user_id):
        return jsonify({'error': 'Access denied. Teacher only.'}), 403
    
    course = Course.query.get(course_id)
    if not course:
        return jsonify({'error': 'Course not found'}), 404
    
    if course.teacher_id != current_user_id:
        return jsonify({'error': 'You can only create assignments for your own courses'}), 403
    
    data = request.get_json() if request.is_json else request.form
    
    title = data.get('title')
    description = data.get('description')
    due_date_str = data.get('due_date')
    total_points = data.get('total_points', 100)
    
    if not title or not due_date_str:
        return jsonify({'error': 'Title and due date are required'}), 400
    
    try:
        due_date = datetime.fromisoformat(due_date_str)
    except ValueError:
        return jsonify({'error': 'Invalid date format. Use ISO format (YYYY-MM-DDTHH:MM:SS)'}), 400
    
    assignment = Assignment(
        title=title,
        description=description,
        course_id=course_id,
        due_date=due_date,
        total_points=total_points,
        created_by=current_user_id
    )
    
    db.session.add(assignment)
    db.session.commit()
    
    # Notify all students in the course
    notify_course_students(
        course_id,
        f"New Assignment: {title}",
        f"A new assignment '{title}' has been posted in {course.title}. Due date: {due_date.strftime('%B %d, %Y')}",
        'assignment',
        {
            'assignment_id': assignment.id,
            'course_id': course_id,
            'due_date': due_date.isoformat()
        }
    )
    
    # Broadcast to course room
    broadcast_to_course(course_id, 'assignment_created', {
        'assignment': assignment.to_dict(),
        'course': course.to_dict(),
        'message': f'New assignment created: {title}'
    })
    
    return jsonify({
        'message': 'Assignment created and students notified successfully',
        'assignment': assignment.to_dict()
    }), 201

@teacher_crud_bp.route('/teacher/assignments/<int:assignment_id>/submissions', methods=['GET'])
@jwt_required()
def teacher_get_assignment_submissions(assignment_id):
    """Get all submissions for an assignment"""
    current_user_id = int(get_jwt_identity())
    
    if not is_teacher(current_user_id):
        return jsonify({'error': 'Access denied. Teacher only.'}), 403
    
    assignment = Assignment.query.get(assignment_id)
    if not assignment:
        return jsonify({'error': 'Assignment not found'}), 404
    
    if assignment.course.teacher_id != current_user_id:
        return jsonify({'error': 'You can only view submissions for your own assignments'}), 403
    
    submissions = Submission.query.filter_by(assignment_id=assignment_id).all()
    
    submissions_data = []
    for submission in submissions:
        sub_dict = submission.to_dict()
        sub_dict['has_file'] = bool(submission.file_path)
        sub_dict['download_url'] = f"/api/teacher/submissions/{submission.id}/view" if submission.file_path else None
        submissions_data.append(sub_dict)
    
    return jsonify({
        'assignment': assignment.to_dict(),
        'submissions': submissions_data,
        'count': len(submissions_data),
        'submitted_count': len([s for s in submissions if s.submitted_at]),
        'pending_count': len([s for s in submissions if not s.grade]),
        'with_files_count': len([s for s in submissions if s.file_path])
    }), 200

@teacher_crud_bp.route('/teacher/submissions/<int:submission_id>/grade', methods=['PUT'])
@jwt_required()
def teacher_grade_submission(submission_id):
    """Grade a student's submission"""
    current_user_id = int(get_jwt_identity())
    
    if not is_teacher(current_user_id):
        return jsonify({'error': 'Access denied. Teacher only.'}), 403
    
    submission = Submission.query.get(submission_id)
    if not submission:
        return jsonify({'error': 'Submission not found'}), 404
    
    if submission.assignment.course.teacher_id != current_user_id:
        return jsonify({'error': 'You can only grade submissions for your own assignments'}), 403
    
    data = request.get_json() if request.is_json else request.form
    
    grade = data.get('grade')
    feedback = data.get('feedback')
    
    if grade is None:
        return jsonify({'error': 'Grade is required'}), 400
    
    old_grade = submission.grade
    submission.grade = float(grade)
    submission.feedback = feedback
    submission.graded_by = current_user_id
    submission.graded_at = datetime.utcnow()
    
    db.session.commit()
    
    # Notification to student
    grade_message = f"Your submission for '{submission.assignment.title}' has been graded. Score: {grade}/{submission.assignment.total_points}"
    if feedback:
        grade_message += f"\nFeedback: {feedback}"
    
    send_notification_to_user(
        submission.student_id,
        f"Assignment Graded: {submission.assignment.title}",
        grade_message,
        'grade',
        {
            'submission_id': submission.id,
            'assignment_id': submission.assignment_id,
            'grade': grade,
            'total_points': submission.assignment.total_points,
            'old_grade': old_grade
        }
    )
    
    # Broadcast to course room
    broadcast_to_course(submission.assignment.course_id, 'grade_updated', {
        'student_id': submission.student_id,
        'assignment_id': submission.assignment_id,
        'grade': grade,
        'feedback': feedback
    })
    
    return jsonify({
        'message': 'Submission graded and student notified successfully',
        'submission': submission.to_dict()
    }), 200

@teacher_crud_bp.route('/teacher/submissions/<int:submission_id>/view', methods=['GET'])
@jwt_required()
def teacher_view_submission_file(submission_id):
    """View/download submission file for teacher"""
    current_user_id = int(get_jwt_identity())
    
    if not is_teacher(current_user_id):
        return jsonify({'error': 'Access denied. Teacher only.'}), 403
    
    submission = Submission.query.get(submission_id)
    if not submission:
        return jsonify({'error': 'Submission not found'}), 404
    
    if submission.assignment.course.teacher_id != current_user_id:
        return jsonify({'error': 'You can only view submissions for your own courses'}), 403
    
    abs_path = os.path.join(current_app.root_path, submission.file_path) if submission.file_path else None
    if not abs_path or not os.path.exists(abs_path):
        return jsonify({'error': 'File not found'}), 404
    
    if submission.file_type == 'application/pdf':
        return send_file(abs_path, mimetype='application/pdf')
    else:
        return send_file(
            abs_path,
            as_attachment=True,
            download_name=submission.file_name,
            mimetype=submission.file_type
        )