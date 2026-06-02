from models.skillmodel import Skill
from database.db import db


def create_skill(user_id, data):
    if not data.get("title") or not data.get("category") or not data.get("experience_level"):
        return {"message": "title, category and experience_level are required"}, 400

    # ---------- DUPLICATE CHECK ---------- #
    existing = Skill.query.filter(
        Skill.user_id == user_id,
        db.func.lower(Skill.title) == data["title"].strip().lower()
    ).first()
    if existing:
        return {"message": "You already have a skill with this title"}, 400

    skill = Skill(
        title=data["title"].strip(),
        category=data["category"],
        description=data.get("description"),
        experience_level=data["experience_level"],
        exchange_points=data.get("exchange_points", 10),
        user_id=user_id
    )
    db.session.add(skill)
    db.session.commit()
    return {"message": "Skill Added Successfully", "id": skill.id}, 201


def _skill_to_dict(skill, include_owner=True):
    """Consistent skill shape the frontend expects."""
    d = {
        "id": skill.id,
        "title": skill.title,
        "category": skill.category,
        "description": skill.description,
        "experience_level": skill.experience_level,
        "exchange_points": skill.exchange_points,
        "user_id": skill.user_id,
    }
    if include_owner:
        d["owner_name"] = skill.owner.name if skill.owner else "Unknown"
        d["owner_rating"] = skill.owner.rating if skill.owner else 0
        d["owner_location"] = skill.owner.location if skill.owner else None
    return d


def get_all_skills(exclude_user_id=None):
    query = Skill.query
    if exclude_user_id:
        query = query.filter(Skill.user_id != exclude_user_id)
    skills = query.all()
    return [_skill_to_dict(s) for s in skills], 200


def get_my_skills(user_id):
    skills = Skill.query.filter_by(user_id=user_id).all()
    return [_skill_to_dict(s, include_owner=False) for s in skills], 200


def update_skill(skill_id, user_id, data):
    skill = Skill.query.filter_by(id=skill_id, user_id=user_id).first()
    if not skill:
        return {"message": "Skill not found"}, 404

    skill.title = data.get("title", skill.title)
    skill.category = data.get("category", skill.category)
    skill.description = data.get("description", skill.description)
    skill.experience_level = data.get("experience_level", skill.experience_level)
    skill.exchange_points = data.get("exchange_points", skill.exchange_points)

    db.session.commit()
    return {"message": "Skill Updated Successfully"}, 200


def delete_skill(skill_id, user_id):
    skill = Skill.query.filter_by(id=skill_id, user_id=user_id).first()
    if not skill:
        return {"message": "Skill not found"}, 404

    db.session.delete(skill)
    db.session.commit()
    return {"message": "Skill Deleted Successfully"}, 200