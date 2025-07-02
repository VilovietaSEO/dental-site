/**
 * Booking Modal Component for Dental Website
 * Provides a reusable modal for appointment booking from any page
 */

class BookingModal {
  constructor() {
    this.modalId = 'booking-modal';
    this.modal = null;
    this.overlay = null;
    this.isOpen = false;
    this.init();
  }

  init() {
    // Create modal if it doesn't exist
    if (!document.getElementById(this.modalId)) {
      this.createModal();
    } else {
      this.modal = document.getElementById(this.modalId);
      this.overlay = document.querySelector('.modal-overlay');
    }
    
    this.attachEventListeners();
    this.wireUpBookingButtons();
  }

  createModal() {
    // Create overlay
    this.overlay = document.createElement('div');
    this.overlay.className = 'modal-overlay';
    this.overlay.style.cssText = `
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
    `;

    // Create modal container
    this.modal = document.createElement('div');
    this.modal.id = this.modalId;
    this.modal.className = 'booking-modal';
    this.modal.setAttribute('role', 'dialog');
    this.modal.setAttribute('aria-modal', 'true');
    this.modal.setAttribute('aria-labelledby', 'booking-modal-title');
    
    this.modal.style.cssText = `
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
    `;

    // Modal content
    this.modal.innerHTML = `
      <div class="modal-header" style="padding: 20px; border-bottom: 1px solid #eee;">
        <h2 id="booking-modal-title" style="margin: 0; color: #0077BE;">Book Your Appointment</h2>
        <button 
          class="modal-close" 
          aria-label="Close modal"
          style="position: absolute; top: 15px; right: 15px; background: none; border: none; font-size: 30px; cursor: pointer; color: #666;"
        >&times;</button>
      </div>
      
      <div class="modal-body" style="padding: 20px;">
        <form id="modal-booking-form" class="booking-form">
          <div class="form-group" style="margin-bottom: 15px;">
            <label for="modal-first-name" style="display: block; margin-bottom: 5px; font-weight: bold;">First Name *</label>
            <input 
              type="text" 
              id="modal-first-name" 
              name="firstName" 
              required 
              style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 5px;"
            >
          </div>
          
          <div class="form-group" style="margin-bottom: 15px;">
            <label for="modal-last-name" style="display: block; margin-bottom: 5px; font-weight: bold;">Last Name *</label>
            <input 
              type="text" 
              id="modal-last-name" 
              name="lastName" 
              required 
              style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 5px;"
            >
          </div>
          
          <div class="form-group" style="margin-bottom: 15px;">
            <label for="modal-email" style="display: block; margin-bottom: 5px; font-weight: bold;">Email *</label>
            <input 
              type="email" 
              id="modal-email" 
              name="email" 
              required 
              style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 5px;"
            >
          </div>
          
          <div class="form-group" style="margin-bottom: 15px;">
            <label for="modal-phone" style="display: block; margin-bottom: 5px; font-weight: bold;">Phone *</label>
            <input 
              type="tel" 
              id="modal-phone" 
              name="phone" 
              required 
              pattern="[0-9]{3}-[0-9]{3}-[0-9]{4}"
              placeholder="123-456-7890"
              style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 5px;"
            >
          </div>
          
          <div class="form-group" style="margin-bottom: 15px;">
            <label for="modal-service" style="display: block; margin-bottom: 5px; font-weight: bold;">Service Needed</label>
            <select 
              id="modal-service" 
              name="appointmentType" 
              style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 5px;"
            >
              <option value="General Checkup">General Checkup</option>
              <option value="Cleaning">Cleaning</option>
              <option value="Emergency">Emergency</option>
              <option value="Cosmetic Consultation">Cosmetic Consultation</option>
              <option value="Other">Other</option>
            </select>
          </div>
          
          <div class="form-group" style="margin-bottom: 15px;">
            <label for="modal-date" style="display: block; margin-bottom: 5px; font-weight: bold;">Preferred Date</label>
            <input 
              type="date" 
              id="modal-date" 
              name="preferredDate" 
              min="${new Date().toISOString().split('T')[0]}"
              style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 5px;"
            >
          </div>
          
          <div class="form-group" style="margin-bottom: 15px;">
            <label for="modal-time" style="display: block; margin-bottom: 5px; font-weight: bold;">Preferred Time</label>
            <select 
              id="modal-time" 
              name="preferredTime" 
              style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 5px;"
            >
              <option value="Morning">Morning (8AM - 12PM)</option>
              <option value="Afternoon">Afternoon (12PM - 5PM)</option>
              <option value="Evening">Evening (5PM - 7PM)</option>
            </select>
          </div>
          
          <div class="form-group" style="margin-bottom: 20px;">
            <label for="modal-notes" style="display: block; margin-bottom: 5px; font-weight: bold;">Additional Notes</label>
            <textarea 
              id="modal-notes" 
              name="notes" 
              rows="3" 
              style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 5px;"
            ></textarea>
          </div>
          
          <div class="form-actions" style="display: flex; gap: 10px;">
            <button 
              type="submit" 
              class="btn-primary"
              style="flex: 1; padding: 12px; background: #0077BE; color: white; border: none; border-radius: 5px; font-size: 16px; cursor: pointer;"
            >
              Book Appointment
            </button>
            <button 
              type="button" 
              class="btn-secondary modal-cancel"
              style="flex: 1; padding: 12px; background: #f0f0f0; color: #333; border: none; border-radius: 5px; font-size: 16px; cursor: pointer;"
            >
              Cancel
            </button>
          </div>
        </form>
        
        <div id="booking-loading" style="display: none; text-align: center; padding: 40px;">
          <div style="display: inline-block; width: 40px; height: 40px; border: 3px solid #f0f0f0; border-top-color: #0077BE; border-radius: 50%; animation: spin 1s linear infinite;"></div>
          <p style="margin-top: 10px; color: #666;">Submitting your appointment...</p>
        </div>
        
        <div id="booking-success" style="display: none; text-align: center; padding: 40px;">
          <div style="font-size: 60px; color: #28a745; margin-bottom: 20px;">✓</div>
          <h3 style="color: #28a745; margin-bottom: 10px;">Appointment Booked!</h3>
          <p style="color: #666;">Confirmation #: <span id="confirmation-number" style="font-weight: bold;"></span></p>
          <p style="color: #666;">We'll contact you shortly to confirm your appointment.</p>
          <button 
            class="btn-primary modal-close-success"
            style="margin-top: 20px; padding: 10px 20px; background: #0077BE; color: white; border: none; border-radius: 5px; cursor: pointer;"
          >
            Close
          </button>
        </div>
        
        <div id="booking-error" style="display: none; text-align: center; padding: 40px;">
          <div style="font-size: 60px; color: #dc3545; margin-bottom: 20px;">✗</div>
          <h3 style="color: #dc3545; margin-bottom: 10px;">Booking Failed</h3>
          <p style="color: #666;" id="error-message">Something went wrong. Please try again or call us at (555) 123-4567.</p>
          <button 
            class="btn-primary modal-retry"
            style="margin-top: 20px; padding: 10px 20px; background: #0077BE; color: white; border: none; border-radius: 5px; cursor: pointer;"
          >
            Try Again
          </button>
        </div>
      </div>
    `;

    // Add CSS animation
    const style = document.createElement('style');
    style.textContent = `
      @keyframes spin {
        to { transform: rotate(360deg); }
      }
      
      .modal-overlay.active {
        display: block !important;
        opacity: 1 !important;
      }
      
      .booking-modal.active {
        display: block !important;
        opacity: 1 !important;
        transform: translate(-50%, -50%) scale(1) !important;
      }
      
      .btn-primary:hover {
        background: #005a8b !important;
      }
      
      .btn-secondary:hover {
        background: #e0e0e0 !important;
      }
    `;
    document.head.appendChild(style);

    // Append to body
    document.body.appendChild(this.overlay);
    document.body.appendChild(this.modal);
  }

  attachEventListeners() {
    // Close button
    const closeBtn = this.modal.querySelector('.modal-close');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => this.close());
    }

    // Cancel button
    const cancelBtn = this.modal.querySelector('.modal-cancel');
    if (cancelBtn) {
      cancelBtn.addEventListener('click', () => this.close());
    }

    // Success close button
    const successCloseBtn = this.modal.querySelector('.modal-close-success');
    if (successCloseBtn) {
      successCloseBtn.addEventListener('click', () => this.close());
    }

    // Retry button
    const retryBtn = this.modal.querySelector('.modal-retry');
    if (retryBtn) {
      retryBtn.addEventListener('click', () => this.showForm());
    }

    // Overlay click
    this.overlay.addEventListener('click', () => this.close());

    // Form submission
    const form = this.modal.querySelector('#modal-booking-form');
    if (form) {
      form.addEventListener('submit', (e) => this.handleSubmit(e));
    }

    // ESC key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.isOpen) {
        this.close();
      }
    });
  }

  wireUpBookingButtons() {
    // Wire up all buttons with booking actions
    const bookingSelectors = [
      '[data-action="book"]',
      '.book-appointment',
      '.btn-book',
      '[onclick*="Booking"]',
      '[onclick*="appointment"]',
      'button:contains("Book")',
      'a:contains("Book Appointment")'
    ];

    bookingSelectors.forEach(selector => {
      document.querySelectorAll(selector).forEach(element => {
        // Skip if already has proper handler
        if (element.dataset.bookingWired) return;
        
        // Remove inline onclick
        element.removeAttribute('onclick');
        
        // Add click handler
        element.addEventListener('click', (e) => {
          e.preventDefault();
          this.open();
        });
        
        // Mark as wired
        element.dataset.bookingWired = 'true';
      });
    });

    // Special handling for buttons with alert text
    document.querySelectorAll('button, a').forEach(element => {
      const onclick = element.getAttribute('onclick');
      if (onclick && onclick.includes('alert') && onclick.toLowerCase().includes('book')) {
        element.removeAttribute('onclick');
        element.addEventListener('click', (e) => {
          e.preventDefault();
          this.open();
        });
        element.dataset.bookingWired = 'true';
      }
    });
  }

  open() {
    this.showForm();
    this.overlay.classList.add('active');
    this.modal.classList.add('active');
    document.body.style.overflow = 'hidden';
    this.isOpen = true;
    
    // Focus first input
    setTimeout(() => {
      const firstInput = this.modal.querySelector('input');
      if (firstInput) firstInput.focus();
    }, 300);
  }

  close() {
    this.overlay.classList.remove('active');
    this.modal.classList.remove('active');
    document.body.style.overflow = '';
    this.isOpen = false;
    
    // Reset form
    const form = this.modal.querySelector('#modal-booking-form');
    if (form) form.reset();
  }

  showForm() {
    this.modal.querySelector('#modal-booking-form').style.display = 'block';
    this.modal.querySelector('#booking-loading').style.display = 'none';
    this.modal.querySelector('#booking-success').style.display = 'none';
    this.modal.querySelector('#booking-error').style.display = 'none';
  }

  showLoading() {
    this.modal.querySelector('#modal-booking-form').style.display = 'none';
    this.modal.querySelector('#booking-loading').style.display = 'block';
    this.modal.querySelector('#booking-success').style.display = 'none';
    this.modal.querySelector('#booking-error').style.display = 'none';
  }

  showSuccess(confirmationNumber) {
    this.modal.querySelector('#modal-booking-form').style.display = 'none';
    this.modal.querySelector('#booking-loading').style.display = 'none';
    this.modal.querySelector('#booking-success').style.display = 'block';
    this.modal.querySelector('#booking-error').style.display = 'none';
    this.modal.querySelector('#confirmation-number').textContent = confirmationNumber;
  }

  showError(message) {
    this.modal.querySelector('#modal-booking-form').style.display = 'none';
    this.modal.querySelector('#booking-loading').style.display = 'none';
    this.modal.querySelector('#booking-success').style.display = 'none';
    this.modal.querySelector('#booking-error').style.display = 'block';
    if (message) {
      this.modal.querySelector('#error-message').textContent = message;
    }
  }

  async handleSubmit(e) {
    e.preventDefault();
    
    const form = e.target;
    const formData = new FormData(form);
    
    // Convert to object
    const data = {
      patientInfo: {
        firstName: formData.get('firstName'),
        lastName: formData.get('lastName'),
        email: formData.get('email'),
        phone: formData.get('phone'),
        isNewPatient: true
      },
      appointmentType: formData.get('appointmentType'),
      preferredDate: formData.get('preferredDate') || new Date().toISOString().split('T')[0],
      preferredTime: formData.get('preferredTime') || '10:00',
      notes: formData.get('notes')
    };

    this.showLoading();

    try {
      // Use API client if available, otherwise direct fetch
      let response;
      if (window.apiClient && window.apiClient.bookAppointment) {
        response = await window.apiClient.bookAppointment(data);
      } else {
        const apiResponse = await fetch('/api/book-appointment', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(data)
        });
        
        if (!apiResponse.ok) {
          throw new Error('Booking failed');
        }
        
        response = await apiResponse.json();
      }

      this.showSuccess(response.confirmationNumber || 'MDC' + Date.now().toString().slice(-8));
      
    } catch (error) {
      console.error('Booking error:', error);
      this.showError('Unable to book appointment. Please call us at (555) 123-4567.');
    }
  }
}

// Initialize on DOM ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.bookingModal = new BookingModal();
  });
} else {
  window.bookingModal = new BookingModal();
}

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
  module.exports = BookingModal;
}