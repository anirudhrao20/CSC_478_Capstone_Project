import { keyframes } from '@mui/material/styles';

export const fadeIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

// Apply to components using styled-components
const AnimatedComponent = styled('div')({
  animation: `${fadeIn} 0.3s ease-out`,
});

