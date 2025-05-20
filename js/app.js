// Onglets
document.querySelectorAll('.tab-btn').forEach(button => {
  button.addEventListener('click', () => {
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
    button.classList.add('active');
    const tabId = button.dataset.tab + '-tab';
    document.getElementById(tabId).classList.add('active');
  });
});

// Chiffrement personnalisé
const emailInput = document.getElementById("emailInput");
const btnEnvoyer = document.getElementById("btnEnvoyer");

const textInput = document.getElementById("texteInput");
const encryptBtn = document.getElementById("btnChiffrer");
const decryptBtn = document.getElementById("btnDechiffrer");
const resultText = document.getElementById("resultat");
const fileInput = document.getElementById("fileInput");
const keyInput = document.getElementById("cleInput");

fileInput.addEventListener("change", function () {
  const file = this.files[0];
  if (file && file.type === "text/plain") {
    const reader = new FileReader();
    reader.onload = function (e) {
      textInput.value = e.target.result;
    };
    reader.readAsText(file);
  } else {
    alert("Veuillez sélectionner un fichier texte (.txt).");
  }
});

btnEnvoyer.addEventListener("click", () => {
  console.log("→ Clic sur Envoyer détecté");

  const email = emailInput.value;
  const message = resultText.value;

  console.log("Email : ", email);
  console.log("Message : ", message);

  if (!email || !message) {
    alert("Veuillez saisir un e-mail et chiffrer un texte d'abord.");
    return;
  }

  const subject = encodeURIComponent("Message chiffré depuis NYQ Crypt");
  const body = encodeURIComponent("Voici le message chiffré :\n\n" + message);
  const mailtoLink = `mailto:${email}?subject=${subject}&body=${body}`;

  console.log("Mailto URL : ", mailtoLink);
  window.location.href = mailtoLink;
});

function getDecalageDepuisCle(cle) {
  return cle.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0) % 26;
}

function chiffrerCesar(texte, cle) {
  const decalage = getDecalageDepuisCle(cle);
  return texte
    .split("")
    .map(char => String.fromCharCode(char.charCodeAt(0) + decalage))
    .join("");
}

function dechiffrerCesar(texte, cle) {
  const decalage = getDecalageDepuisCle(cle);
  return texte
    .split("")
    .map(char => String.fromCharCode(char.charCodeAt(0) - decalage))
    .join("");
}

function chiffrerXOR(texte, cle) {
  return texte
    .split("")
    .map((char, index) => String.fromCharCode(char.charCodeAt(0) ^ cle.charCodeAt(index % cle.length)))
    .join("");
}

function dechiffrerXOR(texte, cle) {
  return chiffrerXOR(texte, cle);
}

function chiffrerBase64(texte) {
  return btoa(unescape(encodeURIComponent(texte)));
}

function dechiffrerBase64(texte) {
  return decodeURIComponent(escape(atob(texte)));
}

function encrypt() {
  const key = keyInput.value;
  let text = textInput.value;
  if (!text || !key) return alert("Veuillez entrer le texte et la clé.");

  text = chiffrerCesar(text, key);
  text = chiffrerXOR(text, key);
  text = chiffrerBase64(text);

  resultText.value = text;
}

function decrypt() {
  const key = keyInput.value;
  let text = resultText.value;
  if (!text || !key) return alert("Veuillez entrer le texte et la clé.");

  text = dechiffrerBase64(text);
  text = dechiffrerXOR(text, key);
  text = dechiffrerCesar(text, key);

  resultText.value = text;
}

encryptBtn.addEventListener("click", encrypt);
decryptBtn.addEventListener("click", decrypt);
