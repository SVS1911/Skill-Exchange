from models.usermodel import User
from database.db import db
from flask_bcrypt import Bcrypt
from flask_jwt_extended import create_access_token

bcrypt = Bcrypt()


def register_user(data):

    existing_user = User.query.filter_by(email=data["email"]).first()

    if existing_user:
        return {"message": "Email already exists"}, 400

    hashed_password = bcrypt.generate_password_hash(data["password"]).decode("utf-8")

    new_user = User(name=data["name"],email=data["email"],password=hashed_password)

    db.session.add(new_user)
    db.session.commit()

    return {"message": "User Registered Successfully"}, 201


def login_user(data):

    user = User.query.filter_by(email=data["email"]).first()

    if not user:
        return {"message": "Invalid Email"}, 404

    if not bcrypt.check_password_hash(user.password,data["password"]):
        return {"message": "Invalid Password"}, 401

    access_token = create_access_token(identity=str(user.id))

    return {"message": "Login Successful","token": access_token}, 200