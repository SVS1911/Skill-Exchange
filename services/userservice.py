from models.usermodel import User
from database.db import db


def get_profile(user_id):

    user = User.query.get(user_id)

    if not user:
        return {
            "message": "User not found"
        }, 404

    return {
        "id": user.id,
        "name": user.name,
        "email": user.email,
        "bio": user.bio,
        "location": user.location,
        "skills_offered":user.skills_offered,
        "skills_wanted":user.skills_wanted,
        "points": user.points,
        "rating": user.rating
    }, 200


def update_profile(user_id, data):

    user = User.query.get(user_id)

    if not user:
        return {
            "message": "User not found"
        }, 404

    user.bio = data.get("bio",user.bio)

    user.location = data.get("location",user.location)

    user.skills_offered = data.get("skills_offered",user.skills_offered)

    user.skills_wanted = data.get("skills_wanted",user.skills_wanted)

    db.session.commit()

    return {
        "message":
        "Profile Updated Successfully"
    }, 200