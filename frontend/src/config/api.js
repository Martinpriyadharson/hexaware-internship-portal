// Centralized Production & Development API Configuration
const getProductionOrLocalUrl = () => {
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  // Automatically resolve to live Render backend API URL when hosted on Vercel or any non-localhost domain
  if (typeof window !== 'undefined' && window.location && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
    return 'https://hexaware-internship-portal.onrender.com';
  }
  return 'http://localhost:5000';
};

const rawApiUrl = getProductionOrLocalUrl();
export const BASE_URL = rawApiUrl.replace(/\/$/, '');
export const API_URL = `${BASE_URL}/api`;
export const SOCKET_URL = BASE_URL;
