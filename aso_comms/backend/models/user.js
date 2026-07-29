// models/user.js
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
    enum: ['Active', 'Guest'],
    default: 'Guest'
  },

  // 👇 INTEGRATED HERE: Added fields for OTP storage and expiration
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
  },
  status: { 
        type: String, 
        default: 'Guest',
        enum: ['Guest', 'Pending', 'Active', 'Customer'] // 👈 Make sure 'Pending' and 'Active' are here!
    }
});

// This plugin automatically handles usernames, passwords, hashes, and salts!
UserSchema.plugin(passportLocalMongoose.default || passportLocalMongoose, { 
    usernameQueryFields: ['email'] 
});

module.exports = mongoose.model('User', UserSchema);