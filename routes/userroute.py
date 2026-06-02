from flask import Blueprint
from flask import request, jsonify

from flask_jwt_extended import jwt_required,get_jwt_identity

from services.userservice import get_profile,update_profile, buy_points, get_points_packages

user_bp = Blueprint("user",__name__)


@user_bp.route("/profile",methods=["GET"])
@jwt_required()
def profile():
    """
    Get User Profile
    ---
    tags:
      - Users

    summary: Get logged-in user profile

    security:
      - Bearer: []

    responses:
      200:
        description: User profile fetched successfully
        schema:
          type: object
          properties:
            id:
              type: integer
              example: 1

            name:
              type: string
              example: Sai

            email:
              type: string
              example: sai@gmail.com

            role:
              type: string
              example: learner

            points:
              type: integer
              example: 120

            bio:
              type: string
              example: Passionate Python developer.

      401:
        description: Unauthorized - Missing or invalid JWT token

      404:
        description: User not found
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
      - Users

    summary: Update logged-in user profile

    security:
      - Bearer: []

    parameters:
      - in: body
        name: body
        required: true
        schema:
          type: object
          properties:
            name:
              type: string
              example: Sai Gopal

            email:
              type: string
              example: saigopal@gmail.com

            bio:
              type: string
              example: I teach Python and Flask development.

            profile_picture:
              type: string
              example: https://example.com/profile.jpg

    responses:
      200:
        description: Profile updated successfully

      400:
        description: Invalid profile data

      401:
        description: Unauthorized - Missing or invalid JWT token

      404:
        description: User not found
    """

    user_id = get_jwt_identity()

    data = request.json

    return update_profile(
        user_id,
        data
    )

@user_bp.route("/points/packages", methods=["GET"])
@jwt_required()
def points_packages():
    """
    Get Points Packages
    ---
    tags:
      - Points
    summary: Get all available points packages to purchase
    security:
      - Bearer: []
    responses:
      200:
        description: List of points packages
    """
    return get_points_packages()


@user_bp.route("/points/buy", methods=["POST"])
@jwt_required()
def purchase_points():
    """
    Buy Points
    ---
    tags:
      - Points
    summary: Purchase a points package to top up your balance
    security:
      - Bearer: []
    parameters:
      - in: body
        name: body
        required: true
        schema:
          type: object
          properties:
            package_id:
              type: string
              example: popular
              enum: [starter, popular, pro, unlimited]
    responses:
      200:
        description: Points added successfully
      400:
        description: Invalid package
      404:
        description: User not found
    """
    user_id = get_jwt_identity()
    data = request.json or {}
    package_id = data.get("package_id", "")
    return buy_points(user_id, package_id)