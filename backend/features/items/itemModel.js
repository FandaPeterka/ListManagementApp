const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema(
  {
    itemText: { type: String, required: true, minlength: 1, maxlength: 500 },
    isResolved: { type: Boolean, default: false },
    listId: { type: mongoose.Schema.Types.ObjectId, ref: 'List', required: true },
  },
  { timestamps: true }
);

itemSchema.index({ listId: 1 });
itemSchema.index({ isResolved: 1 });

const Item = mongoose.model('Item', itemSchema);
module.exports = Item;