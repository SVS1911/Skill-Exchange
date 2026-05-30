from flask import Flask , jsonify
from flask_jwt_extended import JWTManager
from datetime import timedelta

from config import Config
from database.db import db

from models.usermodel import User
from models.skillmodel import Skill
from models.availabilitymodel import Availability
from models.bookingmodel import Booking
from models.reviewmodel import Review

from flask_bcrypt import Bcrypt

from routes.authroute import auth_bp
from routes.userroute import user_bp
from routes.skillroute import skill_bp
from routes.availabilityroute import availability_bp
from routes.reviewroute import review_bp

from routes.bookingroute import booking_bp



app = Flask(__name__)


app.config.from_object(Config)

app.config["JWT_ACCESS_TOKEN_EXPIRES"] = timedelta(minutes=30) 

# Initialize DB
db.init_app(app)

# JWT
jwt = JWTManager(app)

bcrypt = Bcrypt(app)


@app.route("/")
def home():
    return {"message": "Community Skill Exchange Marketplace API Running"}


app.register_blueprint(auth_bp,url_prefix="/auth")
app.register_blueprint(user_bp,url_prefix="/user")
app.register_blueprint(skill_bp,url_prefix="/skill")
app.register_blueprint(availability_bp,url_prefix="/availability")
app.register_blueprint(booking_bp, url_prefix="/booking")
app.register_blueprint(review_bp,url_prefix="/review")

# Create database tables
with app.app_context():
    db.create_all()



if __name__ == "__main__":
    app.run(debug=True)