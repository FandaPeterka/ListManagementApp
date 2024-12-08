// tests/middleware/validateObjectId.test.js
const mongoose = require('mongoose');
const validateObjectId = require('../../middleware/validateObjectId');
const logger = require('../../middleware/logger');

jest.mock('../../middleware/logger', () => ({
  info: jest.fn(),
  warn: jest.fn(),
}));

describe('Middleware validateObjectId', () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      params: {},
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    next = jest.fn();
  });

  it('should call next() with valid ObjectId', () => {
    const paramName = 'id';
    const validId = new mongoose.Types.ObjectId().toString();
    req.params[paramName] = validId;

    const middleware = validateObjectId(paramName);
    middleware(req, res, next);

    expect(logger.info).toHaveBeenCalledWith(`Validating ObjectId for ${paramName}: ${validId}`);
    expect(next).toHaveBeenCalled();
  });

  it('should return error with invalid ObjectId', () => {
    const paramName = 'id';
    const invalidId = 'invalid-id';
    req.params[paramName] = invalidId;

    const middleware = validateObjectId(paramName);
    middleware(req, res, next);

    expect(logger.info).toHaveBeenCalledWith(`Validating ObjectId for ${paramName}: ${invalidId}`);
    expect(logger.warn).toHaveBeenCalledWith(`Invalid ID for ${paramName}: ${invalidId}`);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      status: 'fail',
      message: `Invalid ID for ${paramName}: ${invalidId}`,
    });
    expect(next).not.toHaveBeenCalled();
  });
});