from flask_wtf import FlaskForm
from wtforms import StringField, DecimalField, IntegerField
from wtforms.validators import DataRequired


class FavoriteForm(FlaskForm):
    location = StringField('Location', validators=[DataRequired()])
    latitude = DecimalField('Latitude', validators=[DataRequired()])
    longitude = DecimalField('Longitude', validators=[DataRequired()])
    zoom = IntegerField('Zoom', validators=[DataRequired()])
