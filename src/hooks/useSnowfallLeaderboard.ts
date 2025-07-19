
import { useInfiniteQuery } from '@tanstack/react-query';
import { getSnowfallLeaderboard } from '@/services/snowfallService';

export function useSnowfallLeaderboard() {
  const {
    data,
    isLoading: loading,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage
  } = useInfiniteQuery({
    queryKey: ['snowfall-leaderboard'],
    queryFn: async ({ pageParam = 0 }) => {
      try {
        const data = await getSnowfallLeaderboard(50, pageParam * 50);
        return data;
      } catch (err: any) {
        console.error('Error fetching Snowfall leaderboard:', err);
        throw new Error(err.message || 'Failed to load Snowfall leaderboard');
      }
    },
    getNextPageParam: (lastPage, pages) => {
      return lastPage.length === 50 ? pages.length : undefined;
    },
    initialPageParam: 0,
    staleTime: 10 * 60 * 1000,
    gcTime: 20 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchInterval: false,
    refetchOnReconnect: false,
  });
  
  const players = data?.pages.flatMap(page => page) || [];
  
  return { 
    players, 
    loading, 
    error: error ? (error as Error).message : null,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage
  };
}
