// tests/middleware/requireAuth.test.js
const requireAuth = require('../../middleware/requireAuth');
const jwt = require('jsonwebtoken');
const BlacklistedToken = require('../../features/tokens/blacklistedTokenModel');
const logger = require('../../middleware/logger');
const { AppError } = require('../../middleware/errorHandler');

jest.mock('jsonwebtoken');
jest.mock('../../features/tokens/blacklistedTokenModel');
jest.mock('../../middleware/logger', () => ({
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
}));

describe('Middleware requireAuth', () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      cookies: {},
    };
    res = {};
    next = jest.fn();
  });

  it('should authenticate user with valid token', async () => {
    req.cookies.accessToken = 'valid-token';
    const decodedToken = { id: 'user-id', jti: 'jwt-id' };
    jwt.verify.mockReturnValue(decodedToken);
    BlacklistedToken.findOne.mockResolvedValue(null);

    await requireAuth(req, res, next);

    expect(logger.info).toHaveBeenCalledWith(`Decoded token: ${JSON.stringify(decodedToken)}`);
    expect(req.user).toEqual({ _id: 'user-id' });
    expect(next).toHaveBeenCalled();
  });

  it('should return error when token is missing', async () => {
    await requireAuth(req, res, next);

    expect(logger.warn).toHaveBeenCalledWith('Access token missing.');
    expect(next).toHaveBeenCalledWith(expect.any(AppError));
    const error = next.mock.calls[0][0];
    expect(error.statusCode).toBe(401);
    expect(error.message).toBe('Access token is missing.');
  });

  it('should return error with invalid token', async () => {
    req.cookies.accessToken = 'invalid-token';
    jwt.verify.mockImplementation(() => {
      throw new Error('Invalid token');
    });

    await requireAuth(req, res, next);

    expect(logger.error).toHaveBeenCalledWith('Error verifying token: Invalid token');
    expect(next).toHaveBeenCalledWith(expect.any(AppError));
    const error = next.mock.calls[0][0];
    expect(error.statusCode).toBe(401);
    expect(error.message).toBe('Invalid access token.');
  });
});