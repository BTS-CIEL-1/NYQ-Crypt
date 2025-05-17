import eel
import chiffrement


eel.init('web')


@eel.expose
def encrypt(text):
    try:
        return chiffrement.encrypt_text(text)
    except Exception as e:
        return "Erreur d'encryptage : " + str(e)


@eel.expose
def decrypt(text):
    try:
        return chiffrement.decrypt_text(text)
    except Exception as e:
        return "Erreur de décryptage : " + str(e)


eel.start('index.html', size=(800, 600))