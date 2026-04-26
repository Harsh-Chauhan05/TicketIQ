import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Zap, Mail, ArrowLeft, Loader2, CheckCircle2 } from 'lucide-react';
import axiosInstance from '../../api/axiosInstance';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('idle'); // idle, loading, success, error
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('loading');
    setMessage('');
    
    try {
      const response = await axiosInstance.post('/auth/forgot-password', { email });
      setStatus('success');
      setMessage(response.data.message || 'Password reset link sent to your email.');
    } catch (err) {
      setStatus('error');
      setMessage(err.response?.data?.message || 'Failed to send reset email. Please try again.');
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
          <h2 className="font-display text-2xl font-bold text-white mb-2 text-center">Reset Password</h2>
          <p className="text-text-muted text-[14px] mb-8 text-center">
            Enter your email address and we'll send you a link to reset your password.
          </p>

          {status === 'success' ? (
            <div className="text-center py-6">
              <div className="w-16 h-16 bg-neon-cyan/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-8 h-8 text-neon-cyan" />
              </div>
              <p className="text-white font-medium mb-6">{message}</p>
              <Link 
                to="/login"
                className="btn-primary w-full py-3.5 inline-block text-center shadow-[0_0_20px_rgba(34,211,238,0.2)] font-display uppercase tracking-widest text-[14px]"
              >
                Return to Login
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {status === 'error' && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-xl text-[14px] text-center">
                  {message}
                </div>
              )}

              <div>
                <label className="block text-[12px] font-bold text-text-muted uppercase tracking-wider mb-2">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
                  <input 
                    type="email" 
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-white/[0.03] border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white focus:outline-none focus:border-neon-cyan/50 focus:bg-white/[0.05] transition-all"
                    placeholder="name@company.com"
                  />
                </div>
              </div>

              <button 
                type="submit" 
                disabled={status === 'loading' || !email}
                className="w-full btn-primary bg-gradient-to-r from-neon-cyan to-blue-500 hover:from-cyan-400 hover:to-blue-400 py-3.5 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(34,211,238,0.2)] font-display uppercase tracking-widest text-[14px]"
              >
                {status === 'loading' ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Send Reset Link'}
              </button>
            </form>
          )}

          <div className="mt-8 pt-8 border-t border-white/5 text-center">
            <Link to="/login" className="inline-flex items-center gap-2 text-[14px] text-text-muted hover:text-white transition-colors">
              <ArrowLeft className="w-4 h-4" /> Back to Login
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default ForgotPassword;
