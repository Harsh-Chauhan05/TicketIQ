const express = require('express');
const { body } = require('express-validator');
const {
  createTicket, getTickets, getTicket,
  updateStatus, overridePriority, assignTicket,
  addComment, addNote, getSlaBreached, getSlaAtRisk, getSlaOnTrack, searchTickets,
} = require('../controllers/ticketController');
const { protect } = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/roleMiddleware');
const upload = require('../middleware/uploadMiddleware');

const router = express.Router();

// SLA endpoints must come BEFORE /:id to avoid route conflict
router.get('/sla/breached', protect, requireRole('agent', 'admin'), getSlaBreached);
router.get('/sla/atrisk', protect, requireRole('agent', 'admin'), getSlaAtRisk);
router.get('/sla/ontrack', protect, requireRole('agent', 'admin'), getSlaOnTrack);
router.get('/search', protect, searchTickets);

router.post('/', protect, requireRole('customer'), upload.array('attachments', 5), [
  body('title').trim().notEmpty().withMessage('Title is required').isLength({ max: 200 }),
  body('description').trim().notEmpty().withMessage('Description is required').isLength({ max: 2000 }),
  body('userPriority').isIn(['critical', 'high', 'medium', 'low']).withMessage('Invalid priority'),
], createTicket);

router.get('/', protect, getTickets);
router.get('/:id', protect, getTicket);
router.patch('/:id/status', protect, requireRole('agent', 'admin'), updateStatus);
router.patch('/:id/priority', protect, requireRole('admin'), overridePriority);
router.patch('/:id/assign', protect, requireRole('agent', 'admin'), assignTicket);
router.post('/:id/comment', protect, upload.array('attachments', 5), addComment);
router.post('/:id/note', protect, requireRole('agent', 'admin'), addNote);

module.exports = router;
