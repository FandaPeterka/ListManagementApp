// tests/middleware/errorHandler.test.js
const { AppError, errorHandler } = require('../../middleware/errorHandler');
const logger = require('../../middleware/logger');

jest.mock('../../middleware/logger', () => ({
  error: jest.fn(),
}));

describe('Middleware errorHandler', () => {
  let err, req, res, next;

  beforeEach(() => {
    req = {
      method: 'GET',
      originalUrl: '/test',
      ip: '127.0.0.1',
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    next = jest.fn();
  });

  it('should handle AppError correctly', () => {
    err = new AppError('Test error', 400);

    errorHandler(err, req, res, next);

    expect(logger.error).toHaveBeenCalledWith(
      '400 - Test error - GET - /test - 127.0.0.1',
      { stack: err.stack }
    );
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      status: 'fail',
      message: 'Test error',
    });
  });

  it('should handle unexpected errors', () => {
    err = new Error('Unexpected error');

    errorHandler(err, req, res, next);

    expect(logger.error).toHaveBeenCalledWith(
      '500 - Unexpected error - GET - /test - 127.0.0.1',
      { stack: err.stack }
    );
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      status: 'error',
      message: 'An unexpected error occurred on the server.',
    });
  });
});