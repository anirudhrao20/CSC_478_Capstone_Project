export const emitWatchlistUpdate = () => {
  window.dispatchEvent(new Event('watchlistUpdate'));
};

export const onWatchlistUpdate = (callback: () => void) => {
  window.addEventListener('watchlistUpdate', callback);
  return () => window.removeEventListener('watchlistUpdate', callback);
};

