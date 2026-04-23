const express = require('express');
const { getNotifications, markAllRead, markRead } = require('../controllers/notificationController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/', protect, getNotifications);
router.patch('/read-all', protect, markAllRead);
router.patch('/:id/read', protect, markRead);

module.exports = router;
