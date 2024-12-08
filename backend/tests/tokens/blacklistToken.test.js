// tests/features/tokens/blacklistToken.test.js
const BlacklistedToken = require('../../features/tokens/blacklistedTokenModel');
const { blacklistToken, checkBlacklist } = require('../../features/tokens/blacklistToken');
const jwt = require('jsonwebtoken');

jest.mock('../../middleware/logger', () => ({
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
}));

describe('Blacklist Token', () => {
  afterEach(async () => {
    await BlacklistedToken.deleteMany();
    jest.clearAllMocks();
  });

  describe('blacklistToken', () => {
    it('should blacklist a token successfully', async () => {
      const jti = 'test-jti';
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

      await blacklistToken(jti, expiresAt);

      const blacklisted = await BlacklistedToken.findOne({ jti });
      expect(blacklisted).toBeDefined();
      expect(blacklisted.expiresAt).toEqual(expiresAt);
    });

    it('should handle duplicate blacklisting gracefully', async () => {
      const jti = 'test-jti';
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

      await blacklistToken(jti, expiresAt);
      await expect(blacklistToken(jti, expiresAt)).resolves.not.toThrow();
    });
  });

  describe('checkBlacklist', () => {
    it('should call next if token is not blacklisted', async () => {
      const req = {
        cookies: {
          accessToken: 'valid-token',
        },
      };
      const res = {};
      const next = jest.fn();

      jwt.verify = jest.fn().mockReturnValue({ jti: 'valid-jti' });
      BlacklistedToken.findOne = jest.fn().mockResolvedValue(null);

      await checkBlacklist(req, res, next);

      expect(next).toHaveBeenCalled();
    });

    it('should return error if token is blacklisted', async () => {
      const req = {
        cookies: {
          accessToken: 'blacklisted-token',
        },
      };
      const res = {};
      const next = jest.fn();

      jwt.verify = jest.fn().mockReturnValue({ jti: 'blacklisted-jti' });
      BlacklistedToken.findOne = jest.fn().mockResolvedValue({ jti: 'blacklisted-jti' });

      await checkBlacklist(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(Error));
      expect(next.mock.calls[0][0].message).toBe('Token is blacklisted.');
    });
  });
});