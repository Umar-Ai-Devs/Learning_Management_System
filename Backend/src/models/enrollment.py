from src.extentions import db
from datetime import datetime

class Enrollment(db.Model):
    __tablename__ = 'enrollments'
    
    id = db.Column(db.Integer, primary_key=True)
    student_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    course_id = db.Column(db.Integer, db.ForeignKey('courses.id'), nullable=False)
    enrollment_date = db.Column(db.DateTime, default=datetime.utcnow)
    status = db.Column(db.String(20), default='active')  # active, dropped, completed
    grade = db.Column(db.String(2), nullable=True)  # A, B, C, D, F
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relationships
    student = db.relationship('User', foreign_keys=[student_id], backref='enrollments')
    course = db.relationship('Course', foreign_keys=[course_id], backref='enrollments')
    
    def to_dict(self):
        return {
            'id': self.id,
            'student_id': self.student_id,
            'student_name': self.student.name if self.student else None,
            'course_id': self.course_id,
            'course_title': self.course.title if self.course else None,
            'course_code': self.course.code if self.course else None,
            'enrollment_date': self.enrollment_date.isoformat() if self.enrollment_date else None,
            'status': self.status,
            'grade': self.grade
        }