// Enhanced API Client for Wave 4 - Production Ready
// Includes loading states, error handling, analytics, and mobile support

const API_BASE = '/api';

// Google Analytics helper
function sendAnalyticsEvent(eventName, parameters = {}) {
  if (typeof gtag !== 'undefined') {
    gtag('event', eventName, {
      event_category: 'engagement',
      event_label: parameters.label || '',
      value: parameters.value || 0,
      ...parameters
    });
  }
}

// Loading state manager
class LoadingStateManager {
  constructor() {
    this.activeRequests = new Map();
  }

  start(button, loadingText = 'Processing...') {
    const buttonId = this.getButtonId(button);
    const originalContent = button.innerHTML;
    const originalDisabled = button.disabled;
    
    this.activeRequests.set(buttonId, {
      originalContent,
      originalDisabled,
      button
    });

    button.disabled = true;
    button.classList.add('loading');
    button.innerHTML = `<span class="spinner"></span> ${loadingText}`;
    
    // Add spinner styles if not already present
    this.ensureSpinnerStyles();
  }

  success(button, successText = 'Success!', duration = 3000) {
    const buttonId = this.getButtonId(button);
    const state = this.activeRequests.get(buttonId);
    
    if (state) {
      button.classList.remove('loading');
      button.classList.add('success');
      button.innerHTML = `<i class="fas fa-check-circle"></i> ${successText}`;
      
      setTimeout(() => {
        button.classList.remove('success');
        button.innerHTML = state.originalContent;
        button.disabled = state.originalDisabled;
        this.activeRequests.delete(buttonId);
      }, duration);
    }
  }

  error(button, errorText = 'Error', duration = 3000) {
    const buttonId = this.getButtonId(button);
    const state = this.activeRequests.get(buttonId);
    
    if (state) {
      button.classList.remove('loading');
      button.classList.add('error');
      button.innerHTML = `<i class="fas fa-exclamation-circle"></i> ${errorText}`;
      
      setTimeout(() => {
        button.classList.remove('error');
        button.innerHTML = state.originalContent;
        button.disabled = state.originalDisabled;
        this.activeRequests.delete(buttonId);
      }, duration);
    }
  }

  reset(button) {
    const buttonId = this.getButtonId(button);
    const state = this.activeRequests.get(buttonId);
    
    if (state) {
      button.classList.remove('loading', 'success', 'error');
      button.innerHTML = state.originalContent;
      button.disabled = state.originalDisabled;
      this.activeRequests.delete(buttonId);
    }
  }

  getButtonId(button) {
    if (!button.dataset.loadingId) {
      button.dataset.loadingId = `btn-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }
    return button.dataset.loadingId;
  }

  ensureSpinnerStyles() {
    if (!document.getElementById('loading-spinner-styles')) {
      const style = document.createElement('style');
      style.id = 'loading-spinner-styles';
      style.textContent = `
        .spinner {
          display: inline-block;
          width: 16px;
          height: 16px;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-radius: 50%;
          border-top-color: white;
          animation: spin 0.8s linear infinite;
        }
        
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        
        button.loading {
          position: relative;
          color: rgba(255, 255, 255, 0.8);
        }
        
        button.success {
          background-color: #28a745 !important;
          border-color: #28a745 !important;
        }
        
        button.error {
          background-color: #dc3545 !important;
          border-color: #dc3545 !important;
        }
      `;
      document.head.appendChild(style);
    }
  }
}

// Create global loading state manager
const loadingManager = new LoadingStateManager();

// Enhanced API call with retry logic
async function apiCall(endpoint, data, options = {}) {
  const { retries = 2, retryDelay = 1000 } = options;
  
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const response = await fetch(`${API_BASE}/${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Requested-With': 'XMLHttpRequest'
        },
        body: JSON.stringify(data)
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.message || result.error || 'API request failed');
      }
      
      return result;
    } catch (error) {
      if (attempt === retries) {
        console.error(`API Error (${endpoint}):`, error);
        throw error;
      }
      
      // Wait before retry
      await new Promise(resolve => setTimeout(resolve, retryDelay * (attempt + 1)));
    }
  }
}

// Touch event support for mobile
function addTouchSupport(button, handler) {
  let touchStartTime;
  let touchStartX, touchStartY;
  
  button.addEventListener('touchstart', (e) => {
    touchStartTime = Date.now();
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
  }, { passive: true });
  
  button.addEventListener('touchend', (e) => {
    const touchEndTime = Date.now();
    const touchEndX = e.changedTouches[0].clientX;
    const touchEndY = e.changedTouches[0].clientY;
    
    // Check if it's a tap (not a swipe)
    const timeDiff = touchEndTime - touchStartTime;
    const distX = Math.abs(touchEndX - touchStartX);
    const distY = Math.abs(touchEndY - touchStartY);
    
    if (timeDiff < 300 && distX < 10 && distY < 10) {
      e.preventDefault();
      handler(e);
    }
  });
}

// Book Appointment API with enhanced functionality
async function bookAppointmentAPI(button, appointmentData) {
  sendAnalyticsEvent('appointment_booking_started', {
    appointment_type: appointmentData.appointmentType,
    provider: appointmentData.provider || 'any'
  });
  
  loadingManager.start(button, 'Booking appointment...');
  
  try {
    const result = await apiCall('book-appointment', appointmentData);
    
    sendAnalyticsEvent('appointment_booking_success', {
      confirmation_number: result.confirmationNumber,
      appointment_type: appointmentData.appointmentType
    });
    
    loadingManager.success(button, 'Booked!');
    return result;
  } catch (error) {
    sendAnalyticsEvent('appointment_booking_error', {
      error: error.message,
      appointment_type: appointmentData.appointmentType
    });
    
    loadingManager.error(button, 'Failed');
    throw error;
  }
}

// Quiz submission with enhanced functionality
async function submitQuizAPI(button, quizData) {
  sendAnalyticsEvent('quiz_submission_started', {
    score: quizData.score,
    profile: quizData.profile
  });
  
  loadingManager.start(button, 'Saving results...');
  
  try {
    const result = await apiCall('quiz-email', quizData);
    
    sendAnalyticsEvent('quiz_submission_success', {
      score: quizData.score,
      profile: quizData.profile
    });
    
    loadingManager.success(button, 'Saved!');
    return result;
  } catch (error) {
    sendAnalyticsEvent('quiz_submission_error', {
      error: error.message,
      score: quizData.score
    });
    
    loadingManager.error(button, 'Failed');
    throw error;
  }
}

// Contact form with enhanced functionality
async function submitContactAPI(button, contactData) {
  sendAnalyticsEvent('contact_form_started', {
    form_type: contactData.formType || 'general',
    urgency: contactData.urgency || 'normal'
  });
  
  loadingManager.start(button, 'Sending message...');
  
  try {
    const result = await apiCall('contact', contactData);
    
    sendAnalyticsEvent('contact_form_success', {
      ticket_id: result.ticketId,
      form_type: contactData.formType || 'general'
    });
    
    loadingManager.success(button, 'Sent!');
    return result;
  } catch (error) {
    sendAnalyticsEvent('contact_form_error', {
      error: error.message,
      form_type: contactData.formType || 'general'
    });
    
    loadingManager.error(button, 'Failed');
    throw error;
  }
}

// Enhanced form handlers with validation

// Appointment form handler
async function handleAppointmentSubmit(event) {
  event.preventDefault();
  
  const form = event.target;
  const submitButton = form.querySelector('button[type="submit"]');
  
  // Form validation
  if (!form.checkValidity()) {
    form.reportValidity();
    return;
  }
  
  try {
    // Collect form data
    const appointmentData = {
      patientInfo: {
        firstName: form.firstName.value.trim(),
        lastName: form.lastName.value.trim(),
        email: form.email.value.trim().toLowerCase(),
        phone: form.phone.value.trim(),
        dateOfBirth: form.dateOfBirth?.value || null,
        isNewPatient: form.patientType?.value === 'new'
      },
      appointmentType: form.service.value,
      preferredDate: form.preferredDate.value,
      preferredTime: form.preferredTime.value,
      provider: form.provider?.value || null,
      insurance: {
        hasInsurance: form.hasInsurance?.checked || false,
        provider: form.insuranceProvider?.value || null,
        memberId: form.memberId?.value || null
      },
      notes: form.notes?.value || ''
    };
    
    // Call API
    const result = await bookAppointmentAPI(submitButton, appointmentData);
    
    // Show success modal or redirect
    showAppointmentConfirmation(result);
    
  } catch (error) {
    showErrorModal(
      'Booking Failed',
      'We couldn\'t process your appointment request. Please try again or call us at (555) 123-4567.',
      error.message
    );
  }
}

// Quiz email handler
async function handleQuizEmailSubmit(event) {
  event.preventDefault();
  
  const form = event.target;
  const submitButton = form.querySelector('button[type="submit"]');
  const email = form.email.value.trim().toLowerCase();
  
  // Validate email
  if (!email || !email.includes('@')) {
    form.email.setCustomValidity('Please enter a valid email address');
    form.reportValidity();
    return;
  }
  
  try {
    const quizData = {
      email: email,
      quizResults: window.quizAnswers || {},
      score: calculateScore(),
      profile: calculateProfile(),
      marketingConsent: form.marketingConsent?.checked || false
    };
    
    // Save locally first
    localStorage.setItem('quizEmail', email);
    localStorage.setItem('quizCompleted', 'true');
    
    // Submit to API
    const result = await submitQuizAPI(submitButton, quizData);
    
    // Show results
    showQuizResults(result);
    
  } catch (error) {
    // Still show results even if API fails
    console.error('Quiz submission failed:', error);
    showQuizResults({ profile: calculateProfile(), score: calculateScore() });
  }
}

// Contact form handler
async function handleContactFormSubmit(event) {
  event.preventDefault();
  
  const form = event.target;
  const submitButton = form.querySelector('button[type="submit"]');
  
  // Form validation
  if (!form.checkValidity()) {
    form.reportValidity();
    return;
  }
  
  try {
    const contactData = {
      name: form.name.value.trim(),
      email: form.email.value.trim().toLowerCase(),
      phone: form.phone?.value.trim() || null,
      subject: form.subject?.value.trim() || null,
      message: form.message.value.trim(),
      formType: form.dataset.formType || 'general',
      urgency: form.urgency?.value || 'normal'
    };
    
    // Submit to API
    const result = await submitContactAPI(submitButton, contactData);
    
    // Show success message
    showSuccessMessage(
      'Message Sent!',
      `${result.message} Your ticket number is ${result.ticketId}.`
    );
    
    // Reset form
    form.reset();
    
    // Close modal if in one
    const modal = form.closest('.modal');
    if (modal) {
      setTimeout(() => {
        modal.style.display = 'none';
      }, 2000);
    }
    
  } catch (error) {
    showErrorMessage(
      'Failed to send message. Please try again or call us at (555) 123-4567.'
    );
  }
}

// Initialize all buttons and forms on page load
function initializeButtons() {
  // Book appointment buttons
  document.querySelectorAll('[data-action="book-appointment"]').forEach(button => {
    button.addEventListener('click', (e) => {
      e.preventDefault();
      sendAnalyticsEvent('cta_clicked', { 
        action: 'book_appointment',
        location: button.dataset.location || 'unknown'
      });
      window.location.href = '/book-appointment.html';
    });
    addTouchSupport(button, (e) => {
      e.preventDefault();
      window.location.href = '/book-appointment.html';
    });
  });

  // Call buttons
  document.querySelectorAll('[data-action="call"]').forEach(button => {
    button.addEventListener('click', (e) => {
      e.preventDefault();
      sendAnalyticsEvent('cta_clicked', { 
        action: 'phone_call',
        location: button.dataset.location || 'unknown'
      });
      window.location.href = 'tel:+15551234567';
    });
  });

  // Virtual consultation buttons
  document.querySelectorAll('[data-action="virtual-consultation"]').forEach(button => {
    button.addEventListener('click', (e) => {
      e.preventDefault();
      sendAnalyticsEvent('cta_clicked', { 
        action: 'virtual_consultation',
        location: button.dataset.location || 'unknown'
      });
      openVirtualConsultationModal();
    });
    addTouchSupport(button, openVirtualConsultationModal);
  });

  // Form submissions
  const appointmentForm = document.getElementById('appointment-form');
  if (appointmentForm) {
    appointmentForm.addEventListener('submit', handleAppointmentSubmit);
  }

  const quizEmailForm = document.getElementById('quiz-email-form');
  if (quizEmailForm) {
    quizEmailForm.addEventListener('submit', handleQuizEmailSubmit);
  }

  const contactForms = document.querySelectorAll('.contact-form');
  contactForms.forEach(form => {
    form.addEventListener('submit', handleContactFormSubmit);
  });
}

// Initialize on DOM ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeButtons);
} else {
  initializeButtons();
}

// Export for use in other scripts
window.dentalAPI = {
  bookAppointment: bookAppointmentAPI,
  submitQuiz: submitQuizAPI,
  submitContact: submitContactAPI,
  loadingManager,
  sendAnalyticsEvent,
  addTouchSupport
};