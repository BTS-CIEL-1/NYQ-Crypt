// Définir une clé commune utilisée pour toutes les étapes
const COMMON_KEY = "MaCleSecreteCommun-celaDoitEtreLongueEtSecurisee";

// Sélection des éléments HTML
const textInput = document.getElementById("texteInput");
const encryptBtn = document.getElementById("btnChiffrer");
const decryptBtn = document.getElementById("btnDechiffrer");
const resultText = document.getElementById("resultat");
const fileInput = document.getElementById('fileInput');

fileInput.addEventListener('change', function () {
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


// ----------------------------
// 🔐 **Méthodes de cryptage multi-étapes**
// ----------------------------

// 1️⃣ **Chiffrement César**
function chiffrerCesar(texte, cle) {
    const decalage = 5; // Fixe un décalage standard
    return texte
        .split("")
        .map((char) => String.fromCharCode(char.charCodeAt(0) + decalage))
        .join("");
}

function dechiffrerCesar(texte, cle) {
    const decalage = 5;
    return texte
        .split("")
        .map((char) => String.fromCharCode(char.charCodeAt(0) - decalage))
        .join("");
}

// 2️⃣ **Chiffrement XOR**
function chiffrerXOR(texte, cle) {
    return texte
        .split("")
        .map((char, index) => String.fromCharCode(char.charCodeAt(0) ^ cle.charCodeAt(index % cle.length)))
        .join("");
}

function dechiffrerXOR(texte, cle) {
    return chiffrerXOR(texte, cle); // XOR est réversible
}

// 3️⃣ **Encodage Base64**
function chiffrerBase64(texte) {
    return btoa(unescape(encodeURIComponent(texte))); // Gère correctement les caractères spéciaux
}

function dechiffrerBase64(texte) {
    return decodeURIComponent(escape(atob(texte))); // Gère les erreurs d'affichage et les caractères corrompus
}

// ----------------------------
// 🔄 **Gestion du cryptage/déchiffrement**
// ----------------------------

// **Chiffrement en 3 étapes**
function encrypt() {
    const key = COMMON_KEY;
    let text = textInput.value;

    if (!text) {
        alert("Veuillez entrer du texte à crypter.");
        return;
    }

    console.log("Texte original :", text);

    // Étape 1 : Chiffrement César
    text = chiffrerCesar(text, key);
    console.log("Après César :", text);

    // Étape 2 : Chiffrement XOR
    text = chiffrerXOR(text, key);
    console.log("Après XOR :", text);

    // Étape 3 : Encodage Base64
    text = chiffrerBase64(text);
    console.log("Après Base64 :", text);

    resultText.value = text;
}

// **Déchiffrement en 3 étapes (ordre inverse)**
function decrypt() {
    const key = COMMON_KEY;
    let text = resultText.value;

    if (!text) {
        alert("Veuillez entrer du texte à décrypter.");
        return;
    }

    console.log("Texte crypté :", text);

    // Étape 1 : Décodage Base64
    text = dechiffrerBase64(text);
    console.log("Après Base64 :", text);

    // Étape 2 : Déchiffrement XOR
    text = dechiffrerXOR(text, key);
    console.log("Après XOR :", text);

    // Étape 3 : Déchiffrement César
    text = dechiffrerCesar(text, key);
    console.log("Après César :", text);

    resultText.value = text;
}

// ----------------------------
// 🔘 **Écoute des boutons**
// ----------------------------
encryptBtn.addEventListener("click", encrypt);
decryptBtn.addEventListener("click", decrypt);