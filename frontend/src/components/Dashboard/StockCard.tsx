import styled from 'styled-components';

const StockCard = styled('div')({
  background: 'rgba(255,255,255,0.05)',
  borderRadius: '12px',
  padding: '20px',
  display: 'grid',
  gridTemplateColumns: 'auto 1fr auto',
  gap: '16px',
  alignItems: 'center',
  transition: 'transform 0.2s, background 0.2s',
  '&:hover': {
    transform: 'translateY(-2px)',
    background: 'rgba(255,255,255,0.08)',
  },
});

