from flask import Blueprint
from flask import request

from flask_jwt_extended import jwt_required,get_jwt_identity

from services.userservice import get_profile,update_profile

user_bp = Blueprint("user",__name__)


@user_bp.route("/profile",methods=["GET"])
@jwt_required()
def profile():
    """
    Get User Profile
    ---
    tags:
      - Profile

    security:
      - Bearer: []

    responses:
      200:
        description: User profile fetched
    """
    user_id = get_jwt_identity()

    return get_profile(user_id)


@user_bp.route("/profile/update",methods=["PUT"])
@jwt_required()
def update():
    """
    Update User Profile
    ---
    tags:
      - Profile

    security:
      - Bearer: []

    parameters:
      - in: body
        name: body
        required: true
        schema:
          properties:
            bio:
              type: string
              example: Python Developer
            location:
              type: string
              example: Andhra Pradesh
            skills_offered:
              type: string
              example: Photography,Python
            skills_wanted:
              type: string
              example: Music,Guitar

    responses:
      200:
        description: Profile updated successfully
    """
    user_id = get_jwt_identity()

    data = request.json

    return update_profile(
        user_id,
        data
    )