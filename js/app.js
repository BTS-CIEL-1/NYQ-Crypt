// app.js

// Fonction de chiffrement avec XOR + base64
function xorEncrypt(text, key) {
  if (!key) {
    alert("La clé ne peut pas être vide !");
    return "";
  }

  const encrypted = text
    .split("")
    .map((char, i) =>
      String.fromCharCode(char.charCodeAt(0) ^ key.charCodeAt(i % key.length))
    )
    .join("");

  return btoa(encrypted); // Encodage en base64 pour rendre le résultat lisible
}

// Fonction de déchiffrement avec XOR + base64
function xorDecrypt(base64, key) {
  if (!key) {
    alert("La clé ne peut pas être vide !");
    return "";
  }

  try {
    const encrypted = atob(base64); // Décodage du base64

    const decrypted = encrypted
      .split("")
      .map((char, i) =>
        String.fromCharCode(char.charCodeAt(0) ^ key.charCodeAt(i % key.length))
      )
      .join("");

    return decrypted;
  } catch (error) {
    alert("Erreur : le texte à déchiffrer est invalide ou la clé est incorrecte.");
    return "";
  }
}

// Gérer le clic sur le bouton "Chiffrer"
document.getElementById("btnChiffrer").addEventListener("click", () => {
  const texte = document.getElementById("texteInput").value;
  const cle = document.getElementById("cleInput").value;

  const resultat = xorEncrypt(texte, cle);
  document.getElementById("resultat").value = resultat;
});

// Gérer le clic sur le bouton "Déchiffrer"
document.getElementById("btnDechiffrer").addEventListener("click", () => {
  const texte = document.getElementById("texteInput").value;
  const cle = document.getElementById("cleInput").value;

  const resultat = xorDecrypt(texte, cle);
  document.getElementById("resultat").value = resultat;
});
