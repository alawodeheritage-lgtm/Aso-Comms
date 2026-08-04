// backend/models/user.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const passportLocalMongoose = require('passport-local-mongoose');

const UserSchema = new Schema({
  email: {
    type: String,
    required: true,
    unique: true
  },
  role: {
    type: String,
    enum: ['customer', 'manager', 'ceo'],
    default: 'customer'
  },
  phoneNumber: String,
  status: {
    type: String,
    enum: ['Active', 'Guest', 'Pending', 'Customer'],
    default: 'Guest'
  },

  // OTP fields for email verification
  otpCode: {
    type: String,
    default: null
  },
  otpExpires: {
    type: Date,
    default: null
  },
  isVerified: {
    type: Boolean,
    default: false
  }
});

// This plugin automatically handles usernames, passwords, hashes, and salts!
UserSchema.plugin(passportLocalMongoose.default || passportLocalMongoose, {
  usernameQueryFields: ['email']
});

module.exports = mongoose.model('User', UserSchema);