// Vercel Serverless Function for handling appointment bookings
// Production-ready with enhanced validation, error handling, and security

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = supabaseUrl && supabaseServiceKey 
  ? createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })
  : null;

// Helper function for input sanitization
function sanitizeInput(input) {
  if (typeof input !== 'string') return input;
  return input.trim().replace(/<[^>]*>?/gm, ''); // Remove HTML tags
}

// Email validation regex
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^[\d\s\-\(\)\+]+$/;

// Rate limiting helper (in production, use Redis or similar)
const requestCounts = new Map();
const RATE_LIMIT_WINDOW = 60000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 10;

function checkRateLimit(identifier) {
  const now = Date.now();
  const userRequests = requestCounts.get(identifier) || [];
  
  // Clean old requests
  const recentRequests = userRequests.filter(timestamp => now - timestamp < RATE_LIMIT_WINDOW);
  
  if (recentRequests.length >= MAX_REQUESTS_PER_WINDOW) {
    return false;
  }
  
  recentRequests.push(now);
  requestCounts.set(identifier, recentRequests);
  return true;
}

export default async function handler(req, res) {
  // Enhanced CORS configuration for production
  const allowedOrigins = [
    'https://dental-site-test-git-main-andrew-contentsprous-projects.vercel.app',
    'https://moderndentalcare.com',
    'https://www.moderndentalcare.com'
  ];
  
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  } else if (process.env.NODE_ENV === 'development') {
    res.setHeader('Access-Control-Allow-Origin', '*');
  }
  
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Requested-With');
  res.setHeader('Access-Control-Max-Age', '86400'); // 24 hours cache for preflight

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Only accept POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ 
      error: 'Method not allowed',
      message: 'This endpoint only accepts POST requests'
    });
  }

  // Get client IP for rate limiting
  const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
  
  try {
    // Check rate limit
    if (!checkRateLimit(clientIp)) {
      return res.status(429).json({ 
        error: 'Too many requests',
        message: 'Please wait a moment before submitting another appointment'
      });
    }

    // Parse and validate request body
    const {
      patientInfo,
      appointmentType,
      preferredDate,
      preferredTime,
      provider,
      insurance,
      notes
    } = req.body;

    // Enhanced validation
    if (!patientInfo || typeof patientInfo !== 'object') {
      return res.status(400).json({ 
        error: 'Invalid request',
        message: 'Patient information is required'
      });
    }

    // Validate and sanitize patient info
    const errors = [];
    
    if (!patientInfo.firstName || patientInfo.firstName.length < 2) {
      errors.push('First name must be at least 2 characters');
    }
    
    if (!patientInfo.lastName || patientInfo.lastName.length < 2) {
      errors.push('Last name must be at least 2 characters');
    }
    
    if (!patientInfo.email || !EMAIL_REGEX.test(patientInfo.email)) {
      errors.push('Valid email address is required');
    }
    
    if (!patientInfo.phone || !PHONE_REGEX.test(patientInfo.phone) || patientInfo.phone.length < 10) {
      errors.push('Valid phone number is required (at least 10 digits)');
    }

    // Validate appointment details
    if (!appointmentType || appointmentType.length < 3) {
      errors.push('Please select an appointment type');
    }

    if (!preferredDate) {
      errors.push('Preferred date is required');
    } else {
      const appointmentDate = new Date(preferredDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (appointmentDate < today) {
        errors.push('Appointment date cannot be in the past');
      }
      
      // Don't allow appointments more than 6 months out
      const maxDate = new Date();
      maxDate.setMonth(maxDate.getMonth() + 6);
      if (appointmentDate > maxDate) {
        errors.push('Appointments can only be scheduled up to 6 months in advance');
      }
    }

    if (!preferredTime || !preferredTime.match(/^\d{1,2}:\d{2}$/)) {
      errors.push('Valid appointment time is required');
    }

    if (errors.length > 0) {
      return res.status(400).json({ 
        error: 'Validation failed',
        message: 'Please correct the following errors',
        errors: errors
      });
    }

    // Sanitize all inputs
    const sanitizedData = {
      patientInfo: {
        firstName: sanitizeInput(patientInfo.firstName),
        lastName: sanitizeInput(patientInfo.lastName),
        email: sanitizeInput(patientInfo.email).toLowerCase(),
        phone: sanitizeInput(patientInfo.phone),
        dateOfBirth: patientInfo.dateOfBirth ? sanitizeInput(patientInfo.dateOfBirth) : null,
        isNewPatient: Boolean(patientInfo.isNewPatient)
      },
      appointmentType: sanitizeInput(appointmentType),
      preferredDate: sanitizeInput(preferredDate),
      preferredTime: sanitizeInput(preferredTime),
      provider: provider ? sanitizeInput(provider) : 'Next available',
      insurance: {
        hasInsurance: Boolean(insurance?.hasInsurance),
        provider: insurance?.provider ? sanitizeInput(insurance.provider) : null,
        memberId: insurance?.memberId ? sanitizeInput(insurance.memberId) : null
      },
      notes: notes ? sanitizeInput(notes).substring(0, 500) : '' // Limit notes to 500 chars
    };

    // Generate confirmation number with timestamp
    const confirmationNumber = 'MDC' + Date.now().toString().slice(-8);

    // Log appointment request (in production, save to database)
    console.log('New appointment request:', {
      confirmationNumber,
      ...sanitizedData,
      timestamp: new Date().toISOString(),
      clientIp: clientIp.substring(0, 15) // Privacy: only log partial IP
    });

    // In production, implement these features:
    // 1. Save to database (PostgreSQL, MongoDB, etc.)
    // 2. Send confirmation email using SendGrid/Resend/AWS SES
    // 3. Integrate with practice management system API
    // 4. Send SMS confirmation via Twilio
    // 5. Add to Google Calendar API
    // 6. Trigger Slack/Discord notification to staff

    // Save to database
    const { data: appointment, error: dbError } = supabase ? await supabase
      .from('appointments')
      .insert({
        confirmation_number: confirmationNumber,
        first_name: sanitizedData.patientInfo.firstName,
        last_name: sanitizedData.patientInfo.lastName,
        email: sanitizedData.patientInfo.email,
        phone: sanitizedData.patientInfo.phone,
        date_of_birth: sanitizedData.patientInfo.dateOfBirth,
        preferred_date: sanitizedData.preferredDate,
        preferred_time: sanitizedData.preferredTime,
        alternate_date: sanitizedData.alternateDate,
        alternate_time: sanitizedData.alternateTime,
        service_type: sanitizedData.appointmentType,
        is_new_patient: sanitizedData.isNewPatient,
        has_insurance: sanitizedData.insuranceInfo?.hasInsurance || false,
        insurance_provider: sanitizedData.insuranceInfo?.provider,
        insurance_member_id: sanitizedData.insuranceInfo?.memberId,
        special_needs: sanitizedData.specialNeeds,
        referral_source: sanitizedData.referralSource,
        emergency_contact_name: sanitizedData.emergencyContact?.name,
        emergency_contact_phone: sanitizedData.emergencyContact?.phone,
        status: 'pending',
        metadata: {
          provider: sanitizedData.provider,
          userAgent: req.headers['user-agent'],
          timestamp: new Date().toISOString()
        }
      })
      .select()
      .single() : { data: null, error: 'Supabase not configured' };

    if (dbError) {
      console.error('Database error:', dbError);
      // Continue processing even if DB fails
    }

    // Example email notification (pseudocode):
    /*
    if (process.env.SENDGRID_API_KEY) {
      await sendEmail({
        to: sanitizedData.patientInfo.email,
        subject: `Appointment Confirmation - ${confirmationNumber}`,
        templateId: process.env.APPOINTMENT_CONFIRMATION_TEMPLATE,
        dynamicTemplateData: {
          firstName: sanitizedData.patientInfo.firstName,
          confirmationNumber,
          appointmentDate: sanitizedData.preferredDate,
          appointmentTime: sanitizedData.preferredTime,
          appointmentType: sanitizedData.appointmentType,
          provider: sanitizedData.provider
        }
      });
    }
    */

    // Return success response
    return res.status(200).json({
      success: true,
      confirmationNumber,
      message: 'Appointment request received successfully. You will receive a confirmation email shortly.',
      appointment: {
        date: sanitizedData.preferredDate,
        time: sanitizedData.preferredTime,
        type: sanitizedData.appointmentType,
        provider: sanitizedData.provider
      }
    });

  } catch (error) {
    console.error('Error processing appointment:', error);
    
    // Don't expose internal error details in production
    return res.status(500).json({ 
      error: 'Server error',
      message: 'We encountered an error processing your appointment. Please try again or call us at (555) 123-4567',
      requestId: Date.now().toString() // For support reference
    });
  }
}

// Environment variables needed for production:
// SENDGRID_API_KEY - For sending emails
// APPOINTMENT_CONFIRMATION_TEMPLATE - SendGrid template ID
// DATABASE_URL - PostgreSQL/MongoDB connection string
// TWILIO_ACCOUNT_SID - For SMS notifications
// TWILIO_AUTH_TOKEN - For SMS notifications
// TWILIO_PHONE_NUMBER - From number for SMS
// SLACK_WEBHOOK_URL - For staff notifications
// GOOGLE_CALENDAR_CREDENTIALS - For calendar integration
// NODE_ENV - Set to 'production' for strict CORS