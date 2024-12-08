// tests/features/users/userController.test.js
const userController = require('../../features/users/userController');
const userService = require('../../features/users/userService');
const tokenService = require('../../features/tokens/tokenService');
const { AppError } = require('../../middleware/errorHandler');
const sendTokensResponse = require('../../features/tokens/sendTokensResponse');
const { blacklistToken } = require('../../features/tokens/blacklistToken');
const logger = require('../../middleware/logger');
const jwt = require('jsonwebtoken');

// Mockování userService, tokenService, sendTokensResponse, blacklistToken a logger metod
jest.mock('../../features/users/userService');
jest.mock('../../features/tokens/tokenService');
jest.mock('../../features/tokens/sendTokensResponse', () => jest.fn());
jest.mock('../../features/tokens/blacklistToken', () => ({
  blacklistToken: jest.fn(),
}));
jest.mock('../../middleware/logger', () => ({
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
}));

describe('User Controller', () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      params: {},
      body: {},
      user: { _id: 'user-id' },
      cookies: {},
      file: null,
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      send: jest.fn(),
      clearCookie: jest.fn(),
    };
    next = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('signupUser', () => {
    it('should register a new user and respond with 201 status', async () => {
      const email = 'test@example.com';
      const username = 'testuser';
      const password = 'password123';
      const user = { _id: 'user-id', email, username };
      const accessToken = 'access-token';
      const refreshToken = 'refresh-token';

      req.body = { email, username, password };
      userService.registerUser.mockResolvedValue(user);
      tokenService.generateTokens.mockResolvedValue({ accessToken, refreshToken });

      await userController.signupUser(req, res, next);

      expect(userService.registerUser).toHaveBeenCalledWith(email, username, password);
      expect(logger.info).toHaveBeenCalledWith(`Registering user with email: ${email}`);
      expect(tokenService.generateTokens).toHaveBeenCalledWith(user._id);
      expect(logger.info).toHaveBeenCalledWith(`User registered with ID: ${user._id}`);
      expect(sendTokensResponse).toHaveBeenCalledWith(res, user, accessToken, refreshToken, 201, next);
    });

    it('should handle errors and pass to next when email or username is already in use', async () => {
      const email = 'test@example.com';
      const username = 'testuser';
      const password = 'password123';
      const errorMessage = 'Email or username already in use.';
      const error = new AppError(errorMessage, 400);

      req.body = { email, username, password };
      userService.registerUser.mockRejectedValue(error);

      await userController.signupUser(req, res, next);

      expect(userService.registerUser).toHaveBeenCalledWith(email, username, password);
      expect(logger.info).toHaveBeenCalledWith(`Registering user with email: ${email}`);
      expect(logger.warn).toHaveBeenCalledWith(`Registration failed for email: ${email} - ${errorMessage}`);
      expect(logger.error).not.toHaveBeenCalledWith(expect.stringContaining('Error registering user'));
      expect(next).toHaveBeenCalledWith(error);
    });

    it('should handle errors and pass to next on other errors', async () => {
      const email = 'test@example.com';
      const username = 'testuser';
      const password = 'password123';
      const errorMessage = 'Database error.';
      const error = new AppError(errorMessage, 500);

      req.body = { email, username, password };
      userService.registerUser.mockRejectedValue(error);

      await userController.signupUser(req, res, next);

      expect(userService.registerUser).toHaveBeenCalledWith(email, username, password);
      expect(logger.info).toHaveBeenCalledWith(`Registering user with email: ${email}`);
      expect(logger.error).toHaveBeenCalledWith(`Error registering user: ${errorMessage}`);
      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('loginUser', () => {
    it('should login a user and respond with 200 status', async () => {
      const email = 'test@example.com';
      const password = 'password123';
      const user = { _id: 'user-id', email, username: 'testuser' };
      const accessToken = 'access-token';
      const refreshToken = 'refresh-token';

      req.body = { email, password };
      userService.loginUser.mockResolvedValue(user);
      tokenService.generateTokens.mockResolvedValue({ accessToken, refreshToken });

      await userController.loginUser(req, res, next);

      expect(userService.loginUser).toHaveBeenCalledWith(email, password);
      expect(logger.info).toHaveBeenCalledWith(`Logging in user with email: ${email}`);
      expect(tokenService.generateTokens).toHaveBeenCalledWith(user._id);
      expect(logger.info).toHaveBeenCalledWith(`User logged in with ID: ${user._id}`);
      expect(sendTokensResponse).toHaveBeenCalledWith(res, user, accessToken, refreshToken, 200, next);
    });

    it('should handle errors and pass to next when credentials are invalid', async () => {
      const email = 'test@example.com';
      const password = 'wrongpassword';
      const errorMessage = 'Invalid email or password.';
      const error = new AppError(errorMessage, 401);

      req.body = { email, password };
      userService.loginUser.mockRejectedValue(error);

      await userController.loginUser(req, res, next);

      expect(userService.loginUser).toHaveBeenCalledWith(email, password);
      expect(logger.info).toHaveBeenCalledWith(`Logging in user with email: ${email}`);
      expect(logger.warn).toHaveBeenCalledWith(`Login failed for email: ${email} - ${errorMessage}`);
      expect(logger.error).not.toHaveBeenCalledWith(expect.stringContaining('Error logging in user'));
      expect(next).toHaveBeenCalledWith(error);
    });

    it('should handle errors and pass to next on other errors', async () => {
      const email = 'test@example.com';
      const password = 'password123';
      const errorMessage = 'Database error.';
      const error = new AppError(errorMessage, 500);

      req.body = { email, password };
      userService.loginUser.mockRejectedValue(error);

      await userController.loginUser(req, res, next);

      expect(userService.loginUser).toHaveBeenCalledWith(email, password);
      expect(logger.info).toHaveBeenCalledWith(`Logging in user with email: ${email}`);
      expect(logger.warn).not.toHaveBeenCalledWith(expect.stringContaining('Login failed for email:'));
      expect(logger.error).toHaveBeenCalledWith(`Error logging in user: ${errorMessage}`);
      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('updateProfile', () => {
    it('should update user profile and respond with 200 status', async () => {
      const userId = req.user._id;
      const updateData = { bio: 'New bio', status: 'active', username: 'newusername', profilePicture: '/uploads/profilePictures/newpic.jpg' };
      const updatedUser = {
        _id: userId,
        email: 'test@example.com',
        username: 'newusername',
        profilePicture: '/uploads/profilePictures/newpic.jpg',
        bio: 'New bio',
        status: 'active',
      };

      req.body = { bio: 'New bio', status: 'active', newUsername: 'newusername' };
      req.file = { filename: 'newpic.jpg' };
      userService.updateUserProfile.mockResolvedValue(updatedUser);

      await userController.updateProfile(req, res, next);

      expect(userService.updateUserProfile).toHaveBeenCalledWith(userId, updateData);
      expect(logger.info).toHaveBeenCalledWith(`User ID ${userId} is updating their profile`);
      expect(logger.info).toHaveBeenCalledWith(`User profile updated for ID: ${userId}`);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
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

    it('should handle errors and pass to next when user not found', async () => {
      const userId = req.user._id;
      const updateData = { bio: 'New bio' };
      const errorMessage = 'User not found.';
      const error = new AppError(errorMessage, 404);

      req.body = { bio: 'New bio' };
      userService.updateUserProfile.mockRejectedValue(error);

      await userController.updateProfile(req, res, next);

      expect(userService.updateUserProfile).toHaveBeenCalledWith(userId, updateData);
      expect(logger.info).toHaveBeenCalledWith(`User ID ${userId} is updating their profile`);
      expect(logger.warn).toHaveBeenCalledWith(`User ID ${userId} not found for profile update.`);
      expect(logger.error).not.toHaveBeenCalledWith(expect.stringContaining('Error updating user profile'));
      expect(next).toHaveBeenCalledWith(error);
    });

    it('should handle errors and pass to next on other errors', async () => {
      const userId = req.user._id;
      const updateData = { bio: 'New bio' };
      const errorMessage = 'Database error.';
      const error = new AppError(errorMessage, 500);

      req.body = { bio: 'New bio' };
      userService.updateUserProfile.mockRejectedValue(error);

      await userController.updateProfile(req, res, next);

      expect(userService.updateUserProfile).toHaveBeenCalledWith(userId, updateData);
      expect(logger.info).toHaveBeenCalledWith(`User ID ${userId} is updating their profile`);
      expect(logger.warn).not.toHaveBeenCalledWith(expect.stringContaining('User ID'));
      expect(logger.error).toHaveBeenCalledWith(`Error updating user profile: ${errorMessage}`);
      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('getCurrentUserInfo', () => {
    it('should retrieve current user information and respond with 200 status', async () => {
      const userId = req.user._id;
      const user = {
        _id: userId,
        email: 'test@example.com',
        username: 'testuser',
        profilePicture: '/uploads/profilePictures/pic.jpg',
        bio: 'Bio',
        status: 'active',
      };

      userService.getUserById.mockResolvedValue(user);

      await userController.getCurrentUserInfo(req, res, next);

      expect(userService.getUserById).toHaveBeenCalledWith(userId);
      expect(logger.info).toHaveBeenCalledWith(`Fetching information for user ID: ${userId}`);
      expect(logger.info).toHaveBeenCalledWith(`User information retrieved for ID: ${userId}`);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
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

    it('should handle errors and pass to next when user not found', async () => {
      const userId = req.user._id;
      const errorMessage = 'User not found.';
      const error = new AppError(errorMessage, 404);

      userService.getUserById.mockRejectedValue(error);

      await userController.getCurrentUserInfo(req, res, next);

      expect(userService.getUserById).toHaveBeenCalledWith(userId);
      expect(logger.info).toHaveBeenCalledWith(`Fetching information for user ID: ${userId}`);
      expect(logger.warn).toHaveBeenCalledWith(`User ID ${userId} not found.`);
      expect(logger.error).not.toHaveBeenCalledWith(expect.stringContaining('Error fetching user information'));
      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('logoutUser', () => {
    it('should logout user by blacklisting refresh token and respond with 200 status', async () => {
      const userId = req.user._id;
      const refreshToken = 'valid-refresh-token';
      const decoded = { jti: 'token-jti', exp: Math.floor(Date.now() / 1000) + 3600 };

      req.cookies.refreshToken = refreshToken;
      jwt.verify = jest.fn().mockReturnValue(decoded);
      blacklistToken.mockResolvedValue();

      await userController.logoutUser(req, res, next);

      expect(logger.info).toHaveBeenCalledWith(`User ID ${userId} is logging out`);
      expect(jwt.verify).toHaveBeenCalledWith(refreshToken, process.env.REFRESH_TOKEN_SECRET);
      expect(blacklistToken).toHaveBeenCalledWith(decoded.jti, new Date(decoded.exp * 1000));
      expect(res.clearCookie).toHaveBeenCalledWith('accessToken');
      expect(res.clearCookie).toHaveBeenCalledWith('refreshToken');
      expect(logger.info).toHaveBeenCalledWith(`User ID ${userId} has been logged out successfully`);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ status: 'success', message: 'User logged out successfully.' });
    });

    it('should handle errors and pass to next when refresh token is invalid', async () => {
      const userId = req.user._id;
      const refreshToken = 'invalid-refresh-token';
      const errorMessage = 'jwt malformed';
      const error = new Error(errorMessage);

      req.cookies.refreshToken = refreshToken;
      jwt.verify = jest.fn().mockImplementation(() => { throw error; });

      await userController.logoutUser(req, res, next);

      expect(logger.info).toHaveBeenCalledWith(`User ID ${userId} is logging out`);
      expect(jwt.verify).toHaveBeenCalledWith(refreshToken, process.env.REFRESH_TOKEN_SECRET);
      expect(logger.error).toHaveBeenCalledWith(`Error during logout for user ID ${userId}: ${errorMessage}`);
      expect(next).toHaveBeenCalledWith(new AppError('Invalid refresh token.', 400));
    });
  });

  describe('changePassword', () => {
    it('should change user password and respond with 200 status', async () => {
      const userId = req.user._id;
      const currentPassword = 'oldpassword';
      const newPassword = 'newpassword';
      const updatedUser = { _id: userId, email: 'test@example.com', username: 'testuser' };

      req.body = { currentPassword, newPassword };
      userService.changePassword.mockResolvedValue(updatedUser);

      await userController.changePassword(req, res, next);

      expect(userService.changePassword).toHaveBeenCalledWith(userId, currentPassword, newPassword);
      expect(logger.info).toHaveBeenCalledWith(`User ID ${userId} is changing their password`);
      expect(logger.info).toHaveBeenCalledWith(`User ID ${userId} has changed their password successfully`);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ status: 'success', message: 'Password changed successfully.' });
    });

    it('should handle errors and pass to next when user not found', async () => {
      const userId = req.user._id;
      const currentPassword = 'oldpassword';
      const newPassword = 'newpassword';
      const errorMessage = 'User not found.';
      const error = new AppError(errorMessage, 404);

      req.body = { currentPassword, newPassword };
      userService.changePassword.mockRejectedValue(error);

      await userController.changePassword(req, res, next);

      expect(userService.changePassword).toHaveBeenCalledWith(userId, currentPassword, newPassword);
      expect(logger.info).toHaveBeenCalledWith(`User ID ${userId} is changing their password`);
      expect(logger.warn).toHaveBeenCalledWith(`User ID ${userId} not found for password change.`);
      expect(logger.error).not.toHaveBeenCalledWith(expect.stringContaining('Error changing password'));
      expect(next).toHaveBeenCalledWith(error);
    });

    it('should handle errors and pass to next when current password is incorrect', async () => {
      const userId = req.user._id;
      const currentPassword = 'wrongpassword';
      const newPassword = 'newpassword';
      const errorMessage = 'Current password is incorrect.';
      const error = new AppError(errorMessage, 401);

      req.body = { currentPassword, newPassword };
      userService.changePassword.mockRejectedValue(error);

      await userController.changePassword(req, res, next);

      expect(userService.changePassword).toHaveBeenCalledWith(userId, currentPassword, newPassword);
      expect(logger.info).toHaveBeenCalledWith(`User ID ${userId} is changing their password`);
      expect(logger.warn).toHaveBeenCalledWith(`Incorrect current password provided by user ID ${userId}.`);
      expect(logger.error).not.toHaveBeenCalledWith(expect.stringContaining('Error changing password'));
      expect(next).toHaveBeenCalledWith(error);
    });

    it('should handle errors and pass to next on other errors', async () => {
      const userId = req.user._id;
      const currentPassword = 'oldpassword';
      const newPassword = 'newpassword';
      const errorMessage = 'Database error.';
      const error = new AppError(errorMessage, 500);

      req.body = { currentPassword, newPassword };
      userService.changePassword.mockRejectedValue(error);

      await userController.changePassword(req, res, next);

      expect(userService.changePassword).toHaveBeenCalledWith(userId, currentPassword, newPassword);
      expect(logger.info).toHaveBeenCalledWith(`User ID ${userId} is changing their password`);
      expect(logger.warn).not.toHaveBeenCalledWith(expect.stringContaining('Incorrect current password'));
      expect(logger.error).toHaveBeenCalledWith(`Error changing password for user ID ${userId}: ${errorMessage}`);
      expect(next).toHaveBeenCalledWith(error);
    });
  });
});