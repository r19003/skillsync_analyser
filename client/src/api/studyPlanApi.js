import api from './axios';

// Generate or fetch a study plan
export const generateStudyPlan = (analysisId) => api.post('/study-plan/generate', { analysisId });

// Fetch a specific study plan
export const getStudyPlan = (analysisId) => api.get(`/study-plan/${analysisId}`);
