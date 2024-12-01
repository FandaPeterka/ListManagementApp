const BlacklistedToken = require('./blacklistedTokenModel');
const { AppError } = require('../../middleware/errorHandler');
const logger = require('../../middleware/logger');
const jwt = require('jsonwebtoken');

/**
 * Blacklists a token.
 * @param {String} jti - JTI of the token.
 * @param {Date} expiresAt - Expiration date of the token.
 * @returns {Promise<void>}
 */
const blacklistToken = async (jti, expiresAt) => {
  try {
    await BlacklistedToken.create({ jti, expiresAt });
    logger.info(`Token with jti: ${jti} successfully blacklisted.`);
  } catch (err) {
    if (err.code === 11000) {
      // Token already blacklisted, proceed without error
      return;
    } else {
      logger.error(`Failed to blacklist token: ${err.message}`);
      throw new AppError('Failed to blacklist token.', 500);
    }
  }
};

/**
 * Checks if a token is blacklisted.
 * @param {Object} req - HTTP request.
 * @param {Object} res - HTTP response.
 * @param {Function} next - Next middleware.
 * @returns {Promise<void>}
 */
const checkBlacklist = async (req, res, next) => {
  const token = req.cookies.accessToken;
  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
      if (decoded && decoded.jti) {
        const isBlacklisted = await BlacklistedToken.findOne({ jti: decoded.jti });
        if (isBlacklisted) {
          logger.warn(`Blacklisted token detected for jti: ${decoded.jti}`);
          return next(new AppError('Token is blacklisted.', 401));
        }
      }
    } catch (error) {
      logger.error(`Error checking blacklist: ${error.message}`);
      return next(new AppError('Invalid token.', 401));
    }
  }
  next();
};

module.exports = {
  blacklistToken,
  checkBlacklist,
};