// Load header and footer components into pages
document.addEventListener('DOMContentLoaded', async function() {
    // Load header if placeholder exists
    const headerPlaceholder = document.getElementById('header-placeholder');
    if (headerPlaceholder) {
        try {
            const response = await fetch('/components/header.html');
            const headerHTML = await response.text();
            headerPlaceholder.innerHTML = headerHTML;
            
            // Re-initialize mobile menu after header loads
            const menuToggle = document.querySelector('.mobile-menu-toggle');
            const mobileMenu = document.querySelector('.mobile-menu');
            
            if (menuToggle && mobileMenu) {
                menuToggle.addEventListener('click', () => {
                    mobileMenu.classList.toggle('open');
                    const isOpen = mobileMenu.classList.contains('open');
                    mobileMenu.setAttribute('aria-expanded', isOpen);
                });
            }
            
            // Handle quiz button
            const quizButtons = document.querySelectorAll('[data-quiz-start]');
            quizButtons.forEach(btn => {
                btn.addEventListener('click', () => {
                    window.location.href = '/pages/dental-health-assessment-quiz.html';
                });
            });
        } catch (error) {
            console.error('Failed to load header:', error);
        }
    }
    
    // Load footer if placeholder exists
    const footerPlaceholder = document.getElementById('footer-placeholder');
    if (footerPlaceholder) {
        try {
            const response = await fetch('/components/footer.html');
            const footerHTML = await response.text();
            footerPlaceholder.innerHTML = footerHTML;
        } catch (error) {
            console.error('Failed to load footer:', error);
        }
    }
});