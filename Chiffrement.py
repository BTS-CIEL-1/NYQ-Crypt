from cryptography.fernet import Fernet

# Génération d'une clé symétrique
def generate_key():
    key = Fernet.generate_key()
    return key

# Chiffrement du texte
def encrypt_text(text, key):
    cipher_suite = Fernet(key)
    encrypted_text = cipher_suite.encrypt(text.encode())
    return encrypted_text

# Déchiffrement du texte
def decrypt_text(encrypted_text, key):
    cipher_suite = Fernet(key)
    decrypted_text = cipher_suite.decrypt(encrypted_text).decode()
    return decrypted_text

