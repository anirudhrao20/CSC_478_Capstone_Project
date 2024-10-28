import { Table, TableHeader, TableColumn, TableBody, TableRow, TableCell, Button, Chip } from "@nextui-org/react";
import { TrashIcon } from '@heroicons/react/24/outline';
import { DollarSign } from 'lucide-react';
import { useState, useEffect } from 'react';
import { portfolioApi } from '../services/api';

interface Portfolio {
  id: number;
  name: string;
  stocks: {
    symbol: string;
    quantity: number;
    currentPrice?: number;
    value?: number;
  }[];
  totalValue?: number;
}

export default function PortfolioList() {
  const [portfolios, setPortfolios] = useState<Portfolio[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPortfolios();
  }, []);

  const loadPortfolios = async () => {
    try {
      const response = await portfolioApi.getPortfolios();
      setPortfolios(response.data);
    } catch (err) {
      console.error('Failed to load portfolios:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await portfolioApi.deletePortfolio(id);
      setPortfolios(portfolios.filter(p => p.id !== id));
    } catch (err) {
      console.error('Failed to delete portfolio:', err);
    }
  };

  return (
    <Table
      aria-label="Portfolios table"
      selectionMode="none"
      classNames={{
        wrapper: "min-h-[400px]",
        th: [
          "bg-transparent",
          "text-default-500",
          "border-b",
          "border-divider",
          "h-14",
          "px-6",
        ].join(" "),
        td: [
          "h-16",
          "px-6",
        ].join(" "),
      }}
    >
      <TableHeader>
        <TableColumn className="w-[200px] uppercase text-xs font-medium">Name</TableColumn>
        <TableColumn className="uppercase text-xs font-medium">Stocks</TableColumn>
        <TableColumn className="w-[150px] uppercase text-xs font-medium">Value</TableColumn>
        <TableColumn className="w-[200px] uppercase text-xs font-medium text-right">Actions</TableColumn>
      </TableHeader>
      <TableBody
        loadingContent={
          <div className="h-[400px] flex items-center justify-center text-default-500">
            Loading portfolios...
          </div>
        }
        emptyContent={
          <div className="h-[400px] flex items-center justify-center text-default-500">
            No portfolios found
          </div>
        }
        isLoading={loading}
      >
        {portfolios.map((portfolio) => (
          <TableRow key={portfolio.id}>
            <TableCell>
              <span className="font-medium">{portfolio.name}</span>
            </TableCell>
            <TableCell>
              <div className="flex flex-wrap gap-2">
                {portfolio.stocks.map(stock => (
                  <Chip
                    key={stock.symbol}
                    size="sm"
                    variant="flat"
                    classNames={{
                      base: "bg-blue-100 text-blue-800",
                      content: "text-xs font-medium px-2"
                    }}
                  >
                    {stock.symbol}
                  </Chip>
                ))}
              </div>
            </TableCell>
            <TableCell>
              <span className="font-medium">
                ${portfolio.totalValue?.toLocaleString()}
              </span>
            </TableCell>
            <TableCell>
              <div className="flex items-center justify-end gap-2">
                <Button
                  startContent={<DollarSign className="w-4 h-4" />}
                  size="md"
                  color="primary"
                  variant="flat"
                  className="h-10 px-4 min-w-[100px]"
                  onPress={() => {/* Handle transact action */}}
                >
                  Transact
                </Button>
                <Button
                  isIconOnly
                  size="md"
                  color="danger"
                  variant="light"
                  className="h-10 w-10"
                  onPress={() => handleDelete(portfolio.id)}
                >
                  <TrashIcon className="h-4 w-4" />
                </Button>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}