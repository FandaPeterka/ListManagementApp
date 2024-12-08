// tests/features/users/userModel.test.js
const mongoose = require('mongoose');
const User = require('../../features/users/userModel');
const { MongoServerError } = require('mongodb'); // Import MongoServerError pro unikátní klíče

describe('User Model', () => {
  // Připojení a nastavení je již zajištěno v jest.setup.js

  afterEach(async () => {
    // Vymazání všech uživatelů po každém testu
    await User.deleteMany();
  });

  describe('User Schema Validation', () => {
    it('should create a user with valid data', async () => {
      const userData = {
        email: 'validuser@example.com',
        username: 'validuser',
        password: 'validpassword',
      };

      const user = await User.create(userData);

      expect(user).toBeDefined();
      expect(user.email).toBe(userData.email);
      expect(user.username).toBe(userData.username);
      expect(user.password).toBe(userData.password);
    });

    it('should fail when required fields are missing', async () => {
      const userData = {
        email: 'missingfields@example.com',
        // chybí username a password
      };

      await expect(User.create(userData)).rejects.toThrow(mongoose.Error.ValidationError);
      await expect(User.create(userData)).rejects.toThrow('Please enter a username.');
      await expect(User.create(userData)).rejects.toThrow('Please enter a password.');
    });

    it('should fail when password is too short', async () => {
      const userData = {
        email: 'shortpassword@example.com',
        username: 'shortpassworduser',
        password: '123', // méně než 6 znaků
      };

      await expect(User.create(userData)).rejects.toThrow(mongoose.Error.ValidationError);
      await expect(User.create(userData)).rejects.toThrow(/Path `password`.*is shorter than the minimum allowed length/);
    });

    it('should enforce unique email and username', async () => {
      const userData = {
        email: 'uniqueuser@example.com',
        username: 'uniqueuser',
        password: 'password123',
      };

      await User.create(userData);

      // Pokus o vytvoření dalšího uživatele se stejným emailem
      const duplicateEmailData = {
        email: 'uniqueuser@example.com',
        username: 'anotheruser',
        password: 'password456',
      };

      await expect(User.create(duplicateEmailData)).rejects.toThrow(/duplicate key error/);

      // Pokus o vytvoření dalšího uživatele se stejným username
      const duplicateUsernameData = {
        email: 'anotherunique@example.com',
        username: 'uniqueuser',
        password: 'password789',
      };

      await expect(User.create(duplicateUsernameData)).rejects.toThrow(/duplicate key error/);
    });

    it('should enforce maximum length for bio', async () => {
      const longBio = 'a'.repeat(501); // 501 znaků

      const userData = {
        email: 'longbio@example.com',
        username: 'longbiouser',
        password: 'password123',
        bio: longBio,
      };

      await expect(User.create(userData)).rejects.toThrow(mongoose.Error.ValidationError);
      await expect(User.create(userData)).rejects.toThrow(/Path `bio`.*is longer than the maximum allowed length/);
    });

    it('should set default values correctly', async () => {
      const userData = {
        email: 'defaultvalues@example.com',
        username: 'defaultuser',
        password: 'password123',
      };

      const user = await User.create(userData);

      expect(user.profilePicture).toBeNull();
      expect(user.bio).toBe('');
      expect(user.status).toBe('idle');
    });
  });
});