import api from './axios';

// Run deep JD vs Resume comparison
export const runComparison = (data) => api.post('/comparison/run', data);
