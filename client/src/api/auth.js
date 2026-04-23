import axiosInstance from './axiosInstance';

export const authAPI = {
  register: (data) => axiosInstance.post('/auth/register', data),
  login: (credentials) => axiosInstance.post('/auth/login', credentials),
  getMe: () => axiosInstance.get('/auth/me'),
  updateMe: (data) => axiosInstance.patch('/auth/me', data),
  logout: () => axiosInstance.post('/auth/logout'),
};
