const { AppError } = require('../../middleware/errorHandler');
const logger = require('../../middleware/logger');

/**
 * Sends tokens in HTTP response.
 * @param {Object} res - HTTP response.
 * @param {Object} user - User object.
 * @param {String} accessToken - Access token.
 * @param {String} refreshToken - Refresh token.
 * @param {Number} statusCode - HTTP status code.
 * @param {Function} next - Next middleware.
 */
const sendTokensResponse = async (
  res,
  user,
  accessToken,
  refreshToken,
  statusCode = 200,
  next
) => {
  try {
    logger.info(`Setting cookies for user ID: ${user._id}`);

    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'Strict',
      maxAge: 15 * 60 * 1000, // 15 minutes
    });

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'Strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    logger.info(`Sending user data for user ID: ${user._id}`);
    res.status(statusCode).json({
      status: 'success',
      data: {
        user: {
          id: user._id,
          email: user.email,
          username: user.username,
          profilePicture: user.profilePicture,
          bio: user.bio,
          status: user.status,
        },
      },
    });
  } catch (error) {
    logger.error(`Error sending tokens: ${error.message}`);
    next(new AppError('Failed to send tokens.', 500));
  }
};

module.exports = sendTokensResponse;