import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const PrivateRoute = () => {
  const { user, loading } = useAuth();

  if (loading) return <div className="h-screen w-full flex items-center justify-center bg-[#09090b] text-white">Loading...</div>;

  return user ? <Outlet /> : <Navigate to="/login" replace />;
};

export default PrivateRoute;
