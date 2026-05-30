from database.db import db
from datetime import datetime

class Booking(db.Model):
    __tablename__ = "bookings"
    
    id = db.Column(db.Integer, primary_key=True)
    learner_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    teacher_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    skill_id = db.Column(db.Integer, db.ForeignKey("skills.id"), nullable=False)  # check table name
    booking_date=db.Column(db.String(50),nullable=False)
    booking_time = db.Column(db.String(50),nullable=False)
    status = db.Column(db.String(50), default="pending", nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    
    review = db.relationship(
    "Review",
    backref="booking",
    uselist=False,
    cascade="all, delete"
    )
    
    def __repr__(self):
        return f"<Booking {self.id}>"