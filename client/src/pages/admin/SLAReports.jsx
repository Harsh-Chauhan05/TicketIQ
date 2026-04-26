import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { slaAPI } from '../../api/sla';
import { BarChart3, TrendingUp, TrendingDown, ShieldAlert, CheckCircle2, Loader2, RefreshCw, Download } from 'lucide-react';

const PRIORITY_CONFIG = {
  critical: { color: 'bg-red-500', text: 'text-red-400', border: 'border-red-500/30', bg: 'bg-red-500/10' },
  high:     { color: 'bg-amber-500', text: 'text-amber-400', border: 'border-amber-500/30', bg: 'bg-amber-500/10' },
  medium:   { color: 'bg-blue-500', text: 'text-blue-400', border: 'border-blue-500/30', bg: 'bg-blue-500/10' },
  low:      { color: 'bg-green-500', text: 'text-green-400', border: 'border-green-500/30', bg: 'bg-green-500/10' },
};

const MetricCard = ({ label, value, sub, trend, borderColor, delay }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay }}
    className={`glass-card p-6 border-t ${borderColor}`}
  >
    <div className="text-text-muted font-display uppercase tracking-widest text-[11px] font-bold mb-3">{label}</div>
    <div className="text-4xl font-bold text-white flex items-end gap-3 mb-1">
      {value}
      {trend === 'up' && <TrendingUp className="w-5 h-5 text-green-500 mb-1" />}
      {trend === 'down' && <TrendingDown className="w-5 h-5 text-red-400 mb-1" />}
    </div>
    {sub && <div className="text-[12px] text-text-muted">{sub}</div>}
  </motion.div>
);

const SLAReports = () => {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchReport = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true); else setLoading(true);
    try {
      const res = await slaAPI.getReports();
      setReport(res.data.data);
    } catch (err) {
      console.error('Failed to load SLA reports:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const exportToCSV = () => {
    if (!report) return;
    
    const compliance = report.totalTickets > 0 ? (((report.resolvedOnTime) / report.totalTickets) * 100).toFixed(1) : 100;
    
    // Create CSV rows
    const rows = [
      ['TicketIQ SLA Report', new Date().toLocaleDateString()],
      [],
      ['Metric', 'Value'],
      ['Total Tickets Tracked', report.totalTickets],
      ['SLA Compliance Rate', `${compliance}%`],
      ['Total SLA Breaches', report.slaBreached],
      ['Overall Breach Rate', `${report.breachRate}%`],
      ['Tickets Resolved On Time', report.resolvedOnTime],
      [],
      ['Breaches By Priority', 'Count'],
      ['Critical', report.breachByPriority?.critical || 0],
      ['High', report.breachByPriority?.high || 0],
      ['Medium', report.breachByPriority?.medium || 0],
      ['Low', report.breachByPriority?.low || 0]
    ];
    
    const csvContent = "data:text/csv;charset=utf-8," + rows.map(e => e.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `sla_report_${new Date().getTime()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  useEffect(() => { fetchReport(); }, []);

  if (loading) return (
    <div className="flex h-64 items-center justify-center text-text-muted">
      <Loader2 className="w-6 h-6 animate-spin mr-3" /> Loading Performance Analytics...
    </div>
  );

  const compliance = report?.totalTickets > 0
    ? (((report.resolvedOnTime) / report.totalTickets) * 100).toFixed(1)
    : 100;

  const breachByPriority = report?.breachByPriority || {};
  const maxBreach = Math.max(...Object.values(breachByPriority), 1);

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between pb-6 border-b border-white/5 gap-4">
        <div>
          <h1 className="font-display text-4xl font-bold text-white tracking-tight mb-2">Performance Analytics</h1>
          <p className="text-text-muted text-lg">Live SLA compliance metrics for your team.</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={exportToCSV}
            className="btn-secondary px-5 py-2.5 text-[14px] flex items-center gap-2 border-neon-cyan/30 text-neon-cyan hover:bg-neon-cyan/10"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </button>
          <button
            onClick={() => fetchReport(true)}
            disabled={refreshing}
            className="btn-secondary px-5 py-2.5 text-[14px] flex items-center gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <MetricCard
          label="SLA Compliance Rate"
          value={`${compliance}%`}
          sub={`${report?.resolvedOnTime || 0} of ${report?.totalTickets || 0} tickets resolved on time`}
          trend={compliance >= 90 ? 'up' : 'down'}
          borderColor="border-t-green-500/50"
          delay={0}
        />
        <MetricCard
          label="Total SLA Breaches"
          value={report?.slaBreached || 0}
          sub={`${report?.breachRate || 0}% breach rate across all tickets`}
          trend={report?.slaBreached > 0 ? 'down' : 'up'}
          borderColor="border-t-neon-pink/50"
          delay={0.1}
        />
        <MetricCard
          label="Total Tickets Tracked"
          value={report?.totalTickets || 0}
          sub="All-time across your domain"
          borderColor="border-t-neon-cyan/50"
          delay={0.2}
        />
      </div>

      {/* Breach by Priority Breakdown */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="glass-card p-8"
      >
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl bg-neon-pink/10 flex items-center justify-center">
            <ShieldAlert className="w-5 h-5 text-neon-pink" />
          </div>
          <div>
            <h2 className="font-display text-xl font-bold text-white">SLA Breaches by Priority</h2>
            <p className="text-[13px] text-text-muted">How many tickets of each priority missed their SLA deadline.</p>
          </div>
        </div>

        <div className="space-y-5">
          {['critical', 'high', 'medium', 'low'].map((p) => {
            const count = breachByPriority[p] || 0;
            const pct = maxBreach > 0 ? Math.round((count / maxBreach) * 100) : 0;
            const cfg = PRIORITY_CONFIG[p];
            return (
              <div key={p}>
                <div className="flex justify-between items-center mb-2">
                  <div className="flex items-center gap-2">
                    <span className={`w-2.5 h-2.5 rounded-full ${cfg.color}`} />
                    <span className={`text-[13px] font-bold uppercase tracking-widest ${cfg.text}`}>{p}</span>
                  </div>
                  <span className="text-[13px] font-mono font-bold text-white">{count} breach{count !== 1 ? 'es' : ''}</span>
                </div>
                <div className="h-2.5 bg-white/5 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{ duration: 1, delay: 0.4, ease: 'easeOut' }}
                    className={`h-full rounded-full ${cfg.color}`}
                  />
                </div>
              </div>
            );
          })}
        </div>

        {report?.totalTickets === 0 && (
          <div className="mt-8 p-6 border border-dashed border-white/10 rounded-xl text-center text-text-muted text-[14px]">
            <CheckCircle2 className="w-8 h-8 text-green-500 mx-auto mb-3" />
            No ticket data yet. Start processing tickets to see analytics here.
          </div>
        )}
      </motion.div>

      {/* Legend */}
      <div className="p-4 bg-neon-cyan/5 border border-neon-cyan/20 rounded-xl">
        <h4 className="font-bold text-[13px] text-white flex items-center gap-2 mb-1">
          <BarChart3 className="w-4 h-4 text-neon-cyan" /> How to read this
        </h4>
        <p className="text-[12px] text-text-secondary leading-relaxed">
          <strong className="text-white">SLA Compliance:</strong> % of tickets resolved before their SLA deadline.&nbsp;
          <strong className="text-white">SLA Breach:</strong> when a ticket's resolution time exceeds the limit set in SLA Settings.
          Adjust priority deadlines in <a href="/admin/sla-settings" className="text-neon-cyan underline">SLA Settings</a> to tighten or relax targets.
        </p>
      </div>
    </div>
  );
};

export default SLAReports;
