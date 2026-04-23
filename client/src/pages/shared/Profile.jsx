import { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { authAPI } from '../../api/auth';
import { User, Mail, Shield, Building, Calendar, Save, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';

const Profile = () => {
  const { user, login } = useAuth();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccess('');
    setError('');
    
    try {
      const res = await authAPI.updateMe(formData);
      // Update local context with new user data but keep the token
      login(localStorage.getItem('token'), res.data.data);
      setSuccess('Profile updated successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const ROLE_COLORS = {
    admin: 'from-neon-purple to-neon-pink',
    agent: 'from-neon-cyan to-blue-500',
    customer: 'from-green-400 to-emerald-600',
  };

  const roleColor = ROLE_COLORS[user?.role] || 'from-gray-400 to-gray-600';

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      {/* Header / Banner */}
      <div className="relative h-48 rounded-3xl overflow-hidden bg-white/[0.02] border border-white/5 flex items-end p-8">
        <div className="absolute inset-0 bg-gradient-to-t from-[#050510] to-transparent z-10" />
        <div className={`absolute inset-0 bg-gradient-to-br ${roleColor} opacity-10 z-0`} />
        
        <div className="flex flex-col md:flex-row items-center gap-6 relative z-20">
          <div className={`w-24 h-24 rounded-2xl bg-gradient-to-br ${roleColor} flex items-center justify-center text-3xl font-bold text-white shadow-2xl shadow-black/50 border-2 border-white/10`}>
            {user?.name.charAt(0)}
          </div>
          <div className="text-center md:text-left">
            <h1 className="text-3xl font-bold text-white mb-1">{user?.name}</h1>
            <div className="flex flex-wrap justify-center md:justify-start gap-3">
              <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[11px] font-bold uppercase tracking-widest text-text-muted flex items-center gap-1.5">
                <Shield className="w-3 h-3" /> {user?.role}
              </span>
              <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[11px] font-bold uppercase tracking-widest text-text-muted flex items-center gap-1.5">
                <Building className="w-3 h-3" /> {user?.domain}
              </span>
              <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[11px] font-bold uppercase tracking-widest text-text-muted flex items-center gap-1.5">
                <Calendar className="w-3 h-3" /> Joined {user?.createdAt ? format(new Date(user.createdAt), 'MMM yyyy') : 'Recently'}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Settings Form */}
        <div className="lg:col-span-2 space-y-6">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card p-8 border border-white/5"
          >
            <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <User className="w-5 h-5 text-neon-cyan" />
              Personal Information
            </h3>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[12px] font-bold uppercase tracking-widest text-text-muted px-1">Full Name</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                  <input 
                    type="text" 
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-white/[0.03] border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white focus:outline-none focus:border-neon-cyan/50 transition-all"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[12px] font-bold uppercase tracking-widest text-text-muted px-1">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                  <input 
                    type="email" 
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full bg-white/[0.03] border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white focus:outline-none focus:border-neon-cyan/50 transition-all"
                  />
                </div>
              </div>

              {success && (
                <div className="flex items-center gap-2 p-4 bg-green-500/10 border border-green-500/20 rounded-xl text-green-400 text-[14px]">
                  <CheckCircle2 className="w-4 h-4" /> {success}
                </div>
              )}

              {error && (
                <div className="flex items-center gap-2 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-[14px]">
                  <AlertCircle className="w-4 h-4" /> {error}
                </div>
              )}

              <div className="flex justify-end">
                <button 
                  type="submit" 
                  disabled={loading}
                  className="btn-primary px-8 py-3 rounded-xl flex items-center gap-2 disabled:opacity-50"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  Save Changes
                </button>
              </div>
            </form>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="glass-card p-8 border border-white/5 opacity-50 cursor-not-allowed"
          >
            <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <Shield className="w-5 h-5 text-neon-pink" />
              Security & Password
            </h3>
            <p className="text-text-muted text-[14px] mb-6">Password management is currently locked by system administrator.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="h-12 bg-white/5 rounded-xl border border-white/5" />
              <div className="h-12 bg-white/5 rounded-xl border border-white/5" />
            </div>
          </motion.div>
        </div>

        {/* Sidebar Stats */}
        <div className="space-y-6">
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="glass-card p-6 border border-white/5"
          >
            <h4 className="text-[11px] font-bold uppercase tracking-widest text-text-muted mb-6">Account Status</h4>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-white/[0.02] rounded-lg">
                <span className="text-[13px] text-text-secondary">Account Status</span>
                <span className="flex items-center gap-1.5 text-[11px] font-bold text-green-500 uppercase tracking-wider">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-500" /> Active
                </span>
              </div>
              <div className="flex items-center justify-between p-3 bg-white/[0.02] rounded-lg">
                <span className="text-[13px] text-text-secondary">Two-Factor Auth</span>
                <span className="text-[11px] font-bold text-text-muted uppercase tracking-wider">Disabled</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-white/[0.02] rounded-lg">
                <span className="text-[13px] text-text-secondary">API Access</span>
                <span className="text-[11px] font-bold text-text-muted uppercase tracking-wider">Standard</span>
              </div>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="glass-card p-6 border border-white/5 glow-cyan"
          >
            <h4 className="text-[11px] font-bold uppercase tracking-widest text-white mb-6">System Identity</h4>
            <div className="space-y-4 text-[13px]">
              <div>
                <div className="text-text-muted text-[11px] uppercase tracking-wider mb-1">User ID</div>
                <div className="font-mono text-white break-all bg-black/30 p-2 rounded border border-white/10">
                  {user?._id}
                </div>
              </div>
              <div>
                <div className="text-text-muted text-[11px] uppercase tracking-wider mb-1">Tenant ID</div>
                <div className="font-mono text-white break-all bg-black/30 p-2 rounded border border-white/10">
                  {user?.tenantId}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
