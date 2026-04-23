import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ticketAPI } from '../../api/tickets';
import { userAPI } from '../../api/users';
import { Ticket as TicketIcon, Activity, CheckCircle2, ShieldAlert, BarChart3, Users, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  AreaChart, Area, PieChart, Pie, Cell, Legend
} from 'recharts';
import { analyticsAPI } from '../../api/analytics';

const COLORS = ['#ef4444', '#f59e0b', '#3b82f6', '#22c55e'];
const STATUS_COLORS = ['#06b6d4', '#8b5cf6', '#22c55e', '#64748b'];

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalTickets: 0,
    openTickets: 0,
    breachedTickets: 0,
    totalUsers: 0
  });
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [ticketsRes, usersRes, breachedRes, analyticsRes] = await Promise.all([
          ticketAPI.getTickets({}),
          userAPI.getUsers({}),
          ticketAPI.getSlaBreached(),
          analyticsAPI.getAdminOverview()
        ]);

        const allTickets = ticketsRes.data.data.tickets || [];
        const allUsers = usersRes.data.data || [];
        const analyticsData = analyticsRes.data.data;

        // Calculate counts from analytics data
        const openCount = analyticsData.statuses.find(s => s._id === 'open')?.count || 0;
        const progressCount = analyticsData.statuses.find(s => s._id === 'in_progress')?.count || 0;
        const totalTickets = analyticsData.statuses.reduce((acc, curr) => acc + curr.count, 0);

        setStats({
          totalTickets: totalTickets,
          openTickets: openCount + progressCount,
          breachedTickets: breachedRes.data.data.length,
          totalUsers: allUsers.length
        });

        // Sort status data in fixed order
        const statusOrder = { 'open': 1, 'in_progress': 2, 'resolved': 3, 'closed': 4 };
        const sortedStatuses = [...analyticsData.statuses].sort((a, b) => 
          (statusOrder[a._id] || 99) - (statusOrder[b._id] || 99)
        );

        setAnalytics({
          ...analyticsData,
          statuses: sortedStatuses
        });
      } catch (err) {
        console.error('Failed to fetch admin stats', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  if (loading) return <div className="p-8 text-text-muted">Loading System Overview...</div>;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between pb-6 border-b border-white/5 gap-4">
        <div>
          <h1 className="font-display text-4xl font-bold text-white tracking-tight mb-2">Command Center</h1>
          <p className="text-text-muted text-lg">System-wide overview of your support operations.</p>
        </div>
        <Link to="/admin/domain-config" className="btn-primary px-6 py-2.5 text-[14px]">
          Configure Rules Engine
        </Link>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Total Tickets', val: stats.totalTickets, icon: TicketIcon, c: 'text-purple-400', b: 'border-purple-500/20', bg: 'bg-purple-500/10' },
          { label: 'Active Requests', val: stats.openTickets, icon: Activity, c: 'text-blue-400', b: 'border-blue-500/20', bg: 'bg-blue-500/10' },
          { label: 'SLA Breaches', val: stats.breachedTickets, icon: ShieldAlert, c: 'text-neon-pink', b: 'border-neon-pink/20', bg: 'bg-neon-pink/10' },
          { label: 'Active Users', val: stats.totalUsers, icon: Users, c: 'text-green-400', b: 'border-green-500/20', bg: 'bg-green-500/10' },
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
            <div className="text-4xl font-display font-bold text-white mb-2">{stat.val}</div>
            <div className="text-text-muted font-display uppercase tracking-widest text-[11px] font-bold">{stat.label}</div>
          </motion.div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Ticket Volume Trend */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-card p-6 border border-white/5"
        >
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <TrendingUp className="w-5 h-5 text-neon-cyan" />
              <h2 className="font-display text-xl font-bold text-white">Ticket Volume</h2>
            </div>
            <span className="text-[11px] font-bold text-text-muted uppercase tracking-widest">Last 7 Days</span>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={analytics?.trends || []}>
                <defs>
                  <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                <XAxis 
                  dataKey="_id" 
                  stroke="#ffffff40" 
                  fontSize={10} 
                  tickFormatter={(val) => val.split('-').slice(1).join('/')}
                />
                <YAxis stroke="#ffffff40" fontSize={10} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0a0a0a', border: '1px solid #ffffff10', borderRadius: '12px' }}
                  itemStyle={{ color: '#06b6d4' }}
                />
                <Area type="monotone" dataKey="count" stroke="#06b6d4" fillOpacity={1} fill="url(#colorCount)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Priority Distribution */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="glass-card p-6 border border-white/5"
        >
          <div className="flex items-center gap-3 mb-8">
            <ShieldAlert className="w-5 h-5 text-neon-pink" />
            <h2 className="font-display text-xl font-bold text-white">Urgency Mix</h2>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={analytics?.priorities || []}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="count"
                  nameKey="_id"
                >
                  {analytics?.priorities?.map((entry, index) => {
                    const priority = entry._id?.toLowerCase();
                    let color = '#94a3b8'; // fallback
                    if (priority === 'critical') color = '#ef4444';
                    else if (priority === 'high') color = '#f59e0b';
                    else if (priority === 'medium') color = '#3b82f6';
                    else if (priority === 'low') color = '#22c55e';
                    
                    return <Cell key={`cell-${index}`} fill={color} />;
                  })}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0a0a0a', border: '1px solid #ffffff10', borderRadius: '12px' }}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', paddingTop: '20px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Status Distribution */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="glass-card p-6 border border-white/5"
        >
          <div className="flex items-center gap-3 mb-8">
            <Activity className="w-5 h-5 text-neon-purple" />
            <h2 className="font-display text-xl font-bold text-white">Status Breakdown</h2>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analytics?.statuses || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                <XAxis dataKey="_id" stroke="#ffffff40" fontSize={10} tickFormatter={(v) => v.replace('_', ' ').toUpperCase()} />
                <YAxis stroke="#ffffff40" fontSize={10} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0a0a0a', border: '1px solid #ffffff10', borderRadius: '12px' }}
                />
                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                  {analytics?.statuses?.map((entry, index) => {
                    const status = entry._id?.toLowerCase();
                    let color = '#94a3b8'; // fallback
                    if (status === 'open') color = '#06b6d4';
                    else if (status === 'in_progress') color = '#f59e0b';
                    else if (status === 'resolved') color = '#22c55e';
                    else if (status === 'closed') color = '#64748b';
                    
                    return <Cell key={`cell-${index}`} fill={color} />;
                  })}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Domain Distribution */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="glass-card p-6 border border-white/5"
        >
          <div className="flex items-center gap-3 mb-8">
            <BarChart3 className="w-5 h-5 text-amber-500" />
            <h2 className="font-display text-xl font-bold text-white">Volume by Domain</h2>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analytics?.domains || []} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" horizontal={false} />
                <XAxis type="number" stroke="#ffffff40" fontSize={10} />
                <YAxis dataKey="_id" type="category" stroke="#ffffff40" fontSize={10} tickFormatter={(v) => v.toUpperCase()} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0a0a0a', border: '1px solid #ffffff10', borderRadius: '12px' }}
                />
                <Bar dataKey="count" fill="#f59e0b" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      {/* Quick Actions at Bottom */}
      <div className="pt-8">
        <h2 className="font-display text-xl font-bold text-white mb-6">Management Links</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { to: '/admin/tickets', label: 'Tickets', color: 'hover:border-neon-cyan/50', icon: TicketIcon, desc: 'Global queue' },
            { to: '/admin/users', label: 'Team', color: 'hover:border-neon-purple/50', icon: Users, desc: 'Manage agents' },
            { to: '/admin/domain-config', label: 'AI Rules', color: 'hover:border-amber-500/50', icon: ShieldAlert, desc: 'Keyword engine' },
            { to: '/admin/sla-settings', label: 'SLA Polices', color: 'hover:border-neon-pink/50', icon: CheckCircle2, desc: 'Deadlines' },
          ].map((link, i) => (
            <Link key={i} to={link.to} className={`p-5 glass-card border border-white/5 rounded-xl transition-all group ${link.color}`}>
              <link.icon className="w-5 h-5 text-white/40 mb-3 group-hover:text-white transition-colors" />
              <div className="font-display font-bold text-white mb-1">{link.label}</div>
              <div className="text-[12px] text-text-muted leading-tight">{link.desc}</div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
