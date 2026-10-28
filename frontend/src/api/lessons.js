import axiosClient from './axiosClient';

export const listLessons = (type) =>
  axiosClient.get('/lessons', { params: type ? { type } : {} }).then((r) => r.data);

export const getLesson = (slug) => axiosClient.get(`/lessons/${slug}`).then((r) => r.data);

export const submitExercise = (payload) => axiosClient.post('/submissions', payload).then((r) => r.data);

export const listMySubmissions = (lessonSlug) =>
  axiosClient.get(lessonSlug ? `/submissions/me/${lessonSlug}` : '/submissions/me').then((r) => r.data);

export const getLessonForAdmin = (id) => axiosClient.get(`/admin/lessons/${id}`).then((r) => r.data);

export const createLesson = (payload) => axiosClient.post('/admin/lessons', payload).then((r) => r.data);

export const updateLesson = (id, payload) => axiosClient.put(`/admin/lessons/${id}`, payload).then((r) => r.data);

export const deleteLesson = (id) => axiosClient.delete(`/admin/lessons/${id}`).then((r) => r.data);
