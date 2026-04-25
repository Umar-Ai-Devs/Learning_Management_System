from flask import Blueprint, jsonify

attendance_bp = Blueprint('attendance', __name__)

@attendance_bp.route('/attendance/test', methods=['GET'])
def test_attendance():
    return jsonify({'message': 'Attendance module is working'}), 200