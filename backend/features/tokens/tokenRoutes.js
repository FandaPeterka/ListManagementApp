const express = require('express');
const router = express.Router();
const tokenController = require('./tokenController');
const validateRefreshToken = require('./validateRefreshToken');

/**
 * @swagger
 * tags:
 *   name: Tokens
 *   description: API endpoints for token management
 */

/**
 * @swagger
 * /tokens/refresh-token:
 *   post:
 *     summary: Refresh access and refresh tokens
 *     tags: [Tokens]
 *     description: Use this endpoint to refresh your access token using a valid refresh token.
 *     responses:
 *       200:
 *         description: Tokens refreshed successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: './tokenSchemas.yaml#/AuthTokensResponse'
 *       401:
 *         description: Invalid or expired refresh token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: './tokenSchemas.yaml#/ErrorResponse'
 */
router.post('/refresh-token', validateRefreshToken, tokenController.refreshToken);

module.exports = router;