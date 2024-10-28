import { Card, CardBody, CardHeader } from "@nextui-org/react";
import { StockSearch } from '../components/StockSearch';
import { StockQuote } from '../components/StockQuote';
import { Watchlist } from '../components/Watchlist';
import { useState } from 'react';
import { portfolioApi } from '../services/api';

export function MarketPage() {
  const [selectedSymbol, setSelectedSymbol] = useState<string | null>(null);
  const [watchlistKey, setWatchlistKey] = useState(0);

  const handleAddToWatchlist = async (symbol: string) => {
    try {
      await portfolioApi.addToWatchlist(symbol);
      setWatchlistKey(prev => prev + 1); // Force watchlist refresh
    } catch (err) {
      console.error('Failed to add to watchlist:', err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Market Data</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card className="bg-default-50">
            <CardHeader>
              <h2 className="text-xl font-bold">Market Overview</h2>
            </CardHeader>
            <CardBody>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <MarketCard 
                  title="S&P 500" 
                  value="4,783.45" 
                  change="+1.2%" 
                  isPositive={true} 
                />
                <MarketCard 
                  title="NASDAQ" 
                  value="14,963.23" 
                  change="+0.9%" 
                  isPositive={true} 
                />
                <MarketCard 
                  title="DOW" 
                  value="37,562.10" 
                  change="-0.3%" 
                  isPositive={false} 
                />
              </div>
            </CardBody>
          </Card>

          <Card className="bg-default-50">
            <CardHeader>
              <h2 className="text-xl font-bold">Search Stocks</h2>
            </CardHeader>
            <CardBody className="h-full">
              <div className="flex flex-col gap-4">
                <StockSearch onSelect={setSelectedSymbol} />
                {selectedSymbol && (
                  <div className="mt-4">
                    <StockQuote 
                      symbol={selectedSymbol} 
                      showAddButton 
                      onAddToWatchlist={() => handleAddToWatchlist(selectedSymbol)} 
                    />
                  </div>
                )}
              </div>
            </CardBody>
          </Card>
        </div>

        <div className="lg:col-span-1">
          <Watchlist key={watchlistKey} />
        </div>
      </div>
    </div>
  );
}

interface MarketCardProps {
  title: string;
  value: string;
  change: string;
  isPositive: boolean;
}

function MarketCard({ title, value, change, isPositive }: MarketCardProps) {
  return (
    <div className="p-4 rounded-lg bg-default-100">
      <p className="text-sm text-default-500">{title}</p>
      <p className="text-xl font-bold">${value}</p>
      <p className={`text-sm ${isPositive ? 'text-success' : 'text-danger'}`}>
        {change}
      </p>
    </div>
  );
}
