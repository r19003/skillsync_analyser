import axios from 'axios';

const API = '/api/deep-report';

const getHeaders = () => ({
  headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
});

/**
 * Trigger full Grok + Gemini generation for an analysis
 * POST /api/deep-report/generate
 */
export const generateDeepReport = (analysisId, options = {}) =>
  axios.post(`${API}/generate`, { analysisId, ...options }, getHeaders());

/**
 * Fetch existing deep report for an analysis
 * GET /api/deep-report/:analysisId
 */
export const getDeepReport = (analysisId) =>
  axios.get(`${API}/${analysisId}`, getHeaders());

/**
 * Toggle a task status inside an AdvStudyPlan week
 * PATCH /api/deep-report/task/:taskId
 */
export const updateAdvTaskStatus = (taskId, status, studyPlanId) =>
  axios.patch(`${API}/task/${taskId}`, { status, studyPlanId }, getHeaders());

/**
 * Fetch an AdvStudyPlan directly by its plan _id
 * GET /api/deep-report/study-plan/:planId
 */
export const getStudyPlanById = (planId) =>
  axios.get(`${API}/study-plan/${planId}`, getHeaders());

/**
 * Toggle milestone status
 * PATCH /api/deep-report/milestone/:milestoneId
 */
export const updateMilestoneStatus = (milestoneId, status, studyPlanId) =>
  axios.patch(`${API}/milestone/${milestoneId}`, { status, studyPlanId }, getHeaders());
