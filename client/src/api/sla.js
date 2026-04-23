import axiosInstance from './axiosInstance';

export const slaAPI = {
  getPolicies: () => axiosInstance.get('/sla/policies'),
  createPolicy: (data) => axiosInstance.post('/sla/policies', data),
  updatePolicy: (id, data) => axiosInstance.put(`/sla/policies/${id}`, data),
  getReports: (params) => axiosInstance.get('/sla/reports', { params }),
};
