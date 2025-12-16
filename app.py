from flask import Flask, render_template, flash
from dotenv import load_dotenv
import os
app = Flask(__name__)


load_dotenv()

# App Configs
app.secret_key = os.getenv("SECRET_KEY")



# Routes 

@app.route("/")
def home():
    modules_dir = "templates/modules"
    modules = []

    for file in os.listdir(modules_dir):
        if file.endswith(".html"):
            name = file.replace(".html", "")
            modules.append({
                "id": name,
                "title": name.replace("_", " ").title(),
                "path": f"/module/{name}"
            })

    return render_template("index.html", modules=modules)

@app.route("/module/<module_name>")
def modul(module_name):
    return render_template(f"/modules/{module_name}.html")

if __name__ == "__main__":
    app.run(debug=True)