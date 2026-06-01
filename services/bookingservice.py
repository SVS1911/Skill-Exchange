from models.bookingmodel import Booking
from models.skillmodel import Skill
from models.availabilitymodel import Availability
from models.usermodel import User
from database.db import db


def create_booking(
    learner_id,
    data
):
    skill = Skill.query.get(data["skill_id"])
    if learner_id == skill.user_id:
        return {
            "message":
            "You cannot book your own skill"
        }, 400
    
    availability = Availability.query.filter_by(
    user_id=skill.user_id,
    date=data["booking_date"]
    ).first()

    if not availability:
        return {
            "message":
            "Teacher unavailable"
        }, 400
    
    existing_booking = Booking.query.filter_by(
    teacher_id=skill.user_id,
    booking_date=data["booking_date"],
    booking_time=data["booking_time"]
    ).first()

    if existing_booking:
        return {
        "message":
        "Slot already booked"
        }, 400
    
    skill = Skill.query.get(
        data["skill_id"]
    )

    if not skill:
        return {
            "message":
            "Skill not found"
        }, 404

    booking = Booking(
        learner_id=learner_id,
        teacher_id=skill.user_id,
        skill_id=data["skill_id"],
        booking_date=data["booking_date"],
        booking_time=data["booking_time"]
    )

    db.session.add(booking)
    db.session.commit()

    return {
        "message":
        "Booking Created Successfully"
    }, 201


def get_my_bookings(
    user_id
):

    bookings = Booking.query.filter(
        (Booking.learner_id == user_id)
        |
        (Booking.teacher_id == user_id)
    ).all()

    result = []

    for booking in bookings:

        result.append({
            "booking_id":
            booking.id,

            "skill":
            booking.skill.title,

            "date":
            booking.booking_date,

            "time":
            booking.booking_time,

            "status":
            booking.status
        })

    return result, 200


def update_booking_status(
    booking_id,
    teacher_id,
    status
):

    booking = Booking.query.filter_by(
        id=booking_id,
        teacher_id=teacher_id
    ).first()

    if not booking:
        return {
            "message":
            "Booking not found"
        }, 404

    booking.status = status

    # Transfer points only when completed
    if (
        status == "completed"
        and booking.status
        != "accepted"
    ):
        return {
            "message":
            "Booking must be accepted first"
        }, 400
        
    if status == "completed":

        learner = User.query.get(
            booking.learner_id
        )

        teacher = User.query.get(
            booking.teacher_id
        )

        skill = Skill.query.get(
            booking.skill_id
        )

        required_points = (
            skill.exchange_points
        )

        if learner.points < required_points:

            return {
                "message":
                "Insufficient points"
            }, 400

        learner.points -= (
            required_points
        )

        teacher.points += (
            required_points
        )

    db.session.commit()

    return {
        "message":
        f"Booking {status}"
    }, 200