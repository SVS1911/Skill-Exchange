from flask import Blueprint, request
from flask_jwt_extended import jwt_required

from services.availabilityservice import (
    add_availability,
    get_my_availability,
    delete_availability
)

availability_bp = Blueprint(
    "availability",
    __name__,
    url_prefix="/availability"
)


# ---------------- ADD SLOT ---------------- #

@availability_bp.route(
    "/add",
    methods=["POST"]
)
@jwt_required()
def add_slot():

    data = request.get_json()

    response, status_code = add_availability(data)

    return response, status_code


# ---------------- GET MY SLOTS ---------------- #

@availability_bp.route(
    "/my",
    methods=["GET"]
)
@jwt_required()
def my_slots():

    response, status_code = get_my_availability()

    return response, status_code


# ---------------- DELETE SLOT ---------------- #

@availability_bp.route(
    "/delete/<int:slot_id>",
    methods=["DELETE"]
)
@jwt_required()
def delete_slot(slot_id):

    response, status_code = delete_availability(
        slot_id
    )

    return response, status_code