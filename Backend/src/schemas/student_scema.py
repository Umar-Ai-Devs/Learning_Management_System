from marshmallow import Schema, fields, validate, validates, ValidationError
from src.models.student import Student

class StudentSchema(Schema):
    name = fields.Str(required=True)
    age = fields.Int(required=True)
    email = fields.Email(required=True)
    department = fields.Str(required=True)
