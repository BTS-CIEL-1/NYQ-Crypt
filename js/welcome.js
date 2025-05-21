

document.addEventListener('DOMContentLoaded', async function () {
  const welcomeMessage = document.querySelector('.section-inner h2');
  const userList = document.getElementById('user-list');

  // Afficher le message de bienvenue
  const firstName = sessionStorage.getItem('userFirstName');
  if (welcomeMessage && firstName) {
    welcomeMessage.textContent = `Welcome ${firstName} !`;
  }

  // Récupérer et afficher la liste des utilisateurs
  try {
    const response = await fetch('/api/users');
    if (!response.ok) throw new Error('Erreur de récupération');

    const users = await response.json();

    users.forEach(user => {
      const li = document.createElement('li');
      li.textContent = `${user.firstName} ${user.lastName} - ${user.email}`;
      userList.appendChild(li);
    });
  } catch (error) {
    console.error('Erreur lors du chargement des utilisateurs :', error);
  }
});
