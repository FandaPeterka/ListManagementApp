// features/items/itemService.js
const Item = require('./itemModel');
const { AppError } = require('../../middleware/errorHandler');
const List = require('../lists/listModel');
const mongoose = require('mongoose');

/**
 * Adds an item to a list.
 * @param {String} listId - List ID.
 * @param {String} itemText - Text of the item.
 * @returns {Promise<Object>} - Created item.
 */
const addItemToList = async (listId, itemText) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const list = await List.findById(listId).session(session);
    if (!list) {
      throw new AppError('List not found.', 404);
    }

    const item = new Item({ itemText, listId });
    await item.save({ session });

    list.items.push(item._id);
    await list.save({ session });

    await session.commitTransaction();
    await item.populate([
      {
        path: 'listId',
        select: '_id title',
      },
    ]);
    return item;
  } catch (error) {
    await session.abortTransaction();
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
  const query = { listId };
  if (status === 'resolved') {
    query.isResolved = true;
  } else if (status === 'unresolved') {
    query.isResolved = false;
  } else if (status) {
    throw new AppError('Invalid status filter.', 400);
  }

  try {
    const items = await Item.find(query).sort({ isResolved: 1, createdAt: -1 });
    return items;
  } catch (error) {
    throw new AppError('Failed to retrieve items.', 500);
  }
};

/**
 * Marks an item as resolved or unresolved.
 * @param {String} listId - List ID.
 * @param {String} itemId - Item ID.
 * @param {Boolean} isResolved - Resolution status.
 * @returns {Promise<Object>} - Updated item.
 */
const markItemResolved = async (listId, itemId, isResolved) => {
  try {
    const item = await Item.findOne({ _id: itemId, listId });
    if (!item) {
      throw new AppError('Item not found.', 404);
    }

    item.isResolved = isResolved;
    await item.save();
    return item;
  } catch (error) {
    throw error;
  }
};

/**
 * Deletes an item from a list.
 * @param {String} listId - List ID.
 * @param {String} itemId - Item ID.
 * @returns {Promise<Object>} - Deleted item.
 */
const deleteItemFromList = async (listId, itemId) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Nejprve zkontrolujte, zda seznam existuje
    const list = await List.findById(listId).session(session);
    if (!list) {
      throw new AppError('List not found.', 404);
    }

    // Pokus o smazání položky
    const item = await Item.findOneAndDelete({ _id: itemId, listId }).session(session);
    if (!item) {
      throw new AppError('Item not found.', 404);
    }

    // Odstranění položky ze seznamu
    list.items.pull(itemId);
    await list.save({ session });

    await session.commitTransaction();
    return item;
  } catch (error) {
    await session.abortTransaction();
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