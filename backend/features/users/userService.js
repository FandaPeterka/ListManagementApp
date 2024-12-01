const User = require('./userModel');
const bcrypt = require('bcryptjs');
const { AppError } = require('../../middleware/errorHandler');
const logger = require('../../middleware/logger');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const RefreshToken = require('../tokens/refreshTokenModel');

/**
 * Registers a new user.
 * @param {String} email - User's email.
 * @param {String} username - User's username.
 * @param {String} password - User's password.
 * @returns {Promise<Object>} - Created user.
 */
const registerUser = async (email, username, password) => {
  logger.info(`Checking if user exists with email: ${email} or username: ${username}`);
  const existingUser = await User.findOne({ $or: [{ email }, { username }] });
  if (existingUser) {
    throw new AppError('Email or username already in use.', 400);
  }

  logger.info('Hashing password.');
  const hashedPassword = await bcrypt.hash(password, 10);

  logger.info('Creating new user.');
  const user = await User.create({ email, username, password: hashedPassword });

  logger.info(`User registered with ID: ${user._id}`);
  return user;
};

/**
 * Logs in a user.
 * @param {String} email - User's email.
 * @param {String} password - User's password.
 * @returns {Promise<Object>} - Logged in user.
 */
const loginUser = async (email, password) => {
  logger.info(`Searching for user with email: ${email}`);
  const user = await User.findOne({ email }).select('+password');
  if (!user) {
    throw new AppError('Invalid email or password.', 401);
  }

  logger.info('Checking password.');
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw new AppError('Invalid email or password.', 401);
  }

  logger.info(`User logged in with ID: ${user._id}`);
  return user;
};

/**
 * Updates user profile.
 * @param {String} userId - User ID.
 * @param {Object} updateData - Data to update.
 * @returns {Promise<Object>} - Updated user.
 */
const updateUserProfile = async (userId, updateData) => {
  logger.info(`Updating profile for user ID: ${userId}`);
  const user = await User.findByIdAndUpdate(userId, updateData, {
    new: true,
    runValidators: true,
  });

  if (!user) {
    throw new AppError('User not found.', 404);
  }

  logger.info(`User profile updated for ID: ${user._id}`);
  return user;
};

/**
 * Retrieves user by ID.
 * @param {String} userId - User ID.
 * @returns {Promise<Object>} - User.
 */
const getUserById = async (userId) => {
  logger.info(`Retrieving user with ID: ${userId}`);
  const user = await User.findById(userId);
  if (!user) {
    throw new AppError('User not found.', 404);
  }
  return user;
};

/**
 * Changes user password.
 * @param {String} userId - User ID.
 * @param {String} currentPassword - Current password.
 * @param {String} newPassword - New password.
 * @returns {Promise<Object>} - Updated user.
 */
const changePassword = async (userId, currentPassword, newPassword) => {
  logger.info(`Changing password for user ID: ${userId}`);
  const user = await User.findById(userId).select('+password');
  if (!user) {
    throw new AppError('User not found.', 404);
  }

  const isMatch = await bcrypt.compare(currentPassword, user.password);
  if (!isMatch) {
    throw new AppError('Current password is incorrect.', 401);
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10);
  user.password = hashedPassword;
  await user.save();

  logger.info(`Password changed for user ID: ${userId}`);
  return user;
};

module.exports = {
  registerUser,
  loginUser,
  updateUserProfile,
  getUserById,
  changePassword,
};