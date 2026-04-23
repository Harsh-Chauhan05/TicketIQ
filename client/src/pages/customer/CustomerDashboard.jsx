import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ticketAPI } from '../../api/tickets';
import { Ticket as TicketIcon, Clock, AlertCircle, CheckCircle2, ChevronRight, Plus } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

const StatusBadge = ({ status }) => {
  const styles = {
    open: 'bg-neon-cyan/10 text-neon-cyan border-neon-cyan/20',
    in_progress: 'bg-neon-purple/10 text-neon-purple border-neon-purple/20',
    resolved: 'bg-green-500/10 text-green-400 border-green-500/20',
    closed: 'bg-text-muted/10 text-text-muted border-white/10',
  };
  return (
    <span className={`px-3 py-1 rounded-full text-[12px] font-bold tracking-wider uppercase border ${styles[status]}`}>
      {status.replace('_', ' ')}
    </span>
  );
};

const PriorityBadge = ({ priority }) => {
  const styles = {
    critical: 'bg-red-500',
    high: 'bg-amber-500',
    medium: 'bg-blue-500',
    low: 'bg-green-500',
  };
  return (
    <span className="flex items-center gap-1.5 px-3 py-1 bg-white/5 rounded-full border border-white/5">
      <div className={`w-2 h-2 rounded-full shadow-[0_0_8px_currentColor] ${styles[priority]}`} style={{ color: 'inherit' }} />
      <span className="text-[12px] font-bold text-white uppercase tracking-wider">{priority}</span>
    </span>
  );
};

const CustomerDashboard = () => {
  const navigate = useNavigate();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        const res = await ticketAPI.getTickets({ sort: '-createdAt' });
        setTickets(res.data.data.tickets || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchTickets();
  }, []);

  if (loading) {
    return <div className="flex h-64 items-center justify-center text-text-muted">Loading your workspace...</div>;
  }

  const openTicketsCount = tickets.filter(t => t.status === 'open' || t.status === 'in_progress').length;
  const resolvedTicketsCount = tickets.filter(t => t.status === 'resolved' || t.status === 'closed').length;

  return (
    <div className="space-y-8">
      {/* Header & Stats */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-white/5">
        <div>
          <h1 className="font-display text-4xl font-bold text-white tracking-tight mb-2">My Tickets</h1>
          <p className="text-text-muted text-lg">Track and manage your support requests.</p>
        </div>
        <Link to="/customer/submit" className="btn-primary flex items-center justify-center gap-2 px-6 py-3 whitespace-nowrap">
          <Plus className="w-5 h-5" />
          New Ticket
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-6 border-t border-t-neon-cyan/50">
          <div className="flex items-center justify-between mb-4">
            <span className="text-text-muted font-display uppercase tracking-widest text-[12px] font-bold">Total Requests</span>
            <TicketIcon className="w-5 h-5 text-neon-cyan" />
          </div>
          <div className="text-4xl font-display font-bold text-white">{tickets.length}</div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card p-6 border-t border-t-neon-purple/50">
          <div className="flex items-center justify-between mb-4">
            <span className="text-text-muted font-display uppercase tracking-widest text-[12px] font-bold">Open Items</span>
            <AlertCircle className="w-5 h-5 text-neon-purple" />
          </div>
          <div className="text-4xl font-display font-bold text-white">{openTicketsCount}</div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-card p-6 border-t border-t-green-500/50">
          <div className="flex items-center justify-between mb-4">
            <span className="text-text-muted font-display uppercase tracking-widest text-[12px] font-bold">Resolved</span>
            <CheckCircle2 className="w-5 h-5 text-green-500" />
          </div>
          <div className="text-4xl font-display font-bold text-white">{resolvedTicketsCount}</div>
        </motion.div>
      </div>

      {/* Ticket List */}
      <div>
        <h2 className="font-display text-xl font-bold text-white mb-6">Recent Tickets</h2>
        
        {tickets.length === 0 ? (
          <div className="glass-card p-12 text-center border border-white/5 border-dashed">
            <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-4">
              <TicketIcon className="w-8 h-8 text-text-muted" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">No tickets yet</h3>
            <p className="text-text-muted mb-6">Looks like you haven't opened any support requests.</p>
            <Link to="/customer/submit" className="text-neon-cyan hover:text-white transition-colors font-medium">Create your first ticket &rarr;</Link>
          </div>
        ) : (
          <div className="glass-card border border-white/5 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/5 text-[11px] uppercase tracking-widest font-display text-text-muted bg-white/[0.02]">
                    <th className="px-6 py-4 font-bold">Ticket</th>
                    <th className="px-6 py-4 font-bold">Status</th>
                    <th className="px-6 py-4 font-bold">Priority</th>
                    <th className="px-6 py-4 font-bold">Created</th>
                    <th className="px-6 py-4"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {tickets.map((t, idx) => (
                    <motion.tr 
                      key={t._id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className="hover:bg-white/[0.02] transition-colors group cursor-pointer"
                      onClick={() => navigate(`/customer/tickets/${t._id}`)}
                    >
                      <td className="px-6 py-5">
                        <div className="font-medium text-[15px] mb-1 group-hover:text-neon-cyan transition-colors truncate max-w-sm">
                          {t.title}
                        </div>
                        <div className="text-[12px] font-display text-text-muted uppercase tracking-wider">
                          ID: {t._id.slice(-6)}
                        </div>
                      </td>
                      <td className="px-6 py-5"><StatusBadge status={t.status} /></td>
                      <td className="px-6 py-5"><PriorityBadge priority={t.finalPriority} /></td>
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-2 text-[13px] text-text-secondary">
                          <Clock className="w-3.5 h-3.5" />
                          {formatDistanceToNow(new Date(t.createdAt), { addSuffix: true })}
                        </div>
                      </td>
                      <td className="px-6 py-5 text-right">
                        <ChevronRight className="w-5 h-5 text-white/20 group-hover:text-white transition-colors" />
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

    </div>
  );
};

export default CustomerDashboard;
