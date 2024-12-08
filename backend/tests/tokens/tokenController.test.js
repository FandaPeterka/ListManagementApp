// tests/features/tokens/tokenController.test.js
const tokenController = require('../../features/tokens/tokenController');
const tokenService = require('../../features/tokens/tokenService');
const sendTokensResponse = require('../../features/tokens/sendTokensResponse');
const { AppError } = require('../../middleware/errorHandler');

jest.mock('../../features/tokens/tokenService');
jest.mock('../../features/tokens/sendTokensResponse', () => jest.fn());
jest.mock('../../middleware/logger', () => ({
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
}));

describe('Token Controller', () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      user: { _id: 'user-id' },
      jti: 'old-jti',
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    next = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('refreshToken', () => {
    it('should refresh tokens and send response', async () => {
      tokenService.rotateRefreshToken.mockResolvedValue({
        accessToken: 'new-access-token',
        refreshToken: 'new-refresh-token',
      });

      await tokenController.refreshToken(req, res, next);

      expect(tokenService.rotateRefreshToken).toHaveBeenCalledWith('old-jti', 'user-id');
      expect(sendTokensResponse).toHaveBeenCalledWith(
        res,
        req.user,
        'new-access-token',
        'new-refresh-token',
        200,
        next
      );
    });

    it('should handle errors and pass to next', async () => {
      tokenService.rotateRefreshToken.mockRejectedValue(new Error('Failed to rotate token'));

      await tokenController.refreshToken(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(Error));
      expect(next.mock.calls[0][0].message).toBe('Failed to rotate token');
    });
  });
});