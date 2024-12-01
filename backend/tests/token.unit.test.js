const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const RefreshToken = require('../features/tokens/refreshTokenModel');
const BlacklistedToken = require('../features/tokens/blacklistedTokenModel');
const { AppError } = require('../middleware/errorHandler');
const tokenService = require('../features/tokens/tokenService');

describe('Unit Tests for Token System', () => {
  let userId;

  beforeAll(() => {
    userId = new mongoose.Types.ObjectId();
  });

  describe('RefreshToken Model', () => {
    it('should create a valid refresh token', async () => {
      const tokenData = {
        jti: 'unique-jti-123',
        userId,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      };
      const refreshToken = new RefreshToken(tokenData);
      const savedToken = await refreshToken.save();

      expect(savedToken._id).toBeDefined();
      expect(savedToken.jti).toBe(tokenData.jti);
      expect(savedToken.userId.toString()).toBe(userId.toString());
      expect(savedToken.expiresAt).toEqual(tokenData.expiresAt);
    });

    it('should not save a refresh token without required fields', async () => {
      const tokenWithoutFields = new RefreshToken({});
      await expect(tokenWithoutFields.save()).rejects.toThrow(mongoose.Error.ValidationError);
    });

    it('should not save a refresh token with duplicate jti', async () => {
      const tokenData = {
        jti: 'duplicate-jti-123',
        userId,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      };
      await new RefreshToken(tokenData).save();
      await expect(new RefreshToken(tokenData).save()).rejects.toThrow();
    });
  });

  describe('BlacklistedToken Model', () => {
    it('should create a valid blacklisted token', async () => {
      const tokenData = {
        jti: 'unique-blacklist-jti-123',
        expiresAt: new Date(Date.now() + 60 * 60 * 1000),
      };
      const blacklistedToken = new BlacklistedToken(tokenData);
      const savedToken = await blacklistedToken.save();

      expect(savedToken._id).toBeDefined();
      expect(savedToken.jti).toBe(tokenData.jti);
      expect(savedToken.expiresAt).toEqual(tokenData.expiresAt);
    });

    it('should not save a blacklisted token without required fields', async () => {
      const tokenWithoutFields = new BlacklistedToken({});
      await expect(tokenWithoutFields.save()).rejects.toThrow(mongoose.Error.ValidationError);
    });

    it('should not save a blacklisted token with duplicate jti', async () => {
      const tokenData = {
        jti: 'duplicate-blacklist-jti-123',
        expiresAt: new Date(Date.now() + 60 * 60 * 1000),
      };
      await new BlacklistedToken(tokenData).save();
      await expect(new BlacklistedToken(tokenData).save()).rejects.toThrow();
    });
  });

  describe('Token Service', () => {
    it('should generate access and refresh tokens and save the refresh token', async () => {
      const tokens = await tokenService.generateTokens(userId);

      expect(tokens.accessToken).toBeDefined();
      expect(tokens.refreshToken).toBeDefined();

      const decodedAccess = jwt.verify(tokens.accessToken, process.env.ACCESS_TOKEN_SECRET);
      const decodedRefresh = jwt.verify(tokens.refreshToken, process.env.REFRESH_TOKEN_SECRET);

      expect(decodedAccess.id).toBe(userId.toString());
      expect(decodedRefresh.id).toBe(userId.toString());
      expect(decodedAccess.jti).toBe(decodedRefresh.jti);

      const storedToken = await RefreshToken.findOne({ jti: decodedRefresh.jti });
      expect(storedToken).toBeDefined();
      expect(storedToken.userId.toString()).toBe(userId.toString());
    });

    it('should delete the old refresh token and generate new tokens', async () => {
      const initialTokens = await tokenService.generateTokens(userId);
      const oldJti = jwt.verify(initialTokens.refreshToken, process.env.REFRESH_TOKEN_SECRET).jti;

      const newTokens = await tokenService.rotateRefreshToken(oldJti, userId);

      expect(newTokens.accessToken).toBeDefined();
      expect(newTokens.refreshToken).toBeDefined();

      const oldToken = await RefreshToken.findOne({ jti: oldJti });
      expect(oldToken).toBeNull();

      const newDecoded = jwt.verify(newTokens.refreshToken, process.env.REFRESH_TOKEN_SECRET);
      const storedNewToken = await RefreshToken.findOne({ jti: newDecoded.jti });
      expect(storedNewToken).toBeDefined();
      expect(storedNewToken.userId.toString()).toBe(userId.toString());
    });

    it('should throw an error if deleting the old refresh token fails', async () => {
      await expect(tokenService.rotateRefreshToken('non-existent-jti', userId)).rejects.toThrow(AppError);
    });
  });
});