import axiosInstance from './axiosInstance';

export const analyticsAPI = {
  getAdminOverview: () => axiosInstance.get('/analytics/admin-overview'),
};
