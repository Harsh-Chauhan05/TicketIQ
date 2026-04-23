const cron = require('node-cron');
const Ticket = require('../models/Ticket');
const Notification = require('../models/Notification');

/**
 * SLA Monitor — runs every 60 seconds
 * Detects tickets past their SLA deadline and flags them as breached.
 */
const startSLAMonitor = () => {
  cron.schedule('* * * * *', async () => {
    try {
      const now = new Date();

      // Find tickets that are overdue and not yet flagged
      const overdueTickets = await Ticket.find({
        status: { $in: ['open', 'in_progress'] },
        slaDeadline: { $lt: now },
        slaBreached: false,
      }).select('_id ticketNumber tenantId assignedTo finalPriority');

      if (overdueTickets.length === 0) return;

      const ticketIds = overdueTickets.map((t) => t._id);

      // Bulk update: flag all as breached
      await Ticket.updateMany(
        { _id: { $in: ticketIds } },
        { $set: { slaBreached: true } }
      );

      // Create a notification for each breached ticket's assigned agent
      const notifications = overdueTickets
        .filter((t) => t.assignedTo) // only if agent is assigned
        .map((t) => ({
          tenantId: t.tenantId,
          userId: t.assignedTo,
          type: 'sla_breach',
          ticketId: t._id,
          message: `⚠ SLA breached for ticket ${t.ticketNumber} [${t.finalPriority.toUpperCase()}]`,
          isRead: false,
        }));

      if (notifications.length > 0) {
        await Notification.insertMany(notifications, { ordered: false });
        
        // Email Alert: Notify assigned agents
        const { sendEmail, templates } = require('../utils/emailService');
        const User = require('../models/User');
        
        for (const t of overdueTickets) {
          if (t.assignedTo) {
            const agent = await User.findById(t.assignedTo);
            if (agent) {
              const emailContent = templates.slaWarning(t._id.toString(), `Ticket ${t.ticketNumber} is Breached`, '0m (Expired)');
              await sendEmail({ to: agent.email, ...emailContent });
            }
          }
        }
      }

      console.log(`🕐 SLA Monitor: ${overdueTickets.length} ticket(s) flagged as breached`);
    } catch (err) {
      console.error('SLA Monitor error:', err.message);
    }
  });

  console.log('✅ SLA Monitor started — checking every 60 seconds');
};

module.exports = { startSLAMonitor };
