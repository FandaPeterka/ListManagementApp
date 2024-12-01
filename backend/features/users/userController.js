const asyncHandler = require('express-async-handler');
const userService = require('./userService');
const tokenService = require('../tokens/tokenService');
const { AppError } = require('../../middleware/errorHandler');
const sendTokensResponse = require('../tokens/sendTokensResponse');
const { blacklistToken } = require('../tokens/blacklistToken');
const jwt = require('jsonwebtoken');
const logger = require('../../middleware/logger');
const User = require('./userModel');

// Register a new user
const signupUser = asyncHandler(async (req, res, next) => {
  const { email, username, password } = req.body;

  logger.info(`Registering user with email: ${email}`);
  const user = await userService.registerUser(email, username, password);
  const { accessToken, refreshToken } = await tokenService.generateTokens(user._id);
  await sendTokensResponse(res, user, accessToken, refreshToken, 201, next);
});

// Login user
const loginUser = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  logger.info(`Logging in user with email: ${email}`);
  const user = await userService.loginUser(email, password);
  const { accessToken, refreshToken } = await tokenService.generateTokens(user._id);
  await sendTokensResponse(res, user, accessToken, refreshToken, 200, next);
});

// Update user profile
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

  const updatedUser = await userService.updateUserProfile(userId, updateData);

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
});

// Get current user information
const getCurrentUserInfo = asyncHandler(async (req, res, next) => {
  logger.info(`Fetching information for user ID: ${req.user._id}`);
  const user = await userService.getUserById(req.user._id);
  
  if (!user) {
    throw new AppError('User not found.', 404);
  }

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
});

// Logout user
const logoutUser = asyncHandler(async (req, res, next) => {
  const refreshToken = req.cookies.refreshToken;
  if (refreshToken) {
    try {
      const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
      await blacklistToken(decoded.jti, new Date(decoded.exp * 1000));
      res.clearCookie('accessToken');
      res.clearCookie('refreshToken');
      res.status(200).json({ status: 'success', message: 'User logged out successfully.' });
    } catch (error) {
      logger.error(`Error during logout: ${error.message}`);
      return next(new AppError('Invalid refresh token.', 400));
    }
  } else {
    res.status(200).json({ status: 'success', message: 'User logged out successfully.' });
  }
});

// Change user password
const changePasswordHandler = asyncHandler(async (req, res, next) => {
  const userId = req.user._id;
  const { currentPassword, newPassword } = req.body;

  await userService.changePassword(userId, currentPassword, newPassword);

  res.status(200).json({ status: 'success', message: 'Password changed successfully.' });
});

module.exports = {
  signupUser,
  loginUser,
  updateProfile,
  getCurrentUserInfo,
  logoutUser,
  changePassword: changePasswordHandler,
};