import { useState, useEffect } from 'react';
import { ticketAPI } from '../../api/tickets';
import { Link } from 'react-router-dom';
import { Search, ChevronRight, Clock, ShieldAlert } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

const ManageTickets = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

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

  const filteredTickets = tickets.filter(t => 
    t.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    t._id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <div className="p-8 text-text-muted">Loading all tickets...</div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-white/5">
        <div>
          <h1 className="font-display text-4xl font-bold text-white tracking-tight mb-2">Global Tickets</h1>
          <p className="text-text-muted">Oversight for all domains and users.</p>
        </div>
        <div className="relative w-full md:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
          <input 
            type="text" 
            placeholder="Search ID or title..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white/[0.03] border border-white/10 rounded-full py-2 pl-10 pr-4 text-[13px] text-white focus:outline-none focus:border-neon-purple/50"
          />
        </div>
      </div>

      <div className="glass-card border border-white/5 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/5 text-[11px] uppercase tracking-widest font-display text-text-muted bg-white/[0.02]">
                <th className="px-6 py-4 font-bold">Ticket & Domain</th>
                <th className="px-6 py-4 font-bold">Status</th>
                <th className="px-6 py-4 font-bold">Priority</th>
                <th className="px-6 py-4 font-bold">Assigned</th>
                <th className="px-6 py-4 font-bold">Created</th>
                <th className="px-6 py-4"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredTickets.map((t) => {
                return (
                  <tr 
                    key={t._id}
                    className="hover:bg-white/[0.02] transition-colors group cursor-pointer relative"
                    onClick={() => window.location.href = `/admin/tickets/${t._id}`} // Route modified to allow Admin access
                  >
                    <td className="px-6 py-5">
                      <div className="font-medium text-[15px] mb-1 group-hover:text-neon-cyan transition-colors truncate max-w-sm">
                        {t.title}
                      </div>
                      <div className="flex gap-2 items-center text-[11px] font-display uppercase tracking-wider">
                        <span className="text-text-muted">ID: {t._id.slice(-6)}</span>
                        <span className="bg-white/10 px-2 rounded text-white">{t.domain}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider border capitalize ${
                        t.status === 'resolved' ? 'bg-green-500/10 text-green-400 border-green-500/20' : 
                        t.status === 'closed' ? 'bg-text-muted/10 text-text-muted border-white/10' :
                        'bg-neon-cyan/10 text-neon-cyan border-neon-cyan/20'
                      }`}>
                        {t.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 bg-white/5 rounded-full border border-white/5 text-[11px] font-bold text-white uppercase tracking-wider`}>
                        <div className={`w-2 h-2 rounded-full ${t.finalPriority === 'critical' ? 'bg-red-500' : t.finalPriority === 'high' ? 'bg-amber-500' : t.finalPriority === 'medium' ? 'bg-blue-500' : 'bg-green-500'}`} />
                        {t.finalPriority}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-[13px] text-text-secondary">
                      {t.assignedTo ? <span className="text-white">Assigned</span> : 'Unassigned'}
                    </td>
                    <td className="px-6 py-4 text-[13px] text-text-secondary">
                       {formatDistanceToNow(new Date(t.createdAt), { addSuffix: true })}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <ChevronRight className="w-5 h-5 text-white/20 group-hover:text-white transition-colors" />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {filteredTickets.length === 0 && (
            <div className="p-12 text-center text-text-muted">No tickets found.</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ManageTickets;
