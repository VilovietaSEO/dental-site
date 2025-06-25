/* Modern Dental Care - Global JavaScript */
/* Version: 1.0.0 */

(function() {
    'use strict';

    // Global Configuration
    const CONFIG = {
        API_URL: '/api',
        PHONE: '1-800-DENTIST',
        EMAIL: 'smile@moderndentalcare.com',
        BUSINESS_HOURS: {
            weekday: { open: '8:00 AM', close: '6:00 PM' },
            saturday: { open: '9:00 AM', close: '4:00 PM' },
            sunday: { open: 'Closed', close: 'Closed' }
        },
        QUIZ_VERSION: '1.0',
        ANALYTICS_ID: 'UA-XXXXXXXXX'
    };

    // Utility Functions
    const Utils = {
        // Debounce function for performance
        debounce: function(func, wait) {
            let timeout;
            return function executedFunction(...args) {
                const later = () => {
                    clearTimeout(timeout);
                    func(...args);
                };
                clearTimeout(timeout);
                timeout = setTimeout(later, wait);
            };
        },

        // Throttle function for performance
        throttle: function(func, limit) {
            let inThrottle;
            return function(...args) {
                if (!inThrottle) {
                    func.apply(this, args);
                    inThrottle = true;
                    setTimeout(() => inThrottle = false, limit);
                }
            };
        },

        // Format phone number for tel: links
        formatPhoneForLink: function(phone) {
            return phone.replace(/\D/g, '');
        },

        // Check if element is in viewport
        isInViewport: function(element) {
            const rect = element.getBoundingClientRect();
            return (
                rect.top >= 0 &&
                rect.left >= 0 &&
                rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
                rect.right <= (window.innerWidth || document.documentElement.clientWidth)
            );
        },

        // Get cookie value
        getCookie: function(name) {
            const value = `; ${document.cookie}`;
            const parts = value.split(`; ${name}=`);
            if (parts.length === 2) return parts.pop().split(';').shift();
        },

        // Set cookie
        setCookie: function(name, value, days) {
            const date = new Date();
            date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
            const expires = `expires=${date.toUTCString()}`;
            document.cookie = `${name}=${value};${expires};path=/;SameSite=Strict`;
        }
    };

    // Accessibility Manager
    const AccessibilityManager = {
        init: function() {
            this.setupSkipLinks();
            this.setupKeyboardNav();
            this.setupAriaLive();
        },

        setupSkipLinks: function() {
            const skipLink = document.querySelector('.skip-link');
            if (skipLink) {
                skipLink.addEventListener('click', function(e) {
                    const target = document.querySelector(this.getAttribute('href'));
                    if (target) {
                        target.tabIndex = -1;
                        target.focus();
                    }
                });
            }
        },

        setupKeyboardNav: function() {
            // Tab trap for modals
            document.addEventListener('keydown', function(e) {
                if (e.key === 'Escape') {
                    const openModals = document.querySelectorAll('.modal.open');
                    openModals.forEach(modal => modal.classList.remove('open'));
                }
            });
        },

        setupAriaLive: function() {
            // Create aria-live region for announcements
            const liveRegion = document.createElement('div');
            liveRegion.setAttribute('aria-live', 'polite');
            liveRegion.setAttribute('aria-atomic', 'true');
            liveRegion.className = 'sr-only';
            liveRegion.id = 'aria-announcements';
            document.body.appendChild(liveRegion);
        },

        announce: function(message) {
            const liveRegion = document.getElementById('aria-announcements');
            if (liveRegion) {
                liveRegion.textContent = message;
                setTimeout(() => liveRegion.textContent = '', 3000);
            }
        }
    };

    // Form Handler
    const FormHandler = {
        init: function() {
            const forms = document.querySelectorAll('form[data-validate="true"]');
            forms.forEach(form => this.setupForm(form));
        },

        setupForm: function(form) {
            form.addEventListener('submit', (e) => this.handleSubmit(e, form));
            
            // Real-time validation
            const inputs = form.querySelectorAll('input, textarea, select');
            inputs.forEach(input => {
                input.addEventListener('blur', () => this.validateField(input));
                input.addEventListener('input', Utils.debounce(() => this.validateField(input), 500));
            });
        },

        validateField: function(field) {
            const errorElement = field.parentElement.querySelector('.form-error');
            let isValid = true;
            let errorMessage = '';

            // Required validation
            if (field.hasAttribute('required') && !field.value.trim()) {
                isValid = false;
                errorMessage = 'This field is required.';
            }

            // Email validation
            if (field.type === 'email' && field.value) {
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(field.value)) {
                    isValid = false;
                    errorMessage = 'Please enter a valid email address.';
                }
            }

            // Phone validation
            if (field.type === 'tel' && field.value) {
                const phoneRegex = /^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/;
                if (!phoneRegex.test(field.value)) {
                    isValid = false;
                    errorMessage = 'Please enter a valid phone number.';
                }
            }

            // Update UI
            if (isValid) {
                field.classList.remove('error');
                if (errorElement) errorElement.remove();
            } else {
                field.classList.add('error');
                if (!errorElement) {
                    const error = document.createElement('div');
                    error.className = 'form-error';
                    error.textContent = errorMessage;
                    field.parentElement.appendChild(error);
                } else {
                    errorElement.textContent = errorMessage;
                }
            }

            return isValid;
        },

        handleSubmit: async function(e, form) {
            e.preventDefault();

            // Validate all fields
            const inputs = form.querySelectorAll('input, textarea, select');
            let isFormValid = true;
            
            inputs.forEach(input => {
                if (!this.validateField(input)) {
                    isFormValid = false;
                }
            });

            if (!isFormValid) {
                AccessibilityManager.announce('Please correct the errors in the form.');
                return;
            }

            // Show loading state
            const submitBtn = form.querySelector('[type="submit"]');
            const originalText = submitBtn.textContent;
            submitBtn.textContent = 'Submitting...';
            submitBtn.disabled = true;

            try {
                // Simulate form submission
                const formData = new FormData(form);
                const data = Object.fromEntries(formData);
                
                // Track form submission
                Analytics.track('Form Submitted', {
                    formName: form.dataset.formName || 'Unknown',
                    data: data
                });

                // Show success message
                setTimeout(() => {
                    submitBtn.textContent = 'Success!';
                    AccessibilityManager.announce('Form submitted successfully.');
                    
                    // Reset form after delay
                    setTimeout(() => {
                        form.reset();
                        submitBtn.textContent = originalText;
                        submitBtn.disabled = false;
                    }, 2000);
                }, 1000);

            } catch (error) {
                console.error('Form submission error:', error);
                submitBtn.textContent = 'Error. Try again.';
                submitBtn.disabled = false;
                AccessibilityManager.announce('Form submission failed. Please try again.');
            }
        }
    };

    // Analytics Module
    const Analytics = {
        init: function() {
            // Initialize tracking
            this.trackPageView();
            this.setupEventTracking();
        },

        trackPageView: function() {
            if (typeof gtag !== 'undefined') {
                gtag('config', CONFIG.ANALYTICS_ID, {
                    page_path: window.location.pathname
                });
            }
        },

        track: function(eventName, parameters) {
            if (typeof gtag !== 'undefined') {
                gtag('event', eventName, parameters);
            }
            console.log('Analytics Event:', eventName, parameters);
        },

        setupEventTracking: function() {
            // Track CTA clicks
            document.addEventListener('click', (e) => {
                if (e.target.matches('.btn, [data-track]')) {
                    const trackData = e.target.dataset.track || e.target.textContent;
                    this.track('CTA Click', {
                        text: trackData,
                        url: e.target.href || window.location.href
                    });
                }
            });

            // Track phone clicks
            document.addEventListener('click', (e) => {
                if (e.target.matches('a[href^="tel:"]')) {
                    this.track('Phone Click', {
                        number: e.target.href.replace('tel:', '')
                    });
                }
            });
        }
    };

    // Performance Monitor
    const Performance = {
        init: function() {
            // Lazy load images
            this.setupLazyLoading();
            
            // Monitor Core Web Vitals
            this.monitorWebVitals();
        },

        setupLazyLoading: function() {
            if ('IntersectionObserver' in window) {
                const imageObserver = new IntersectionObserver((entries, observer) => {
                    entries.forEach(entry => {
                        if (entry.isIntersecting) {
                            const img = entry.target;
                            img.src = img.dataset.src;
                            img.classList.add('loaded');
                            observer.unobserve(img);
                        }
                    });
                });

                const lazyImages = document.querySelectorAll('img[data-src]');
                lazyImages.forEach(img => imageObserver.observe(img));
            }
        },

        monitorWebVitals: function() {
            // Log performance metrics
            if ('PerformanceObserver' in window) {
                try {
                    const observer = new PerformanceObserver((list) => {
                        for (const entry of list.getEntries()) {
                            Analytics.track('Web Vitals', {
                                name: entry.name,
                                value: Math.round(entry.startTime + entry.duration)
                            });
                        }
                    });
                    observer.observe({ entryTypes: ['largest-contentful-paint'] });
                } catch (e) {
                    console.log('Web Vitals monitoring not supported');
                }
            }
        }
    };

    // Mobile Menu Handler
    const MobileMenu = {
        init: function() {
            const menuToggle = document.querySelector('.mobile-menu-toggle');
            const mobileMenu = document.querySelector('.mobile-menu');
            
            if (menuToggle && mobileMenu) {
                menuToggle.addEventListener('click', () => this.toggle(mobileMenu));
                
                // Close on outside click
                document.addEventListener('click', (e) => {
                    if (!e.target.closest('.mobile-menu') && !e.target.closest('.mobile-menu-toggle')) {
                        this.close(mobileMenu);
                    }
                });
            }
        },

        toggle: function(menu) {
            menu.classList.toggle('open');
            const isOpen = menu.classList.contains('open');
            menu.setAttribute('aria-expanded', isOpen);
            AccessibilityManager.announce(isOpen ? 'Menu opened' : 'Menu closed');
        },

        close: function(menu) {
            menu.classList.remove('open');
            menu.setAttribute('aria-expanded', 'false');
        }
    };

    // Smooth Scroll
    const SmoothScroll = {
        init: function() {
            document.addEventListener('click', (e) => {
                if (e.target.matches('a[href^="#"]')) {
                    e.preventDefault();
                    const target = document.querySelector(e.target.getAttribute('href'));
                    if (target) {
                        this.scrollTo(target);
                    }
                }
            });
        },

        scrollTo: function(element) {
            const offset = 80; // Header height
            const elementPosition = element.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset - offset;

            window.scrollTo({
                top: offsetPosition,
                behavior: 'smooth'
            });
        }
    };

    // Initialize everything when DOM is ready
    document.addEventListener('DOMContentLoaded', function() {
        AccessibilityManager.init();
        FormHandler.init();
        Analytics.init();
        Performance.init();
        MobileMenu.init();
        SmoothScroll.init();
        
        // Set copyright year
        const yearElements = document.querySelectorAll('.current-year');
        yearElements.forEach(el => el.textContent = new Date().getFullYear());
    });

    // Expose public API
    window.DentalSite = {
        CONFIG,
        Utils,
        Analytics,
        AccessibilityManager
    };

})();