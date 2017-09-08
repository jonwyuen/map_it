from flask import redirect, render_template, request, url_for, flash, Blueprint, jsonify
from project import db
from project.models import User, Favorite
from project.favorites.forms import FavoriteForm
from project.decorators import ensure_correct_user
from flask_login import login_required
from flask_wtf.csrf import validate_csrf, ValidationError

favorites_blueprint = Blueprint(
    'favorites',
    __name__,
    template_folder='templates'
)

@favorites_blueprint.route('/', methods=['GET', 'POST', 'DELETE'])
@login_required
@ensure_correct_user
def index(user_id):
    user = User.query.get_or_404(user_id);
    if request.method == 'POST':
        form = FavoriteForm(request.form)
        if form.validate():
            favorite = Favorite(form.location.data, float(form.latitude.data), float(form.longitude.data), user.id)
            db.session.add(favorite)
            db.session.commit()
            return jsonify('Created')
    return render_template('favorites/index.html', user=user)

@favorites_blueprint.route('/list')
@login_required
@ensure_correct_user
def list(user_id):
    fav_list = []
    user = User.query.get_or_404(user_id);
    for fav in user.favorites:
        fav_list.append(dict(loc=fav.location))
    return jsonify(fav_list)


@favorites_blueprint.route('/<int:fav_id>', methods=['GET', 'DELETE'])
@login_required
@ensure_correct_user
def show(user_id, fav_id):
    if request.method == b'DELETE':
        user = User.query.get_or_404(user_id);
        favorite = Favorite.query.get_or_404(fav_id);
        try:
            validate_csrf(request.form.get('csrf_token'))
        except ValidationError:
            flash("There was a problem deleting your favorite")
            return render_template('users/show.html', user=user)
        db.session.delete(favorite)
        db.session.commit()
        flash("Sucessfully removed favorite", "alert-info")
        return redirect(url_for('favorites.index', user_id=user.id))
    return render_template()
