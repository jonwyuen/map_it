from flask import Flask, render_template
from flask_modus import Modus 
from flask_sqlalchemy import SQLAlchemy
from flask_wtf.csrf import CSRFProtect
from flask_bcrypt import Bcrypt
from flask_login import LoginManager

import os

app = Flask(__name__)
modus = Modus(app)
csrf = CSRFProtect(app)
bcrypt = Bcrypt(app)
login_manager = LoginManager()
app.config['SQLALCHEMY_DATABASE_URI'] = 'postgres://localhost/map-it'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY')
db = SQLAlchemy(app)

from project.users.views import users_blueprint
from project.favorites.views import favorites_blueprint
from project.models import User

app.register_blueprint(users_blueprint, url_prefix='/users')
app.register_blueprint(favorites_blueprint, url_prefix='/users/<int:user_id>/favorites')

login_manager.init_app(app)
login_manager.login_view = 'users.login'
login_manager.login_message = 'Please log in!'

@login_manager.user_loader
def load_user(user_id):
    return User.query.get(user_id)


@app.route('/')
def root():
    return render_template('home.html')


if os.environ.get('ENV') == 'production':
    app.config.from_object('config.ProductionConfig')
else:
    app.config.from_object('config.DevelopmentConfig')
