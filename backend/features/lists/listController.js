const asyncHandler = require('express-async-handler');
const listService = require('./listService');
const logger = require('../../middleware/logger');
const { AppError } = require('../../middleware/errorHandler');

// Create a new list
const createList = asyncHandler(async (req, res, next) => {
  const { title } = req.body;
  const ownerId = req.user._id;

  logger.info(`User ID ${ownerId} is creating a new list`);
  const list = await listService.createList(ownerId, title);
  logger.info(`List ID ${list._id} has been successfully created for user ID ${ownerId}`);
  res.status(201).json({ status: 'success', data: list });
});

// Get lists with filtering
const getLists = asyncHandler(async (req, res, next) => {
  const userId = req.user._id;
  const { type = 'all', page = 1, limit = 10 } = req.query;

  logger.info(`User ID ${userId} is requesting ${type} lists, page: ${page}, limit: ${limit}`);
  const lists = await listService.getLists(userId, type, parseInt(page), parseInt(limit));
  res.status(200).json({ status: 'success', data: lists });
});

// Get a list by ID
const getListById = asyncHandler(async (req, res, next) => {
  const { listId } = req.params;
  const userId = req.user._id;

  logger.info(`User ID ${userId} is requesting list ID: ${listId}`);
  try {
    const list = await listService.getListById(listId, userId);
    res.status(200).json({ status: 'success', data: list });
  } catch (error) {
    next(error);
  }
});

// Update list name
const updateListName = asyncHandler(async (req, res, next) => {
  const { listId } = req.params;
  const { title } = req.body;

  logger.info(`User ID ${req.user._id} is updating list ID: ${listId} to "${title}"`);
  const list = await listService.updateListName(listId, title);

  res.status(200).json({ status: 'success', data: list });
});

// Delete a list (soft delete)
const deleteList = asyncHandler(async (req, res, next) => {
  const { listId } = req.params;

  logger.info(`User ID ${req.user._id} is requesting deletion of list ID: ${listId}`);
  await listService.deleteList(listId);
  logger.info(`List ID: ${listId} has been successfully deleted.`);
  res.status(204).send();
});

// Restore a deleted list
const restoreDeletedList = asyncHandler(async (req, res, next) => {
  const { listId } = req.params;

  logger.info(`User ID ${req.user._id} is requesting restoration of deleted list ID: ${listId}`);
  const list = await listService.restoreDeletedList(listId);
  res.status(200).json({ status: 'success', data: list });
});

// Archive a list
const archiveList = asyncHandler(async (req, res, next) => {
  const { listId } = req.params;

  logger.info(`User ID ${req.user._id} is requesting to archive list ID: ${listId}`);
  const list = await listService.archiveList(listId);
  res.status(200).json({ status: 'success', data: list });
});

// Restore an archived list
const restoreArchivedList = asyncHandler(async (req, res, next) => {
  const { listId } = req.params;

  logger.info(`User ID ${req.user._id} is requesting to restore archived list ID: ${listId}`);
  const list = await listService.restoreArchivedList(listId);
  res.status(200).json({ status: 'success', data: list });
});

// Get members of a list
const getMembers = asyncHandler(async (req, res, next) => {
  const { listId } = req.params;

  logger.info(`User ID ${req.user._id} is requesting members of list ID: ${listId}`);
  const members = await listService.getMembers(listId);
  res.status(200).json({ status: 'success', data: members });
});

// Add a member to a list
const addMember = asyncHandler(async (req, res, next) => {
  const { listId } = req.params;
  const { username } = req.body;

  logger.info(`User ID ${req.user._id} is adding member "${username}" to list ID: ${listId}`);
  const list = await listService.addMember(listId, username);
  res.status(200).json({ status: 'success', data: list });
});

// Remove a member from a list
const removeMember = asyncHandler(async (req, res, next) => {
  const { listId, memberId } = req.params;

  logger.info(`User ID ${req.user._id} is removing member ID: ${memberId} from list ID: ${listId}`);
  const list = await listService.removeMember(listId, memberId);
  res.status(200).json({ status: 'success', data: list });
});

// Remove self from a list
const removeSelf = asyncHandler(async (req, res, next) => {
  const { listId } = req.params;
  const userId = req.user._id;

  logger.info(`User ID ${userId} is removing themselves from list ID: ${listId}`);
  const list = await listService.removeSelf(listId, userId);
  res.status(200).json({ status: 'success', data: list });
});

// Permanently delete a list
const permanentlyDeleteList = asyncHandler(async (req, res, next) => {
  const { listId } = req.params;

  logger.info(`User ID ${req.user._id} is permanently deleting list ID: ${listId}`);
  await listService.permanentlyDeleteList(listId);
  res.status(204).send();
});


// Get count of active items in multiple lists
const getActiveListsItemCounts = asyncHandler(async (req, res, next) => {
  const userId = req.user._id;
  const { listIds } = req.body;

  logger.info(`User ID ${userId} is requesting active item counts for lists: ${listIds}`);
  const counts = await listService.getActiveListsItemCounts(userId, listIds);
  res.status(200).json({ status: 'success', data: counts });
});

// Permanently delete all deleted lists
const permanentlyDeleteAllDeletedLists = asyncHandler(async (req, res, next) => {
  const userId = req.user._id;

  logger.info(`User ID ${userId} is permanently deleting all deleted lists`);
  const result = await listService.permanentlyDeleteAllDeletedLists(userId);
  res.status(200).json({ status: 'success', data: result });
});

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