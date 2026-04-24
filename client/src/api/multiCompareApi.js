import api from './axios';

const API_URL = '/multi-compare';

export const runMultiComparison = (data) => api.post(`${API_URL}/run`, data);
export const getMyComparisons = () => api.get(`${API_URL}`);
export const getComparisonById = (id) => api.get(`${API_URL}/${id}`);
