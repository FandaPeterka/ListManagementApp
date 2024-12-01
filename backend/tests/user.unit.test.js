const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const User = require('../features/users/userModel');
const RefreshToken = require('../features/tokens/refreshTokenModel');
const userService = require('../features/users/userService');
const { signupSchema, loginSchema } = require('../features/users/userValidation');
const { AppError } = require('../middleware/errorHandler');

describe('User Unit Tests', () => {
  let userId;
  let email = 'testuser@example.com';
  let username = 'testuser';
  let password = 'password123';
  let hashedPassword;

  beforeEach(async () => {
    userId = new mongoose.Types.ObjectId();
    hashedPassword = await bcrypt.hash(password, 10);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  /**
   * Testy modelu uživatele
   */
  describe('User Model', () => {
    it('should successfully create and save a user', async () => {
      const user = new User({ email, username, password: hashedPassword });
      const savedUser = await user.save();

      expect(savedUser._id).toBeDefined();
      expect(savedUser.email).toBe(email);
      expect(savedUser.username).toBe(username);
      expect(savedUser.password).toBe(hashedPassword);
    });

    it('should fail to create a user with missing fields', async () => {
      const user = new User({ email });
      await expect(user.save()).rejects.toThrow(mongoose.Error.ValidationError);
    });

    it('should fail to create a user with duplicate email', async () => {
      await User.create({ email, username, password: hashedPassword });
      await expect(User.create({ email, username: 'newuser', password })).rejects.toThrow();
    });
  });

  /**
   * Testy validace
   */
  describe('Validation Tests', () => {
    describe('Signup Validation', () => {
      it('should validate correct signup data', () => {
        const validData = { email, username, password };
        const { error } = signupSchema.validate(validData);
        expect(error).toBeUndefined();
      });

      it('should invalidate data with incorrect email', () => {
        const invalidData = { email: 'invalid', username, password };
        const { error } = signupSchema.validate(invalidData);
        expect(error).toBeDefined();
      });
    });

    describe('Login Validation', () => {
      it('should validate correct login data', () => {
        const validData = { email, password };
        const { error } = loginSchema.validate(validData);
        expect(error).toBeUndefined();
      });

      it('should invalidate data with missing password', () => {
        const invalidData = { email };
        const { error } = loginSchema.validate(invalidData);
        expect(error).toBeDefined();
      });
    });
  });

  /**
   * Testy služeb
   */
  describe('User Service Tests', () => {
    beforeAll(() => {
      jest.spyOn(User, 'findOne').mockImplementation();
      jest.spyOn(User, 'create').mockImplementation();
      jest.spyOn(bcrypt, 'hash').mockImplementation();
      jest.spyOn(bcrypt, 'compare').mockImplementation();
      jest.spyOn(jwt, 'sign').mockImplementation();
      jest.spyOn(RefreshToken, 'create').mockImplementation();
    });

    afterEach(() => {
      jest.resetAllMocks();
    });

    describe('registerUser', () => {
      it('should register a new user', async () => {
        User.findOne.mockResolvedValue(null);
        bcrypt.hash.mockResolvedValue(hashedPassword);
        User.create.mockResolvedValue({ _id: userId, email, username });

        const user = await userService.registerUser(email, username, password);

        expect(User.findOne).toHaveBeenCalledWith({ $or: [{ email }, { username }] });
        expect(bcrypt.hash).toHaveBeenCalledWith(password, 10);
        expect(User.create).toHaveBeenCalledWith({ email, username, password: hashedPassword });
        expect(user).toHaveProperty('_id', userId);
      });

      it('should throw an error if the user already exists', async () => {
        User.findOne.mockResolvedValue({ email });
        await expect(userService.registerUser(email, username, password)).rejects.toThrow(AppError);
      });
    });

    describe('loginUser', () => {
      it('should login a user successfully', async () => {
        User.findOne.mockResolvedValue({ _id: userId, email, username, password: hashedPassword });
        bcrypt.compare.mockResolvedValue(true);

        const user = await userService.loginUser(email, password);

        expect(User.findOne).toHaveBeenCalledWith({ email });
        expect(bcrypt.compare).toHaveBeenCalledWith(password, hashedPassword);
        expect(user).toHaveProperty('_id', userId);
      });

      it('should throw an error if the user is not found', async () => {
        User.findOne.mockResolvedValue(null);
        await expect(userService.loginUser(email, password)).rejects.toThrow(AppError);
      });

      it('should throw an error if the password is incorrect', async () => {
        User.findOne.mockResolvedValue({ _id: userId, email, username, password: hashedPassword });
        bcrypt.compare.mockResolvedValue(false);

        await expect(userService.loginUser(email, password)).rejects.toThrow(AppError);
      });
    });

    describe('generateTokens', () => {
      it('should generate access and refresh tokens', async () => {
        const accessToken = 'access-token';
        const refreshToken = 'refresh-token';
        jwt.sign.mockReturnValueOnce(accessToken).mockReturnValueOnce(refreshToken);

        const tokens = await userService.generateTokens(userId);

        expect(jwt.sign).toHaveBeenCalledTimes(2);
        expect(tokens).toHaveProperty('accessToken', accessToken);
        expect(tokens).toHaveProperty('refreshToken', refreshToken);
      });
    });
  });
});