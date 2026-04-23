const mongoose = require('mongoose');
const Ticket = require('../models/Ticket');
const User = require('../models/User');
const { success, error } = require('../utils/apiResponse');

// @desc    Get admin analytics overview
// @route   GET /api/analytics/admin-overview
const getAdminOverview = async (req, res) => {
  try {
    // Ensure tenantId is an ObjectId for aggregation matching
    const tenantId = new mongoose.Types.ObjectId(req.user.tenantId);

    // 1. Ticket Trends (Last 7 days - with zero padding)
    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      last7Days.push(d.toISOString().split('T')[0]);
    }

    const trendsRaw = await Ticket.aggregate([
      { 
        $match: { 
          tenantId, 
          createdAt: { $gte: new Date(new Date().setDate(new Date().getDate() - 7)) } 
        } 
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          count: { $sum: 1 }
        }
      }
    ]);

    const trendMap = Object.fromEntries(trendsRaw.map(t => [t._id, t.count]));
    const trends = last7Days.map(date => ({
      _id: date,
      count: trendMap[date] || 0
    }));

    // 2. Priority Distribution
    const priorities = await Ticket.aggregate([
      { $match: { tenantId } },
      {
        $group: {
          _id: "$finalPriority",
          count: { $sum: 1 }
        }
      }
    ]);

    // 3. Status Distribution
    const statuses = await Ticket.aggregate([
      { $match: { tenantId } },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 }
        }
      }
    ]);

    // 4. Domain Distribution
    const domains = await Ticket.aggregate([
      { $match: { tenantId } },
      {
        $group: {
          _id: "$domain",
          count: { $sum: 1 }
        }
      }
    ]);

    // 5. Agent Performance
    const agentStats = await Ticket.aggregate([
      { 
        $match: { 
          tenantId, 
          status: { $in: ['resolved', 'closed'] }, 
          assignedTo: { $ne: null } 
        } 
      },
      {
        $group: {
          _id: "$assignedTo",
          resolvedCount: { $sum: 1 }
        }
      },
      { $sort: { resolvedCount: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'agent'
        }
      },
      { $unwind: { path: '$agent', preserveNullAndEmptyArrays: true } },
      {
        $project: {
          name: { $ifNull: ['$agent.name', 'Unknown Agent'] },
          count: '$resolvedCount'
        }
      }
    ]);

    return success(res, {
      trends,
      priorities: priorities.length ? priorities : [],
      statuses: statuses.length ? statuses : [],
      domains: domains.length ? domains : [],
      agentStats: agentStats.length ? agentStats : []
    });
  } catch (err) {
    console.error('getAdminOverview error:', err);
    return error(res, 'Server error fetching analytics', 500);
  }
};

module.exports = {
  getAdminOverview
};
