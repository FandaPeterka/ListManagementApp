// tests/features/items/itemValidation.test.js
const { addItemSchema, markItemResolvedSchema } = require('../../features/items/itemValidation');
const { AppError } = require('../../middleware/errorHandler');

describe('Item Validation Schemas', () => {
  describe('addItemSchema', () => {
    it('should validate a correct add item request', () => {
      const data = { itemText: 'Valid Item' };
      const { error } = addItemSchema.validate(data);
      expect(error).toBeUndefined();
    });

    it('should invalidate when itemText is empty', () => {
      const data = { itemText: '' };
      const { error } = addItemSchema.validate(data);
      expect(error).toBeDefined();
      expect(error.details[0].message).toBe('Item text must not be empty.');
    });

    it('should invalidate when itemText exceeds max length', () => {
      const data = { itemText: 'a'.repeat(501) };
      const { error } = addItemSchema.validate(data);
      expect(error).toBeDefined();
      expect(error.details[0].message).toBe('Item text must not exceed 500 characters.');
    });

    it('should invalidate when itemText is missing', () => {
      const data = {};
      const { error } = addItemSchema.validate(data);
      expect(error).toBeDefined();
      expect(error.details[0].message).toBe('Item text is required.');
    });
  });

  describe('markItemResolvedSchema', () => {
    it('should validate a correct mark item resolved request', () => {
      const data = { isResolved: true };
      const { error } = markItemResolvedSchema.validate(data);
      expect(error).toBeUndefined();
    });

    it('should invalidate when isResolved is missing', () => {
      const data = {};
      const { error } = markItemResolvedSchema.validate(data);
      expect(error).toBeDefined();
      expect(error.details[0].message).toBe('The field isResolved is required.');
    });

    it('should invalidate when isResolved is not a boolean', () => {
      const data = { isResolved: 'yes' };
      const { error } = markItemResolvedSchema.validate(data);
      expect(error).toBeDefined();
      expect(error.details[0].message).toBe('The field isResolved must be a boolean.');
    });
  });
});