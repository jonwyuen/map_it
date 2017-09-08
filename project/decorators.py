from flask import redirect, url_for, flash
from functools import wraps
from flask_login import current_user

def ensure_correct_user(fn):
    @wraps(fn)
    def wrapper(*args, **kwargs):
        if kwargs.get('user_id') != current_user.id:
            flash('Not Authorized', "alert-danger")
            return redirect(url_for('users.index'))
        return fn(*args, **kwargs)
    return wrapper

def ensure_authenticated(fn):
    @wraps(fn)
    def wrapper(*args, **kwargs):
        if current_user.is_authenticated:
            return redirect(url_for('users.index'))
        return fn(*args, **kwargs)
    return wrapper