import api from './api';

// ==========================================
// Follow-Up Listing & Aggregation
// ==========================================

export const getFollowUps = async (page = 1, limit = 20, search = '', status = '') => {
  let url = `/followups?page=${page}&limit=${limit}`;
  if (search) url += `&search=${encodeURIComponent(search)}`;
  if (status && status !== 'All Status') url += `&status=${encodeURIComponent(status)}`;
  
  const response = await api.get(url);
  return response.data;
};

export const getFollowUpById = async (id) => {
  const response = await api.get(`/followups/${id}`);
  return response.data;
};

export const searchFollowUps = async (query) => {
  const response = await api.get(`/followups/search?q=${encodeURIComponent(query)}`);
  return response.data;
};

export const getDashboardCounts = async () => {
  const response = await api.get('/followups/dashboard/counts');
  return response.data;
};

export const getUnreadFollowupCount = async () => {
  const response = await api.get('/followups/unread-count');
  return response.data;
};

// ==========================================
// Follow-Up Status & Workflow Actions
// ==========================================

export const extendFollowup = async (id, days, reason) => {
  const response = await api.put(`/followups/${id}/extend`, { days, reason });
  return response.data;
};

export const closeFollowup = async (id) => {
  const response = await api.put(`/followups/${id}/close`);
  return response.data;
};

export const reopenFollowup = async (id) => {
  const response = await api.put(`/followups/${id}/reopen`);
  return response.data;
};

export const referFollowup = async (id, doctorId) => {
  const response = await api.put(`/followups/${id}/refer`, { doctorId });
  return response.data;
};

export const scheduleFollowup = async (id, scheduleData) => {
  const response = await api.post(`/followups/${id}/schedule`, scheduleData);
  return response.data;
};

// ==========================================
// Follow-Up Chat & Messaging
// ==========================================

export const getFollowUpMessages = async (id) => {
  const response = await api.get(`/followups/${id}/messages`);
  return response.data;
};

export const sendFollowUpMessage = async (id, messageData) => {
  const response = await api.post(`/followups/${id}/messages`, messageData);
  return response.data;
};

export const markMessageAsRead = async (messageId) => {
  const response = await api.put(`/followups/messages/${messageId}/read`);
  return response.data;
};