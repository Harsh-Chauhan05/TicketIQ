import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Zap, Mail, Lock, User, Building, ArrowRight, Loader2, Globe, Shield } from 'lucide-react';
import { authAPI } from '../../api/auth';
import { useAuth } from '../../context/AuthContext';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    domain: 'ecommerce', // Matches backend enum
    role: 'customer'     // Default to customer
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await authAPI.register(formData);
      const user = res.data.data.user;
      login(res.data.data.token, user);
      
      // Dynamic navigation based on role
      if (user.role === 'admin') navigate('/admin/dashboard');
      else if (user.role === 'agent') navigate('/agent/dashboard');
      else navigate('/customer/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050510] flex items-center justify-center p-6 relative overflow-hidden font-body text-text-primary">
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-neon-cyan/10 blur-[150px] rounded-full pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/4 w-[400px] h-[400px] bg-neon-purple/10 blur-[120px] rounded-full pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-lg relative z-10 my-8"
      >
        <Link to="/" className="flex items-center justify-center gap-2 mb-8 group">
          <div className="w-10 h-10 rounded-xl gradient-cta flex items-center justify-center shadow-[0_0_20px_rgba(168,85,247,0.4)] group-hover:scale-110 transition-transform">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <span className="font-display text-2xl font-bold text-white tracking-tight">TicketIQ</span>
        </Link>

        <div className="glass-card p-10 glow-cyan">
          <h2 className="font-display text-2xl font-bold text-white mb-2 text-center">Create your workspace</h2>
          <p className="text-text-muted text-[14px] mb-8 text-center">Sign up to start prioritizing tickets intelligently</p>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-xl mb-6 text-[14px] flex items-center justify-center text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-[12px] font-bold text-text-muted uppercase tracking-wider mb-2">Full Name</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
                  <input
                    type="text"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full bg-white/[0.03] border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white focus:outline-none focus:border-neon-cyan/50 focus:bg-white/[0.05] transition-all"
                    placeholder="John Doe"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[12px] font-bold text-text-muted uppercase tracking-wider mb-2">Join As</label>
                <div className="relative">
                  <Shield className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted pointer-events-none" />
                  <select
                    name="role"
                    required
                    value={formData.role}
                    onChange={handleChange}
                    className="w-full bg-[#13151f] border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white focus:outline-none focus:border-neon-cyan/50 transition-all appearance-none cursor-pointer"
                  >
                    <option value="customer">Customer</option>
                    <option value="agent">Support Agent</option>
                    <option value="admin">Workspace Admin</option>
                  </select>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-[12px] font-bold text-text-muted uppercase tracking-wider mb-2">Business Domain / Workspace</label>
              <div className="relative">
                <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted pointer-events-none" />
                <select
                  name="domain"
                  required
                  value={formData.domain}
                  onChange={handleChange}
                  className="w-full bg-[#13151f] border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white focus:outline-none focus:border-neon-cyan/50 transition-all appearance-none cursor-pointer"
                >
                  <option value="ecommerce">E-commerce</option>
                  <option value="banking">Banking & Finance</option>
                  <option value="healthcare">Healthcare</option>
                  <option value="edtech">Education Tech</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-[12px] font-bold text-text-muted uppercase tracking-wider mb-2">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
                <input
                  type="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full bg-white/[0.03] border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white focus:outline-none focus:border-neon-cyan/50 focus:bg-white/[0.05] transition-all"
                  placeholder="name@company.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-[12px] font-bold text-text-muted uppercase tracking-wider mb-2">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
                <input
                  type="password"
                  name="password"
                  required
                  minLength={8}
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full bg-white/[0.03] border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white focus:outline-none focus:border-neon-cyan/50 focus:bg-white/[0.05] transition-all"
                  placeholder="At least 8 characters"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary bg-gradient-to-r from-neon-cyan to-blue-500 hover:from-cyan-400 hover:to-blue-400 py-3.5 mt-4 flex items-center justify-center gap-2 group disabled:opacity-70 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(34,211,238,0.2)] font-display uppercase tracking-widest text-[14px]"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                <>
                  Create Account
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
            <p className="text-[12px] text-text-muted text-center mt-4">
              By registering, you agree to our Terms of Service. Your workspace will be initialized with domain-specific rules.
            </p>
          </form>

          <div className="mt-8 pt-8 border-t border-white/5 text-center">
            <p className="text-[14px] text-text-muted">
              Already have an account?{' '}
              <Link to="/login" className="text-white hover:text-neon-cyan transition-colors font-medium">Sign in</Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Register;
