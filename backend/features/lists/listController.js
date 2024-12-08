// features/lists/listController.js
const listService = require('./listService');
const logger = require('../../middleware/logger');
const { AppError } = require('../../middleware/errorHandler');

/**
 * Create a new list
 */
const createList = async (req, res, next) => {
  const { title } = req.body;
  const ownerId = req.user._id;

  logger.info(`User ID ${ownerId} is creating a new list`);
  try {
    const list = await listService.createList(ownerId, title);
    logger.info(`List ID ${list._id} has been successfully created for user ID ${ownerId}`);
    res.status(201).json({ status: 'success', data: list });
  } catch (error) {
    logger.error(`Error creating list: ${error.message}`);
    next(error);
  }
};

/**
 * Get lists with filtering
 */
const getLists = async (req, res, next) => {
  const userId = req.user._id;
  const { type = 'all', page = 1, limit = 10 } = req.query;

  logger.info(`User ID ${userId} is requesting ${type} lists, page: ${page}, limit: ${limit}`);
  try {
    const lists = await listService.getLists(userId, type, parseInt(page), parseInt(limit));
    logger.info(`Successfully retrieved ${lists.lists.length} lists for user ID: ${userId}`);
    res.status(200).json({ status: 'success', data: lists });
  } catch (error) {
    logger.error(`Error retrieving lists: ${error.message}`);
    next(error);
  }
};

/**
 * Get a list by ID
 */
const getListById = async (req, res, next) => {
  const { listId } = req.params;
  const userId = req.user._id;

  logger.info(`User ID ${userId} is requesting list ID: ${listId}`);
  try {
    const list = await listService.getListById(listId, userId);
    logger.info(`List with ID: ${listId} successfully fetched.`);
    res.status(200).json({ status: 'success', data: list });
  } catch (error) {
    if (error.statusCode === 404) {
      logger.warn(`List with ID: ${listId} not found.`);
    } else {
      logger.error(`Error fetching list: ${error.message}`);
    }
    next(error);
  }
};

/**
 * Update list name
 */
const updateListName = async (req, res, next) => {
  const { listId } = req.params;
  const { title } = req.body;

  logger.info(`User ID ${req.user._id} is updating list ID: ${listId} to "${title}"`);
  try {
    const list = await listService.updateListName(listId, title);
    logger.info(`List ID: ${listId} successfully updated.`);
    res.status(200).json({ status: 'success', data: list });
  } catch (error) {
    if (error.statusCode === 404) {
      logger.warn(`List with ID: ${listId} not found for update.`);
    } else {
      logger.error(`Error updating list: ${error.message}`);
    }
    next(error);
  }
};

/**
 * Delete a list (soft delete)
 */
const deleteList = async (req, res, next) => {
  const { listId } = req.params;

  logger.info(`User ID ${req.user._id} is requesting deletion of list ID: ${listId}`);
  try {
    await listService.deleteList(listId);
    logger.info(`List ID: ${listId} has been successfully deleted.`);
    res.status(204).send();
  } catch (error) {
    if (error.statusCode === 404) {
      logger.warn(`List with ID: ${listId} not found for deletion.`);
    } else {
      logger.error(`Error deleting list: ${error.message}`);
    }
    next(error);
  }
};

/**
 * Restore a deleted list
 */
const restoreDeletedList = async (req, res, next) => {
  const { listId } = req.params;

  logger.info(`User ID ${req.user._id} is requesting restoration of deleted list ID: ${listId}`);
  try {
    const list = await listService.restoreDeletedList(listId);
    logger.info(`List with ID: ${listId} successfully restored.`);
    res.status(200).json({ status: 'success', data: list });
  } catch (error) {
    if (error.statusCode === 404) {
      logger.warn(`List with ID: ${listId} not found for restoration.`);
    } else {
      logger.error(`Error restoring deleted list: ${error.message}`);
    }
    next(error);
  }
};

/**
 * Archive a list
 */
const archiveList = async (req, res, next) => {
  const { listId } = req.params;

  logger.info(`User ID ${req.user._id} is requesting to archive list ID: ${listId}`);
  try {
    const list = await listService.archiveList(listId);
    logger.info(`List ID: ${listId} successfully archived.`);
    res.status(200).json({ status: 'success', data: list });
  } catch (error) {
    if (error.statusCode === 404) {
      logger.warn(`List with ID: ${listId} not found for archiving.`);
    } else {
      logger.error(`Error archiving list: ${error.message}`);
    }
    next(error);
  }
};

/**
 * Restore an archived list
 */
const restoreArchivedList = async (req, res, next) => {
  const { listId } = req.params;

  logger.info(`User ID ${req.user._id} is requesting to restore archived list ID: ${listId}`);
  try {
    const list = await listService.restoreArchivedList(listId);
    logger.info(`List ID: ${listId} successfully restored from archive.`);
    res.status(200).json({ status: 'success', data: list });
  } catch (error) {
    if (error.statusCode === 404) {
      logger.warn(`List with ID: ${listId} not found for restoring archive.`);
    } else {
      logger.error(`Error restoring archived list: ${error.message}`);
    }
    next(error);
  }
};

/**
 * Get members of a list
 */
const getMembers = async (req, res, next) => {
  const { listId } = req.params;

  logger.info(`User ID ${req.user._id} is requesting members of list ID: ${listId}`);
  try {
    const members = await listService.getMembers(listId);
    logger.info(`Successfully retrieved members for list ID: ${listId}`);
    res.status(200).json({ status: 'success', data: members });
  } catch (error) {
    logger.error(`Error fetching members: ${error.message}`);
    next(error);
  }
};

/**
 * Add a member to a list
 */
const addMember = async (req, res, next) => {
  const { listId } = req.params;
  const { username } = req.body;

  logger.info(`User ID ${req.user._id} is adding member "${username}" to list ID: ${listId}`);
  try {
    const list = await listService.addMember(listId, username);
    logger.info(`Member "${username}" successfully added to list ID: ${listId}`);
    res.status(200).json({ status: 'success', data: list });
  } catch (error) {
    if (error.message === 'User is already a member of the list.') {
      logger.warn(`User is already a member of list ID: ${listId}.`);
    } else if (error.message === 'User not found.') {
      logger.warn(`User with username: ${username} not found.`);
    } else if (error.message === 'List not found.') {
      logger.warn(`List with ID: ${listId} not found.`);
    } else {
      logger.error(`Error adding member: ${error.message}`);
    }
    next(error);
  }
};

/**
 * Remove a member from a list
 */
const removeMember = async (req, res, next) => {
  const { listId, memberId } = req.params;

  logger.info(`User ID ${req.user._id} is removing member ID: ${memberId} from list ID: ${listId}`);
  try {
    const list = await listService.removeMember(listId, memberId);
    logger.info(`Member ID: ${memberId} successfully removed from list ID: ${listId}`);
    res.status(200).json({ status: 'success', data: list });
  } catch (error) {
    if (error.message === 'User is not a member of the list.') {
      logger.warn(`User ID: ${memberId} is not a member of list ID: ${listId}.`);
    } else if (error.message === 'List not found.') {
      logger.warn(`List with ID: ${listId} not found.`);
    } else {
      logger.error(`Error removing member: ${error.message}`);
    }
    next(error);
  }
};

/**
 * Remove self from a list
 */
const removeSelf = async (req, res, next) => {
  const { listId } = req.params;
  const userId = req.user._id;

  logger.info(`User ID ${userId} is removing themselves from list ID: ${listId}`);
  try {
    const list = await listService.removeSelf(listId, userId);
    logger.info(`User ID ${userId} successfully removed from list ID: ${listId}`);
    res.status(200).json({ status: 'success', data: list });
  } catch (error) {
    if (error.message === 'Owner cannot be removed from the list.') {
      logger.warn(`Owner cannot be removed from list ID: ${listId}.`);
    } else if (error.message === 'List not found.') {
      logger.warn(`List with ID: ${listId} not found.`);
    } else {
      logger.error(`Error removing self: ${error.message}`);
    }
    next(error);
  }
};

/**
 * Permanently delete a list
 */
const permanentlyDeleteList = async (req, res, next) => {
  const { listId } = req.params;

  logger.info(`User ID ${req.user._id} is permanently deleting list ID: ${listId}`);
  try {
    await listService.permanentlyDeleteList(listId);
    logger.info(`List ID: ${listId} has been permanently deleted.`);
    res.status(204).send();
  } catch (error) {
    if (error.message === 'List not found.') {
      logger.warn(`List with ID: ${listId} not found for permanent deletion.`);
    } else {
      logger.error(`Error permanently deleting list: ${error.message}`);
    }
    next(error);
  }
};

/**
 * Get count of active items in multiple lists
 */
const getActiveListsItemCounts = async (req, res, next) => {
  const userId = req.user._id;
  const { listIds } = req.body;

  logger.info(`User ID ${userId} is requesting active item counts for lists: ${listIds}`);
  try {
    const counts = await listService.getActiveListsItemCounts(userId, listIds);
    logger.info(`Successfully retrieved active item counts for lists: ${listIds}`);
    res.status(200).json({ status: 'success', data: counts });
  } catch (error) {
    logger.error(`Error retrieving item counts: ${error.message}`);
    next(error);
  }
};

/**
 * Permanently delete all deleted lists
 */
const permanentlyDeleteAllDeletedLists = async (req, res, next) => {
  const userId = req.user._id;

  logger.info(`User ID ${userId} is permanently deleting all deleted lists`);
  try {
    const result = await listService.permanentlyDeleteAllDeletedLists(userId);
    logger.info(`Permanently deleted ${result.deletedCount} lists for user ID: ${userId}`);
    res.status(200).json({ status: 'success', data: result });
  } catch (error) {
    logger.error(`Error permanently deleting all deleted lists: ${error.message}`);
    next(error);
  }
};

module.exports = {
  createList,
  getLists,
  getListById,
  updateListName,
  deleteList,
  restoreDeletedList,
  archiveList,
  restoreArchivedList,
  getMembers,
  addMember,
  removeMember,
  removeSelf,
  permanentlyDeleteList,
  getActiveListsItemCounts,
  permanentlyDeleteAllDeletedLists,
};