const Item = require('./itemModel');
const { AppError } = require('../../middleware/errorHandler');
const List = require('../lists/listModel');
const mongoose = require('mongoose');
const logger = require('../../middleware/logger');

/**
 * Adds an item to a list.
 * @param {String} listId - List ID.
 * @param {String} itemText - Text of the item.
 * @returns {Promise<Object>} - Created item.
 */
const addItemToList = async (listId, itemText) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  logger.info(`Adding item to list ID: ${listId}`);

  try {
    const list = await List.findById(listId).session(session);
    if (!list) {
      logger.warn(`List with ID: ${listId} not found.`);
      throw new AppError('List not found.', 404);
    }

    const item = new Item({ itemText, listId });
    await item.save({ session });
    logger.info(`Item created with ID: ${item._id} for list ID: ${listId}`);

    list.items.push(item._id);
    await list.save({ session });

    await session.commitTransaction();
    return item;
  } catch (error) {
    await session.abortTransaction();
    logger.error(`Error adding item to list: ${error.message}`);
    throw error;
  } finally {
    session.endSession();
  }
};

/**
 * Retrieves items from a list with an optional status filter.
 * @param {String} listId - List ID.
 * @param {String} status - Status filter ('resolved', 'unresolved').
 * @returns {Promise<Array>} - Array of items.
 */
const getItems = async (listId, status) => {
  logger.info(`Fetching items for list ID: ${listId} with status filter: ${status}`);
  const query = { listId };
  if (status === 'resolved') {
    query.isResolved = true;
  } else if (status === 'unresolved') {
    query.isResolved = false;
  } else if (status) {
    logger.warn(`Unknown status: ${status}`);
    throw new AppError('Invalid status filter.', 400);
  }

  const items = await Item.find(query).sort({ isResolved: 1, createdAt: -1 });
  logger.info(`Found ${items.length} items for list ID: ${listId}.`);
  return items;
};

/**
 * Marks an item as resolved or unresolved.
 * @param {String} listId - List ID.
 * @param {String} itemId - Item ID.
 * @param {Boolean} isResolved - Resolution status.
 * @returns {Promise<Object>} - Updated item.
 */
const markItemResolved = async (listId, itemId, isResolved) => {
  logger.info(`Marking item ID: ${itemId} in list ID: ${listId} as ${isResolved ? 'resolved' : 'unresolved'}`);

  const item = await Item.findOne({ _id: itemId, listId });
  if (!item) {
    logger.warn(`Item with ID: ${itemId} not found in list ID: ${listId}.`);
    throw new AppError('Item not found.', 404);
  }

  item.isResolved = isResolved;
  await item.save();
  return item;
};

/**
 * Deletes an item from a list.
 * @param {String} listId - List ID.
 * @param {String} itemId - Item ID.
 * @returns {Promise<void>}
 */
const deleteItemFromList = async (listId, itemId) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  logger.info(`Deleting item ID: ${itemId} from list ID: ${listId}`);

  try {
    const item = await Item.findOneAndDelete({ _id: itemId, listId }).session(session);
    if (!item) {
      logger.warn(`Item with ID: ${itemId} not found in list ID: ${listId}.`);
      throw new AppError('Item not found.', 404);
    }

    const list = await List.findById(listId).session(session);
    if (!list) {
      logger.warn(`List with ID: ${listId} not found during item deletion.`);
      throw new AppError('List not found.', 404);
    }

    list.items.pull(itemId);
    await list.save({ session });

    await session.commitTransaction();
  } catch (error) {
    await session.abortTransaction();
    logger.error(`Error deleting item from list: ${error.message}`);
    throw error;
  } finally {
    session.endSession();
  }
};


module.exports = {
  addItemToList,
  getItems,
  markItemResolved,
  deleteItemFromList,
};