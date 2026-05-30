from models.skillmodel import Skill
from database.db import db


def create_skill(user_id, data):

    skill = Skill(
        title=data["title"],
        category=data["category"],
        description=data.get("description"),
        experience_level=data["experience_level"],
        exchange_points=data.get("exchange_points",10),
        user_id=user_id
    )

    db.session.add(skill)
    db.session.commit()

    return {"message":"Skill Added Successfully"}, 201


def get_all_skills():

    skills = Skill.query.all()

    result = []

    for skill in skills:

        result.append({
            "id": skill.id,
            "title": skill.title,
            "category": skill.category,
            "description":skill.description,
            "experience_level":skill.experience_level,
            "exchange_points":skill.exchange_points,
            "teacher":skill.owner.name
        })

    return result, 200


def get_my_skills(user_id):

    skills = Skill.query.filter_by(user_id=user_id).all()

    result = []

    for skill in skills:

        result.append({
            "id": skill.id,
            "title": skill.title,
            "category": skill.category,
            "description":skill.description,
            "experience_level":skill.experience_level,
            "exchange_points":skill.exchange_points
        })

    return result, 200


def update_skill(skill_id,user_id,data):

    skill = Skill.query.filter_by(id=skill_id,user_id=user_id).first()

    if not skill:
        return {"message":"Skill not found"}, 404

    skill.title = data.get("title",skill.title)

    skill.category = data.get("category",skill.category)

    skill.description = data.get("description",skill.description)

    skill.experience_level = data.get("experience_level",skill.experience_level)

    skill.exchange_points = data.get("exchange_points",skill.exchange_points)

    db.session.commit()

    return {"message":"Skill Updated Successfully"}, 200


def delete_skill(skill_id,user_id):

    skill = Skill.query.filter_by(id=skill_id,user_id=user_id).first()

    if not skill:
        return {"message":"Skill not found"}, 404

    db.session.delete(skill)
    db.session.commit()

    return {"message":"Skill Deleted Successfully"}, 200