import { useState, useEffect, useCallback } from 'react';
import { getSnowfallLeaderboard } from '@/services/snowfallService';
import type { SnowfallPlayer } from '@/types/snowfall';

const ITEMS_PER_PAGE = 50;

export function useInfiniteSnowfallLeaderboard() {
  const [players, setPlayers] = useState<SnowfallPlayer[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(0);

  const loadInitialPlayers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getSnowfallLeaderboard(ITEMS_PER_PAGE, 0);
      setPlayers(data);
      setPage(0);
      setHasMore(data.length === ITEMS_PER_PAGE);
    } catch (err: any) {
      console.error('Error fetching initial Snowfall leaderboard:', err);
      setError(err.message || 'Failed to load Snowfall leaderboard');
    } finally {
      setLoading(false);
    }
  }, []);

  const loadMorePlayers = useCallback(async () => {
    if (!hasMore || loadingMore) return;

    try {
      setLoadingMore(true);
      const nextPage = page + 1;
      const offset = nextPage * ITEMS_PER_PAGE;
      const data = await getSnowfallLeaderboard(ITEMS_PER_PAGE, offset);
      
      if (data.length > 0) {
        setPlayers(prev => [...prev, ...data]);
        setPage(nextPage);
        setHasMore(data.length === ITEMS_PER_PAGE);
      } else {
        setHasMore(false);
      }
    } catch (err: any) {
      console.error('Error loading more players:', err);
      setError(err.message || 'Failed to load more players');
    } finally {
      setLoadingMore(false);
    }
  }, [page, hasMore, loadingMore]);

  useEffect(() => {
    loadInitialPlayers();
  }, [loadInitialPlayers]);

  return {
    players,
    loading,
    loadingMore,
    error,
    hasMore,
    loadMorePlayers
  };
}
