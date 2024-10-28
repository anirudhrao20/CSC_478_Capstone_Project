import { Input, Spinner, Card, CardBody } from "@nextui-org/react";
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { useState, useEffect, useRef } from 'react';
import { stockApi } from '../services/api';

interface StockSearchProps {
  onSelect: (symbol: string) => void;
}

export function StockSearch({ onSelect }: StockSearchProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const searchStocks = async () => {
      if (!query) {
        setResults([]);
        return;
      }

      setLoading(true);
      try {
        const response = await stockApi.searchStocks(query);
        setResults(response.data.result.slice(0, 5));
      } catch (err) {
        console.error('Failed to search stocks:', err);
      } finally {
        setLoading(false);
      }
    };

    const timeoutId = setTimeout(searchStocks, 300);
    return () => clearTimeout(timeoutId);
  }, [query]);

  return (
    <div className="w-full relative" ref={containerRef}>
      <Input
        placeholder="Search stocks..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setTimeout(() => setIsFocused(false), 200)}
        startContent={<MagnifyingGlassIcon className="h-4 w-4 text-default-400" />}
        endContent={loading && <Spinner size="sm" />}
      />
      
      {results.length > 0 && isFocused && (
        <div className="absolute w-full z-50 mt-1">
          <div className="bg-content1 rounded-large shadow-large border-small border-default-100">
            <div className="max-h-[240px] overflow-y-auto">
              <ul className="divide-y divide-default-100">
                {results.map((result) => (
                  <li
                    key={result.symbol}
                    className="p-3 hover:bg-default-100 cursor-pointer"
                    onClick={() => {
                      onSelect(result.symbol);
                      setQuery('');
                      setResults([]);
                      setIsFocused(false);
                    }}
                  >
                    <p className="font-medium">{result.symbol}</p>
                    <p className="text-sm text-default-500">{result.description}</p>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
