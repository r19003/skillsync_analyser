import api from './axios';

// Run a new ATS analysis
export const createAnalysis = (data) => api.post('/analysis', data);

// Get all analyses for the current user
export const getMyAnalyses = () => api.get('/analysis');

// Get a single analysis by ID
export const getAnalysisById = (id) => api.get(`/analysis/${id}`);

// Delete an analysis
export const deleteAnalysis = (id) => api.delete(`/analysis/${id}`);
