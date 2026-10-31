import axiosClient from './axiosClient';

export const listUsers = () => axiosClient.get('/admin/users').then((r) => r.data);

export const createUser = (payload) => axiosClient.post('/admin/users', payload).then((r) => r.data);

export const updateUserPlan = (id, plan) =>
  axiosClient.patch(`/admin/users/${id}/plan`, { plan }).then((r) => r.data);

export const deleteUser = (id) => axiosClient.delete(`/admin/users/${id}`).then((r) => r.data);
