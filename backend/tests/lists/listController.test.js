// tests/features/lists/listController.test.js
const listController = require('../../features/lists/listController');
const listService = require('../../features/lists/listService');
const { AppError } = require('../../middleware/errorHandler');
const logger = require('../../middleware/logger');

// Mockování listService metod a logger metod
jest.mock('../../features/lists/listService');
jest.mock('../../middleware/logger', () => ({
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
}));

describe('List Controller', () => {
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

  describe('createList', () => {
    it('should create a list and respond with 201 status', async () => {
      const title = 'New List';
      const ownerId = req.user._id;
      const createdList = { _id: 'list-id', title, ownerId };

      req.body.title = title;
      listService.createList.mockResolvedValue(createdList);

      await listController.createList(req, res, next);

      expect(listService.createList).toHaveBeenCalledWith(ownerId, title);
      expect(logger.info).toHaveBeenCalledWith(`User ID ${ownerId} is creating a new list`);
      expect(logger.info).toHaveBeenCalledWith(`List ID ${createdList._id} has been successfully created for user ID ${ownerId}`);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({ status: 'success', data: createdList });
    });

    it('should handle errors and pass to next', async () => {
      const title = 'New List';
      const ownerId = req.user._id;
      const errorMessage = 'Error creating list.';
      const error = new AppError(errorMessage, 500);

      req.body.title = title;
      listService.createList.mockRejectedValue(error);

      await listController.createList(req, res, next);

      expect(listService.createList).toHaveBeenCalledWith(ownerId, title);
      expect(logger.info).toHaveBeenCalledWith(`User ID ${ownerId} is creating a new list`);
      expect(logger.error).toHaveBeenCalledWith(`Error creating list: ${errorMessage}`);
      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('getLists', () => {
    it('should retrieve lists and respond with 200 status', async () => {
      const userId = req.user._id;
      const type = 'active';
      const page = 1;
      const limit = 10;
      const listsData = { lists: [{ _id: 'list1', title: 'List 1' }], total: 1 };

      req.query.type = type;
      req.query.page = page;
      req.query.limit = limit;
      listService.getLists.mockResolvedValue(listsData);

      await listController.getLists(req, res, next);

      expect(listService.getLists).toHaveBeenCalledWith(userId, type, page, limit);
      expect(logger.info).toHaveBeenCalledWith(`User ID ${userId} is requesting ${type} lists, page: ${page}, limit: ${limit}`);
      expect(logger.info).toHaveBeenCalledWith(`Successfully retrieved ${listsData.lists.length} lists for user ID: ${userId}`);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ status: 'success', data: listsData });
    });

    it('should handle errors and pass to next', async () => {
      const userId = req.user._id;
      const type = 'active';
      const page = 1;
      const limit = 10;
      const errorMessage = 'Error retrieving lists.';
      const error = new AppError(errorMessage, 500);

      req.query.type = type;
      req.query.page = page;
      req.query.limit = limit;
      listService.getLists.mockRejectedValue(error);

      await listController.getLists(req, res, next);

      expect(listService.getLists).toHaveBeenCalledWith(userId, type, page, limit);
      expect(logger.info).toHaveBeenCalledWith(`User ID ${userId} is requesting ${type} lists, page: ${page}, limit: ${limit}`);
      expect(logger.error).toHaveBeenCalledWith(`Error retrieving lists: ${errorMessage}`);
      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('getListById', () => {
    it('should retrieve a specific list and respond with 200 status', async () => {
      const listId = 'list-id';
      const userId = req.user._id;
      const listData = { _id: listId, title: 'Test List', ownerId: userId };

      req.params.listId = listId;
      listService.getListById.mockResolvedValue(listData);

      await listController.getListById(req, res, next);

      expect(listService.getListById).toHaveBeenCalledWith(listId, userId);
      expect(logger.info).toHaveBeenCalledWith(`User ID ${userId} is requesting list ID: ${listId}`);
      expect(logger.info).toHaveBeenCalledWith(`List with ID: ${listId} successfully fetched.`);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ status: 'success', data: listData });
    });

    it('should handle errors and pass to next', async () => {
      const listId = 'nonexistentlistid123456789012';
      const userId = req.user._id;
      const errorMessage = 'List not found or access denied.';
      const error = new AppError(errorMessage, 404);

      req.params.listId = listId;
      listService.getListById.mockRejectedValue(error);

      await listController.getListById(req, res, next);

      expect(listService.getListById).toHaveBeenCalledWith(listId, userId);
      expect(logger.info).toHaveBeenCalledWith(`User ID ${userId} is requesting list ID: ${listId}`);
      expect(logger.warn).toHaveBeenCalledWith(`List with ID: ${listId} not found.`);
      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('updateListName', () => {
    it('should update the list name and respond with 200 status', async () => {
      const listId = 'list-id';
      const newTitle = 'Updated Title';
      const updatedList = { _id: listId, title: newTitle };

      req.params.listId = listId;
      req.body.title = newTitle;
      listService.updateListName.mockResolvedValue(updatedList);

      await listController.updateListName(req, res, next);

      expect(listService.updateListName).toHaveBeenCalledWith(listId, newTitle);
      expect(logger.info).toHaveBeenCalledWith(`User ID ${req.user._id} is updating list ID: ${listId} to "${newTitle}"`);
      expect(logger.info).toHaveBeenCalledWith(`List ID: ${listId} successfully updated.`);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ status: 'success', data: updatedList });
    });

    it('should handle errors and pass to next', async () => {
      const listId = 'nonexistentlistid123456789012';
      const newTitle = 'Updated Title';
      const errorMessage = 'List not found.';
      const error = new AppError(errorMessage, 404);

      req.params.listId = listId;
      req.body.title = newTitle;
      listService.updateListName.mockRejectedValue(error);

      await listController.updateListName(req, res, next);

      expect(listService.updateListName).toHaveBeenCalledWith(listId, newTitle);
      expect(logger.info).toHaveBeenCalledWith(`User ID ${req.user._id} is updating list ID: ${listId} to "${newTitle}"`);
      expect(logger.warn).toHaveBeenCalledWith(`List with ID: ${listId} not found for update.`);
      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('deleteList', () => {
    it('should soft delete the list and respond with 204 status', async () => {
      const listId = 'list-id';

      req.params.listId = listId;
      listService.deleteList.mockResolvedValue();

      await listController.deleteList(req, res, next);

      expect(listService.deleteList).toHaveBeenCalledWith(listId);
      expect(logger.info).toHaveBeenCalledWith(`User ID ${req.user._id} is requesting deletion of list ID: ${listId}`);
      expect(logger.info).toHaveBeenCalledWith(`List ID: ${listId} has been successfully deleted.`);
      expect(res.status).toHaveBeenCalledWith(204);
      expect(res.send).toHaveBeenCalled();
    });

    it('should handle errors and pass to next', async () => {
      const listId = 'nonexistentlistid123456789012';
      const errorMessage = 'List not found.';
      const error = new AppError(errorMessage, 404);

      req.params.listId = listId;
      listService.deleteList.mockRejectedValue(error);

      await listController.deleteList(req, res, next);

      expect(listService.deleteList).toHaveBeenCalledWith(listId);
      expect(logger.info).toHaveBeenCalledWith(`User ID ${req.user._id} is requesting deletion of list ID: ${listId}`);
      expect(logger.warn).toHaveBeenCalledWith(`List with ID: ${listId} not found for deletion.`);
      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('restoreDeletedList', () => {
    it('should restore a deleted list and respond with 200 status', async () => {
      const listId = 'list-id';
      const restoredList = { _id: listId, title: 'Restored List', deletedAt: null };

      req.params.listId = listId;
      listService.restoreDeletedList.mockResolvedValue(restoredList);

      await listController.restoreDeletedList(req, res, next);

      expect(listService.restoreDeletedList).toHaveBeenCalledWith(listId);
      expect(logger.info).toHaveBeenCalledWith(`User ID ${req.user._id} is requesting restoration of deleted list ID: ${listId}`);
      expect(logger.info).toHaveBeenCalledWith(`List with ID: ${listId} successfully restored.`);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ status: 'success', data: restoredList });
    });

    it('should handle errors and pass to next', async () => {
      const listId = 'nonexistentlistid123456789012';
      const errorMessage = 'List not found.';
      const error = new AppError(errorMessage, 404);

      req.params.listId = listId;
      listService.restoreDeletedList.mockRejectedValue(error);

      await listController.restoreDeletedList(req, res, next);

      expect(listService.restoreDeletedList).toHaveBeenCalledWith(listId);
      expect(logger.info).toHaveBeenCalledWith(`User ID ${req.user._id} is requesting restoration of deleted list ID: ${listId}`);
      expect(logger.warn).toHaveBeenCalledWith(`List with ID: ${listId} not found for restoration.`);
      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('archiveList', () => {
    it('should archive a list and respond with 200 status', async () => {
      const listId = 'list-id';
      const archivedList = { _id: listId, title: 'Archived List', isArchived: true };

      req.params.listId = listId;
      listService.archiveList.mockResolvedValue(archivedList);

      await listController.archiveList(req, res, next);

      expect(listService.archiveList).toHaveBeenCalledWith(listId);
      expect(logger.info).toHaveBeenCalledWith(`User ID ${req.user._id} is requesting to archive list ID: ${listId}`);
      expect(logger.info).toHaveBeenCalledWith(`List ID: ${listId} successfully archived.`);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ status: 'success', data: archivedList });
    });

    it('should handle errors and pass to next when list not found', async () => {
      const listId = 'nonexistentlistid123456789012';
      const errorMessage = 'List not found.';
      const error = new AppError(errorMessage, 404);

      req.params.listId = listId;
      listService.archiveList.mockRejectedValue(error);

      await listController.archiveList(req, res, next);

      expect(listService.archiveList).toHaveBeenCalledWith(listId);
      expect(logger.info).toHaveBeenCalledWith(`User ID ${req.user._id} is requesting to archive list ID: ${listId}`);
      expect(logger.warn).toHaveBeenCalledWith(`List with ID: ${listId} not found for archiving.`);
      expect(next).toHaveBeenCalledWith(error);
    });

    it('should handle errors and pass to next on other errors', async () => {
      const listId = 'list-id';
      const errorMessage = 'Database error.';
      const error = new AppError(errorMessage, 500);

      req.params.listId = listId;
      listService.archiveList.mockRejectedValue(error);

      await listController.archiveList(req, res, next);

      expect(listService.archiveList).toHaveBeenCalledWith(listId);
      expect(logger.info).toHaveBeenCalledWith(`User ID ${req.user._id} is requesting to archive list ID: ${listId}`);
      expect(logger.error).toHaveBeenCalledWith(`Error archiving list: ${errorMessage}`);
      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('restoreArchivedList', () => {
    it('should restore an archived list and respond with 200 status', async () => {
      const listId = 'list-id';
      const restoredList = { _id: listId, title: 'Restored Archived List', isArchived: false };

      req.params.listId = listId;
      listService.restoreArchivedList.mockResolvedValue(restoredList);

      await listController.restoreArchivedList(req, res, next);

      expect(listService.restoreArchivedList).toHaveBeenCalledWith(listId);
      expect(logger.info).toHaveBeenCalledWith(`User ID ${req.user._id} is requesting to restore archived list ID: ${listId}`);
      expect(logger.info).toHaveBeenCalledWith(`List ID: ${listId} successfully restored from archive.`);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ status: 'success', data: restoredList });
    });

    it('should handle errors and pass to next when list not found', async () => {
      const listId = 'nonexistentlistid123456789012';
      const errorMessage = 'List not found.';
      const error = new AppError(errorMessage, 404);

      req.params.listId = listId;
      listService.restoreArchivedList.mockRejectedValue(error);

      await listController.restoreArchivedList(req, res, next);

      expect(listService.restoreArchivedList).toHaveBeenCalledWith(listId);
      expect(logger.info).toHaveBeenCalledWith(`User ID ${req.user._id} is requesting to restore archived list ID: ${listId}`);
      expect(logger.warn).toHaveBeenCalledWith(`List with ID: ${listId} not found for restoring archive.`);
      expect(next).toHaveBeenCalledWith(error);
    });

    it('should handle errors and pass to next on other errors', async () => {
      const listId = 'list-id';
      const errorMessage = 'Database error.';
      const error = new AppError(errorMessage, 500);

      req.params.listId = listId;
      listService.restoreArchivedList.mockRejectedValue(error);

      await listController.restoreArchivedList(req, res, next);

      expect(listService.restoreArchivedList).toHaveBeenCalledWith(listId);
      expect(logger.info).toHaveBeenCalledWith(`User ID ${req.user._id} is requesting to restore archived list ID: ${listId}`);
      expect(logger.error).toHaveBeenCalledWith(`Error restoring archived list: ${errorMessage}`);
      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('getMembers', () => {
    it('should get members of a list and respond with 200 status', async () => {
      const listId = 'list-id';
      const members = [
        { _id: 'member1', username: 'user1', email: 'user1@example.com', status: 'active' },
        { _id: 'member2', username: 'user2', email: 'user2@example.com', status: 'active' },
      ];

      req.params.listId = listId;
      listService.getMembers.mockResolvedValue(members);

      await listController.getMembers(req, res, next);

      expect(listService.getMembers).toHaveBeenCalledWith(listId);
      expect(logger.info).toHaveBeenCalledWith(`User ID ${req.user._id} is requesting members of list ID: ${listId}`);
      expect(logger.info).toHaveBeenCalledWith(`Successfully retrieved members for list ID: ${listId}`);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ status: 'success', data: members });
    });

    it('should handle errors and pass to next', async () => {
      const listId = 'nonexistentlistid123456789012';
      const errorMessage = 'List not found.';
      const error = new AppError(errorMessage, 404);

      req.params.listId = listId;
      listService.getMembers.mockRejectedValue(error);

      await listController.getMembers(req, res, next);

      expect(listService.getMembers).toHaveBeenCalledWith(listId);
      expect(logger.info).toHaveBeenCalledWith(`User ID ${req.user._id} is requesting members of list ID: ${listId}`);
      expect(logger.error).toHaveBeenCalledWith(`Error fetching members: ${error.message}`);
      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('addMember', () => {
    it('should add a member to a list and respond with 200 status', async () => {
      const listId = 'list-id';
      const username = 'newmember';
      const updatedList = { _id: listId, title: 'Test List', members: ['user1', 'newmember'] };

      req.params.listId = listId;
      req.body.username = username;
      listService.addMember.mockResolvedValue(updatedList);

      await listController.addMember(req, res, next);

      expect(listService.addMember).toHaveBeenCalledWith(listId, username);
      expect(logger.info).toHaveBeenCalledWith(`User ID ${req.user._id} is adding member "${username}" to list ID: ${listId}`);
      expect(logger.info).toHaveBeenCalledWith(`Member "${username}" successfully added to list ID: ${listId}`);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ status: 'success', data: updatedList });
    });

    it('should handle errors and pass to next when user is already a member', async () => {
      const listId = 'list-id';
      const username = 'existingmember';
      const errorMessage = 'User is already a member of the list.';
      const error = new AppError(errorMessage, 400);

      req.params.listId = listId;
      req.body.username = username;
      listService.addMember.mockRejectedValue(error);

      await listController.addMember(req, res, next);

      expect(listService.addMember).toHaveBeenCalledWith(listId, username);
      expect(logger.info).toHaveBeenCalledWith(`User ID ${req.user._id} is adding member "${username}" to list ID: ${listId}`);
      expect(logger.warn).toHaveBeenCalledWith(`User is already a member of list ID: ${listId}.`);
      expect(next).toHaveBeenCalledWith(error);
    });

    it('should handle errors and pass to next when user not found', async () => {
      const listId = 'list-id';
      const username = 'nonexistentuser';
      const errorMessage = 'User not found.';
      const error = new AppError(errorMessage, 404);

      req.params.listId = listId;
      req.body.username = username;
      listService.addMember.mockRejectedValue(error);

      await listController.addMember(req, res, next);

      expect(listService.addMember).toHaveBeenCalledWith(listId, username);
      expect(logger.info).toHaveBeenCalledWith(`User ID ${req.user._id} is adding member "${username}" to list ID: ${listId}`);
      expect(logger.warn).toHaveBeenCalledWith(`User with username: ${username} not found.`);
      expect(next).toHaveBeenCalledWith(error);
    });

    it('should handle errors and pass to next when list not found', async () => {
      const listId = 'nonexistentlistid123456789012';
      const username = 'newmember';
      const errorMessage = 'List not found.';
      const error = new AppError(errorMessage, 404);

      req.params.listId = listId;
      req.body.username = username;
      listService.addMember.mockRejectedValue(error);

      await listController.addMember(req, res, next);

      expect(listService.addMember).toHaveBeenCalledWith(listId, username);
      expect(logger.info).toHaveBeenCalledWith(`User ID ${req.user._id} is adding member "${username}" to list ID: ${listId}`);
      expect(logger.warn).toHaveBeenCalledWith(`List with ID: ${listId} not found.`);
      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('removeMember', () => {
    it('should remove a member from a list and respond with 200 status', async () => {
      const listId = 'list-id';
      const memberId = 'member-id';
      const updatedList = { _id: listId, title: 'Test List', members: ['user1'] };

      req.params.listId = listId;
      req.params.memberId = memberId;
      listService.removeMember.mockResolvedValue(updatedList);

      await listController.removeMember(req, res, next);

      expect(listService.removeMember).toHaveBeenCalledWith(listId, memberId);
      expect(logger.info).toHaveBeenCalledWith(`User ID ${req.user._id} is removing member ID: ${memberId} from list ID: ${listId}`);
      expect(logger.info).toHaveBeenCalledWith(`Member ID: ${memberId} successfully removed from list ID: ${listId}`);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ status: 'success', data: updatedList });
    });

    it('should handle errors and pass to next when user is not a member', async () => {
      const listId = 'list-id';
      const memberId = 'nonmember-id';
      const errorMessage = 'User is not a member of the list.';
      const error = new AppError(errorMessage, 400);

      req.params.listId = listId;
      req.params.memberId = memberId;
      listService.removeMember.mockRejectedValue(error);

      await listController.removeMember(req, res, next);

      expect(listService.removeMember).toHaveBeenCalledWith(listId, memberId);
      expect(logger.info).toHaveBeenCalledWith(`User ID ${req.user._id} is removing member ID: ${memberId} from list ID: ${listId}`);
      expect(logger.warn).toHaveBeenCalledWith(`User ID: ${memberId} is not a member of list ID: ${listId}.`);
      expect(next).toHaveBeenCalledWith(error);
    });

    it('should handle errors and pass to next when list not found', async () => {
      const listId = 'nonexistentlistid123456789012';
      const memberId = 'member-id';
      const errorMessage = 'List not found.';
      const error = new AppError(errorMessage, 404);

      req.params.listId = listId;
      req.params.memberId = memberId;
      listService.removeMember.mockRejectedValue(error);

      await listController.removeMember(req, res, next);

      expect(listService.removeMember).toHaveBeenCalledWith(listId, memberId);
      expect(logger.info).toHaveBeenCalledWith(`User ID ${req.user._id} is removing member ID: ${memberId} from list ID: ${listId}`);
      expect(logger.warn).toHaveBeenCalledWith(`List with ID: ${listId} not found.`);
      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('removeSelf', () => {
    it('should allow a user to remove themselves from a list and respond with 200 status', async () => {
      const listId = 'list-id';
      const userId = req.user._id;
      const updatedList = { _id: listId, title: 'Test List', members: [] };

      req.params.listId = listId;
      listService.removeSelf.mockResolvedValue(updatedList);

      await listController.removeSelf(req, res, next);

      expect(listService.removeSelf).toHaveBeenCalledWith(listId, userId);
      expect(logger.info).toHaveBeenCalledWith(`User ID ${userId} is removing themselves from list ID: ${listId}`);
      expect(logger.info).toHaveBeenCalledWith(`User ID ${userId} successfully removed from list ID: ${listId}`);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ status: 'success', data: updatedList });
    });

    it('should handle errors and pass to next when owner is trying to remove themselves', async () => {
      const listId = 'list-id';
      const userId = req.user._id;
      const errorMessage = 'Owner cannot be removed from the list.';
      const error = new AppError(errorMessage, 400);

      req.params.listId = listId;
      listService.removeSelf.mockRejectedValue(error);

      await listController.removeSelf(req, res, next);

      expect(listService.removeSelf).toHaveBeenCalledWith(listId, userId);
      expect(logger.info).toHaveBeenCalledWith(`User ID ${userId} is removing themselves from list ID: ${listId}`);
      expect(logger.warn).toHaveBeenCalledWith(`Owner cannot be removed from list ID: ${listId}.`);
      expect(next).toHaveBeenCalledWith(error);
    });

    it('should handle errors and pass to next when list not found', async () => {
      const listId = 'nonexistentlistid123456789012';
      const userId = req.user._id;
      const errorMessage = 'List not found.';
      const error = new AppError(errorMessage, 404);

      req.params.listId = listId;
      listService.removeSelf.mockRejectedValue(error);

      await listController.removeSelf(req, res, next);

      expect(listService.removeSelf).toHaveBeenCalledWith(listId, userId);
      expect(logger.info).toHaveBeenCalledWith(`User ID ${userId} is removing themselves from list ID: ${listId}`);
      expect(logger.warn).toHaveBeenCalledWith(`List with ID: ${listId} not found.`);
      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('permanentlyDeleteList', () => {
    it('should permanently delete a list and respond with 204 status', async () => {
      const listId = 'list-id';

      req.params.listId = listId;
      listService.permanentlyDeleteList.mockResolvedValue();

      await listController.permanentlyDeleteList(req, res, next);

      expect(listService.permanentlyDeleteList).toHaveBeenCalledWith(listId);
      expect(logger.info).toHaveBeenCalledWith(`User ID ${req.user._id} is permanently deleting list ID: ${listId}`);
      expect(logger.info).toHaveBeenCalledWith(`List ID: ${listId} has been permanently deleted.`);
      expect(res.status).toHaveBeenCalledWith(204);
      expect(res.send).toHaveBeenCalled();
    });

    it('should handle errors and pass to next when list not found', async () => {
      const listId = 'nonexistentlistid123456789012';
      const errorMessage = 'List not found.';
      const error = new AppError(errorMessage, 404);

      req.params.listId = listId;
      listService.permanentlyDeleteList.mockRejectedValue(error);

      await listController.permanentlyDeleteList(req, res, next);

      expect(listService.permanentlyDeleteList).toHaveBeenCalledWith(listId);
      expect(logger.info).toHaveBeenCalledWith(`User ID ${req.user._id} is permanently deleting list ID: ${listId}`);
      expect(logger.warn).toHaveBeenCalledWith(`List with ID: ${listId} not found for permanent deletion.`);
      expect(next).toHaveBeenCalledWith(error);
    });

    it('should handle errors and pass to next on other errors', async () => {
      const listId = 'list-id';
      const errorMessage = 'Database error.';
      const error = new AppError(errorMessage, 500);

      req.params.listId = listId;
      listService.permanentlyDeleteList.mockRejectedValue(error);

      await listController.permanentlyDeleteList(req, res, next);

      expect(listService.permanentlyDeleteList).toHaveBeenCalledWith(listId);
      expect(logger.info).toHaveBeenCalledWith(`User ID ${req.user._id} is permanently deleting list ID: ${listId}`);
      expect(logger.error).toHaveBeenCalledWith(`Error permanently deleting list: ${errorMessage}`);
      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('getActiveListsItemCounts', () => {
    it('should retrieve active lists item counts and respond with 200 status', async () => {
      const userId = req.user._id;
      const listIds = ['507f1f77bcf86cd799439011', '507f1f77bcf86cd799439012'];
      const counts = [
        { listId: '507f1f77bcf86cd799439011', title: 'List 1', itemCount: 5 },
        { listId: '507f1f77bcf86cd799439012', title: 'List 2', itemCount: 3 },
      ];

      req.body.listIds = listIds;
      listService.getActiveListsItemCounts.mockResolvedValue(counts);

      await listController.getActiveListsItemCounts(req, res, next);

      expect(listService.getActiveListsItemCounts).toHaveBeenCalledWith(userId, listIds);
      expect(logger.info).toHaveBeenCalledWith(`User ID ${userId} is requesting active item counts for lists: ${listIds}`);
      expect(logger.info).toHaveBeenCalledWith(`Successfully retrieved active item counts for lists: ${listIds}`);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ status: 'success', data: counts });
    });

    it('should handle errors and pass to next', async () => {
      const userId = req.user._id;
      const listIds = ['507f1f77bcf86cd799439011', 'invalidid123'];
      const errorMessage = 'Invalid listIds.';
      const error = new AppError(errorMessage, 400);

      req.body.listIds = listIds;
      listService.getActiveListsItemCounts.mockRejectedValue(error);

      await listController.getActiveListsItemCounts(req, res, next);

      expect(listService.getActiveListsItemCounts).toHaveBeenCalledWith(userId, listIds);
      expect(logger.info).toHaveBeenCalledWith(`User ID ${userId} is requesting active item counts for lists: ${listIds}`);
      expect(logger.error).toHaveBeenCalledWith(`Error retrieving item counts: ${error.message}`);
      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('permanentlyDeleteAllDeletedLists', () => {
    it('should permanently delete all deleted lists and respond with 200 status', async () => {
      const userId = req.user._id;
      const deletionResult = { deletedCount: 3 };

      listService.permanentlyDeleteAllDeletedLists.mockResolvedValue(deletionResult);

      await listController.permanentlyDeleteAllDeletedLists(req, res, next);

      expect(listService.permanentlyDeleteAllDeletedLists).toHaveBeenCalledWith(userId);
      expect(logger.info).toHaveBeenCalledWith(`User ID ${userId} is permanently deleting all deleted lists`);
      expect(logger.info).toHaveBeenCalledWith(`Permanently deleted ${deletionResult.deletedCount} lists for user ID: ${userId}`);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ status: 'success', data: deletionResult });
    });

    it('should handle errors and pass to next', async () => {
      const userId = req.user._id;
      const errorMessage = 'Error permanently deleting all deleted lists.';
      const error = new AppError(errorMessage, 500);

      listService.permanentlyDeleteAllDeletedLists.mockRejectedValue(error);

      await listController.permanentlyDeleteAllDeletedLists(req, res, next);

      expect(listService.permanentlyDeleteAllDeletedLists).toHaveBeenCalledWith(userId);
      expect(logger.info).toHaveBeenCalledWith(`User ID ${userId} is permanently deleting all deleted lists`);
      expect(logger.error).toHaveBeenCalledWith(`Error permanently deleting all deleted lists: ${error.message}`);
      expect(next).toHaveBeenCalledWith(error);
    });
  });
});