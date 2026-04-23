const express = require('express');
const { getPolicies, createPolicy, updatePolicy, getReports } = require('../controllers/slaController');
const { protect } = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/roleMiddleware');

const router = express.Router();

router.get('/policies', protect, requireRole('admin'), getPolicies);
router.post('/policies', protect, requireRole('admin'), createPolicy);
router.put('/policies/:id', protect, requireRole('admin'), updatePolicy);
router.get('/reports', protect, requireRole('admin'), getReports);

module.exports = router;
