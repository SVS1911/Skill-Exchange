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
    """
    Send Message
    ---
    tags:
      - Messaging

    summary: Send a message in a booking chat

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
            - receiver_id
            - message

          properties:
            booking_id:
              type: integer
              example: 1

            receiver_id:
              type: integer
              example: 2

            message:
              type: string
              example: Hello! Are you available for the session tomorrow?

    responses:
      201:
        description: Message sent successfully

      400:
        description: Invalid input data

      401:
        description: Unauthorized - Missing or invalid JWT token

      404:
        description: Booking or receiver not found
    """
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
    """
    Get Chat Messages
    ---
    tags:
      - Messaging

    summary: Get chat history for a booking

    security:
      - Bearer: []

    parameters:
      - name: booking_id
        in: path
        type: integer
        required: true
        description: Booking ID to fetch chat messages
        example: 1

    responses:
      200:
        description: Chat history fetched successfully
        schema:
          type: array
          items:
            type: object
            properties:
              id:
                type: integer
                example: 1

              sender_id:
                type: integer
                example: 2

              receiver_id:
                type: integer
                example: 5

              message:
                type: string
                example: Hello! Are you available tomorrow?

              timestamp:
                type: string
                example: 2026-06-02 10:30:00

      401:
        description: Unauthorized - Missing or invalid JWT token

      403:
        description: Access denied to this chat

      404:
        description: Booking not found
    """
    user_id = get_jwt_identity()

    return get_chat(
        booking_id,
        user_id
    )