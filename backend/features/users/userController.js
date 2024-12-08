// features/users/userController.js
const asyncHandler = require('express-async-handler');
const userService = require('./userService');
const tokenService = require('../tokens/tokenService');
const { AppError } = require('../../middleware/errorHandler');
const sendTokensResponse = require('../tokens/sendTokensResponse');
const { blacklistToken } = require('../tokens/blacklistToken');
const jwt = require('jsonwebtoken');
const logger = require('../../middleware/logger');
const User = require('./userModel');

/**
 * Register a new user
 */
const signupUser = asyncHandler(async (req, res, next) => {
  const { email, username, password } = req.body;

  logger.info(`Registering user with email: ${email}`);
  try {
    const user = await userService.registerUser(email, username, password);
    const { accessToken, refreshToken } = await tokenService.generateTokens(user._id);
    logger.info(`User registered with ID: ${user._id}`);
    await sendTokensResponse(res, user, accessToken, refreshToken, 201, next);
  } catch (error) {
    if (error.statusCode === 400) {
      logger.warn(`Registration failed for email: ${email} - ${error.message}`);
    } else {
      logger.error(`Error registering user: ${error.message}`);
    }
    next(error);
  }
});

/**
 * Login user
 */
const loginUser = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  logger.info(`Logging in user with email: ${email}`);
  try {
    const user = await userService.loginUser(email, password);
    const { accessToken, refreshToken } = await tokenService.generateTokens(user._id);
    logger.info(`User logged in with ID: ${user._id}`);
    await sendTokensResponse(res, user, accessToken, refreshToken, 200, next);
  } catch (error) {
    if (error.statusCode === 401) {
      logger.warn(`Login failed for email: ${email} - ${error.message}`);
    } else {
      logger.error(`Error logging in user: ${error.message}`);
    }
    next(error);
  }
});

/**
 * Update user profile
 */
const updateProfile = asyncHandler(async (req, res, next) => {
  const userId = req.user._id;
  const updateData = {};

  if (req.body.bio !== undefined) {
    updateData.bio = req.body.bio;
  }
  if (req.body.status !== undefined) {
    updateData.status = req.body.status;
  }
  if (req.body.newUsername !== undefined) {
    updateData.username = req.body.newUsername;
  }
  if (req.file) {
    updateData.profilePicture = `/uploads/profilePictures/${req.file.filename}`;
  }

  logger.info(`User ID ${userId} is updating their profile`);
  try {
    const updatedUser = await userService.updateUserProfile(userId, updateData);
    logger.info(`User profile updated for ID: ${userId}`);
    res.status(200).json({
      status: 'success',
      data: {
        user: {
          id: updatedUser._id,
          email: updatedUser.email,
          username: updatedUser.username,
          profilePicture: updatedUser.profilePicture,
          bio: updatedUser.bio,
          status: updatedUser.status,
        },
      },
    });
  } catch (error) {
    if (error.statusCode === 404) {
      logger.warn(`User ID ${userId} not found for profile update.`);
    } else {
      logger.error(`Error updating user profile: ${error.message}`);
    }
    next(error);
  }
});

/**
 * Get current user information
 */
const getCurrentUserInfo = asyncHandler(async (req, res, next) => {
  const userId = req.user._id;

  logger.info(`Fetching information for user ID: ${userId}`);
  try {
    const user = await userService.getUserById(userId);
    logger.info(`User information retrieved for ID: ${userId}`);
    res.status(200).json({
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
    if (error.statusCode === 404) {
      logger.warn(`User ID ${userId} not found.`);
    } else {
      logger.error(`Error fetching user information: ${error.message}`);
    }
    next(error);
  }
});

/**
 * Logout user
 */
const logoutUser = asyncHandler(async (req, res, next) => {
  const refreshToken = req.cookies.refreshToken;
  const userId = req.user._id;

  logger.info(`User ID ${userId} is logging out`);
  if (refreshToken) {
    try {
      const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
      await blacklistToken(decoded.jti, new Date(decoded.exp * 1000));
      res.clearCookie('accessToken');
      res.clearCookie('refreshToken');
      logger.info(`User ID ${userId} has been logged out successfully`);
      res.status(200).json({ status: 'success', message: 'User logged out successfully.' });
    } catch (error) {
      logger.error(`Error during logout for user ID ${userId}: ${error.message}`);
      return next(new AppError('Invalid refresh token.', 400));
    }
  } else {
    logger.info(`No refresh token found for user ID ${userId} during logout`);
    res.status(200).json({ status: 'success', message: 'User logged out successfully.' });
  }
});

/**
 * Change user password
 */
const changePasswordHandler = asyncHandler(async (req, res, next) => {
  const userId = req.user._id;
  const { currentPassword, newPassword } = req.body;

  logger.info(`User ID ${userId} is changing their password`);
  try {
    await userService.changePassword(userId, currentPassword, newPassword);
    logger.info(`User ID ${userId} has changed their password successfully`);
    res.status(200).json({ status: 'success', message: 'Password changed successfully.' });
  } catch (error) {
    if (error.statusCode === 404) {
      logger.warn(`User ID ${userId} not found for password change.`);
    } else if (error.statusCode === 401) {
      logger.warn(`Incorrect current password provided by user ID ${userId}.`);
    } else {
      logger.error(`Error changing password for user ID ${userId}: ${error.message}`);
    }
    next(error);
  }
});

module.exports = {
  signupUser,
  loginUser,
  updateProfile,
  getCurrentUserInfo,
  logoutUser,
  changePassword: changePasswordHandler,
};