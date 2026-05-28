import axios from 'axios';

export const API_BASE_URL = (process.env.REACT_APP_API_BASE_URL || '').replace(/\/$/, '');

export const apiClient = axios.create({
  baseURL: `${API_BASE_URL}/ik/customer`,
  withCredentials: true,
  timeout: 15000,
});

apiClient.interceptors.response.use(
  (res) => res,
  (err) => {
    const msg = err.response?.data?.message || err.message || 'Request failed';
    return Promise.reject(new Error(msg));
  },
);

export const apiGet = (path, config = {}) =>
  apiClient.get(path, config).then((r) => r.data);

export const uploadsUrl = (urlPath) => {
  const p = String(urlPath || '');
  if (/^https?:\/\//i.test(p)) return p;
  const trimmed = p.replace(/^\/+/, '');
  const normalized = trimmed.startsWith('uploads/') ? trimmed : `uploads/${trimmed}`;
  return `${API_BASE_URL}/${normalized}`;
};
