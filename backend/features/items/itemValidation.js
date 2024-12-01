const Joi = require('joi');

const addItemSchema = Joi.object({
  itemText: Joi.string().min(1).max(500).required().messages({
    'string.empty': 'Item text must not be empty.',
    'string.min': 'Item text must contain at least 1 character.',
    'string.max': 'Item text must not exceed 500 characters.',
    'any.required': 'Item text is required.',
  }),
});

const markItemResolvedSchema = Joi.object({
  isResolved: Joi.boolean().required().messages({
    'any.required': 'The field isResolved is required.',
    'boolean.base': 'The field isResolved must be a boolean.',
  }),
});

module.exports = {
  addItemSchema,
  markItemResolvedSchema,
};