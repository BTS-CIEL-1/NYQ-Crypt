document.addEventListener('DOMContentLoaded', function () {
    const welcomeMessage = document.querySelector('.section-inner h2');
    if (welcomeMessage) {
      const firstName = sessionStorage.getItem('userFirstName');
      
      if (firstName ) {
        welcomeMessage.textContent = `Welcome ${firstName} !`;
      }
    }
  });
  