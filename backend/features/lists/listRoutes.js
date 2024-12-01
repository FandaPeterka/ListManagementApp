const express = require('express');
const {
  createListSchema,
  updateListSchema,
  addMemberSchema,
  getListsSchema,
  getActiveListsItemCountsSchema,
} = require('./listValidation');
const {
  createList,
  getLists,
  getListById,
  updateListName,
  deleteList,
  restoreDeletedList,
  permanentlyDeleteList,
  archiveList,
  restoreArchivedList,
  addMember,
  removeMember,
  removeSelf,
  getMembers,
  getActiveListsItemCounts,
  permanentlyDeleteAllDeletedLists,
} = require('./listController');
const validate = require('../../middleware/validate');
const validateObjectId = require('../../middleware/validateObjectId');
const authorize = require('../../middleware/authorize');
const requireAuth = require('../../middleware/requireAuth');

const itemRoutes = require('../items/itemRoutes');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Lists
 *   description: API endpoints for list management
 */

// Middleware to verify authentication for all routes
router.use(requireAuth);

/**
 * @swagger
 * /lists:
 *   get:
 *     summary: Retrieve lists with optional filtering
 *     tags: [Lists]
 *     description: Get a list of all lists accessible to the user, with options to filter by type, page, and limit.
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [all, active, archived, deleted]
 *         description: Type of lists to retrieve
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Number of lists per page
 *     responses:
 *       200:
 *         description: Lists retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: './listSchemas.yaml#/ListsResponse'
 *       401:
 *         description: Unauthorized, authentication required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: './listSchemas.yaml#/ErrorResponse'
 */
router.get('/', validate(getListsSchema, 'query'), getLists);

/**
 * @swagger
 * /lists:
 *   post:
 *     summary: Create a new list
 *     tags: [Lists]
 *     description: Create a new list with a specified title.
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       description: List creation data
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: './listSchemas.yaml#/CreateList'
 *     responses:
 *       201:
 *         description: List created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: './listSchemas.yaml#/ListResponse'
 *       400:
 *         description: Bad request, possibly due to validation errors
 *         content:
 *           application/json:
 *             schema:
 *               $ref: './listSchemas.yaml#/ErrorResponse'
 *       401:
 *         description: Unauthorized, authentication required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: './listSchemas.yaml#/ErrorResponse'
 */
router.post('/', validate(createListSchema), createList);

/**
 * @swagger
 * /lists/activeLists/items-counts:
 *   post:
 *     summary: Get item counts for active lists
 *     tags: [Lists]
 *     description: Retrieve the counts of items in the user's active lists.
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       description: List IDs to get item counts for
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: './listSchemas.yaml#/GetActiveListsItemCounts'
 *     responses:
 *       200:
 *         description: Item counts retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: './listSchemas.yaml#/ActiveListsItemCountsResponse'
 *       400:
 *         description: Bad request, possibly due to validation errors
 *         content:
 *           application/json:
 *             schema:
 *               $ref: './listSchemas.yaml#/ErrorResponse'
 *       401:
 *         description: Unauthorized, authentication required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: './listSchemas.yaml#/ErrorResponse'
 */
router.post('/activeLists/items-counts', validate(getActiveListsItemCountsSchema), getActiveListsItemCounts);

/**
 * @swagger
 * /lists/deleted/all:
 *   delete:
 *     summary: Permanently delete all deleted lists
 *     tags: [Lists]
 *     description: Permanently remove all lists that have been soft-deleted by the user.
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: All deleted lists permanently removed
 *         content:
 *           application/json:
 *             schema:
 *               $ref: './listSchemas.yaml#/DeleteAllDeletedListsResponse'
 *       401:
 *         description: Unauthorized, authentication required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: './listSchemas.yaml#/ErrorResponse'
 */
router.delete('/deleted/all', permanentlyDeleteAllDeletedLists);

/**
 * @swagger
 * /lists/{listId}:
 *   get:
 *     summary: Get details of a specific list
 *     tags: [Lists]
 *     description: Retrieve detailed information about a specific list by its ID.
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: listId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the list to retrieve
 *     responses:
 *       200:
 *         description: List details retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: './listSchemas.yaml#/ListResponse'
 *       404:
 *         description: List not found or access denied
 *         content:
 *           application/json:
 *             schema:
 *               $ref: './listSchemas.yaml#/ErrorResponse'
 *       401:
 *         description: Unauthorized, authentication required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: './listSchemas.yaml#/ErrorResponse'
 */
router.get('/:listId', authorize('owner', 'member'), getListById);

/**
 * @swagger
 * /lists/{listId}/updateName:
 *   patch:
 *     summary: Update the name of a list
 *     tags: [Lists]
 *     description: Change the title of a specific list.
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: listId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the list to update
 *     requestBody:
 *       description: New title for the list
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: './listSchemas.yaml#/UpdateList'
 *     responses:
 *       200:
 *         description: List name updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: './listSchemas.yaml#/ListResponse'
 *       400:
 *         description: Bad request, possibly due to validation errors
 *         content:
 *           application/json:
 *             schema:
 *               $ref: './listSchemas.yaml#/ErrorResponse'
 *       404:
 *         description: List not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: './listSchemas.yaml#/ErrorResponse'
 *       401:
 *         description: Unauthorized, authentication required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: './listSchemas.yaml#/ErrorResponse'
 */
router.patch('/:listId/updateName', validate(updateListSchema), authorize('owner'), updateListName);

/**
 * @swagger
 * /lists/{listId}/delete:
 *   delete:
 *     summary: Soft delete a list
 *     tags: [Lists]
 *     description: Soft delete a list, marking it as deleted without permanently removing it.
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: listId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the list to delete
 *     responses:
 *       204:
 *         description: List soft-deleted successfully
 *       404:
 *         description: List not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: './listSchemas.yaml#/ErrorResponse'
 *       401:
 *         description: Unauthorized, authentication required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: './listSchemas.yaml#/ErrorResponse'
 */
router.delete('/:listId/delete', authorize('owner'), deleteList);

/**
 * @swagger
 * /lists/{listId}/archive:
 *   patch:
 *     summary: Archive a list
 *     tags: [Lists]
 *     description: Archive a list, making it read-only.
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: listId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the list to archive
 *     responses:
 *       200:
 *         description: List archived successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: './listSchemas.yaml#/ListResponse'
 *       404:
 *         description: List not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: './listSchemas.yaml#/ErrorResponse'
 *       401:
 *         description: Unauthorized, authentication required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: './listSchemas.yaml#/ErrorResponse'
 */
router.patch('/:listId/archive', authorize('owner'), archiveList);

/**
 * @swagger
 * /lists/{listId}/restore:
 *   patch:
 *     summary: Restore an archived list
 *     tags: [Lists]
 *     description: Restore a previously archived list to active status.
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: listId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the list to restore
 *     responses:
 *       200:
 *         description: List restored successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: './listSchemas.yaml#/ListResponse'
 *       404:
 *         description: List not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: './listSchemas.yaml#/ErrorResponse'
 *       401:
 *         description: Unauthorized, authentication required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: './listSchemas.yaml#/ErrorResponse'
 */
router.patch('/:listId/restore', authorize('owner'), restoreArchivedList);

/**
 * @swagger
 * /lists/{listId}/restoreDeleted:
 *   patch:
 *     summary: Restore a soft-deleted list
 *     tags: [Lists]
 *     description: Restore a list that was previously soft-deleted.
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: listId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the list to restore
 *     responses:
 *       200:
 *         description: List restored successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: './listSchemas.yaml#/ListResponse'
 *       404:
 *         description: List not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: './listSchemas.yaml#/ErrorResponse'
 *       401:
 *         description: Unauthorized, authentication required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: './listSchemas.yaml#/ErrorResponse'
 */
router.patch('/:listId/restoreDeleted', authorize('owner'), restoreDeletedList);

/**
 * @swagger
 * /lists/{listId}/members:
 *   get:
 *     summary: Get members of a list
 *     tags: [Lists]
 *     description: Retrieve all members associated with a specific list.
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: listId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the list
 *     responses:
 *       200:
 *         description: Members retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: './listSchemas.yaml#/MembersResponse'
 *       404:
 *         description: List not found or access denied
 *         content:
 *           application/json:
 *             schema:
 *               $ref: './listSchemas.yaml#/ErrorResponse'
 *       401:
 *         description: Unauthorized, authentication required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: './listSchemas.yaml#/ErrorResponse'
 */
router.get('/:listId/members', authorize('owner', 'member'), getMembers);

/**
 * @swagger
 * /lists/{listId}/members:
 *   post:
 *     summary: Add a member to a list
 *     tags: [Lists]
 *     description: Invite a user to join a list by their username.
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: listId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the list
 *     requestBody:
 *       description: Username of the member to add
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: './listSchemas.yaml#/AddMember'
 *     responses:
 *       200:
 *         description: Member added successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: './listSchemas.yaml#/ListResponse'
 *       400:
 *         description: Bad request, possibly due to user not found or already a member
 *         content:
 *           application/json:
 *             schema:
 *               $ref: './listSchemas.yaml#/ErrorResponse'
 *       404:
 *         description: List not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: './listSchemas.yaml#/ErrorResponse'
 *       401:
 *         description: Unauthorized, authentication required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: './listSchemas.yaml#/ErrorResponse'
 */
router.post('/:listId/members', validate(addMemberSchema), authorize('owner'), addMember);

/**
 * @swagger
 * /lists/{listId}/members/{memberId}/remove:
 *   delete:
 *     summary: Remove a member from a list
 *     tags: [Lists]
 *     description: Remove a member from a list by their user ID.
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: listId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the list
 *       - in: path
 *         name: memberId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the member to remove
 *     responses:
 *       200:
 *         description: Member removed successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: './listSchemas.yaml#/ListResponse'
 *       404:
 *         description: List or member not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: './listSchemas.yaml#/ErrorResponse'
 *       400:
 *         description: Bad request, possibly due to member not being part of the list
 *         content:
 *           application/json:
 *             schema:
 *               $ref: './listSchemas.yaml#/ErrorResponse'
 *       401:
 *         description: Unauthorized, authentication required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: './listSchemas.yaml#/ErrorResponse'
 */
router.delete('/:listId/members/:memberId/remove', validateObjectId('memberId'), authorize('owner'), removeMember);

/**
 * @swagger
 * /lists/{listId}/members/removeSelf:
 *   delete:
 *     summary: Remove yourself from a list
 *     tags: [Lists]
 *     description: Leave a list that you are a member of.
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: listId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the list
 *     responses:
 *       200:
 *         description: Successfully left the list
 *         content:
 *           application/json:
 *             schema:
 *               $ref: './listSchemas.yaml#/ListResponse'
 *       404:
 *         description: List not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: './listSchemas.yaml#/ErrorResponse'
 *       400:
 *         description: Bad request, possibly due to not being a member of the list
 *         content:
 *           application/json:
 *             schema:
 *               $ref: './listSchemas.yaml#/ErrorResponse'
 *       401:
 *         description: Unauthorized, authentication required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: './listSchemas.yaml#/ErrorResponse'
 */
router.delete('/:listId/members/removeSelf', authorize('member'), removeSelf);

/**
 * @swagger
 * /lists/{listId}/permanent:
 *   delete:
 *     summary: Permanently delete a list
 *     tags: [Lists]
 *     description: Permanently remove a list and all its items from the database.
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: listId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the list to delete
 *     responses:
 *       204:
 *         description: List permanently deleted
 *       404:
 *         description: List not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: './listSchemas.yaml#/ErrorResponse'
 *       401:
 *         description: Unauthorized, authentication required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: './listSchemas.yaml#/ErrorResponse'
 */
router.delete('/:listId/permanent', authorize('owner'), permanentlyDeleteList);

// Mount itemRoutes for routes /lists/:listId/items
router.use('/:listId/items', authorize('owner', 'member'), itemRoutes);

module.exports = router;