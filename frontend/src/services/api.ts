import type { AxiosInstance } from 'axios';
import axios from 'axios';

const baseURL = import.meta.env.VITE_API_URL;
if (!baseURL) {
  throw new Error('VITE_API_URL environment variable is not set');
}

const api: AxiosInstance = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to include the auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const portfolioApi = {
  getUserPortfolio: () => api.get('/portfolios/me'),
  getPortfolio: (id: number) => api.get(`/portfolios/${id}`),
  addStock: (portfolioId: number, data: { symbol: string; quantity: number }) => 
    api.post(`/portfolios/${portfolioId}/stocks`, data),
  removeStock: (portfolioId: number, stockId: number) => 
    api.delete(`/portfolios/${portfolioId}/stocks/${stockId}`),
  getStockQuote: (symbol: string) => api.get(`/stocks/quote/${symbol}`),
  deletePortfolio: (id: number) => api.delete(`/portfolios/${id}`),
  createPortfolio: (data: { name: string; stocks: { symbol: string; quantity: number }[] }) =>
    api.post('/portfolios', data),
  getPortfolios: () => api.get('/portfolios'),
  addTransaction: (portfolioId: number, data: { 
    symbol: string; 
    quantity: number;
    type: 'BUY' | 'SELL';
  }) => api.post(`/portfolios/${portfolioId}/transaction`, data),
  getMarketNews: () => api.get('/stocks/market-news'),
  getCompanyProfile: (symbol: string) => api.get(`/stocks/profile/${symbol}`),

  // Watchlist methods
  getWatchlist: () => {
    return api.get('/stocks/watchlist');
  },

  addToWatchlist: (symbol: string) => {
    return api.post('/stocks/watchlist', { symbol: symbol.toUpperCase() });
  },

  removeFromWatchlist: (symbol: string) => {
    return api.delete(`/stocks/watchlist/${symbol}`);
  }
};

export const stockApi = {
  searchStocks: (query: string) => api.get(`/stocks/search?q=${query}`),
};

export { api };
