from models.bookingmodel import Booking
from models.skillmodel import Skill
from models.availabilitymodel import Availability
from models.usermodel import User
from database.db import db


def create_booking(learner_id, data):

    skill_id = data.get("skill_id")
    # Frontend sends scheduled_time as a datetime string e.g. "2026-06-10T10:00"
    # Support both the old format and the frontend's scheduled_time field
    scheduled_time = data.get("scheduled_time") or ""
    booking_date = data.get("booking_date")
    booking_time = data.get("booking_time")

    # Parse scheduled_time into date + time if provided by frontend
    if scheduled_time and not booking_date:
        try:
            parts = scheduled_time.replace("T", " ").split(" ")
            booking_date = parts[0]                          # "2026-06-10"
            booking_time = parts[1][:5] if len(parts) > 1 else "00:00"  # "10:00"
        except Exception:
            return {"message": "Invalid scheduled_time format. Use YYYY-MM-DDTHH:MM"}, 400

    if not skill_id or not booking_date or not booking_time:
        return {"message": "skill_id and scheduled_time (or booking_date + booking_time) are required"}, 400

    # ---------- SKILL EXISTS ---------- #
    skill = Skill.query.get(skill_id)
    if not skill:
        return {"message": "Skill not found"}, 404

    # ---------- SELF-BOOKING GUARD ---------- #
    if int(learner_id) == int(skill.user_id):
        return {"message": "You cannot book your own skill"}, 400


    # ---------- TEACHER AVAILABILITY CHECK ---------- #
    availability = Availability.query.filter(
        Availability.user_id == skill.user_id,
        Availability.date == booking_date,
        Availability.start_time <= booking_time,
        Availability.end_time > booking_time
    ).first()

    if not availability:
        return {"message": "Teacher is not available at that date/time. Check their available slots first."}, 400

    # ---------- DOUBLE-BOOKING GUARD ---------- #
    existing_booking = Booking.query.filter_by(
        teacher_id=skill.user_id,
        booking_date=booking_date,
        booking_time=booking_time
    ).filter(Booking.status.notin_(["rejected"])).first()

    if existing_booking:
        return {"message": "That slot is already booked"}, 400

    # ---------- CREATE ---------- #
    booking = Booking(
        learner_id=learner_id,
        teacher_id=skill.user_id,
        skill_id=skill_id,
        booking_date=booking_date,
        booking_time=booking_time
    )
    db.session.add(booking)
    db.session.commit()

    return {
        "message": "Booking created successfully",
        "id": booking.id
    }, 201


def get_my_bookings(user_id):
    # JWT identity is a string; cast to int for DB comparisons
    user_id = int(user_id)

    bookings = Booking.query.filter(
        (Booking.learner_id == user_id) | (Booking.teacher_id == user_id)
    ).order_by(Booking.created_at.desc()).all()

    result = []
    for b in bookings:
        learner = User.query.get(b.learner_id)
        teacher = User.query.get(b.teacher_id)
        result.append({
            "id": b.id,
            # Frontend reads b.id for booking actions — also expose as booking_id for clarity
            "booking_id": b.id,
            # Frontend reads skill_title
            "skill_title": b.skill.title if b.skill else "N/A",
            # Frontend reads scheduled_time for display, teacher_id for review modal
            "scheduled_time": f"{b.booking_date} {b.booking_time}",
            "booking_date": b.booking_date,
            "booking_time": b.booking_time,
            "status": b.status,
            "role": "learner" if b.learner_id == user_id else "teacher",
            "teacher_id": b.teacher_id,
            "learner_id": b.learner_id,
            "teacher_name": teacher.name if teacher else "Unknown",
            "learner_name": learner.name if learner else "Unknown",
        })

    return result, 200


def update_booking_status(booking_id, teacher_id, new_status):

    booking = Booking.query.filter_by(id=booking_id, teacher_id=teacher_id).first()
    if not booking:
        return {"message": "Booking not found or you are not the teacher"}, 404

    current_status = booking.status

    allowed_transitions = {
        "pending":   ["accepted", "rejected"],
        "accepted":  ["completed", "rejected"],
        "completed": [],
        "rejected":  []
    }

    if new_status not in allowed_transitions.get(current_status, []):
        return {"message": f"Cannot move booking from '{current_status}' to '{new_status}'"}, 400

    if new_status == "completed":
        learner = User.query.get(booking.learner_id)
        teacher = User.query.get(booking.teacher_id)
        skill = Skill.query.get(booking.skill_id)
        required_points = skill.exchange_points

        if learner.points < required_points:
            return {"message": f"Learner has insufficient points (needs {required_points}, has {learner.points})"}, 400

        learner.points -= required_points
        teacher.points += required_points

    booking.status = new_status
    db.session.commit()
    return {"message": f"Booking {new_status} successfully"}, 200


def cancel_booking(booking_id, learner_id):
    learner_id = int(learner_id)
    booking = Booking.query.filter_by(id=booking_id, learner_id=learner_id).first()
    if not booking:
        return {"message": "Booking not found or you are not the learner"}, 404
    if booking.status != "pending":
        return {"message": f"Cannot cancel a booking that is already '{booking.status}'"}, 400
    booking.status = "cancelled"
    db.session.commit()
    return {"message": "Booking cancelled successfully"}, 200


def get_teacher_availability(teacher_id, date):
    slots = Availability.query.filter_by(user_id=teacher_id, date=date).all()
    if not slots:
        return {"available_slots": []}, 200

    booked_times = {
        b.booking_time for b in Booking.query.filter(
            Booking.teacher_id == teacher_id,
            Booking.booking_date == date,
            Booking.status.notin_(["rejected"])
        ).all()
    }

    return {"available_slots": [{
        "slot_id": s.id,
        "date": s.date,
        "start_time": s.start_time,
        "end_time": s.end_time,
        "booked_times": list(booked_times)
    } for s in slots]}, 200

def get_teacher_available_dates(teacher_id):
    from datetime import date as date_type
    today = date_type.today()
    slots = Availability.query.filter(
        Availability.user_id == teacher_id,
        Availability.date >= str(today)
    ).order_by(Availability.date).all()
    dates = sorted(set(str(s.date) for s in slots))
    return {"available_dates": dates}, 200