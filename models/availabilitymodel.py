from database.db import db


class Availability(db.Model):

    __tablename__ = "availability"

    id = db.Column(db.Integer,primary_key=True)
    day = db.Column(db.String(50),nullable=False)
    start_time = db.Column(db.String(50),nullable=False)
    end_time = db.Column(db.String(50),nullable=False)
    user_id = db.Column(db.Integer,db.ForeignKey("users.id"),nullable=False)

    def __repr__(self):
        return f"<Availability {self.day}>"