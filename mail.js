const mongoose = require('mongoose');
const nodemailer = require('nodemailer');
require('dotenv').config();

// 1. Connexion à la base MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => console.log("Connecté à MongoDB"))
  .catch(err => console.error("Erreur MongoDB:", err));

// 2. Schéma utilisateur (doit être identique à celui que tu utilises dans app.js)
const userSchema = new mongoose.Schema({
  email: String,
  firstName: String
});

const User = mongoose.model('User', userSchema);

// 3. Configuration de Nodemailer
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// 4. Fonction pour envoyer le mail
async function sendMailToAllUsers() {
  try {
    const users = await User.find({});

    for (const user of users) {
      const mailOptions = {
        from: 'CyberBot@NYQ-Crypt.fr',
        to: user.email,
        subject: 'Annonce importante de NYQ-Crypt',
        text: `Bonjour ${user.firstName || 'utilisateur'},\n\nNous avons une mise à jour importante pour vous !\n\nCordialement,\nL'équipe NYQ-Crypt`
      };

      await transporter.sendMail(mailOptions);
      console.log(`Mail envoyé à ${user.email}`);
    }
  } catch (error) {
    console.error("Erreur lors de l'envoi des mails:", error);
  } finally {
    mongoose.disconnect();
  }
}

// Lancer la fonction
sendMailToAllUsers();