// features/items/itemController.js
const asyncHandler = require('express-async-handler');
const itemService = require('./itemService');
const logger = require('../../middleware/logger');

/**
 * Add an item to a list
 */
const addItemToList = asyncHandler(async (req, res, next) => {
  const { listId } = req.params;
  const { itemText } = req.body;

  logger.info(`User ID ${req.user._id} is adding an item to list ID: ${listId}`);
  try {
    const item = await itemService.addItemToList(listId, itemText);
    logger.info(`Item ID ${item._id} has been successfully added to list ID: ${listId}`);
    res.status(201).json({ status: 'success', data: item });
  } catch (error) {
    if (error.statusCode === 404) {
      logger.warn(`List with ID: ${listId} not found.`);
    } else {
      logger.error(`Error adding item to list: ${error.message}`);
    }
    next(error);
  }
});

/**
 * Get items from a list with optional status filter
 */
const getItems = asyncHandler(async (req, res, next) => {
  const { listId } = req.params;
  const { status } = req.query;

  logger.info(`User ID ${req.user._id} is requesting items from list ID: ${listId} with status filter: ${status}`);
  try {
    const items = await itemService.getItems(listId, status);
    logger.info(`Successfully retrieved ${items.length} items from list ID: ${listId}`);
    res.status(200).json({ status: 'success', data: items });
  } catch (error) {
    if (error.statusCode === 400) {
      logger.warn(`Invalid status filter: ${status}`);
    } else if (error.statusCode === 500) {
      logger.error(`Error retrieving items from list ID: ${listId}`);
    }
    next(error);
  }
});

/**
 * Mark an item as resolved or unresolved
 */
const markItemResolved = asyncHandler(async (req, res, next) => {
  const { listId, itemId } = req.params;
  const { isResolved } = req.body;

  logger.info(`User ID ${req.user._id} is marking item ID: ${itemId} in list ID: ${listId} as ${isResolved ? 'resolved' : 'unresolved'}`);
  try {
    const item = await itemService.markItemResolved(listId, itemId, isResolved);
    logger.info(`Item ID: ${itemId} in list ID: ${listId} has been marked as ${isResolved ? 'resolved' : 'unresolved'}`);
    res.status(200).json({ status: 'success', data: item });
  } catch (error) {
    if (error.statusCode === 404) {
      logger.warn(`Item with ID: ${itemId} not found in list ID: ${listId}.`);
    } else {
      logger.error(`Error marking item as resolved: ${error.message}`);
    }
    next(error);
  }
});

/**
 * Delete an item from a list
 */
const deleteItemFromList = asyncHandler(async (req, res, next) => {
  const { listId, itemId } = req.params;

  logger.info(`User ID ${req.user._id} is requesting deletion of item ID: ${itemId} from list ID: ${listId}`);
  try {
    await itemService.deleteItemFromList(listId, itemId);
    logger.info(`Item ID: ${itemId} has been successfully deleted from list ID: ${listId}`);
    res.status(204).send();
  } catch (error) {
    if (error.statusCode === 404) {
      logger.warn(`Item with ID: ${itemId} or list ID: ${listId} not found.`);
    } else {
      logger.error(`Error deleting item from list: ${error.message}`);
    }
    next(error);
  }
});

module.exports = {
  addItemToList,
  getItems,
  markItemResolved,
  deleteItemFromList,
};