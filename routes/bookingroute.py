from flask import Blueprint, request
from flask_jwt_extended import jwt_required, get_jwt_identity

from services.bookingservice import (
    create_booking,
    get_my_bookings,
    update_booking_status,
    cancel_booking,
    get_teacher_availability,
    get_teacher_available_dates
)

booking_bp = Blueprint("booking", __name__)


@booking_bp.route("/create", methods=["POST"])
@jwt_required()
def add_booking():
    """
    Create Booking
    ---
    tags:
      - Booking

    security:
      - Bearer: []

    parameters:
      - in: body
        name: body
        required: true
        schema:
          properties:
            skill_id:
              type: integer
              example: 1
            booking_day:
              type: string
              example: Saturday
            booking_time:
              type: string
              example: 5 PM

    responses:
      201:
        description: Booking created
    """
    learner_id = get_jwt_identity()
    data = request.get_json()
    return create_booking(learner_id, data)


@booking_bp.route("/mine", methods=["GET"])
@jwt_required()
def my_bookings():
    """
    Get My Bookings
    ---
    tags:
      - Booking
    security:
      - Bearer: []
    responses:
      200:
        description: List of bookings (as learner or teacher)
    """
    user_id = get_jwt_identity()
    return get_my_bookings(user_id)


@booking_bp.route("/accept/<int:id>", methods=["PATCH"])
@jwt_required()
def accept_booking(id):
    """
    Accept Booking
    ---
    tags:
      - Booking

    security:
      - Bearer: []

    parameters:
      - name: id
        in: path
        required: true
        type: integer

    responses:
      200:
        description: Booking accepted
    """
    teacher_id = get_jwt_identity()
    return update_booking_status(id, teacher_id, "accepted")


@booking_bp.route("/reject/<int:id>", methods=["PATCH"])
@jwt_required()
def reject_booking(id):
    """
    Reject a Booking
    ---
    tags:
      - Booking
    security:
      - Bearer: []
    parameters:
      - in: path
        name: id
        type: integer
        required: true
    responses:
      200:
        description: Booking rejected
      400:
        description: Invalid status transition
      404:
        description: Booking not found
    """
    teacher_id = get_jwt_identity()
    return update_booking_status(id, teacher_id, "rejected")


@booking_bp.route("/complete/<int:id>", methods=["PATCH"])
@jwt_required()
def complete_booking(id):
    """
    Complete Booking & Transfer Points
    ---
    tags:
      - Booking

    security:
      - Bearer: []

    parameters:
      - name: id
        in: path
        required: true
        type: integer

    responses:
      200:
        description: Booking completed
    """
    teacher_id = get_jwt_identity()
    return update_booking_status(id, teacher_id, "completed")


@booking_bp.route("/cancel/<int:id>", methods=["PATCH"])
@jwt_required()
def cancel_booking_route(id):
    """
    Cancel a Booking (Learner only)
    ---
    tags:
      - Booking
    security:
      - Bearer: []
    parameters:
      - in: path
        name: id
        type: integer
        required: true
    responses:
      200:
        description: Booking cancelled
      403:
        description: Only the learner can cancel
      404:
        description: Booking not found
    """
    learner_id = get_jwt_identity()
    return cancel_booking(id, learner_id)


@booking_bp.route("/slots/<int:teacher_id>", methods=["GET"])
@jwt_required()
def teacher_slots(teacher_id):
    """
    Get Available Slots for a Teacher on a Date
    ---
    tags:
      - Booking
    security:
      - Bearer: []
    parameters:
      - in: path
        name: teacher_id
        type: integer
        required: true
      - in: query
        name: date
        type: string
        required: true
        example: "2026-06-10"
    responses:
      200:
        description: Available slots with booked times marked
    """
    date = request.args.get("date")
    if not date:
        return {"message": "date query param is required (YYYY-MM-DD)"}, 400
    return get_teacher_availability(teacher_id, date)

@booking_bp.route("/available-dates/<int:teacher_id>", methods=["GET"])
@jwt_required()
def teacher_available_dates(teacher_id):
    """
    Get All Dates a Teacher Has Availability
    ---
    tags:
      - Booking
    security:
      - Bearer: []
    """
    return get_teacher_available_dates(teacher_id)