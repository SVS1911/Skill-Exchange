from models.reviewmodel import Review
from models.bookingmodel import Booking
from models.usermodel import User
from database.db import db
from sqlalchemy import func


def add_review(
    learner_id,
    data
):

    booking = Booking.query.filter_by(
        id=data["booking_id"],
        learner_id=learner_id
    ).first()

    if not booking:
        return {
            "message":
            "Booking not found"
        }, 404

    if booking.status != "accepted":
        return {
            "message":
            "Booking not accepted"
        }, 400

    existing_review = Review.query.filter_by(
        booking_id=data["booking_id"]
    ).first()

    if existing_review:
        return {
            "message":
            "Review already submitted"
        }, 400

    review = Review(
        booking_id=data["booking_id"],
        learner_id=learner_id,
        teacher_id=booking.teacher_id,
        rating=data["rating"],
        review_text=data.get(
            "review_text"
        )
    )

    db.session.add(review)
    db.session.commit()

    average_rating = db.session.query(
        func.avg(Review.rating)
    ).filter_by(
        teacher_id=booking.teacher_id
    ).scalar()

    teacher = User.query.get(
        booking.teacher_id
    )

    teacher.rating = round(
        average_rating,
        2
    )

    db.session.commit()

    return {
        "message":
        "Review Added Successfully"
    }, 201


def get_user_reviews(
    teacher_id
):

    reviews = Review.query.filter_by(
        teacher_id=teacher_id
    ).all()

    result = []

    for review in reviews:

        result.append({
            "rating":
            review.rating,

            "review":
            review.review_text,

            "learner_id":
            review.learner_id
        })

    return result, 200