from marshmallow import (
    Schema,
    fields,
    validate,
    validates,
    ValidationError,
    pre_load
)
import datetime

from src.models.attendance import Attendance
from src.models.student import Student


class AttendanceSchema(Schema):
    student_id = fields.Int(required=True)

    # NOT required → default handled in pre_load
    date = fields.Date(required=False)

    status = fields.Str(
        required=True,
        validate=validate.OneOf(['present', 'absent'])
    )

    @validates('student_id')
    def validate_student_id(self, student_id):
        student = Student.query.get(student_id)
        if not student:
            raise ValidationError(
                f'Student with ID {student_id} does not exist.'
            )

    @pre_load
    def check_duplicate_attendance(self, data, **kwargs):
        student_id = data.get('student_id')
        date = data.get('date')

        # Convert string → date
        if date and isinstance(date, str):
            try:
                date = datetime.datetime.strptime(date, '%Y-%m-%d').date()
            except ValueError:
                try:
                    date = datetime.datetime.fromisoformat(date).date()
                except ValueError:
                    raise ValidationError({'date': ['Invalid date format']})

        # Default date = today
        if not date:
            date = datetime.date.today()
            data['date'] = date

        # Prevent duplicates
        if student_id:
            existing = Attendance.query.filter_by(
                student_id=student_id,
                date=date
            ).first()

            if existing:
                raise ValidationError({
                    'student_id': [
                        f'Attendance for student {student_id} on {date} already exists.'
                    ],
                    'date': [
                        'Attendance already recorded for this date.'
                    ]
                })

        return data

    def to_attendance(self, data):
        return {
            'student_id': data['student_id'],
            'date': data['date'],
            'is_present': data['status'] == 'present'
        }
