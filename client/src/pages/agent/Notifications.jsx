import { motion, AnimatePresence } from 'framer-motion';
import { useNotifications } from '../../context/NotificationContext';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';
import { Bell, Check, Trash2, ShieldAlert, Zap, Activity, MessageCircle, Clock, ExternalLink } from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';

const Notifications = () => {
  const { user } = useAuth();
  const { notifications, unreadCount, markAllRead, markRead } = useNotifications();

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between pb-6 border-b border-white/5 gap-4">
        <div>
          <h1 className="font-display text-4xl font-bold text-white tracking-tight mb-2">Notification Center</h1>
          <p className="text-text-muted text-lg">Manage your recent activity and system alerts.</p>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={markAllRead}
            className="btn-secondary px-5 py-2.5 text-[13px] flex items-center gap-2"
          >
            <Check className="w-4 h-4" />
            Mark all as read
          </button>
        )}
      </div>

      {/* Notification List */}
      <div className="glass-card border border-white/5 overflow-hidden">
        <div className="p-4 bg-white/[0.02] border-b border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-2 text-[12px] font-bold uppercase tracking-widest text-text-muted">
            <Bell className="w-4 h-4" />
            Active Alerts ({unreadCount})
          </div>
        </div>

        <div className="divide-y divide-white/5">
          <AnimatePresence initial={false}>
            {notifications.length === 0 ? (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="p-20 text-center space-y-4"
              >
                <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-4">
                  <Bell className="w-8 h-8 text-white/20" />
                </div>
                <h3 className="text-white font-bold">You're all caught up!</h3>
                <p className="text-text-muted text-[14px]">No new notifications to display right now.</p>
              </motion.div>
            ) : (
              notifications.map((n, i) => {
                const Icon = n.type === 'sla_breach' ? ShieldAlert : 
                            n.type === 'ticket_assigned' ? Zap : 
                            n.type === 'status_update' ? Activity : MessageCircle;
                
                const iconColor = n.type === 'sla_breach' ? 'text-red-500 bg-red-500/10' : 
                                 n.type === 'ticket_assigned' ? 'text-neon-cyan bg-neon-cyan/10' : 
                                 n.type === 'status_update' ? 'text-neon-purple bg-neon-purple/10' : 'text-blue-400 bg-blue-400/10';

                return (
                  <motion.div
                    key={n._id}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ delay: i * 0.05 }}
                    className="group p-6 hover:bg-white/[0.02] transition-colors relative flex gap-6"
                  >
                    {/* Icon Column */}
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 ${iconColor}`}>
                      <Icon className="w-6 h-6" />
                    </div>

                    {/* Content Column */}
                    <div className="flex-1 space-y-2">
                      <div className="flex justify-between items-start">
                        <div className="space-y-1">
                          <p className="text-[15px] text-white leading-relaxed font-medium">
                            {n.message}
                          </p>
                          <div className="flex items-center gap-4 text-[12px] text-text-muted font-display uppercase tracking-wider">
                            <span className="flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5" />
                              {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
                            </span>
                            <span className="text-white/10">•</span>
                            <span>{format(new Date(n.createdAt), 'MMM d, h:mm a')}</span>
                          </div>
                        </div>
                        <button 
                          onClick={() => markRead(n._id)}
                          className="p-2 text-text-muted hover:text-white hover:bg-white/5 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                          title="Mark as Read"
                        >
                          <Check className="w-5 h-5" />
                        </button>
                      </div>

                      <div className="flex gap-3 pt-2">
                        <Link 
                          to={`/${user?.role}/tickets/${n.ticketId?._id}`}
                          onClick={() => markRead(n._id)}
                          className="flex items-center gap-2 px-4 py-1.5 bg-white/5 border border-white/10 rounded-lg text-[12px] font-bold text-white hover:bg-neon-cyan/20 hover:border-neon-cyan/50 hover:text-neon-cyan transition-all"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          View Ticket {n.ticketId?.ticketNumber}
                        </Link>
                      </div>
                    </div>
                  </motion.div>
                );
              })
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Info Panel */}
      <div className="p-6 bg-neon-purple/5 border border-neon-purple/20 rounded-2xl flex items-start gap-4">
        <div className="w-10 h-10 rounded-xl bg-neon-purple/10 flex items-center justify-center flex-shrink-0">
          <Activity className="w-5 h-5 text-neon-purple" />
        </div>
        <div>
          <h4 className="text-[14px] font-bold text-white mb-1">Stay Notified</h4>
          <p className="text-[13px] text-text-secondary leading-relaxed">
            The notification center keeps you updated on SLA breaches, new ticket assignments, and customer replies. 
            Once you read a notification, it is removed from your active list to keep your workspace clean.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Notifications;
