import { Button, Modal, ModalContent, ModalBody, useDisclosure } from "@nextui-org/react";
import { StockSearch } from './StockSearch';
import { StockQuote } from './StockQuote';
import { useState } from 'react';
import { portfolioApi } from '../services/api';
import { emitWatchlistUpdate } from '../utils/events';

export function NavbarSearch() {
  const [selectedSymbol, setSelectedSymbol] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const {isOpen: isAlertOpen, onOpen: onAlertOpen, onClose: onAlertClose} = useDisclosure();

  const handleStockSelect = (symbol: string) => {
    setSelectedSymbol(symbol);
    setIsModalOpen(true);
  };

  const handleAddToWatchlist = async () => {
    if (!selectedSymbol) return;
    
    try {
      await portfolioApi.addToWatchlist(selectedSymbol);
      setIsModalOpen(false);
      setSelectedSymbol(null);
      emitWatchlistUpdate();
    } catch (err: any) {
      if (err.response?.status === 400 && err.response?.data?.detail?.includes('already in watchlist')) {
        onAlertOpen(); // Open alert modal
        setIsModalOpen(false);
        setSelectedSymbol(null);
      } else {
        console.error('Failed to add to watchlist:', err);
      }
    }
  };

  return (
    <>
      <div className="flex items-center gap-2">
        <div className="w-64">
          <StockSearch onSelect={handleStockSelect} />
        </div>
      </div>

      <Modal 
        isOpen={isModalOpen} 
        onClose={() => {
          setIsModalOpen(false);
          setSelectedSymbol(null);
        }}
        size="lg"
      >
        <ModalContent>
          <ModalBody className="py-6">
            {selectedSymbol && (
              <StockQuote 
                symbol={selectedSymbol}
                showAddButton
                onAddToWatchlist={handleAddToWatchlist}
              />
            )}
          </ModalBody>
        </ModalContent>
      </Modal>

      {/* Alert Modal */}
      <Modal 
        isOpen={isAlertOpen} 
        onClose={onAlertClose}
        size="sm"
      >
        <ModalContent>
          <ModalBody className="py-6">
            <div className="text-center">
              <p className="text-lg">This stock is already in your watchlist</p>
              <Button
                color="primary"
                variant="light"
                onPress={onAlertClose}
                className="mt-4"
              >
                OK
              </Button>
            </div>
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
}
