import { Bell, Check, Clock, AlertCircle, Inbox, Trash2, Ticket } from 'lucide-react';
import { useNotifications } from '../../context/NotificationContext';
import { formatDistanceToNow } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Notifications = () => {
  const { user } = useAuth();
  const { notifications, unreadCount, markRead, markAllRead } = useNotifications();

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-white/5">
        <div>
          <h1 className="font-display text-4xl font-bold text-white tracking-tight mb-2">Notification Center</h1>
          <p className="text-text-muted">Stay updated with your ticket status and SLA alerts.</p>
        </div>
        {notifications && notifications.length > 0 && (
          <button 
            onClick={markAllRead}
            className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 text-text-secondary hover:text-white rounded-xl border border-white/5 transition-all text-[12px] font-bold uppercase tracking-widest font-display"
          >
            <Check className="w-4 h-4" />
            Mark All as Read
          </button>
        )}
      </div>

      <div className="glass-card border border-white/5 overflow-hidden min-h-[400px]">
        <div className="divide-y divide-white/5">
          <AnimatePresence initial={false}>
            {!notifications || notifications.length === 0 ? (
              <motion.div 
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="p-20 text-center"
              >
                <div className="w-20 h-20 bg-white/[0.03] rounded-full flex items-center justify-center mx-auto mb-6">
                  <Inbox className="w-10 h-10 text-text-muted/20" />
                </div>
                <h3 className="text-white font-bold text-[18px] mb-2">All caught up!</h3>
                <p className="text-text-muted max-w-xs mx-auto">You have no new notifications. We'll alert you here when something happens.</p>
              </motion.div>
            ) : (
              notifications.map((n) => {
                // Determine ticket path safely
                const ticketId = n.ticketId?._id || n.ticketId;
                const ticketNumber = n.ticketId?.ticketNumber || 'Ticket';
                
                return (
                  <motion.div
                    key={n._id}
                    layout
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className={`p-6 flex gap-5 hover:bg-white/[0.02] transition-all group border-l-4 ${
                      n.isRead ? 'border-transparent' : 'border-neon-purple bg-neon-purple/[0.02]'
                    }`}
                  >
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-110 ${
                      n.isRead ? 'bg-white/5 text-text-muted' : 'bg-neon-purple/20 text-neon-purple border border-neon-purple/20 shadow-[0_0_15px_rgba(168,85,247,0.1)]'
                    }`}>
                      <AlertCircle className="w-6 h-6" />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 mb-2">
                        <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-text-muted font-display flex items-center gap-2">
                          <Clock className="w-3.5 h-3.5" />
                          {n.createdAt ? formatDistanceToNow(new Date(n.createdAt), { addSuffix: true }) : 'Just now'}
                        </span>
                        {!n.isRead && (
                          <span className="inline-flex items-center px-2 py-0.5 bg-neon-purple/20 text-neon-purple text-[10px] font-bold rounded uppercase tracking-wider border border-neon-purple/30">
                            New Alert
                          </span>
                        )}
                      </div>
                      
                      <p className={`text-[15px] leading-relaxed mb-4 ${n.isRead ? 'text-text-secondary' : 'text-white font-medium'}`}>
                        {n.message}
                      </p>

                      <div className="flex items-center gap-3">
                        {ticketId && (
                          <Link 
                            to={`/${user?.role}/tickets/${ticketId}`}
                            className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white text-[12px] font-bold rounded-lg border border-white/5 transition-all flex items-center gap-2"
                          >
                            <Ticket className="w-3.5 h-3.5 text-neon-cyan" />
                            View {ticketNumber}
                          </Link>
                        )}
                        <button 
                          onClick={() => markRead(n._id)}
                          className="p-2 text-text-muted hover:text-red-400 hover:bg-red-500/5 rounded-lg transition-all"
                          title="Dismiss notification"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                );
              })
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default Notifications;
