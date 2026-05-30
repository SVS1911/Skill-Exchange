from flask import Blueprint
from flask import request

from flask_jwt_extended import (
    jwt_required,
    get_jwt_identity
)

from services.availabilityservice import (
    add_availability,
    get_my_availability,
    update_availability,
    delete_availability
)

availability_bp = Blueprint("availability",__name__)


@availability_bp.route("/add",methods=["POST"])
@jwt_required()
def add_slot():

    user_id = get_jwt_identity()

    data = request.json

    return add_availability(
        user_id,
        data
    )


@availability_bp.route("/mine",methods=["GET"])
@jwt_required()
def my_slots():

    user_id = get_jwt_identity()

    return get_my_availability(
        user_id
    )


@availability_bp.route("/update/<int:id>",methods=["PUT"])
@jwt_required()
def edit_slot(id):

    user_id = get_jwt_identity()

    data = request.json

    return update_availability(
        id,
        user_id,
        data
    )


@availability_bp.route("/delete/<int:id>",methods=["DELETE"])
@jwt_required()
def remove_slot(id):

    user_id = get_jwt_identity()

    return delete_availability(
        id,
        user_id
    )