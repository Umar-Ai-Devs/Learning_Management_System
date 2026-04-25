from src.extentions import db
from datetime import datetime

class User(db.Model):
    __tablename__ = 'users'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password = db.Column(db.String(200), nullable=False)
    role = db.Column(db.String(20), nullable=False, default='student')
    is_active = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    last_login = db.Column(db.DateTime, nullable=True)
    
    # Teacher specific fields
    qualification = db.Column(db.String(200), nullable=True)
    specialization = db.Column(db.String(200), nullable=True)
    joining_date = db.Column(db.DateTime, nullable=True)
    
    # Student specific fields
    roll_number = db.Column(db.String(50), unique=True, nullable=True)
    semester = db.Column(db.Integer, nullable=True)
    department = db.Column(db.String(100), nullable=True)
    phone = db.Column(db.String(20), nullable=True)
    address = db.Column(db.Text, nullable=True)
    
    def to_dict(self):
        result = {
            'id': self.id,
            'name': self.name,
            'email': self.email,
            'role': self.role,
            'is_active': self.is_active,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'last_login': self.last_login.isoformat() if self.last_login else None
        }
        
        # Add teacher specific fields
        if self.role == 'teacher':
            result['qualification'] = self.qualification
            result['specialization'] = self.specialization
            result['joining_date'] = self.joining_date.isoformat() if self.joining_date else None
        
        # Add student specific fields
        if self.role == 'student':
            result['roll_number'] = self.roll_number
            result['semester'] = self.semester
            result['department'] = self.department
            result['phone'] = self.phone
            result['address'] = self.address
        
        return result