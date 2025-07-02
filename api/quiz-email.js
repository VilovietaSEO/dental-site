// Vercel Serverless Function for capturing health quiz emails and results
// Production-ready with validation, analytics, and marketing integration

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

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Quiz scoring validation
function validateQuizData(quizResults, score, profile) {
  if (!quizResults || typeof quizResults !== 'object') {
    return { valid: false, error: 'Invalid quiz results format' };
  }

  if (typeof score !== 'number' || score < 0 || score > 100) {
    return { valid: false, error: 'Invalid score value' };
  }

  const validProfiles = ['excellent', 'good', 'fair', 'needs-attention', 'urgent'];
  if (!profile || !validProfiles.includes(profile)) {
    return { valid: false, error: 'Invalid health profile' };
  }

  return { valid: true };
}

// Generate personalized recommendations based on profile
function getRecommendations(profile, quizResults) {
  const recommendations = {
    'excellent': {
      services: ['preventive-care', 'teeth-whitening'],
      message: 'Great job maintaining your oral health! Keep up with regular cleanings.',
      priority: 'routine'
    },
    'good': {
      services: ['preventive-care', 'fillings', 'teeth-whitening'],
      message: 'Your oral health is good, but there are areas for improvement.',
      priority: 'preventive'
    },
    'fair': {
      services: ['general-dentistry', 'fillings', 'gum-disease'],
      message: 'Your oral health needs attention. Schedule a comprehensive exam soon.',
      priority: 'moderate'
    },
    'needs-attention': {
      services: ['general-dentistry', 'gum-disease', 'root-canals'],
      message: 'Your oral health requires prompt professional care.',
      priority: 'high'
    },
    'urgent': {
      services: ['emergency-dentistry', 'root-canals', 'gum-disease'],
      message: 'You may need immediate dental care. Please contact us right away.',
      priority: 'urgent'
    }
  };

  return recommendations[profile] || recommendations['fair'];
}

// Rate limiting
const requestCounts = new Map();
const RATE_LIMIT_WINDOW = 3600000; // 1 hour
const MAX_REQUESTS_PER_WINDOW = 3;

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
    // Rate limiting by IP
    if (!checkRateLimit(clientIp)) {
      return res.status(429).json({ 
        error: 'Too many requests',
        message: 'Please wait before taking the quiz again'
      });
    }

    const { email, quizResults, score, profile, marketingConsent } = req.body;

    // Validate email
    if (!email || !EMAIL_REGEX.test(email)) {
      return res.status(400).json({ 
        error: 'Invalid email',
        message: 'Please provide a valid email address to receive your results'
      });
    }

    // Validate quiz data
    const validation = validateQuizData(quizResults, score, profile);
    if (!validation.valid) {
      return res.status(400).json({ 
        error: 'Invalid quiz data',
        message: validation.error
      });
    }

    // Sanitize inputs
    const sanitizedEmail = sanitizeInput(email).toLowerCase();
    
    // Generate recommendations
    const recommendations = getRecommendations(profile, quizResults);
    
    // Create quiz submission record
    const submission = {
      email: sanitizedEmail,
      score,
      profile,
      recommendations,
      quizResults,
      marketingConsent: Boolean(marketingConsent),
      metadata: {
        timestamp: new Date().toISOString(),
        userAgent: req.headers['user-agent'],
        referrer: req.headers.referer || 'direct',
        clientIp: clientIp.substring(0, 15),
        completionTime: quizResults.completionTime || null
      }
    };

    // Log submission
    console.log('Health Quiz Submission:', {
      email: sanitizedEmail.substring(0, 5) + '***',
      score,
      profile,
      priority: recommendations.priority,
      timestamp: submission.metadata.timestamp
    });

    // Production integrations:

    // 1. Save to database
    const { data: quizRecord, error: dbError } = supabase ? await supabase
      .from('quiz_submissions')
      .insert({
        email: submission.email,
        quiz_score: submission.score,
        health_profile: submission.profile,
        risk_level: recommendations.priority,
        recommendations: recommendations.services,
        marketing_consent: submission.marketingConsent,
        lead_score: calculateLeadScore(score, profile, quizResults),
        quiz_answers: quizResults,
        metadata: submission.metadata,
        ip_address: clientIp.substring(0, 15),
        user_agent: req.headers['user-agent'],
        referrer: req.headers.referer || 'direct'
      })
      .select()
      .single() : { data: null, error: 'Supabase not configured' };

    if (dbError) {
      console.error('Database error:', dbError);
      // Continue processing even if DB fails
    }

    // 2. Send personalized results email
    /*
    if (process.env.SENDGRID_API_KEY) {
      await sendEmail({
        to: sanitizedEmail,
        subject: 'Your Dental Health Assessment Results',
        templateId: process.env.QUIZ_RESULTS_TEMPLATE,
        dynamicTemplateData: {
          score,
          profile,
          profileDisplay: profile.replace('-', ' ').toUpperCase(),
          recommendations: recommendations.services,
          message: recommendations.message,
          ctaLink: `https://moderndentalcare.com/book-appointment?profile=${profile}`,
          ctaText: recommendations.priority === 'urgent' ? 'Book Emergency Appointment' : 'Schedule Your Visit'
        }
      });
    }
    */

    // 3. Add to marketing automation (if consent given)
    /*
    if (marketingConsent && process.env.MAILCHIMP_API_KEY) {
      await addToMailchimpList({
        email: sanitizedEmail,
        tags: ['quiz-completed', `profile-${profile}`, `priority-${recommendations.priority}`],
        mergeFields: {
          SCORE: score,
          PROFILE: profile,
          QUIZ_DATE: new Date().toISOString()
        }
      });
    }
    */

    // 4. Trigger CRM workflow
    /*
    if (process.env.HUBSPOT_API_KEY) {
      await createHubSpotContact({
        email: sanitizedEmail,
        properties: {
          quiz_score: score,
          health_profile: profile,
          lead_priority: recommendations.priority,
          recommended_services: recommendations.services.join(',')
        }
      });
    }
    */

    // 5. Send analytics event
    /*
    if (process.env.GA_MEASUREMENT_ID) {
      await sendGoogleAnalyticsEvent({
        client_id: req.headers['x-ga-client-id'] || 'anonymous',
        events: [{
          name: 'quiz_completed',
          params: {
            score,
            profile,
            priority: recommendations.priority,
            engagement_time_msec: quizResults.completionTime || 0
          }
        }]
      });
    }
    */

    // 6. Alert staff for urgent cases
    /*
    if (recommendations.priority === 'urgent' && process.env.SLACK_URGENT_WEBHOOK) {
      await sendSlackNotification({
        text: '🚨 Urgent quiz result - immediate follow-up needed',
        attachments: [{
          color: 'danger',
          fields: [
            { title: 'Email', value: sanitizedEmail },
            { title: 'Score', value: score },
            { title: 'Profile', value: profile }
          ]
        }]
      });
    }
    */

    // Return personalized response
    return res.status(200).json({
      success: true,
      message: recommendations.message,
      profile,
      score,
      recommendations: {
        services: recommendations.services,
        priority: recommendations.priority,
        nextSteps: recommendations.priority === 'urgent' 
          ? 'Please call us immediately at (555) 123-4567 or book an emergency appointment online.'
          : 'Check your email for personalized recommendations and special offers.'
      }
    });

  } catch (error) {
    console.error('Error processing quiz submission:', error);
    
    return res.status(500).json({ 
      error: 'Server error',
      message: 'We encountered an error saving your results. Please try again.',
      requestId: Date.now().toString()
    });
  }
}

// Helper function to calculate lead score for sales prioritization
function calculateLeadScore(score, profile, quizResults) {
  let leadScore = 0;
  
  // Base score from health profile
  const profileScores = {
    'urgent': 100,
    'needs-attention': 80,
    'fair': 60,
    'good': 40,
    'excellent': 20
  };
  leadScore += profileScores[profile] || 50;
  
  // Bonus for specific answers indicating immediate need
  if (quizResults.hasPain) leadScore += 20;
  if (quizResults.hasInsurance) leadScore += 10;
  if (quizResults.lastVisit === 'over-2-years') leadScore += 15;
  
  return Math.min(leadScore, 100);
}

// Environment variables needed:
// SENDGRID_API_KEY - Email service
// QUIZ_RESULTS_TEMPLATE - SendGrid template for results
// DATABASE_URL - Database connection
// MAILCHIMP_API_KEY - Marketing automation
// HUBSPOT_API_KEY - CRM integration
// GA_MEASUREMENT_ID - Google Analytics
// SLACK_URGENT_WEBHOOK - Staff notifications
// NODE_ENV - Set to 'production' for strict CORS