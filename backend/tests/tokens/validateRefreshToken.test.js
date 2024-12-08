// tests/features/tokens/validateRefreshToken.test.js
const validateRefreshToken = require('../../features/tokens/validateRefreshToken');
const jwt = require('jsonwebtoken');
const RefreshToken = require('../../features/tokens/refreshTokenModel');
const BlacklistedToken = require('../../features/tokens/blacklistedTokenModel');
const User = require('../../features/users/userModel');

jest.mock('../../middleware/logger', () => ({
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
}));

describe('Validate Refresh Token Middleware', () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      cookies: {},
    };
    res = {};
    next = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should pass validation and attach user to request', async () => {
    req.cookies.refreshToken = 'valid-refresh-token';
    const decoded = { jti: 'test-jti', id: 'user-id' };
    jwt.verify = jest.fn().mockReturnValue(decoded);
    BlacklistedToken.findOne = jest.fn().mockResolvedValue(null);
    RefreshToken.findOne = jest.fn().mockResolvedValue({
      jti: 'test-jti',
      expiresAt: new Date(Date.now() + 60 * 60 * 1000),
    });
    User.findById = jest.fn().mockResolvedValue({ _id: 'user-id' });

    await validateRefreshToken(req, res, next);

    expect(req.user).toEqual({ _id: 'user-id' });
    expect(req.jti).toBe('test-jti');
    expect(next).toHaveBeenCalled();
  });

  it('should return error if refresh token is missing', async () => {
    await validateRefreshToken(req, res, next);

    expect(next).toHaveBeenCalledWith(expect.any(Error));
    expect(next.mock.calls[0][0].message).toBe('Refresh token is missing.');
  });

  it('should return error if token is blacklisted', async () => {
    req.cookies.refreshToken = 'blacklisted-token';
    const decoded = { jti: 'blacklisted-jti', id: 'user-id' };
    jwt.verify = jest.fn().mockReturnValue(decoded);
    BlacklistedToken.findOne = jest.fn().mockResolvedValue({ jti: 'blacklisted-jti' });

    await validateRefreshToken(req, res, next);

    expect(next).toHaveBeenCalledWith(expect.any(Error));
    expect(next.mock.calls[0][0].message).toBe('Invalid refresh token.');
  });

  it('should return error if token is expired or invalid', async () => {
    req.cookies.refreshToken = 'expired-token';
    const decoded = { jti: 'expired-jti', id: 'user-id' };
    jwt.verify = jest.fn().mockReturnValue(decoded);
    BlacklistedToken.findOne = jest.fn().mockResolvedValue(null);
    RefreshToken.findOne = jest.fn().mockResolvedValue(null); // Token not found or expired

    await validateRefreshToken(req, res, next);

    expect(next).toHaveBeenCalledWith(expect.any(Error));
    expect(next.mock.calls[0][0].message).toBe('Invalid refresh token.');
  });
});