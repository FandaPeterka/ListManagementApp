const Joi = require('joi');

const signupSchema = Joi.object({
  email: Joi.string()
    .email()
    .required()
    .messages({
      'string.base': 'Email must be a valid email address.',
      'string.email': 'Email must be a valid email address.',
      'any.required': 'Email is required.',
    }),
  username: Joi.string()
    .min(3)
    .max(30)
    .required()
    .messages({
      'string.base': 'Username must be a string.',
      'string.min': 'Username must be at least 3 characters long.',
      'string.max': 'Username must be at most 30 characters long.',
      'any.required': 'Username is required.',
    }),
  password: Joi.string()
    .min(6)
    .required()
    .messages({
      'string.base': 'Password must be a string.',
      'string.min': 'Password must be at least 6 characters long.',
      'any.required': 'Password is required.',
    }),
});

const loginSchema = Joi.object({
  email: Joi.string()
    .email()
    .required()
    .messages({
      'string.base': 'Email must be a valid email address.',
      'string.email': 'Email must be a valid email address.',
      'any.required': 'Email is required.',
    }),
  password: Joi.string()
    .required()
    .messages({
      'string.base': 'Password must be a string.',
      'any.required': 'Password is required.',
    }),
});

const updateProfileSchema = Joi.object({
  bio: Joi.string().max(500).allow('').optional(),
  status: Joi.string().valid('focusing', 'idle', 'busy').optional(),
  newUsername: Joi.string()
    .min(3)
    .max(30)
    .optional()
    .messages({
      'string.base': 'New username must be a string.',
      'string.min': 'New username must be at least 3 characters long.',
      'string.max': 'New username must be at most 30 characters long.',
    }),
});

const changePasswordSchema = Joi.object({
  currentPassword: Joi.string()
    .required()
    .messages({
      'string.base': 'Current password must be a string.',
      'any.required': 'Current password is required.',
    }),
  newPassword: Joi.string()
    .min(6)
    .required()
    .messages({
      'string.base': 'New password must be a string.',
      'string.min': 'New password must be at least 6 characters long.',
      'any.required': 'New password is required.',
    }),
});

module.exports = {
  signupSchema,
  loginSchema,
  updateProfileSchema,
  changePasswordSchema,
};