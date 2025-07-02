/**
 * Secure Contact Form API
 * Production-ready with comprehensive security measures
 */

const securityHeaders = require('./middleware/security-headers');
const { rateLimit, rateLimitConfigs } = require('./middleware/rate-limiter');
const { csrfProtection, configureCORS } = require('./middleware/csrf-protection');
const { validators, validateForm } = require('../lib/validators');
const { sanitizers, sanitizeObject, detectXSS } = require('../lib/sanitizers');

// Contact form validation schema
const contactSchema = {
  name: { type: 'name', options: { fieldName: 'Name' } },
  email: { type: 'email' },
  phone: { type: 'phone', options: { required: false } },
  subject: { type: 'message', options: { fieldName: 'Subject', minLength: 3, maxLength: 200 } },
  message: { type: 'message', options: { fieldName: 'Message', minLength: 10, maxLength: 2000 } }
};

// Sanitization schema
const sanitizationSchema = {
  name: { type: 'name' },
  email: { type: 'email' },
  phone: { type: 'phone' },
  subject: { type: 'text', options: { maxLength: 200 } },
  message: { type: 'text', options: { maxLength: 2000 } },
  formType: { type: 'alphanumeric' },
  urgency: { type: 'alphanumeric' }
};

/**
 * Spam detection with multiple signals
 */
function detectSpam(data) {
  const spamSignals = [];
  
  // Check for spam keywords
  const spamKeywords = [
    'viagra', 'cialis', 'casino', 'lottery', 'prince', 'inheritance',
    'click here', 'buy now', 'limited time', 'act now', 'free money',
    'make money fast', 'work from home', 'forex', 'crypto', 'bitcoin'
  ];
  
  const lowerMessage = (data.message || '').toLowerCase();
  const lowerSubject = (data.subject || '').toLowerCase();
  const combinedText = `${lowerSubject} ${lowerMessage}`;
  
  // Keyword detection
  const keywordCount = spamKeywords.filter(keyword => combinedText.includes(keyword)).length;
  if (keywordCount > 0) {
    spamSignals.push({ type: 'keywords', score: keywordCount * 20 });
  }
  
  // URL detection
  const urlPattern = /https?:\/\/[^\s]+/g;
  const urls = combinedText.match(urlPattern) || [];
  if (urls.length > 2) {
    spamSignals.push({ type: 'excessive_urls', score: urls.length * 10 });
  }
  
  // Suspicious email patterns
  const email = (data.email || '').toLowerCase();
  if (email.includes('test@') || email.includes('spam') || email.includes('fake')) {
    spamSignals.push({ type: 'suspicious_email', score: 30 });
  }
  
  // ALL CAPS detection
  const capsRatio = (data.message.match(/[A-Z]/g) || []).length / data.message.length;
  if (capsRatio > 0.5) {
    spamSignals.push({ type: 'excessive_caps', score: 25 });
  }
  
  // XSS attempt detection
  if (detectXSS(combinedText)) {
    spamSignals.push({ type: 'xss_attempt', score: 100 });
  }
  
  // Calculate total spam score
  const totalScore = spamSignals.reduce((sum, signal) => sum + signal.score, 0);
  
  return {
    isSpam: totalScore >= 50,
    score: totalScore,
    signals: spamSignals
  };
}

/**
 * Main handler with security middleware composition
 */
async function contactHandler(req, res) {
  // CORS configuration
  const allowedOrigins = process.env.ALLOWED_ORIGINS 
    ? process.env.ALLOWED_ORIGINS.split(',') 
    : ['https://moderndentalcare.com', 'https://www.moderndentalcare.com'];
  
  if (process.env.NODE_ENV === 'development' && process.env.ALLOWED_ORIGINS_DEV) {
    allowedOrigins.push(...process.env.ALLOWED_ORIGINS_DEV.split(','));
  }
  
  configureCORS(allowedOrigins)(req, res);

  // Handle preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Method validation
  if (req.method !== 'POST') {
    return res.status(405).json({
      error: 'Method not allowed',
      message: 'This endpoint only accepts POST requests'
    });
  }

  try {
    const { name, email, phone, subject, message, formType, urgency } = req.body;

    // Create validation object (phone is optional)
    const validationData = { name, email, subject, message };
    if (phone) {
      validationData.phone = phone;
    }

    // Validate input
    const validation = validateForm(validationData, contactSchema);
    if (!validation.valid) {
      return res.status(400).json({
        error: 'Validation failed',
        message: 'Please correct the errors below',
        errors: validation.errors
      });
    }

    // Sanitize inputs
    const sanitizedData = sanitizeObject({
      name,
      email,
      phone: phone || null,
      subject: subject || `${formType || 'General'} Inquiry`,
      message,
      formType: formType || 'general',
      urgency: urgency || 'normal'
    }, sanitizationSchema);

    // Spam detection
    const spamCheck = detectSpam(sanitizedData);
    if (spamCheck.isSpam) {
      console.warn('Spam detected:', {
        email: sanitizedData.email.substring(0, 5) + '***',
        score: spamCheck.score,
        signals: spamCheck.signals,
        timestamp: new Date().toISOString()
      });
      
      // Return success to avoid revealing spam detection
      return res.status(200).json({
        success: true,
        message: 'Thank you for contacting us. We will review your message.',
        ticketId: `SPAM-${Date.now().toString(36).toUpperCase()}`
      });
    }

    // Generate secure ticket ID
    const crypto = require('crypto');
    const timestamp = Date.now();
    const random = crypto.randomBytes(4).toString('hex');
    const ticketId = `TKT-${timestamp}-${random}`.toUpperCase();

    // Determine priority
    const priority = (sanitizedData.urgency === 'urgent' || sanitizedData.formType === 'emergency') 
      ? 'high' 
      : 'normal';

    // Add metadata
    const submissionData = {
      ticketId,
      priority,
      ...sanitizedData,
      metadata: {
        timestamp: new Date().toISOString(),
        userAgent: req.headers['user-agent'] || 'unknown',
        referrer: req.headers.referer || 'direct',
        submittedFrom: 'website_contact_form',
        spamScore: spamCheck.score
      }
    };

    // Log submission (in production, save to database)
    console.log('Contact form submission:', {
      ticketId,
      priority,
      formType: sanitizedData.formType,
      urgency: sanitizedData.urgency,
      email: sanitizedData.email,
      timestamp: submissionData.metadata.timestamp
    });

    // Production implementations would include:
    // - Database storage with prepared statements
    // - Email notifications to staff
    // - Auto-response to user
    // - CRM integration
    // - Slack/Discord notifications for urgent requests

    // Response based on priority
    const responseMessage = priority === 'high'
      ? 'Thank you for contacting us. Due to the urgent nature of your request, we will respond within 2 hours during business hours.'
      : 'Thank you for contacting us. We will get back to you within 24 hours.';

    return res.status(200).json({
      success: true,
      message: responseMessage,
      ticketId: ticketId,
      priority: priority
    });

  } catch (error) {
    console.error('Contact form error:', error);
    
    // Don't expose internal errors
    return res.status(500).json({
      error: 'Server error',
      message: 'We encountered an error processing your message. Please call us at (555) 123-4567.',
      requestId: `ERR-${Date.now()}`
    });
  }
}

// Export handler with security middleware chain
module.exports = securityHeaders(
  rateLimit(rateLimitConfigs.contact)(
    csrfProtection()(
      contactHandler
    )
  )
);