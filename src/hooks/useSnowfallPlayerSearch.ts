import { useState, useEffect, useMemo } from 'react';
import { useDebounce } from './useDebounce';
import { searchSnowfallPlayers } from '@/services/snowfallService';
import type { SnowfallPlayer } from '@/types/snowfall';

export function useSnowfallPlayerSearch() {
  const [query, setQuery] = useState<string>('');
  const debouncedQuery = useDebounce(query, 800);
  const [results, setResults] = useState<SnowfallPlayer[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  const performSearch = useMemo(() => async (searchQuery: string) => {
    if (!searchQuery || searchQuery.length < 2) {
      setResults([]);
      setIsLoading(false);
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      const data = await searchSnowfallPlayers(searchQuery);
      setResults(data || []);
    } catch (err) {
      console.error('Snowfall player search error:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  useEffect(() => {
    if (window.innerWidth <= 768 && debouncedQuery.length < 2) {
      return;
    }
    
    performSearch(debouncedQuery);
  }, [debouncedQuery, performSearch]);
  
  return {
    query,
    setQuery,
    results,
    isLoading,
    error
  };
}