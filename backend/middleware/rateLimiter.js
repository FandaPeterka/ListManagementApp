const rateLimit = require('express-rate-limit');
const logger = require('./logger');

const limiter =
  process.env.NODE_ENV === 'test'
    ? (req, res, next) => next()
    : rateLimit({
        windowMs: 15 * 60 * 1000, // 15 minutes
        max: 500, // Limit each IP to 500 requests per windowMs
        message:
          'Too many requests from this IP, please try again after 15 minutes.',
        handler: (req, res, next, options) => {
          logger.warn(`Rate limit reached for IP: ${req.ip}`);
          res.status(options.statusCode).send(options.message);
        },
      });

module.exports = limiter;