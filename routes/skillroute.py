from flask import Blueprint
from flask import request

from flask_jwt_extended import jwt_required, get_jwt_identity, verify_jwt_in_request

from services.skillservice import create_skill, get_all_skills, get_my_skills, update_skill, delete_skill

skill_bp = Blueprint("skill", __name__)


@skill_bp.route("/create", methods=["POST"])
@jwt_required()
def add_skill():

    user_id = get_jwt_identity()

    data = request.json

    return create_skill(
        user_id,
        data
    )


@skill_bp.route("/skills", methods=["GET"])
def get_skills():
    # If a logged-in user hits this endpoint, exclude their own skills
    try:
        verify_jwt_in_request(optional=True)
        current_user_id = get_jwt_identity()
    except Exception:
        current_user_id = None

    return get_all_skills(exclude_user_id=current_user_id)


@skill_bp.route("/my-skills", methods=["GET"])
@jwt_required()
def my_skills():

    user_id = get_jwt_identity()

    return get_my_skills(
        user_id
    )


@skill_bp.route("/update/<int:skill_id>", methods=["PUT"])
@jwt_required()
def edit_skill(skill_id):

    user_id = get_jwt_identity()

    data = request.json

    return update_skill(
        skill_id,
        user_id,
        data
    )


@skill_bp.route("/delete/<int:skill_id>", methods=["DELETE"])
@jwt_required()
def remove_skill(skill_id):

    user_id = get_jwt_identity()

    return delete_skill(
        skill_id,
        user_id
    )