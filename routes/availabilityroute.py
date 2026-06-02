from flask import Blueprint, request
from flask_jwt_extended import jwt_required

from services.availabilityservice import (
    add_availability,
    get_my_availability,
    update_availability,
    delete_availability
)

availability_bp = Blueprint("availability", __name__, url_prefix="/availability")


@availability_bp.route("/add", methods=["POST"])
@jwt_required()
def add_slot():
    """
    Add Availability Slot
    ---
    tags:
      - Availability
    security:
      - Bearer: []
    parameters:
      - in: body
        name: body
        required: true
        schema:
          type: object
          required: [date, start_time, end_time]
          properties:
            date:
              type: string
              example: "2026-06-10"
            start_time:
              type: string
              example: "09:00"
            end_time:
              type: string
              example: "12:00"
    responses:
      201:
        description: Slot added
      400:
        description: Validation error (past date, overlap, duplicate, bad time order)
    """
    data = request.get_json()
    return add_availability(data)


@availability_bp.route("/my", methods=["GET"])
@jwt_required()
def my_slots():
    """
    Get My Availability Slots
    ---
    tags:
      - Availability
    security:
      - Bearer: []
    responses:
      200:
        description: List of availability slots sorted by date and time
    """
    return get_my_availability()


@availability_bp.route("/update/<int:slot_id>", methods=["PUT"])
@jwt_required()
def edit_slot(slot_id):
    """
    Update an Availability Slot
    ---
    tags:
      - Availability
    security:
      - Bearer: []
    parameters:
      - in: path
        name: slot_id
        type: integer
        required: true
      - in: body
        name: body
        schema:
          type: object
          properties:
            date:
              type: string
              example: "2026-06-11"
            start_time:
              type: string
              example: "14:00"
            end_time:
              type: string
              example: "17:00"
    responses:
      200:
        description: Slot updated
      400:
        description: Overlap or bad time order
      404:
        description: Slot not found
    """
    data = request.get_json()
    return update_availability(slot_id, data)


@availability_bp.route("/delete/<int:slot_id>", methods=["DELETE"])
@jwt_required()
def delete_slot(slot_id):
    """
    Delete an Availability Slot
    ---
    tags:
      - Availability
    security:
      - Bearer: []
    parameters:
      - in: path
        name: slot_id
        type: integer
        required: true
    responses:
      200:
        description: Slot deleted
      404:
        description: Slot not found
    """
    return delete_availability(slot_id)