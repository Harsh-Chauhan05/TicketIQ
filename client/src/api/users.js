import axiosInstance from './axiosInstance';

export const userAPI = {
  getUsers: (params) => axiosInstance.get('/users', { params }),
  getUser: (id) => axiosInstance.get(`/users/${id}`),
  updateUser: (id, data) => axiosInstance.patch(`/users/${id}`, data),
  toggleActive: (id) => axiosInstance.patch(`/users/${id}/toggle`),
  deleteUser: (id) => axiosInstance.delete(`/users/${id}`),
};
