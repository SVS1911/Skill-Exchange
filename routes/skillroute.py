from flask import Blueprint
from flask import request

from flask_jwt_extended import jwt_required, get_jwt_identity, verify_jwt_in_request

from services.skillservice import create_skill, get_all_skills, get_my_skills, update_skill, delete_skill

skill_bp = Blueprint("skill", __name__)


@skill_bp.route("/create", methods=["POST"])
@jwt_required()
def add_skill():
    """
    Create Skill
    ---
    tags:
      - Skills

    summary: Add a new skill

    security:
      - Bearer: []

    parameters:
      - in: body
        name: body
        required: true
        schema:
          type: object
          required:
            - skill_name
            - description
            - category

          properties:
            skill_name:
              type: string
              example: Python Programming

            description:
              type: string
              example: I can teach Python basics and Flask.

            category:
              type: string
              example: Programming

    responses:
      201:
        description: Skill created successfully

      400:
        description: Invalid skill data

      401:
        description: Unauthorized - Missing or invalid JWT token
    """
    user_id = get_jwt_identity()

    data = request.json

    return create_skill(
        user_id,
        data
    )


@skill_bp.route("/skills", methods=["GET"])
def get_skills():
    # If a logged-in user hits this endpoint, exclude their own skills
    """
    Get All Skills
    ---
    tags:
      - Skills

    summary: Fetch all available skills

    responses:
      200:
        description: Skills fetched successfully
        schema:
          type: array
          items:
            type: object
            properties:
              id:
                type: integer
                example: 1

              skill_name:
                type: string
                example: Python Programming

              description:
                type: string
                example: Learn Python basics.

              category:
                type: string
                example: Programming

              user_id:
                type: integer
                example: 5

      404:
        description: No skills found
    """
    try:
        verify_jwt_in_request(optional=True)
        current_user_id = get_jwt_identity()
    except Exception:
        current_user_id = None

    return get_all_skills(exclude_user_id=current_user_id)


@skill_bp.route("/my-skills", methods=["GET"])
@jwt_required()
def my_skills():
    """
    Get My Skills
    ---
    tags:
      - Skills

    summary: Get logged-in user's skills

    security:
      - Bearer: []

    responses:
      200:
        description: User skills fetched successfully
        schema:
          type: array
          items:
            type: object
            properties:
              id:
                type: integer
                example: 1

              skill_name:
                type: string
                example: Python Programming

              description:
                type: string
                example: I teach Flask and APIs.

              category:
                type: string
                example: Programming

      401:
        description: Unauthorized - Missing or invalid JWT token
    """
    user_id = get_jwt_identity()

    return get_my_skills(
        user_id
    )


@skill_bp.route("/update/<int:skill_id>", methods=["PUT"])
@jwt_required()
def edit_skill(skill_id):
    """
    Update Skill
    ---
    tags:
      - Skills

    summary: Update an existing skill

    security:
      - Bearer: []

    parameters:
      - name: skill_id
        in: path
        type: integer
        required: true
        description: Skill ID to update
        example: 1

      - in: body
        name: body
        required: true
        schema:
          type: object
          properties:
            skill_name:
              type: string
              example: Advanced Python

            description:
              type: string
              example: Covers Flask, APIs and SQLAlchemy.

            category:
              type: string
              example: Programming

    responses:
      200:
        description: Skill updated successfully

      401:
        description: Unauthorized - Missing or invalid JWT token

      403:
        description: You are not allowed to update this skill

      404:
        description: Skill not found
    """
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
    """
    Delete Skill
    ---
    tags:
      - Skills

    summary: Delete a skill

    security:
      - Bearer: []

    parameters:
      - name: skill_id
        in: path
        type: integer
        required: true
        description: Skill ID to delete
        example: 1

    responses:
      200:
        description: Skill deleted successfully

      401:
        description: Unauthorized - Missing or invalid JWT token

      403:
        description: You are not allowed to delete this skill

      404:
        description: Skill not found
    """
    user_id = get_jwt_identity()

    return delete_skill(
        skill_id,
        user_id
    )