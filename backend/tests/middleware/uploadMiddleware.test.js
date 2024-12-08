// tests/middleware/uploadMiddleware.test.js
const multer = require('multer');
const upload = require('../../middleware/uploadMiddleware');
const path = require('path');
const fs = require('fs');
const { AppError } = require('../../middleware/errorHandler');

jest.mock('fs');
jest.mock('../../middleware/logger', () => ({
  info: jest.fn(),
}));

describe('Middleware uploadMiddleware', () => {
  it('should have correct storage settings', () => {
    const storage = upload.storage;
    expect(storage).toBeDefined();
    expect(storage.getFilename).toBeDefined();
    expect(storage.getDestination).toBeDefined();
  });

  it('should have correct fileFilter', () => {
    const fileFilter = upload.fileFilter;
    const req = {};
    const cb = jest.fn();

    const file = { mimetype: 'image/jpeg' };
    fileFilter(req, file, cb);
    expect(cb).toHaveBeenCalledWith(null, true);

    const invalidFile = { mimetype: 'application/pdf' };
    fileFilter(req, invalidFile, cb);
    expect(cb).toHaveBeenCalledWith(expect.any(AppError), false);
  });
});