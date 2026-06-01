from models.usermodel import User
from models.skillmodel import Skill
from sqlalchemy import or_


def search_marketplace(
    skill=None,
    user=None,
    sort=None
):

    query = Skill.query.join(User)

    # Search by skill title
    if skill:
        query = query.filter(
            Skill.title.ilike(
                f"%{skill}%"
            )
        )

    # Search by username
    if user:
        query = query.filter(
            User.name.ilike(
                f"%{user}%"
            )
        )

    # Sorting
    if sort == "rating":
        query = query.order_by(
            User.rating.desc()
        )

    elif sort == "points":
        query = query.order_by(
            User.points.desc()
        )

    skills = query.all()

    result = []

    for skill in skills:

        result.append({

        "teacher_id":
        skill.owner.id,

        "teacher_name":
        skill.owner.name,

        "teacher_rating":
        skill.owner.rating,

        "teacher_points":
        skill.owner.points,

        "location":
        skill.owner.location,

        "skill_id":
        skill.id,

        "skill_title":
        skill.title,

        "category":
        skill.category,

        "experience_level":
        skill.experience_level,

        "exchange_points":
        skill.exchange_points
    })

    return result, 200