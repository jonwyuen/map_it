from flask import redirect, render_template, request, url_for, flash, Blueprint
from project import db, bcrypt
from project.models import User
from project.users.forms import SignUpForm, LoginForm, UserEditForm, PasswordEditForm
from project.decorators import ensure_correct_user, ensure_authenticated
from sqlalchemy.exc import IntegrityError
from flask_wtf.csrf import validate_csrf, ValidationError
from flask_login import login_user, logout_user, login_required

users_blueprint = Blueprint(
    'users',
    __name__,
    template_folder='templates'
)

@users_blueprint.route('/')
@login_required
def index():
    return render_template('users/index.html')

@users_blueprint.route('/<int:user_id>/map')
@login_required
@ensure_correct_user
def map(user_id):
    return render_template('users/map.html')

@users_blueprint.route('/signup', methods=['GET','POST'])
@ensure_authenticated
def signup():
    form = SignUpForm(request.form)
    if request.method == 'POST' and form.validate():
        try:
            user = User(form.data['username'], form.data['email'], form.data['first_name'], form.data['last_name'], form.data['password'])
            db.session.add(user)
            db.session.commit()
            login_user(user,remember=True)
            flash("Successfully signed up")  
            return redirect(url_for('users.index'))
        except IntegrityError:
            flash("Username/email has already been registered")
            return render_template('users/signup.html', form=form)
    return render_template('users/signup.html', form=form)

@users_blueprint.route('/login', methods=['GET','POST'])
@ensure_authenticated
def login():
    form = LoginForm(request.form)
    if request.method == 'POST' and form.validate():
        authenticated_user = User.authenticate(form.data['username'], form.data['password'])
        if authenticated_user:
            login_user(authenticated_user,remember=True)
            flash("Successfully logged in")
            return redirect(url_for('users.index'))
        else:
            flash("Invalid Credentials")
    return render_template('users/login.html', form=form)


@users_blueprint.route('/<int:user_id>', methods=['GET','PATCH','DELETE'])
@login_required
@ensure_correct_user
def show(user_id):
    user = User.query.get_or_404(user_id)
    form = UserEditForm(request.form)
    if request.method == b'PATCH':
        if form.validate():
            try:
                user.username = form.data['username']
                user.email = form.data['email']
                user.first_name = form.data['first_name']
                user.last_name = form.data['last_name']
                user.password = bcrypt.generate_password_hash(form.data['password']).decode('UTF-8')
                db.session.add(user)
                db.session.commit()
                flash("Successfully edited profile")
                return redirect(url_for('users.show', user_id=user.id))
            except IntegrityError:
                flash("Username/email has already been registered")
                db.session.rollback()
                return render_template('users/edit.html', user=user, form=form)    
        return render_template('users/edit.html', user=user, form=form)
    if request.method == b'DELETE':
        try:
            validate_csrf(request.form.get('csrf_token'))
        except ValidationError:
            flash("There was a problem deleting your account")
            return render_template('users/show.html', user=user)
        db.session.delete(user)
        db.session.commit()
        logout_user()
        flash("Sucessfully deleted account")
        return redirect(url_for('users.login'))
    return render_template('users/show.html', user=user)

@users_blueprint.route('/<int:user_id>/edit')
@login_required
@ensure_correct_user
def edit(user_id):
    user = User.query.get_or_404(user_id)
    form = UserEditForm(obj=user)
    return render_template('users/edit.html', user=user, form=form)

@users_blueprint.route('/<int:user_id>/edit_password', methods=["GET", "PATCH"])
@login_required
@ensure_correct_user
def edit_password(user_id):
    user = User.query.get_or_404(user_id)
    form = PasswordEditForm()
    if request.method == b'PATCH':
        form = PasswordEditForm(request.form)
        if form.validate():
            authenticated_user = bcrypt.check_password_hash(user.password, request.form['old_password'])
            if authenticated_user and (request.form['new_password'] == request.form['confirm_password']):
                user.password = bcrypt.generate_password_hash(request.form['new_password']).decode('UTF-8')
                db.session.add(user)
                db.session.commit()
                flash("Successfully updated password")
                return redirect(url_for('users.index'))
            flash("Passwords do not match. Please try again.")
            return render_template("users/edit_password.html", form=form, user=user)
        flash("Please correct errors and try again.")
        return render_template("users/edit_password.html", form=form, user=user)
    return render_template('users/edit_password.html', form=form, user=user)



@users_blueprint.route('/logout', methods=['GET','POST'])
@login_required
def logout():
    logout_user()
    flash("Sucessfully logged out")
    return redirect(url_for('users.login'))
