const List = require('./listModel');
const User = require('../users/userModel');
const Item = require('../items/itemModel');
const { AppError } = require('../../middleware/errorHandler');
const mongoose = require('mongoose');
const logger = require('../../middleware/logger');

/**
 * Creates a new list.
 * @param {String} ownerId - ID of the user creating the list.
 * @param {String} title - Title of the list.
 * @returns {Promise<Object>} - Created list.
 */
const createList = async (ownerId, title) => {
  logger.info(`Creating new list titled: "${title}" for user ID: ${ownerId}`);

  const list = new List({
    ownerId,
    title,
    members: [ownerId],
  });

  await list.save();
  logger.info(`List created with ID: ${list._id}`);
  
  await list.populate([
    {
      path: 'ownerId',
      select: '_id', 
    },
    {
      path: 'members',
      select: '_id username email status', 
    },
    {
      path: 'items',
    },
  ]);

  return list;
};

/**
 * Retrieves lists based on filter type.
 * @param {String} userId - ID of the user.
 * @param {String} type - Type of lists ('all', 'active', 'archived', 'deleted').
 * @param {Number} page - Page number.
 * @param {Number} limit - Number of items per page.
 * @returns {Promise<Object>} - Object containing lists and total count.
 */
const getLists = async (userId, type = 'all', page = 1, limit = 10) => {
  let filter = { members: userId };
  let populateOptions = [
    {
      path: 'ownerId',
      select: '_id', 
    },
    {
      path: 'members',
      select: '_id username email status', 
    },
    {
      path: 'items',
    },
  ];

  switch (type) {
    case 'active':
      filter.deletedAt = null;
      filter.isArchived = false;
      break;
    case 'archived':
      filter.deletedAt = null;
      filter.isArchived = true;
      filter.ownerId = userId;
      break;
    case 'deleted':
      filter.deletedAt = { $ne: null };
      filter.ownerId = userId;
      break;
    case 'all':
    default:
      filter.deletedAt = null;
      filter.$or = [
        { ownerId: userId },
        { isArchived: false },
      ];
      break;
  }

  logger.info(`Fetching lists for user ID: ${userId} with filter: ${type}, page: ${page}, limit: ${limit}`);

  const [lists, total] = await Promise.all([
    List.find(filter)
      .skip((page - 1) * limit)
      .limit(limit)
      .populate(populateOptions),
    List.countDocuments(filter),
  ]);

  logger.info(`Found ${lists.length} lists out of ${total} total.`);
  return { lists, total };
};

/**
 * Retrieves a list by its ID.
 * @param {String} listId - ID of the list.
 * @param {String} userId - ID of the user.
 * @returns {Promise<Object>} - List data.
 */
const getListById = async (listId, userId) => {
  logger.info(`Fetching list with ID: ${listId} for user ID: ${userId}`);
  const list = await List.findOne({ _id: listId, members: userId, deletedAt: null })
    .populate([
      {
        path: 'ownerId',
        select: '_id', 
      },
      {
        path: 'members',
        select: '_id username email status', 
      },
      {
        path: 'items',
      },
    ]);

  if (!list) {
    logger.warn(`List with ID: ${listId} not found or access denied.`);
    throw new AppError('List not found or access denied.', 404);
  }

  logger.info(`List with ID: ${listId} successfully fetched.`);
  return list;
};

/**
 * Updates the name of a list.
 * @param {String} listId - ID of the list.
 * @param {String} title - New title of the list.
 * @returns {Promise<Object>} - Updated list.
 */
const updateListName = async (listId, title) => {
  logger.info(`Updating list ID: ${listId} with new title: "${title}"`);
  const list = await List.findByIdAndUpdate(
    listId,
    { title },
    { new: true, runValidators: true }
  )
    .populate([
      {
        path: 'ownerId',
        select: '_id', 
      },
      {
        path: 'items',
      },
    ]);

  if (!list) {
    logger.warn(`List with ID: ${listId} not found.`);
    throw new AppError('List not found.', 404);
  }

  logger.info(`List ID: ${listId} successfully updated.`);
  return list;
};

/**
 * Soft deletes a list by setting 'deletedAt'.
 * @param {String} listId - ID of the list.
 * @returns {Promise<Object>} - Updated list.
 */
const deleteList = async (listId) => {
  logger.info(`Soft deleting list with ID: ${listId}`);
  const list = await List.findByIdAndUpdate(
    listId,
    { deletedAt: new Date() },
    { new: true }
  )

  if (!list) {
    logger.warn(`List with ID: ${listId} not found for deletion.`);
    throw new AppError('List not found.', 404);
  }

  logger.info(`List ID: ${listId} marked as deleted.`);
  return list;
};

/**
 * Restores a soft-deleted list.
 * @param {String} listId - ID of the list.
 * @returns {Promise<Object>} - Restored list.
 */
const restoreDeletedList = async (listId) => {
  logger.info(`Restoring deleted list with ID: ${listId}`);
  const list = await List.findByIdAndUpdate(
    listId,
    { deletedAt: null },
    { new: true }
  )
    .populate([
      {
        path: 'ownerId',
        select: '_id',
      },
    ]);

  if (!list) {
    logger.warn(`List with ID: ${listId} not found for restoration.`);
    throw new AppError('List not found.', 404);
  }

  logger.info(`List ID: ${listId} successfully restored.`);
  return list;
};

/**
 * Archives a list.
 * @param {String} listId - ID of the list.
 * @returns {Promise<Object>} - Archived list.
 */
const archiveList = async (listId) => {
  logger.info(`Archiving list with ID: ${listId}`);
  const list = await List.findByIdAndUpdate(
    listId,
    { isArchived: true },
    { new: true }
  )
    .populate([
      {
        path: 'ownerId',
        select: '_id',
      },
    ]);

  if (!list) {
    logger.warn(`List with ID: ${listId} not found for archiving.`);
    throw new AppError('List not found.', 404);
  }

  logger.info(`List ID: ${listId} successfully archived.`);
  return list;
};

/**
 * Restores an archived list.
 * @param {String} listId - ID of the list.
 * @returns {Promise<Object>} - Restored list.
 */
const restoreArchivedList = async (listId) => {
  logger.info(`Restoring archived list with ID: ${listId}`);
  const list = await List.findByIdAndUpdate(
    listId,
    { isArchived: false },
    { new: true }
  )
    .populate([
      {
        path: 'ownerId',
        select: '_id', 
      },
    ]);

  if (!list) {
    logger.warn(`List with ID: ${listId} not found for restoring archive.`);
    throw new AppError('List not found.', 404);
  }

  logger.info(`List ID: ${listId} successfully restored from archive.`);
  return list;
};

/**
 * Retrieves members of a list.
 * @param {String} listId - ID of the list.
 * @returns {Promise<Array>} - Array of members.
 */
const getMembers = async (listId) => {
  logger.info(`Fetching members of list with ID: ${listId}`);
  const list = await List.findById(listId)
    .populate({
      path: 'members',
      select: '_id username email profilePicture bio status',
    });

  if (!list) {
    logger.warn(`List with ID: ${listId} not found.`);
    throw new AppError('List not found.', 404);
  }

  logger.info(`Members of list ID: ${listId} successfully fetched.`);
  return list.members;
};

/**
 * Adds a member to a list by username.
 * @param {String} listId - ID of the list.
 * @param {String} username - Username of the member to add.
 * @returns {Promise<Object>} - Updated list.
 */
const addMember = async (listId, username) => {
  logger.info(`Adding member with username: ${username} to list ID: ${listId}`);
  const user = await User.findOne({ username })
    .select('_id username email profilePicture bio status'); // Select only necessary fields

  if (!user) {
    logger.warn(`User with username: ${username} not found.`);
    throw new AppError('User not found.', 404);
  }

  const list = await List.findById(listId);

  if (!list) {
    logger.warn(`List with ID: ${listId} not found.`);
    throw new AppError('List not found.', 404);
  }

  if (list.members.includes(user._id)) {
    logger.warn(`User ID: ${user._id} is already a member of list ID: ${listId}.`);
    throw new AppError('User is already a member of the list.', 400);
  }

  list.members.push(user._id);
  await list.save();

  logger.info(`User ID: ${user._id} successfully added to list ID: ${listId}.`);
  await list.populate([
    {
      path: 'ownerId',
      select: '_id',
    },
    {
      path: 'members',
      select: '_id username email status',
    },
    {
      path: 'items',
    },
  ]);

  return list;
};

/**
 * Removes a member from a list by member ID.
 * @param {String} listId - ID of the list.
 * @param {String} memberId - ID of the member to remove.
 * @returns {Promise<Object>} - Updated list.
 */
const removeMember = async (listId, memberId) => {
  logger.info(`Removing member with ID: ${memberId} from list ID: ${listId}`);
  const list = await List.findById(listId);

  if (!list) {
    logger.warn(`List with ID: ${listId} not found.`);
    throw new AppError('List not found.', 404);
  }

  if (!list.members.includes(memberId)) {
    logger.warn(`User ID: ${memberId} is not a member of list ID: ${listId}.`);
    throw new AppError('User is not a member of the list.', 400);
  }

  list.members.pull(memberId);
  await list.save();

  logger.info(`User ID: ${memberId} successfully removed from list ID: ${listId}.`);
  await list.populate([
    {
      path: 'ownerId',
      select: '_id',
    },
    {
      path: 'members',
      select: '_id username email status',
    },
    {
      path: 'items',
    },
  ]);

  return list;
};

/**
 * Allows a user to remove themselves from a list.
 * @param {String} listId - ID of the list.
 * @param {String} userId - ID of the user.
 * @returns {Promise<Object>} - Updated list.
 */
const removeSelf = async (listId, userId) => {
  logger.info(`User ID ${userId} is attempting to remove themselves from list ID: ${listId}`);

  const list = await List.findById(listId);

  if (!list) {
    throw new AppError('List not found.', 404);
  }

  if (list.ownerId.toString() === userId.toString()) {
    throw new AppError('Owner cannot be removed from the list.', 400);
  }

  return await removeMember(listId, userId);
};

/**
 * Permanently deletes a list.
 * @param {String} listId - ID of the list.
 * @returns {Promise<Object>} - Deleted list.
 */
const permanentlyDeleteList = async (listId) => {
  logger.info(`Permanently deleting list with ID: ${listId}`);
  const list = await List.findByIdAndDelete(listId);

  if (!list) {
    logger.warn(`List with ID: ${listId} not found for permanent deletion.`);
    throw new AppError('List not found.', 404);
  }

  // Delete associated items
  await Item.deleteMany({ listId: list._id });

  logger.info(`List ID: ${listId} and its items have been permanently deleted.`);
  return list;
};

/**
 * Retrieves active lists with item counts for a user.
 * @param {String} userId - ID of the authenticated user.
 * @param {Array<String>} listIds - Array of list IDs.
 * @returns {Promise<Array>} - Array of objects containing list ID, title, and item count.
 */
const getActiveListsItemCounts = async (userId, listIds) => {
  logger.info(`Retrieving item counts for active lists of user ID: ${userId}`);
  
  if (!Array.isArray(listIds) || listIds.length === 0) {
    logger.warn('Invalid listIds provided.');
    throw new AppError('Invalid listIds.', 400);
  }

  // Verify all listIds are valid ObjectIds
  const validObjectIds = listIds.every(id => mongoose.Types.ObjectId.isValid(id));
  if (!validObjectIds) {
    logger.warn('One or more listIds are invalid.');
    throw new AppError('One or more listIds are invalid.', 400);
  }

  try {
    // Find active lists that belong to the user
    const lists = await List.find({
      _id: { $in: listIds },
      members: userId,
      isArchived: false,
      deletedAt: null,
    }).select('title items');

    // Create an array with item counts
    const counts = lists.map(list => ({
      listId: list._id,
      title: list.title,
      itemCount: list.items.length,
    }));

    logger.info(`Item counts for active lists of user ID: ${userId} successfully retrieved.`);
    return counts;
  } catch (error) {
    logger.error(`Error retrieving item counts: ${error.message}`);
    throw new AppError('Failed to retrieve item counts.', 500);
  }
};

/**
 * Permanently deletes all soft-deleted lists for a user.
 * @param {String} userId - ID of the user.
 * @returns {Promise<Object>} - Information about deleted lists.
 */
const permanentlyDeleteAllDeletedLists = async (userId) => {
  logger.info(`Permanently deleting all deleted lists for user ID: ${userId}`);
  const lists = await List.find({ ownerId: userId, deletedAt: { $ne: null } });
  const listIds = lists.map((list) => list._id);

  if (listIds.length === 0) {
    logger.info(`No deleted lists found for user ID: ${userId}.`);
    return { deletedCount: 0 };
  }

  await List.deleteMany({ _id: { $in: listIds } });
  await Item.deleteMany({ listId: { $in: listIds } });

  logger.info(`Permanently deleted ${listIds.length} lists and their associated items for user ID: ${userId}.`);
  return { deletedCount: listIds.length };
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