import subprocess
import platform
import os
import sys
import time

run_file = "app.py"
venv_dir = "venv"

def create_venv():
    if not os.path.exists(venv_dir):
        print("Sanal ortam oluşturuluyor...")
        subprocess.check_call([sys.executable, "-m", "venv", venv_dir])
    else:
        print("Sanal ortam mevcut.")

def get_pip_path():
    return os.path.join(venv_dir, "Scripts" if platform.system()=="Windows" else "bin", "pip.exe" if platform.system()=="Windows" else "pip")

def get_python_path():
    return os.path.join(venv_dir, "Scripts" if platform.system()=="Windows" else "bin", "python.exe" if platform.system()=="Windows" else "python3")

def install_requirements():
    pip_path = get_pip_path()
    if os.path.exists("requirements.txt"):
        print("Python paketleri kuruluyor...")
        subprocess.check_call([pip_path, "install", "-r", "requirements.txt"], shell=(platform.system()=="Windows"))
    else:
        print("requirements.txt bulunamadı.")

def check_node_npm():
    try:
        subprocess.check_call(["node", "-v"], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        subprocess.check_call(["npm", "-v"], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        return True
    except FileNotFoundError:
        print("Node.js veya npm yüklü değil! Lütfen yükleyin: https://nodejs.org/")
        return False

def install_node_modules():
    if not os.path.exists("node_modules"):
        print("npm paketleri kuruluyor...")
        subprocess.check_call(["npm", "install"], shell=(platform.system()=="Windows"))

def run_app():
    python_path = get_python_path()
    print("Python uygulaması başlatılıyor...")
    proc = subprocess.Popen([python_path, run_file],
                            stdout=subprocess.PIPE,
                            stderr=subprocess.PIPE,
                            shell=(platform.system()=="Windows"))
    return proc

def run_electron():
    print("Electron başlatılıyor...")
    electron_cmd = "npx.cmd" if platform.system()=="Windows" else "npx"
    subprocess.Popen([electron_cmd, "electron", "."], shell=(platform.system()=="Windows"))

def main():
    create_venv()
    install_requirements()

    if check_node_npm():
        install_node_modules()
    else:
        print("Electron çalıştırılamayacak, Node/npm eksik.")

    py_proc = run_app()

    time.sleep(3)  
    run_electron()

    try:
        py_proc.wait()
    except KeyboardInterrupt:
        py_proc.terminate()

if __name__ == "__main__":
    main()
