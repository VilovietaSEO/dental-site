/**
 * UI Integration Script for Dental Website
 * Loads and integrates all UI fixes into existing pages
 */

(function() {
  'use strict';

  // Script loader utility
  function loadScript(src, callback) {
    const script = document.createElement('script');
    script.src = src;
    script.onload = callback;
    script.onerror = () => console.error(`Failed to load script: ${src}`);
    document.head.appendChild(script);
  }

  // CSS loader utility
  function loadCSS(href) {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = href;
    document.head.appendChild(link);
  }

  // Initialize all UI fixes
  function initializeUIFixes() {
    // Load booking modal CSS if needed
    if (!document.querySelector('link[href*="modal.css"]')) {
      const modalStyles = `
        <style id="booking-modal-styles">
          /* Booking Modal Styles */
          .modal-overlay {
            display: none;
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.5);
            z-index: 9998;
            opacity: 0;
            transition: opacity 0.3s ease;
          }
          
          .modal-overlay.active {
            display: block !important;
            opacity: 1 !important;
          }
          
          .booking-modal {
            display: none;
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%) scale(0.9);
            background: white;
            border-radius: 10px;
            box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
            max-width: 600px;
            width: 90%;
            max-height: 90vh;
            overflow-y: auto;
            z-index: 9999;
            opacity: 0;
            transition: all 0.3s ease;
          }
          
          .booking-modal.active {
            display: block !important;
            opacity: 1 !important;
            transform: translate(-50%, -50%) scale(1) !important;
          }
          
          /* Responsive modal */
          @media (max-width: 768px) {
            .booking-modal {
              width: 95%;
              max-height: 95vh;
            }
          }
        </style>
      `;
      document.head.insertAdjacentHTML('beforeend', modalStyles);
    }

    // Load required scripts in order
    const scriptsToLoad = [
      { src: '/js/booking-modal.js', name: 'Booking Modal' },
      { src: '/js/navigation-fix.js', name: 'Navigation Fixes' }
    ];

    let loadedCount = 0;
    
    scriptsToLoad.forEach(scriptInfo => {
      // Check if script already loaded
      if (!document.querySelector(`script[src="${scriptInfo.src}"]`)) {
        loadScript(scriptInfo.src, () => {
          console.log(`✓ ${scriptInfo.name} loaded`);
          loadedCount++;
          
          if (loadedCount === scriptsToLoad.length) {
            console.log('All UI fixes loaded successfully');
            postLoadInitialization();
          }
        });
      } else {
        loadedCount++;
        if (loadedCount === scriptsToLoad.length) {
          postLoadInitialization();
        }
      }
    });
  }

  // Post-load initialization
  function postLoadInitialization() {
    // Ensure booking modal is initialized
    if (!window.bookingModal && window.BookingModal) {
      window.bookingModal = new BookingModal();
    }

    // Fix any remaining issues
    fixRemainingIssues();
    
    // Setup global error handlers
    setupErrorHandlers();
  }

  // Fix any remaining UI issues
  function fixRemainingIssues() {
    // Fix undefined functions that might be called
    if (!window.showErrorMessage) {
      window.showErrorMessage = function(message) {
        console.error(message);
        // Create simple error toast
        const toast = document.createElement('div');
        toast.className = 'error-toast';
        toast.style.cssText = `
          position: fixed;
          bottom: 20px;
          right: 20px;
          background: #dc3545;
          color: white;
          padding: 15px 20px;
          border-radius: 5px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.2);
          z-index: 10000;
          animation: slideIn 0.3s ease;
        `;
        toast.textContent = message;
        document.body.appendChild(toast);
        
        setTimeout(() => {
          toast.style.animation = 'slideOut 0.3s ease';
          setTimeout(() => toast.remove(), 300);
        }, 5000);
      };
    }

    if (!window.showSuccessMessage) {
      window.showSuccessMessage = function(message) {
        console.log(message);
        // Create simple success toast
        const toast = document.createElement('div');
        toast.className = 'success-toast';
        toast.style.cssText = `
          position: fixed;
          bottom: 20px;
          right: 20px;
          background: #28a745;
          color: white;
          padding: 15px 20px;
          border-radius: 5px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.2);
          z-index: 10000;
          animation: slideIn 0.3s ease;
        `;
        toast.textContent = message;
        document.body.appendChild(toast);
        
        setTimeout(() => {
          toast.style.animation = 'slideOut 0.3s ease';
          setTimeout(() => toast.remove(), 300);
        }, 3000);
      };
    }

    // Add animation styles
    if (!document.getElementById('toast-animations')) {
      const animationStyles = `
        <style id="toast-animations">
          @keyframes slideIn {
            from {
              transform: translateX(100%);
              opacity: 0;
            }
            to {
              transform: translateX(0);
              opacity: 1;
            }
          }
          
          @keyframes slideOut {
            from {
              transform: translateX(0);
              opacity: 1;
            }
            to {
              transform: translateX(100%);
              opacity: 0;
            }
          }
        </style>
      `;
      document.head.insertAdjacentHTML('beforeend', animationStyles);
    }

    // Fix calculator functions
    if (!window.calculateScore) {
      window.calculateScore = function(answers) {
        // Simple scoring logic
        let score = 0;
        Object.values(answers).forEach(answer => {
          score += parseInt(answer) || 0;
        });
        return score;
      };
    }

    if (!window.calculateProfile) {
      window.calculateProfile = function(score) {
        // Profile calculation based on score
        if (score <= 20) return 'guardian';
        if (score <= 40) return 'warrior';
        if (score <= 60) return 'explorer';
        return 'rebuilder';
      };
    }

    if (!window.showQuizResults) {
      window.showQuizResults = function(profile, score) {
        // Redirect to results or show inline
        if (document.querySelector('.quiz-results')) {
          document.querySelector('.quiz-container').style.display = 'none';
          document.querySelector('.quiz-results').style.display = 'block';
          document.querySelector('.profile-name').textContent = profile.toUpperCase();
          document.querySelector('.profile-score').textContent = score;
        } else {
          // Store and redirect
          localStorage.setItem('quizProfile', profile);
          localStorage.setItem('quizScore', score);
          window.location.href = '/pages/dental-health-assessment-quiz.html#results';
        }
      };
    }
  }

  // Setup global error handlers
  function setupErrorHandlers() {
    // Handle form submission errors
    document.addEventListener('submit', async (e) => {
      const form = e.target;
      
      // Skip if form has custom handler
      if (form.dataset.customHandler) return;
      
      // Handle appointment forms
      if (form.classList.contains('appointment-form') || form.id === 'appointmentForm') {
        e.preventDefault();
        
        try {
          // Show loading state
          const submitBtn = form.querySelector('[type="submit"]');
          const originalText = submitBtn.textContent;
          submitBtn.textContent = 'Submitting...';
          submitBtn.disabled = true;
          
          // Collect form data
          const formData = new FormData(form);
          const data = {
            patientInfo: {
              firstName: formData.get('firstName'),
              lastName: formData.get('lastName'),
              email: formData.get('email'),
              phone: formData.get('phone'),
              isNewPatient: formData.get('isNewPatient') === 'true'
            },
            appointmentType: formData.get('service') || formData.get('appointmentType'),
            preferredDate: formData.get('preferredDate'),
            preferredTime: formData.get('preferredTime'),
            notes: formData.get('notes') || formData.get('message')
          };
          
          // Submit via API
          const response = await fetch('/api/book-appointment', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
          });
          
          const result = await response.json();
          
          if (response.ok) {
            showSuccessMessage(`Appointment booked! Confirmation #${result.confirmationNumber}`);
            form.reset();
          } else {
            throw new Error(result.message || 'Booking failed');
          }
          
        } catch (error) {
          showErrorMessage(error.message || 'Unable to book appointment. Please call us.');
        } finally {
          const submitBtn = form.querySelector('[type="submit"]');
          submitBtn.textContent = originalText;
          submitBtn.disabled = false;
        }
      }
    });

    // Handle broken images
    document.addEventListener('error', (e) => {
      if (e.target.tagName === 'IMG') {
        e.target.src = '/assets/images/placeholder.jpg';
        e.target.alt = 'Image unavailable';
      }
    }, true);
  }

  // Initialize on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeUIFixes);
  } else {
    initializeUIFixes();
  }

  // Also initialize on page navigation (for SPAs)
  window.addEventListener('popstate', initializeUIFixes);

})();

// Export initialization function
window.initializeUIFixes = function() {
  console.log('Manually initializing UI fixes...');
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeUIFixes);
  } else {
    initializeUIFixes();
  }
};