import axiosInstance from './axiosInstance';

export const notificationAPI = {
  getNotifications: () => axiosInstance.get('/notifications'),
  markAllRead: () => axiosInstance.patch('/notifications/read-all'),
  markRead: (id) => axiosInstance.patch(`/notifications/${id}/read`),
};
