// tests/features/items/itemController.test.js
const itemController = require('../../features/items/itemController');
const itemService = require('../../features/items/itemService');
const { AppError } = require('../../middleware/errorHandler');
const logger = require('../../middleware/logger');

// Mockování itemService metod a logger metod
jest.mock('../../features/items/itemService');
jest.mock('../../middleware/logger', () => ({
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
}));

describe('Item Controller', () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      params: {},
      body: {},
      user: { _id: 'user-id' },
      query: {},
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      send: jest.fn(),
    };
    next = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('addItemToList', () => {
    it('should add an item to a list and respond with 201 status', async () => {
      const listId = 'list-id';
      const itemText = 'New Item';
      const createdItem = { _id: 'item-id', itemText, listId };

      req.params.listId = listId;
      req.body.itemText = itemText;
      itemService.addItemToList.mockResolvedValue(createdItem);

      await itemController.addItemToList(req, res, next);

      expect(itemService.addItemToList).toHaveBeenCalledWith(listId, itemText);
      expect(logger.info).toHaveBeenCalledWith(`User ID ${req.user._id} is adding an item to list ID: ${listId}`);
      expect(logger.info).toHaveBeenCalledWith(`Item ID ${createdItem._id} has been successfully added to list ID: ${listId}`);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({ status: 'success', data: createdItem });
    });

    it('should handle errors and pass to next when list not found', async () => {
      const listId = 'nonexistentlistid123456789012';
      const itemText = 'New Item';
      const errorMessage = 'List not found.';
      const error = new AppError(errorMessage, 404);

      req.params.listId = listId;
      req.body.itemText = itemText;
      itemService.addItemToList.mockRejectedValue(error);

      await itemController.addItemToList(req, res, next);

      expect(itemService.addItemToList).toHaveBeenCalledWith(listId, itemText);
      expect(logger.info).toHaveBeenCalledWith(`User ID ${req.user._id} is adding an item to list ID: ${listId}`);
      expect(logger.warn).toHaveBeenCalledWith(`List with ID: ${listId} not found.`);
      expect(logger.error).not.toHaveBeenCalledWith(expect.stringContaining('Error adding item to list'));
      expect(next).toHaveBeenCalledWith(error);
    });

    it('should handle errors and pass to next on other errors', async () => {
      const listId = 'list-id';
      const itemText = 'New Item';
      const errorMessage = 'Database error.';
      const error = new AppError(errorMessage, 500);

      req.params.listId = listId;
      req.body.itemText = itemText;
      itemService.addItemToList.mockRejectedValue(error);

      await itemController.addItemToList(req, res, next);

      expect(itemService.addItemToList).toHaveBeenCalledWith(listId, itemText);
      expect(logger.info).toHaveBeenCalledWith(`User ID ${req.user._id} is adding an item to list ID: ${listId}`);
      expect(logger.warn).not.toHaveBeenCalledWith(expect.stringContaining('List with ID:'));
      expect(logger.error).toHaveBeenCalledWith(`Error adding item to list: ${errorMessage}`);
      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('getItems', () => {
    it('should retrieve items and respond with 200 status', async () => {
      const listId = 'list-id';
      const status = 'resolved';
      const items = [
        { _id: 'item1', itemText: 'Item 1', isResolved: true },
        { _id: 'item2', itemText: 'Item 2', isResolved: true },
      ];

      req.params.listId = listId;
      req.query.status = status;
      itemService.getItems.mockResolvedValue(items);

      await itemController.getItems(req, res, next);

      expect(itemService.getItems).toHaveBeenCalledWith(listId, status);
      expect(logger.info).toHaveBeenCalledWith(`User ID ${req.user._id} is requesting items from list ID: ${listId} with status filter: ${status}`);
      expect(logger.info).toHaveBeenCalledWith(`Successfully retrieved ${items.length} items from list ID: ${listId}`);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ status: 'success', data: items });
    });

    it('should handle errors and pass to next when invalid status filter', async () => {
      const listId = 'list-id';
      const status = 'unknown';
      const errorMessage = 'Invalid status filter.';
      const error = new AppError(errorMessage, 400);

      req.params.listId = listId;
      req.query.status = status;
      itemService.getItems.mockRejectedValue(error);

      await itemController.getItems(req, res, next);

      expect(itemService.getItems).toHaveBeenCalledWith(listId, status);
      expect(logger.info).toHaveBeenCalledWith(`User ID ${req.user._id} is requesting items from list ID: ${listId} with status filter: ${status}`);
      expect(logger.warn).toHaveBeenCalledWith(`Invalid status filter: ${status}`);
      expect(logger.error).not.toHaveBeenCalledWith(expect.stringContaining('Error retrieving items from list ID:'));
      expect(next).toHaveBeenCalledWith(error);
    });

    it('should handle errors and pass to next on server errors', async () => {
      const listId = 'list-id';
      const status = 'resolved';
      const errorMessage = 'Failed to retrieve items.';
      const error = new AppError(errorMessage, 500);

      req.params.listId = listId;
      req.query.status = status;
      itemService.getItems.mockRejectedValue(error);

      await itemController.getItems(req, res, next);

      expect(itemService.getItems).toHaveBeenCalledWith(listId, status);
      expect(logger.info).toHaveBeenCalledWith(`User ID ${req.user._id} is requesting items from list ID: ${listId} with status filter: ${status}`);
      expect(logger.warn).not.toHaveBeenCalledWith(expect.stringContaining('Invalid status filter:'));
      expect(logger.error).toHaveBeenCalledWith(`Error retrieving items from list ID: ${listId}`);
      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('markItemResolved', () => {
    it('should mark an item as resolved and respond with 200 status', async () => {
      const listId = 'list-id';
      const itemId = 'item-id';
      const isResolved = true;
      const updatedItem = { _id: itemId, itemText: 'Item 1', isResolved };

      req.params.listId = listId;
      req.params.itemId = itemId;
      req.body.isResolved = isResolved;
      itemService.markItemResolved.mockResolvedValue(updatedItem);

      await itemController.markItemResolved(req, res, next);

      expect(itemService.markItemResolved).toHaveBeenCalledWith(listId, itemId, isResolved);
      expect(logger.info).toHaveBeenCalledWith(`User ID ${req.user._id} is marking item ID: ${itemId} in list ID: ${listId} as resolved`);
      expect(logger.info).toHaveBeenCalledWith(`Item ID: ${itemId} in list ID: ${listId} has been marked as resolved`);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ status: 'success', data: updatedItem });
    });

    it('should mark an item as unresolved and respond with 200 status', async () => {
      const listId = 'list-id';
      const itemId = 'item-id';
      const isResolved = false;
      const updatedItem = { _id: itemId, itemText: 'Item 1', isResolved };

      req.params.listId = listId;
      req.params.itemId = itemId;
      req.body.isResolved = isResolved;
      itemService.markItemResolved.mockResolvedValue(updatedItem);

      await itemController.markItemResolved(req, res, next);

      expect(itemService.markItemResolved).toHaveBeenCalledWith(listId, itemId, isResolved);
      expect(logger.info).toHaveBeenCalledWith(`User ID ${req.user._id} is marking item ID: ${itemId} in list ID: ${listId} as unresolved`);
      expect(logger.info).toHaveBeenCalledWith(`Item ID: ${itemId} in list ID: ${listId} has been marked as unresolved`);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ status: 'success', data: updatedItem });
    });

    it('should handle errors and pass to next when item not found', async () => {
      const listId = 'list-id';
      const itemId = 'nonexistentitemid123456789012';
      const isResolved = true;
      const errorMessage = 'Item not found.';
      const error = new AppError(errorMessage, 404);

      req.params.listId = listId;
      req.params.itemId = itemId;
      req.body.isResolved = isResolved;
      itemService.markItemResolved.mockRejectedValue(error);

      await itemController.markItemResolved(req, res, next);

      expect(itemService.markItemResolved).toHaveBeenCalledWith(listId, itemId, isResolved);
      expect(logger.info).toHaveBeenCalledWith(`User ID ${req.user._id} is marking item ID: ${itemId} in list ID: ${listId} as resolved`);
      expect(logger.warn).toHaveBeenCalledWith(`Item with ID: ${itemId} not found in list ID: ${listId}.`);
      expect(logger.error).not.toHaveBeenCalledWith(expect.stringContaining('Error marking item as resolved'));
      expect(next).toHaveBeenCalledWith(error);
    });

    it('should handle errors and pass to next on other errors', async () => {
      const listId = 'list-id';
      const itemId = 'item-id';
      const isResolved = true;
      const errorMessage = 'Database error.';
      const error = new AppError(errorMessage, 500);

      req.params.listId = listId;
      req.params.itemId = itemId;
      req.body.isResolved = isResolved;
      itemService.markItemResolved.mockRejectedValue(error);

      await itemController.markItemResolved(req, res, next);

      expect(itemService.markItemResolved).toHaveBeenCalledWith(listId, itemId, isResolved);
      expect(logger.info).toHaveBeenCalledWith(`User ID ${req.user._id} is marking item ID: ${itemId} in list ID: ${listId} as resolved`);
      expect(logger.warn).not.toHaveBeenCalledWith(expect.stringContaining('Item with ID:'));
      expect(logger.error).toHaveBeenCalledWith(`Error marking item as resolved: ${errorMessage}`);
      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('deleteItemFromList', () => {
    it('should delete an item from a list and respond with 204 status', async () => {
      const listId = 'list-id';
      const itemId = 'item-id';

      req.params.listId = listId;
      req.params.itemId = itemId;
      itemService.deleteItemFromList.mockResolvedValue();

      await itemController.deleteItemFromList(req, res, next);

      expect(itemService.deleteItemFromList).toHaveBeenCalledWith(listId, itemId);
      expect(logger.info).toHaveBeenCalledWith(`User ID ${req.user._id} is requesting deletion of item ID: ${itemId} from list ID: ${listId}`);
      expect(logger.info).toHaveBeenCalledWith(`Item ID: ${itemId} has been successfully deleted from list ID: ${listId}`);
      expect(res.status).toHaveBeenCalledWith(204);
      expect(res.send).toHaveBeenCalled();
    });

    it('should handle errors and pass to next when item or list not found', async () => {
      const listId = 'list-id';
      const itemId = 'nonexistentitemid123456789012';
      const errorMessage = 'Item not found.';
      const error = new AppError(errorMessage, 404);

      req.params.listId = listId;
      req.params.itemId = itemId;
      itemService.deleteItemFromList.mockRejectedValue(error);

      await itemController.deleteItemFromList(req, res, next);

      expect(itemService.deleteItemFromList).toHaveBeenCalledWith(listId, itemId);
      expect(logger.info).toHaveBeenCalledWith(`User ID ${req.user._id} is requesting deletion of item ID: ${itemId} from list ID: ${listId}`);
      expect(logger.warn).toHaveBeenCalledWith(`Item with ID: ${itemId} or list ID: ${listId} not found.`);
      expect(logger.error).not.toHaveBeenCalledWith(expect.stringContaining('Error deleting item from list'));
      expect(next).toHaveBeenCalledWith(error);
    });

    it('should handle errors and pass to next on other errors', async () => {
      const listId = 'list-id';
      const itemId = 'item-id';
      const errorMessage = 'Database error.';
      const error = new AppError(errorMessage, 500);

      req.params.listId = listId;
      req.params.itemId = itemId;
      itemService.deleteItemFromList.mockRejectedValue(error);

      await itemController.deleteItemFromList(req, res, next);

      expect(itemService.deleteItemFromList).toHaveBeenCalledWith(listId, itemId);
      expect(logger.info).toHaveBeenCalledWith(`User ID ${req.user._id} is requesting deletion of item ID: ${itemId} from list ID: ${listId}`);
      expect(logger.warn).not.toHaveBeenCalledWith(expect.stringContaining('Item with ID:'));
      expect(logger.error).toHaveBeenCalledWith(`Error deleting item from list: ${errorMessage}`);
      expect(next).toHaveBeenCalledWith(error);
    });
  });
});