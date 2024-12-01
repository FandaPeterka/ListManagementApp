const mongoose = require('mongoose');
const { AppError } = require('./errorHandler');
const logger = require('./logger');

/**
 * Middleware to validate MongoDB ObjectId parameters.
 * @param {string} param - Request parameter to validate.
 * @returns {Function} - Express middleware function.
 */
const validateObjectId = (param) => {
  return (req, res, next) => {
    const id = req.params[param];
    logger.info(`Validating ObjectId for ${param}: ${id}`);
    if (!mongoose.Types.ObjectId.isValid(id)) {
      logger.warn(`Invalid ID for ${param}: ${id}`);
      return res.status(400).json({
        status: 'fail',
        message: `Invalid ID for ${param}: ${id}`,
      });
    }
    next();
  };
};

module.exports = validateObjectId;