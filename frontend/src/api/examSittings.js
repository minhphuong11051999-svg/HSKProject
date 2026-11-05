import axiosClient from './axiosClient';

export const listExamYears = () => axiosClient.get('/exam-sittings').then((r) => r.data);

export const getExamSitting = (slug) => axiosClient.get(`/exam-sittings/${slug}`).then((r) => r.data);

export const getExamYearsForAdmin = () => axiosClient.get('/admin/exam-sittings/years').then((r) => r.data);

export const createExamYear = (payload) =>
  axiosClient.post('/admin/exam-sittings/years', payload).then((r) => r.data);

export const updateExamYear = (id, payload) =>
  axiosClient.put(`/admin/exam-sittings/years/${id}`, payload).then((r) => r.data);

export const deleteExamYear = (id) => axiosClient.delete(`/admin/exam-sittings/years/${id}`).then((r) => r.data);

export const getExamSittingForAdmin = (id) => axiosClient.get(`/admin/exam-sittings/${id}`).then((r) => r.data);

export const createExamSitting = (payload) =>
  axiosClient.post('/admin/exam-sittings', payload).then((r) => r.data);

export const updateExamSitting = (id, payload) =>
  axiosClient.put(`/admin/exam-sittings/${id}`, payload).then((r) => r.data);

export const deleteExamSitting = (id) => axiosClient.delete(`/admin/exam-sittings/${id}`).then((r) => r.data);
