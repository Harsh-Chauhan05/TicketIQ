const express = require('express');
const { body } = require('express-validator');
const { register, login, getMe, logout, updateMe, verifyEmail } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

const registerValidation = [
  body('name').trim().notEmpty().withMessage('Name is required').isLength({ max: 100 }),
  body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
  body('role').isIn(['customer', 'agent', 'admin']).withMessage('Invalid role'),
  body('domain').isIn(['banking', 'ecommerce', 'healthcare', 'edtech']).withMessage('Invalid domain'),
];

const loginValidation = [
  body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required'),
];

router.post('/register', registerValidation, register);
router.post('/login', loginValidation, login);
router.post('/verify-email', verifyEmail);
router.get('/me', protect, getMe);
router.patch('/me', protect, updateMe);
router.post('/logout', protect, logout);

module.exports = router;
