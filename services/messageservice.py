from models.messagemodel import Message
from models.bookingmodel import Booking
from database.db import db


def send_message(
    sender_id,
    data
):
    # JWT identity is stored as string, cast to int for DB comparison
    sender_id = int(sender_id)

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

    # Frontend sends 'content', support both field names
    message_text = data.get("message_text") or data.get("content", "")

    message = Message(
        booking_id=data["booking_id"],
        sender_id=sender_id,
        receiver_id=receiver_id,
        message_text=message_text
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
    # JWT identity is stored as string, cast to int for DB comparison
    user_id = int(user_id)

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

            # Frontend reads 'content' and 'timestamp'
            "content":
            msg.message_text,

            "timestamp":
            msg.created_at.isoformat() if msg.created_at else None
        })

    return result, 200