from models.availabilitymodel import Availability
from database.db import db
from flask_jwt_extended import get_jwt_identity
from datetime import datetime


# ---------------- ADD AVAILABILITY ---------------- #

def add_availability(data):

    user_id = get_jwt_identity()

    # Get request data
    date = data.get("date")
    start_time = data.get("start_time")
    end_time = data.get("end_time")

    # ---------- EMPTY FIELD VALIDATION ---------- #
    if not date or not start_time or not end_time:
        return {
            "message": "All fields are required"
        }, 400

    # ---------- PAST DATE VALIDATION ---------- #
    selected_date = datetime.strptime(
        date,
        "%Y-%m-%d"
    ).date()

    today = datetime.today().date()

    if selected_date < today:
        return {
            "message": "Cannot add past dates"
        }, 400

    # ---------- DUPLICATE SLOT CHECK ---------- #
    existing_slot = Availability.query.filter_by(
        user_id=user_id,
        date=date,
        start_time=start_time,
        end_time=end_time
    ).first()

    if existing_slot:
        return {
            "message": "This slot already exists"
        }, 400

    # ---------- OVERLAPPING SLOT CHECK ---------- #
    conflicting_slot = Availability.query.filter(
        Availability.user_id == user_id,
        Availability.date == date,
        Availability.start_time < end_time,
        Availability.end_time > start_time
    ).first()

    if conflicting_slot:
        return {
            "message": "Time slot conflict"
        }, 400

    # ---------- SAVE SLOT ---------- #
    new_slot = Availability(
        date=date,
        start_time=start_time,
        end_time=end_time,
        user_id=user_id
    )

    db.session.add(new_slot)
    db.session.commit()

    return {
        "message": "Availability Added Successfully"
    }, 201


# ---------------- GET MY AVAILABILITY ---------------- #

def get_my_availability():

    user_id = get_jwt_identity()

    slots = Availability.query.filter_by(
        user_id=user_id
    ).all()

    if not slots:
        return {
            "message": "No availability found"
        }, 404

    availability_list = []

    for slot in slots:
        availability_list.append({
            "id": slot.id,
            "date": str(slot.date),
            "start_time": str(slot.start_time),
            "end_time": str(slot.end_time)
        })

    return availability_list, 200


# ---------------- DELETE SLOT ---------------- #

def delete_availability(slot_id):

    user_id = get_jwt_identity()

    slot = Availability.query.filter_by(
        id=slot_id,
        user_id=user_id
    ).first()

    if not slot:
        return {
            "message": "Slot not found"
        }, 404

    db.session.delete(slot)
    db.session.commit()

    return {
        "message": "Slot deleted successfully"
    }, 200