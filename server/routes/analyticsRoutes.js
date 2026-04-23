const express = require('express');
const router = express.Router();
const { getAdminOverview } = require('../controllers/analyticsController');
const { protect } = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/roleMiddleware');

router.get('/admin-overview', protect, requireRole('admin'), getAdminOverview);

module.exports = router;
