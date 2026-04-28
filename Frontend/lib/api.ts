import axios from 'axios';

const api = axios.create({ baseURL: 'https://umaraidevs.pythonanywhere.com/api' });

api.interceptors.request.use((config) => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default api;
