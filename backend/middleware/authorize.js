const List = require('../features/lists/listModel');
const Item = require('../features/items/itemModel');
const { AppError } = require('./errorHandler');
const logger = require('./logger');

/**
 * Authorization middleware to check user roles.
 * @param  {...string} allowedRoles - Roles that are allowed to access the resource.
 * @returns {Function} - Express middleware function.
 */
const authorize = (...allowedRoles) => {
  return async (req, res, next) => {
    try {
      const userId = req.user._id.toString();
      logger.info(`Authorization middleware triggered for user ID: ${userId}`);

      let resource;
      let resourceOwnerId;
      let resourceMembers = [];

      // Determine the resource based on route parameters
      if (req.params.listId) {
        resource = await List.findById(req.params.listId).populate('members');
        if (!resource) {
          logger.warn(`List with ID: ${req.params.listId} not found.`);
          throw new AppError('List not found.', 404);
        }
        resourceOwnerId = resource.ownerId.toString();
        resourceMembers = resource.members.map(member => member._id.toString());
      } else if (req.params.itemId) {
        resource = await Item.findById(req.params.itemId).populate({
          path: 'listId',
          populate: { path: 'members' },
        });
        if (!resource) {
          logger.warn(`Item with ID: ${req.params.itemId} not found.`);
          throw new AppError('Item not found.', 404);
        }
        resourceOwnerId = resource.listId.ownerId.toString();
        resourceMembers = resource.listId.members.map(member => member._id.toString());
      } else {
        logger.warn('No valid resource identifier found in request parameters.');
        throw new AppError('Invalid resource identifier.', 400);
      }

      // Check if user is the owner or a member
      const isOwner = resourceOwnerId === userId;
      const isMember = resourceMembers.includes(userId);

      logger.info(`isOwner: ${isOwner}, isMember: ${isMember}`);

      if (isOwner && allowedRoles.includes('owner')) {
        logger.info(`User ID: ${userId} has owner access.`);
        return next();
      }

      if (isMember && allowedRoles.includes('member')) {
        logger.info(`User ID: ${userId} has member access.`);
        return next();
      }

      logger.warn(`User ID ${userId} does not have permission for this action.`);
      return next(new AppError('You do not have permission to perform this action.', 403));
    } catch (error) {
      logger.error(`Authorization error: ${error.message}`);
      return next(error);
    }
  };
};

module.exports = authorize;