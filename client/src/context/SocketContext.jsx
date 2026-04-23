import { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext();

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }) => {
  const { user } = useAuth();
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    if (user) {
      const newSocket = io(import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000', {
        withCredentials: true,
      });

      newSocket.on('connect', () => {
        console.log('🔌 Connected to Socket.io');
        // Join private user room
        newSocket.emit('join', user._id);
        // Join tenant room
        if (user.tenantId) {
          newSocket.emit('joinTenant', user.tenantId);
        }
      });

      setSocket(newSocket);

      return () => {
        newSocket.close();
        console.log('🔌 Socket connection closed');
      };
    }
  }, [user]);

  return (
    <SocketContext.Provider value={socket}>
      {children}
    </SocketContext.Provider>
  );
};
