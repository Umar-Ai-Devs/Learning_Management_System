from src.extentions import db
from datetime import datetime

class Course(db.Model):
    __tablename__ = 'courses'
    
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text)
    code = db.Column(db.String(50), unique=True, nullable=False)
    credits = db.Column(db.Integer, default=3)
    teacher_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    is_active = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    teacher = db.relationship('User', foreign_keys=[teacher_id], backref='courses_teaching')
    
    def to_dict(self):
        return {
            'id': self.id,
            'title': self.title,
            'description': self.description,
            'code': self.code,
            'credits': self.credits,
            'teacher_id': self.teacher_id,
            'teacher_name': self.teacher.name if self.teacher else None,
            'is_active': self.is_active,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }