from flask import Blueprint
from flask import request

from flask_jwt_extended import jwt_required,get_jwt_identity

from services.skillservice import create_skill,get_all_skills,get_my_skills,update_skill,delete_skill

skill_bp = Blueprint("skill",__name__)


@skill_bp.route("/create",methods=["POST"])
@jwt_required()
def add_skill():

    user_id = get_jwt_identity()

    data = request.json

    return create_skill(
        user_id,
        data
    )


@skill_bp.route("/all",methods=["GET"])
def get_skills():

    return get_all_skills()


@skill_bp.route("/mine",methods=["GET"])
@jwt_required()
def my_skills():

    user_id = get_jwt_identity()

    return get_my_skills(
        user_id
    )


@skill_bp.route("/update/<int:skill_id>",methods=["PUT"])
@jwt_required()
def edit_skill(skill_id):

    user_id = get_jwt_identity()

    data = request.json

    return update_skill(
        skill_id,
        user_id,
        data
    )


@skill_bp.route("/delete/<int:skill_id>",methods=["DELETE"])
@jwt_required()
def remove_skill(skill_id):

    user_id = get_jwt_identity()

    return delete_skill(
        skill_id,
        user_id
    )