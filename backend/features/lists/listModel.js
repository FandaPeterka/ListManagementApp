const mongoose = require('mongoose');

const listSchema = new mongoose.Schema(
  {
    ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: {
      type: String,
      required: [true, 'Title is required'],
      minlength: 1,
      maxlength: [255, 'Title must not exceed 255 characters'],
    },
    isArchived: { type: Boolean, default: false },
    members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    items: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Item' }],
    deletedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

listSchema.index({ ownerId: 1 });
listSchema.index({ isArchived: 1 });
listSchema.index({ members: 1 });

const List = mongoose.model('List', listSchema);

module.exports = List;