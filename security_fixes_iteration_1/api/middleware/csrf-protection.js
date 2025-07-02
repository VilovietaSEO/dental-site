/**
 * CSRF Protection Middleware
 * Implements double-submit cookie pattern for CSRF protection
 */

const crypto = require('crypto');

/**
 * CSRF token generation and validation
 */
class CSRFProtection {
  constructor(options = {}) {
    this.secret = options.secret || process.env.CSRF_SECRET || crypto.randomBytes(32).toString('hex');
    this.cookieName = options.cookieName || 'csrf-token';
    this.headerName = options.headerName || 'x-csrf-token';
    this.cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 86400000, // 24 hours
      ...options.cookieOptions
    };
  }

  /**
   * Generate a new CSRF token
   */
  generateToken() {
    const token = crypto.randomBytes(32).toString('hex');
    const timestamp = Date.now();
    const payload = `${token}.${timestamp}`;
    const signature = this.sign(payload);
    return `${payload}.${signature}`;
  }

  /**
   * Sign a payload with the secret
   */
  sign(payload) {
    return crypto
      .createHmac('sha256', this.secret)
      .update(payload)
      .digest('hex');
  }

  /**
   * Verify a CSRF token
   */
  verifyToken(token) {
    if (!token || typeof token !== 'string') {
      return false;
    }

    const parts = token.split('.');
    if (parts.length !== 3) {
      return false;
    }

    const [tokenPart, timestamp, signature] = parts;
    const payload = `${tokenPart}.${timestamp}`;

    // Verify signature
    const expectedSignature = this.sign(payload);
    if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature))) {
      return false;
    }

    // Check token age (24 hours)
    const tokenAge = Date.now() - parseInt(timestamp, 10);
    if (tokenAge > 86400000) {
      return false;
    }

    return true;
  }

  /**
   * Middleware function
   */
  middleware() {
    return async (req, res, next) => {
      // Skip CSRF for GET, HEAD, OPTIONS requests
      if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
        // Generate and set token for GET requests (forms)
        if (req.method === 'GET') {
          const token = this.generateToken();
          res.setHeader('Set-Cookie', `${this.cookieName}=${token}; ${this.serializeCookieOptions()}`);
          req.csrfToken = token;
        }
        return next ? next() : undefined;
      }

      // For state-changing requests, verify CSRF token
      const cookieToken = this.parseCookies(req.headers.cookie)[this.cookieName];
      const headerToken = req.headers[this.headerName] || req.body?.csrfToken;

      // Both tokens must be present and match
      if (!cookieToken || !headerToken || cookieToken !== headerToken) {
        return res.status(403).json({
          error: 'CSRF validation failed',
          message: 'Invalid or missing CSRF token'
        });
      }

      // Verify token validity
      if (!this.verifyToken(cookieToken)) {
        return res.status(403).json({
          error: 'CSRF validation failed',
          message: 'Invalid or expired CSRF token'
        });
      }

      // Generate new token for next request
      const newToken = this.generateToken();
      res.setHeader('Set-Cookie', `${this.cookieName}=${newToken}; ${this.serializeCookieOptions()}`);
      req.csrfToken = newToken;

      // Continue to next middleware
      if (next) {
        next();
      }
    };
  }

  /**
   * Parse cookies from cookie header
   */
  parseCookies(cookieHeader) {
    const cookies = {};
    if (!cookieHeader) return cookies;

    cookieHeader.split(';').forEach(cookie => {
      const [name, value] = cookie.trim().split('=');
      if (name && value) {
        cookies[name] = value;
      }
    });

    return cookies;
  }

  /**
   * Serialize cookie options
   */
  serializeCookieOptions() {
    const options = [];
    
    if (this.cookieOptions.httpOnly) options.push('HttpOnly');
    if (this.cookieOptions.secure) options.push('Secure');
    if (this.cookieOptions.sameSite) options.push(`SameSite=${this.cookieOptions.sameSite}`);
    if (this.cookieOptions.maxAge) options.push(`Max-Age=${this.cookieOptions.maxAge}`);
    if (this.cookieOptions.domain) options.push(`Domain=${this.cookieOptions.domain}`);
    if (this.cookieOptions.path) options.push(`Path=${this.cookieOptions.path}`);

    return options.join('; ');
  }
}

/**
 * Factory function for creating CSRF protection middleware
 */
const csrfProtection = (options = {}) => {
  const csrf = new CSRFProtection(options);
  return csrf.middleware();
};

/**
 * Helper to get CSRF token from request
 */
const getCSRFToken = (req) => {
  return req.csrfToken || null;
};

/**
 * CORS configuration with CSRF support
 */
const configureCORS = (allowedOrigins = []) => {
  return (req, res) => {
    const origin = req.headers.origin;
    
    if (allowedOrigins.includes(origin)) {
      res.setHeader('Access-Control-Allow-Origin', origin);
      res.setHeader('Access-Control-Allow-Credentials', 'true');
      res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-CSRF-Token, X-Requested-With');
      res.setHeader('Access-Control-Expose-Headers', 'X-CSRF-Token');
      res.setHeader('Access-Control-Max-Age', '86400');
    }
  };
};

module.exports = {
  CSRFProtection,
  csrfProtection,
  getCSRFToken,
  configureCORS
};