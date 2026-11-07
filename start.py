import subprocess
import platform
import os
import sys

run_file = "app.py"
venv_dir = "venv"


def create_venv():
    if not os.path.exists(venv_dir):
        print("Sanal ortam oluşturuluyor...")
        subprocess.check_call([sys.executable, "-m", "venv", venv_dir])
    else:
        print("Sanal ortam mevcut.")


def get_pip_path():
    return os.path.join(
        venv_dir,
        "Scripts" if platform.system() == "Windows" else "bin",
        "pip.exe" if platform.system() == "Windows" else "pip"
    )


def get_python_path():
    return os.path.join(
        venv_dir,
        "Scripts" if platform.system() == "Windows" else "bin",
        "python.exe" if platform.system() == "Windows" else "python3"
    )


def install_requirements():
    pip_path = get_pip_path()
    if os.path.exists("requirements.txt"):
        print("Paketler kuruluyor...")
        subprocess.check_call(
            [pip_path, "install", "-r", "requirements.txt"],
            shell=(platform.system() == "Windows")
        )


def run_app():
    python_path = get_python_path()
    print("Uygulama başlatılıyor → http://127.0.0.1:5000")
    proc = subprocess.Popen(
        [python_path, run_file],
        shell=(platform.system() == "Windows")
    )
    try:
        proc.wait()
    except KeyboardInterrupt:
        proc.terminate()


if __name__ == "__main__":
    create_venv()
    install_requirements()
    run_app()
