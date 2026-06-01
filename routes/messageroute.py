from flask import Blueprint
from flask import request

from flask_jwt_extended import (
    jwt_required,
    get_jwt_identity
)

from services.messageservice import (
    send_message,
    get_chat
)

message_bp = Blueprint(
    "message",
    __name__
)


@message_bp.route(
    "/send",
    methods=["POST"]
)
@jwt_required()
def send():

    sender_id = get_jwt_identity()

    data = request.json

    return send_message(
        sender_id,
        data
    )


@message_bp.route(
    "/chat/<int:booking_id>",
    methods=["GET"]
)
@jwt_required()
def chat(booking_id):

    user_id = get_jwt_identity()

    return get_chat(
        booking_id,
        user_id
    )