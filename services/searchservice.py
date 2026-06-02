from models.usermodel import User
from models.skillmodel import Skill


def search_marketplace(skill=None, user=None, sort=None):

    query = Skill.query.join(User)

    if skill:
        query = query.filter(Skill.title.ilike(f"%{skill}%"))

    if user:
        query = query.filter(User.name.ilike(f"%{user}%"))

    if sort == "rating" :
        query = query.order_by(User.rating.desc())
    elif sort == "points":
        query = query.order_by(User.points.desc())

    skills = query.all()

    # Return the same field names as get_all_skills so skillCardHTML works for both
    result = [{
        "id": s.id,
        "title": s.title,
        "category": s.category,
        "description": s.description,
        "experience_level": s.experience_level,
        "exchange_points": s.exchange_points,
        "user_id": s.user_id,
        "owner_name": s.owner.name if s.owner else "Unknown",
        "owner_rating": s.owner.rating if s.owner else 0,
        "owner_location": s.owner.location if s.owner else None,
    } for s in skills]

    return result, 200