// features/lists/listService.js
const List = require('./listModel');
const User = require('../users/userModel');
const Item = require('../items/itemModel');
const { AppError } = require('../../middleware/errorHandler');
const mongoose = require('mongoose');

/**
 * Creates a new list.
 * @param {String} ownerId - ID of the user creating the list.
 * @param {String} title - Title of the list.
 * @returns {Promise<Object>} - Created list.
 */
const createList = async (ownerId, title) => {
  const owner = await User.findById(ownerId);
  if (!owner) {
    throw new AppError('Owner does not exist.', 404);
  }

  const list = new List({
    ownerId,
    title,
    members: [ownerId],
  });

  await list.save();

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

  const [lists, total] = await Promise.all([
    List.find(filter)
      .skip((page - 1) * limit)
      .limit(limit)
      .populate(populateOptions),
    List.countDocuments(filter),
  ]);

  return { lists, total };
};

/**
 * Retrieves a list by its ID.
 * @param {String} listId - ID of the list.
 * @param {String} userId - ID of the user.
 * @returns {Promise<Object>} - List data.
 */
const getListById = async (listId, userId) => {
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
    throw new AppError('List not found or access denied.', 404);
  }

  return list;
};

/**
 * Updates the name of a list.
 * @param {String} listId - ID of the list.
 * @param {String} title - New title of the list.
 * @returns {Promise<Object>} - Updated list.
 */
const updateListName = async (listId, title) => {
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
    throw new AppError('List not found.', 404);
  }

  return list;
};

/**
 * Soft deletes a list by setting 'deletedAt'.
 * @param {String} listId - ID of the list.
 * @returns {Promise<Object>} - Updated list.
 */
const deleteList = async (listId) => {
  const list = await List.findByIdAndUpdate(
    listId,
    { deletedAt: new Date() },
    { new: true }
  );

  if (!list) {
    throw new AppError('List not found.', 404);
  }

  return list;
};

/**
 * Restores a soft-deleted list.
 * @param {String} listId - ID of the list.
 * @returns {Promise<Object>} - Restored list.
 */
const restoreDeletedList = async (listId) => {
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
    throw new AppError('List not found.', 404);
  }

  return list;
};

/**
 * Archives a list.
 * @param {String} listId - ID of the list.
 * @returns {Promise<Object>} - Archived list.
 */
const archiveList = async (listId) => {
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
    throw new AppError('List not found.', 404);
  }

  return list;
};

/**
 * Restores an archived list.
 * @param {String} listId - ID of the list.
 * @returns {Promise<Object>} - Restored list.
 */
const restoreArchivedList = async (listId) => {
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
    throw new AppError('List not found.', 404);
  }

  return list;
};

/**
 * Retrieves members of a list.
 * @param {String} listId - ID of the list.
 * @returns {Promise<Array>} - Array of members.
 */
const getMembers = async (listId) => {
  const list = await List.findById(listId)
    .populate({
      path: 'members',
      select: '_id username email profilePicture bio status',
    });

  if (!list) {
    throw new AppError('List not found.', 404);
  }

  return list.members;
};

/**
 * Adds a member to a list by username.
 * @param {String} listId - ID of the list.
 * @param {String} username - Username of the member to add.
 * @returns {Promise<Object>} - Updated list.
 */
const addMember = async (listId, username) => {
  const user = await User.findOne({ username })
    .select('_id username email profilePicture bio status'); // Select only necessary fields

  if (!user) {
    throw new AppError('User not found.', 404);
  }

  const list = await List.findById(listId);

  if (!list) {
    throw new AppError('List not found.', 404);
  }

  if (list.members.includes(user._id)) {
    throw new AppError('User is already a member of the list.', 400);
  }

  list.members.push(user._id);
  await list.save();

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
  const list = await List.findById(listId);

  if (!list) {
    throw new AppError('List not found.', 404);
  }

  if (!list.members.includes(memberId)) {
    throw new AppError('User is not a member of the list.', 400);
  }

  list.members.pull(memberId);
  await list.save();

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
  const list = await List.findByIdAndDelete(listId);

  if (!list) {
    throw new AppError('List not found.', 404);
  }

  // Delete associated items
  await Item.deleteMany({ listId: list._id });

  return list;
};

/**
 * Retrieves active lists with item counts for a user.
 * @param {String} userId - ID of the authenticated user.
 * @param {Array<String>} listIds - Array of list IDs.
 * @returns {Promise<Array>} - Array of objects containing list ID, title, and item count.
 */
const getActiveListsItemCounts = async (userId, listIds) => {
  if (!Array.isArray(listIds) || listIds.length === 0) {
    throw new AppError('Invalid listIds.', 400);
  }

  // Verify all listIds are valid ObjectIds
  const validObjectIds = listIds.every(id => mongoose.Types.ObjectId.isValid(id));
  if (!validObjectIds) {
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

    return counts;
  } catch (error) {
    throw new AppError('Failed to retrieve item counts.', 500);
  }
};

/**
 * Permanently deletes all soft-deleted lists for a user.
 * @param {String} userId - ID of the user.
 * @returns {Promise<Object>} - Information about deleted lists.
 */
const permanentlyDeleteAllDeletedLists = async (userId) => {
  const lists = await List.find({ ownerId: userId, deletedAt: { $ne: null } });
  const listIds = lists.map((list) => list._id);

  if (listIds.length === 0) {
    return { deletedCount: 0 };
  }

  await List.deleteMany({ _id: { $in: listIds } });
  await Item.deleteMany({ listId: { $in: listIds } });

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