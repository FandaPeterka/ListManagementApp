// tests/features/tokens/tokenService.test.js

// 1. Mockování závislostí před importem modulu
jest.mock('jsonwebtoken');
jest.mock('uuid');
jest.mock('../../features/tokens/refreshTokenModel');
jest.mock('../../middleware/logger');

// 2. Importování modulu po mockování závislostí
const tokenService = require('../../features/tokens/tokenService');
const RefreshToken = require('../../features/tokens/refreshTokenModel');
const { AppError } = require('../../middleware/errorHandler');
const logger = require('../../middleware/logger');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');

describe('Token Service', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('generateTokens', () => {
    it('should generate access and refresh tokens and create a RefreshToken document', async () => {
      // Nastavení mocků
      uuidv4.mockReturnValue('test-jti');
      jwt.sign.mockImplementation((payload, secret, options) => {
        return `${payload.id}-${payload.jti}-${options.expiresIn}`;
      });
      const mockExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 dní
      RefreshToken.create.mockResolvedValue({
        jti: 'test-jti',
        userId: 'user-id',
        expiresAt: mockExpiresAt,
      });

      // Volání funkce
      const tokens = await tokenService.generateTokens('user-id');

      // Ověření volání a výsledků
      expect(logger.info).toHaveBeenCalledWith('Generating tokens for user ID: user-id');
      expect(uuidv4).toHaveBeenCalled();
      expect(jwt.sign).toHaveBeenCalledWith(
        { id: 'user-id', jti: 'test-jti' },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: '15m' }
      );
      expect(jwt.sign).toHaveBeenCalledWith(
        { id: 'user-id', jti: 'test-jti' },
        process.env.REFRESH_TOKEN_SECRET,
        { expiresIn: '7d' }
      );
      expect(RefreshToken.create).toHaveBeenCalledWith({
        jti: 'test-jti',
        userId: 'user-id',
        expiresAt: mockExpiresAt,
      });
      expect(logger.info).toHaveBeenCalledWith('Tokens successfully generated.');
      expect(tokens).toEqual({
        accessToken: 'user-id-test-jti-15m',
        refreshToken: 'user-id-test-jti-7d',
      });
    });

    it('should throw AppError if RefreshToken.create fails with duplicate key error', async () => {
      // Nastavení mocků
      uuidv4.mockReturnValue('test-jti');
      jwt.sign.mockImplementation((payload, secret, options) => {
        return `${payload.id}-${payload.jti}-${options.expiresIn}`;
      });
      const duplicateError = { code: 11000 };
      RefreshToken.create.mockRejectedValue(duplicateError);

      // Volání funkce a očekávání chyby
      await expect(tokenService.generateTokens('user-id')).rejects.toThrow(AppError);
      await expect(tokenService.generateTokens('user-id')).rejects.toThrow('Token generation failed due to duplicate JTI.');

      // Ověření volání
      expect(logger.info).toHaveBeenCalledWith('Generating tokens for user ID: user-id');
      expect(uuidv4).toHaveBeenCalled();
      expect(jwt.sign).toHaveBeenCalledWith(
        { id: 'user-id', jti: 'test-jti' },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: '15m' }
      );
      expect(jwt.sign).toHaveBeenCalledWith(
        { id: 'user-id', jti: 'test-jti' },
        process.env.REFRESH_TOKEN_SECRET,
        { expiresIn: '7d' }
      );
      expect(RefreshToken.create).toHaveBeenCalledWith({
        jti: 'test-jti',
        userId: 'user-id',
        expiresAt: expect.any(Date),
      });
      expect(logger.warn).toHaveBeenCalledWith('Token with jti: test-jti already exists.');
    });

    it('should throw AppError if RefreshToken.create fails with other errors', async () => {
      // Nastavení mocků
      uuidv4.mockReturnValue('test-jti');
      jwt.sign.mockImplementation((payload, secret, options) => {
        return `${payload.id}-${payload.jti}-${options.expiresIn}`;
      });
      const otherError = new Error('Database error');
      RefreshToken.create.mockRejectedValue(otherError);

      // Volání funkce a očekávání chyby
      await expect(tokenService.generateTokens('user-id')).rejects.toThrow(AppError);
      await expect(tokenService.generateTokens('user-id')).rejects.toThrow('Failed to generate tokens.');

      // Ověření volání
      expect(logger.info).toHaveBeenCalledWith('Generating tokens for user ID: user-id');
      expect(uuidv4).toHaveBeenCalled();
      expect(jwt.sign).toHaveBeenCalledWith(
        { id: 'user-id', jti: 'test-jti' },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: '15m' }
      );
      expect(jwt.sign).toHaveBeenCalledWith(
        { id: 'user-id', jti: 'test-jti' },
        process.env.REFRESH_TOKEN_SECRET,
        { expiresIn: '7d' }
      );
      expect(RefreshToken.create).toHaveBeenCalledWith({
        jti: 'test-jti',
        userId: 'user-id',
        expiresAt: expect.any(Date),
      });
      expect(logger.error).toHaveBeenCalledWith(`Failed to generate tokens: ${otherError.message}`);
    });
  });

  describe('rotateRefreshToken', () => {
    it('should delete old refresh token and generate new tokens', async () => {
      // Nastavení mocků
      RefreshToken.deleteOne.mockResolvedValue({ deletedCount: 1 });
      // Použití jest.spyOn pro správné mockování generateTokens
      const generateTokensSpy = jest.spyOn(tokenService, 'generateTokens').mockResolvedValue({
        accessToken: 'new-access-token',
        refreshToken: 'new-refresh-token',
      });

      // Volání funkce
      const tokens = await tokenService.rotateRefreshToken('old-jti', 'user-id');

      // Ověření volání a výsledků
      expect(logger.info).toHaveBeenCalledWith('Rotating refresh token for user ID: user-id');
      expect(RefreshToken.deleteOne).toHaveBeenCalledWith({ jti: 'old-jti' });
      expect(logger.info).toHaveBeenCalledWith('Old refresh token successfully deleted. Generating new tokens.');
      expect(generateTokensSpy).toHaveBeenCalledWith('user-id');
      expect(tokens).toEqual({
        accessToken: 'new-access-token',
        refreshToken: 'new-refresh-token',
      });
    });

    it('should throw AppError if old refresh token is not found', async () => {
      // Nastavení mocků
      RefreshToken.deleteOne.mockResolvedValue({ deletedCount: 0 });

      // Volání funkce a očekávání chyby
      await expect(tokenService.rotateRefreshToken('nonexistent-jti', 'user-id')).rejects.toThrow(AppError);
      await expect(tokenService.rotateRefreshToken('nonexistent-jti', 'user-id')).rejects.toThrow('Invalid refresh token.');

      // Ověření volání
      expect(logger.info).toHaveBeenCalledWith('Rotating refresh token for user ID: user-id');
      expect(RefreshToken.deleteOne).toHaveBeenCalledWith({ jti: 'nonexistent-jti' });
      expect(logger.warn).toHaveBeenCalledWith('Failed to rotate token. Token with jti: nonexistent-jti not found.');
    });

    it('should throw AppError if generateTokens fails after deleting old token', async () => {
      // Nastavení mocků
      RefreshToken.deleteOne.mockResolvedValue({ deletedCount: 1 });
      const mockError = new AppError('Failed to generate tokens.', 500);
      // Použití jest.spyOn pro mockování generateTokens s chybou
      jest.spyOn(tokenService, 'generateTokens').mockRejectedValue(mockError);

      // Volání funkce a očekávání chyby
      await expect(tokenService.rotateRefreshToken('old-jti', 'user-id')).rejects.toThrow(AppError);
      await expect(tokenService.rotateRefreshToken('old-jti', 'user-id')).rejects.toThrow('Failed to generate tokens.');

      // Ověření volání
      expect(logger.info).toHaveBeenCalledWith('Rotating refresh token for user ID: user-id');
      expect(RefreshToken.deleteOne).toHaveBeenCalledWith({ jti: 'old-jti' });
      expect(logger.info).toHaveBeenCalledWith('Old refresh token successfully deleted. Generating new tokens.');
      expect(tokenService.generateTokens).toHaveBeenCalledWith('user-id');
    });
  });
});