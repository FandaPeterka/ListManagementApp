const asyncHandler = require('express-async-handler');
const itemService = require('./itemService');
const logger = require('../../middleware/logger');

// Add an item to a list
const addItemToList = asyncHandler(async (req, res, next) => {
  const { listId } = req.params;
  const { itemText } = req.body;

  logger.info(`User ID ${req.user._id} is adding an item to list ID: ${listId}`);
  try {
    const item = await itemService.addItemToList(listId, itemText);
    res.status(201).json({ status: 'success', data: item });
  } catch (error) {
    next(error);
  }
});

// Get items from a list with optional status filter
const getItems = asyncHandler(async (req, res, next) => {
  const { listId } = req.params;
  const { status } = req.query;

  logger.info(`User ID ${req.user._id} is requesting items from list ID: ${listId} with status filter: ${status}`);
  try {
    const items = await itemService.getItems(listId, status);
    res.status(200).json({ status: 'success', data: items });
  } catch (error) {
    next(error);
  }
});

// Mark an item as resolved or unresolved
const markItemResolved = asyncHandler(async (req, res, next) => {
  const { listId, itemId } = req.params;
  const { isResolved } = req.body;

  logger.info(`User ID ${req.user._id} is marking item ID: ${itemId} in list ID: ${listId} as ${isResolved ? 'resolved' : 'unresolved'}`);
  try {
    const item = await itemService.markItemResolved(listId, itemId, isResolved);
    res.status(200).json({ status: 'success', data: item });
  } catch (error) {
    next(error);
  }
});

// Delete an item from a list
const deleteItemFromList = asyncHandler(async (req, res, next) => {
  const { listId, itemId } = req.params;

  logger.info(`User ID ${req.user._id} is requesting deletion of item ID: ${itemId} from list ID: ${listId}`);
  try {
    await itemService.deleteItemFromList(listId, itemId);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});


module.exports = {
  addItemToList,
  getItems,
  markItemResolved,
  deleteItemFromList,
};