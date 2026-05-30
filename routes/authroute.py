from flask import Blueprint, request
from flask_jwt_extended import jwt_required
from flask_jwt_extended import get_jwt_identity

from services.authservice import register_user,login_user

from models.usermodel import User


auth_bp = Blueprint("auth",__name__)


@auth_bp.route("/register", methods=["POST"])
def register():
    data = request.json
    
    return register_user(data)


@auth_bp.route("/login", methods=["POST"])
def login():
    data = request.json

    return login_user(data)


@auth_bp.route("/me", methods=["GET"])
@jwt_required()
def get_me():

    user_id = get_jwt_identity()

    user = User.query.get(user_id)

    if not user:
        return {"message": "User not found"}, 404

    return {
        "id": user.id,
        "name": user.name,
        "email": user.email,
        "role": user.role,
        "points": user.points
    }, 200