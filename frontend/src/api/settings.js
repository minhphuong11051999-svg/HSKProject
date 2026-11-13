import axiosClient from './axiosClient';

export const getSettings = () => axiosClient.get('/settings').then((r) => r.data);

export const checkDiscount = (code) => axiosClient.post('/settings/discount', { code }).then((r) => r.data);

export const updateSettings = (patch) => axiosClient.put('/settings', patch).then((r) => r.data);
