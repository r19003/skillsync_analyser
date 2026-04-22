import axios from 'axios';

const API_URL = '/api/multi-compare';

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return { headers: { Authorization: `Bearer ${token}` } };
};

export const runMultiComparison = (data) => axios.post(`${API_URL}/run`, data, getAuthHeaders());
export const getMyComparisons = () => axios.get(`${API_URL}`, getAuthHeaders());
export const getComparisonById = (id) => axios.get(`${API_URL}/${id}`, getAuthHeaders());
