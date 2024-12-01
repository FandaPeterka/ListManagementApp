const mongoose = require('mongoose');
const Item = require('../features/items/itemModel');
const itemService = require('../features/items/itemService');
const itemController = require('../features/items/itemController');
const { addItemSchema, markItemResolvedSchema } = require('../features/items/itemValidation');
const { AppError } = require('../middleware/errorHandler');
const httpMocks = require('node-mocks-http');
const logger = require('../middleware/logger');

describe('Item Unit Tests', () => {
  beforeAll(() => {
    mongoose.set('strictQuery', true); // Ensure MongoDB behaves consistently
  });

  afterEach(() => {
    jest.clearAllMocks(); // Clear mocks between tests
  });

  describe('Item Model', () => {
    it('creates a valid item', async () => {
      const itemData = {
        itemText: 'Test Item',
        listId: new mongoose.Types.ObjectId(),
      };

      const validItem = new Item(itemData);
      const savedItem = await validItem.save();

      expect(savedItem._id).toBeDefined();
      expect(savedItem.itemText).toBe(itemData.itemText);
      expect(savedItem.isResolved).toBe(false);
      expect(savedItem.listId.toString()).toBe(itemData.listId.toString());
    });

    it('does not save item without required fields', async () => {
      const itemWithoutRequiredFields = new Item({});
      let err;

      try {
        await itemWithoutRequiredFields.save();
      } catch (error) {
        err = error;
      }

      expect(err).toBeInstanceOf(mongoose.Error.ValidationError);
      expect(err.errors.itemText).toBeDefined();
      expect(err.errors.listId).toBeDefined();
    });

    it('does not save item with text exceeding max length', async () => {
      const longText = 'a'.repeat(501);
      const itemData = {
        itemText: longText,
        listId: new mongoose.Types.ObjectId(),
      };
      let err;

      try {
        const invalidItem = new Item(itemData);
        await invalidItem.save();
      } catch (error) {
        err = error;
      }

      expect(err).toBeInstanceOf(mongoose.Error.ValidationError);
      expect(err.errors.itemText).toBeDefined();
    });
  });

  describe('Item Validation', () => {
    describe('addItemSchema', () => {
      it('validates correct input for adding an item', () => {
        const validData = { itemText: 'Valid item text' };
        const { error } = addItemSchema.validate(validData);
        expect(error).toBeUndefined();
      });

      it('catches empty item text', () => {
        const invalidData = { itemText: '' };
        const { error } = addItemSchema.validate(invalidData);
        expect(error).toBeDefined();
        expect(error.details[0].message).toBe('Item text must not be empty.');
      });

      it('catches missing item text', () => {
        const invalidData = {};
        const { error } = addItemSchema.validate(invalidData);
        expect(error).toBeDefined();
        expect(error.details[0].message).toBe('Item text is required.');
      });
    });

    describe('markItemResolvedSchema', () => {
      it('validates correct input for marking an item', () => {
        const validData = { isResolved: true };
        const { error } = markItemResolvedSchema.validate(validData);
        expect(error).toBeUndefined();
      });

      it('catches invalid type for isResolved', () => {
        const invalidData = { isResolved: 'yes' };
        const { error } = markItemResolvedSchema.validate(invalidData);
        expect(error).toBeDefined();
        expect(error.details[0].message).toBe('The field isResolved must be a boolean.');
      });

      it('catches missing isResolved field', () => {
        const invalidData = {};
        const { error } = markItemResolvedSchema.validate(invalidData);
        expect(error).toBeDefined();
        expect(error.details[0].message).toBe('The field isResolved is required.');
      });
    });
  });

  describe('Item Service', () => {
    let listId, itemId;

    beforeEach(() => {
      listId = new mongoose.Types.ObjectId();
      itemId = new mongoose.Types.ObjectId();
    });

    describe('addItemToList', () => {
      it('should add an item to a list', async () => {
        jest.spyOn(Item.prototype, 'save').mockResolvedValue({
          _id: itemId,
          itemText: 'Test Item',
          listId,
        });

        const item = await itemService.addItemToList(listId, 'Test Item');
        expect(item._id).toBe(itemId);
        expect(item.itemText).toBe('Test Item');
        expect(item.listId).toBe(listId);
      });

      it('should throw an error if the list is not found', async () => {
        jest.spyOn(Item.prototype, 'save').mockRejectedValue(new AppError('List not found.', 404));

        await expect(itemService.addItemToList(listId, 'Test Item')).rejects.toThrow(AppError);
      });
    });

    describe('markItemResolved', () => {
      it('should mark an item as resolved', async () => {
        jest.spyOn(Item, 'findOne').mockResolvedValue({
          _id: itemId,
          isResolved: false,
          save: jest.fn().mockResolvedValue({ isResolved: true }),
        });

        const result = await itemService.markItemResolved(listId, itemId, true);
        expect(result.isResolved).toBe(true);
      });

      it('should throw an error if the item is not found', async () => {
        jest.spyOn(Item, 'findOne').mockResolvedValue(null);

        await expect(itemService.markItemResolved(listId, itemId, true)).rejects.toThrow(AppError);
      });
    });
  });

  describe('Item Controller', () => {
    let req, res, next;

    beforeEach(() => {
      req = httpMocks.createRequest();
      res = httpMocks.createResponse();
      next = jest.fn();
    });

    describe('addItemToList', () => {
      it('should add an item to a list', async () => {
        req.params.listId = new mongoose.Types.ObjectId().toString();
        req.body.itemText = 'Test Item';

        jest.spyOn(itemService, 'addItemToList').mockResolvedValue({
          _id: new mongoose.Types.ObjectId(),
          itemText: 'Test Item',
        });

        await itemController.addItemToList(req, res, next);
        expect(res.statusCode).toBe(201);
        expect(res._getJSONData().status).toBe('success');
        expect(res._getJSONData().data.itemText).toBe('Test Item');
      });
    });

    describe('markItemResolved', () => {
      it('should mark an item as resolved', async () => {
        req.params.listId = new mongoose.Types.ObjectId().toString();
        req.params.itemId = new mongoose.Types.ObjectId().toString();
        req.body.isResolved = true;

        jest.spyOn(itemService, 'markItemResolved').mockResolvedValue({
          _id: req.params.itemId,
          isResolved: true,
        });

        await itemController.markItemResolved(req, res, next);
        expect(res.statusCode).toBe(200);
        expect(res._getJSONData().status).toBe('success');
        expect(res._getJSONData().data.isResolved).toBe(true);
      });
    });
  });
});