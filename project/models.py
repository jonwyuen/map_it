from project import db, bcrypt
from flask_login import UserMixin

class User(db.Model, UserMixin):
    __tablename__ = 'users'

    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.Text, unique=True, nullable=False)
    email = db.Column(db.Text, unique=True, nullable=False)
    first_name = db.Column(db.Text)
    last_name = db.Column(db.Text)
    password = db.Column(db.Text)
    favorites = db.relationship('Favorite', backref='user', cascade='all,delete-orphan', lazy='dynamic')

    def __init__(self, username, email, first_name, last_name, password):
        self.username = username
        self.email = email
        self.first_name = first_name
        self.last_name = last_name
        self.password = bcrypt.generate_password_hash(password).decode('UTF-8')


    def __repr__(self):
        return "Username: {}, Email: {}, Name: {} {}".format(self.username, self.email, self.first_name, self.last_name)

    @classmethod
    def authenticate(cls, username, password):
        user = cls.query.filter_by(username=username).first()
        if user:
            authenticated_user = bcrypt.check_password_hash(user.password, password)
            if authenticated_user:
                return user
        return False


class Favorite(db.Model):
    __tablename__ = "favorites"

    id = db.Column(db.Integer, primary_key=True)
    location = db.Column(db.Text)
    latitude = db.Column(db.Float)
    longitude = db.Column(db.Float)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'))

    def __init__(self, location, latitude, longitude, user_id):
        self.location = location
        self.latitude = latitude
        self.longitude = longitude
        self.user_id = user_id

