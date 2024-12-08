// tests/features/users/userValidation.test.js
const Joi = require('joi');
const {
  signupSchema,
  loginSchema,
  updateProfileSchema,
  changePasswordSchema,
} = require('../../features/users/userValidation');

describe('User Validation', () => {
  describe('Signup Schema', () => {
    it('should validate correct signup data', () => {
      const data = {
        email: 'newuser@example.com',
        username: 'newuser',
        password: 'password123',
      };

      const { error } = signupSchema.validate(data);
      expect(error).toBeUndefined();
    });

    it('should fail validation when email is missing', () => {
      const data = {
        username: 'newuser',
        password: 'password123',
      };

      const { error } = signupSchema.validate(data);
      expect(error).toBeDefined();
      expect(error.details[0].message).toBe('Email is required.');
    });

    it('should fail validation when email is invalid', () => {
      const data = {
        email: 'invalidemail',
        username: 'newuser',
        password: 'password123',
      };

      const { error } = signupSchema.validate(data);
      expect(error).toBeDefined();
      expect(error.details[0].message).toBe('Email must be a valid email address.');
    });

    it('should fail validation when username is too short', () => {
      const data = {
        email: 'newuser@example.com',
        username: 'ab',
        password: 'password123',
      };

      const { error } = signupSchema.validate(data);
      expect(error).toBeDefined();
      expect(error.details[0].message).toBe('Username must be at least 3 characters long.');
    });

    it('should fail validation when password is too short', () => {
      const data = {
        email: 'newuser@example.com',
        username: 'newuser',
        password: '123',
      };

      const { error } = signupSchema.validate(data);
      expect(error).toBeDefined();
      expect(error.details[0].message).toBe('Password must be at least 6 characters long.');
    });
  });

  describe('Login Schema', () => {
    it('should validate correct login data', () => {
      const data = {
        email: 'testuser@example.com',
        password: 'password123',
      };

      const { error } = loginSchema.validate(data);
      expect(error).toBeUndefined();
    });

    it('should fail validation when email is missing', () => {
      const data = {
        password: 'password123',
      };

      const { error } = loginSchema.validate(data);
      expect(error).toBeDefined();
      expect(error.details[0].message).toBe('Email is required.');
    });

    it('should fail validation when password is missing', () => {
      const data = {
        email: 'testuser@example.com',
      };

      const { error } = loginSchema.validate(data);
      expect(error).toBeDefined();
      expect(error.details[0].message).toBe('Password is required.');
    });

    it('should fail validation when email is invalid', () => {
      const data = {
        email: 'invalidemail',
        password: 'password123',
      };

      const { error } = loginSchema.validate(data);
      expect(error).toBeDefined();
      expect(error.details[0].message).toBe('Email must be a valid email address.');
    });
  });

  describe('Update Profile Schema', () => {
    it('should validate correct update profile data', () => {
      const data = {
        bio: 'This is my updated bio.',
        status: 'busy',
        newUsername: 'updateduser',
      };

      const { error } = updateProfileSchema.validate(data);
      expect(error).toBeUndefined();
    });

    it('should allow partial updates', () => {
      const data = {
        bio: 'Only updating bio.',
      };

      const { error } = updateProfileSchema.validate(data);
      expect(error).toBeUndefined();
    });

    it('should fail validation when bio is too long', () => {
      const data = {
        bio: 'a'.repeat(501), // 501 znaků
      };

      const { error } = updateProfileSchema.validate(data);
      expect(error).toBeDefined();
      expect(error.details[0].message).toBe('\"bio\" length must be less than or equal to 500 characters long');
    });

    it('should fail validation when status is invalid', () => {
      const data = {
        status: 'unknown',
      };

      const { error } = updateProfileSchema.validate(data);
      expect(error).toBeDefined();
      expect(error.details[0].message).toBe('"status" must be one of [focusing, idle, busy]');
    });

    it('should fail validation when newUsername is too short', () => {
      const data = {
        newUsername: 'ab',
      };

      const { error } = updateProfileSchema.validate(data);
      expect(error).toBeDefined();
      expect(error.details[0].message).toBe('New username must be at least 3 characters long.');
    });
  });

  describe('Change Password Schema', () => {
    it('should validate correct change password data', () => {
      const data = {
        currentPassword: 'password123',
        newPassword: 'newpassword456',
      };

      const { error } = changePasswordSchema.validate(data);
      expect(error).toBeUndefined();
    });

    it('should fail validation when currentPassword is missing', () => {
      const data = {
        newPassword: 'newpassword456',
      };

      const { error } = changePasswordSchema.validate(data);
      expect(error).toBeDefined();
      expect(error.details[0].message).toBe('Current password is required.');
    });

    it('should fail validation when newPassword is missing', () => {
      const data = {
        currentPassword: 'password123',
      };

      const { error } = changePasswordSchema.validate(data);
      expect(error).toBeDefined();
      expect(error.details[0].message).toBe('New password is required.');
    });

    it('should fail validation when newPassword is too short', () => {
      const data = {
        currentPassword: 'password123',
        newPassword: '123',
      };

      const { error } = changePasswordSchema.validate(data);
      expect(error).toBeDefined();
      expect(error.details[0].message).toBe('New password must be at least 6 characters long.');
    });
  });
});