from marshmallow import Schema, fields, validate, ValidationError
import re

def validate_email(email):
    """Custom email validation"""
    if not re.match(r"[^@]+@[^@]+\.[^@]+", email):
        raise ValidationError("Invalid email format")
    return email

def validate_password(password):
    """Custom password validation"""
    if len(password) < 6:
        raise ValidationError("Password must be at least 6 characters")
    return password

class LoginSchema(Schema):
    email = fields.Email(required=True, validate=validate_email)
    password = fields.Str(required=True, validate=validate_password)

class RegisterSchema(Schema):
    name = fields.Str(required=True, validate=validate.Length(min=2, max=100))
    email = fields.Email(required=True, validate=validate_email)
    password = fields.Str(required=True, validate=validate_password)
    role = fields.Str(validate=validate.OneOf(['student', 'teacher', 'admin']), missing='student')