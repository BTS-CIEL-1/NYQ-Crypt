const btn = document.getElementById('menu-btn');
const overlay = document.getElementById('overlay');
const menu = document.getElementById('mobile-menu');
const counters = document.querySelectorAll('.counter');
let scrollStarted = false;

btn.addEventListener('click', navToggle);
document.addEventListener('scroll', scrollPage);

function navToggle() {
  btn.classList.toggle('open');
  overlay.classList.toggle('overlay-show');
  document.body.classList.toggle('stop-scrolling');
  menu.classList.toggle('show-menu');
}

function scrollPage() {
  const scrollPos = window.scrollY;

  if (scrollPos > 100 && !scrollStarted) {
    countUp();
    scrollStarted = true;
  } else if (scrollPos < 100 && scrollStarted) {
    reset();
    scrollStarted = false;
  }
}

function countUp() {
  counters.forEach((counter) => {
    counter.innerText = '0';

    const updateCounter = () => {
      // Get count target
      const target = +counter.getAttribute('data-target');
      // Get current counter value
      const c = +counter.innerText;

      // Create an increment
      const increment = target / 100;

      // If counter is less than target, add increment
      if (c < target) {
        // Round up and set counter value
        counter.innerText = `${Math.ceil(c + increment)}`;

        setTimeout(updateCounter, 75);
      } else {
        counter.innerText = target;
      }
    };

    updateCounter();
  });
}

function reset() {
  counters.forEach((counter) => (counter.innerHTML = '0'));
}

/**************************************************************************FORMULAIRE***************************************************************************************/

function verifierFormulaire() {
  let passwordInput = document.getElementById('password');
  let smallElement = document.querySelector('.form-group small');
  let nameInput = document.getElementById('name');
  let firstNameInput = document.getElementById('firstName');
  let emailInput = document.getElementById('email');
  let messageInput = document.getElementById('message');
  let checkboxId = 'formCheck-1';
  let isChecked = isCheckboxChecked(checkboxId);
  let formIsValid = true;

  if (passwordInput.value.length < 8) {
    passwordInput.classList.add('erreur');
    passwordInput.classList.remove('valide');
    smallElement.classList.remove('invisible');
    formIsValid = false;
  } else {
    passwordInput.classList.remove('erreur');
    passwordInput.classList.add('valide');
    smallElement.classList.add('invisible');
  }

  if (nameInput.value.length < 1) {
    nameInput.classList.add('erreur');
    nameInput.classList.remove('valide');
    formIsValid = false;
  } else {
    nameInput.classList.remove('erreur');
    nameInput.classList.add('valide');
  }

  if (firstNameInput.value.length < 1) {
    firstNameInput.classList.add('erreur');
    firstNameInput.classList.remove('valide');
    formIsValid = false;
  } else {
    firstNameInput.classList.remove('erreur');
    firstNameInput.classList.add('valide');
  }

  if (!validateEmail(emailInput.value)) {
    emailInput.classList.add('erreur');
    emailInput.classList.remove('valide');
    formIsValid = false;
  } else {
    emailInput.classList.remove('erreur');
    emailInput.classList.add('valide');
  }

  if (messageInput.value.length < 1) {
    messageInput.classList.add('erreur');
    messageInput.classList.remove('valide');
    formIsValid = false;
  } else {
    messageInput.classList.remove('erreur');
    messageInput.classList.add('valide');
  }

  if (isChecked) {
    setCheckboxLabelColor(checkboxId, 'text-success');
  } else {
    setCheckboxLabelColor(checkboxId, 'text-danger');
    formIsValid = false;
  }

  if (!formIsValid) {
    event.preventDefault();
    afficherErreur('Veuillez remplir tous les champs.');
  }
}

function validateEmail(email) {
  const re = /\S+@\S+\.\S+/;
  return re.test(email);
}

function setCheckboxLabelColor(checkboxId, colorClass) {
  const formCheckLabel = document.querySelector('label[for=' + checkboxId + ']');

  if (formCheckLabel) {
    formCheckLabel.className = colorClass;
  }
}

function isCheckboxChecked(checkboxId) {
  const checkbox = document.getElementById(checkboxId);

  if (checkbox && checkbox.checked) {
    return true;
  } else {
    return false;
  }
}


async function verifierFormulaire2(event) {
  event.preventDefault();
  let formIsValid = true;

  const passwordInput = document.getElementById('password');
  const smallElement = document.querySelector('.form-group small');
  const emailInput = document.getElementById('email');

  if (passwordInput.value.length < 8) {
    setErreur(passwordInput, smallElement);
    formIsValid = false;
  } else {
    setValide(passwordInput, smallElement);
  }

  if (!validateEmail(emailInput.value)) {
    setErreur(emailInput);
    formIsValid = false;
  } else {
    setValide(emailInput);
  }

  if (!formIsValid) {
    afficherErreur('Veuillez remplir tous les champs.');
    return;
  }
  try {
    const response = await fetch('/signin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: emailInput.value,
        password: passwordInput.value,
      }),
    });

    if (!response.ok) {
      afficherErreur('Identifiants incorrects.');
      return;
    }
    window.location.href = "connexion-réussie.html";
  } catch (error) {
    afficherErreur('Erreur réseau ou serveur.');
  }
}

