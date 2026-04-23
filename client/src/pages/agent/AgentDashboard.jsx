import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ticketAPI } from '../../api/tickets';
import { Ticket as TicketIcon, Clock, AlertTriangle, CheckCircle2, ChevronRight, Activity } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

const AgentDashboard = () => {
  const [stats, setStats] = useState({ open: 0, critical: 0, breached: 0, resolved: 0 });
  const [recentQueue, setRecentQueue] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [ticketsRes, breachedRes] = await Promise.all([
          ticketAPI.getTickets({ sort: '-priorityScore' }), // fetch all sorted by score
          ticketAPI.getSlaBreached()
        ]);
        
        const all = ticketsRes.data.data.tickets || [];
        const open = all.filter(t => t.status === 'open' || t.status === 'in_progress');
        
        setStats({
          open: open.length,
          critical: open.filter(t => t.finalPriority === 'critical').length,
          breached: breachedRes.data.data.length,
          resolved: all.filter(t => t.status === 'resolved' || t.status === 'closed').length
        });

        // Take top 5 highest priority open tickets
        setRecentQueue(open.slice(0, 5));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <div className="flex h-64 items-center justify-center text-text-muted">Loading workspace...</div>;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between pb-6 border-b border-white/5">
        <div>
          <h1 className="font-display text-4xl font-bold text-white tracking-tight mb-2">Agent Workspace</h1>
          <p className="text-text-muted text-lg">Your queue is sorted by Priority Score.</p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
        {[
          { label: 'Open Tickets', val: stats.open, icon: TicketIcon, c: 'text-blue-400', b: 'border-blue-500/20', bg: 'bg-blue-500/10' },
          { label: 'Critical Priority', val: stats.critical, icon: Activity, c: 'text-red-400', b: 'border-red-500/20', bg: 'bg-red-500/10' },
          { label: 'SLA Breached', val: stats.breached, icon: AlertTriangle, c: 'text-neon-pink', b: 'border-neon-pink/20', bg: 'bg-neon-pink/10' },
          { label: 'Resolved', val: stats.resolved, icon: CheckCircle2, c: 'text-green-400', b: 'border-green-500/20', bg: 'bg-green-500/10' },
        ].map((stat, i) => (
          <motion.div 
            key={i} 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ delay: i * 0.1 }}
            className={`glass-card p-6 border-t ${stat.b}`}
          >
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 ${stat.bg}`}>
              <stat.icon className={`w-5 h-5 ${stat.c}`} />
            </div>
            <div className="text-3xl font-display font-bold text-white mb-1">{stat.val}</div>
            <div className="text-text-muted font-display uppercase tracking-widest text-[11px] font-bold">{stat.label}</div>
          </motion.div>
        ))}
      </div>

      {/* Critical Queue Snapshot */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-display text-xl font-bold text-white">Top Priority Queue</h2>
          <Link to="/agent/queue" className="text-[13px] font-bold text-neon-cyan hover:text-white transition-colors uppercase tracking-widest">
            View All
          </Link>
        </div>
        
        <div className="glass-card border border-white/5 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/5 text-[11px] uppercase tracking-widest font-display text-text-muted bg-white/[0.02]">
                  <th className="px-6 py-4 font-bold w-16">Score</th>
                  <th className="px-6 py-4 font-bold">Ticket</th>
                  <th className="px-6 py-4 font-bold w-32">Priority</th>
                  <th className="px-6 py-4 font-bold w-48">SLA Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {recentQueue.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="px-6 py-12 text-center text-text-muted">Queue is completely empty! Great job.</td>
                  </tr>
                ) : recentQueue.map((t) => {
                  const now = new Date();
                  const breachTime = new Date(t.slaDeadline);
                  const isBreached = now > breachTime;

                  return (
                    <motion.tr 
                      key={t._id}
                      className="hover:bg-white/[0.02] transition-colors group cursor-pointer"
                      onClick={() => window.location.href = `/agent/tickets/${t._id}`}
                    >
                      <td className="px-6 py-4">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-display font-bold text-[11px] uppercase ${
                          t.finalPriority === 'critical' ? 'bg-red-500/10 text-red-500 border border-red-500/20' :
                          t.finalPriority === 'high' ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' :
                          t.finalPriority === 'medium' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' :
                          'bg-green-500/10 text-green-500 border border-green-500/20'
                        }`}>
                          {t.finalPriority?.charAt(0).toUpperCase()}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-medium text-[15px] mb-1 group-hover:text-neon-cyan transition-colors truncate max-w-sm">
                          {t.title}
                        </div>
                        <div className="text-[12px] text-text-muted truncate max-w-sm">
                          {t.description.substring(0, 80)}...
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 bg-white/5 rounded-full border border-white/5 text-[11px] font-bold text-white uppercase tracking-wider`}>
                          <div className={`w-2 h-2 rounded-full ${t.finalPriority === 'critical' ? 'bg-red-500' : t.finalPriority === 'high' ? 'bg-amber-500' : t.finalPriority === 'medium' ? 'bg-blue-500' : 'bg-green-500'}`} />
                          {t.finalPriority}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className={`flex items-center gap-2 text-[12px] font-bold uppercase tracking-wider ${isBreached ? 'text-neon-pink animate-pulse' : 'text-text-secondary'}`}>
                          <Clock className="w-3.5 h-3.5" />
                          {isBreached ? 'Breached' : `Breaches in ${formatDistanceToNow(breachTime)}`}
                        </div>
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AgentDashboard;
