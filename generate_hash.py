"""
Kullanım: python generate_hash.py
Çıktıyı .env dosyasına kopyalayın: USER_X_PASSWORD_HASH=<çıktı>
"""
from werkzeug.security import generate_password_hash
import getpass

password = getpass.getpass("Şifre: ")
print(generate_password_hash(password))
