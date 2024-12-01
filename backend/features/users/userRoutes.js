const express = require('express');
const router = express.Router();
const userController = require('./userController');
const validate = require('../../middleware/validate');
const {
  signupSchema,
  loginSchema,
  updateProfileSchema,
  changePasswordSchema,
} = require('./userValidation');
const requireAuth = require('../../middleware/requireAuth');
const { checkBlacklist } = require('../tokens/blacklistToken');
const upload = require('../../middleware/uploadMiddleware');

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: API endpoints for user management
 */

/**
 * @swagger
 * /users/signup:
 *   post:
 *     summary: Register a new user
 *     tags: [Users]
 *     description: Create a new user account with an email, username, and password.
 *     requestBody:
 *       description: User registration data
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: './userSchemas.yaml#/SignupUser'
 *     responses:
 *       201:
 *         description: User registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: './userSchemas.yaml#/UserResponse'
 *       400:
 *         description: Bad request, possibly due to validation errors
 *         content:
 *           application/json:
 *             schema:
 *               $ref: './userSchemas.yaml#/ErrorResponse'
 */
router.post('/signup', validate(signupSchema), userController.signupUser);

/**
 * @swagger
 * /users/login:
 *   post:
 *     summary: Login a user
 *     tags: [Users]
 *     description: Authenticate a user using their email and password.
 *     requestBody:
 *       description: User login credentials
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: './userSchemas.yaml#/LoginUser'
 *     responses:
 *       200:
 *         description: User logged in successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: './userSchemas.yaml#/AuthTokensResponse'
 *       401:
 *         description: Unauthorized, invalid credentials
 *         content:
 *           application/json:
 *             schema:
 *               $ref: './userSchemas.yaml#/ErrorResponse'
 */
router.post('/login', validate(loginSchema), userController.loginUser);

/**
 * @swagger
 * /users/me:
 *   get:
 *     summary: Get current user information
 *     tags: [Users]
 *     description: Retrieve the profile information of the currently authenticated user.
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Current user information retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: './userSchemas.yaml#/UserResponse'
 *       401:
 *         description: Unauthorized, authentication required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: './userSchemas.yaml#/ErrorResponse'
 */
router.get('/me', checkBlacklist, requireAuth, userController.getCurrentUserInfo);

/**
 * @swagger
 * /users/logout:
 *   post:
 *     summary: Logout the current user
 *     tags: [Users]
 *     description: Logout the currently authenticated user and invalidate their tokens.
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: User logged out successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: './userSchemas.yaml#/SuccessResponse'
 *       401:
 *         description: Unauthorized, authentication required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: './userSchemas.yaml#/ErrorResponse'
 */
router.post('/logout', requireAuth, userController.logoutUser);

/**
 * @swagger
 * /users/me:
 *   put:
 *     summary: Update current user's profile
 *     tags: [Users]
 *     description: Update the profile information of the currently authenticated user.
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       description: Updated user profile data
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             $ref: './userSchemas.yaml#/UpdateProfile'
 *     responses:
 *       200:
 *         description: User profile updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: './userSchemas.yaml#/UserResponse'
 *       400:
 *         description: Bad request, possibly due to validation errors
 *         content:
 *           application/json:
 *             schema:
 *               $ref: './userSchemas.yaml#/ErrorResponse'
 *       401:
 *         description: Unauthorized, authentication required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: './userSchemas.yaml#/ErrorResponse'
 */
router.put(
  '/me',
  requireAuth,
  upload.single('profilePicture'),
  validate(updateProfileSchema),
  userController.updateProfile
);

/**
 * @swagger
 * /users/change-password:
 *   post:
 *     summary: Change the current user's password
 *     tags: [Users]
 *     description: Update the password of the currently authenticated user.
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       description: Current and new password
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: './userSchemas.yaml#/ChangePassword'
 *     responses:
 *       200:
 *         description: Password changed successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: './userSchemas.yaml#/SuccessResponse'
 *       400:
 *         description: Bad request, possibly due to validation errors
 *         content:
 *           application/json:
 *             schema:
 *               $ref: './userSchemas.yaml#/ErrorResponse'
 *       401:
 *         description: Unauthorized, authentication required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: './userSchemas.yaml#/ErrorResponse'
 */
router.post(
  '/change-password',
  requireAuth,
  validate(changePasswordSchema),
  userController.changePassword
);

module.exports = router;