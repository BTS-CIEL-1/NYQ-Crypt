// Ce script génère un certificat SSL auto-signé pour le développement
const fs = require('fs');
const { execSync } = require('child_process');

// Vérifier si les certificats existent déjà
if (!fs.existsSync('./cert')) {
  fs.mkdirSync('./cert');
  
  console.log('Génération de certificats SSL auto-signés...');
  
  // Générer un certificat SSL auto-signé avec OpenSSL
  const command = 'openssl req -x509 -newkey rsa:4096 -keyout ./cert/key.pem -out ./cert/cert.pem -days 365 -nodes -subj "/CN=localhost"';
  
  try {
    execSync(command);
    console.log('Certificats SSL générés avec succès!');
  } catch (error) {
    console.error('Erreur lors de la génération des certificats:', error);
    process.exit(1);
  }
} else {
  console.log('Le dossier de certificats existe déjà.');
}