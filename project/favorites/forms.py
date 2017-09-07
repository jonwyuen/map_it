from flask_wtf import FlaskForm
from wtforms import StringField, DecimalField
from wtforms.validators import DataRequired


class FavoriteForm(FlaskForm):
    location = StringField('Location', validators=[DataRequired()])
    latitude = DecimalField('Latitude', validators=[DataRequired()])
    longitude = DecimalField('Longitude', validators=[DataRequired()])
