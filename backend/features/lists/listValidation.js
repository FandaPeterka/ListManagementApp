const Joi = require('joi');

const createListSchema = Joi.object({
  title: Joi.string().trim().min(1).max(255).required().messages({
    'string.empty': 'List title must not be empty.',
    'string.min': 'List title must contain at least 1 character.',
    'string.max': 'List title must not exceed 255 characters.',
    'any.required': 'List title is required.',
  }),
});

const updateListSchema = Joi.object({
  title: Joi.string().trim().min(1).max(255).optional().messages({
    'string.empty': 'List title must not be empty.',
    'string.min': 'List title must contain at least 1 character.',
    'string.max': 'List title must not exceed 255 characters.',
  }),
});

const addMemberSchema = Joi.object({
  username: Joi.string().trim().required().messages({
    'string.empty': 'Username must not be empty.',
    'any.required': 'Username is required.',
  }),
});

const getListsSchema = Joi.object({
  type: Joi.string().valid('all', 'active', 'archived', 'deleted').optional(),
  page: Joi.number().integer().min(1).optional(),
  limit: Joi.number().integer().min(1).max(100).optional(),
});

const getActiveListsItemCountsSchema = Joi.object({
  listIds: Joi.array()
    .items(
      Joi.string().hex().length(24).messages({
        'string.base': 'All IDs in listIds must be valid ObjectId.',
        'string.hex': 'All IDs in listIds must be valid ObjectId.',
        'string.length': 'All IDs in listIds must be valid ObjectId.',
      })
    )
    .min(1)
    .required()
    .messages({
      'array.base': 'listIds must be an array.',
      'array.min': 'The listIds array must contain at least one ID.',
      'any.required': 'The listIds field is required.',
    }),
});

module.exports = {
  createListSchema,
  updateListSchema,
  addMemberSchema,
  getListsSchema,
  getActiveListsItemCountsSchema,
};