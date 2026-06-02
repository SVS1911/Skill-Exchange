from flask import Blueprint
from flask import request

from flask_jwt_extended import (
    jwt_required,
    get_jwt_identity
)

from services.reviewservice import (
    add_review,
    get_user_reviews
)

review_bp = Blueprint(
    "review",
    __name__
)


@review_bp.route(
    "/add",
    methods=["POST"]
)
@jwt_required()
def create_review():
    """
    Add Review
    ---
    tags:
      - Reviews

    summary: Add a review for a user

    security:
      - Bearer: []

    parameters:
      - in: body
        name: body
        required: true
        schema:
          type: object
          required:
            - booking_id
            - reviewed_user_id
            - rating
            - comment

          properties:
            booking_id:
              type: integer
              example: 1

            reviewed_user_id:
              type: integer
              example: 2

            rating:
              type: integer
              example: 5
              minimum: 1
              maximum: 5

            comment:
              type: string
              example: Great mentor! Explained concepts very clearly.

    responses:
      201:
        description: Review added successfully

      400:
        description: Invalid review data or duplicate review

      401:
        description: Unauthorized - Missing or invalid JWT token

      404:
        description: Booking or user not found
    """
    learner_id = get_jwt_identity()

    data = request.json

    return add_review(
        learner_id,
        data
    )


@review_bp.route(
    "/user/<int:id>",
    methods=["GET"]
)
def view_reviews(id):
    """
    Get User Reviews
    ---
    tags:
      - Reviews

    summary: Get all reviews for a user

    parameters:
      - name: id
        in: path
        type: integer
        required: true
        description: User ID to fetch reviews
        example: 2

    responses:
      200:
        description: User reviews fetched successfully
        schema:
          type: array
          items:
            type: object
            properties:
              id:
                type: integer
                example: 1

              reviewer_id:
                type: integer
                example: 5

              rating:
                type: integer
                example: 5

              comment:
                type: string
                example: Very knowledgeable and helpful mentor.

              created_at:
                type: string
                example: 2026-06-02 15:20:00

      404:
        description: User not found or no reviews available
    """
    return get_user_reviews(id)