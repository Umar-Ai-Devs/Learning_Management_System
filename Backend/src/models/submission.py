from src.extentions import db
from datetime import datetime

class Submission(db.Model):
    __tablename__ = 'submissions'
    
    id = db.Column(db.Integer, primary_key=True)
    assignment_id = db.Column(db.Integer, db.ForeignKey('assignments.id'), nullable=False)
    student_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    submission_text = db.Column(db.Text, nullable=True)
    file_path = db.Column(db.String(500), nullable=True)
    file_name = db.Column(db.String(200), nullable=True)  # Original file name
    file_size = db.Column(db.Integer, nullable=True)  # File size in bytes
    file_type = db.Column(db.String(50), nullable=True)  # MIME type
    submitted_at = db.Column(db.DateTime, default=datetime.utcnow)
    grade = db.Column(db.Float, nullable=True)
    feedback = db.Column(db.Text, nullable=True)
    graded_by = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=True)
    graded_at = db.Column(db.DateTime, nullable=True)
    
    # Relationships
    assignment = db.relationship('Assignment', backref='submissions', foreign_keys=[assignment_id])
    student = db.relationship('User', foreign_keys=[student_id], backref='submissions')
    grader = db.relationship('User', foreign_keys=[graded_by], backref='graded_submissions')
    
    def to_dict(self):
        return {
            'id': self.id,
            'assignment_id': self.assignment_id,
            'assignment_title': self.assignment.title if self.assignment else None,
            'student_id': self.student_id,
            'student_name': self.student.name if self.student else None,
            'submission_text': self.submission_text,
            'file_path': self.file_path,
            'file_name': self.file_name,
            'file_size': self.file_size,
            'file_type': self.file_type,
            'submitted_at': self.submitted_at.isoformat() if self.submitted_at else None,
            'grade': self.grade,
            'feedback': self.feedback,
            'graded_by': self.graded_by,
            'graded_at': self.graded_at.isoformat() if self.graded_at else None
        }