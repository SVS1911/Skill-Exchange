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

    return get_user_reviews(id)