import subprocess
import platform
import os
import sys
import time

run_file = "app.py"
venv_dir = "venv"
VERSION_FILE = "version.txt"
CHANGELOG_FILE = "CHANGELOG.md"


# ---------------- GIT / UPDATE ----------------

def check_git():
    try:
        subprocess.check_call(
            ["git", "--version"],
            stdout=subprocess.DEVNULL,
            stderr=subprocess.DEVNULL,
            shell=(platform.system() == "Windows")
        )
        return True
    except Exception:
        print("Git yüklü değil, güncelleme atlandı.")
        return False


def is_git_repo():
    return os.path.exists(".git")


def read_version():
    if os.path.exists(VERSION_FILE):
        with open(VERSION_FILE, "r", encoding="utf-8") as f:
            return f.read().strip()
    return "0.0.0"


def show_changelog():
    if os.path.exists(CHANGELOG_FILE):
        print("\n--- DEĞİŞİKLİKLER ---")
        with open(CHANGELOG_FILE, "r", encoding="utf-8") as f:
            print(f.read())
        print("--------------------\n")


def git_pull_if_needed():
    if not check_git() or not is_git_repo():
        return

    old_version = read_version()
    print(f"Mevcut sürüm: {old_version}")
    print("Güncellemeler kontrol ediliyor...")

    try:
        subprocess.check_call(
            ["git", "pull"],
            shell=(platform.system() == "Windows")
        )
    except subprocess.CalledProcessError:
        print("Güncelleme başarısız, mevcut sürümle devam ediliyor.")
        return

    new_version = read_version()

    if new_version != old_version:
        print(f"Yeni sürüm bulundu: {new_version}")
        show_changelog()
    else:
        print("Zaten en güncel sürüm.")


# ---------------- PYTHON / NODE ----------------

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
        print("Python paketleri kuruluyor...")
        subprocess.check_call(
            [pip_path, "install", "-r", "requirements.txt"],
            shell=(platform.system() == "Windows")
        )
    else:
        print("requirements.txt bulunamadı.")


def check_node_npm():
    try:
        subprocess.check_call(["node", "-v"], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        subprocess.check_call(["npm", "-v"], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        return True
    except Exception:
        print("Node.js veya npm yüklü değil!")
        return False


def install_node_modules():
    if not os.path.exists("node_modules"):
        print("npm paketleri kuruluyor...")
        subprocess.check_call(["npm", "install"], shell=(platform.system() == "Windows"))


# ---------------- RUN ----------------

def run_app():
    python_path = get_python_path()
    print("Python uygulaması başlatılıyor...")
    return subprocess.Popen(
        [python_path, run_file],
        shell=(platform.system() == "Windows")
    )


def run_electron():
    print("Electron başlatılıyor...")
    electron_cmd = "npx.cmd" if platform.system() == "Windows" else "npx"
    subprocess.Popen(
        [electron_cmd, "electron", "."],
        shell=(platform.system() == "Windows")
    )


def main():
    git_pull_if_needed()   

    create_venv()
    install_requirements()

    if check_node_npm():
        install_node_modules()
    else:
        print("Electron çalıştırılamayacak.")

    py_proc = run_app()
    time.sleep(3)
    run_electron()

    try:
        py_proc.wait()
    except KeyboardInterrupt:
        py_proc.terminate()


if __name__ == "__main__":
    main()
