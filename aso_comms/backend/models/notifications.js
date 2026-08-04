// backend/models/Notification.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const notificationSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['complaint', 'repair', 'payment', 'system'],
    required: true
  },
  icon: {
    type: String,
    default: 'notifications'
  },
  color: {
    type: String,
    default: 'bg-blue-50 text-blue-600'
  },
  read: {
    type: Boolean,
    default: false
  },
  readAt: Date,
  link: String, // Optional: link to related page
  relatedId: String, // ID of related complaint/repair/payment
}, { timestamps: true });

module.exports = mongoose.model('Notification', notificationSchema);