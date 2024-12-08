// tests/middleware/validate.test.js
const Joi = require('joi');
const validate = require('../../middleware/validate');
const { AppError } = require('../../middleware/errorHandler');
const logger = require('../../middleware/logger');

jest.mock('../../middleware/logger', () => ({
  warn: jest.fn(),
}));

describe('Middleware validate', () => {
  let req, res, next;
  const schema = Joi.object({
    name: Joi.string().required(),
    age: Joi.number().required(),
  });

  beforeEach(() => {
    req = {
      body: {},
    };
    res = {};
    next = jest.fn();
  });

  it('should call next() with valid data', () => {
    req.body = { name: 'John', age: 30 };
    const middleware = validate(schema);
    middleware(req, res, next);

    expect(next).toHaveBeenCalled();
  });

  it('should call next() with AppError when data is invalid', () => {
    req.body = { name: '', age: 'invalid' };
    const middleware = validate(schema);

    middleware(req, res, next);

    expect(logger.warn).toHaveBeenCalled();
    expect(next).toHaveBeenCalledWith(expect.any(AppError));
    const error = next.mock.calls[0][0];
    expect(error.statusCode).toBe(400);
    expect(error.message).toContain('"name" is not allowed to be empty');
  });
});