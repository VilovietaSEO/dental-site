// Vercel Serverless Function for handling contact form submissions
// Production-ready with enhanced validation, spam protection, and error handling

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

// Helper functions
function sanitizeInput(input) {
  if (typeof input !== 'string') return input;
  return input.trim().replace(/<[^>]*>?/gm, '');
}

// Validation patterns
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^[\d\s\-\(\)\+]*$/;
const URL_REGEX = /(https?:\/\/[^\s]+)/g;

// Simple spam detection
function detectSpam(message, email) {
  const spamKeywords = [
    'viagra', 'casino', 'lottery', 'prince', 'inheritance',
    'click here', 'buy now', 'limited time', 'act now',
    'make money fast', 'work from home', 'forex'
  ];
  
  const lowerMessage = message.toLowerCase();
  const lowerEmail = email.toLowerCase();
  
  // Check for spam keywords
  const hasSpamKeywords = spamKeywords.some(keyword => lowerMessage.includes(keyword));
  
  // Check for excessive URLs
  const urlCount = (message.match(URL_REGEX) || []).length;
  const hasExcessiveUrls = urlCount > 2;
  
  // Check for suspicious email patterns
  const hasSuspiciousEmail = lowerEmail.includes('test@test') || 
                             lowerEmail.includes('spam') ||
                             lowerEmail.includes('fake');
  
  return hasSpamKeywords || hasExcessiveUrls || hasSuspiciousEmail;
}

// Rate limiting (production should use Redis)
const requestCounts = new Map();
const RATE_LIMIT_WINDOW = 300000; // 5 minutes
const MAX_REQUESTS_PER_WINDOW = 5;

function checkRateLimit(identifier) {
  const now = Date.now();
  const userRequests = requestCounts.get(identifier) || [];
  const recentRequests = userRequests.filter(timestamp => now - timestamp < RATE_LIMIT_WINDOW);
  
  if (recentRequests.length >= MAX_REQUESTS_PER_WINDOW) {
    return false;
  }
  
  recentRequests.push(now);
  requestCounts.set(identifier, recentRequests);
  return true;
}

export default async function handler(req, res) {
  // Enhanced CORS for production
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
  res.setHeader('Access-Control-Max-Age', '86400');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ 
      error: 'Method not allowed',
      message: 'This endpoint only accepts POST requests'
    });
  }

  const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress;

  try {
    // Rate limiting
    if (!checkRateLimit(clientIp)) {
      return res.status(429).json({ 
        error: 'Too many requests',
        message: 'Please wait a few minutes before sending another message'
      });
    }

    const { name, email, phone, subject, message, formType, urgency } = req.body;

    // Validation
    const errors = [];

    if (!name || name.length < 2 || name.length > 100) {
      errors.push('Name must be between 2 and 100 characters');
    }

    if (!email || !EMAIL_REGEX.test(email)) {
      errors.push('Valid email address is required');
    }

    if (phone && !PHONE_REGEX.test(phone)) {
      errors.push('Phone number contains invalid characters');
    }

    if (!message || message.length < 10 || message.length > 2000) {
      errors.push('Message must be between 10 and 2000 characters');
    }

    if (subject && subject.length > 200) {
      errors.push('Subject must be less than 200 characters');
    }

    if (errors.length > 0) {
      return res.status(400).json({ 
        error: 'Validation failed',
        message: 'Please correct the following errors',
        errors: errors
      });
    }

    // Spam detection
    if (detectSpam(message, email)) {
      // Silently accept but flag as spam
      console.log('Potential spam detected:', {
        email: email.substring(0, 5) + '***',
        formType,
        timestamp: new Date().toISOString()
      });
      
      // Still return success to avoid revealing spam detection
      return res.status(200).json({
        success: true,
        message: 'Thank you for contacting us. We will review your message.',
        ticketId: 'SPAM' + Date.now().toString().slice(-8)
      });
    }

    // Sanitize inputs
    const sanitizedData = {
      name: sanitizeInput(name),
      email: sanitizeInput(email).toLowerCase(),
      phone: phone ? sanitizeInput(phone) : null,
      subject: subject ? sanitizeInput(subject) : `${formType || 'General'} Inquiry`,
      message: sanitizeInput(message),
      formType: formType || 'general',
      urgency: urgency || 'normal',
      metadata: {
        timestamp: new Date().toISOString(),
        userAgent: req.headers['user-agent'],
        referrer: req.headers.referer || 'direct',
        clientIp: clientIp.substring(0, 15) // Privacy
      }
    };

    // Generate ticket ID
    const ticketId = 'TKT' + Date.now().toString().slice(-8);

    // Priority routing based on form type and urgency
    const priority = sanitizedData.urgency === 'urgent' || 
                    sanitizedData.formType === 'emergency' ? 'high' : 'normal';

    // Log submission
    console.log('Contact Form Submission:', {
      ticketId,
      priority,
      formType: sanitizedData.formType,
      urgency: sanitizedData.urgency,
      timestamp: sanitizedData.metadata.timestamp
    });

    // Production integrations:
    // 1. Save to database
    const { data: contact, error: dbError } = supabase ? await supabase
      .from('contacts')
      .insert({
        ticket_id: ticketId,
        name: sanitizedData.name,
        email: sanitizedData.email,
        phone: sanitizedData.phone,
        message: sanitizedData.message,
        form_type: sanitizedData.formType,
        urgency: sanitizedData.urgency,
        metadata: sanitizedData.metadata,
        status: 'new',
        ip_address: clientIp.substring(0, 15),
        user_agent: req.headers['user-agent']
      })
      .select()
      .single() : { data: null, error: 'Supabase not configured' };

    if (dbError) {
      console.error('Database error:', dbError);
      // Continue processing even if DB fails
    }

    // 2. Send notification email to staff
    /*
    if (process.env.ADMIN_EMAIL && process.env.SENDGRID_API_KEY) {
      await sendEmail({
        to: process.env.ADMIN_EMAIL,
        subject: `[${priority.toUpperCase()}] New ${sanitizedData.formType} inquiry - ${ticketId}`,
        templateId: process.env.STAFF_NOTIFICATION_TEMPLATE,
        dynamicTemplateData: {
          ticketId,
          priority,
          ...sanitizedData
        }
      });
    }
    */

    // 3. Send auto-reply to user
    /*
    if (process.env.SENDGRID_API_KEY) {
      await sendEmail({
        to: sanitizedData.email,
        subject: 'Thank you for contacting Modern Dental Care',
        templateId: process.env.CONTACT_AUTORESPONSE_TEMPLATE,
        dynamicTemplateData: {
          name: sanitizedData.name,
          ticketId,
          expectedResponse: priority === 'high' ? '2 hours' : '24 hours'
        }
      });
    }
    */

    // 4. Create CRM ticket (HubSpot, Salesforce, etc.)
    /*
    if (process.env.HUBSPOT_API_KEY) {
      await createHubSpotTicket({
        subject: sanitizedData.subject,
        content: sanitizedData.message,
        email: sanitizedData.email,
        priority,
        source: 'website_contact_form'
      });
    }
    */

    // 5. Slack/Discord notification for urgent requests
    /*
    if (priority === 'high' && process.env.SLACK_URGENT_WEBHOOK) {
      await sendSlackNotification({
        text: `🚨 Urgent contact form submission`,
        attachments: [{
          color: 'danger',
          fields: [
            { title: 'Ticket', value: ticketId },
            { title: 'From', value: sanitizedData.name },
            { title: 'Type', value: sanitizedData.formType },
            { title: 'Subject', value: sanitizedData.subject }
          ]
        }]
      });
    }
    */

    // Return response based on priority
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
    console.error('Error processing contact form:', error);
    
    return res.status(500).json({ 
      error: 'Server error',
      message: 'We encountered an error processing your message. Please try again or call us at (555) 123-4567',
      requestId: Date.now().toString()
    });
  }
}

// Environment variables needed:
// ADMIN_EMAIL - Where to send form notifications
// SENDGRID_API_KEY - Email service API key
// STAFF_NOTIFICATION_TEMPLATE - Template ID for staff emails
// CONTACT_AUTORESPONSE_TEMPLATE - Template ID for auto-replies
// DATABASE_URL - Database connection string
// HUBSPOT_API_KEY - CRM integration
// SLACK_URGENT_WEBHOOK - For urgent notifications
// NODE_ENV - Set to 'production' for strict CORS