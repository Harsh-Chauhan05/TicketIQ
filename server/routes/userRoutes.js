const express = require('express');
const { getUsers, getUser, updateUser, toggleActive, deleteUser } = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/roleMiddleware');

const router = express.Router();

router.get('/', protect, requireRole('admin'), getUsers);
router.get('/:id', protect, requireRole('admin'), getUser);
router.patch('/:id', protect, requireRole('admin'), updateUser);
router.patch('/:id/toggle', protect, requireRole('admin'), toggleActive);
router.delete('/:id', protect, requireRole('admin'), deleteUser);

module.exports = router;
