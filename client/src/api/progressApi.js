import api from './axios';

// Get the progress overview
export const getProgress = (analysisId) => api.get(`/progress/${analysisId}`);

// Update a specific task status
export const updateTaskStatus = (taskId, status) => api.patch(`/progress/task/${taskId}`, { status });

// Update a specific milestone status 
export const updateMilestoneStatus = (milestoneId, status) => api.patch(`/progress/milestone/${milestoneId}`, { status });
