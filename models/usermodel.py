from database.db import db
from datetime import datetime


class User(db.Model):

    __tablename__ = "users"

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(100),unique=True,nullable=False)
    password = db.Column(db.String(255),nullable=False)
    role = db.Column(db.String(20),default="user")
    bio = db.Column(db.Text,nullable=True)
    location = db.Column(db.String(100),nullable=True)
    skills_offered = db.Column(db.Text,nullable=True)
    skills_wanted = db.Column(db.Text,nullable=True)
    points = db.Column(db.Integer,default=100)
    rating = db.Column(db.Float,default=0)
    created_at = db.Column(db.DateTime,default=datetime.utcnow)
    
    skills = db.relationship("Skill",backref="owner",lazy=True,cascade="all, delete")
    availability = db.relationship("Availability",backref="owner",lazy=True,cascade="all, delete")
    bookings_as_learner=db.relationship("Booking",  foreign_keys="Booking.learner_id", lazy=True, cascade="all, delete")
    bookings_as_teacher=db.relationship("Booking",  foreign_keys="Booking.teacher_id", lazy=True, cascade="all, delete")
    reviews_received = db.relationship(
    "Review",
    foreign_keys="Review.teacher_id",
    lazy=True,
    cascade="all, delete"
    )

    reviews_given = db.relationship(
        "Review",
        foreign_keys="Review.learner_id",
        lazy=True,
        cascade="all, delete"
    )


    def __repr__(self):
        return f"<User {self.name}>"