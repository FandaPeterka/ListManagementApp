const xss = require('xss');

/**
 * Sanitizes user input to prevent XSS attacks.
 * @param {Object} req - HTTP request.
 * @param {Object} res - HTTP response.
 * @param {Function} next - Next middleware.
 */
const sanitizeMiddleware = (req, res, next) => {
  if (req.body) {
    for (const key in req.body) {
      if (typeof req.body[key] === 'string') {
        req.body[key] = xss(req.body[key]);
      }
    }
  }
  next();
};

module.exports = sanitizeMiddleware;