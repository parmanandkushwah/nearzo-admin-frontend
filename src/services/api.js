import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL?.replace(/\/$/, '') || '';
const baseURL = API_BASE || '/api';

const api = axios.create({
  baseURL,
  withCredentials: true
});

export default api;
