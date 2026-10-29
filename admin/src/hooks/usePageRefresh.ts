import { useEffect, useRef } from 'react';

// Run a page's own reload whenever the page bar refresh button is pressed
export const usePageRefresh = (handler: () => void) => {
  const ref = useRef(handler);
  ref.current = handler;
  useEffect(() => {
    const run = () => ref.current();
    window.addEventListener('plexivia:refresh', run);
    return () => window.removeEventListener('plexivia:refresh', run);
  }, []);
};
