from models.availabilitymodel import Availability
from database.db import db


def add_availability(user_id,data):

    slot = Availability(
        day=data["day"],
        start_time=data["start_time"],
        end_time=data["end_time"],
        user_id=user_id
    )

    db.session.add(slot)
    db.session.commit()

    return {
        "message":
        "Availability Added Successfully"
    }, 201


def get_my_availability(user_id):

    slots = Availability.query.filter_by(user_id=user_id).all()

    result = []

    for slot in slots:

        result.append({
            "id": slot.id,
            "day": slot.day,
            "start_time":slot.start_time,
            "end_time":slot.end_time
        })

    return result, 200


def update_availability(availability_id,user_id,data):

    slot = Availability.query.filter_by(id=availability_id,user_id=user_id).first()

    if not slot:
        return {
            "message":
            "Availability not found"
        }, 404

    slot.day = data.get("day",slot.day)

    slot.start_time = data.get("start_time",slot.start_time)

    slot.end_time = data.get("end_time",slot.end_time)

    db.session.commit()

    return {
        "message":
        "Availability Updated Successfully"
    }, 200


def delete_availability(availability_id,user_id):

    slot = Availability.query.filter_by(id=availability_id,user_id=user_id).first()

    if not slot:
        return {
            "message":
            "Availability not found"
        }, 404

    db.session.delete(slot)
    db.session.commit()

    return {
        "message":
        "Availability Deleted Successfully"
    }, 200