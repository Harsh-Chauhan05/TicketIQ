import { createContext, useState, useEffect, useContext } from 'react';
import { useAuth } from './AuthContext';
import { useSocket } from './SocketContext';
import { notificationAPI } from '../api/notifications';

const NotificationContext = createContext();

export const useNotifications = () => useContext(NotificationContext);

export const NotificationProvider = ({ children }) => {
  const { user } = useAuth();
  const socket = useSocket();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchNotifications = async () => {
    if (!user) return;
    try {
      const res = await notificationAPI.getNotifications();
      // Only store unread notifications as per user requirement (removed from list once read)
      const unread = res.data.data.notifications.filter(n => !n.isRead);
      setNotifications(unread);
      setUnreadCount(res.data.data.unreadCount);
    } catch (err) {
      console.error('Failed to fetch notifications');
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 60000); // keep as backup, but slower
    return () => clearInterval(interval);
  }, [user]);

  useEffect(() => {
    if (socket) {
      socket.on('notification_new', (data) => {
        console.log('🔔 New notification received via socket');
        fetchNotifications();
      });

      return () => socket.off('notification_new');
    }
  }, [socket]);

  const markAllRead = async () => {
    try {
      await notificationAPI.markAllRead();
      setUnreadCount(0);
      setNotifications([]); // Remove all as they are now "read" and user wants them gone
    } catch (err) {
      console.error('Failed to mark all as read');
    }
  };

  const markRead = async (id) => {
    try {
      await notificationAPI.markRead(id);
      setUnreadCount(prev => Math.max(0, prev - 1));
      setNotifications(prev => prev.filter(n => n._id !== id));
    } catch (err) {
      console.error('Failed to mark notification as read');
    }
  };

  return (
    <NotificationContext.Provider value={{ notifications, unreadCount, markAllRead, markRead, fetchNotifications }}>
      {children}
    </NotificationContext.Provider>
  );
};
