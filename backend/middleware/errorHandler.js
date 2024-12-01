const logger = require('./logger');

/**
 * Custom application error class.
 */
class AppError extends Error {
  /**
   * Creates an instance of AppError.
   * @param {string} message - Error message.
   * @param {number} statusCode - HTTP status code.
   */
  constructor(message, statusCode) {
    super(message);

    this.statusCode = statusCode || 500;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Global error handling middleware.
 * @param {Error} err - Error object.
 * @param {Object} req - HTTP request.
 * @param {Object} res - HTTP response.
 * @param {Function} next - Next middleware.
 */
const errorHandler = (err, req, res, next) => {
  logger.error(
    `${err.statusCode || 500} - ${err.message} - ${req.method} - ${req.originalUrl} - ${req.ip}`,
    { stack: err.stack }
  );

  if (!err.isOperational) {
    res.status(500).json({
      status: 'error',
      message: 'An unexpected error occurred on the server.',
    });
  } else {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  }
};

module.exports = {
  AppError,
  errorHandler,
};