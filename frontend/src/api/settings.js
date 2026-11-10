import axiosClient from './axiosClient';

export const getSettings = () => axiosClient.get('/settings').then((r) => r.data);

export const updateSettings = (patch) => axiosClient.put('/settings', patch).then((r) => r.data);
