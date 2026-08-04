// backend/utils/notificationHelpers.js
const Notification = require('../models/Notification');

const createNotification = async (userId, title, message, type, link = null, relatedId = null) => {
  try {
    const notification = new Notification({
      user: userId,
      title,
      message,
      type,
      link,
      relatedId
    });
    await notification.save();
    return notification;
  } catch (error) {
    console.error('Failed to create notification:', error);
    return null;
  }
};

// Example usage when complaint status changes
const notifyComplaintStatusChange = async (complaint) => {
  await createNotification(
    complaint.submittedBy,
    `Complaint Status Update: ${complaint.status}`,
    `Your complaint "${complaint.subject}" is now ${complaint.status}`,
    'complaint',
    `/complaints/${complaint._id}`,
    complaint._id
  );
};

// Example usage when repair is completed
const notifyRepairCompleted = async (repair) => {
  await createNotification(
    repair.user || repair.submittedBy,
    'Repair Completed',
    `Your repair for ${repair.deviceModel} is ready for pickup`,
    'repair',
    `/repairs/${repair._id}`,
    repair._id
  );
};

module.exports = { createNotification, notifyComplaintStatusChange, notifyRepairCompleted };