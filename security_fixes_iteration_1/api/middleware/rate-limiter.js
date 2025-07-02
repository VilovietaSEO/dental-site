/**
 * Rate Limiting Middleware using Redis/Vercel KV
 * Implements sliding window algorithm for distributed rate limiting
 */

const { kv } = require('@vercel/kv');

/**
 * Rate limiting middleware factory
 * @param {Object} options - Configuration options
 * @param {number} options.windowMs - Time window in milliseconds
 * @param {number} options.max - Maximum requests per window
 * @param {string} options.keyPrefix - Redis key prefix
 * @param {Function} options.keyGenerator - Function to generate rate limit key
 * @param {Function} options.skip - Function to determine if request should skip rate limiting
 */
const rateLimit = (options = {}) => {
  const {
    windowMs = 60000, // 1 minute default
    max = 10, // 10 requests per window default
    keyPrefix = 'rl:',
    keyGenerator = defaultKeyGenerator,
    skip = () => false,
    onLimitReached = null
  } = options;

  return async (req, res, next) => {
    // Check if rate limiting should be skipped
    if (skip(req)) {
      return next ? next() : undefined;
    }

    try {
      // Generate rate limit key
      const key = keyPrefix + keyGenerator(req);
      const now = Date.now();
      const windowStart = now - windowMs;

      // Use Redis/Vercel KV for distributed rate limiting
      if (process.env.REDIS_URL || process.env.KV_URL) {
        // Get current request count in sliding window
        const requests = await kv.zrangebyscore(key, windowStart, now);
        const requestCount = requests ? requests.length : 0;

        if (requestCount >= max) {
          // Rate limit exceeded
          if (onLimitReached) {
            await onLimitReached(req, res);
          }

          const retryAfter = Math.ceil(windowMs / 1000);
          res.setHeader('X-RateLimit-Limit', max);
          res.setHeader('X-RateLimit-Remaining', '0');
          res.setHeader('X-RateLimit-Reset', new Date(now + windowMs).toISOString());
          res.setHeader('Retry-After', retryAfter);

          return res.status(429).json({
            error: 'Too Many Requests',
            message: 'Rate limit exceeded. Please try again later.',
            retryAfter: retryAfter
          });
        }

        // Add current request to sliding window
        await kv.zadd(key, { score: now, member: `${now}-${Math.random()}` });
        
        // Set expiry on key
        await kv.expire(key, Math.ceil(windowMs / 1000));

        // Set rate limit headers
        res.setHeader('X-RateLimit-Limit', max);
        res.setHeader('X-RateLimit-Remaining', Math.max(0, max - requestCount - 1));
        res.setHeader('X-RateLimit-Reset', new Date(now + windowMs).toISOString());

      } else {
        // Fallback to in-memory rate limiting (not recommended for production)
        console.warn('Rate limiting using in-memory storage. Configure Redis for production use.');
        
        if (!global.rateLimitStore) {
          global.rateLimitStore = new Map();
        }

        const requests = global.rateLimitStore.get(key) || [];
        const validRequests = requests.filter(timestamp => timestamp > windowStart);

        if (validRequests.length >= max) {
          const retryAfter = Math.ceil(windowMs / 1000);
          res.setHeader('X-RateLimit-Limit', max);
          res.setHeader('X-RateLimit-Remaining', '0');
          res.setHeader('X-RateLimit-Reset', new Date(now + windowMs).toISOString());
          res.setHeader('Retry-After', retryAfter);

          return res.status(429).json({
            error: 'Too Many Requests',
            message: 'Rate limit exceeded. Please try again later.',
            retryAfter: retryAfter
          });
        }

        validRequests.push(now);
        global.rateLimitStore.set(key, validRequests);

        res.setHeader('X-RateLimit-Limit', max);
        res.setHeader('X-RateLimit-Remaining', Math.max(0, max - validRequests.length));
        res.setHeader('X-RateLimit-Reset', new Date(now + windowMs).toISOString());
      }

      // Continue to next middleware/handler
      if (next) {
        next();
      }

    } catch (error) {
      console.error('Rate limiting error:', error);
      // On error, allow request to proceed but log the issue
      if (next) {
        next();
      }
    }
  };
};

/**
 * Default key generator using IP address
 */
function defaultKeyGenerator(req) {
  const forwarded = req.headers['x-forwarded-for'];
  const ip = forwarded ? forwarded.split(',')[0].trim() : req.socket.remoteAddress;
  return ip || 'unknown';
}

/**
 * Key generator using IP + User Agent for stricter limiting
 */
function strictKeyGenerator(req) {
  const ip = defaultKeyGenerator(req);
  const userAgent = req.headers['user-agent'] || 'unknown';
  const crypto = require('crypto');
  return crypto.createHash('md5').update(`${ip}:${userAgent}`).digest('hex');
}

/**
 * Key generator using authenticated user ID
 */
function userKeyGenerator(req) {
  return req.user?.id || defaultKeyGenerator(req);
}

/**
 * Predefined rate limit configurations
 */
const rateLimitConfigs = {
  // Standard API rate limit
  standard: {
    windowMs: 60000, // 1 minute
    max: 60 // 60 requests per minute
  },
  
  // Strict rate limit for sensitive endpoints
  strict: {
    windowMs: 60000, // 1 minute
    max: 10, // 10 requests per minute
    keyGenerator: strictKeyGenerator
  },
  
  // Rate limit for contact forms
  contact: {
    windowMs: 300000, // 5 minutes
    max: 5, // 5 submissions per 5 minutes
    keyPrefix: 'rl:contact:'
  },
  
  // Rate limit for appointment booking
  appointment: {
    windowMs: 60000, // 1 minute
    max: 3, // 3 bookings per minute
    keyPrefix: 'rl:appointment:'
  },
  
  // Rate limit for authentication attempts
  auth: {
    windowMs: 900000, // 15 minutes
    max: 5, // 5 attempts per 15 minutes
    keyPrefix: 'rl:auth:',
    onLimitReached: async (req, res) => {
      // Log potential brute force attempt
      console.warn('Authentication rate limit reached:', {
        ip: defaultKeyGenerator(req),
        timestamp: new Date().toISOString()
      });
    }
  }
};

module.exports = {
  rateLimit,
  rateLimitConfigs,
  defaultKeyGenerator,
  strictKeyGenerator,
  userKeyGenerator
};