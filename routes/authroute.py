from flask import Blueprint, request
from flask_jwt_extended import jwt_required
from flask_jwt_extended import get_jwt_identity

from services.authservice import register_user,login_user

from models.usermodel import User


auth_bp = Blueprint("auth",__name__)



@auth_bp.route(
    "/register",
    methods=["POST"]
)
def register():
    """
    Register User
    ---
    tags:
      - Authentication
    parameters:
      - in: body
        name: body
        required: true
        schema:
          type: object
          properties:
            name:
              type: string
              example: Sai
            email:
              type: string
              example: sai@gmail.com
            password:
              type: string
              example: 12345
    responses:
      201:
        description: User Registered Successfully
      400:
        description: Email already exists
    """

    data = request.json

    return register_user(data)


@auth_bp.route(
    "/login",
    methods=["POST"]
)
def login():
    """
    Login User
    ---
    tags:
      - Authentication
    parameters:
      - in: body
        name: body
        required: true
        schema:
          type: object
          properties:
            email:
              type: string
              example: sai@gmail.com
            password:
              type: string
              example: 12345
    responses:
      200:
        description: Login Successful
      401:
        description: Invalid Password
      404:
        description: User not found
    """

    data = request.json

    return login_user(data)


@auth_bp.route(
    "/me",
    methods=["GET"]
)
@jwt_required()
def get_me():
    """
    Get Logged User Profile
    ---
    tags:
      - Authentication
    security:
      - Bearer: []
    responses:
      200:
        description: Logged user data
      401:
        description: Unauthorized
    """

    user_id = get_jwt_identity()

    user = User.query.get(user_id)

    if not user:
        return {
            "message":
            "User not found"
        }, 404

    return {
        "id": user.id,
        "name": user.name,
        "email": user.email,
        "role": user.role,
        "points": user.points
    }, 200