const express = require('express');
const {
  addItemToList,
  getItems,
  markItemResolved,
  deleteItemFromList,
} = require('./itemController');

const validate = require('../../middleware/validate');
const validateObjectId = require('../../middleware/validateObjectId');
const { addItemSchema, markItemResolvedSchema } = require('./itemValidation');
const authorize = require('../../middleware/authorize');

const router = express.Router({ mergeParams: true });

/**
 * @swagger
 * tags:
 *   name: Items
 *   description: API endpoints for item management
 */

/**
 * @swagger
 * /lists/{listId}/items:
 *   post:
 *     summary: Add an item to a list
 *     tags: [Items]
 *     description: Create a new item and add it to the specified list.
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: listId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the list to add the item to
 *     requestBody:
 *       description: Item data to add
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: './itemSchemas.yaml#/AddItem'
 *     responses:
 *       201:
 *         description: Item added successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: './itemSchemas.yaml#/ItemResponse'
 *       400:
 *         description: Bad request, possibly due to validation errors
 *         content:
 *           application/json:
 *             schema:
 *               $ref: './itemSchemas.yaml#/ErrorResponse'
 *       404:
 *         description: List not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: './itemSchemas.yaml#/ErrorResponse'
 *       401:
 *         description: Unauthorized, authentication required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: './itemSchemas.yaml#/ErrorResponse'
 */
router.post('/', validate(addItemSchema), addItemToList);

/**
 * @swagger
 * /lists/{listId}/items:
 *   get:
 *     summary: Get items from a list
 *     tags: [Items]
 *     description: Retrieve all items from a specified list, with optional filtering by status.
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: listId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the list to retrieve items from
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [resolved, unresolved]
 *         description: Filter items by status
 *     responses:
 *       200:
 *         description: Items retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: './itemSchemas.yaml#/ItemsResponse'
 *       404:
 *         description: List not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: './itemSchemas.yaml#/ErrorResponse'
 *       401:
 *         description: Unauthorized, authentication required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: './itemSchemas.yaml#/ErrorResponse'
 */
router.get('/', getItems);

/**
 * @swagger
 * /lists/{listId}/items/{itemId}:
 *   patch:
 *     summary: Update an item's resolved status
 *     tags: [Items]
 *     description: Mark an item as resolved or unresolved.
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: listId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the list containing the item
 *       - in: path
 *         name: itemId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the item to update
 *     requestBody:
 *       description: New resolved status for the item
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: './itemSchemas.yaml#/MarkItemResolved'
 *     responses:
 *       200:
 *         description: Item updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: './itemSchemas.yaml#/ItemResponse'
 *       400:
 *         description: Bad request, possibly due to validation errors
 *         content:
 *           application/json:
 *             schema:
 *               $ref: './itemSchemas.yaml#/ErrorResponse'
 *       404:
 *         description: Item or list not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: './itemSchemas.yaml#/ErrorResponse'
 *       401:
 *         description: Unauthorized, authentication required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: './itemSchemas.yaml#/ErrorResponse'
 */
router.patch('/:itemId', validate(markItemResolvedSchema), markItemResolved);

/**
 * @swagger
 * /lists/{listId}/items/{itemId}:
 *   delete:
 *     summary: Delete an item from a list
 *     tags: [Items]
 *     description: Remove an item from the specified list.
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: listId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the list containing the item
 *       - in: path
 *         name: itemId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the item to delete
 *     responses:
 *       204:
 *         description: Item deleted successfully
 *       404:
 *         description: Item or list not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: './itemSchemas.yaml#/ErrorResponse'
 *       401:
 *         description: Unauthorized, authentication required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: './itemSchemas.yaml#/ErrorResponse'
 */
router.delete('/:itemId', deleteItemFromList);

module.exports = router;