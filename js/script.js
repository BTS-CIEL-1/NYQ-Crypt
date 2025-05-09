// crypto.js - Module de cryptage personnalisé
class Y_Q_Crypto {
    constructor(key) {
      this.key = this.expandKey(key);
    }
  
    // Fonction pour étendre la clé
    expandKey(key) {
      // Algorithme d'expansion de clé personnalisé
      let expandedKey = [];
      const keyBytes = new TextEncoder().encode(key);
      
      // Création d'une clé dérivée plus longue
      for (let i = 0; i < 32; i++) {
        expandedKey[i] = keyBytes[i % keyBytes.length] ^ 
                         ((i * 13) & 0xFF) ^ 
                         ((keyBytes[(i + 3) % keyBytes.length]) << 4);
      }
      
      return expandedKey;
    }
  
    // Fonction de cryptage
    encrypt(message) {
      const data = new TextEncoder().encode(message);
      const result = new Uint8Array(data.length);
      
      for (let i = 0; i < data.length; i++) {
        // Application de transformations multiples
        let byte = data[i];
        byte = byte ^ this.key[i % this.key.length]; // XOR avec la clé
        byte = ((byte << 3) | (byte >> 5)) & 0xFF;  // Rotation
        byte = this.substituteValue(byte);          // Substitution
        result[i] = byte;
      }
      
      return btoa(String.fromCharCode.apply(null, result)); // Encodage en Base64
    }
  
    // Fonction de décryptage
    decrypt(encrypted) {
      const data = new Uint8Array(atob(encrypted).split('').map(c => c.charCodeAt(0)));
      const result = new Uint8Array(data.length);
      
      for (let i = 0; i < data.length; i++) {
        // Inverser les transformations dans l'ordre opposé
        let byte = data[i];
        byte = this.inverseSubstituteValue(byte);   // Substitution inverse
        byte = ((byte >> 3) | (byte << 5)) & 0xFF;  // Rotation inverse
        byte = byte ^ this.key[i % this.key.length]; // XOR avec la clé
        result[i] = byte;
      }
      
      return new TextDecoder().decode(result);
    }
  
    // Fonction de substitution
    substituteValue(value) {
      // Table de substitution personnalisée
      const sBox = new Array(256);
      for (let i = 0; i < 256; i++) {
        sBox[i] = (i * 7 + 5) % 256;
      }
      return sBox[value];
    }
  
    // Fonction de substitution inverse
    inverseSubstituteValue(value) {
      // Inverse de la table de substitution
      const invSBox = new Array(256);
      for (let i = 0; i < 256; i++) {
        invSBox[(i * 7 + 5) % 256] = i;
      }
      return invSBox[value];
    }
  }
  
  // Exporter le module
  export default Y_Q_Crypto;