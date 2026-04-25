from src.extentions import db
from datetime import datetime

class Assignment(db.Model):
    __tablename__ = 'assignments'
    
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text)
    course_id = db.Column(db.Integer, db.ForeignKey('courses.id'), nullable=False)
    due_date = db.Column(db.DateTime, nullable=False)
    total_points = db.Column(db.Integer, default=100)
    created_by = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relationships
    course = db.relationship('Course', backref='assignments', foreign_keys=[course_id])
    creator = db.relationship('User', foreign_keys=[created_by], backref='created_assignments')
    
    def to_dict(self):
        return {
            'id': self.id,
            'title': self.title,
            'description': self.description,
            'course_id': self.course_id,
            'course_title': self.course.title if self.course else None,
            'due_date': self.due_date.isoformat() if self.due_date else None,
            'total_points': self.total_points,
            'created_by': self.created_by,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }