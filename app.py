from flask import Flask, jsonify, render_template
from flask_jwt_extended import JWTManager
from datetime import timedelta
from flasgger import Swagger

from config import Config
from database.db import db

from models.usermodel import User
from models.skillmodel import Skill
from models.availabilitymodel import Availability
from models.bookingmodel import Booking
from models.reviewmodel import Review
from models.messagemodel import Message

from flask_bcrypt import Bcrypt

from routes.authroute import auth_bp
from routes.userroute import user_bp
from routes.skillroute import skill_bp
from routes.availabilityroute import availability_bp
from routes.reviewroute import review_bp
from routes.searchroute import search_bp
from routes.messageroute import message_bp
from routes.bookingroute import booking_bp


import os
app = Flask(__name__, 
            template_folder=os.path.join(os.path.dirname(__file__), 'templates'),
            static_folder=os.path.join(os.path.dirname(__file__), 'static'))

swagger_config = {
    "headers": [],
    "specs": [
        {
            "endpoint": "apispec",
            "route": "/apispec.json",
            "rule_filter": lambda rule: True,
            "model_filter": lambda tag: True,
        }
    ],
    "static_url_path": "/flasgger_static",
    "swagger_ui": True,
    "specs_route": "/apidocs/"
}

swagger_template = {
    "swagger": "2.0",
    "info": {
        "title": "Community Skill Exchange Marketplace API",
        "description": "API for skill sharing, booking, messaging, reviews and barter-based learning.",
        "version": "1.0.0"
    }
}

swagger = Swagger(app, config=swagger_config, template=swagger_template)


@app.route('/')
def home():
    return render_template('index.html')


app.config.from_object(Config)
app.config["JWT_ACCESS_TOKEN_EXPIRES"] = timedelta(minutes=30)

db.init_app(app)
jwt = JWTManager(app)
bcrypt = Bcrypt(app)


@app.route("/test")
def test():
    """
    Test API
    ---
    tags:
      - Testing
    responses:
      200:
        description: Test successful
    """
    return {"message": "Swagger Test Working"}


app.register_blueprint(auth_bp, url_prefix="/auth")
app.register_blueprint(user_bp, url_prefix="/user")
app.register_blueprint(skill_bp, url_prefix="/skill")
app.register_blueprint(availability_bp, url_prefix="/availability")
app.register_blueprint(booking_bp, url_prefix="/booking")
app.register_blueprint(review_bp, url_prefix="/review")
app.register_blueprint(search_bp, url_prefix="/search")
app.register_blueprint(message_bp, url_prefix="/message")

with app.app_context():
    db.create_all()


if __name__ == "__main__":
    app.run(debug=True)
