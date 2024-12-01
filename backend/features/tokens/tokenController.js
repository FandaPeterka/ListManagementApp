const asyncHandler = require('express-async-handler');
const tokenService = require('./tokenService');
const sendTokensResponse = require('./sendTokensResponse');
const logger = require('../../middleware/logger');

/**
 * Handles token refresh.
 * @param {Object} req - HTTP request.
 * @param {Object} res - HTTP response.
 * @param {Function} next - Next middleware.
 * @returns {Promise<void>}
 */
const refreshTokenHandler = asyncHandler(async (req, res, next) => {
  const oldRefreshTokenJti = req.jti;
  const userId = req.user._id;

  logger.info(`Refreshing tokens for user ID: ${userId}`);
  const { accessToken, refreshToken } = await tokenService.rotateRefreshToken(oldRefreshTokenJti, userId);
  await sendTokensResponse(res, req.user, accessToken, refreshToken, 200, next);
});

module.exports = {
  refreshToken: refreshTokenHandler,
};