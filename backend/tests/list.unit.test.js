const mongoose = require('mongoose');
const List = require('../features/lists/listModel');
const { createListSchema, updateListSchema, addMemberSchema } = require('../features/lists/listValidation');

describe('List Unit Tests', () => {
  describe('List Model', () => {
    it('creates a valid list', async () => {
      const listData = {
        ownerId: new mongoose.Types.ObjectId(),
        title: 'Test List',
        members: [new mongoose.Types.ObjectId()],
      };
      const validList = new List(listData);
      const savedList = await validList.save();

      expect(savedList._id).toBeDefined();
      expect(savedList.title).toBe(listData.title);
      expect(savedList.ownerId.toString()).toBe(listData.ownerId.toString());
      expect(savedList.members.length).toBe(1);
      expect(savedList.members[0].toString()).toBe(listData.members[0].toString());
    });

    it('does not save list without required fields', async () => {
      const listWithoutRequiredFields = new List({});
      let err;
      try {
        await listWithoutRequiredFields.save();
      } catch (error) {
        err = error;
      }
      expect(err).toBeInstanceOf(mongoose.Error.ValidationError);
      expect(err.errors.ownerId).toBeDefined();
      expect(err.errors.title).toBeDefined();
    });

    it('does not save list with excessively long title', async () => {
      const longTitle = 'a'.repeat(256);
      const listData = {
        ownerId: new mongoose.Types.ObjectId(),
        title: longTitle,
        members: [new mongoose.Types.ObjectId()],
      };
      let err;
      try {
        const invalidList = new List(listData);
        await invalidList.save();
      } catch (error) {
        err = error;
      }
      expect(err).toBeInstanceOf(mongoose.Error.ValidationError);
      expect(err.errors.title).toBeDefined();
    });
  });

  describe('List Validation', () => {
    describe('createListSchema', () => {
      it('validates correct input for creating a list', () => {
        const validData = { title: 'Valid List Title' };
        const { error } = createListSchema.validate(validData);
        expect(error).toBeUndefined();
      });

      it('catches empty list title', () => {
        const invalidData = { title: '' };
        const { error } = createListSchema.validate(invalidData);
        expect(error).toBeDefined();
        expect(error.details[0].message).toBe('List title must not be empty.');
      });

      it('catches missing list title', () => {
        const invalidData = {};
        const { error } = createListSchema.validate(invalidData);
        expect(error).toBeDefined();
        expect(error.details[0].message).toBe('List title is required.');
      });
    });

    describe('updateListSchema', () => {
      it('validates correct input for updating a list', () => {
        const validData = { title: 'Updated Title' };
        const { error } = updateListSchema.validate(validData);
        expect(error).toBeUndefined();
      });

      it('catches overly long list title', () => {
        const longTitle = 'a'.repeat(256);
        const invalidData = { title: longTitle };
        const { error } = updateListSchema.validate(invalidData);
        expect(error).toBeDefined();
        expect(error.details[0].message).toBe('List title must not exceed 255 characters.');
      });
    });

    describe('addMemberSchema', () => {
      it('validates correct input for adding a member', () => {
        const validData = { username: 'newmember' };
        const { error } = addMemberSchema.validate(validData);
        expect(error).toBeUndefined();
      });

      it('catches empty username', () => {
        const invalidData = { username: '' };
        const { error } = addMemberSchema.validate(invalidData);
        expect(error).toBeDefined();
        expect(error.details[0].message).toBe('Username must not be empty.');
      });

      it('catches missing username', () => {
        const invalidData = {};
        const { error } = addMemberSchema.validate(invalidData);
        expect(error).toBeDefined();
        expect(error.details[0].message).toBe('Username is required.');
      });
    });
  });
});