# chiffrement.py
from flask import Flask, request, jsonify, render_template
from cryptography.fernet import Fernet

app = Flask(__name__)

# Génération d'une clé symétrique et création du cipher
KEY = Fernet.generate_key()
cipher_suite = Fernet(KEY)
print("Clé de chiffrement :", KEY.decode())

@app.route('/')
def index():
    return render_template('index2.html')

@app.route('/encrypt', methods=['POST'])
def encrypt():
    data = request.get_json()
    text = data.get('text', '')
    try:
        encrypted = cipher_suite.encrypt(text.encode()).decode()
        return jsonify(success=True, result=encrypted)
    except Exception as e:
        return jsonify(success=False, error=str(e))

@app.route('/decrypt', methods=['POST'])
def decrypt():
    data = request.get_json()
    text = data.get('text', '')
    try:
        decrypted = cipher_suite.decrypt(text.encode()).decode()
        return jsonify(success=True, result=decrypted)
    except Exception as e:
        return jsonify(success=False, error=str(e))

if __name__ == '__main__':
    # Lance le serveur sur le port 5000 en mode debug.
    app.run(debug=True, port=5000)

