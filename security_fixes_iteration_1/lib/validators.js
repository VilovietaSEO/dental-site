/**
 * Input Validation Library
 * Strong validation patterns with length limits and security checks
 */

/**
 * Validation patterns with security considerations
 */
const patterns = {
  // Email pattern - RFC 5322 simplified
  email: /^[a-zA-Z0-9.!#$%&'*+\/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/,
  
  // Phone patterns
  phone: {
    us: /^(?:\+1\s?)?(?:\(\d{3}\)|\d{3})[\s.-]?\d{3}[\s.-]?\d{4}$/,
    international: /^(?:\+\d{1,3}\s?)?(?:\(\d{1,4}\)|\d{1,4})[\s.-]?\d{1,14}$/,
    digits: /^[\d\s\-\(\)\+\.]+$/
  },
  
  // Name patterns - allows Unicode letters, spaces, hyphens, apostrophes
  name: /^[\p{L}\s\-'\.]{2,50}$/u,
  
  // URL pattern
  url: /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/,
  
  // Date patterns
  date: {
    iso: /^\d{4}-\d{2}-\d{2}$/,
    us: /^(0[1-9]|1[0-2])\/(0[1-9]|[12]\d|3[01])\/\d{4}$/
  },
  
  // Time pattern (24-hour)
  time: /^([01]\d|2[0-3]):([0-5]\d)$/,
  
  // Alphanumeric with spaces
  alphanumeric: /^[a-zA-Z0-9\s]+$/,
  
  // Safe text - no HTML/script tags
  safeText: /^[^<>]*$/,
  
  // Insurance member ID
  insuranceId: /^[A-Z0-9\-]{5,20}$/,
  
  // Zip code
  zipCode: {
    us: /^\d{5}(-\d{4})?$/,
    ca: /^[A-Z]\d[A-Z]\s?\d[A-Z]\d$/i
  }
};

/**
 * Length constraints for different field types
 */
const lengthLimits = {
  name: { min: 2, max: 50 },
  email: { min: 5, max: 100 },
  phone: { min: 10, max: 20 },
  message: { min: 10, max: 2000 },
  subject: { min: 3, max: 200 },
  notes: { min: 0, max: 1000 },
  address: { min: 10, max: 200 },
  insuranceId: { min: 5, max: 30 },
  password: { min: 8, max: 128 }
};

/**
 * Validation functions
 */
const validators = {
  /**
   * Validate email address
   */
  email(email) {
    if (!email || typeof email !== 'string') {
      return { valid: false, error: 'Email is required' };
    }
    
    const trimmed = email.trim().toLowerCase();
    
    if (trimmed.length < lengthLimits.email.min || trimmed.length > lengthLimits.email.max) {
      return { valid: false, error: `Email must be between ${lengthLimits.email.min} and ${lengthLimits.email.max} characters` };
    }
    
    if (!patterns.email.test(trimmed)) {
      return { valid: false, error: 'Invalid email format' };
    }
    
    // Check for common test/spam emails
    const spamEmails = ['test@test.com', 'test@example.com', 'spam@spam.com'];
    if (spamEmails.includes(trimmed)) {
      return { valid: false, error: 'Please use a valid email address' };
    }
    
    return { valid: true, value: trimmed };
  },

  /**
   * Validate phone number
   */
  phone(phone, country = 'us') {
    if (!phone || typeof phone !== 'string') {
      return { valid: false, error: 'Phone number is required' };
    }
    
    const cleaned = phone.replace(/\s/g, '');
    
    if (cleaned.length < lengthLimits.phone.min || cleaned.length > lengthLimits.phone.max) {
      return { valid: false, error: `Phone number must be between ${lengthLimits.phone.min} and ${lengthLimits.phone.max} digits` };
    }
    
    const pattern = patterns.phone[country] || patterns.phone.international;
    if (!pattern.test(phone)) {
      return { valid: false, error: 'Invalid phone number format' };
    }
    
    return { valid: true, value: phone.trim() };
  },

  /**
   * Validate name
   */
  name(name, fieldName = 'Name') {
    if (!name || typeof name !== 'string') {
      return { valid: false, error: `${fieldName} is required` };
    }
    
    const trimmed = name.trim();
    
    if (trimmed.length < lengthLimits.name.min || trimmed.length > lengthLimits.name.max) {
      return { valid: false, error: `${fieldName} must be between ${lengthLimits.name.min} and ${lengthLimits.name.max} characters` };
    }
    
    if (!patterns.name.test(trimmed)) {
      return { valid: false, error: `${fieldName} contains invalid characters` };
    }
    
    // Check for suspicious patterns
    if (/(.)\1{4,}/.test(trimmed)) {
      return { valid: false, error: `${fieldName} contains invalid patterns` };
    }
    
    return { valid: true, value: trimmed };
  },

  /**
   * Validate date
   */
  date(date, options = {}) {
    if (!date) {
      return { valid: false, error: 'Date is required' };
    }
    
    const dateObj = new Date(date);
    if (isNaN(dateObj.getTime())) {
      return { valid: false, error: 'Invalid date format' };
    }
    
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    
    if (options.notPast && dateObj < now) {
      return { valid: false, error: 'Date cannot be in the past' };
    }
    
    if (options.notFuture && dateObj > now) {
      return { valid: false, error: 'Date cannot be in the future' };
    }
    
    if (options.maxDays) {
      const maxDate = new Date();
      maxDate.setDate(maxDate.getDate() + options.maxDays);
      if (dateObj > maxDate) {
        return { valid: false, error: `Date cannot be more than ${options.maxDays} days in the future` };
      }
    }
    
    return { valid: true, value: dateObj.toISOString().split('T')[0] };
  },

  /**
   * Validate message/text content
   */
  message(text, options = {}) {
    const fieldName = options.fieldName || 'Message';
    const minLength = options.minLength || lengthLimits.message.min;
    const maxLength = options.maxLength || lengthLimits.message.max;
    
    if (!text || typeof text !== 'string') {
      return { valid: false, error: `${fieldName} is required` };
    }
    
    const trimmed = text.trim();
    
    if (trimmed.length < minLength || trimmed.length > maxLength) {
      return { valid: false, error: `${fieldName} must be between ${minLength} and ${maxLength} characters` };
    }
    
    // Check for HTML/script injection
    if (!patterns.safeText.test(trimmed)) {
      return { valid: false, error: `${fieldName} contains invalid characters` };
    }
    
    // Check for excessive URLs (spam indicator)
    const urlMatches = trimmed.match(patterns.url) || [];
    if (urlMatches.length > (options.maxUrls || 2)) {
      return { valid: false, error: 'Message contains too many URLs' };
    }
    
    return { valid: true, value: trimmed };
  },

  /**
   * Validate appointment type
   */
  appointmentType(type) {
    const validTypes = [
      'general-checkup',
      'cleaning',
      'filling',
      'crown',
      'root-canal',
      'extraction',
      'whitening',
      'orthodontics',
      'emergency',
      'consultation',
      'other'
    ];
    
    if (!type || !validTypes.includes(type)) {
      return { valid: false, error: 'Please select a valid appointment type' };
    }
    
    return { valid: true, value: type };
  },

  /**
   * Validate time
   */
  time(time) {
    if (!time || !patterns.time.test(time)) {
      return { valid: false, error: 'Please enter a valid time (HH:MM)' };
    }
    
    const [hours, minutes] = time.split(':').map(Number);
    
    // Check business hours (8 AM - 6 PM)
    if (hours < 8 || hours > 17 || (hours === 17 && minutes > 0)) {
      return { valid: false, error: 'Please select a time during business hours (8:00 AM - 5:00 PM)' };
    }
    
    return { valid: true, value: time };
  },

  /**
   * Validate boolean
   */
  boolean(value) {
    return { valid: true, value: Boolean(value) };
  },

  /**
   * Validate insurance information
   */
  insurance(data) {
    const errors = [];
    const validated = {};
    
    validated.hasInsurance = Boolean(data.hasInsurance);
    
    if (validated.hasInsurance) {
      if (!data.provider || data.provider.length < 2 || data.provider.length > 50) {
        errors.push('Insurance provider name is invalid');
      } else {
        validated.provider = data.provider.trim();
      }
      
      if (!data.memberId || !patterns.insuranceId.test(data.memberId)) {
        errors.push('Insurance member ID is invalid');
      } else {
        validated.memberId = data.memberId.trim().toUpperCase();
      }
    }
    
    if (errors.length > 0) {
      return { valid: false, errors };
    }
    
    return { valid: true, value: validated };
  }
};

/**
 * Validate a complete form object
 */
function validateForm(data, schema) {
  const errors = {};
  const validated = {};
  
  for (const [field, rules] of Object.entries(schema)) {
    const value = data[field];
    const validator = validators[rules.type] || validators.message;
    
    const result = validator(value, rules.options || {});
    
    if (!result.valid) {
      errors[field] = result.error || result.errors;
    } else {
      validated[field] = result.value;
    }
  }
  
  if (Object.keys(errors).length > 0) {
    return { valid: false, errors };
  }
  
  return { valid: true, data: validated };
}

module.exports = {
  patterns,
  lengthLimits,
  validators,
  validateForm
};