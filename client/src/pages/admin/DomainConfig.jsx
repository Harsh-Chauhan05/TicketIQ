import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { domainAPI } from '../../api/domains';
import { Zap, Plus, X, Loader2, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const PRIORITY_COLORS = {
  critical: 'bg-red-500/10 text-red-400 border-red-500/20',
  high: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  medium: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  low: 'bg-green-500/10 text-green-400 border-green-500/20',
};

const DomainConfig = () => {
  const { user } = useAuth();
  const [rules, setRules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savingIdx, setSavingIdx] = useState(null); // track which rule is being deleted
  const [adding, setAdding] = useState(false);
  const [toast, setToast] = useState('');

  // New rule form state
  const [newKeyword, setNewKeyword] = useState('');
  const [newPriority, setNewPriority] = useState('medium');

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  useEffect(() => {
    const fetchDomain = async () => {
      try {
        const res = await domainAPI.getDomain();
        setRules(res.data.data?.rules || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchDomain();
  }, []);

  const handleAddRule = async (e) => {
    e.preventDefault();
    if (!newKeyword.trim()) return;
    setAdding(true);
    try {
      const res = await domainAPI.addRule({ keyword: newKeyword.trim(), priority: newPriority });
      setRules(res.data.data?.rules || []);
      setNewKeyword('');
      showToast('Rule added successfully!');
    } catch (err) {
      console.error(err);
      showToast('Failed to add rule. Please try again.');
    } finally {
      setAdding(false);
    }
  };

  const handleDeleteRule = async (ruleId, idx) => {
    setSavingIdx(idx);
    try {
      const res = await domainAPI.deleteRule(ruleId);
      setRules(res.data.data?.rules || []);
      showToast('Rule removed.');
    } catch (err) {
      console.error(err);
      showToast('Failed to delete rule.');
    } finally {
      setSavingIdx(null);
    }
  };

  if (loading) return (
    <div className="flex h-64 items-center justify-center text-text-muted">
      <Loader2 className="w-6 h-6 animate-spin mr-3" /> Loading AI Configuration...
    </div>
  );

  return (
    <div className="max-w-4xl space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between pb-6 border-b border-white/5 gap-4">
        <div>
          <h1 className="font-display text-4xl font-bold text-white tracking-tight mb-2">Priority Engine Rules</h1>
          <p className="text-text-muted text-lg">
            AI keyword triggers for&nbsp;
            <span className="text-neon-cyan font-bold uppercase tracking-wider">{user.domain}</span>
          </p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-xl border border-white/10">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          <span className="text-[12px] font-bold text-text-secondary uppercase tracking-widest">{rules.length} Active Rules</span>
        </div>
      </div>

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={`p-4 rounded-xl border flex items-center gap-3 ${toast.includes('success') || toast.includes('removed') ? 'bg-green-500/10 border-green-500/20 text-green-400' : 'bg-red-500/10 border-red-500/20 text-red-400'}`}
          >
            <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
            <span className="text-[14px] font-medium">{toast}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="glass-card p-6 border-t border-t-neon-purple/50 bg-[#050510]/50 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-neon-purple/20 blur-[50px] pointer-events-none" />

        {/* How it works */}
        <div className="flex items-start gap-4 p-4 bg-neon-purple/10 border border-neon-purple/20 rounded-xl mb-8 relative z-10">
          <Zap className="w-6 h-6 text-neon-purple flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-bold text-white mb-1">How the AI Priority Engine works</h3>
            <p className="text-[13px] text-text-secondary leading-relaxed">
              When a customer submits a ticket, the engine scans the title and description against these keywords (case-insensitive).
              If a match is found, the ticket is automatically bumped to the matched priority — overriding the user's selection
              if the AI detects higher urgency. Use comma-separated values to match variations (e.g. <code className="text-neon-cyan">"payment failed, payment error"</code>).
            </p>
          </div>
        </div>

        {/* Rules Table */}
        <h3 className="text-[13px] font-display uppercase tracking-widest text-text-muted font-bold mb-4">Configured Triggers</h3>
        <div className="border border-white/5 rounded-xl overflow-hidden mb-8">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-white/5 border-b border-white/5 text-[11px] uppercase tracking-widest font-display text-text-muted">
                <th className="px-5 py-3 font-bold">Keyword / Phrase</th>
                <th className="px-5 py-3 font-bold w-40">Assigned Priority</th>
                <th className="px-5 py-3 w-16 text-center">Remove</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {rules.length === 0 ? (
                <tr>
                  <td colSpan="3" className="p-8 text-center text-text-muted italic text-[14px]">
                    No rules configured. Tickets will use the customer's selected priority.
                  </td>
                </tr>
              ) : rules.map((r, idx) => (
                <motion.tr
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  key={r._id || idx}
                  className="hover:bg-white/[0.02]"
                >
                  <td className="px-5 py-3 text-[14px] text-white">
                    <span className="font-mono bg-black/30 px-2 py-1 rounded text-neon-cyan">{r.keyword}</span>
                  </td>
                  <td className="px-5 py-3">
                    <span className={`inline-flex px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider border ${PRIORITY_COLORS[r.priority]}`}>
                      {r.priority}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-center">
                    <button
                      onClick={() => handleDeleteRule(r._id, idx)}
                      disabled={savingIdx === idx}
                      className="text-text-muted hover:text-red-400 transition-colors p-1 disabled:opacity-40"
                    >
                      {savingIdx === idx
                        ? <Loader2 className="w-4 h-4 animate-spin mx-auto" />
                        : <X className="w-4 h-4 mx-auto" />}
                    </button>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Add New Rule */}
        <h3 className="text-[13px] font-display uppercase tracking-widest text-text-muted font-bold mb-4">Add New Trigger</h3>
        <form onSubmit={handleAddRule} className="flex flex-col sm:flex-row gap-4 items-start sm:items-end">
          <div className="flex-1 w-full">
            <label className="block text-[12px] font-bold text-text-secondary uppercase tracking-wider mb-2">Keyword string</label>
            <input
              type="text"
              required
              value={newKeyword}
              onChange={(e) => setNewKeyword(e.target.value)}
              className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-[14px] text-white focus:outline-none focus:border-neon-purple/50 focus:bg-white/[0.05]"
              placeholder='e.g. system down, 500 error'
            />
          </div>
          <div className="w-full sm:w-48">
            <label className="block text-[12px] font-bold text-text-secondary uppercase tracking-wider mb-2">Priority Level</label>
            <select
              value={newPriority}
              onChange={(e) => setNewPriority(e.target.value)}
              className="w-full bg-[#13151f] border border-white/10 rounded-xl px-4 py-3 text-[14px] text-white focus:outline-none focus:border-neon-purple/50"
            >
              <option value="critical">🔴 Critical</option>
              <option value="high">🟠 High</option>
              <option value="medium">🔵 Medium</option>
              <option value="low">🟢 Low</option>
            </select>
          </div>
          <button
            type="submit"
            disabled={adding || !newKeyword.trim()}
            className="w-full sm:w-auto btn-primary py-3 px-6 h-[46px] flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {adding ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Plus className="w-4 h-4" /> Add Rule</>}
          </button>
        </form>
      </div>
    </div>
  );
};

export default DomainConfig;
