// tests/features/tokens/blacklistedTokenModel.test.js
const mongoose = require('mongoose');
const BlacklistedToken = require('../../features/tokens/blacklistedTokenModel');
const { MongoServerError } = require('mongodb'); // Importujte MongoServerError

describe('BlacklistedToken Model', () => {
  beforeAll(async () => {
    // Zajistěte, že jsou indexy vytvořeny před spuštěním testů
    await BlacklistedToken.init();
  });

  afterEach(async () => {
    // Vyčištění kolekce po každém testu
    await BlacklistedToken.deleteMany();
  });

  it('should create and save a blacklisted token successfully', async () => {
    const tokenData = {
      jti: 'test-jti',
      expiresAt: new Date(Date.now() + 60 * 60 * 1000), // Expires in 1 hour
    };

    const blacklistedToken = new BlacklistedToken(tokenData);
    const savedToken = await blacklistedToken.save();

    expect(savedToken._id).toBeDefined();
    expect(savedToken.jti).toBe(tokenData.jti);
    expect(savedToken.expiresAt).toEqual(tokenData.expiresAt);
  });

  it('should enforce unique jti', async () => {
    const tokenData = {
      jti: 'duplicate-jti',
      expiresAt: new Date(Date.now() + 60 * 60 * 1000),
    };

    await BlacklistedToken.create(tokenData);

    let error;
    try {
      await BlacklistedToken.create(tokenData);
    } catch (err) {
      error = err;
    }

    expect(error).toBeDefined();
    expect(error.name).toBe('MongoServerError');
    expect(error.code).toBe(11000); // Kód chyby pro duplicitní klíč
  });

  it('should require jti and expiresAt fields', async () => {
    const token = new BlacklistedToken({});

    let error;
    try {
      await token.validate();
    } catch (err) {
      error = err;
    }

    expect(error.errors.jti).toBeDefined();
    expect(error.errors.expiresAt).toBeDefined();
  });
});