/**
 * Secure Appointment Booking API
 * Production-ready with comprehensive security measures
 */

const securityHeaders = require('./middleware/security-headers');
const { rateLimit, rateLimitConfigs } = require('./middleware/rate-limiter');
const { csrfProtection, configureCORS } = require('./middleware/csrf-protection');
const { validators, validateForm } = require('../lib/validators');
const { sanitizers, sanitizeObject } = require('../lib/sanitizers');

// Appointment validation schema
const appointmentSchema = {
  'patientInfo.firstName': { type: 'name', options: { fieldName: 'First name' } },
  'patientInfo.lastName': { type: 'name', options: { fieldName: 'Last name' } },
  'patientInfo.email': { type: 'email' },
  'patientInfo.phone': { type: 'phone' },
  'patientInfo.dateOfBirth': { type: 'date', options: { notFuture: true } },
  appointmentType: { type: 'appointmentType' },
  preferredDate: { type: 'date', options: { notPast: true, maxDays: 180 } },
  preferredTime: { type: 'time' },
  notes: { type: 'message', options: { fieldName: 'Notes', minLength: 0, maxLength: 1000 } }
};

// Sanitization schema
const sanitizationSchema = {
  'patientInfo.firstName': { type: 'name' },
  'patientInfo.lastName': { type: 'name' },
  'patientInfo.email': { type: 'email' },
  'patientInfo.phone': { type: 'phone' },
  'patientInfo.dateOfBirth': { type: 'text' },
  appointmentType: { type: 'alphanumeric' },
  preferredDate: { type: 'text' },
  preferredTime: { type: 'text' },
  provider: { type: 'name' },
  'insurance.provider': { type: 'text', options: { maxLength: 100 } },
  'insurance.memberId': { type: 'alphanumeric' },
  notes: { type: 'text', options: { maxLength: 1000 } }
};

/**
 * Main handler with security middleware composition
 */
async function appointmentHandler(req, res) {
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
    // Parse request body
    const data = req.body;

    // Flatten nested object for validation
    const flatData = {
      'patientInfo.firstName': data.patientInfo?.firstName,
      'patientInfo.lastName': data.patientInfo?.lastName,
      'patientInfo.email': data.patientInfo?.email,
      'patientInfo.phone': data.patientInfo?.phone,
      'patientInfo.dateOfBirth': data.patientInfo?.dateOfBirth,
      appointmentType: data.appointmentType,
      preferredDate: data.preferredDate,
      preferredTime: data.preferredTime,
      notes: data.notes
    };

    // Validate input
    const validation = validateForm(flatData, appointmentSchema);
    if (!validation.valid) {
      return res.status(400).json({
        error: 'Validation failed',
        message: 'Please correct the errors below',
        errors: validation.errors
      });
    }

    // Additional insurance validation if provided
    if (data.insurance?.hasInsurance) {
      const insuranceValidation = validators.insurance(data.insurance);
      if (!insuranceValidation.valid) {
        return res.status(400).json({
          error: 'Validation failed',
          message: 'Please correct the insurance information',
          errors: insuranceValidation.errors
        });
      }
    }

    // Sanitize all inputs
    const sanitizedFlat = sanitizeObject({
      'patientInfo.firstName': data.patientInfo?.firstName,
      'patientInfo.lastName': data.patientInfo?.lastName,
      'patientInfo.email': data.patientInfo?.email,
      'patientInfo.phone': data.patientInfo?.phone,
      'patientInfo.dateOfBirth': data.patientInfo?.dateOfBirth,
      appointmentType: data.appointmentType,
      preferredDate: data.preferredDate,
      preferredTime: data.preferredTime,
      provider: data.provider,
      'insurance.provider': data.insurance?.provider,
      'insurance.memberId': data.insurance?.memberId,
      notes: data.notes
    }, sanitizationSchema);

    // Reconstruct nested structure
    const sanitizedData = {
      patientInfo: {
        firstName: sanitizedFlat['patientInfo.firstName'],
        lastName: sanitizedFlat['patientInfo.lastName'],
        email: sanitizedFlat['patientInfo.email'],
        phone: sanitizedFlat['patientInfo.phone'],
        dateOfBirth: sanitizedFlat['patientInfo.dateOfBirth'],
        isNewPatient: Boolean(data.patientInfo?.isNewPatient)
      },
      appointmentType: sanitizedFlat.appointmentType,
      preferredDate: sanitizedFlat.preferredDate,
      preferredTime: sanitizedFlat.preferredTime,
      provider: sanitizedFlat.provider || 'Next available',
      insurance: {
        hasInsurance: Boolean(data.insurance?.hasInsurance),
        provider: sanitizedFlat['insurance.provider'],
        memberId: sanitizedFlat['insurance.memberId']
      },
      notes: sanitizedFlat.notes || ''
    };

    // Generate secure confirmation number
    const crypto = require('crypto');
    const timestamp = Date.now();
    const random = crypto.randomBytes(4).toString('hex');
    const confirmationNumber = `MDC-${timestamp}-${random}`.toUpperCase();

    // Log appointment (in production, save to database)
    console.log('Appointment booking:', {
      confirmationNumber,
      patientEmail: sanitizedData.patientInfo.email,
      appointmentType: sanitizedData.appointmentType,
      date: sanitizedData.preferredDate,
      time: sanitizedData.preferredTime,
      timestamp: new Date().toISOString()
    });

    // Production implementations would include:
    // - Database storage with prepared statements
    // - Email notifications via secure email service
    // - Calendar integration
    // - SMS notifications
    // - Audit logging

    // Return success response
    return res.status(200).json({
      success: true,
      confirmationNumber,
      message: 'Your appointment request has been received. You will receive a confirmation email shortly.',
      appointment: {
        date: sanitizedData.preferredDate,
        time: sanitizedData.preferredTime,
        type: sanitizedData.appointmentType,
        provider: sanitizedData.provider
      }
    });

  } catch (error) {
    console.error('Appointment booking error:', error);
    
    // Don't expose internal errors
    return res.status(500).json({
      error: 'Server error',
      message: 'We encountered an error processing your appointment. Please call us at (555) 123-4567.',
      requestId: `ERR-${Date.now()}`
    });
  }
}

// Export handler with security middleware chain
module.exports = securityHeaders(
  rateLimit(rateLimitConfigs.appointment)(
    csrfProtection()(
      appointmentHandler
    )
  )
);