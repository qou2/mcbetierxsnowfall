
import { useQuery } from '@tanstack/react-query'
import { getSkywarsPlayersWithSnowfallTiers, SkywarsPlayerWithSnowfallTier } from '@/services/snowfallIntegrationService'

export function useSkywarsWithSnowfall() {
  const { data: players = [], isLoading: loading, error } = useQuery({
    queryKey: ['skywars-with-snowfall'],
    queryFn: async () => {
      try {
        const data = await getSkywarsPlayersWithSnowfallTiers()
        return data
      } catch (err: any) {
        console.error('Error fetching Skywars players with Snowfall tiers:', err)
        throw new Error(err.message || 'Failed to load Skywars players with Snowfall tiers')
      }
    },
    staleTime: 10 * 60 * 1000,
    gcTime: 20 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchInterval: false,
    refetchOnReconnect: false,
  })
  
  return { players, loading, error: error ? (error as Error).message : null }
}
