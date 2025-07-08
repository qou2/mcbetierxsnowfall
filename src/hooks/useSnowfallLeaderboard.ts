
import { useQuery } from '@tanstack/react-query';
import { getSnowfallLeaderboard } from '@/services/snowfallService';

export function useSnowfallLeaderboard() {
  const { data: players = [], isLoading: loading, error } = useQuery({
    queryKey: ['snowfall-leaderboard'],
    queryFn: async () => {
      try {
        const data = await getSnowfallLeaderboard();
        return data;
      } catch (err: any) {
        console.error('Error fetching Snowfall leaderboard:', err);
        throw new Error(err.message || 'Failed to load Snowfall leaderboard');
      }
    },
    staleTime: 10 * 60 * 1000,
    gcTime: 20 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchInterval: false,
    refetchOnReconnect: false,
  });
  
  return { players, loading, error: error ? (error as Error).message : null };
}
