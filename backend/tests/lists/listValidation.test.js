// tests/features/lists/listValidation.test.js
const { createListSchema, updateListSchema, addMemberSchema, getListsSchema, getActiveListsItemCountsSchema } = require('../../features/lists/listValidation');

describe('List Validation Schemas', () => {
  describe('createListSchema', () => {
    it('should validate a correct create list request', () => {
      const data = { title: 'Valid List' };
      const { error } = createListSchema.validate(data);
      expect(error).toBeUndefined();
    });

    it('should invalidate when title is empty', () => {
      const data = { title: '' };
      const { error } = createListSchema.validate(data);
      expect(error).toBeDefined();
      expect(error.details[0].message).toBe('List title must not be empty.');
    });

    it('should invalidate when title exceeds max length', () => {
      const data = { title: 'a'.repeat(256) };
      const { error } = createListSchema.validate(data);
      expect(error).toBeDefined();
      expect(error.details[0].message).toBe('List title must not exceed 255 characters.');
    });

    it('should invalidate when title is missing', () => {
      const data = {};
      const { error } = createListSchema.validate(data);
      expect(error).toBeDefined();
      expect(error.details[0].message).toBe('List title is required.');
    });
  });

  describe('updateListSchema', () => {
    it('should validate a correct update list request', () => {
      const data = { title: 'Updated List' };
      const { error } = updateListSchema.validate(data);
      expect(error).toBeUndefined();
    });

    it('should invalidate when title is empty', () => {
      const data = { title: '' };
      const { error } = updateListSchema.validate(data);
      expect(error).toBeDefined();
      expect(error.details[0].message).toBe('List title must not be empty.');
    });

    it('should invalidate when title exceeds max length', () => {
      const data = { title: 'a'.repeat(256) };
      const { error } = updateListSchema.validate(data);
      expect(error).toBeDefined();
      expect(error.details[0].message).toBe('List title must not exceed 255 characters.');
    });
  });

  describe('addMemberSchema', () => {
    it('should validate a correct add member request', () => {
      const data = { username: 'newmember' };
      const { error } = addMemberSchema.validate(data);
      expect(error).toBeUndefined();
    });

    it('should invalidate when username is empty', () => {
      const data = { username: '' };
      const { error } = addMemberSchema.validate(data);
      expect(error).toBeDefined();
      expect(error.details[0].message).toBe('Username must not be empty.');
    });

    it('should invalidate when username is missing', () => {
      const data = {};
      const { error } = addMemberSchema.validate(data);
      expect(error).toBeDefined();
      expect(error.details[0].message).toBe('Username is required.');
    });
  });

  describe('getListsSchema', () => {
    it('should validate a correct get lists request', () => {
      const data = { type: 'active', page: 2, limit: 20 };
      const { error } = getListsSchema.validate(data);
      expect(error).toBeUndefined();
    });

    it('should invalidate when type is invalid', () => {
      const data = { type: 'invalidtype' };
      const { error } = getListsSchema.validate(data);
      expect(error).toBeDefined();
      expect(error.details[0].message).toBe('"type" must be one of [all, active, archived, deleted]');
    });

    it('should invalidate when page is less than 1', () => {
      const data = { page: 0 };
      const { error } = getListsSchema.validate(data);
      expect(error).toBeDefined();
      expect(error.details[0].message).toBe('"page" must be greater than or equal to 1');
    });

    it('should invalidate when limit is greater than 100', () => {
      const data = { limit: 101 };
      const { error } = getListsSchema.validate(data);
      expect(error).toBeDefined();
      expect(error.details[0].message).toBe('"limit" must be less than or equal to 100');
    });
  });

  describe('getActiveListsItemCountsSchema', () => {
    it('should validate a correct get active lists item counts request', () => {
      const data = { listIds: ['507f1f77bcf86cd799439011', '507f1f77bcf86cd799439012'] };
      const { error } = getActiveListsItemCountsSchema.validate(data);
      expect(error).toBeUndefined();
    });

    it('should invalidate when listIds is not an array', () => {
      const data = { listIds: '507f1f77bcf86cd799439011' };
      const { error } = getActiveListsItemCountsSchema.validate(data);
      expect(error).toBeDefined();
      expect(error.details[0].message).toBe('listIds must be an array.');
    });

    it('should invalidate when listIds array is empty', () => {
      const data = { listIds: [] };
      const { error } = getActiveListsItemCountsSchema.validate(data);
      expect(error).toBeDefined();
      expect(error.details[0].message).toBe('The listIds array must contain at least one ID.');
    });

    it('should invalidate when any listId is not a valid ObjectId', () => {
      const data = { listIds: ['invalidid123', '507f1f77bcf86cd799439012'] };
      const { error } = getActiveListsItemCountsSchema.validate(data);
      expect(error).toBeDefined();
      expect(error.details[0].message).toBe('All IDs in listIds must be valid ObjectId.');
    });
  });
});