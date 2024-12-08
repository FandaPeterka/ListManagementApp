// tests/features/tokens/refreshTokenModel.test.js
const mongoose = require('mongoose');
const RefreshToken = require('../../features/tokens/refreshTokenModel');
const User = require('../../features/users/userModel');

describe('RefreshToken Model', () => {
  let user;

  beforeAll(async () => {
    // Vytvoření uživatele pro validní userId
    user = await User.create({
      email: 'testuser@example.com',
      username: 'testuser',
      password: 'password123',
    });
  });

  afterEach(async () => {
    // Vyčistění kolekce po každém testu
    await RefreshToken.deleteMany();
  });

  it('should create and save a refresh token successfully', async () => {
    const tokenData = {
      jti: 'test-jti',
      userId: user._id,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Expires in 7 days
    };

    const refreshToken = new RefreshToken(tokenData);
    const savedToken = await refreshToken.save();

    expect(savedToken._id).toBeDefined();
    expect(savedToken.jti).toBe(tokenData.jti);
    expect(savedToken.userId.toString()).toBe(user._id.toString());
    expect(savedToken.expiresAt).toEqual(tokenData.expiresAt);
  });

  it('should enforce unique jti', async () => {
    const tokenData = {
      jti: 'duplicate-jti',
      userId: user._id,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    };

    await RefreshToken.create(tokenData);

    let error;
    try {
      await RefreshToken.create(tokenData);
    } catch (err) {
      error = err;
    }

    expect(error).toBeDefined();
    expect(error.name).toBe('MongoServerError');
    expect(error.code).toBe(11000); // Kód chyby pro duplicitní klíč
  });

  it('should require jti, userId, and expiresAt fields', async () => {
    const token = new RefreshToken({});

    let err;
    try {
      await token.validate();
    } catch (error) {
      err = error;
    }

    expect(err.errors.jti).toBeDefined();
    expect(err.errors.userId).toBeDefined();
    expect(err.errors.expiresAt).toBeDefined();
  });
});