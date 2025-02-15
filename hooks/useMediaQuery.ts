
import { useState, useEffect } from 'react';

export const useMediaQuery = (query: string) => {
  const [matches, setMatches] = useState(
    typeof window !== 'undefined' ? window.matchMedia(query).matches : false
  );

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const mediaQuery = window.matchMedia(query);
    const handler = (e: MediaQueryListEvent) => setMatches(e.matches);
    

    mediaQuery.addEventListener('change', handler);
    

    return () => mediaQuery.removeEventListener('change', handler);
  }, [query]);

  return matches;
};

export default useMediaQuery;