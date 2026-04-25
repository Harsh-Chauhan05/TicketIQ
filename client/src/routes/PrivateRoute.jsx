import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const PrivateRoute = () => {
  const { user, loading } = useAuth();

  if (loading) return <div className="h-screen w-full flex items-center justify-center bg-[#09090b] text-white">Loading...</div>;

  if (!user) return <Navigate to="/login" replace />;

  if (!user.isVerified) {
    return (
      <div className="min-h-screen bg-[#050510] flex items-center justify-center p-6 relative font-body text-text-primary">
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-neon-cyan/10 blur-[120px] rounded-full pointer-events-none" />
        <div className="glass-card p-10 max-w-md w-full text-center glow-cyan relative z-10">
          <div className="w-16 h-16 rounded-full bg-neon-cyan/20 flex items-center justify-center mx-auto mb-6">
            <span className="material-symbols-outlined text-neon-cyan text-3xl">mark_email_unread</span>
          </div>
          <h2 className="font-display text-2xl font-bold text-white mb-4">Email Verification Required</h2>
          <p className="text-text-muted text-sm mb-6">
            You must verify your email address before accessing the TicketIQ platform. Please check your inbox for the verification link.
          </p>
          <button 
            onClick={() => window.location.href = '/login'}
            className="w-full h-12 bg-neon-cyan text-black font-bold rounded-xl hover:bg-white transition-colors"
          >
            Return to Login
          </button>
        </div>
      </div>
    );
  }

  return <Outlet />;
};

export default PrivateRoute;
