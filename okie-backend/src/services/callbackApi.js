import api from "./api";

export const getCallbacks = () =>
  api.get("/callbacks");

export const getCallbackById = (id) =>
  api.get(`/callbacks/${id}`);

export const startCallback = (id) =>
  api.put(`/callbacks/${id}/start`);

export const updateCallback = (id, data) =>
  api.put(`/callbacks/${id}/update`, data);

export const markInquiry = (id) =>
  api.put(`/callbacks/${id}/inquiry`);

export const escalateCallback = (id) =>
  api.put(`/callbacks/${id}/escalate`);

export const completeCallback = (id) =>
  api.put(`/callbacks/${id}/complete`);

export const convertToTicket = (id) =>
  api.post(`/callbacks/${id}/convert-ticket`);