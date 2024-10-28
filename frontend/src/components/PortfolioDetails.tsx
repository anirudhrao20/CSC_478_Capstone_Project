import { useState, useEffect } from 'react';
import { 
  Card, 
  CardBody, 
  CardHeader, 
  Button, 
  Modal, 
  ModalContent, 
  ModalHeader,
  ModalBody,
  ModalFooter,
  Input,
  Select,
  SelectItem
} from "@nextui-org/react";
import { PlusIcon } from '@heroicons/react/24/outline';
import { portfolioApi } from '../services/api';
import { MetricCard } from './MetricCard';
import { PortfolioChart } from './PortfolioChart';
import { StockAllocation } from './StockAllocation';
import { MarketNews } from './MarketNews';
import { TransactionHistory } from './TransactionHistory';
import { Portfolio } from '../types/portfolio';

function PortfolioSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="h-9 w-48 rounded-lg bg-default-200 animate-pulse" />
        <div className="h-9 w-32 rounded-lg bg-default-200 animate-pulse" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="bg-default-50">
            <CardBody>
              <div className="space-y-3">
                <div className="h-4 w-24 rounded bg-default-200 animate-pulse" />
                <div className="h-8 w-32 rounded bg-default-200 animate-pulse" />
              </div>
            </CardBody>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[1, 2].map((i) => (
          <Card key={i} className="bg-default-50">
            <CardHeader>
              <div className="h-6 w-48 rounded bg-default-200 animate-pulse" />
            </CardHeader>
            <CardBody>
              <div className="h-[200px] rounded bg-default-200 animate-pulse" />
            </CardBody>
          </Card>
        ))}
      </div>
    </div>
  );
}

export function PortfolioDetails({ portfolioId, onUpdate }: { portfolioId: number; onUpdate: () => void }) {
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newStock, setNewStock] = useState({ symbol: '', quantity: '' });
  const [stockToDelete, setStockToDelete] = useState<number | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);
  const [transactionType, setTransactionType] = useState<'BUY' | 'SELL'>('BUY');
  const [transaction, setTransaction] = useState({ symbol: '', quantity: '' });

  const loadPortfolio = async () => {
    try {
      const response = await portfolioApi.getPortfolio(portfolioId);
      const portfolioData = response.data;
      
      // Calculate values for each stock and fetch company info
      const stocksWithValues = await Promise.all(portfolioData.stocks.map(async (stock) => {
        try {
          const quoteResponse = await portfolioApi.getStockQuote(stock.symbol);
          
          // Make sure we have a valid current price
          const currentPrice = quoteResponse.data?.c || 0;
          // Calculate the value based on quantity and current price
          const value = Number(stock.quantity) * currentPrice;
          
          return {
            ...stock,
            currentPrice,
            value,
            metrics: {
              priceChange: quoteResponse.data?.d || 0,
              percentChange: quoteResponse.data?.dp || 0,
              volume: quoteResponse.data?.v || 0,
              high: quoteResponse.data?.h || 0,
              low: quoteResponse.data?.l || 0
            }
          };
        } catch (err) {
          console.error(`Failed to fetch data for ${stock.symbol}:`, err);
          return {
            ...stock,
            currentPrice: 0,
            value: 0,
            metrics: null
          };
        }
      }));

      // Calculate total portfolio value from valid stock values
      const totalValue = stocksWithValues.reduce((sum, stock) => {
        const stockValue = stock.value || 0;
        return sum + stockValue;
      }, 0);

      setPortfolio({
        ...portfolioData,
        stocks: stocksWithValues,
        totalValue
      });
    } catch (err) {
      console.error('Portfolio load error:', err);
      setError('Failed to load portfolio data');
    } finally {
      setLoading(false);
    }
  };

  const handleAddStock = async () => {
    try {
      setError('');
      await portfolioApi.addStock(portfolioId, {
        symbol: newStock.symbol.toUpperCase(),
        quantity: Number(newStock.quantity)
      });
      setIsAddModalOpen(false);
      setNewStock({ symbol: '', quantity: '' });
      await loadPortfolio();
      onUpdate();
    } catch (err: any) {
      console.error('Failed to add stock:', err);
      setError(err.response?.data?.detail || 'Failed to add stock');
      throw err;
    }
  };

  const handleDeleteStock = async () => {
    if (!stockToDelete) return;
    
    try {
      setError('');
      await portfolioApi.removeStock(portfolioId, stockToDelete);
      await loadPortfolio();
      onUpdate();
      setIsDeleteModalOpen(false);
      setStockToDelete(null);
    } catch (err: any) {
      console.error('Failed to remove stock:', err);
      setError(err.response?.data?.detail || 'Failed to remove stock');
      throw err;
    }
  };

  const handleTransaction = async () => {
    try {
      setError('');
      await portfolioApi.addTransaction(portfolioId, {
        symbol: transaction.symbol.toUpperCase(),
        quantity: Number(transaction.quantity),
        type: transactionType
      });
      setIsTransactionModalOpen(false);
      setTransaction({ symbol: '', quantity: '' });
      await loadPortfolio();
      onUpdate();
    } catch (err: any) {
      console.error('Failed to process transaction:', err);
      setError(err.response?.data?.detail || 'Failed to process transaction');
      throw err;
    }
  };

  useEffect(() => {
    loadPortfolio();
  }, [portfolioId]);

  if (loading) return <PortfolioSkeleton />;
  if (error) return <div className="text-danger">{error}</div>;
  if (!portfolio) return null;

  return (
    <div className="space-y-6">
      {error && (
        <div className="text-danger bg-danger-50 p-3 rounded-lg">
          {error}
        </div>
      )}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">{portfolio.name}</h1>
        <Button 
          color="primary"
          className="h-10 px-4 min-w-[100px]"
          onPress={() => setIsAddModalOpen(true)}
          startContent={<PlusIcon className="h-4 w-4" />}
        >
          Add Stock
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <MetricCard
          title="Total Value"
          value={`$${portfolio.totalValue?.toLocaleString() || '0'}`}
          subtitle={`${new Date().toLocaleDateString()}`}
        />
        <MetricCard
          title="Total Stocks"
          value={portfolio.stocks.length.toString()}
          subtitle="Different symbols"
        />
        <MetricCard
          title="Total Shares"
          value={portfolio.stocks.reduce((sum, stock) => sum + stock.quantity, 0).toString()}
          subtitle="Combined quantity"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-default-50">
          <CardHeader>
            <h2 className="text-xl font-bold">Portfolio Distribution</h2>
          </CardHeader>
          <CardBody>
            <PortfolioChart 
              data={portfolio.stocks.map(stock => ({
                symbol: stock.symbol,
                value: stock.value || 0
              }))} 
            />
          </CardBody>
        </Card>

        <Card className="bg-default-50">
          <CardHeader>
            <h2 className="text-xl font-bold">Market News</h2>
          </CardHeader>
          <CardBody>
            <MarketNews />
          </CardBody>
        </Card>
      </div>

      <Card className="bg-default-50">
        <CardHeader>
          <h2 className="text-xl font-bold">Holdings</h2>
        </CardHeader>
        <CardBody>
          <StockAllocation 
            data={portfolio.stocks} 
            onRemove={(stockId) => {
              setStockToDelete(stockId);
              setIsDeleteModalOpen(true);
            }}
            onSell={(symbol) => {
              setTransaction({ symbol, quantity: '' });
              setTransactionType('SELL');
              setIsTransactionModalOpen(true);
            }}
          />
        </CardBody>
      </Card>

      <Card className="bg-default-50">
        <CardHeader>
          <h2 className="text-xl font-bold">Transaction History</h2>
        </CardHeader>
        <CardBody>
          <TransactionHistory transactions={portfolio.transactions || []} />
        </CardBody>
      </Card>

      <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)}>
        <ModalContent>
          <ModalHeader>Add Stock</ModalHeader>
          <ModalBody>
            <div className="space-y-4">
              <Input
                label="Stock Symbol"
                value={newStock.symbol}
                onChange={(e) => setNewStock({ ...newStock, symbol: e.target.value })}
              />
              <Input
                label="Quantity"
                type="number"
                value={newStock.quantity}
                onChange={(e) => setNewStock({ ...newStock, quantity: e.target.value })}
              />
            </div>
          </ModalBody>
          <ModalFooter>
            <Button 
              color="default" 
              variant="light" 
              className="h-10 px-4 min-w-[100px]"
              onPress={() => setIsAddModalOpen(false)}
            >
              Cancel
            </Button>
            <Button 
              color="primary"
              className="h-10 px-4 min-w-[100px]"
              onPress={handleAddStock}
            >
              Add
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <Modal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)}>
        <ModalContent>
          <ModalHeader>Confirm Delete</ModalHeader>
          <ModalBody>
            Are you sure you want to remove this stock from your portfolio?
          </ModalBody>
          <ModalFooter>
            <Button 
              color="default" 
              variant="light" 
              className="h-10 px-4 min-w-[100px]"
              onPress={() => setIsDeleteModalOpen(false)}
            >
              Cancel
            </Button>
            <Button 
              color="danger" 
              className="h-10 px-4 min-w-[100px]"
              onPress={handleDeleteStock}
            >
              Delete
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <Modal isOpen={isTransactionModalOpen} onClose={() => setIsTransactionModalOpen(false)}>
        <ModalContent>
          <ModalHeader>{transactionType} Stock</ModalHeader>
          <ModalBody>
            <div className="space-y-4">
              <Select
                label="Transaction Type"
                selectedKeys={[transactionType]}
                onChange={(e) => setTransactionType(e.target.value as 'BUY' | 'SELL')}
              >
                <SelectItem key="BUY" value="BUY">Buy</SelectItem>
                <SelectItem key="SELL" value="SELL">Sell</SelectItem>
              </Select>
              <Input
                label="Stock Symbol"
                value={transaction.symbol}
                onChange={(e) => setTransaction({ ...transaction, symbol: e.target.value })}
              />
              <Input
                label="Quantity"
                type="number"
                value={transaction.quantity}
                onChange={(e) => setTransaction({ ...transaction, quantity: e.target.value })}
              />
            </div>
          </ModalBody>
          <ModalFooter>
            <Button 
              color="default" 
              variant="light" 
              className="h-10 px-4 min-w-[100px]"
              onPress={() => setIsTransactionModalOpen(false)}
            >
              Cancel
            </Button>
            <Button 
              color="primary"
              className="h-10 px-4 min-w-[100px]"
              onPress={handleTransaction}
            >
              Submit
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
}
