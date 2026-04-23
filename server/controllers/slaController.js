const SLAPolicy = require('../models/SLAPolicy');
const Ticket = require('../models/Ticket');
const { success, error } = require('../utils/apiResponse');

const DEFAULT_SLA_POLICIES = [
  { priority: 'critical', resolutionTimeMin: 60, escalateAfterMin: 45 },
  { priority: 'high', resolutionTimeMin: 240, escalateAfterMin: 180 },
  { priority: 'medium', resolutionTimeMin: 1440, escalateAfterMin: 1200 },
  { priority: 'low', resolutionTimeMin: 4320, escalateAfterMin: 3600 },
];

// @desc    Get all SLA policies for tenant (auto-seeds if missing)
// @route   GET /api/sla/policies
const getPolicies = async (req, res) => {
  try {
    let policies = await SLAPolicy.find({
      tenantId: req.user.tenantId,
      domain: req.user.domain,
    }).sort({ resolutionTimeMin: 1 });

    // Auto-seed defaults if none exist for this tenant
    if (policies.length === 0) {
      const toInsert = DEFAULT_SLA_POLICIES.map((p) => ({
        tenantId: req.user.tenantId,
        domain: req.user.domain,
        ...p,
      }));
      await SLAPolicy.insertMany(toInsert, { ordered: false }).catch(() => {});
      policies = await SLAPolicy.find({
        tenantId: req.user.tenantId,
        domain: req.user.domain,
      }).sort({ resolutionTimeMin: 1 });
    }

    return success(res, policies);
  } catch (err) {
    return error(res, 'Server error', 500);
  }
};

// @desc    Create SLA policy
// @route   POST /api/sla/policies
const createPolicy = async (req, res) => {
  try {
    const { domain, priority, resolutionTimeMin, escalateAfterMin } = req.body;
    const policy = await SLAPolicy.create({
      tenantId: req.user.tenantId,
      domain: domain || req.user.domain,
      priority,
      resolutionTimeMin,
      escalateAfterMin,
    });
    return success(res, policy, 'SLA policy created', 201);
  } catch (err) {
    if (err.code === 11000) return error(res, 'Policy already exists for this priority/domain', 400);
    return error(res, 'Server error', 500);
  }
};

// @desc    Update SLA policy
// @route   PUT /api/sla/policies/:id
const updatePolicy = async (req, res) => {
  try {
    const { resolutionTimeMin, escalateAfterMin } = req.body;
    const policy = await SLAPolicy.findOneAndUpdate(
      { _id: req.params.id, tenantId: req.user.tenantId },
      { resolutionTimeMin, escalateAfterMin },
      { new: true, runValidators: true }
    );
    if (!policy) return error(res, 'Policy not found', 404);
    return success(res, policy, 'SLA policy updated');
  } catch (err) {
    return error(res, 'Server error', 500);
  }
};

// @desc    Get SLA performance reports
// @route   GET /api/sla/reports
const getReports = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const filter = { tenantId: req.user.tenantId };

    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) filter.createdAt.$lte = new Date(endDate);
    }

    const [total, breached, resolved] = await Promise.all([
      Ticket.countDocuments(filter),
      Ticket.countDocuments({ ...filter, slaBreached: true }),
      Ticket.countDocuments({ ...filter, status: { $in: ['resolved', 'closed'] }, slaBreached: false }),
    ]);

    // Breach by priority
    const breachByPriorityRaw = await Ticket.aggregate([
      { $match: { ...filter, slaBreached: true } },
      { $group: { _id: '$finalPriority', count: { $sum: 1 } } },
    ]);

    const breachByPriority = { critical: 0, high: 0, medium: 0, low: 0 };
    breachByPriorityRaw.forEach((b) => {
      breachByPriority[b._id] = b.count;
    });

    return success(res, {
      totalTickets: total,
      resolvedOnTime: resolved,
      slaBreached: breached,
      breachRate: total > 0 ? Number(((breached / total) * 100).toFixed(1)) : 0,
      breachByPriority,
    });
  } catch (err) {
    console.error('getReports error:', err.message);
    return error(res, 'Server error', 500);
  }
};

module.exports = { getPolicies, createPolicy, updatePolicy, getReports };
