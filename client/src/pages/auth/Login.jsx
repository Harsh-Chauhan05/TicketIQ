import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Zap, Mail, Lock, ArrowRight, Loader2 } from 'lucide-react';
import { authAPI } from '../../api/auth';
import { useAuth } from '../../context/AuthContext';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await authAPI.login({ email, password });
      login(res.data.data.token, res.data.data.user);
      
      // Redirect based on role
      const role = res.data.data.user.role;
      if (role === 'admin') navigate('/admin/dashboard');
      else if (role === 'agent') navigate('/agent/queue');
      else navigate('/customer/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050510] flex items-center justify-center p-6 relative overflow-hidden font-body text-text-primary">
      {/* Background decorations */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-neon-purple/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-neon-cyan/5 blur-[100px] rounded-full pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md relative z-10"
      >
        <Link to="/" className="flex items-center justify-center gap-2 mb-10 group">
          <div className="w-10 h-10 rounded-xl gradient-cta flex items-center justify-center shadow-[0_0_20px_rgba(168,85,247,0.4)] group-hover:scale-110 transition-transform">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <span className="font-display text-2xl font-bold text-white tracking-tight">TicketIQ</span>
        </Link>

        <div className="glass-card p-10 glow-purple">
          <h2 className="font-display text-2xl font-bold text-white mb-2 text-center">Welcome back</h2>
          <p className="text-text-muted text-[14px] mb-8 text-center">Sign in to your account to continue</p>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-xl mb-6 text-[14px] flex items-center justify-center">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-[12px] font-bold text-text-muted uppercase tracking-wider mb-2">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-white/[0.03] border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white focus:outline-none focus:border-neon-purple/50 focus:bg-white/[0.05] transition-all"
                  placeholder="name@company.com"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-[12px] font-bold text-text-muted uppercase tracking-wider">Password</label>
                <Link to="/forgot-password" className="text-[13px] text-neon-cyan hover:text-neon-cyan/80 transition-colors">Forgot password?</Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-white/[0.03] border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white focus:outline-none focus:border-neon-purple/50 focus:bg-white/[0.05] transition-all"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary py-3.5 mt-4 flex items-center justify-center gap-2 group disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                <>
                  Sign In
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          <p className="text-center text-[14px] text-text-muted mt-8">
            Don't have an account?{' '}
            <Link to="/register" className="text-white hover:text-neon-purple transition-colors font-medium">Create an account</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
