// Centralized Production & Development API Configuration
const rawApiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
export const BASE_URL = rawApiUrl.replace(/\/$/, '');
export const API_URL = `${BASE_URL}/api`;
export const SOCKET_URL = BASE_URL;
