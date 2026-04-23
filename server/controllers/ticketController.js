const { validationResult } = require('express-validator');
const Ticket = require('../models/Ticket');
const Domain = require('../models/Domain');
const SLAPolicy = require('../models/SLAPolicy');
const Notification = require('../models/Notification');
const { assignPriority } = require('../services/priorityEngine');
const { success, error, validationError } = require('../utils/apiResponse');
const { emitToTenant, emitToUser } = require('../utils/socket');
const { sendEmail, templates } = require('../utils/emailService');
const User = require('../models/User'); // Need to fetch recipient details

const PRIORITY_RANK = { critical: 4, high: 3, medium: 2, low: 1 };
const PRIORITY_ORDER = ['critical', 'high', 'medium', 'low'];

// Generate unique ticket number: TKT-00001 (Improved for reliability)
const generateTicketNumber = async (tenantId) => {
  const lastTicket = await Ticket.findOne({ tenantId }).sort({ createdAt: -1 });
  let nextNumber = 1;
  
  if (lastTicket && lastTicket.ticketNumber) {
    const lastNum = parseInt(lastTicket.ticketNumber.split('-')[1]);
    if (!isNaN(lastNum)) {
      nextNumber = lastNum + 1;
    }
  }
  
  return `TKT-${String(nextNumber).padStart(5, '0')}`;
};

// @desc    Create a new ticket (Customer only)
// @route   POST /api/tickets
const createTicket = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return validationError(res, errors.array().map(e => ({ field: e.path, message: e.msg })));
    }

    const { title, description, category, userPriority } = req.body;
    const { tenantId, domain, _id: createdBy } = req.user;

    // Run priority engine
    let domainDoc = await Domain.findOne({ tenantId, name: domain });
    
    // Self-healing: If no domain config exists for this tenant, create it with defaults
    if (!domainDoc) {
      console.log(`🔍 Self-healing: Domain config missing for tenant ${tenantId}, domain: ${domain}`);
      const { DEFAULT_RULES, DEFAULT_SLA_POLICIES } = require('./authController');
      
      domainDoc = await Domain.create({
        tenantId,
        name: domain,
        rules: DEFAULT_RULES[domain] || []
      });

      // Also seed SLA policies for this new tenant
      const slaPolicies = DEFAULT_SLA_POLICIES.map(p => ({
        tenantId,
        domain,
        ...p,
      }));
      await SLAPolicy.insertMany(slaPolicies, { ordered: false }).catch(() => {});
      console.log(`✅ Self-healed: Provisioned domain and SLA defaults for tenant ${tenantId}`);
    }

    const { systemPriority, finalPriority, priorityScore } = await assignPriority(
      { title, description, domain, userPriority },
      tenantId
    );
    console.log(`🤖 AI Decision: ${systemPriority} -> Final: ${finalPriority} (Score: ${priorityScore})`);

    // Get SLA policy for finalPriority
    const slaPolicy = await SLAPolicy.findOne({ tenantId, domain, priority: finalPriority });
    const resolutionMins = slaPolicy ? slaPolicy.resolutionTimeMin : 1440; // default 24h
    const slaDeadline = new Date(Date.now() + resolutionMins * 60 * 1000);

    // Generate ticket number
    const ticketNumber = await generateTicketNumber(tenantId);

    // Process attachments if any
    console.log('📁 Request Files:', req.files?.map(f => f.originalname));
    const attachments = req.files ? req.files.map(f => ({
      filename: f.originalname,
      url: f.path, // Cloudinary URL
      mimetype: f.mimetype,
      size: f.size
    })) : [];

    const ticket = await Ticket.create({
      tenantId,
      ticketNumber,
      title,
      description,
      category,
      domain,
      userPriority,
      systemPriority,
      finalPriority,
      priorityScore,
      slaDeadline,
      createdBy,
      status: 'open',
      attachments
    });

    // Real-time: Notify all agents in tenant of new ticket
    emitToTenant(tenantId, 'new_ticket', ticket);

    // Email: Notify customer
    try {
      const emailContent = templates.ticketCreated(req.user.name, ticket._id.toString(), ticket.title, ticket.finalPriority);
      await sendEmail({ to: req.user.email, ...emailContent });
    } catch (e) {
      console.error('Email failed on ticket creation:', e.message);
    }

    return success(res, ticket, 'Ticket created successfully', 201);
  } catch (err) {
    console.error('createTicket error:', err.message);
    return error(res, 'Server error', 500);
  }
};

// @desc    Get tickets (role-filtered)
// @route   GET /api/tickets
const getTickets = async (req, res) => {
  try {
    const { status, priority, domain, page = 1, limit = 20 } = req.query;
    const { tenantId, _id: userId, role } = req.user;

    const filter = { tenantId };

    // Role-based filtering
    if (role === 'customer') {
      filter.createdBy = userId;
    } else if (role === 'agent') {
      filter.$or = [{ assignedTo: userId }, { domain: req.user.domain }];
    }
    // admin sees all

    if (status) filter.status = status;
    if (priority) filter.finalPriority = priority;
    if (domain && role === 'admin') filter.domain = domain;

    const skip = (Number(page) - 1) * Number(limit);
    const total = await Ticket.countDocuments(filter);

    // Sort by priority descending (critical first)
    const prioritySortMap = { critical: 0, high: 1, medium: 2, low: 3 };
    const tickets = await Ticket.find(filter)
      .populate('createdBy', 'name email')
      .populate('assignedTo', 'name email')
      .sort({ finalPriority: 1, createdAt: -1 }) // MongoDB sorts strings, handled below
      .skip(skip)
      .limit(Number(limit))
      .lean();

    // Sort by priority rank manually
    tickets.sort((a, b) =>
      (PRIORITY_RANK[b.finalPriority] || 0) - (PRIORITY_RANK[a.finalPriority] || 0)
    );

    return success(res, {
      tickets,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
    });
  } catch (err) {
    console.error('getTickets error:', err.message);
    return error(res, 'Server error', 500);
  }
};

// @desc    Get single ticket
// @route   GET /api/tickets/:id
const getTicket = async (req, res) => {
  try {
    const ticket = await Ticket.findOne({
      _id: req.params.id,
      tenantId: req.user.tenantId,
    })
      .populate('createdBy', 'name email role')
      .populate('assignedTo', 'name email role')
      .populate('comments.author', 'name role')
      .populate('internalNotes.author', 'name role');

    if (!ticket) return error(res, 'Ticket not found', 404);

    // Customers can only see their own tickets
    if (
      req.user.role === 'customer' &&
      ticket.createdBy._id.toString() !== req.user._id.toString()
    ) {
      return error(res, 'Access denied', 403);
    }

    return success(res, ticket);
  } catch (err) {
    console.error('getTicket error:', err.message);
    return error(res, 'Server error', 500);
  }
};

// @desc    Update ticket status
// @route   PATCH /api/tickets/:id/status
const updateStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['open', 'in_progress', 'resolved', 'closed'];
    if (!validStatuses.includes(status)) {
      return error(res, 'Invalid status value', 400);
    }

    const ticket = await Ticket.findOne({ _id: req.params.id, tenantId: req.user.tenantId });
    if (!ticket) return error(res, 'Ticket not found', 404);

    ticket.status = status;
    await ticket.save();

    // Notify ticket creator of status update
    await Notification.create({
      tenantId: ticket.tenantId,
      userId: ticket.createdBy,
      type: 'status_update',
      ticketId: ticket._id,
      message: `Your ticket ${ticket.ticketNumber} status updated to: ${status.replace('_', ' ')}`,
    });

    // Real-time updates
    emitToTenant(ticket.tenantId, 'ticket_updated', { _id: ticket._id, status: ticket.status });
    emitToUser(ticket.createdBy, 'notification_new', { message: `Ticket ${ticket.ticketNumber} status: ${status}` });

    return success(res, ticket, `Ticket status updated to ${status}`);
  } catch (err) {
    console.error('updateStatus error:', err.message);
    return error(res, 'Server error', 500);
  }
};

// @desc    Override ticket priority (admin only)
// @route   PATCH /api/tickets/:id/priority
const overridePriority = async (req, res) => {
  try {
    const { priority, reason } = req.body;
    const validPriorities = ['critical', 'high', 'medium', 'low'];
    if (!validPriorities.includes(priority)) {
      return error(res, 'Invalid priority value', 400);
    }

    const ticket = await Ticket.findOne({ _id: req.params.id, tenantId: req.user.tenantId });
    if (!ticket) return error(res, 'Ticket not found', 404);

    ticket.finalPriority = priority;
    ticket.internalNotes.push({
      author: req.user._id,
      note: `[ADMIN OVERRIDE] Priority changed to ${priority.toUpperCase()}. Reason: ${reason || 'Not specified'}`,
    });
    await ticket.save();

    // Real-time updates
    emitToTenant(ticket.tenantId, 'ticket_updated', { _id: ticket._id, finalPriority: priority });

    return success(res, ticket, 'Priority overridden successfully');
  } catch (err) {
    console.error('overridePriority error:', err.message);
    return error(res, 'Server error', 500);
  }
};

// @desc    Assign ticket to agent (admin only)
// @route   PATCH /api/tickets/:id/assign
const assignTicket = async (req, res) => {
  try {
    const { agentId } = req.body;
    const ticket = await Ticket.findOne({ _id: req.params.id, tenantId: req.user.tenantId });
    if (!ticket) return error(res, 'Ticket not found', 404);

    ticket.assignedTo = agentId;
    await ticket.save();

    // Notify agent
    await Notification.create({
      tenantId: ticket.tenantId,
      userId: agentId,
      type: 'ticket_assigned',
      ticketId: ticket._id,
      message: `New ticket assigned to you: ${ticket.ticketNumber} [${ticket.finalPriority.toUpperCase()}]`,
    });

    // Real-time updates
    emitToTenant(ticket.tenantId, 'ticket_updated', { _id: ticket._id, assignedTo: agentId });
    emitToUser(agentId, 'notification_new', { message: `Ticket ${ticket.ticketNumber} assigned to you` });

    return success(res, ticket, 'Ticket assigned successfully');
  } catch (err) {
    console.error('assignTicket error:', err.message);
    return error(res, 'Server error', 500);
  }
};

// @desc    Add public comment
// @route   POST /api/tickets/:id/comment
const addComment = async (req, res) => {
  try {
    let { message } = req.body;
    if (typeof message !== 'string') message = message ? String(message) : '';

    const ticket = await Ticket.findOne({ _id: req.params.id, tenantId: req.user.tenantId });
    if (!ticket) return error(res, 'Ticket not found', 404);

    // Process attachments
    const attachments = req.files ? req.files.map(f => ({
      filename: f.originalname,
      url: f.path, // Cloudinary URL
      mimetype: f.mimetype,
      size: f.size
    })) : [];

    if (!message.trim() && attachments.length === 0) {
      return error(res, 'Comment or attachment required', 400);
    }

    ticket.comments.push({ 
      author: req.user._id, 
      message: message.trim() || (attachments.length > 0 ? '[Attachment]' : ''),
      attachments
    });
    await ticket.save();

    // Notify real-time
    emitToTenant(ticket.tenantId, 'ticket_updated', { _id: ticket._id });

    const populated = await Ticket.findById(ticket._id).populate('comments.author', 'name role');
    return success(res, populated.comments, 'Comment added');
  } catch (err) {
    console.error('addComment error:', err.message);
    return error(res, 'Server error', 500);
  }
};

// @desc    Add internal note (agent/admin only)
// @route   POST /api/tickets/:id/note
const addNote = async (req, res) => {
  try {
    const { note } = req.body;
    if (!note?.trim()) return error(res, 'Note content is required', 400);

    const ticket = await Ticket.findOne({ _id: req.params.id, tenantId: req.user.tenantId });
    if (!ticket) return error(res, 'Ticket not found', 404);

    ticket.internalNotes.push({ author: req.user._id, note: note.trim() });
    await ticket.save();

    return success(res, ticket.internalNotes, 'Note added');
  } catch (err) {
    console.error('addNote error:', err.message);
    return error(res, 'Server error', 500);
  }
};

// @desc    Get SLA breached tickets
// @route   GET /api/tickets/sla/breached
const getSlaBreached = async (req, res) => {
  try {
    const filter = { tenantId: req.user.tenantId, slaBreached: true };
    if (req.user.role === 'agent') {
      filter.$or = [{ assignedTo: req.user._id }, { domain: req.user.domain }];
    }
    const tickets = await Ticket.find(filter)
      .populate('createdBy', 'name')
      .populate('assignedTo', 'name')
      .sort({ slaDeadline: 1 });
    return success(res, tickets);
  } catch (err) {
    return error(res, 'Server error', 500);
  }
};

// @desc    Get SLA at-risk tickets (deadline within 30 mins)
// @route   GET /api/tickets/sla/atrisk
const getSlaAtRisk = async (req, res) => {
  try {
    const now = new Date();
    const thirtyMinsLater = new Date(now.getTime() + 30 * 60 * 1000);

    const filter = {
      tenantId: req.user.tenantId,
      slaBreached: false,
      slaDeadline: { $gt: now, $lt: thirtyMinsLater },
      status: { $in: ['open', 'in_progress'] },
    };
    if (req.user.role === 'agent') {
      filter.$or = [{ assignedTo: req.user._id }, { domain: req.user.domain }];
    }
    const tickets = await Ticket.find(filter)
      .populate('createdBy', 'name')
      .populate('assignedTo', 'name')
      .sort({ slaDeadline: 1 });
    return success(res, tickets);
  } catch (err) {
    return error(res, 'Server error', 500);
  }
};

// @desc    Get SLA on-track tickets
// @route   GET /api/tickets/sla/ontrack
const getSlaOnTrack = async (req, res) => {
  try {
    const now = new Date();
    const thirtyMinsLater = new Date(now.getTime() + 30 * 60 * 1000);

    const filter = {
      tenantId: req.user.tenantId,
      slaBreached: false,
      slaDeadline: { $gte: thirtyMinsLater },
      status: { $in: ['open', 'in_progress'] },
    };
    if (req.user.role === 'agent') {
      filter.$or = [{ assignedTo: req.user._id }, { domain: req.user.domain }];
    }
    const tickets = await Ticket.find(filter)
      .populate('createdBy', 'name')
      .populate('assignedTo', 'name')
      .sort({ slaDeadline: 1 });
    return success(res, tickets);
  } catch (err) {
    return error(res, 'Server error', 500);
  }
};

// @desc    Search tickets
// @route   GET /api/tickets/search
const searchTickets = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q || q.length < 2) return success(res, []);

    const filter = { tenantId: req.user.tenantId };
    
    if (req.user.role === 'customer') {
      filter.createdBy = req.user._id;
    }

    // Smart search: prioritize ticket ID if it starts with TKT
    let searchConditions = [];
    if (q.toUpperCase().startsWith('TKT')) {
      searchConditions.push({ ticketNumber: { $regex: q, $options: 'i' } });
    } else {
      searchConditions.push({ title: { $regex: q, $options: 'i' } });
      searchConditions.push({ ticketNumber: { $regex: q, $options: 'i' } });
      // Only use $text if it's likely a word search
      if (q.length > 3) searchConditions.push({ $text: { $search: q } });
    }

    const tickets = await Ticket.find({
      ...filter,
      $or: searchConditions
    })
    .select('ticketNumber title status finalPriority createdAt priorityScore')
    .limit(10)
    .sort({ createdAt: -1 });

    return success(res, tickets);
  } catch (err) {
    console.error('searchTickets error:', err.message);
    return error(res, 'Server error', 500);
  }
};

module.exports = { 
  createTicket, getTickets, getTicket, 
  updateStatus, overridePriority, assignTicket, 
  addComment, addNote, getSlaBreached, 
  getSlaAtRisk, getSlaOnTrack, searchTickets 
};
