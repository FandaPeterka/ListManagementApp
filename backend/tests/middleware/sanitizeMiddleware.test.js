// tests/middleware/sanitizeMiddleware.test.js
const sanitizeMiddleware = require('../../middleware/sanitizeMiddleware');

describe('Middleware sanitizeMiddleware', () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      body: {},
    };
    res = {};
    next = jest.fn();
  });

  it('should sanitize inputs in req.body', () => {
    req.body = {
      name: '<script>alert("XSS")</script>',
      age: '25',
    };

    sanitizeMiddleware(req, res, next);

    expect(req.body.name).toBe('&lt;script&gt;alert("XSS")&lt;/script&gt;');
    expect(req.body.age).toBe('25');
    expect(next).toHaveBeenCalled();
  });

  it('should call next() even if req.body is null', () => {
    req.body = null;

    sanitizeMiddleware(req, res, next);

    expect(next).toHaveBeenCalled();
  });
});