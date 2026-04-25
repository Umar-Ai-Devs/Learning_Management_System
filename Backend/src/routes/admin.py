from flask import Blueprint, request, jsonify
from src.extentions import db, bcrypt
from src.models.user import User
from src.models.course import Course
from src.models.enrollment import Enrollment
from src.models.assignments import Assignment
from src.models.submission import Submission
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import datetime
import re

admin_bp = Blueprint('admin', __name__)

# Middleware to check if user is admin
def check_admin():
    current_user_id = get_jwt_identity()
    user = User.query.get(int(current_user_id))
    if not user or user.role != 'admin':
        return False
    return True

# ============ USER MANAGEMENT (Existing) ============

@admin_bp.route('/admin/users', methods=['GET'])
@jwt_required()
def get_all_users():
    """Get all users (admin only)"""
    if not check_admin():
        return jsonify({'error': 'Admin access required'}), 403
    
    # Get query parameters for filtering
    role = request.args.get('role')
    is_active = request.args.get('is_active')
    search = request.args.get('search')  # Search by name or email
    
    query = User.query
    
    if role:
        query = query.filter_by(role=role)
    
    if is_active is not None:
        is_active_bool = is_active.lower() == 'true'
        query = query.filter_by(is_active=is_active_bool)
    
    if search:
        query = query.filter(
            (User.name.like(f'%{search}%')) | 
            (User.email.like(f'%{search}%'))
        )
    
    users = query.all()
    
    return jsonify({
        'users': [user.to_dict() for user in users],
        'count': len(users)
    }), 200

# ============ STUDENT MANAGEMENT ============

@admin_bp.route('/admin/students', methods=['GET'])
@jwt_required()
def get_all_students():
    """Get all students with their details (admin only)"""
    if not check_admin():
        return jsonify({'error': 'Admin access required'}), 403
    
    # Get query parameters
    search = request.args.get('search')
    semester = request.args.get('semester')
    department = request.args.get('department')
    is_active = request.args.get('is_active')
    
    query = User.query.filter_by(role='student')
    
    if search:
        query = query.filter(
            (User.name.like(f'%{search}%')) | 
            (User.email.like(f'%{search}%')) |
            (User.roll_number.like(f'%{search}%'))
        )
    
    if semester:
        query = query.filter_by(semester=semester)
    
    if department:
        query = query.filter_by(department=department)
    
    if is_active is not None:
        is_active_bool = is_active.lower() == 'true'
        query = query.filter_by(is_active=is_active_bool)
    
    students = query.all()
    
    # Get additional stats for each student
    students_data = []
    for student in students:
        student_dict = student.to_dict()
        
        # Get enrollment stats
        enrollments = Enrollment.query.filter_by(student_id=student.id).all()
        student_dict['total_courses'] = len(enrollments)
        student_dict['active_courses'] = len([e for e in enrollments if e.status == 'active'])
        student_dict['completed_courses'] = len([e for e in enrollments if e.status == 'completed'])
        
        # Calculate average grade
        grades = [e.grade for e in enrollments if e.grade]
        grade_points = {'A': 4.0, 'B': 3.0, 'C': 2.0, 'D': 1.0, 'F': 0.0}
        if grades:
            avg_points = sum(grade_points.get(g, 0) for g in grades) / len(grades)
            student_dict['average_grade'] = round(avg_points, 2)
        else:
            student_dict['average_grade'] = None
        
        # Get submission stats
        submissions = Submission.query.filter_by(student_id=student.id).all()
        student_dict['total_submissions'] = len(submissions)
        student_dict['graded_submissions'] = len([s for s in submissions if s.grade is not None])
        
        students_data.append(student_dict)
    
    return jsonify({
        'students': students_data,
        'count': len(students_data)
    }), 200

@admin_bp.route('/admin/students/<int:student_id>', methods=['GET'])
@jwt_required()
def get_student_details(student_id):
    """Get detailed information about a specific student (admin only)"""
    if not check_admin():
        return jsonify({'error': 'Admin access required'}), 403
    
    student = User.query.get(student_id)
    if not student or student.role != 'student':
        return jsonify({'error': 'Student not found'}), 404
    
    student_dict = student.to_dict()
    
    # Get all enrollments with course details
    enrollments = Enrollment.query.filter_by(student_id=student.id).all()
    student_dict['enrollments'] = []
    
    for enrollment in enrollments:
        course = enrollment.course
        student_dict['enrollments'].append({
            'enrollment_id': enrollment.id,
            'course_id': course.id,
            'course_title': course.title,
            'course_code': course.code,
            'teacher_name': course.teacher.name if course.teacher else None,
            'enrollment_date': enrollment.enrollment_date.isoformat() if enrollment.enrollment_date else None,
            'status': enrollment.status,
            'grade': enrollment.grade
        })
    
    # Get all submissions with assignment details
    submissions = Submission.query.filter_by(student_id=student.id).all()
    student_dict['submissions'] = []
    
    for submission in submissions:
        assignment = submission.assignment
        student_dict['submissions'].append({
            'submission_id': submission.id,
            'assignment_title': assignment.title,
            'course_title': assignment.course.title if assignment.course else None,
            'submitted_at': submission.submitted_at.isoformat() if submission.submitted_at else None,
            'grade': submission.grade,
            'feedback': submission.feedback
        })
    
    # Get statistics
    student_dict['statistics'] = {
        'total_enrollments': len(enrollments),
        'active_courses': len([e for e in enrollments if e.status == 'active']),
        'completed_courses': len([e for e in enrollments if e.status == 'completed']),
        'total_submissions': len(submissions),
        'graded_submissions': len([s for s in submissions if s.grade is not None])
    }
    
    return jsonify(student_dict), 200

@admin_bp.route('/admin/students/<int:student_id>', methods=['PUT'])
@jwt_required()
def update_student(student_id):
    """Update student information (admin only)"""
    if not check_admin():
        return jsonify({'error': 'Admin access required'}), 403
    
    student = User.query.get(student_id)
    if not student or student.role != 'student':
        return jsonify({'error': 'Student not found'}), 404
    
    data = request.get_json() if request.is_json else request.form
    
    # Update basic info
    if 'name' in data:
        student.name = data['name']
    if 'email' in data:
        # Check if email is already taken
        existing = User.query.filter(User.email == data['email'], User.id != student_id).first()
        if existing:
            return jsonify({'error': 'Email already taken'}), 400
        student.email = data['email']
    if 'phone' in data:
        student.phone = data['phone']
    if 'address' in data:
        student.address = data['address']
    
    # Update student specific fields
    if 'roll_number' in data:
        # Check if roll number is unique
        existing = User.query.filter(User.roll_number == data['roll_number'], User.id != student_id).first()
        if existing:
            return jsonify({'error': 'Roll number already exists'}), 400
        student.roll_number = data['roll_number']
    if 'semester' in data:
        student.semester = int(data['semester'])
    if 'department' in data:
        student.department = data['department']
    if 'is_active' in data:
        student.is_active = bool(data['is_active'])
    
    db.session.commit()
    
    return jsonify({
        'message': 'Student updated successfully',
        'student': student.to_dict()
    }), 200

@admin_bp.route('/admin/students/<int:student_id>', methods=['DELETE'])
@jwt_required()
def delete_student(student_id):
    """Delete a student (admin only)"""
    if not check_admin():
        return jsonify({'error': 'Admin access required'}), 403
    
    student = User.query.get(student_id)
    if not student or student.role != 'student':
        return jsonify({'error': 'Student not found'}), 404
    
    # Delete all enrollments first (cascade will handle)
    db.session.delete(student)
    db.session.commit()
    
    return jsonify({'message': 'Student deleted successfully'}), 200

# ============ TEACHER MANAGEMENT ============

@admin_bp.route('/admin/teachers', methods=['GET'])
@jwt_required()
def get_all_teachers():
    """Get all teachers with their details (admin only)"""
    if not check_admin():
        return jsonify({'error': 'Admin access required'}), 403
    
    # Get query parameters
    search = request.args.get('search')
    specialization = request.args.get('specialization')
    is_active = request.args.get('is_active')
    
    query = User.query.filter_by(role='teacher')
    
    if search:
        query = query.filter(
            (User.name.like(f'%{search}%')) | 
            (User.email.like(f'%{search}%'))
        )
    
    if specialization:
        query = query.filter_by(specialization=specialization)
    
    if is_active is not None:
        is_active_bool = is_active.lower() == 'true'
        query = query.filter_by(is_active=is_active_bool)
    
    teachers = query.all()
    
    # Get additional stats for each teacher
    teachers_data = []
    for teacher in teachers:
        teacher_dict = teacher.to_dict()
        
        # Get courses taught by this teacher
        courses = Course.query.filter_by(teacher_id=teacher.id).all()
        teacher_dict['total_courses'] = len(courses)
        teacher_dict['active_courses'] = len([c for c in courses if c.is_active])
        
        # Get total students taught
        total_students = set()
        for course in courses:
            enrollments = Enrollment.query.filter_by(course_id=course.id).all()
            for enrollment in enrollments:
                total_students.add(enrollment.student_id)
        teacher_dict['total_students_taught'] = len(total_students)
        
        # Get assignments stats
        assignments = Assignment.query.join(Course).filter(Course.teacher_id == teacher.id).all()
        teacher_dict['total_assignments'] = len(assignments)
        
        # Get submissions to grade
        total_submissions = 0
        graded_submissions = 0
        for assignment in assignments:
            submissions = Submission.query.filter_by(assignment_id=assignment.id).all()
            total_submissions += len(submissions)
            graded_submissions += len([s for s in submissions if s.grade is not None])
        
        teacher_dict['total_submissions_received'] = total_submissions
        teacher_dict['graded_submissions'] = graded_submissions
        teacher_dict['pending_grading'] = total_submissions - graded_submissions
        
        teachers_data.append(teacher_dict)
    
    return jsonify({
        'teachers': teachers_data,
        'count': len(teachers_data)
    }), 200

@admin_bp.route('/admin/teachers/<int:teacher_id>', methods=['GET'])
@jwt_required()
def get_teacher_details(teacher_id):
    """Get detailed information about a specific teacher (admin only)"""
    if not check_admin():
        return jsonify({'error': 'Admin access required'}), 403
    
    teacher = User.query.get(teacher_id)
    if not teacher or teacher.role != 'teacher':
        return jsonify({'error': 'Teacher not found'}), 404
    
    teacher_dict = teacher.to_dict()
    
    # Get all courses taught by this teacher
    courses = Course.query.filter_by(teacher_id=teacher.id).all()
    teacher_dict['courses'] = []
    
    for course in courses:
        # Get enrollment count for each course
        enrollment_count = Enrollment.query.filter_by(course_id=course.id, status='active').count()
        
        teacher_dict['courses'].append({
            'course_id': course.id,
            'title': course.title,
            'code': course.code,
            'credits': course.credits,
            'enrollment_count': enrollment_count,
            'is_active': course.is_active,
            'created_at': course.created_at.isoformat() if course.created_at else None
        })
    
    # Get all assignments with submission stats
    assignments = Assignment.query.join(Course).filter(Course.teacher_id == teacher.id).all()
    teacher_dict['assignments'] = []
    
    for assignment in assignments:
        submissions = Submission.query.filter_by(assignment_id=assignment.id).all()
        graded_count = len([s for s in submissions if s.grade is not None])
        
        teacher_dict['assignments'].append({
            'assignment_id': assignment.id,
            'title': assignment.title,
            'course_title': assignment.course.title,
            'due_date': assignment.due_date.isoformat() if assignment.due_date else None,
            'total_submissions': len(submissions),
            'graded_count': graded_count,
            'pending_count': len(submissions) - graded_count
        })
    
    # Get statistics
    total_students = set()
    for course in courses:
        enrollments = Enrollment.query.filter_by(course_id=course.id).all()
        for enrollment in enrollments:
            total_students.add(enrollment.student_id)
    
    teacher_dict['statistics'] = {
        'total_courses': len(courses),
        'active_courses': len([c for c in courses if c.is_active]),
        'total_students': len(total_students),
        'total_assignments': len(assignments),
        'total_submissions': sum(len(Submission.query.filter_by(assignment_id=a.id).all()) for a in assignments)
    }
    
    return jsonify(teacher_dict), 200

@admin_bp.route('/admin/teachers/<int:teacher_id>', methods=['PUT'])
@jwt_required()
def update_teacher(teacher_id):
    """Update teacher information (admin only)"""
    if not check_admin():
        return jsonify({'error': 'Admin access required'}), 403
    
    teacher = User.query.get(teacher_id)
    if not teacher or teacher.role != 'teacher':
        return jsonify({'error': 'Teacher not found'}), 404
    
    data = request.get_json() if request.is_json else request.form
    
    # Update basic info
    if 'name' in data:
        teacher.name = data['name']
    if 'email' in data:
        # Check if email is already taken
        existing = User.query.filter(User.email == data['email'], User.id != teacher_id).first()
        if existing:
            return jsonify({'error': 'Email already taken'}), 400
        teacher.email = data['email']
    
    # Update teacher specific fields
    if 'qualification' in data:
        teacher.qualification = data['qualification']
    if 'specialization' in data:
        teacher.specialization = data['specialization']
    if 'is_active' in data:
        teacher.is_active = bool(data['is_active'])
    
    db.session.commit()
    
    return jsonify({
        'message': 'Teacher updated successfully',
        'teacher': teacher.to_dict()
    }), 200

@admin_bp.route('/admin/teachers/<int:teacher_id>', methods=['DELETE'])
@jwt_required()
def delete_teacher(teacher_id):
    """Delete a teacher (admin only)"""
    if not check_admin():
        return jsonify({'error': 'Admin access required'}), 403
    
    teacher = User.query.get(teacher_id)
    if not teacher or teacher.role != 'teacher':
        return jsonify({'error': 'Teacher not found'}), 404
    
    # Check if teacher has courses
    courses = Course.query.filter_by(teacher_id=teacher_id).first()
    if courses:
        return jsonify({'error': 'Cannot delete teacher with existing courses. Reassign courses first.'}), 400
    
    db.session.delete(teacher)
    db.session.commit()
    
    return jsonify({'message': 'Teacher deleted successfully'}), 200

# ============ COURSE MANAGEMENT (Admin View) ============

@admin_bp.route('/admin/courses', methods=['GET'])
@jwt_required()
def get_all_courses():
    """Get all courses with teacher and enrollment info (admin only)"""
    if not check_admin():
        return jsonify({'error': 'Admin access required'}), 403
    
    courses = Course.query.all()
    
    courses_data = []
    for course in courses:
        course_dict = course.to_dict()
        
        # Get enrollment count
        enrollment_count = Enrollment.query.filter_by(course_id=course.id).count()
        active_enrollments = Enrollment.query.filter_by(course_id=course.id, status='active').count()
        
        course_dict['enrollment_count'] = enrollment_count
        course_dict['active_enrollments'] = active_enrollments
        
        # Get assignment count
        assignment_count = Assignment.query.filter_by(course_id=course.id).count()
        course_dict['assignment_count'] = assignment_count
        
        courses_data.append(course_dict)
    
    return jsonify({
        'courses': courses_data,
        'count': len(courses_data)
    }), 200

# ============ DASHBOARD STATISTICS ============

@admin_bp.route('/admin/dashboard', methods=['GET'])
@jwt_required()
def get_admin_dashboard():
    """Get comprehensive dashboard statistics (admin only)"""
    if not check_admin():
        return jsonify({'error': 'Admin access required'}), 403
    
    # User statistics
    total_students = User.query.filter_by(role='student').count()
    total_teachers = User.query.filter_by(role='teacher').count()
    total_admins = User.query.filter_by(role='admin').count()
    active_users = User.query.filter_by(is_active=True).count()
    
    # Course statistics
    total_courses = Course.query.count()
    active_courses = Course.query.filter_by(is_active=True).count()
    
    # Enrollment statistics
    total_enrollments = Enrollment.query.count()
    active_enrollments = Enrollment.query.filter_by(status='active').count()
    
    # Assignment statistics
    total_assignments = Assignment.query.count()
    upcoming_assignments = Assignment.query.filter(Assignment.due_date > datetime.utcnow()).count()
    
    # Submission statistics
    total_submissions = Submission.query.count()
    graded_submissions = Submission.query.filter(Submission.grade.isnot(None)).count()
    
    # Recent activities
    recent_students = User.query.filter_by(role='student').order_by(User.created_at.desc()).limit(5).all()
    recent_teachers = User.query.filter_by(role='teacher').order_by(User.created_at.desc()).limit(5).all()
    recent_courses = Course.query.order_by(Course.created_at.desc()).limit(5).all()
    
    return jsonify({
        'statistics': {
            'users': {
                'total_students': total_students,
                'total_teachers': total_teachers,
                'total_admins': total_admins,
                'active_users': active_users
            },
            'courses': {
                'total_courses': total_courses,
                'active_courses': active_courses
            },
            'enrollments': {
                'total_enrollments': total_enrollments,
                'active_enrollments': active_enrollments
            },
            'assignments': {
                'total_assignments': total_assignments,
                'upcoming_assignments': upcoming_assignments
            },
            'submissions': {
                'total_submissions': total_submissions,
                'graded_submissions': graded_submissions,
                'pending_grading': total_submissions - graded_submissions
            }
        },
        'recent_activities': {
            'recent_students': [s.to_dict() for s in recent_students],
            'recent_teachers': [t.to_dict() for t in recent_teachers],
            'recent_courses': [c.to_dict() for c in recent_courses]
        }
    }), 200

# ============ EXISTING METHODS (Keep these) ============

@admin_bp.route('/admin/users/create', methods=['POST'])
@jwt_required()
def create_user():
    """Create a new user (admin only)"""
    if not check_admin():
        return jsonify({'error': 'Admin access required'}), 403
    
    data = request.get_json() if request.is_json else request.form
    
    name = data.get('name')
    email = data.get('email')
    password = data.get('password')
    role = data.get('role')
    
    if not name or not email or not password or not role:
        return jsonify({'error': 'Name, email, password and role are required'}), 400
    
    if len(password) < 6:
        return jsonify({'error': 'Password must be at least 6 characters'}), 400
    
    if not re.match(r"[^@]+@[^@]+\.[^@]+", email):
        return jsonify({'error': 'Invalid email format'}), 400
    
    allowed_roles = ['student', 'teacher', 'admin']
    if role not in allowed_roles:
        return jsonify({'error': f'Invalid role. Must be one of: {allowed_roles}'}), 400
    
    existing = User.query.filter_by(email=email).first()
    if existing:
        return jsonify({'error': 'User with this email already exists'}), 400
    
    user = User(
        name=name,
        email=email,
        password=bcrypt.generate_password_hash(password).decode('utf-8'),
        role=role,
        is_active=True
    )
    
    # Add student specific fields
    if role == 'student':
        user.roll_number = data.get('roll_number')
        user.semester = data.get('semester')
        user.department = data.get('department')
        user.phone = data.get('phone')
        user.address = data.get('address')
    
    # Add teacher specific fields
    if role == 'teacher':
        user.qualification = data.get('qualification')
        user.specialization = data.get('specialization')
        user.joining_date = datetime.utcnow()
    
    db.session.add(user)
    db.session.commit()
    
    return jsonify({
        'message': f'{role.capitalize()} created successfully',
        'user': user.to_dict()
    }), 201

@admin_bp.route('/admin/stats', methods=['GET'])
@jwt_required()
def get_admin_stats():
    """Get system statistics (admin only)"""
    if not check_admin():
        return jsonify({'error': 'Admin access required'}), 403
    
    total_users = User.query.count()
    total_students = User.query.filter_by(role='student').count()
    total_teachers = User.query.filter_by(role='teacher').count()
    total_admins = User.query.filter_by(role='admin').count()
    active_users = User.query.filter_by(is_active=True).count()
    
    return jsonify({
        'total_users': total_users,
        'total_students': total_students,
        'total_teachers': total_teachers,
        'total_admins': total_admins,
        'active_users': active_users
    }), 200

# Keep other existing methods (get_user, update_user, delete_user, reset_user_password)



# Add to admin.py
@admin_bp.route('/admin/announce', methods=['POST'])
@jwt_required()
def make_announcement():
    """Make system-wide announcement"""
    if not check_admin():
        return jsonify({'error': 'Admin access required'}), 403
    
    data = request.get_json() if request.is_json else request.form
    title = data.get('title')
    message = data.get('message')
    audience = data.get('audience', 'all')  # all, students, teachers
    
    if not title or not message:
        return jsonify({'error': 'Title and message are required'}), 400
    
    # Determine which users to notify
    from src.models.user import User
    from src.sockets.events import send_notification_to_user
    
    query = User.query.filter_by(is_active=True)
    if audience == 'students':
        query = query.filter_by(role='student')
    elif audience == 'teachers':
        query = query.filter_by(role='teacher')
    
    users = query.all()
    
    # Send notification to all selected users
    notification_count = 0
    for user in users:
        send_notification_to_user(
            user.id,
            f"📢 Announcement: {title}",
            message,
            'announcement',
            {'audience': audience}
        )
        notification_count += 1
    
    return jsonify({
        'message': f'Announcement sent to {notification_count} users',
        'audience': audience,
        'count': notification_count
    }), 200