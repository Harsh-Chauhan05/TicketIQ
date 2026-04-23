import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ticketAPI } from '../../api/tickets';
import { AlertTriangle, Clock, CheckCircle2 } from 'lucide-react';

const CircularProgress = ({ percentage, color, label, centerText }) => {
  const radius = 60;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-40 h-40 flex items-center justify-center mb-4">
        <svg className="w-full h-full transform -rotate-90">
          <circle
            cx="80"
            cy="80"
            r={radius}
            stroke="currentColor"
            strokeWidth="8"
            fill="transparent"
            className="text-white/5"
          />
          <motion.circle
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 1.5, ease: 'easeOut' }}
            cx="80"
            cy="80"
            r={radius}
            stroke="currentColor"
            strokeWidth="8"
            fill="transparent"
            strokeDasharray={circumference}
            className={color}
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={`text-4xl font-display font-bold ${color}`}>{centerText}</span>
        </div>
      </div>
      <span className="text-[14px] font-bold text-text-secondary uppercase tracking-widest font-display">{label}</span>
    </div>
  );
};

const SLAMonitor = () => {
  const [data, setData] = useState({ breached: [], atRisk: [], onTrack: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [breached, atRisk, onTrack] = await Promise.all([
          ticketAPI.getSlaBreached(),
          ticketAPI.getSlaAtRisk(),
          ticketAPI.getSlaOnTrack()
        ]);
        setData({ 
          breached: breached.data.data, 
          atRisk: atRisk.data.data, 
          onTrack: onTrack.data.data 
        });
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
    const interval = setInterval(fetchData, 30000); // refresh every 30s
    return () => clearInterval(interval);
  }, []);

  if (loading) return <div className="flex h-64 items-center justify-center text-text-muted">Loading SLA Monitor...</div>;

  const totalActive = data.breached.length + data.atRisk.length + data.onTrack.length;
  const onTrackPct = totalActive === 0 ? 100 : Math.round((data.onTrack.length / totalActive) * 100);
  const atRiskPct = totalActive === 0 ? 0 : Math.round((data.atRisk.length / totalActive) * 100);
  const breachedPct = totalActive === 0 ? 0 : Math.round((data.breached.length / totalActive) * 100);

  const TicketCard = ({ t, type }) => (
    <div className={`p-4 rounded-xl border bg-white/[0.02] cursor-pointer hover:bg-white/[0.05] transition-colors ${
      type === 'breached' ? 'border-neon-pink/30' : 
      type === 'atRisk' ? 'border-amber-500/30' : 'border-white/10'
    }`}
    onClick={() => window.location.href = `/agent/tickets/${t._id}`}>
      <div className="flex justify-between items-start mb-2">
        <span className="text-[13px] font-display font-bold text-white uppercase tracking-wider">{t._id.slice(-6)}</span>
        <span className={`px-2 py-0.5 rounded text-[10px] font-bold tracking-widest uppercase ${
          t.finalPriority === 'critical' ? 'bg-red-500/20 text-red-400' : 
          t.finalPriority === 'high' ? 'bg-amber-500/20 text-amber-400' : 'bg-white/10 text-text-secondary'
        }`}>
          {t.finalPriority}
        </span>
      </div>
      <p className="text-[14px] text-text-primary mb-3 line-clamp-1">{t.title}</p>
      <div className={`flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-widest ${
        type === 'breached' ? 'text-neon-pink' : type === 'atRisk' ? 'text-amber-500' : 'text-green-500'
      }`}>
        <Clock className="w-3.5 h-3.5" />
        {type === 'breached' ? 'DEADLINE MISSED' : `Deadline: ${new Date(t.slaDeadline).toLocaleTimeString()}`}
      </div>
    </div>
  );

  return (
    <div className="space-y-12 pb-10">
      <div className="flex items-center justify-between pb-6 border-b border-white/5">
        <div>
          <h1 className="font-display text-4xl font-bold text-white tracking-tight mb-2 flex items-center gap-4">
            Mission Control <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse shadow-[0_0_15px_#22c55e]" />
          </h1>
          <p className="text-text-muted text-lg">Real-time SLA Radar. Refreshes automatically.</p>
        </div>
      </div>

      {/* Radar Rings Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="glass-card p-10 flex items-center justify-center shadow-[0_0_40px_rgba(34,211,238,0.05)]">
          <CircularProgress percentage={onTrackPct} color="text-green-500" label="On Track" centerText={data.onTrack.length} />
        </div>
        <div className="glass-card p-10 flex items-center justify-center border border-amber-500/20 shadow-[0_0_40px_rgba(245,158,11,0.05)]">
          <CircularProgress percentage={atRiskPct} color="text-amber-500" label="At Risk (< 1Hr)" centerText={data.atRisk.length} />
        </div>
        <div className="glass-card p-10 flex items-center justify-center border border-neon-pink/30 shadow-[0_0_50px_rgba(255,68,102,0.15)] bg-neon-pink/[0.02]">
          <CircularProgress percentage={breachedPct} color="text-neon-pink" label="Breached" centerText={data.breached.length} />
        </div>
      </div>

      {/* Ticket Lanes */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Breached Column */}
        <div>
          <div className="flex items-center gap-2 mb-6">
            <AlertTriangle className="w-5 h-5 text-neon-pink" />
            <h3 className="font-display text-xl font-bold text-white">Breached</h3>
          </div>
          <div className="space-y-4">
            {data.breached.length === 0 ? (
              <div className="p-6 border border-white/5 border-dashed rounded-xl text-center text-[13px] text-text-muted">No breached tickets.</div>
            ) : data.breached.map(t => <TicketCard key={t._id} t={t} type="breached" />)}
          </div>
        </div>

        {/* At Risk Column */}
        <div>
          <div className="flex items-center gap-2 mb-6">
            <Clock className="w-5 h-5 text-amber-500" />
            <h3 className="font-display text-xl font-bold text-white">At Risk</h3>
          </div>
          <div className="space-y-4">
            {data.atRisk.length === 0 ? (
              <div className="p-6 border border-white/5 border-dashed rounded-xl text-center text-[13px] text-text-muted">No tickets at risk.</div>
            ) : data.atRisk.map(t => <TicketCard key={t._id} t={t} type="atRisk" />)}
          </div>
        </div>

        {/* On Track Column */}
        <div>
          <div className="flex items-center gap-2 mb-6">
            <CheckCircle2 className="w-5 h-5 text-green-500" />
            <h3 className="font-display text-xl font-bold text-white">On Track</h3>
          </div>
          <div className="space-y-4">
            {data.onTrack.length === 0 ? (
              <div className="p-6 border border-white/5 border-dashed rounded-xl text-center text-[13px] text-text-muted">No tickets on track.</div>
            ) : data.onTrack.map(t => <TicketCard key={t._id} t={t} type="onTrack" />)}
          </div>
        </div>

      </div>
    </div>
  );
};

export default SLAMonitor;
