import api from './axios';

const BASE = '/career-workspace';

export const careerWorkspaceApi = {
  // 1. Overview
  getOverview: (analysisId) => api.get(`${BASE}/${analysisId}/overview`),

  // 2. Personal Profile / Settings
  getProfile: (analysisId) => api.get(`${BASE}/${analysisId}/profile`),
  saveProfile: (analysisId, profileData) => api.post(`${BASE}/${analysisId}/profile`, profileData),

  // 3. Skill Gaps
  getSkillGaps: (analysisId) => api.get(`${BASE}/${analysisId}/skills`),

  // 4. Resume Evidence
  getEvidence: (analysisId) => api.get(`${BASE}/${analysisId}/evidence`),
  submitEvidenceFeedback: (analysisId, feedback) => api.post(`${BASE}/${analysisId}/evidence/feedback`, feedback),

  // 5. Market Insights
  getMarket: (analysisId) => api.get(`${BASE}/${analysisId}/market`),

  // 6. Adaptive Roadmap
  getRoadmap: (analysisId) => api.get(`${BASE}/${analysisId}/roadmap`),
  updateTask: (analysisId, taskId, updates) => api.patch(`${BASE}/${analysisId}/roadmap/task/${taskId}`, updates),
  replaceTaskResource: (analysisId, taskId) => api.patch(`${BASE}/${analysisId}/roadmap/task/${taskId}/replace-resource`),
  replanWeek: (analysisId, payload) => api.post(`${BASE}/${analysisId}/roadmap/replan-week`, payload),

  // 7. Personalized Resources
  getResources: (analysisId) => api.get(`${BASE}/${analysisId}/resources`),
  submitResourceFeedback: (analysisId, feedback) => api.post(`${BASE}/${analysisId}/resources/feedback`, feedback),

  // 8. Diagnostic Assessments
  getAssessmentQuestions: (analysisId, skill) => api.get(`${BASE}/${analysisId}/assessments`, { params: { skill } }),
  submitAssessment: (analysisId, payload) => api.post(`${BASE}/${analysisId}/assessments/submit`, payload),

  // 9. Progress Tracking
  getProgress: (analysisId) => api.get(`${BASE}/${analysisId}/progress`),
};

export default careerWorkspaceApi;
