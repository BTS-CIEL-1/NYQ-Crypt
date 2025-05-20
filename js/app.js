// --- Sélection des éléments HTML ---
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

  if (!text) return alert("Veuillez entrer du texte à chiffrer.");
  if (!key) return alert("Veuillez entrer une clé secrète.");

  text = chiffrerCesar(text, key);
  text = chiffrerXOR(text, key);
  text = chiffrerBase64(text);

  resultText.value = text;
}

function decrypt() {
  const key = keyInput.value;
  let text = resultText.value;

  if (!text) return alert("Veuillez entrer du texte à déchiffrer.");
  if (!key) return alert("Veuillez entrer la clé utilisée pour le chiffrement.");

  text = dechiffrerBase64(text);
  text = dechiffrerXOR(text, key);
  text = dechiffrerCesar(text, key);

  resultText.value = text;
}

encryptBtn.addEventListener("click", encrypt);
decryptBtn.addEventListener("click", decrypt);