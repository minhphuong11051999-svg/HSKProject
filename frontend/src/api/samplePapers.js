import axiosClient from './axiosClient';

export const listSamplePapers = () => axiosClient.get('/sample-papers').then((r) => r.data);

export const getSamplePaper = (slug) => axiosClient.get(`/sample-papers/${slug}`).then((r) => r.data);

export const getSamplePaperForAdmin = (id) => axiosClient.get(`/admin/sample-papers/${id}`).then((r) => r.data);

export const createSamplePaper = (payload) =>
  axiosClient.post('/admin/sample-papers', payload).then((r) => r.data);

export const updateSamplePaper = (id, payload) =>
  axiosClient.put(`/admin/sample-papers/${id}`, payload).then((r) => r.data);

export const deleteSamplePaper = (id) => axiosClient.delete(`/admin/sample-papers/${id}`).then((r) => r.data);
