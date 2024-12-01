const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: [true, 'Please enter an email address.'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    username: {
      type: String,
      required: [true, 'Please enter a username.'],
      unique: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, 'Please enter a password.'],
      minlength: 6,
      select: false,
    },
    profilePicture: {
      type: String,
      default: null,
    },
    bio: {
      type: String,
      maxlength: 500,
      default: '',
    },
    status: {
      type: String,
      enum: ['focusing', 'idle', 'busy'],
      default: 'idle',
    },
  },
  { timestamps: true }
);

const User = mongoose.model('User', userSchema);

module.exports = User;