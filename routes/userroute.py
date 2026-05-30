from flask import Blueprint
from flask import request

from flask_jwt_extended import jwt_required,get_jwt_identity

from services.userservice import get_profile,update_profile

user_bp = Blueprint("user",__name__)


@user_bp.route("/profile",methods=["GET"])
@jwt_required()
def profile():

    user_id = get_jwt_identity()

    return get_profile(user_id)


@user_bp.route("/profile/update",methods=["PUT"])
@jwt_required()
def update():

    user_id = get_jwt_identity()

    data = request.json

    return update_profile(
        user_id,
        data
    )