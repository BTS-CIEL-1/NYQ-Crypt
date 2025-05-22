document.addEventListener('DOMContentLoaded', () => {
    // Récupérer les informations de l'utilisateur du localStorage
    const userInfo = JSON.parse(localStorage.getItem('userInfo'));
    
    if (!userInfo) {
        // Rediriger vers la page de connexion si non connecté
        window.location.href = 'signin.html';
        return;
    }

    // Afficher les informations de l'utilisateur
    document.getElementById('userName').textContent = userInfo.firstName || 'Utilisateur';
    document.getElementById('userEmail').textContent = userInfo.email || '';

    // Gérer la déconnexion
    document.getElementById('logout').addEventListener('click', (e) => {
        e.preventDefault();
        localStorage.removeItem('userInfo');
        window.location.href = 'index.html';
    });
});