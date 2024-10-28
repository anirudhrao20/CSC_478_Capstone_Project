import { useState } from 'react';
import { 
  Button, 
  Input, 
  Modal, 
  ModalContent, 
  ModalHeader, 
  ModalBody, 
  ModalFooter,
  useDisclosure 
} from '@nextui-org/react';
import { portfolioApi } from '../services/api';

interface Stock {
  symbol: string;
  quantity: number;
}

export function CreatePortfolio({ onPortfolioCreated }: { onPortfolioCreated: () => void }) {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [name, setName] = useState('');
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [currentStock, setCurrentStock] = useState({ symbol: '', quantity: '' });
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAddStock = () => {
    if (!currentStock.symbol || !currentStock.quantity) return;
    
    setStocks([...stocks, {
      symbol: currentStock.symbol.toUpperCase(),
      quantity: Number(currentStock.quantity)
    }]);
    setCurrentStock({ symbol: '', quantity: '' });
  };

  const resetForm = () => {
    setName('');
    setStocks([]);
    setCurrentStock({ symbol: '', quantity: '' });
    setError('');
    setIsSubmitting(false);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = async () => {
    if (isSubmitting) return;
    if (!name || stocks.length === 0) {
      setError('Please enter a portfolio name and add at least one stock');
      return;
    }
    
    console.log('Submitting portfolio:', { name, stocks }); // Add logging
    setIsSubmitting(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      await portfolioApi.createPortfolio({
        name,
        stocks
      });
      console.log('Portfolio created successfully'); // Add logging
      handleClose();
      await onPortfolioCreated();
    } catch (err: any) {
      console.error('Error creating portfolio:', err); // Add logging
      setError(err.response?.data?.detail || err.message || 'Failed to create portfolio');
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Button onPress={onOpen} color="primary">
        Create New Portfolio
      </Button>

      <Modal 
        isOpen={isOpen} 
        onClose={handleClose}
        isDismissable={!isSubmitting}
      >
        <ModalContent>
          <ModalHeader>Create New Portfolio</ModalHeader>
          <ModalBody>
            <div className="space-y-4">
              <Input
                label="Portfolio Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                isDisabled={isSubmitting}
              />
              
              <div className="flex gap-2">
                <Input
                  label="Stock Symbol"
                  value={currentStock.symbol}
                  onChange={(e) => setCurrentStock({
                    ...currentStock,
                    symbol: e.target.value
                  })}
                  isDisabled={isSubmitting}
                />
                <Input
                  label="Quantity"
                  type="number"
                  value={currentStock.quantity}
                  onChange={(e) => setCurrentStock({
                    ...currentStock,
                    quantity: e.target.value
                  })}
                  isDisabled={isSubmitting}
                />
                <Button 
                  onPress={handleAddStock}
                  isDisabled={isSubmitting}
                >
                  Add
                </Button>
              </div>

              {stocks.map((stock, index) => (
                <div key={index} className="flex justify-between items-center">
                  <span>{stock.symbol}</span>
                  <span>{stock.quantity}</span>
                  <Button
                    color="danger"
                    variant="light"
                    onPress={() => setStocks(stocks.filter((_, i) => i !== index))}
                    isDisabled={isSubmitting}
                  >
                    Remove
                  </Button>
                </div>
              ))}

              {error && <p className="text-danger text-sm">{error}</p>}
            </div>
          </ModalBody>
          <ModalFooter>
            <Button 
              color="danger" 
              variant="light" 
              onPress={handleClose}
              isDisabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button 
              color="primary" 
              onPress={handleSubmit}
              isLoading={isSubmitting}
            >
              Create
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}
