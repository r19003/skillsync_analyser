import api from './axios';

// Upload PDF resume (multipart/form-data)
export const uploadResume = (formData) =>
  api.post('/resume/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

// Get all resumes for the current user
export const getMyResumes = () => api.get('/resume');

// Get a single resume by ID
export const getResumeById = (id) => api.get(`/resume/${id}`);

// Delete a resume
export const deleteResume = (id) => api.delete(`/resume/${id}`);
