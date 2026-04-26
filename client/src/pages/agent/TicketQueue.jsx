import { useState, useEffect } from 'react';
import { ticketAPI } from '../../api/tickets';
import { Link } from 'react-router-dom';
import { Clock, Filter, Search, ChevronRight } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';

const TicketQueue = () => {
  const { user } = useAuth();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('Open'); // Open | Critical | All | My Tickets
  const socket = useSocket();

  const fetchTickets = async () => {
    try {
      const res = await ticketAPI.getTickets({ sort: '-priorityScore' });
      setTickets(res.data.data.tickets || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  useEffect(() => {
    if (socket) {
      socket.on('new_ticket', fetchTickets);
      socket.on('ticket_updated', fetchTickets);
      return () => {
        socket.off('new_ticket', fetchTickets);
        socket.off('ticket_updated', fetchTickets);
      };
    }
  }, [socket]);

  const filteredTickets = tickets.filter(t => {
    if (filter === 'Open') return t.status === 'open' || t.status === 'in_progress';
    if (filter === 'Critical') return (t.status === 'open' || t.status === 'in_progress') && t.finalPriority === 'critical';
    if (filter === 'My Tickets') return t.assignedTo?._id === user?._id;
    return true; // All
  });

  if (loading) return <div className="p-8 text-text-muted">Loading queue...</div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-white/5">
        <div>
          <h1 className="font-display text-4xl font-bold text-white tracking-tight mb-2">Ticket Queue</h1>
          <p className="text-text-muted">Ordered intelligently by the Priority Engine.</p>
        </div>
        <div className="flex gap-2">
          {['Open', 'My Tickets', 'Critical', 'All'].map(f => (
            <button 
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-full text-[12px] font-bold tracking-widest uppercase font-display transition-colors ${
                filter === f ? 'bg-neon-purple text-white shadow-[0_0_15px_rgba(168,85,247,0.4)]' : 'bg-white/5 text-text-muted hover:text-white'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="glass-card border border-white/5 overflow-hidden">
        {/* Desktop View */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/5 text-[11px] uppercase tracking-widest font-display text-text-muted bg-white/[0.02]">
                <th className="px-6 py-4 font-bold w-16">Score</th>
                <th className="px-6 py-4 font-bold">Ticket Details</th>
                <th className="px-6 py-4 font-bold w-32">Status</th>
                <th className="px-6 py-4 font-bold w-32">Priority</th>
                <th className="px-6 py-4 font-bold w-48">SLA Status</th>
                <th className="px-6 py-4"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredTickets.map((t) => {
                const now = new Date();
                const breachTime = new Date(t.slaDeadline);
                const isBreached = now > breachTime;
                
                return (
                  <tr 
                    key={t._id}
                    className="hover:bg-white/[0.02] transition-colors group cursor-pointer"
                    onClick={() => window.location.href = `/agent/tickets/${t._id}`}
                  >
                    <td className="px-6 py-4">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-display font-bold text-[16px] shadow-sm border transition-all ${
                        t.finalPriority === 'critical' ? 'bg-red-500/10 text-red-500 border-red-500/20 shadow-red-500/5' :
                        t.finalPriority === 'high' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20 shadow-amber-500/5' :
                        t.finalPriority === 'medium' ? 'bg-blue-500/10 text-blue-500 border-blue-500/20 shadow-blue-500/5' :
                        'bg-green-500/10 text-green-500 border-green-500/20 shadow-green-500/5'
                      }`}>
                        {t.finalPriority ? t.finalPriority.charAt(0).toUpperCase() : '-'}
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="font-medium text-[15px] mb-1 group-hover:text-neon-cyan transition-colors truncate max-w-sm">
                        {t.title}
                      </div>
                      <div className="text-[12px] font-display text-text-muted uppercase tracking-wider">
                        ID: {t._id.slice(-6)} · Created {formatDistanceToNow(new Date(t.createdAt))} ago
                      </div>
                    </td>
                    <td className="px-6 py-4 text-[13px] text-text-secondary capitalize">{t.status.replace('_', ' ')}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 bg-white/5 rounded-full border border-white/5 text-[11px] font-bold text-white uppercase tracking-wider`}>
                        <div className={`w-2 h-2 rounded-full ${t.finalPriority === 'critical' ? 'bg-red-500' : t.finalPriority === 'high' ? 'bg-amber-500' : t.finalPriority === 'medium' ? 'bg-blue-500' : 'bg-green-500'}`} />
                        {t.finalPriority}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {t.status === 'resolved' || t.status === 'closed' ? (
                        <div className="text-[12px] text-text-muted uppercase tracking-wider font-bold">Resolved</div>
                      ) : (
                        <div className={`flex items-center gap-2 text-[12px] font-bold uppercase tracking-wider ${isBreached ? 'text-neon-pink animate-pulse' : 'text-text-secondary'}`}>
                          <Clock className="w-3.5 h-3.5" />
                          {isBreached ? 'Breached' : `Breaches in ${formatDistanceToNow(breachTime)}`}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <ChevronRight className="w-5 h-5 text-white/20 group-hover:text-white transition-colors" />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Mobile Card View */}
        <div className="md:hidden divide-y divide-white/5">
          {filteredTickets.map((t) => {
            const now = new Date();
            const breachTime = new Date(t.slaDeadline);
            const isBreached = now > breachTime;

            return (
              <div 
                key={t._id} 
                onClick={() => window.location.href = `/agent/tickets/${t._id}`}
                className="p-6 active:bg-white/5 transition-colors relative"
              >
                {/* Priority Indicator Bar */}
                <div className={`absolute left-0 top-0 bottom-0 w-1 ${
                  t.finalPriority === 'critical' ? 'bg-red-500' : 
                  t.finalPriority === 'high' ? 'bg-amber-500' : 
                  t.finalPriority === 'medium' ? 'bg-blue-500' : 
                  'bg-green-500'
                }`} />

                <div className="flex items-start justify-between gap-4 mb-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-[10px] font-bold text-neon-cyan bg-neon-cyan/10 px-2 py-0.5 rounded border border-neon-cyan/20 uppercase tracking-widest font-display">
                        {t.ticketNumber || `TKT-${t._id.slice(-5).toUpperCase()}`}
                      </span>
                      <span className="text-[10px] font-bold text-text-muted uppercase tracking-widest font-display">
                        {formatDistanceToNow(new Date(t.createdAt))} ago
                      </span>
                    </div>
                    <h3 className="text-[16px] font-bold text-white leading-snug line-clamp-2">
                      {t.title}
                    </h3>
                  </div>
                  <div className={`w-12 h-12 rounded-2xl flex flex-col items-center justify-center font-display border shadow-lg flex-shrink-0 ${
                    t.finalPriority === 'critical' ? 'bg-red-500/10 text-red-500 border-red-500/20 shadow-red-500/5' :
                    t.finalPriority === 'high' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20 shadow-amber-500/5' :
                    t.finalPriority === 'medium' ? 'bg-blue-500/10 text-blue-500 border-blue-500/20 shadow-blue-500/5' :
                    'bg-green-500/10 text-green-500 border-green-500/20 shadow-green-500/5'
                  }`}>
                    <span className="text-[18px] font-bold leading-none">{t.finalPriority ? t.finalPriority.charAt(0).toUpperCase() : '-'}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white/5 rounded-xl p-3 border border-white/5">
                    <div className="text-[9px] uppercase tracking-widest text-text-muted font-bold mb-1">Status</div>
                    <div className="text-[12px] font-medium text-white capitalize">{t.status.replace('_', ' ')}</div>
                  </div>
                  <div className="bg-white/5 rounded-xl p-3 border border-white/5">
                    <div className="text-[9px] uppercase tracking-widest text-text-muted font-bold mb-1">Priority</div>
                    <div className="flex items-center gap-1.5">
                      <div className={`w-1.5 h-1.5 rounded-full ${t.finalPriority === 'critical' ? 'bg-red-500' : t.finalPriority === 'high' ? 'bg-amber-500' : t.finalPriority === 'medium' ? 'bg-blue-500' : 'bg-green-500'}`} />
                      <div className="text-[12px] font-medium text-white capitalize">{t.finalPriority}</div>
                    </div>
                  </div>
                </div>

                <div className="pt-4 flex items-center justify-between">
                  <div className={`flex items-center gap-2 text-[12px] font-bold uppercase tracking-wider ${isBreached ? 'text-neon-pink animate-pulse' : 'text-text-secondary'}`}>
                    <Clock className="w-4 h-4" />
                    {isBreached ? 'Breached' : `Breaches in ${formatDistanceToNow(breachTime)}`}
                  </div>
                  <ChevronRight className="w-5 h-5 text-text-muted" />
                </div>
              </div>
            );
          })}
        </div>

        {filteredTickets.length === 0 && (
          <div className="p-16 text-center">
            <Filter className="w-10 h-10 text-white/5 mx-auto mb-4" />
            <p className="text-text-muted text-[14px]">No tickets match this filter.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TicketQueue;
