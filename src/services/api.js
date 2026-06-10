import axios from 'axios';

const stripTrailingSlashes = (url = '') => url.replace(/\/+$/, '');

const resolveApiBaseUrl = () => {
  const configured = stripTrailingSlashes(import.meta.env.VITE_API_URL || '');
  if (configured) return configured;

  // nearzo.in nginx proxies the Node app under /api/api/*
  if (import.meta.env.PROD) {
    return '/api/api';
  }

  return '/api';
};

const resolveBackendOrigin = () => {
  const configured = stripTrailingSlashes(import.meta.env.VITE_API_URL || '');

  if (/^https?:\/\//i.test(configured)) {
    return configured.replace(/(\/api)+\/?$/i, '');
  }

  if (typeof window !== 'undefined') {
    return window.location.origin;
  }

  return 'http://localhost:5000';
};

const baseURL = resolveApiBaseUrl();

export const getMediaUrl = (path) => {
  if (!path) return '';

  // Agar already full URL hai to wahi return karo
  if (/^(https?:|blob:)/i.test(path)) {
    return path;
  }

  const baseUrl = import.meta.env.VITE_IMAGE_UPLOAD_URL?.replace(/\/$/, '');
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;

  return `${baseUrl}${normalizedPath}`;
};

const api = axios.create({
  baseURL,
  withCredentials: true
});

export default api;
