import { useQuery } from '@tanstack/react-query'
import { getAllPlayersWithSnowfallIntegration } from '@/services/snowfallIntegrationService'

export function useAllPlayersWithSnowfall() {
  const { data: players = [], isLoading: loading, error } = useQuery({
    queryKey: ['all-players-with-snowfall'],
    queryFn: async () => {
      try {
        const data = await getAllPlayersWithSnowfallIntegration()
        return data
      } catch (err: any) {
        console.error('Error fetching all players with Snowfall integration:', err)
        throw new Error(err.message || 'Failed to load players with Snowfall integration')
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