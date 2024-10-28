import { Card, CardBody, Button, Chip, Spinner } from "@nextui-org/react";
import { PlusIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { useState, useEffect } from 'react';
import { portfolioApi } from '../services/api';

interface StockQuoteProps {
  symbol: string;
  showAddButton?: boolean;
  onAddToWatchlist?: () => void;
  onClose?: () => void;
}

export function StockQuote({ symbol, showAddButton, onAddToWatchlist, onClose }: StockQuoteProps) {
  const [quote, setQuote] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => {
    loadQuote();
  }, [symbol]);

  const loadQuote = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await portfolioApi.getStockQuote(symbol);
      setQuote(response.data);
    } catch (err) {
      console.error('Failed to load quote:', err);
      setError('Failed to load stock quote');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToWatchlist = async () => {
    try {
      setIsAdding(true);
      if (onAddToWatchlist) {
        await onAddToWatchlist();
      }
    } finally {
      setIsAdding(false);
    }
  };

  if (loading) {
    return (
      <Card className="bg-default-100">
        <CardBody>
          <div className="flex justify-center items-center h-24">
            <Spinner />
          </div>
        </CardBody>
      </Card>
    );
  }

  if (error || !quote) {
    return (
      <Card className="bg-default-100">
        <CardBody>
          <div className="text-danger">{error || 'Failed to load stock data'}</div>
        </CardBody>
      </Card>
    );
  }

  const priceChange = quote.d || 0;
  const percentChange = quote.dp || 0;
  const isPositive = priceChange >= 0;

  return (
    <Card className="bg-default-100">
      <CardBody className="p-6 relative">
        {onClose && (
          <Button
            isIconOnly
            variant="light"
            className="absolute top-2 right-2"
            onPress={onClose}
          >
            <XMarkIcon className="h-4 w-4" />
          </Button>
        )}
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-lg font-bold">{symbol}</h3>
            <p className="text-2xl font-bold">${quote.c?.toFixed(2)}</p>
            <Chip
              color={isPositive ? "success" : "danger"}
              variant="flat"
              className="mt-1"
            >
              {isPositive ? "+" : ""}{percentChange.toFixed(2)}%
            </Chip>
          </div>
          {showAddButton && (
            <Button
              color="primary"
              endContent={<PlusIcon className="h-4 w-4" />}
              onPress={handleAddToWatchlist}
              isLoading={isAdding}
            >
              Add to Watchlist
            </Button>
          )}
        </div>
      </CardBody>
    </Card>
  );
}
