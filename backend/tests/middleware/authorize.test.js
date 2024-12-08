// tests/middleware/authorize.test.js

// Mockování závislostí před jejich importem
jest.mock('../../features/lists/listModel');
jest.mock('../../features/items/itemModel');
jest.mock('../../middleware/logger');

const authorize = require('../../middleware/authorize');
const List = require('../../features/lists/listModel');
const Item = require('../../features/items/itemModel');
const { AppError } = require('../../middleware/errorHandler');
const logger = require('../../middleware/logger');

describe('Authorize Middleware', () => {
  let req, res, next;

  beforeEach(() => {
    // Inicializace mockovacích objektů pro každý test
    req = {
      user: { _id: 'user-id' },
      params: {},
    };
    res = {};
    next = jest.fn();
  });

  afterEach(() => {
    // Vyčištění všech mocků po každém testu
    jest.clearAllMocks();
  });

  describe('Accessing a List', () => {
    beforeEach(() => {
      req.params.listId = 'list-id';
    });

    it('should allow access if user is the owner and "owner" role is allowed', async () => {
      // Mockování List.findById().populate(). Resolves to a list where user is owner and member
      const mockList = {
        ownerId: {
          toString: () => 'user-id',
        },
        members: [
          { _id: { toString: () => 'user-id' } },
          { _id: { toString: () => 'member-id' } },
        ],
      };
      const populateMock = jest.fn().mockResolvedValue(mockList);
      List.findById.mockReturnValue({
        populate: populateMock,
      });

      const middleware = authorize('owner');
      await middleware(req, res, next);

      expect(logger.info).toHaveBeenCalledWith('Authorization middleware triggered for user ID: user-id');
      expect(List.findById).toHaveBeenCalledWith('list-id');
      expect(populateMock).toHaveBeenCalledWith('members');
      expect(logger.info).toHaveBeenCalledWith('isOwner: true, isMember: true'); // Očekává, že uživatel je zároveň vlastníkem a členem
      expect(logger.info).toHaveBeenCalledWith('User ID: user-id has owner access.');
      expect(next).toHaveBeenCalledWith();
    });

    it('should allow access if user is a member and "member" role is allowed', async () => {
      // Mockování List.findById().populate(). Resolves to a list where user is a member but not owner
      const mockList = {
        ownerId: {
          toString: () => 'another-user-id',
        },
        members: [
          { _id: { toString: () => 'user-id' } },
          { _id: { toString: () => 'member-id' } },
        ],
      };
      const populateMock = jest.fn().mockResolvedValue(mockList);
      List.findById.mockReturnValue({
        populate: populateMock,
      });

      const middleware = authorize('member');
      await middleware(req, res, next);

      expect(logger.info).toHaveBeenCalledWith('Authorization middleware triggered for user ID: user-id');
      expect(List.findById).toHaveBeenCalledWith('list-id');
      expect(populateMock).toHaveBeenCalledWith('members');
      expect(logger.info).toHaveBeenCalledWith('isOwner: false, isMember: true');
      expect(logger.info).toHaveBeenCalledWith('User ID: user-id has member access.');
      expect(next).toHaveBeenCalledWith();
    });

    it('should deny access if user is neither owner nor member', async () => {
      // Mockování List.findById().populate(). Resolves to a list where user is neither owner nor member
      const mockList = {
        ownerId: {
          toString: () => 'another-user-id',
        },
        members: [
          { _id: { toString: () => 'member-id' } },
        ],
      };
      const populateMock = jest.fn().mockResolvedValue(mockList);
      List.findById.mockReturnValue({
        populate: populateMock,
      });

      const middleware = authorize('owner', 'member');
      await middleware(req, res, next);

      expect(logger.info).toHaveBeenCalledWith('Authorization middleware triggered for user ID: user-id');
      expect(List.findById).toHaveBeenCalledWith('list-id');
      expect(populateMock).toHaveBeenCalledWith('members');
      expect(logger.info).toHaveBeenCalledWith('isOwner: false, isMember: false');
      expect(logger.warn).toHaveBeenCalledWith('User ID user-id does not have permission for this action.');
      expect(next).toHaveBeenCalledWith(new AppError('You do not have permission to perform this action.', 403));
    });

    it('should throw AppError if List is not found', async () => {
      // Mockování List.findById().populate(). Resolves to null
      const populateMock = jest.fn().mockResolvedValue(null);
      List.findById.mockReturnValue({
        populate: populateMock,
      });

      const middleware = authorize('owner', 'member');
      await middleware(req, res, next);

      expect(logger.info).toHaveBeenCalledWith('Authorization middleware triggered for user ID: user-id');
      expect(List.findById).toHaveBeenCalledWith('list-id');
      expect(populateMock).toHaveBeenCalledWith('members');
      expect(logger.warn).toHaveBeenCalledWith('List with ID: list-id not found.');
      expect(next).toHaveBeenCalledWith(new AppError('List not found.', 404));
    });
  });

  describe('Accessing an Item', () => {
    beforeEach(() => {
      req.params.itemId = 'item-id';
    });

    it('should allow access if user is the owner of the list and "owner" role is allowed', async () => {
      // Mock Item.findById().populate(). Resolves to an item whose list's owner is the user and user is also a member
      const mockList = {
        ownerId: {
          toString: () => 'user-id',
        },
        members: [
          { _id: { toString: () => 'user-id' } },
          { _id: { toString: () => 'member-id' } },
        ],
      };
      const mockItem = {
        listId: mockList,
      };
      const populateMock = jest.fn().mockResolvedValue(mockItem);
      Item.findById.mockReturnValue({
        populate: jest.fn().mockResolvedValue(mockItem),
      });

      const middleware = authorize('owner');
      await middleware(req, res, next);

      expect(logger.info).toHaveBeenCalledWith('Authorization middleware triggered for user ID: user-id');
      expect(Item.findById).toHaveBeenCalledWith('item-id');
      expect(logger.info).toHaveBeenCalledWith('isOwner: true, isMember: true'); // Očekává, že uživatel je zároveň vlastníkem a členem
      expect(logger.info).toHaveBeenCalledWith('User ID: user-id has owner access.');
      expect(next).toHaveBeenCalledWith();
    });

    it('should allow access if user is a member of the list and "member" role is allowed', async () => {
      // Mock Item.findById().populate(). Resolves to an item whose list's owner is another user and user is a member
      const mockList = {
        ownerId: {
          toString: () => 'another-user-id',
        },
        members: [
          { _id: { toString: () => 'user-id' } },
          { _id: { toString: () => 'member-id' } },
        ],
      };
      const mockItem = {
        listId: mockList,
      };
      const populateMock = jest.fn().mockResolvedValue(mockItem);
      Item.findById.mockReturnValue({
        populate: jest.fn().mockResolvedValue(mockItem),
      });

      const middleware = authorize('member');
      await middleware(req, res, next);

      expect(logger.info).toHaveBeenCalledWith('Authorization middleware triggered for user ID: user-id');
      expect(Item.findById).toHaveBeenCalledWith('item-id');
      expect(logger.info).toHaveBeenCalledWith('isOwner: false, isMember: true');
      expect(logger.info).toHaveBeenCalledWith('User ID: user-id has member access.');
      expect(next).toHaveBeenCalledWith();
    });

    it('should deny access if user is neither owner nor member of the list', async () => {
      // Mock Item.findById().populate(). Resolves to an item whose list's owner is another user and user is not a member
      const mockList = {
        ownerId: {
          toString: () => 'another-user-id',
        },
        members: [
          { _id: { toString: () => 'member-id' } },
        ],
      };
      const mockItem = {
        listId: mockList,
      };
      const populateMock = jest.fn().mockResolvedValue(mockItem);
      Item.findById.mockReturnValue({
        populate: jest.fn().mockResolvedValue(mockItem),
      });

      const middleware = authorize('owner', 'member');
      await middleware(req, res, next);

      expect(logger.info).toHaveBeenCalledWith('Authorization middleware triggered for user ID: user-id');
      expect(Item.findById).toHaveBeenCalledWith('item-id');
      expect(logger.info).toHaveBeenCalledWith('isOwner: false, isMember: false');
      expect(logger.warn).toHaveBeenCalledWith('User ID user-id does not have permission for this action.');
      expect(next).toHaveBeenCalledWith(new AppError('You do not have permission to perform this action.', 403));
    });

    it('should throw AppError if Item is not found', async () => {
      // Mock Item.findById().populate(). Resolves to null
      const populateMock = jest.fn().mockResolvedValue(null);
      Item.findById.mockReturnValue({
        populate: jest.fn().mockResolvedValue(null),
      });

      const middleware = authorize('owner', 'member');
      await middleware(req, res, next);

      expect(logger.info).toHaveBeenCalledWith('Authorization middleware triggered for user ID: user-id');
      expect(Item.findById).toHaveBeenCalledWith('item-id');
      expect(logger.warn).toHaveBeenCalledWith('Item with ID: item-id not found.');
      expect(next).toHaveBeenCalledWith(new AppError('Item not found.', 404));
    });
  });

  describe('Invalid Resource Identifier', () => {
    it('should throw AppError if no resource identifier is present', async () => {
      // Middleware without listId nor itemId
      const middleware = authorize('owner', 'member');
      await middleware(req, res, next);

      expect(logger.info).toHaveBeenCalledWith('Authorization middleware triggered for user ID: user-id');
      expect(logger.warn).toHaveBeenCalledWith('No valid resource identifier found in request parameters.');
      expect(next).toHaveBeenCalledWith(new AppError('Invalid resource identifier.', 400));
    });
  });

  describe('Error Handling', () => {
    it('should handle unexpected errors and pass them to next', async () => {
      req.params.listId = 'list-id';
      const mockError = new Error('Database failure');
      List.findById.mockReturnValue({
        populate: jest.fn().mockRejectedValue(mockError),
      });

      const middleware = authorize('owner', 'member');
      await middleware(req, res, next);

      // Verify that error was logged and passed to next
      expect(logger.info).toHaveBeenCalledWith('Authorization middleware triggered for user ID: user-id');
      expect(List.findById).toHaveBeenCalledWith('list-id');
      expect(logger.error).toHaveBeenCalledWith(`Authorization error: ${mockError.message}`);
      expect(next).toHaveBeenCalledWith(mockError);
    });
  });
});