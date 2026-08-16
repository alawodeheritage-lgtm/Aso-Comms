// backend/routes/notifications.js
const express = require('express');
const router = express.Router();
const Notification = require('../models/Notification');
const catchAsync = require('../utils/catchAsync');
const { isLoggedIn } = require('../middleware');

// GET /notifications - Get user's notifications
router.get('/', isLoggedIn, catchAsync(async (req, res) => {
  const notifications = await Notification.find({ user: req.user._id })
    .sort({ createdAt: -1 });

  res.json({
    notifications,
    unreadCount: notifications.filter(n => !n.read).length
  });
}));

// GET /notifications/unread-count - Get unread count
router.get('/unread-count', isLoggedIn, catchAsync(async (req, res) => {
  const count = await Notification.countDocuments({
    user: req.user._id,
    read: false
  });
  res.json({ count });
}));

// PATCH /notifications/:id/read - Mark as read
router.patch('/:id/read', isLoggedIn, catchAsync(async (req, res) => {
  const notification = await Notification.findOneAndUpdate(
    { _id: req.params.id, user: req.user._id },
    { read: true, readAt: new Date() },
    { new: true }
  );

  if (!notification) {
    return res.status(404).json({ error: 'Notification not found' });
  }

  res.json({ notification });
}));

// PATCH /notifications/mark-all-read - Mark all as read
router.patch('/mark-all-read', isLoggedIn, catchAsync(async (req, res) => {
  await Notification.updateMany(
    { user: req.user._id, read: false },
    { read: true, readAt: new Date() }
  );

  res.json({ success: true, message: 'All notifications marked as read' });
}));

// DELETE /notifications/:id - Delete a notification
router.delete('/:id', isLoggedIn, catchAsync(async (req, res) => {
  const notification = await Notification.findOneAndDelete({
    _id: req.params.id,
    user: req.user._id
  });

  if (!notification) {
    return res.status(404).json({ error: 'Notification not found' });
  }

  res.json({ success: true });
}));

module.exports = router;