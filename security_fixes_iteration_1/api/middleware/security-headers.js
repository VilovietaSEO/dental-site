/**
 * Security Headers Middleware
 * Adds comprehensive security headers to all API responses
 */

const securityHeaders = (handler) => async (req, res) => {
  // Content Security Policy with nonce generation
  const nonce = generateNonce();
  
  // Apply security headers
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  
  // Strict Transport Security (only in production)
  if (process.env.NODE_ENV === 'production') {
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  }
  
  // Content Security Policy
  const cspDirectives = [
    `default-src 'self'`,
    `script-src 'self' 'nonce-${nonce}' https://vercel.live`,
    `style-src 'self' 'unsafe-inline'`, // Consider removing unsafe-inline in future
    `img-src 'self' data: https:`,
    `font-src 'self'`,
    `connect-src 'self' https://api.moderndentalcare.com`,
    `frame-ancestors 'none'`,
    `base-uri 'self'`,
    `form-action 'self'`,
    `object-src 'none'`,
    `script-src-attr 'none'`,
    `upgrade-insecure-requests`
  ].join('; ');
  
  res.setHeader('Content-Security-Policy', cspDirectives);
  
  // Cache control for API responses
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  
  // Store nonce for use in responses if needed
  req.nonce = nonce;
  
  // Continue to handler
  return handler(req, res);
};

/**
 * Generate a cryptographically secure nonce
 */
function generateNonce() {
  const crypto = require('crypto');
  return crypto.randomBytes(16).toString('base64');
}

module.exports = securityHeaders;