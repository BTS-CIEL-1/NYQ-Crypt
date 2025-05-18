// Configuration de l'API
const API_URL = "/api/crypto";

// Variables pour gérer les données binaires
let binaryData = null;
let isBinaryMode = false;

document.addEventListener('DOMContentLoaded', () => {
    // Éléments DOM
    const keyInput = document.getElementById('keyInput');
    const textInput = document.getElementById('textInput');
    const fileInput = document.getElementById('fileInput');
    const fileName = document.getElementById('fileName');
    const binaryModeCheckbox = document.getElementById('binaryMode');
    const encryptBtn = document.getElementById('encryptBtn');
    const decryptBtn = document.getElementById('decryptBtn');
    const clearBtn = document.getElementById('clearBtn');
    const downloadBtn = document.getElementById('downloadBtn');
    const resultDiv = document.getElementById('result');
    const resultContent = document.getElementById('resultContent');
    const keyStrengthBar = document.getElementById('keyStrengthBar');
    const keyStrengthText = document.getElementById('keyStrengthText');

    // Gestionnaire pour la sélection de fichier
    fileInput.addEventListener('change', function(e) {
        if (this.files.length > 0) {
            const file = this.files[0];
            fileName.textContent = file.name;
            
            // Vérifier si le mode binaire est activé
            if (binaryModeCheckbox.checked) {
                // Lire le fichier comme un tableau d'octets
                const reader = new FileReader();
                reader.onload = function(e) {
                    binaryData = e.target.result;
                    textInput.value = `[Fichier binaire chargé - ${file.size} octets]`;
                    isBinaryMode = true;
                };
                reader.readAsArrayBuffer(file);
            } else {
                // Lire le fichier comme du texte
                const reader = new FileReader();
                reader.onload = function(e) {
                    textInput.value = e.target.result;
                    binaryData = null;
                    isBinaryMode = false;
                };
                reader.readAsText(file);
            }
        }
    });

    // Gestionnaire pour le mode binaire
    binaryModeCheckbox.addEventListener('change', function() {
        if (fileInput.files.length > 0) {
            // Recharger le fichier avec le nouveau mode
            fileInput.dispatchEvent(new Event('change'));
        }
        isBinaryMode = this.checked;
    });

    // Fonction pour convertir ArrayBuffer en Base64
    function arrayBufferToBase64(buffer) {
        let binary = '';
        const bytes = new Uint8Array(buffer);
        const len = bytes.byteLength;
        for (let i = 0; i < len; i++) {
            binary += String.fromCharCode(bytes[i]);
        }
        return window.btoa(binary);
    }

    // Fonction pour convertir Base64 en ArrayBuffer
    function base64ToArrayBuffer(base64) {
        const binaryString = window.atob(base64);
        const len = binaryString.length;
        const bytes = new Uint8Array(len);
        for (let i = 0; i < len; i++) {
            bytes[i] = binaryString.charCodeAt(i);
        }
        return bytes.buffer;
    }

    // Fonction pour évaluer la force de la clé
    async function evaluateKeyStrength() {
        try {
            const key = keyInput.value;
            
            // Si la clé est vide, réinitialiser la barre
            if (!key) {
                keyStrengthBar.style.width = '0%';
                keyStrengthBar.className = 'key-strength-bar';
                keyStrengthText.textContent = 'Force de la clé';
                return;
            }
            
            // Appeler l'API pour évaluer la clé
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    action: 'evaluateKey',
                    key: key
                })
            });
            
            const data = await response.json();
            
            if (data.success) {
                const strength = data.strength;
                
                // Mettre à jour la barre de force
                keyStrengthBar.style.width = `${strength}%`;
                
                // Mettre à jour la couleur et le texte en fonction de la force
                if (strength < 30) {
                    keyStrengthBar.className = 'key-strength-bar weak';
                    keyStrengthText.textContent = 'Faible';
                } else if (strength < 70) {
                    keyStrengthBar.className = 'key-strength-bar medium';
                    keyStrengthText.textContent = 'Moyenne';
                } else {
                    keyStrengthBar.className = 'key-strength-bar strong';
                    keyStrengthText.textContent = 'Forte';
                }
            }
        } catch (error) {
            console.error('Erreur lors de l\'évaluation de la clé:', error);
        }
    }

    // Surveiller les changements dans la clé
    keyInput.addEventListener('input', evaluateKeyStrength);

    // Fonction pour le chiffrement
    async function encrypt() {
        try {
            const key = keyInput.value;
            
            if (!key) {
                alert('Veuillez entrer une clé de cryptage.');
                return;
            }
            
            if (isBinaryMode && binaryData) {
                // Chiffrer des données binaires
                const base64Data = arrayBufferToBase64(binaryData);
                
                const response = await fetch(API_URL, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        action: 'encrypt',
                        key: key,
                        data: base64Data,
                        isBinary: true
                    })
                });
                
                const data = await response.json();
                
                if (data.success) {
                    // Stocker le résultat
                    binaryData = base64ToArrayBuffer(data.result);
                    textInput.value = `[Données binaires cryptées - ${new Uint8Array(binaryData).length} octets]`;
                    
                    // Afficher un message de succès
                    showResult('Cryptage réussi ! Les données binaires ont été cryptées.');
                } else {
                    showResult(`Erreur: ${data.error}`, true);
                }
            } else {
                // Chiffrer du texte
                const text = textInput.value;
                
                if (!text) {
                    alert('Veuillez entrer du texte à crypter.');
                    return;
                }
                
                const response = await fetch(API_URL, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        action: 'encrypt',
                        key: key,
                        text: text,
                        isBinary: false
                    })
                });
                
                const data = await response.json();
                
                if (data.success) {
                    textInput.value = data.result;
                    showResult('Cryptage réussi !');
                } else {
                    showResult(`Erreur: ${data.error}`, true);
                }
            }
        } catch (error) {
            console.error('Erreur lors du cryptage:', error);
            showResult('Erreur lors du cryptage. Vérifiez la console pour plus de détails.', true);
        }
    }

    // Fonction pour le déchiffrement
    async function decrypt() {
        try {
            const key = keyInput.value;
            
            if (!key) {
                alert('Veuillez entrer une clé de cryptage.');
                return;
            }
            
            if (isBinaryMode && binaryData) {
                // Déchiffrer des données binaires
                const base64Data = arrayBufferToBase64(binaryData);
                
                const response = await fetch(API_URL, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        action: 'decrypt',
                        key: key,
                        data: base64Data,
                        isBinary: true
                    })
                });
                
                const data = await response.json();
                
                if (data.success) {
                    // Stocker le résultat
                    binaryData = base64ToArrayBuffer(data.result);
                    textInput.value = `[Données binaires décryptées - ${new Uint8Array(binaryData).length} octets]`;
                    
                    // Afficher un message de succès
                    showResult('Décryptage réussi ! Les données binaires ont été décryptées.');
                } else {
                    showResult(`Erreur: ${data.error}`, true);
                }
            } else {
                // Déchiffrer du texte
                const text = textInput.value;
                
                if (!text) {
                    alert('Veuillez entrer du texte à décrypter.');
                    return;
                }
                
                const response = await fetch(API_URL, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        action: 'decrypt',
                        key: key,
                        text: text,
                        isBinary: false
                    })
                });
                
                const data = await response.json();
                
                if (data.success) {
                    textInput.value = data.result;
                    showResult('Décryptage réussi !');
                } else {
                    showResult(`Erreur: ${data.error}`, true);
                }
            }
        } catch (error) {
            console.error('Erreur lors du décryptage:', error);
            showResult('Erreur lors du décryptage. Vérifiez la console pour plus de détails.', true);
        }
    }

    // Fonction pour effacer les champs
    function clearFields() {
        keyInput.value = '';
        textInput.value = '';
        fileName.textContent = 'Aucun fichier sélectionné';
        fileInput.value = '';
        binaryData = null;
        isBinaryMode = false;
        binaryModeCheckbox.checked = false;
        resultDiv.style.display = 'none';
        keyStrengthBar.style.width = '0%';
        keyStrengthBar.className = 'key-strength-bar';
        keyStrengthText.textContent = 'Force de la clé';
    }

    // Fonction pour télécharger le résultat
    function downloadResult() {
        if (isBinaryMode && binaryData) {
            // Télécharger les données binaires
            const blob = new Blob([new Uint8Array(binaryData)], { type: 'application/octet-stream' });
            const url = URL.createObjectURL(blob);
            
            const a = document.createElement('a');
            a.href = url;
            a.download = 'donnees_traitees.bin';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        } else {
            // Télécharger le texte
            const text = textInput.value;
            const blob = new Blob([text], { type: 'text/plain' });
            const url = URL.createObjectURL(blob);
            
            const a = document.createElement('a');
            a.href = url;
            a.download = 'texte_traite.txt';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }
    }

    // Fonction pour afficher un résultat
    function showResult(message, isError = false) {
        resultContent.textContent = message;
        resultContent.className = isError ? 'error' : 'success';
        resultDiv.style.display = 'block';
        
        // Masquer après 5 secondes
        setTimeout(() => {
            resultDiv.style.display = 'none';
        }, 5000);
    }

    // Ajouter les gestionnaires d'événements
    encryptBtn.addEventListener('click', encrypt);
    decryptBtn.addEventListener('click', decrypt);
    clearBtn.addEventListener('click', clearFields);
    downloadBtn.addEventListener('click', downloadResult);

    // Vérifier la connexion au serveur
    async function checkServerConnection() {
        try {
            const response = await fetch(API_URL, {
                method: 'OPTIONS'
            });
            
            if (response.ok) {
                console.log('Connecté au serveur de cryptage.');
            } else {
                console.warn('Connexion au serveur établie mais avec un statut non-OK:', response.status);
            }
        } catch (error) {
            console.error('Impossible de se connecter au serveur de cryptage:', error);
            alert('Le serveur de cryptage n\'est pas accessible. Veuillez vérifier que le programme backend est en cours d\'exécution sur le port 3000.');
        }
    }
});
