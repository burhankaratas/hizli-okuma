from flask import Flask, render_template, redirect, url_for, request, flash
from flask_login import LoginManager, UserMixin, login_user, login_required, logout_user, current_user
from werkzeug.security import check_password_hash
from dotenv import load_dotenv
import os

load_dotenv()

app = Flask(__name__)
app.secret_key = os.getenv("SECRET_KEY")

login_manager = LoginManager()
login_manager.init_app(app)
login_manager.login_view = "login"
login_manager.login_message = "Bu sayfaya erişmek için giriş yapmalısınız."
login_manager.login_message_category = "warning"


class User(UserMixin):
    def __init__(self, uid, email, password_hash):
        self.id = uid
        self.email = email
        self.password_hash = password_hash


def _load_users():
    users = []
    i = 1
    while True:
        email = os.getenv(f"USER_{i}_EMAIL")
        pw_hash = os.getenv(f"USER_{i}_PASSWORD_HASH")
        if not email or not pw_hash:
            break
        users.append(User(str(i), email.strip(), pw_hash.strip()))
        i += 1
    return users


@login_manager.user_loader
def load_user(user_id):
    for user in _load_users():
        if user.id == user_id:
            return user
    return None


@app.route("/login", methods=["GET", "POST"])
def login():
    if current_user.is_authenticated:
        return redirect(url_for("home"))
    if request.method == "POST":
        email = request.form.get("email", "").strip()
        password = request.form.get("password", "")
        for user in _load_users():
            if user.email == email and check_password_hash(user.password_hash, password):
                login_user(user, remember=True)
                return redirect(url_for("home"))
        flash("Geçersiz e-posta veya şifre.", "danger")
    return render_template("login.html")


@app.route("/logout")
@login_required
def logout():
    logout_user()
    return redirect(url_for("login"))


@app.route("/")
@login_required
def home():
    modules_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), "templates", "modules")
    modules = []
    for file in sorted(os.listdir(modules_dir)):
        if file.endswith(".html"):
            name = file.replace(".html", "")
            modules.append({
                "id": name,
                "title": name.replace("_", " ").title(),
                "path": f"/module/{name}"
            })
    return render_template("index.html", modules=modules)


@app.route("/module/<module_name>")
@login_required
def modul(module_name):
    return render_template(f"/modules/{module_name}.html")


if __name__ == "__main__":
    app.run(debug=True)
