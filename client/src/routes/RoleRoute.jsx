import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const RoleRoute = ({ allowedRoles }) => {
  const { user, loading } = useAuth();

  if (loading) return <div className="h-screen flex items-center justify-center bg-[#09090b]">Loading...</div>;

  if (!user) return <Navigate to="/login" replace />;

  if (!allowedRoles.includes(user.role)) {
    // Redirect to their respective dashboard
    if (user.role === 'customer') return <Navigate to="/customer/dashboard" replace />;
    if (user.role === 'agent') return <Navigate to="/agent/dashboard" replace />;
    if (user.role === 'admin') return <Navigate to="/admin/dashboard" replace />;
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default RoleRoute;
