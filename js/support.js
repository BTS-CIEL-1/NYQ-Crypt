// Script pour la section support
document.addEventListener('DOMContentLoaded', function() {
    // Gestion du modal de contact
    const modal = document.getElementById('contactModal');
    const openModalBtn = document.getElementById('openContactModal');
    const closeModalBtn = document.querySelector('.close-modal');
    const contactForm = document.getElementById('supportContactForm');
    const successMessage = document.getElementById('contactSuccessMessage');
    
    // Ouvrir le modal
    if (openModalBtn) {
        openModalBtn.addEventListener('click', function() {
            modal.style.display = 'block';
            document.body.style.overflow = 'hidden'; // Empêche le défilement du body
        });
    }
    
    // Fermer le modal
    if (closeModalBtn) {
        closeModalBtn.addEventListener('click', function() {
            modal.style.display = 'none';
            document.body.style.overflow = 'auto'; // Réactive le défilement
        });
    }
    
    // Fermer le modal en cliquant à l'extérieur
    window.addEventListener('click', function(event) {
        if (event.target === modal) {
            modal.style.display = 'none';
            document.body.style.overflow = 'auto';
        }
    });
    
    // Gestion du formulaire de contact
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Simuler l'envoi du formulaire
            const submitBtn = this.querySelector('button[type="submit"]');
            const originalText = submitBtn.textContent;
            
            submitBtn.textContent = 'Envoi en cours...';
            submitBtn.disabled = true;
            
            // Simuler une requête réseau
            setTimeout(() => {
                // Réinitialiser le formulaire
                contactForm.reset();
                
                // Afficher le message de succès
                successMessage.style.display = 'block';
                
                // Rétablir le bouton
                submitBtn.textContent = originalText;
                submitBtn.disabled = false;
                
                // Fermer automatiquement le modal après 3 secondes
                setTimeout(() => {
                    modal.style.display = 'none';
                    document.body.style.overflow = 'auto';
                    // Masquer le message de succès pour la prochaine ouverture
                    setTimeout(() => {
                        successMessage.style.display = 'none';
                    }, 500);
                }, 3000);
            }, 1500);
        });
    }
    
    // Animation des cartes au survol
    const supportCards = document.querySelectorAll('.support-card');
    
    supportCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-5px)';
            this.style.boxShadow = '0 8px 25px rgba(0, 0, 0, 0.3)';
            this.style.borderColor = 'rgba(92, 225, 230, 0.3)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = '';
            this.style.boxShadow = '';
            this.style.borderColor = '';
        });
    });
    
    // Animation au défilement
    function animateOnScroll() {
        const supportSection = document.querySelector('.support-section');
        const supportTop = supportSection.getBoundingClientRect().top;
        const windowHeight = window.innerHeight;
        
        if (supportTop < windowHeight * 0.75) {
            supportSection.classList.add('fade-in');
            
            // Animation séquentielle des cartes
            supportCards.forEach((card, index) => {
                setTimeout(() => {
                    card.classList.add('card-visible');
                }, 100 * (index + 1));
            });
            
            // Arrêter l'observation une fois animé
            window.removeEventListener('scroll', animateOnScroll);
        }
    }
    
    // Ajouter les classes CSS pour l'animation
    document.head.insertAdjacentHTML('beforeend', `
        <style>
            .support-section {
                opacity: 0;
                transform: translateY(20px);
                transition: opacity 0.6s ease, transform 0.6s ease;
            }
            
            .support-section.fade-in {
                opacity: 1;
                transform: translateY(0);
            }
            
            .support-card {
                opacity: 0;
                transform: translateY(15px);
                transition: opacity 0.5s ease, transform 0.5s ease, box-shadow 0.3s ease, border-color 0.3s ease;
            }
            
            .support-card.card-visible {
                opacity: 1;
                transform: translateY(0);
            }
        </style>
    `);
    
    // Activer l'animation au chargement initial et au défilement
    window.addEventListener('scroll', animateOnScroll);
    window.addEventListener('load', animateOnScroll);
    
    // Gestion des liens rapides avec effet ripple
    const quickLinks = document.querySelectorAll('.support-btn');
    
    quickLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            if (!this.querySelector('.ripple')) {
                const ripple = document.createElement('span');
                ripple.classList.add('ripple');
                this.appendChild(ripple);
                
                ripple.style.width = ripple.style.height = Math.max(this.offsetWidth, this.offsetHeight) + 'px';
                const rect = this.getBoundingClientRect();
                ripple.style.left = e.clientX - rect.left - ripple.offsetWidth / 2 + 'px';
                ripple.style.top = e.clientY - rect.top - ripple.offsetHeight / 2 + 'px';
                
                ripple.classList.add('active');
                
                setTimeout(() => {
                    ripple.remove();
                }, 600);
            }
        });
    });
    
    // Ajouter le style pour l'effet ripple
    document.head.insertAdjacentHTML('beforeend', `
        <style>
            .support-btn {
                position: relative;
                overflow: hidden;
            }
            
            .ripple {
                position: absolute;
                background: rgba(255, 255, 255, 0.3);
                border-radius: 50%;
                transform: scale(0);
                animation: ripple 0.6s linear;
                pointer-events: none;
            }
            
            @keyframes ripple {
                to {
                    transform: scale(4);
                    opacity: 0;
                }
            }
        </style>
    `);
});