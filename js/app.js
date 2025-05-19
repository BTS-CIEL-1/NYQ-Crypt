// app.js

// Fonction de chiffrement (exemple avec chiffrement César simple)
function chiffrerTexte(texte, cle) {
  const decalage = parseInt(cle, 10);
  if (isNaN(decalage)) {
    alert("La clé doit être un nombre !");
    return "";
  }

  return texte
    .split("")
    .map((char) => {
      const code = char.charCodeAt(0);
      return String.fromCharCode(code + decalage);
    })
    .join("");
}

// Fonction de déchiffrement
function dechiffrerTexte(texte, cle) {
  const decalage = parseInt(cle, 10);
  if (isNaN(decalage)) {
    alert("La clé doit être un nombre !");
    return "";
  }

  return texte
    .split("")
    .map((char) => {
      const code = char.charCodeAt(0);
      return String.fromCharCode(code - decalage);
    })
    .join("");
}

// Gérer le clic sur le bouton "Chiffrer"
document.getElementById("btnChiffrer").addEventListener("click", () => {
  const texte = document.getElementById("texteInput").value;
  const cle = document.getElementById("cleInput").value;

  const resultat = chiffrerTexte(texte, cle);
  document.getElementById("resultat").value = resultat;
});

// Gérer le clic sur le bouton "Déchiffrer"
document.getElementById("btnDechiffrer").addEventListener("click", () => {
  const texte = document.getElementById("texteInput").value;
  const cle = document.getElementById("cleInput").value;

  const resultat = dechiffrerTexte(texte, cle);
  document.getElementById("resultat").value = resultat;
});
