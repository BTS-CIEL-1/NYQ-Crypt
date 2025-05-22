// Fonction de validation de l'email
function validateEmail(email) {
    const re = /\S+@\S+\.\S+/;
    return re.test(email);
}

// Fonction de gestion du formulaire de connexion
async function verifierFormulaire2(event) {
    event.preventDefault();

    const passwordInput = document.getElementById('password');
    const emailInput = document.getElementById('email');
    const smallElement = document.querySelector('.form-group small');
    let formIsValid = true;

    // Vérification du mot de passe
    if (passwordInput.value.length < 8) {
        passwordInput.classList.add('erreur');
        passwordInput.classList.remove('valide');
        if (smallElement) smallElement.classList.remove('invisible');
        formIsValid = false;
    } else {
        passwordInput.classList.remove('erreur');
        passwordInput.classList.add('valide');
        if (smallElement) smallElement.classList.add('invisible');
    }

    // Vérification de l'email
    if (!validateEmail(emailInput.value)) {
        emailInput.classList.add('erreur');
        emailInput.classList.remove('valide');
        formIsValid = false;
    } else {
        emailInput.classList.remove('erreur');
        emailInput.classList.add('valide');
    }

    if (!formIsValid) {
        afficherErreur('Veuillez remplir tous les champs correctement.');
        return;
    }

    // Envoi au serveur
    try {
        const response = await fetch('/signin', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: emailInput.value,
                password: passwordInput.value
            })
        });

        if (!response.ok) {
            afficherErreur('Identifiants incorrects.');
            return;
        }

        const data = await response.json();

        // Sauvegarder les informations de l'utilisateur
        localStorage.setItem('userInfo', JSON.stringify(data));
        
        // Stocker le prénom dans sessionStorage
        sessionStorage.setItem('userFirstName', data.firstName);

        // Redirection vers le dashboard
        window.location.href = 'dashboard.html';

    } catch (error) {
        console.error('Erreur:', error);
        afficherErreur('Erreur réseau ou serveur.');
    }
}

// Amélioration de l'affichage d'erreur
function afficherErreur(message) {
    const errorDiv = document.getElementById('error-message');
    if (errorDiv) {
        errorDiv.textContent = message;
        errorDiv.style.display = 'block';
    } else {
        alert(message);
    }
}

// Initialisation des écouteurs d'événements
document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('login-form');
    if (form) {
        form.addEventListener('submit', verifierFormulaire2);
    }
});

// Pour connecter la fonction au formulaire automatiquement
document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('login-form');
  if (form) {
    form.addEventListener('submit', verifierFormulaire2);
  }
});
