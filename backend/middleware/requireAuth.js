const jwt = require('jsonwebtoken');
const { AppError } = require('./errorHandler');
const BlacklistedToken = require('../features/tokens/blacklistedTokenModel');
const logger = require('./logger');

/**
 * Authentication middleware to verify JWT tokens.
 * @param {Object} req - HTTP request.
 * @param {Object} res - HTTP response.
 * @param {Function} next - Next middleware.
 */
const requireAuth = async (req, res, next) => {
  const token = req.cookies.accessToken;
  if (!token) {
    logger.warn('Access token missing.');
    return next(new AppError('Access token is missing.', 401));
  }

  try {
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    logger.info(`Decoded token: ${JSON.stringify(decoded)}`);

    const isBlacklisted = await BlacklistedToken.findOne({ jti: decoded.jti });
    if (isBlacklisted) {
      logger.warn(`Token with jti: ${decoded.jti} is blacklisted.`);
      throw new AppError('Token has been revoked.', 401);
    }

    req.user = { _id: decoded.id || decoded._id };
    logger.info(`Authentication successful for user ID: ${req.user._id}`);
    next();
  } catch (err) {
    logger.error(`Error verifying token: ${err.message}`);
    return next(new AppError('Invalid access token.', 401));
  }
};

module.exports = requireAuth;