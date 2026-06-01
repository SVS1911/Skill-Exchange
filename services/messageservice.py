from models.messagemodel import Message
from models.bookingmodel import Booking
from database.db import db


def send_message(
    sender_id,
    data
):

    booking = Booking.query.get(
        data["booking_id"]
    )

    if not booking:
        return {
            "message":
            "Booking not found"
        }, 404

    # Only learner or teacher
    if sender_id not in [
        booking.learner_id,
        booking.teacher_id
    ]:
        return {
            "message":
            "Unauthorized"
        }, 403

    # Determine receiver
    receiver_id = (
        booking.teacher_id
        if sender_id
        == booking.learner_id
        else booking.learner_id
    )

    message = Message(
        booking_id=data["booking_id"],
        sender_id=sender_id,
        receiver_id=receiver_id,
        message_text=data[
            "message_text"
        ]
    )

    db.session.add(message)
    db.session.commit()

    return {
        "message":
        "Message Sent Successfully"
    }, 201


def get_chat(
    booking_id,
    user_id
):

    booking = Booking.query.get(
        booking_id
    )

    if not booking:
        return {
            "message":
            "Booking not found"
        }, 404

    # Security check
    if user_id not in [
        booking.learner_id,
        booking.teacher_id
    ]:
        return {
            "message":
            "Unauthorized"
        }, 403

    messages = Message.query.filter_by(
        booking_id=booking_id
    ).order_by(
        Message.created_at.asc()
    ).all()

    result = []

    for msg in messages:

        result.append({
            "sender_id":
            msg.sender_id,

            "receiver_id":
            msg.receiver_id,

            "message":
            msg.message_text,

            "time":
            msg.created_at
        })

    return result, 200