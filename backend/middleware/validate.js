const { AppError } = require('./errorHandler');
const logger = require('./logger');

/**
 * Validation middleware using Joi schemas.
 * @param {Joi.Schema} schema - Joi validation schema.
 * @param {string} property - Request property to validate (default: 'body').
 * @returns {Function} - Express middleware function.
 */
const validate = (schema, property = 'body') => {
  return (req, res, next) => {
    const { error } = schema.validate(req[property], { abortEarly: false });
    if (error) {
      const errorMessage = error.details.map((detail) => detail.message).join(', ');
      logger.warn(`Validation failed: ${errorMessage}`);
      return next(new AppError(errorMessage, 400));
    }
    next();
  };
};

module.exports = validate;