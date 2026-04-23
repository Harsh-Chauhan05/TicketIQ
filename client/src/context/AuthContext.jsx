import { createContext, useState, useEffect, useContext } from 'react';
import { authAPI } from '../api/auth';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMe = async () => {
      try {
        if (token) {
          const res = await authAPI.getMe();
          setUser(res.data.data);
        }
      } catch (error) {
        console.error('Failed to authenticate');
        setToken(null);
        localStorage.removeItem('token');
      } finally {
        setLoading(false);
      }
    };
    fetchMe();
  }, [token]);

  const login = (newToken, userData) => {
    setToken(newToken);
    setUser(userData);
    localStorage.setItem('token', newToken);
  };

  const logout = async () => {
    try {
      await authAPI.logout();
    } catch (e) {
      console.error(e);
    }
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
