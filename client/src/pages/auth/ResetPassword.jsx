import { useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Zap, Lock, ArrowRight, Loader2, CheckCircle2 } from 'lucide-react';
import axiosInstance from '../../api/axiosInstance';

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [status, setStatus] = useState('idle'); // idle, loading, success, error
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setStatus('error');
      setMessage('Passwords do not match');
      return;
    }
    
    if (password.length < 8) {
      setStatus('error');
      setMessage('Password must be at least 8 characters long');
      return;
    }

    setStatus('loading');
    setMessage('');
    
    try {
      const response = await axiosInstance.put(`/auth/reset-password/${token}`, { password });
      setStatus('success');
      setMessage(response.data.message || 'Password has been reset successfully!');
      
      // Auto-redirect to login after a few seconds
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (err) {
      setStatus('error');
      setMessage(err.response?.data?.message || 'Failed to reset password. The link might be expired.');
    }
  };

  return (
    <div className="min-h-screen bg-[#050510] flex items-center justify-center p-6 relative overflow-hidden font-body text-text-primary">
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-neon-cyan/10 blur-[150px] rounded-full pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/4 w-[400px] h-[400px] bg-neon-purple/10 blur-[120px] rounded-full pointer-events-none" />

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

        <div className="glass-card p-10 glow-cyan relative overflow-hidden">
          <h2 className="font-display text-2xl font-bold text-white mb-2 text-center">Create New Password</h2>
          <p className="text-text-muted text-[14px] mb-8 text-center">
            Your new password must be different from previous used passwords.
          </p>

          {status === 'success' ? (
            <div className="text-center py-6">
              <div className="w-16 h-16 bg-neon-cyan/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-8 h-8 text-neon-cyan" />
              </div>
              <p className="text-white font-medium mb-2">{message}</p>
              <p className="text-text-muted text-[13px] mb-6">Redirecting to login...</p>
              <Link 
                to="/login"
                className="btn-primary w-full py-3.5 inline-block text-center shadow-[0_0_20px_rgba(34,211,238,0.2)] font-display uppercase tracking-widest text-[14px]"
              >
                Login Now
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              {status === 'error' && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-xl text-[14px] text-center">
                  {message}
                </div>
              )}

              <div>
                <label className="block text-[12px] font-bold text-text-muted uppercase tracking-wider mb-2">New Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
                  <input 
                    type="password" 
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-white/[0.03] border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white focus:outline-none focus:border-neon-cyan/50 focus:bg-white/[0.05] transition-all"
                    placeholder="At least 8 characters"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[12px] font-bold text-text-muted uppercase tracking-wider mb-2">Confirm Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
                  <input 
                    type="password" 
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full bg-white/[0.03] border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white focus:outline-none focus:border-neon-cyan/50 focus:bg-white/[0.05] transition-all"
                    placeholder="Confirm your new password"
                  />
                </div>
              </div>

              <button 
                type="submit" 
                disabled={status === 'loading' || !password || !confirmPassword}
                className="w-full btn-primary bg-gradient-to-r from-neon-cyan to-blue-500 hover:from-cyan-400 hover:to-blue-400 py-3.5 mt-2 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(34,211,238,0.2)] font-display uppercase tracking-widest text-[14px]"
              >
                {status === 'loading' ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                  <>
                    Reset Password
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default ResetPassword;
