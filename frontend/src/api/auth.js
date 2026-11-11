import axiosClient from './axiosClient';

export const updateMe = (payload) => axiosClient.patch('/auth/me', payload).then((r) => r.data);

export const changePassword = (currentPassword, newPassword) =>
  axiosClient.post('/auth/change-password', { currentPassword, newPassword }).then((r) => r.data);
