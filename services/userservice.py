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


# Points packages available for purchase
POINTS_PACKAGES = {
    "starter":  {"points": 50,  "price": 79,   "label": "Starter Pack"},
    "popular":  {"points": 150, "price": 199,  "label": "Popular Pack"},
    "pro":      {"points": 400, "price": 399,  "label": "Pro Pack"},
    "unlimited":{"points": 1000,"price": 799,  "label": "Unlimited Pack"},
}


def buy_points(user_id, package_id):
    """Add points to user account for the selected package (simulated purchase)."""

    package = POINTS_PACKAGES.get(package_id)
    if not package:
        return {"message": f"Invalid package '{package_id}'. Choose from: {', '.join(POINTS_PACKAGES)}"}, 400

    user = User.query.get(user_id)
    if not user:
        return {"message": "User not found"}, 404

    user.points += package["points"]
    db.session.commit()

    return {
        "message": f"Successfully added {package['points']} points! Your new balance is {user.points} pts.",
        "points_added": package["points"],
        "new_balance": user.points,
        "package": package["label"],
        "price_paid": f"₹{package['price']}"
    }, 200


def get_points_packages():
    """Return available points packages."""
    return {
        "packages": [
            {"id": k, **v} for k, v in POINTS_PACKAGES.items()
        ]
    }, 200