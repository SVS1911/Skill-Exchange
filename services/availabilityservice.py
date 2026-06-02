from models.availabilitymodel import Availability
from database.db import db
from flask_jwt_extended import get_jwt_identity
from datetime import datetime


# ---------------- ADD AVAILABILITY ---------------- #

def add_availability(data):

    user_id = get_jwt_identity()

    date = data.get("date")
    start_time = data.get("start_time")
    end_time = data.get("end_time")

    # ---------- EMPTY FIELD VALIDATION ---------- #
    if not date or not start_time or not end_time:
        return {"message": "date, start_time and end_time are required"}, 400

    # ---------- TIME ORDER VALIDATION ---------- #
    if start_time >= end_time:
        return {"message": "end_time must be after start_time"}, 400

    # ---------- PAST DATE VALIDATION ---------- #
    try:
        selected_date = datetime.strptime(date, "%Y-%m-%d").date()
    except ValueError:
        return {"message": "date must be in YYYY-MM-DD format"}, 400

    today = datetime.today().date()
    if selected_date < today:
        return {"message": "Cannot add availability for a past date"}, 400

    # ---------- DUPLICATE SLOT CHECK ---------- #
    existing_slot = Availability.query.filter_by(
        user_id=user_id,
        date=date,
        start_time=start_time,
        end_time=end_time
    ).first()

    if existing_slot:
        return {"message": "This exact slot already exists"}, 400

    # ---------- OVERLAPPING SLOT CHECK ---------- #
    conflicting_slot = Availability.query.filter(
        Availability.user_id == user_id,
        Availability.date == date,
        Availability.start_time < end_time,
        Availability.end_time > start_time
    ).first()

    if conflicting_slot:
        return {
            "message": f"This slot overlaps with an existing slot ({conflicting_slot.start_time} – {conflicting_slot.end_time})"
        }, 400

    # ---------- SAVE ---------- #
    new_slot = Availability(
        date=date,
        start_time=start_time,
        end_time=end_time,
        user_id=user_id
    )

    db.session.add(new_slot)
    db.session.commit()

    return {
        "message": "Availability added successfully",
        "slot_id": new_slot.id,
        "date": new_slot.date,
        "start_time": new_slot.start_time,
        "end_time": new_slot.end_time
    }, 201


# ---------------- GET MY AVAILABILITY ---------------- #

def get_my_availability():

    user_id = get_jwt_identity()

    slots = Availability.query.filter_by(user_id=user_id).order_by(
        Availability.date, Availability.start_time
    ).all()

    availability_list = [{
        "id": slot.id,
        "date": str(slot.date),
        "start_time": str(slot.start_time),
        "end_time": str(slot.end_time)
    } for slot in slots]

    return availability_list, 200


# ---------------- UPDATE SLOT ---------------- #

def update_availability(slot_id, data):

    user_id = get_jwt_identity()

    slot = Availability.query.filter_by(id=slot_id, user_id=user_id).first()

    if not slot:
        return {"message": "Slot not found"}, 404

    new_date = data.get("date", slot.date)
    new_start = data.get("start_time", slot.start_time)
    new_end = data.get("end_time", slot.end_time)

    if new_start >= new_end:
        return {"message": "end_time must be after start_time"}, 400

    # Check overlap with OTHER slots (exclude self)
    conflicting_slot = Availability.query.filter(
        Availability.user_id == user_id,
        Availability.date == new_date,
        Availability.start_time < new_end,
        Availability.end_time > new_start,
        Availability.id != slot_id
    ).first()

    if conflicting_slot:
        return {
            "message": f"Updated slot overlaps with an existing slot ({conflicting_slot.start_time} – {conflicting_slot.end_time})"
        }, 400

    slot.date = new_date
    slot.start_time = new_start
    slot.end_time = new_end

    db.session.commit()

    return {
        "message": "Slot updated successfully",
        "slot_id": slot.id,
        "date": slot.date,
        "start_time": slot.start_time,
        "end_time": slot.end_time
    }, 200


# ---------------- DELETE SLOT ---------------- #

def delete_availability(slot_id):

    user_id = get_jwt_identity()

    slot = Availability.query.filter_by(id=slot_id, user_id=user_id).first()

    if not slot:
        return {"message": "Slot not found"}, 404

    db.session.delete(slot)
    db.session.commit()

    return {"message": "Slot deleted successfully"}, 200