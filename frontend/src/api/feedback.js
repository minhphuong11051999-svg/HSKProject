import axiosClient from './axiosClient';

export const sendFeedback = (data) => axiosClient.post('/feedback', data).then((r) => r.data);
export const listFeedback = () => axiosClient.get('/feedback').then((r) => r.data);
export const markFeedback = (id, isRead) => axiosClient.patch(`/feedback/${id}`, { isRead }).then((r) => r.data);
export const deleteFeedback = (id) => axiosClient.delete(`/feedback/${id}`);
