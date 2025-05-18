

/*************************************************************************
*   Chargement des modules nécessaires au fonctionnement du serveur      *
*                et Configuration du serveur express                     *                                                                                                 *
**************************************************************************/

// Chargement des modules nécessaires au fonctionnement du serveur

const express = require('express');
const cors = require('cors');
const crypto = require('crypto');
const path = require('path');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');
require('dotenv').config();
const app = express();

app.use(express.static('.'));
app.use(bodyParser.json());
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());

// Définir la route http://127.0.0.1:3000/ pour index.html
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Le serveur Express écoute sur le port 3000
app.listen(3000, () => {
  console.log('Le serveur est en écoute sur le port 3000');
});




/*********************************************************************
*  --Todo 1--   Connexion à la base de données MongoDB (SpaceX)      *                                                                                             
*                                                                    *      ---commit -m "Todo 1"---
* Document ressource:   https://mongoosejs.com/docs/connections.html *                                                                                                                                           
**********************************************************************/

// Connexion à la base de données
mongoose.connect('mongodb+srv://quentinvarma:sYv5dGJiBpOCGtxU@cluster0.nsqo5dz.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0',)



  /********************************************************************************
  *  --Todo 2--      Vérification de la connexion à la base de données SpaceX     *                                                                                         
  *                                                                               *       ---commit -m "Todo 2"---
  * Document ressource:   https://youtu.be/V8dYGNfHjfk?si=1TEKPUPoA8ayLmEs        *                                                                                                                                           
  *********************************************************************************/

  // Vérification de la connexion à la base de données
  .then(() => {
    console.log("Connexion réussie à MongoDB Atlas");
  })
  .catch(err => {
    console.error("Erreur de connexion à MongoDB :", err);
  });

/********************************************************************************
*  --Todo 3--      Création du modèle schema pour la collection users           *
*********************************************************************************/

// Création du modèle schema pour la collection users
const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true }, // Email unique
  password: { type: String, required: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  message: { type: String }
});

// Création du modèle mongoose pour l'interaction avec la base de données
const User = mongoose.model('User', userSchema, 'users');


/*********************************************************************
*  Configuration du transporteur de mail pour l'envoi d'emails       *
*********************************************************************/

// Configurer le transporteur de mail
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER || 'quentin.varma@lycee-jeanrostand.fr', // Utilisez les variables d'environnement
    pass: process.env.EMAIL_PASS || 'gfjbfbplidvffrxt'     // ou remplacez par vos identifiants
  }
});


/*****************************************************************************************************************************
*  --Todo 4--      Création d'une route HTTP avec la méthode "POST" pour récupérer les données du formulaire d'inscription   *
******************************************************************************************************************************/

// Définition de l'itinéraire d'inscription et chargement de données à partir du formulaire d'inscription
app.post('/signup', async (req, res) => {
  const { lastName, firstName, email, password, message } = req.body;
  console.log("Données reçues : ", req.body);

  // Vérification des champs requis
  if (!lastName || !firstName || !email || !password || !message) {
    return res.status(400).send("Tous les champs doivent être remplis.");
  }
  console.log("Tous les champs requis ont été vérifiés.");

  // Vérification si l'email existe déjà
  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).send("Cet email est déjà utilisé.");
    }
    const hashedPassword = await bcrypt.hash(password, 10);

    // Création d'un nouvel utilisateur
    const newUser = new User({
      email: email,
      password: hashedPassword,
      firstName: firstName,
      lastName: lastName,
      message: message
    });
    console.log("Nouvel utilisateur créé :", newUser);

    // Sauvegarde dans la base de données
    await newUser.save();
    console.log("Utilisateur enregistré avec succès dans la base de données.");


    // Envoi d'un e-mail de confirmation
    const mailOptions = {
      from: 'quentin.varma@lycee-jeanrostand.fr',
      to: email,
      subject: 'Confirmation d\'inscription',
      text: `Bonjour ${firstName},\n\n Vous êtes bien inscrit !\n\n Cordialement,\n L'équipe NYQ-Crypt`
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error("Erreur lors de l'envoi de l'email :", error);
      } else {
        console.log("Email de confirmation envoyé :", info.response);
      }
    });




    // Redirection en cas de succès
    console.log("Inscription réussie pour :", email);
    res.redirect("/inscription-réussie.html");
  } catch (error) {
    console.error("Erreur lors de l'inscription :", error);
    return res.status(500).send("Erreur interne du serveur.");
  }
});

/********************************************************************************************************************
*  --Todo 5--  Création d'une route HTTP avec la méthode "POST" pour vérifier les données du formulaire de connexion*
*********************************************************************************************************************/

app.post("/signin", async (req, res) => {
  console.log("Tentative de connexion");
  const { email, password } = req.body;

  // Vérification des champs requis
  if (!email || !password) {
    console.log('Erreur : champs requis non remplis');
    return res.status(400).send("Tous les champs doivent être remplis.");
  }

  try {
    console.log('Recherche de l\'utilisateur par email');
    const user = await User.findOne({ email });
    if (!user) {
      console.log('Erreur : utilisateur non trouvé');
      return res.status(400).send("Utilisateur non trouvé.");
    }

    console.log('Comparaison des mots de passe');
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.log('Erreur : mot de passe incorrect');
      return res.status(400).send("Mot de passe incorrect");
    }

    console.log('Connexion réussie');
    res.json({ firstName: user.firstName });

  } catch (error) {
    console.error("Erreur lors de la connexion :", error);
    return res.status(500).send("Erreur interne du serveur.");
  }
});

const algorithm = 'aes-256-cbc';
const ivLength = 16;

function deriveKey(password) {
  return crypto.createHash('sha256').update(password).digest(); // 32 bytes
}

function generateIV() {
  return crypto.randomBytes(ivLength);
}

function encryptText(text, password) {
  const key = deriveKey(password);
  const iv = generateIV();

  const cipher = crypto.createCipheriv(algorithm, key, iv);
  let encrypted = cipher.update(text, 'utf8', 'base64');
  encrypted += cipher.final('base64');

  return `${iv.toString('base64')}:${encrypted}`;
}

function decryptText(encryptedData, password) {
  const key = deriveKey(password);
  const [ivBase64, encrypted] = encryptedData.split(':');

  if (!ivBase64 || !encrypted) {
    throw new Error('Format invalide. IV manquant.');
  }

  const iv = Buffer.from(ivBase64, 'base64');

  try {
    const decipher = crypto.createDecipheriv(algorithm, key, iv);
    let decrypted = decipher.update(encrypted, 'base64', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  } catch (err) {
    // ici on intercepte l'erreur fatale
    if (err.message.includes('bad decrypt')) {
      throw new Error('Clé incorrecte ou données corrompues.');
    }
    throw err; // relancer les autres erreurs normales
  }
}

app.post('/api/crypto', (req, res) => {
  const { action, key, text } = req.body;

  if (!key || !text) {
    return res.status(400).json({ success: false, error: 'Clé ou texte manquant.' });
  }

  try {
    let result;

    if (action === 'encrypt') {
      result = encryptText(text, key);
    } else if (action === 'decrypt') {
      result = decryptText(text, key);
    } else {
      return res.status(400).json({ success: false, error: 'Action invalide.' });
    }

    res.json({ success: true, result });
  } catch (error) {
    console.error('Erreur de chiffrement/déchiffrement :', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});