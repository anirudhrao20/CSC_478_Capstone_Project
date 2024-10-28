import { useEffect, useState } from 'react';
import { Card, CardBody, CardHeader, Spinner } from "@nextui-org/react";
import { PortfolioDetails } from '../components/PortfolioDetails';
import { Watchlist } from '../components/Watchlist';
import { portfolioApi } from '../services/api';

export function PortfolioPage() {
  const [portfolioId, setPortfolioId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadPortfolio = async () => {
    try {
      const response = await portfolioApi.getUserPortfolio();
      setPortfolioId(response.data.id);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPortfolio();
  }, []);

  if (loading) return <Spinner size="lg" />;
  if (error) return <div className="text-danger">{error}</div>;
  if (!portfolioId) return null;

  return (
    <div className="p-4 space-y-8">
      {/* Portfolio Section */}
      <div>
        <PortfolioDetails portfolioId={portfolioId} onUpdate={loadPortfolio} />
      </div>

      {/* Watchlist Section */}
      <div>
        <Card className="bg-default-50">
          <CardHeader>
            <h2 className="text-xl font-bold">Watchlist</h2>
          </CardHeader>
          <CardBody>
            <Watchlist />
          </CardBody>
        </Card>
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
