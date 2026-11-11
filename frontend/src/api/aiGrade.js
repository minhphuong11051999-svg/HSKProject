import axiosClient from './axiosClient';

// AI grading can take a while (the model reads the paper's criteria and the whole draft).
export const gradeWithAi = ({ samplePaperId, examSittingId, text }) =>
  axiosClient.post('/ai-grade', { samplePaperId, examSittingId, text }, { timeout: 180000 }).then((r) => r.data);
