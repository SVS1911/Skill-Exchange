from database.db import db
from datetime import datetime


class Skill(db.Model):

    __tablename__ = "skills"

    id = db.Column(db.Integer,primary_key=True)
    title = db.Column(db.String(100),nullable=False)
    category = db.Column(db.String(100),nullable=False)
    description = db.Column(db.Text,nullable=True)
    experience_level = db.Column(db.String(50),nullable=False)
    exchange_points = db.Column(db.Integer,default=10)
    user_id = db.Column(db.Integer,db.ForeignKey("users.id"),nullable=False)
    created_at = db.Column(db.DateTime,default=datetime.utcnow)
    
    bookings=db.relationship("Booking", backref="skill", lazy=True, cascade="all, delete")
    

    def __repr__(self):
        return f"<Skill {self.title}>"