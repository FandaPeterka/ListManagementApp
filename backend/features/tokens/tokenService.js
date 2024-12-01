const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const RefreshToken = require('./refreshTokenModel');
const { AppError } = require('../../middleware/errorHandler');
const logger = require('../../middleware/logger');

/**
 * Generates access and refresh tokens.
 * @param {String} userId - User ID.
 * @returns {Promise<Object>} - Access and refresh tokens.
 */
const generateTokens = async (userId) => {
  logger.info(`Generating tokens for user ID: ${userId}`);
  const jti = uuidv4();
  const accessToken = jwt.sign({ id: userId, jti }, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: '15m',
  });
  const refreshToken = jwt.sign({ id: userId, jti }, process.env.REFRESH_TOKEN_SECRET, {
    expiresIn: '7d',
  });

  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 dní

  await RefreshToken.create({
    jti: jti,
    userId: userId,
    expiresAt: expiresAt,
  });

  logger.info('Tokens successfully generated.');
  return { accessToken, refreshToken };
};

/**
 * Rotates the refresh token.
 * @param {String} oldRefreshTokenJti - JTI of the old refresh token.
 * @param {String} userId - User ID.
 * @returns {Promise<Object>} - New access and refresh tokens.
 */
const rotateRefreshToken = async (oldRefreshTokenJti, userId) => {
  logger.info(`Rotating refresh token for user ID: ${userId}`);
  const result = await RefreshToken.deleteOne({ jti: oldRefreshTokenJti });
  if (result.deletedCount === 0) {
    logger.warn(`Failed to rotate token. Token with jti: ${oldRefreshTokenJti} not found.`);
    throw new AppError('Invalid refresh token.', 400);
  }

  logger.info('Old refresh token successfully deleted. Generating new tokens.');
  const tokens = await generateTokens(userId); 
  return tokens;
};

module.exports = {
  generateTokens,
  rotateRefreshToken,
};