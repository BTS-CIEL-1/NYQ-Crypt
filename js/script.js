// crypto.js - Module de cryptage personnalisé pour NYQ Crypt
// Implémentation d'un algorithme de cryptage symétrique personnalisé
class Y_Q_Crypto {
    constructor(key) {
      // Utiliser un hachage de la clé pour améliorer la sécurité
      this.key = this.expandKey(this.hashKey(key));
      this.originalKey = key; // Conserver la clé originale pour des opérations supplémentaires
    }
  
    // Fonction de hachage simple pour la clé
    hashKey(key) {
      let hash = 0;
      const keyBytes = new TextEncoder().encode(key);
      
      // Mélanger les bytes de la clé
      for (let i = 0; i < keyBytes.length; i++) {
        hash = ((hash << 5) - hash) + keyBytes[i];
        hash = hash & hash; // Conversion en entier 32 bits
      }
      
      // Convertir le hachage en chaîne et le combiner avec la clé originale
      return key + hash.toString(16);
    }
    
    // Fonction pour étendre la clé
    expandKey(key) {
      // Algorithme d'expansion de clé personnalisé avec plus d'entropie
      let expandedKey = [];
      const keyBytes = new TextEncoder().encode(key);
      
      // Création d'une clé dérivée plus longue avec plus de mélange
      for (let i = 0; i < 64; i++) { // Augmentation de la taille de la clé à 64 bytes
        expandedKey[i] = keyBytes[i % keyBytes.length] ^ 
                         ((i * 13) & 0xFF) ^ 
                         ((keyBytes[(i + 3) % keyBytes.length]) << 4) ^
                         ((keyBytes[(i * i + 7) % keyBytes.length]) >> 2);
      }
      
      return expandedKey;
    }
  
    // Fonction de cryptage améliorée
    encrypt(message) {
      const data = new TextEncoder().encode(message);
      const result = new Uint8Array(data.length);
      
      // Ajout d'un vecteur d'initialisation dérivé de la clé
      const iv = this.generateIV();
      let prevByte = iv; // Pour le chaînage des blocs
      
      for (let i = 0; i < data.length; i++) {
        // Application de transformations multiples avec chaînage
        let byte = data[i];
        
        // XOR avec la clé et le byte précédent (chaînage)
        byte = byte ^ this.key[i % this.key.length] ^ prevByte;
        
        // Permutation circulaire (rotation)
        byte = ((byte << 3) | (byte >> 5)) & 0xFF;
        
        // Substitution avec la S-box
        byte = this.substituteValue(byte);
        
        // Seconde permutation avec une rotation différente
        byte = ((byte << 1) | (byte >> 7)) & 0xFF;
        
        // Seconde substitution pour renforcer la diffusion
        byte = this.substituteValue2(byte);
        
        result[i] = byte;
        prevByte = byte; // Stocker pour le chaînage du prochain byte
      }
      
      // Concaténer l'IV au début du message crypté et encoder en Base64
      const withIV = new Uint8Array(1 + result.length);
      withIV[0] = iv;
      withIV.set(result, 1);
      
      return btoa(String.fromCharCode.apply(null, withIV));
    }
  
    // Fonction de décryptage améliorée
    decrypt(encrypted) {
      try {
        const data = new Uint8Array(atob(encrypted).split('').map(c => c.charCodeAt(0)));
        
        // Extraire l'IV
        const iv = data[0];
        const encryptedData = data.slice(1);
        
        const result = new Uint8Array(encryptedData.length);
        let prevByte = iv; // Pour le chaînage des blocs
        
        for (let i = 0; i < encryptedData.length; i++) {
          // Récupérer le byte crypté actuel pour l'utiliser comme prevByte
          const currentEncrypted = encryptedData[i];
          
          // Inverser les transformations dans l'ordre opposé
          let byte = currentEncrypted;
          
          // Inverser la seconde substitution
          byte = this.inverseSubstituteValue2(byte);
          
          // Inverser la seconde permutation
          byte = ((byte >> 1) | (byte << 7)) & 0xFF;
          
          // Inverser la première substitution
          byte = this.inverseSubstituteValue(byte);
          
          // Inverser la première permutation
          byte = ((byte >> 3) | (byte << 5)) & 0xFF;
          
          // Inverser le XOR avec la clé et le byte précédent
          byte = byte ^ this.key[i % this.key.length] ^ prevByte;
          
          result[i] = byte;
          prevByte = currentEncrypted; // Utiliser le byte crypté pour le chaînage suivant
        }
        
        return new TextDecoder().decode(result);
      } catch (error) {
        throw new Error("Erreur de décryptage: clé incorrecte ou format invalide");
      }
    }
    
    // Génération d'un vecteur d'initialisation (IV) basé sur la clé
    generateIV() {
      // Créer un IV à partir de la clé originale
      let iv = 0;
      for (let i = 0; i < this.originalKey.length; i++) {
        iv = (iv + this.originalKey.charCodeAt(i) * 17) & 0xFF;
      }
      return iv;
    }
  
    // Fonction de substitution primaire
    substituteValue(value) {
      // Table de substitution personnalisée plus complexe
      const sBox = new Array(256);
      for (let i = 0; i < 256; i++) {
        sBox[i] = (i * 7 + 5) % 256;
      }
      
      // Appliquer une seconde transformation pour améliorer la non-linéarité
      const result = (sBox[value] ^ 0xAC) & 0xFF;
      return result;
    }
  
    // Fonction de substitution inverse primaire
    inverseSubstituteValue(value) {
      // Inverser la seconde transformation
      const intermediateValue = (value ^ 0xAC) & 0xFF;
      
      // Inverse de la table de substitution
      const invSBox = new Array(256);
      for (let i = 0; i < 256; i++) {
        invSBox[(i * 7 + 5) % 256] = i;
      }
      
      return invSBox[intermediateValue];
    }
    
    // Seconde fonction de substitution pour renforcer la sécurité
    substituteValue2(value) {
      // Seconde table de substitution avec un algorithme différent
      return ((value * 31) ^ (value >> 3) ^ 0x3F) & 0xFF;
    }
    
    // Seconde fonction de substitution inverse
    inverseSubstituteValue2(value) {
      // Rechercher la valeur d'origine par force brute
      // C'est une approche simple mais fonctionnelle pour l'inverse de cette fonction
      for (let i = 0; i < 256; i++) {
        if (this.substituteValue2(i) === value) {
          return i;
        }
      }
      return value; // Fallback (ne devrait jamais arriver)
    }
  }
  
  // Rendre la classe disponible globalement au lieu d'utiliser export
  // pour la compatibilité avec les navigateurs sans bundler
  window.Y_Q_Crypto = Y_Q_Crypto;