const express = require('express');
const { getDomain, addRule, updateRule, deleteRule } = require('../controllers/domainController');
const { protect } = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/roleMiddleware');

const router = express.Router();

router.get('/', protect, requireRole('admin'), getDomain);
router.post('/rules', protect, requireRole('admin'), addRule);
router.put('/rules/:ruleId', protect, requireRole('admin'), updateRule);
router.delete('/rules/:ruleId', protect, requireRole('admin'), deleteRule);

module.exports = router;
