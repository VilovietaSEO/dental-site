/**
 * Navigation Fixes for Dental Website
 * Fixes broken links, anchors, and navigation functionality
 */

(function() {
  'use strict';

  // Navigation mapping for footer and other broken links
  const NAVIGATION_MAP = {
    // Footer links
    '#forms': '/pages/new-patient-special.html',
    '#insurance': '/pages/insurance-financing.html',
    '#faq': '#faq-section', // Will create this section
    '#reviews': '/pages/reviews-results.html',
    '#technology': '/pages/technology-comfort.html',
    '#blog': '/pages/blog-resources.html',
    
    // Service hub anchors
    '#general': '/pages/general-dentistry.html',
    '#cosmetic': '/pages/veneers.html',
    '#orthodontic': '/pages/invisalign.html',
    '#orthodontics': '/pages/invisalign.html',
    '#preventive': '/pages/preventive-care.html',
    '#restorative': '/pages/crowns-bridges.html',
    '#emergency': '/pages/emergency-dentistry.html',
    '#pediatric': '/pages/pediatric-dentistry.html',
    
    // Common service links
    '#teeth-whitening': '/pages/teeth-whitening.html',
    '#dental-implants': '/pages/dental-implants.html',
    '#root-canals': '/pages/root-canals.html',
    '#wisdom-teeth': '/pages/wisdom-teeth.html',
    '#dentures': '/pages/dentures.html',
    '#fillings': '/pages/fillings.html',
    '#gum-disease': '/pages/gum-disease.html'
  };

  function fixNavigationLinks() {
    // Fix all anchor links
    document.querySelectorAll('a[href^="#"]').forEach(link => {
      const href = link.getAttribute('href');
      
      // Skip valid page anchors
      if (href === '#' || href === '#top') return;
      
      // Check if we have a mapping
      if (NAVIGATION_MAP[href]) {
        link.setAttribute('href', NAVIGATION_MAP[href]);
        link.dataset.navigationFixed = 'true';
      } else {
        // Check if the anchor exists on the page
        const anchorExists = document.querySelector(href);
        if (!anchorExists && href !== '#') {
          console.warn(`Broken anchor link found: ${href}`);
          // Default to homepage for completely broken links
          link.setAttribute('href', '/pages/homepage.html');
          link.dataset.navigationBroken = 'true';
        }
      }
    });

    // Fix service cards with onclick navigation
    document.querySelectorAll('.service-card[onclick]').forEach(card => {
      const onclick = card.getAttribute('onclick');
      if (onclick && onclick.includes('location.href')) {
        // Extract the URL from onclick
        const match = onclick.match(/location\.href\s*=\s*['"]([^'"]+)['"]/);
        if (match && match[1]) {
          // Convert to proper link
          card.style.cursor = 'pointer';
          card.addEventListener('click', (e) => {
            e.preventDefault();
            window.location.href = match[1];
          });
          card.removeAttribute('onclick');
        }
      }
    });

    // Fix buttons that should be links
    document.querySelectorAll('button').forEach(button => {
      const onclick = button.getAttribute('onclick');
      if (onclick && onclick.includes('location.href')) {
        const match = onclick.match(/location\.href\s*=\s*['"]([^'"]+)['"]/);
        if (match && match[1]) {
          // Replace button with styled link
          const link = document.createElement('a');
          link.href = match[1];
          link.className = button.className;
          link.textContent = button.textContent;
          link.style.cssText = button.style.cssText;
          link.style.textDecoration = 'none';
          link.style.display = 'inline-block';
          button.parentNode.replaceChild(link, button);
        }
      }
    });
  }

  function createFAQSection() {
    // Only create FAQ section on homepage
    if (!window.location.pathname.includes('homepage')) return;

    const mainContent = document.querySelector('main') || document.querySelector('.content');
    if (!mainContent) return;

    // Check if FAQ section already exists
    if (document.getElementById('faq-section')) return;

    const faqHTML = `
      <section id="faq-section" class="faq-section" style="padding: 60px 0; background: #f8f9fa;">
        <div class="container" style="max-width: 1200px; margin: 0 auto; padding: 0 20px;">
          <h2 style="text-align: center; color: #0077BE; margin-bottom: 40px;">Frequently Asked Questions</h2>
          
          <div class="faq-grid" style="display: grid; gap: 20px; max-width: 800px; margin: 0 auto;">
            <div class="faq-item" style="background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
              <h3 style="color: #333; margin-bottom: 10px;">Do you accept my insurance?</h3>
              <p style="color: #666; margin: 0;">We accept most major dental insurance plans. Contact us to verify your specific coverage.</p>
            </div>
            
            <div class="faq-item" style="background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
              <h3 style="color: #333; margin-bottom: 10px;">What are your office hours?</h3>
              <p style="color: #666; margin: 0;">Monday-Friday: 8:00 AM - 6:00 PM<br>Saturday: 9:00 AM - 2:00 PM<br>Sunday: Closed</p>
            </div>
            
            <div class="faq-item" style="background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
              <h3 style="color: #333; margin-bottom: 10px;">Do you offer payment plans?</h3>
              <p style="color: #666; margin: 0;">Yes! We offer flexible payment plans through CareCredit and in-house financing options.</p>
            </div>
            
            <div class="faq-item" style="background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
              <h3 style="color: #333; margin-bottom: 10px;">Is parking available?</h3>
              <p style="color: #666; margin: 0;">Free parking is available in our building's lot with easy access to our office.</p>
            </div>
          </div>
          
          <div style="text-align: center; margin-top: 30px;">
            <a href="/pages/contact-us.html" class="btn btn-primary" style="display: inline-block; padding: 12px 30px; background: #0077BE; color: white; text-decoration: none; border-radius: 5px;">Have More Questions? Contact Us</a>
          </div>
        </div>
      </section>
    `;

    // Insert before footer
    const footer = document.querySelector('footer');
    if (footer) {
      footer.insertAdjacentHTML('beforebegin', faqHTML);
    } else {
      mainContent.insertAdjacentHTML('beforeend', faqHTML);
    }
  }

  function fixMobileMenu() {
    // Consolidate mobile menu functionality
    const mobileToggle = document.querySelector('.mobile-menu-toggle, .menu-toggle, [data-toggle="mobile-menu"]');
    const mobileMenu = document.querySelector('.mobile-menu, .nav-menu, nav ul');
    
    if (mobileToggle && mobileMenu) {
      // Remove any inline onclick
      mobileToggle.removeAttribute('onclick');
      
      // Add proper toggle functionality
      mobileToggle.addEventListener('click', (e) => {
        e.preventDefault();
        const isOpen = mobileMenu.classList.contains('active') || mobileMenu.classList.contains('open');
        
        if (isOpen) {
          mobileMenu.classList.remove('active', 'open');
          mobileToggle.setAttribute('aria-expanded', 'false');
          document.body.style.overflow = '';
        } else {
          mobileMenu.classList.add('active');
          mobileToggle.setAttribute('aria-expanded', 'true');
          document.body.style.overflow = 'hidden';
        }
      });

      // Close menu when clicking outside
      document.addEventListener('click', (e) => {
        if (!mobileToggle.contains(e.target) && !mobileMenu.contains(e.target)) {
          mobileMenu.classList.remove('active', 'open');
          mobileToggle.setAttribute('aria-expanded', 'false');
          document.body.style.overflow = '';
        }
      });

      // Close menu when clicking a link
      mobileMenu.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
          mobileMenu.classList.remove('active', 'open');
          mobileToggle.setAttribute('aria-expanded', 'false');
          document.body.style.overflow = '';
        });
      });
    }
  }

  function fixAlertButtons() {
    // Fix all buttons with alert onclick handlers
    document.querySelectorAll('[onclick*="alert"]').forEach(element => {
      const onclick = element.getAttribute('onclick');
      
      // Booking related alerts
      if (onclick.match(/book|appointment|schedule/i)) {
        element.removeAttribute('onclick');
        element.addEventListener('click', (e) => {
          e.preventDefault();
          if (window.bookingModal) {
            window.bookingModal.open();
          } else {
            window.location.href = '/pages/book-appointment.html';
          }
        });
      }
      // Learn more alerts
      else if (onclick.match(/learn more|more info/i)) {
        element.removeAttribute('onclick');
        // Try to determine appropriate page based on context
        const parentSection = element.closest('section, .service-card, .card');
        if (parentSection) {
          const headingElement = parentSection.querySelector('h2, h3, h4');
          if (headingElement) {
            const heading = headingElement.textContent.toLowerCase();
            let targetPage = '/pages/services-hub.html'; // default
            
            // Map headings to pages
            if (heading.includes('implant')) targetPage = '/pages/dental-implants.html';
            else if (heading.includes('whitening')) targetPage = '/pages/teeth-whitening.html';
            else if (heading.includes('crown')) targetPage = '/pages/crowns-bridges.html';
            else if (heading.includes('invisalign')) targetPage = '/pages/invisalign.html';
            else if (heading.includes('veneer')) targetPage = '/pages/veneers.html';
            
            element.addEventListener('click', () => {
              window.location.href = targetPage;
            });
          }
        }
      }
      // Download alerts
      else if (onclick.match(/download/i)) {
        element.removeAttribute('onclick');
        element.addEventListener('click', (e) => {
          e.preventDefault();
          // Create a sample PDF download
          const link = document.createElement('a');
          link.href = '/assets/documents/patient-forms.pdf';
          link.download = 'patient-forms.pdf';
          link.click();
        });
      }
      // Calculate alerts
      else if (onclick.match(/calculate|calculator/i)) {
        element.removeAttribute('onclick');
        element.addEventListener('click', (e) => {
          e.preventDefault();
          // Implement simple calculation or redirect to calculator page
          if (element.closest('.insurance-calculator')) {
            const result = calculateInsuranceSavings();
            showCalculationResult(result);
          }
        });
      }
    });
  }

  function calculateInsuranceSavings() {
    // Simple calculation logic
    const withInsurance = 150; // Example copay
    const withoutInsurance = 500; // Example full price
    const savings = withoutInsurance - withInsurance;
    const percentage = Math.round((savings / withoutInsurance) * 100);
    
    return {
      savings: savings,
      percentage: percentage,
      withInsurance: withInsurance,
      withoutInsurance: withoutInsurance
    };
  }

  function showCalculationResult(result) {
    // Find or create result element
    let resultDiv = document.querySelector('.calculation-result');
    if (!resultDiv) {
      resultDiv = document.createElement('div');
      resultDiv.className = 'calculation-result';
      resultDiv.style.cssText = `
        margin-top: 20px;
        padding: 20px;
        background: #e8f4f8;
        border-radius: 8px;
        border: 1px solid #0077BE;
      `;
    }
    
    resultDiv.innerHTML = `
      <h4 style="color: #0077BE; margin-bottom: 10px;">Your Estimated Savings</h4>
      <p style="margin: 5px 0;">Without Insurance: <strong>$${result.withoutInsurance}</strong></p>
      <p style="margin: 5px 0;">With Insurance: <strong>$${result.withInsurance}</strong></p>
      <p style="margin: 10px 0; font-size: 1.2em; color: #28a745;">
        You Save: <strong>$${result.savings} (${result.percentage}%)</strong>
      </p>
    `;
    
    // Insert after calculator
    const calculator = document.querySelector('.insurance-calculator');
    if (calculator) {
      calculator.appendChild(resultDiv);
    }
  }

  function implementExitPopupClose() {
    // Global function for exit popup close
    window.closeExitPopup = function() {
      const exitPopup = document.querySelector('.exit-popup, .exit-intent-popup, [data-exit-popup]');
      if (exitPopup) {
        exitPopup.style.display = 'none';
        document.body.style.overflow = '';
      }
    };
  }

  function ensureTwoClickNavigation() {
    // Add breadcrumbs to all pages except homepage
    if (!window.location.pathname.includes('homepage') && !window.location.pathname.endsWith('/')) {
      const header = document.querySelector('header');
      if (header && !document.querySelector('.breadcrumb')) {
        const breadcrumb = document.createElement('div');
        breadcrumb.className = 'breadcrumb';
        breadcrumb.style.cssText = `
          padding: 10px 20px;
          background: #f8f9fa;
          font-size: 14px;
        `;
        breadcrumb.innerHTML = `
          <a href="/pages/homepage.html" style="color: #0077BE; text-decoration: none;">Home</a>
          <span style="margin: 0 10px; color: #999;">›</span>
          <span style="color: #666;">${document.title.split('|')[0].trim()}</span>
        `;
        header.insertAdjacentElement('afterend', breadcrumb);
      }
    }
  }

  // Initialize all fixes
  function initNavigationFixes() {
    fixNavigationLinks();
    createFAQSection();
    fixMobileMenu();
    fixAlertButtons();
    implementExitPopupClose();
    ensureTwoClickNavigation();
    
    console.log('Navigation fixes applied successfully');
  }

  // Run on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initNavigationFixes);
  } else {
    initNavigationFixes();
  }

  // Re-run fixes if content is dynamically loaded
  const observer = new MutationObserver(() => {
    fixNavigationLinks();
    fixAlertButtons();
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true
  });

})();