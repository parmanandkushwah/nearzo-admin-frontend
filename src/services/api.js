import axios from 'axios';

const normalizeApiBase = (url = '') => url.replace(/\/api\/?$/, '').replace(/\/$/, '');

const API_BASE = import.meta.env.VITE_API_URL?.replace(/\/+$/, '').replace(/\/api\/api$/, '/api') || '';
const baseURL = API_BASE || '/api';

export const getMediaUrl = (path) => {
  if (!path) return '';
  if (/^(https?:|blob:)/i.test(path)) return path;

  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  const backendUrl = normalizeApiBase(import.meta.env.VITE_API_URL || '');

  if (backendUrl) {
    return `${backendUrl}${normalizedPath}`;
  }

  return normalizedPath;
};

const api = axios.create({
  baseURL,
  withCredentials: true
});

export default api;
