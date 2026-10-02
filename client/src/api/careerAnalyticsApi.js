import api from './axios';

const BASE_URL = '/career-analytics';

export const getRoleProfiles = () => api.get(`${BASE_URL}/roles`);

export const analyzeCareerReadiness = (data) => api.post(`${BASE_URL}/analyze`, data);

export const getCareerAnalysisById = (id) => api.get(`${BASE_URL}/${id}`);

export const getCareerAnalysisHistory = () => api.get(`${BASE_URL}/history`);

export const runWhatIfSimulation = (id, data) => api.post(`${BASE_URL}/${id}/simulate`, data);

export const updateRoadmapTask = (id, taskId, completed) => 
  api.patch(`${BASE_URL}/${id}/roadmap/task/${taskId}`, { completed });

export const getProgressAnalytics = (id) => api.get(`${BASE_URL}/${id}/progress`);

export const importJobPosting = (data) => api.post(`${BASE_URL}/job-data/import`, data);

export const getMarketAnalytics = (roleTrack) => api.get(`${BASE_URL}/market/${encodeURIComponent(roleTrack)}`);

// ATS Keyword Intelligence
export const getKeywordAnalytics = (id) => api.get(`${BASE_URL}/${id}/keywords`);

export const recalculateKeywords = (id, data) => api.post(`${BASE_URL}/${id}/keywords/recalculate`, data);

export const getKeywordEvidence = (id, keyword) => api.get(`${BASE_URL}/${id}/keywords/${encodeURIComponent(keyword)}/evidence`);

const careerAnalyticsApi = {
  getRoleProfiles,
  analyzeCareerReadiness,
  getCareerAnalysisById,
  getCareerAnalysisHistory,
  runWhatIfSimulation,
  updateRoadmapTask,
  getProgressAnalytics,
  importJobPosting,
  getMarketAnalytics,
  getKeywordAnalytics,
  recalculateKeywords,
  getKeywordEvidence,
};

export default careerAnalyticsApi;
