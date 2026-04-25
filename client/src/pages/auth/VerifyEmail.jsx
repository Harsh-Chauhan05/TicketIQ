import { useState, useEffect, useRef } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle2, XCircle, ArrowRight } from 'lucide-react';
import { Loading as CircleLoader } from '../../components/ui/CircleUniqueLoad';
import axiosInstance from '../../api/axiosInstance';
import { useAuth } from '../../context/AuthContext';

const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const [status, setStatus] = useState('loading'); // loading, success, error
  const [message, setMessage] = useState('');
  const hasAttempted = useRef(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage('No verification token provided.');
      return;
    }

    if (hasAttempted.current) return;
    hasAttempted.current = true;

    const verifyToken = async () => {
      try {
        const response = await axiosInstance.post('/auth/verify-email', { token });
        const { token: authToken, user } = response.data.data;
        
        login(authToken, user); // Log them in!

        setStatus('success');
        setMessage('Email verified successfully! Redirecting to dashboard...');

        // Auto-redirect after 2 seconds
        setTimeout(() => {
          if (user.role === 'admin') navigate('/admin/dashboard');
          else if (user.role === 'agent') navigate('/agent/dashboard');
          else navigate('/customer/dashboard');
        }, 2000);

      } catch (err) {
        setStatus('error');
        setMessage(err.response?.data?.message || 'Verification failed. The token may be invalid or expired.');
      }
    };

    verifyToken();
  }, [token]);

  return (
    <div className="min-h-screen bg-[#050510] flex items-center justify-center p-6 relative overflow-hidden font-body text-text-primary">
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-neon-cyan/10 blur-[150px] rounded-full pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/4 w-[400px] h-[400px] bg-neon-purple/10 blur-[120px] rounded-full pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="glass-card p-10 glow-cyan text-center">
          
          {status === 'loading' && (
            <div className="flex flex-col items-center justify-center py-8">
              <CircleLoader screenHFull={false} />
              <h2 className="font-display text-xl font-bold text-white mt-6">Verifying Email...</h2>
              <p className="text-text-muted text-sm mt-2">Please wait while we confirm your identity.</p>
            </div>
          )}

          {status === 'success' && (
            <div className="flex flex-col items-center justify-center py-4">
              <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mb-6">
                <CheckCircle2 className="w-8 h-8 text-green-500" />
              </div>
              <h2 className="font-display text-2xl font-bold text-white mb-2">Verified!</h2>
              <p className="text-text-muted text-sm mb-8">{message}</p>
              
              <div className="mt-6">
                <CircleLoader screenHFull={false} />
              </div>
            </div>
          )}

          {status === 'error' && (
            <div className="flex flex-col items-center justify-center py-4">
              <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center mb-6">
                <XCircle className="w-8 h-8 text-red-500" />
              </div>
              <h2 className="font-display text-2xl font-bold text-white mb-2">Verification Failed</h2>
              <p className="text-text-muted text-sm mb-8">{message}</p>
              
              <Link 
                to="/register"
                className="w-full h-12 bg-white/5 border border-white/10 text-white font-bold rounded-xl flex items-center justify-center hover:bg-white/10 transition-colors"
              >
                Back to Registration
              </Link>
            </div>
          )}

        </div>
      </motion.div>
    </div>
  );
};

export default VerifyEmail;
