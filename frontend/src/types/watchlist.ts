interface WatchlistItem {
  id: number;
  symbol: string;
  quote?: {
    c?: number;  // Current price
    d?: number;  // Price change
    dp?: number; // Percent change
  };
}

