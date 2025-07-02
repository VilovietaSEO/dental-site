/**
 * Input Sanitization Library
 * Secure sanitization functions to prevent XSS, SQL injection, and other attacks
 */

/**
 * HTML entities map for escaping
 */
const htmlEntities = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#x27;',
  '/': '&#x2F;',
  '`': '&#x60;',
  '=': '&#x3D;'
};

/**
 * SQL dangerous patterns
 */
const sqlPatterns = [
  /(\b)(SELECT|INSERT|UPDATE|DELETE|DROP|UNION|EXEC|EXECUTE|CREATE|ALTER|TRUNCATE)(\b)/gi,
  /(-{2}|\/\*|\*\/|;)/g, // SQL comments and statement separators
  /(\'|\"|\`)/g // Quotes that might be used for injection
];

/**
 * Sanitization functions
 */
const sanitizers = {
  /**
   * Escape HTML entities to prevent XSS
   */
  escapeHtml(text) {
    if (!text || typeof text !== 'string') return '';
    
    return text.replace(/[&<>"'`=\/]/g, char => htmlEntities[char] || char);
  },

  /**
   * Remove all HTML tags
   */
  stripHtml(text) {
    if (!text || typeof text !== 'string') return '';
    
    // Remove script tags and their content first
    let cleaned = text.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
    
    // Remove all other HTML tags
    cleaned = cleaned.replace(/<[^>]*>/g, '');
    
    // Decode HTML entities
    cleaned = cleaned
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#x27;/g, "'")
      .replace(/&#x2F;/g, '/');
    
    return cleaned.trim();
  },

  /**
   * Sanitize for SQL queries (basic protection - use parameterized queries in production)
   */
  escapeSql(text) {
    if (!text || typeof text !== 'string') return '';
    
    let cleaned = text;
    
    // Check for SQL injection patterns
    for (const pattern of sqlPatterns) {
      if (pattern.test(cleaned)) {
        console.warn('Potential SQL injection attempt detected:', {
          pattern: pattern.toString(),
          input: text.substring(0, 50) + '...'
        });
        // Remove dangerous patterns
        cleaned = cleaned.replace(pattern, '');
      }
    }
    
    // Escape single quotes
    cleaned = cleaned.replace(/'/g, "''");
    
    return cleaned;
  },

  /**
   * Sanitize file paths to prevent directory traversal
   */
  sanitizePath(path) {
    if (!path || typeof path !== 'string') return '';
    
    // Remove directory traversal attempts
    let cleaned = path.replace(/\.\./g, '');
    cleaned = cleaned.replace(/[<>:"|?*]/g, ''); // Remove invalid filename characters
    cleaned = cleaned.replace(/\/+/g, '/'); // Normalize multiple slashes
    cleaned = cleaned.replace(/^\//, ''); // Remove leading slash
    
    return cleaned;
  },

  /**
   * Sanitize URL
   */
  sanitizeUrl(url) {
    if (!url || typeof url !== 'string') return '';
    
    try {
      const parsed = new URL(url);
      
      // Only allow http(s) protocols
      if (!['http:', 'https:'].includes(parsed.protocol)) {
        return '';
      }
      
      // Remove credentials from URL
      parsed.username = '';
      parsed.password = '';
      
      return parsed.toString();
    } catch {
      return '';
    }
  },

  /**
   * Sanitize email address
   */
  sanitizeEmail(email) {
    if (!email || typeof email !== 'string') return '';
    
    // Basic email sanitization
    let cleaned = email.trim().toLowerCase();
    cleaned = cleaned.replace(/[<>]/g, ''); // Remove angle brackets
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleaned)) {
      return '';
    }
    
    return cleaned;
  },

  /**
   * Sanitize phone number
   */
  sanitizePhone(phone) {
    if (!phone || typeof phone !== 'string') return '';
    
    // Keep only digits, spaces, and common phone characters
    return phone.replace(/[^0-9\s\-\(\)\+\.]/g, '');
  },

  /**
   * Sanitize name (allows Unicode letters)
   */
  sanitizeName(name) {
    if (!name || typeof name !== 'string') return '';
    
    // Allow letters (including Unicode), spaces, hyphens, apostrophes
    let cleaned = name.trim();
    cleaned = cleaned.replace(/[^-\p{L}\s'\.]/gu, '');
    
    // Limit consecutive spaces
    cleaned = cleaned.replace(/\s+/g, ' ');
    
    return cleaned;
  },

  /**
   * Sanitize alphanumeric input
   */
  sanitizeAlphanumeric(text) {
    if (!text || typeof text !== 'string') return '';
    
    return text.replace(/[^a-zA-Z0-9\s]/g, '');
  },

  /**
   * Sanitize numeric input
   */
  sanitizeNumeric(text) {
    if (!text) return '';
    
    const str = String(text);
    return str.replace(/[^0-9.-]/g, '');
  },

  /**
   * Sanitize and truncate text
   */
  sanitizeText(text, maxLength = 1000) {
    if (!text || typeof text !== 'string') return '';
    
    // Strip HTML and escape
    let cleaned = sanitizers.stripHtml(text);
    
    // Remove control characters
    cleaned = cleaned.replace(/[\x00-\x1F\x7F]/g, '');
    
    // Normalize whitespace
    cleaned = cleaned.replace(/\s+/g, ' ').trim();
    
    // Truncate if needed
    if (cleaned.length > maxLength) {
      cleaned = cleaned.substring(0, maxLength);
    }
    
    return cleaned;
  },

  /**
   * Sanitize JSON string
   */
  sanitizeJson(jsonString) {
    if (!jsonString || typeof jsonString !== 'string') return '{}';
    
    try {
      const parsed = JSON.parse(jsonString);
      // Re-stringify to ensure proper formatting
      return JSON.stringify(parsed);
    } catch {
      return '{}';
    }
  },

  /**
   * General purpose sanitizer
   */
  sanitize(input, type = 'text') {
    const sanitizerMap = {
      text: sanitizers.sanitizeText,
      html: sanitizers.escapeHtml,
      email: sanitizers.sanitizeEmail,
      phone: sanitizers.sanitizePhone,
      name: sanitizers.sanitizeName,
      url: sanitizers.sanitizeUrl,
      path: sanitizers.sanitizePath,
      sql: sanitizers.escapeSql,
      numeric: sanitizers.sanitizeNumeric,
      alphanumeric: sanitizers.sanitizeAlphanumeric,
      json: sanitizers.sanitizeJson
    };
    
    const sanitizer = sanitizerMap[type] || sanitizers.sanitizeText;
    return sanitizer(input);
  }
};

/**
 * Sanitize an entire object
 */
function sanitizeObject(obj, schema) {
  const sanitized = {};
  
  for (const [key, config] of Object.entries(schema)) {
    const value = obj[key];
    
    if (value === undefined || value === null) {
      sanitized[key] = null;
      continue;
    }
    
    const type = config.type || 'text';
    const options = config.options || {};
    
    if (type === 'text' && options.maxLength) {
      sanitized[key] = sanitizers.sanitizeText(value, options.maxLength);
    } else {
      sanitized[key] = sanitizers.sanitize(value, type);
    }
  }
  
  return sanitized;
}

/**
 * Create a content security policy nonce
 */
function generateCSPNonce() {
  const crypto = require('crypto');
  return crypto.randomBytes(16).toString('base64');
}

/**
 * Check for common XSS patterns
 */
function detectXSS(text) {
  if (!text || typeof text !== 'string') return false;
  
  const xssPatterns = [
    /<script[^>]*>.*?<\/script>/gi,
    /javascript:/gi,
    /on\w+\s*=/gi, // Event handlers
    /<iframe/gi,
    /<object/gi,
    /<embed/gi,
    /eval\(/gi,
    /expression\(/gi
  ];
  
  return xssPatterns.some(pattern => pattern.test(text));
}

module.exports = {
  sanitizers,
  sanitizeObject,
  generateCSPNonce,
  detectXSS,
  htmlEntities,
  sqlPatterns
};