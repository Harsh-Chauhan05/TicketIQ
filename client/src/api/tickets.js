import axiosInstance from './axiosInstance';

export const ticketAPI = {
  createTicket: (data) => axiosInstance.post('/tickets', data),
  getTickets: (params) => axiosInstance.get('/tickets', { params }),
  getTicket: (id) => axiosInstance.get(`/tickets/${id}`),
  updateStatus: (id, status) => axiosInstance.patch(`/tickets/${id}/status`, { status }),
  overridePriority: (id, priority, reason) => axiosInstance.patch(`/tickets/${id}/priority`, { priority, reason }),
  assignTicket: (id, agentId) => axiosInstance.patch(`/tickets/${id}/assign`, { agentId }),
  addComment: (id, data) => axiosInstance.post(`/tickets/${id}/comment`, data),
  addNote: (id, note) => axiosInstance.post(`/tickets/${id}/note`, { note }),
  getSlaBreached: () => axiosInstance.get('/tickets/sla/breached'),
  getSlaAtRisk: () => axiosInstance.get('/tickets/sla/atrisk'),
  getSlaOnTrack: () => axiosInstance.get('/tickets/sla/ontrack'),
  searchTickets: (q) => axiosInstance.get('/tickets/search', { params: { q } }),
};
