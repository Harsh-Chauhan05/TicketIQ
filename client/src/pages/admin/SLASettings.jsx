import { useState, useEffect } from 'react';
import { slaAPI } from '../../api/sla';
import { Clock, ShieldAlert, Loader2, Save } from 'lucide-react';

const SLASettings = () => {
  const [policies, setPolicies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchSLA = async () => {
      try {
        const res = await slaAPI.getPolicies();
        setPolicies(res.data.data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchSLA();
  }, []);

  const handleUpdate = (id, field, value) => {
    setPolicies(policies.map(p => 
      p._id === id ? { ...p, [field]: Number(value) } : p
    ));
  };

  const handleSaveAll = async () => {
    setSaving(true);
    setMessage('');
    try {
      for (const p of policies) {
        await slaAPI.updatePolicy(p._id, {
          resolutionTimeMin: p.resolutionTimeMin,
          escalateAfterMin: p.escalateAfterMin
        });
      }
      setMessage('SLA Policies synchronized successfully.');
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      console.error(err);
      setMessage('Failed to update policies.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-8 text-text-muted">Loading SLA Configuration...</div>;

  const PRIORITY_ORDER = { critical: 1, high: 2, medium: 3, low: 4 };
  const sortedPolicies = [...policies].sort((a, b) => PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority]);

  return (
    <div className="max-w-4xl space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between pb-6 border-b border-white/5 gap-4">
        <div>
          <h1 className="font-display text-4xl font-bold text-white tracking-tight mb-2">Service Level Agreements</h1>
          <p className="text-text-muted text-lg">Define resolution deadlines based on ticket priority.</p>
        </div>
        <button 
          onClick={handleSaveAll}
          disabled={saving}
          className="btn-primary px-6 py-2.5 flex items-center justify-center gap-2"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Save className="w-4 h-4" /> Save Configuration</>}
        </button>
      </div>

      {message && (
        <div className={`p-4 rounded-xl border flex items-center gap-2 ${message.includes('success') ? 'bg-green-500/10 border-green-500/20 text-green-400' : 'bg-red-500/10 border-red-500/20 text-red-400'}`}>
          <ShieldAlert className="w-5 h-5 flex-shrink-0" />
          <span className="text-[14px] font-medium">{message}</span>
        </div>
      )}

      <div className="bg-glass border border-white/5 rounded-2xl overflow-hidden p-2 md:p-6 space-y-4">
        {sortedPolicies.map((p) => (
          <div key={p._id} className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 p-6 bg-white/[0.02] border border-white/5 rounded-xl hover:bg-white/[0.04] transition-colors">
            
            <div className="flex items-center gap-4 w-full md:w-1/3">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                  p.priority === 'critical' ? 'bg-red-500/10 text-red-500 border border-red-500/20' :
                  p.priority === 'high' ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' :
                  p.priority === 'medium' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' :
                  'bg-green-500/10 text-green-400 border border-green-500/20'
              }`}>
                <Clock className="w-6 h-6" />
              </div>
              <div>
                <div className="font-display font-bold text-white uppercase tracking-widest text-[16px]">{p.priority}</div>
                <div className="text-[12px] text-text-muted mt-1 uppercase tracking-wider">Priority Level</div>
              </div>
            </div>

            <div className="w-full md:w-2/3 flex flex-col sm:flex-row gap-6">
              <div className="flex-1">
                <label className="block text-[11px] font-bold text-text-secondary uppercase tracking-widest mb-2 font-display">
                  Deadline (Minutes)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="1"
                    value={p.resolutionTimeMin}
                    onChange={(e) => handleUpdate(p._id, 'resolutionTimeMin', e.target.value)}
                    className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2.5 text-[15px] font-mono text-white focus:outline-none focus:border-neon-cyan/50"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[12px] text-text-muted">min</span>
                </div>
              </div>

              <div className="flex-1">
                <label className="block text-[11px] font-bold text-text-secondary uppercase tracking-widest mb-2 font-display">
                  At-Risk Alert At
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="1"
                    max={p.resolutionTimeMin - 1}
                    value={p.escalateAfterMin}
                    onChange={(e) => handleUpdate(p._id, 'escalateAfterMin', e.target.value)}
                    className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2.5 text-[15px] font-mono text-white focus:outline-none focus:border-amber-500/50"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[12px] text-text-muted">min</span>
                </div>
              </div>
            </div>
            
          </div>
        ))}
        
        {policies.length === 0 && (
          <div className="p-8 text-center text-text-muted">No SLA policies found. Please run the seeder or contact support.</div>
        )}
      </div>
      
      <div className="p-4 bg-neon-cyan/5 border border-neon-cyan/20 rounded-xl">
        <h4 className="font-bold text-[13px] text-white flex items-center gap-2 mb-1"><Clock className="w-4 h-4 text-neon-cyan" /> Pro Tip</h4>
        <p className="text-[12px] text-text-secondary leading-relaxed">
          The "At-Risk Alert" controls when tickets turn amber in the Agent SLA Monitor. Set it low enough to give agents time to resolve complex queries before the deadline is missed.
        </p>
      </div>
    </div>
  );
};

export default SLASettings;
