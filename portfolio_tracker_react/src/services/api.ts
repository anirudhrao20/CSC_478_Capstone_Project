import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;
const API_KEY = import.meta.env.VITE_API_KEY;

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'x-api-key': API_KEY,
  },
});

export const getMarketStatus = () => api.get('/market_status');
export const getCompanyProfile = (ticker: string) => api.get(`/company_profile/${ticker}`);
export const getQuote = (ticker: string) => api.get(`/quote/${ticker}`);

// Add more API calls as needed