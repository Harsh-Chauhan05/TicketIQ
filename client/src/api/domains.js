import axiosInstance from './axiosInstance';

export const domainAPI = {
  getDomain: () => axiosInstance.get('/domains'),
  addRule: (data) => axiosInstance.post('/domains/rules', data),
  updateRule: (id, data) => axiosInstance.put(`/domains/rules/${id}`, data),
  deleteRule: (id) => axiosInstance.delete(`/domains/rules/${id}`),
};
