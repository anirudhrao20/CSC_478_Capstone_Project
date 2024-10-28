export interface Stock {
  id: number;
  symbol: string;
  quantity: number;
  portfolio_id: number;
  currentPrice?: number;
  value?: number;
  companyInfo?: {
    name: string;
    industry: string;
    marketCap: number;
  };
  metrics?: {
    priceChange: number;
    percentChange: number;
    volume: number;
    high: number;
    low: number;
  };
}

export interface Portfolio {
  id: number;
  name: string;
  user_id: number;
  stocks: Stock[];
  totalValue?: number;
  transactions?: Transaction[];
}

export interface Transaction {
  id: number;
  symbol: string;
  quantity: number;
  type: 'BUY' | 'SELL';
  price: number;
  timestamp: string;
}
