import api from './axios';

// Generate or fetch a report for a given analysis
export const generateReport = (analysisId) => api.post('/report/generate', { analysisId });

// Fetch a specific report
export const getReport = (analysisId) => api.get(`/report/${analysisId}`);
