// Rate limiter for authentication endpoints - DISABLED
const authLimiter = (req, res, next) => {
  next();
};

// Rate limiter for general API endpoints - DISABLED
const apiLimiter = (req, res, next) => {
  next();
};

// Security headers middleware
const securityHeaders = (req, res, next) => {
  // Prevent XSS attacks
  res.setHeader('X-XSS-Protection', '1; mode=block');
  // Prevent MIME type sniffing
  res.setHeader('X-Content-Type-Options', 'nosniff');
  // Prevent clickjacking
  res.setHeader('X-Frame-Options', 'DENY');
  // Enforce HTTPS
  if (process.env.NODE_ENV === 'production') {
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  }
  next();
};

module.exports = {
  authLimiter,
  apiLimiter,
  securityHeaders
};