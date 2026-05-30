from flask import Blueprint
from flask import request

from flask_jwt_extended import (
    jwt_required,
    get_jwt_identity
)

from services.bookingservice import (
    create_booking,
    get_my_bookings,
    update_booking_status
)

booking_bp = Blueprint(
    "booking",
    __name__
)


@booking_bp.route(
    "/create",
    methods=["POST"]
)
@jwt_required()
def add_booking():

    learner_id = get_jwt_identity()

    data = request.json

    return create_booking(
        learner_id,
        data
    )


@booking_bp.route(
    "/mine",
    methods=["GET"]
)
@jwt_required()
def my_bookings():

    user_id = get_jwt_identity()

    return get_my_bookings(
        user_id
    )


@booking_bp.route(
    "/accept/<int:id>",
    methods=["PATCH"]
)
@jwt_required()
def accept_booking(id):

    teacher_id = get_jwt_identity()

    return update_booking_status(
        id,
        teacher_id,
        "accepted"
    )


@booking_bp.route(
    "/reject/<int:id>",
    methods=["PATCH"]
)
@jwt_required()
def reject_booking(id):

    teacher_id = get_jwt_identity()

    return update_booking_status(
        id,
        teacher_id,
        "rejected"
    )

@booking_bp.route(
    "/complete/<int:id>",
    methods=["PATCH"]
)
@jwt_required()
def complete_booking(id):

    teacher_id = get_jwt_identity()

    return update_booking_status(
        id,
        teacher_id,
        "completed"
    )
    
