// app.js - Script principal pour NYQ Crypt
document.addEventListener('DOMContentLoaded', function() {
    // Importation du module de cryptage
    // Comme l'import ES6 peut ne pas fonctionner directement dans un navigateur sans bundler,
    // nous allons supposer que Y_Q_Crypto est disponible globalement via script.js

    // Éléments du DOM
    const keyInput = document.getElementById('keyInput');
    const fileInput = document.getElementById('fileInput');
    const fileName = document.getElementById('fileName');
    const textInput = document.getElementById('textInput');
    const encryptBtn = document.getElementById('encryptBtn');
    const decryptBtn = document.getElementById('decryptBtn');
    const clearBtn = document.getElementById('clearBtn');
    const downloadBtn = document.getElementById('downloadBtn');
    const result = document.getElementById('result');
    const resultContent = document.getElementById('resultContent');
    const keyStrengthBar = document.getElementById('keyStrengthBar');
    const keyStrengthText = document.getElementById('keyStrengthText');
    const binaryModeCheckbox = document.getElementById('binaryMode');

    // Variables pour stocker le contenu crypté/décrypté
    let processedContent = '';
    let originalFileName = '';
    let isBinaryFile = false;
    let fileContent = null;

    // Fonction pour évaluer la force de la clé
    function evaluateKeyStrength(key) {
        if (!key) {
            keyStrengthBar.className = 'key-strength-bar';
            keyStrengthText.textContent = 'Force de la clé';
            return;
        }
        
        // Critères simples pour évaluer la force
        const length = key.length;
        const hasUpperCase = /[A-Z]/.test(key);
        const hasLowerCase = /[a-z]/.test(key);
        const hasNumbers = /[0-9]/.test(key);
        const hasSpecialChars = /[^A-Za-z0-9]/.test(key);
        
        const score = (length >= 8 ? 1 : 0) + 
                      (length >= 12 ? 1 : 0) + 
                      (hasUpperCase ? 1 : 0) + 
                      (hasLowerCase ? 1 : 0) + 
                      (hasNumbers ? 1 : 0) + 
                      (hasSpecialChars ? 1 : 0);
        
        if (score <= 2) {
            keyStrengthBar.className = 'key-strength-bar weak';
            keyStrengthText.textContent = 'Faible';
            keyStrengthText.style.color = '#e74c3c';
        } else if (score <= 4) {
            keyStrengthBar.className = 'key-strength-bar medium';
            keyStrengthText.textContent = 'Moyenne';
            keyStrengthText.style.color = '#f39c12';
        } else {
            keyStrengthBar.className = 'key-strength-bar strong';
            keyStrengthText.textContent = 'Forte';
            keyStrengthText.style.color = '#2ecc71';
        }
    }
    
    // Événement pour évaluer la force de la clé lors de la saisie
    keyInput.addEventListener('input', function() {
        evaluateKeyStrength(this.value);
    });

fileInput.addEventListener('change', function(event) {
    const file = event.target.files[0];

    if (file) {
        originalFileName = file.name;
        fileName.textContent = file.name;
        isBinaryFile = binaryModeCheckbox.checked;

        const reader = new FileReader();

        reader.onload = function(e) {
            fileContent = e.target.result;

            if (!isBinaryFile) {
                textInput.value = e.target.result;
            } else {
                textInput.value = '';
                textInput.readOnly = true;
            }
        };

        if (isBinaryFile) {
            reader.readAsArrayBuffer(file);
        } else {
            reader.readAsText(file);
        }
    } else {
        fileName.textContent = 'Aucun fichier sélectionné';
    }
});


    // Fonction pour crypter des données binaires
    function encryptBinaryData(data, crypto) {
        // Convertir les données binaires en une chaîne de caractères pour le cryptage
        const chunks = [];
        const chunkSize = 1024; // Taille de fragment pour éviter les problèmes de mémoire
        
        // Ajouter les métadonnées de taille en début de fichier pour faciliter le décryptage
        const sizeBuffer = new Uint32Array([data.length]);
        const header = new Uint8Array(sizeBuffer.buffer);
        
        // Créer un tableau qui contient l'en-tête et les données
        const combinedData = new Uint8Array(header.length + data.length);
        combinedData.set(header);
        combinedData.set(data, header.length);
        
        // Crypter par morceaux
        for (let i = 0; i < combinedData.length; i += chunkSize) {
            const chunk = combinedData.slice(i, Math.min(i + chunkSize, combinedData.length));
            const chunkStr = Array.from(chunk).map(byte => String.fromCharCode(byte)).join('');
            chunks.push(crypto.encrypt(chunkStr));
        }
        
        // Retourner tous les fragments encodés, séparés par un délimiteur spécial
        return chunks.join('|NYQ_DELIMITER|');
    }
    
    // Fonction pour décrypter des données binaires
    function decryptBinaryData(data, crypto) {
        try {
            // Convertir les données en chaîne pour le traitement
            const dataStr = new TextDecoder().decode(data);
            
            if (!dataStr.includes('|NYQ_DELIMITER|')) {
                throw new Error('Format de fichier crypté non reconnu');
            }
            
            // Décrypter chaque fragment
            const encryptedChunks = dataStr.split('|NYQ_DELIMITER|');
            let decryptedData = [];
            
            for (const chunk of encryptedChunks) {
                if (!chunk) continue; // Ignorer les fragments vides
                
                const decryptedStr = crypto.decrypt(chunk);
                const decryptedBytes = Array.from(decryptedStr).map(char => char.charCodeAt(0));
                decryptedData.push(...decryptedBytes);
            }
            
            // Extraire l'en-tête pour obtenir la taille originale
            const sizeBytes = decryptedData.slice(0, 4);
            const dataSize = new Uint32Array(new Uint8Array(sizeBytes).buffer)[0];
            
            // Extraire les données réelles (en ignorant l'en-tête)
            const actualData = decryptedData.slice(4, 4 + dataSize);
            
            return new Uint8Array(actualData);
        } catch (error) {
            console.error('Erreur lors du décryptage binaire:', error);
            throw error;
        }
    }
    
    // Fonction pour vérifier si la clé est valide
    function validateKey() {
        if (!keyInput.value.trim()) {
            alert('Veuillez entrer une clé de cryptage.');
            return false;
        }
        return true;
    }

    // Fonction pour vérifier si le texte est valide
    function validateText() {
        if (!textInput.value.trim() && !isBinaryFile) {
            alert('Veuillez entrer un texte à crypter/décrypter ou sélectionner un fichier.');
            return false;
        }
        return true;
    }

    // Événement de cryptage
    encryptBtn.addEventListener('click', function() {
        if (!validateKey()) return;
        
        try {
            // Créer une nouvelle instance de Y_Q_Crypto avec la clé fournie
            const crypto = new Y_Q_Crypto(keyInput.value);
            
            if (isBinaryFile && fileContent) {
                // Cryptage de fichier binaire
                const encryptedData = encryptBinaryData(new Uint8Array(fileContent), crypto);
                processedContent = encryptedData;
                
                // Afficher le résultat
                resultContent.textContent = "[Fichier binaire crypté - Cliquez sur Télécharger pour enregistrer]";
                result.style.display = 'block';
            } else {
                // Cryptage de texte
                if (!validateText()) return;
                
                processedContent = crypto.encrypt(textInput.value);
                
                // Afficher le résultat
                resultContent.textContent = processedContent;
                result.style.display = 'block';
            }
        } catch (error) {
            alert('Erreur lors du cryptage : ' + error.message);
        }
    });

    // Événement de décryptage
    decryptBtn.addEventListener('click', function() {
        if (!validateKey()) return;
        
        try {
            // Créer une nouvelle instance de Y_Q_Crypto avec la clé fournie
            const crypto = new Y_Q_Crypto(keyInput.value);
            
            if (isBinaryFile && fileContent) {
                // Décryptage de fichier binaire
                try {
                    const decryptedData = decryptBinaryData(new Uint8Array(fileContent), crypto);
                    processedContent = decryptedData;
                    
                    // Afficher le résultat
                    resultContent.textContent = "[Fichier binaire décrypté - Cliquez sur Télécharger pour enregistrer]";
                    result.style.display = 'block';
                } catch (e) {
                    alert('Erreur lors du décryptage du fichier binaire. Clé incorrecte ou fichier corrompu.');
                }
            } else {
                // Décryptage de texte
                if (!validateText()) return;
                
                // Vérifier si le texte est en format Base64 (probable texte crypté)
                const base64Regex = /^[A-Za-z0-9+/=]+$/;
                if (!base64Regex.test(textInput.value.trim())) {
                    alert('Le texte ne semble pas être au format crypté. Veuillez vérifier.');
                    return;
                }
                
                processedContent = crypto.decrypt(textInput.value);
                
                // Afficher le résultat
                resultContent.textContent = processedContent;
                result.style.display = 'block';
            }
        } catch (error) {
            alert('Erreur lors du décryptage : Clé incorrecte ou format invalide.');
        }
    });

    // Événement d'effacement
    clearBtn.addEventListener('click', function() {
        keyInput.value = '';
        textInput.value = '';
        fileName.textContent = 'Aucun fichier sélectionné';
        fileInput.value = '';
        result.style.display = 'none';
        processedContent = '';
        fileContent = null;
        originalFileName = '';
        isBinaryFile = false;
        textInput.readOnly = false;
        evaluateKeyStrength('');
    });

    // Événement de téléchargement
    downloadBtn.addEventListener('click', function() {
        if (!processedContent) {
            alert('Aucun contenu à télécharger. Veuillez d\'abord crypter ou décrypter un texte.');
            return;
        }
        
        let blob;
        let filename;
        
        if (typeof processedContent === 'string') {
            // Contenu textuel
            blob = new Blob([processedContent], { type: 'text/plain' });
            
            if (originalFileName) {
                const extension = originalFileName.substring(originalFileName.lastIndexOf('.'));
                const baseName = originalFileName.substring(0, originalFileName.lastIndexOf('.'));
                
                if (resultContent.textContent.startsWith('[Fichier binaire')) {
                    // C'était un fichier binaire
                    filename = baseName + '_NYQ' + extension;
                } else {
                    // C'était un fichier texte
                    filename = baseName + '_NYQ.txt';
                }
            } else {
                filename = 'NYQ_Crypt_file.txt';
            }
        } else {
            // Contenu binaire (ArrayBuffer ou Uint8Array)
            blob = new Blob([processedContent], { type: 'application/octet-stream' });
            
            if (originalFileName) {
                const extension = originalFileName.substring(originalFileName.lastIndexOf('.'));
                const baseName = originalFileName.substring(0, originalFileName.lastIndexOf('.'));
                filename = baseName + '_NYQ' + extension;
            } else {
                filename = 'NYQ_Crypt_file.bin';
            }
        }
        
        const url = URL.createObjectURL(blob);
        
        // Créer un lien de téléchargement et cliquer dessus
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    });
});