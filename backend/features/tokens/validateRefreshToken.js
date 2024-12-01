const jwt = require('jsonwebtoken');
const RefreshToken = require('./refreshTokenModel');
const { AppError } = require('../../middleware/errorHandler');
const User = require('../users/userModel');
const BlacklistedToken = require('./blacklistedTokenModel');
const logger = require('../../middleware/logger');

/**
 * Validates the refresh token.
 * @param {Object} req - HTTP request.
 * @param {Object} res - HTTP response.
 * @param {Function} next - Next middleware.
 * @returns {Promise<void>}
 */
const validateRefreshToken = async (req, res, next) => {
  const refreshToken = req.cookies.refreshToken;

  if (!refreshToken) {
    logger.warn('Refresh token is missing.');
    return next(new AppError('Refresh token is missing.', 401));
  }

  try {
    const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
    logger.info(`Refresh token decoded: ${decoded.jti}`);

    const isBlacklisted = await BlacklistedToken.findOne({ jti: decoded.jti });
    if (isBlacklisted) {
      logger.warn(`Blacklisted refresh token detected: ${decoded.jti}`);
      throw new AppError('Refresh token is invalid.', 401);
    }

    const tokenDoc = await RefreshToken.findOne({ jti: decoded.jti });
    if (!tokenDoc || tokenDoc.expiresAt < new Date()) {
      logger.warn(`Expired or invalid refresh token: ${decoded.jti}`);
      throw new AppError('Refresh token is invalid or expired.', 401);
    }

    const user = await User.findById(decoded.id);
    if (!user) {
      logger.warn(`User with ID: ${decoded.id} not found.`);
      throw new AppError('User not found.', 404);
    }

    req.user = user;
    req.jti = decoded.jti;
    next();
  } catch (error) {
    logger.error(`Error validating refresh token: ${error.message}`);
    return next(new AppError('Invalid refresh token.', 401));
  }
};

module.exports = validateRefreshToken;