const Notification = require('../models/Notification');
const { success, error } = require('../utils/apiResponse');

// @desc    Get notifications for current user
// @route   GET /api/notifications
const getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ userId: req.user._id })
      .populate('ticketId', 'ticketNumber title finalPriority')
      .sort({ createdAt: -1 })
      .limit(50);

    const unreadCount = await Notification.countDocuments({
      userId: req.user._id,
      isRead: false,
    });

    return success(res, { notifications, unreadCount });
  } catch (err) {
    return error(res, 'Server error', 500);
  }
};

// @desc    Mark all notifications as read
// @route   PATCH /api/notifications/read-all
const markAllRead = async (req, res) => {
  try {
    await Notification.updateMany(
      { userId: req.user._id, isRead: false },
      { $set: { isRead: true } }
    );
    return success(res, null, 'All notifications marked as read');
  } catch (err) {
    return error(res, 'Server error', 500);
  }
};

// @desc    Mark single notification as read
// @route   PATCH /api/notifications/:id/read
const markRead = async (req, res) => {
  try {
    await Notification.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { isRead: true }
    );
    return success(res, null, 'Notification marked as read');
  } catch (err) {
    return error(res, 'Server error', 500);
  }
};

module.exports = { getNotifications, markAllRead, markRead };
