import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://careergennie-ai.onrender.com';

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    Accept: 'application/json',
  },
});

// --- Global request interceptor: attach JWT from localStorage to every call ---
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('cg_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// --- Global response interceptor: normalize auth failures ---
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token missing/expired/invalid — clear it so the app can redirect to login.
      localStorage.removeItem('cg_token');
    }
    return Promise.reject(error);
  }
);

// ---------------------------------------------------------------------------
// Auth
// ---------------------------------------------------------------------------
export const signup = (payload) => api.post('/auth/signup', payload);
export const login = (payload) => api.post('/auth/login', payload);
export const getMe = () => api.get('/auth/me');

// ---------------------------------------------------------------------------
// Resume (multipart / FormData upload)
// ---------------------------------------------------------------------------
/**
 * uploadResume
 * Accepts either a plain object { rawText, jobDescription } or a FormData
 * instance (e.g. when the caller has a File to extract text from client-side).
 * Content-Type is only overridden for FormData; JSON bodies use the default.
 */
export const uploadResume = (payload) => {
  const isFormData = payload instanceof FormData;
  return api.post('/resume/upload', payload, {
    headers: isFormData ? { 'Content-Type': 'multipart/form-data' } : undefined,
  });
};
export const getMyResumes = () => api.get('/resume/mine');

// ---------------------------------------------------------------------------
// Jobs
// ---------------------------------------------------------------------------
export const listJobs = () => api.get('/jobs');
export const listMyJobs = () => api.get('/jobs/mine');
export const getJob = (jobId) => api.get(`/jobs/${jobId}`);
export const createJob = (payload) => api.post('/jobs', payload);
export const updateJob = (jobId, payload) => api.patch(`/jobs/${jobId}`, payload);
export const deleteJob = (jobId) => api.delete(`/jobs/${jobId}`);

// ---------------------------------------------------------------------------
// Applications
// ---------------------------------------------------------------------------
export const applyToJob = (payload) => api.post('/applications', payload);
export const getMyApplications = () => api.get('/applications/mine');
export const getApplicationsForJob = (jobId) => api.get(`/applications/job/${jobId}`);
export const updateApplicationStatus = (applicationId, status) =>
  api.patch(`/applications/${applicationId}/status`, { status });

// ---------------------------------------------------------------------------
// Admin
// ---------------------------------------------------------------------------
export const getAdminStats = () => api.get('/admin/stats');
export const listJobsForModeration = (status = 'pending') =>
  api.get('/admin/jobs', { params: { status } });
export const approveJob = (jobId) => api.patch(`/admin/jobs/${jobId}/approve`);
export const rejectJob = (jobId) => api.patch(`/admin/jobs/${jobId}/reject`);
export const listUsers = () => api.get('/admin/users');
export const updateUserRole = (userId, role) => api.patch(`/admin/users/${userId}/role`, { role });

export default api;
