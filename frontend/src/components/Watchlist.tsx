import { useEffect, useState } from 'react';
import { Card, CardBody, Button, Skeleton } from '@nextui-org/react';
import { portfolioApi } from '../services/api';
import { StockQuote } from './StockQuote';
import { useNavigate } from 'react-router-dom';
import { PlusIcon } from '@heroicons/react/24/outline';
import { TrashIcon } from '@heroicons/react/24/outline';
import { Table, TableHeader, TableColumn, TableBody, TableRow, TableCell, Chip } from '@nextui-org/react';
import { emitWatchlistUpdate, onWatchlistUpdate } from '../utils/events';

interface WatchlistItem {
  id: number;
  symbol: string;
}

export function Watchlist() {
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    loadWatchlist();
    
    // Add listener for watchlist updates
    const cleanup = onWatchlistUpdate(() => {
      loadWatchlist();
    });
    
    return () => cleanup();
  }, []);

  const loadWatchlist = async () => {
    try {
      const response = await portfolioApi.getWatchlist();
      // Load quotes for each stock
      const itemsWithQuotes = await Promise.all(
        response.data.map(async (item) => {
          const quoteResponse = await portfolioApi.getStockQuote(item.symbol);
          return {
            ...item,
            quote: quoteResponse.data
          };
        })
      );
      setWatchlist(itemsWithQuotes);
    } catch (err) {
      setError('Failed to load watchlist');
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (symbol: string) => {
    try {
      await portfolioApi.removeFromWatchlist(symbol);
      setWatchlist(watchlist.filter(item => item.symbol !== symbol));
    } catch (err) {
      setError('Failed to remove stock from watchlist');
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-full rounded-lg" />
        <Skeleton className="h-32 w-full rounded-lg" />
      </div>
    );
  }

  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <Table
      aria-label="Watchlist table"
      classNames={{
        wrapper: [
          "min-h-[200px]",
          "max-h-[500px]",
          "overflow-auto"
        ].join(" "),
        th: [
          "bg-transparent",
          "text-default-500",
          "border-b",
          "border-divider",
          "px-4",
          "sticky",
          "top-0",
          "z-10"
        ].join(" "),
        td: [
          "px-4",
          "py-3",
        ].join(" "),
      }}
    >
      <TableHeader>
        <TableColumn className="text-xs font-medium uppercase">Symbol</TableColumn>
        <TableColumn className="text-xs font-medium uppercase">Price</TableColumn>
        <TableColumn className="text-xs font-medium uppercase">Change</TableColumn>
        <TableColumn className="text-xs font-medium uppercase text-right">Actions</TableColumn>
      </TableHeader>
      <TableBody emptyContent="No stocks in watchlist">
        {watchlist.map((item) => {
          const quote = item.quote || {};
          const price = quote.c || 0;
          const priceChange = quote.d || 0;
          const percentChange = quote.dp || 0;
          const isPositive = priceChange >= 0;

          return (
            <TableRow key={item.id}>
              <TableCell>
                <div className="font-medium">{item.symbol}</div>
              </TableCell>
              <TableCell>
                <div className="font-medium">${price.toFixed(2)}</div>
              </TableCell>
              <TableCell>
                <Chip
                  color={isPositive ? "success" : "danger"}
                  variant="flat"
                  size="sm"
                  className="px-2"
                >
                  {isPositive ? "+" : ""}{percentChange.toFixed(2)}%
                </Chip>
              </TableCell>
              <TableCell className="text-right">
                <Button
                  isIconOnly
                  size="md"
                  color="danger"
                  variant="light"
                  className="h-10 w-10"
                  onPress={() => handleRemove(item.symbol)}
                >
                  <TrashIcon className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
