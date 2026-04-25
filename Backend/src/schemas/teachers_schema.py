from marshmallow import Schema, fields, validate, validates, ValidationError
from src.models.teacher import Teacher

class TeacherSchema(Schema):
    name = fields.Str(required=True)
    age = fields.Int(required=True)
    email = fields.Email(required=True)
    subject = fields.Str(required=True)

    def to_teacher(self, data):
        """
        Helper method to convert validated data to Teacher model fields.
        """
        return {
            'name': data['name'],
            'age': data['age'],
            'email': data['email'],
            'subject': data['subject']
        }