import api from './axios';

const API = '/deep-report'; // Base URL is '/api', so we use '/deep-report'

/**
 * Trigger full Grok + Gemini generation for an analysis
 * POST /api/deep-report/generate
 */
export const generateDeepReport = (analysisId, options = {}) =>
  api.post(`${API}/generate`, { analysisId, ...options });

/**
 * Fetch existing deep report for an analysis
 * GET /api/deep-report/:analysisId
 */
export const getDeepReport = (analysisId) =>
  api.get(`${API}/${analysisId}`);

/**
 * Toggle a task status inside an AdvStudyPlan week
 * PATCH /api/deep-report/task/:taskId
 */
export const updateAdvTaskStatus = (taskId, status, studyPlanId) =>
  api.patch(`${API}/task/${taskId}`, { status, studyPlanId });

/**
 * Fetch an AdvStudyPlan directly by its plan _id
 * GET /api/deep-report/study-plan/:planId
 */
export const getStudyPlanById = (planId) =>
  api.get(`${API}/study-plan/${planId}`);

/**
 * Toggle milestone status
 * PATCH /api/deep-report/milestone/:milestoneId
 */
export const updateMilestoneStatus = (milestoneId, status, studyPlanId) =>
  api.patch(`${API}/milestone/${milestoneId}`, { status, studyPlanId });
