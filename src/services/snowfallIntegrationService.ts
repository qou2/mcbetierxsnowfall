
import { supabase } from "@/integrations/supabase/client"
import { SnowfallPlayer, SnowfallTier } from "@/types/snowfall"
import { calculateTierPoints } from "@/services/playerService"

export interface SkywarsPlayerWithSnowfallTier {
  id: string
  ign: string
  java_username: string | null
  uuid: string | null
  avatar_url: string | null
  region: string | null
  device: string | null
  global_points: number
  overall_rank: number | null
  banned: boolean
  created_at: string
  updated_at: string
  snowfall_tier?: SnowfallTier
  snowfall_score?: number
}

// Convert database row to SnowfallPlayer format
function convertToSnowfallPlayer(dbRow: any): SnowfallPlayer {
  return {
    id: dbRow.id,
    minecraft_username: dbRow.minecraft_username,
    assessment: {
      playstyle: dbRow.playstyle,
      movement: dbRow.movement,
      pvp: dbRow.pvp,
      building: dbRow.building,
      projectiles: dbRow.projectiles,
      overall_score: dbRow.overall_score,
      tier: dbRow.tier as SnowfallTier
    },
    created_at: dbRow.created_at,
    updated_at: dbRow.updated_at
  }
}

export async function getSkywarsPlayersWithSnowfallTiers(): Promise<SkywarsPlayerWithSnowfallTier[]> {
  try {
    // Get all players from main players table
    const { data: players, error: playersError } = await supabase
      .from("players")
      .select("*")
      .eq("banned", false)
      .order("global_points", { ascending: false })

    if (playersError) {
      console.error("Error fetching players:", playersError)
      throw new Error(`Failed to fetch players: ${playersError.message}`)
    }

    // Get all Snowfall players to match against
    const { data: snowfallPlayersRaw, error: snowfallError } = await supabase
      .from("snowfall_players")
      .select("*")

    if (snowfallError) {
      console.error("Error fetching Snowfall players:", snowfallError)
      // Don't throw error, just continue without Snowfall data
    }

    // Convert database rows to SnowfallPlayer format
    const snowfallPlayers = snowfallPlayersRaw?.map(convertToSnowfallPlayer) || []

    // Create a map of Snowfall data by minecraft username
    const snowfallMap = new Map<string, SnowfallPlayer>()
    snowfallPlayers.forEach(player => {
      snowfallMap.set(player.minecraft_username.toLowerCase(), player)
    })

    // Merge the data
    const mergedPlayers: SkywarsPlayerWithSnowfallTier[] = players.map(player => {
      // Try to find matching Snowfall player
      const snowfallPlayer = snowfallMap.get(player.ign.toLowerCase()) || 
                            (player.java_username ? snowfallMap.get(player.java_username.toLowerCase()) : null)

      return {
        ...player,
        snowfall_tier: snowfallPlayer?.assessment.tier,
        snowfall_score: snowfallPlayer?.assessment.overall_score
      }
    })

    // Add snowfall players who don't exist in main players table
    snowfallPlayers.forEach(snowfallPlayer => {
      const existsInMain = players.some(player => 
        player.ign.toLowerCase() === snowfallPlayer.minecraft_username.toLowerCase() ||
        (player.java_username && player.java_username.toLowerCase() === snowfallPlayer.minecraft_username.toLowerCase())
      )

      if (!existsInMain) {
        // Create a new player entry for this snowfall player
        mergedPlayers.push({
          id: snowfallPlayer.id,
          ign: snowfallPlayer.minecraft_username,
          java_username: snowfallPlayer.minecraft_username,
          uuid: null,
          avatar_url: null,
          region: "NA", // Default region
          device: "PC", // Default device
          global_points: calculateTierPoints(snowfallPlayer.assessment.tier), // Calculate points from snowfall tier
          overall_rank: null,
          banned: false,
          created_at: snowfallPlayer.created_at,
          updated_at: snowfallPlayer.updated_at,
          snowfall_tier: snowfallPlayer.assessment.tier,
          snowfall_score: snowfallPlayer.assessment.overall_score
        })
      }
    })

    // Sort by global points including snowfall contributions
    mergedPlayers.sort((a, b) => (b.global_points || 0) - (a.global_points || 0))

    return mergedPlayers
  } catch (error) {
    console.error("Error in getSkywarsPlayersWithSnowfallTiers:", error)
    throw error
  }
}

// Get all players with snowfall integration for overall leaderboard
export async function getAllPlayersWithSnowfallIntegration(): Promise<SkywarsPlayerWithSnowfallTier[]> {
  try {
    // Get all players from main players table (including those without snowfall data)
    const { data: players, error: playersError } = await supabase
      .from("players")
      .select("*")
      .eq("banned", false)

    if (playersError) {
      console.error("Error fetching players:", playersError)
      throw new Error(`Failed to fetch players: ${playersError.message}`)
    }

    // Get all Snowfall players
    const { data: snowfallPlayersRaw, error: snowfallError } = await supabase
      .from("snowfall_players")
      .select("*")

    if (snowfallError) {
      console.error("Error fetching Snowfall players:", snowfallError)
      // Don't throw error, just continue without Snowfall data
    }

    // Convert database rows to SnowfallPlayer format
    const snowfallPlayers = snowfallPlayersRaw?.map(convertToSnowfallPlayer) || []

    // Create a map of Snowfall data by minecraft username
    const snowfallMap = new Map<string, SnowfallPlayer>()
    snowfallPlayers.forEach(player => {
      snowfallMap.set(player.minecraft_username.toLowerCase(), player)
    })

    // Create a map of existing players to avoid duplicates
    const playerMap = new Map<string, SkywarsPlayerWithSnowfallTier>()

    // First, add all main players with their snowfall data if available
    players.forEach(player => {
      const snowfallPlayer = snowfallMap.get(player.ign.toLowerCase()) || 
                            (player.java_username ? snowfallMap.get(player.java_username.toLowerCase()) : null)

      playerMap.set(player.ign.toLowerCase(), {
        ...player,
        snowfall_tier: snowfallPlayer?.assessment.tier,
        snowfall_score: snowfallPlayer?.assessment.overall_score
      })
    })

    // Then, add snowfall players who don't exist in main players table
    snowfallPlayers.forEach(snowfallPlayer => {
      const key = snowfallPlayer.minecraft_username.toLowerCase()
      
      if (!playerMap.has(key)) {
        // Create a new player entry for this snowfall player
        playerMap.set(key, {
          id: snowfallPlayer.id,
          ign: snowfallPlayer.minecraft_username,
          java_username: snowfallPlayer.minecraft_username,
          uuid: null,
          avatar_url: null,
          region: "NA", // Default region
          device: "PC", // Default device
          global_points: calculateTierPoints(snowfallPlayer.assessment.tier), // Calculate points from snowfall tier
          overall_rank: null,
          banned: false,
          created_at: snowfallPlayer.created_at,
          updated_at: snowfallPlayer.updated_at,
          snowfall_tier: snowfallPlayer.assessment.tier,
          snowfall_score: snowfallPlayer.assessment.overall_score
        })
      }
    })

    // Convert map back to array and sort by global points
    const allPlayers = Array.from(playerMap.values())
    allPlayers.sort((a, b) => (b.global_points || 0) - (a.global_points || 0))

    return allPlayers
  } catch (error) {
    console.error("Error in getAllPlayersWithSnowfallIntegration:", error)
    throw error
  }
}

export function getSnowfallTierDisplay(tier?: SnowfallTier): { code: string; color: string; priority: number } {
  if (!tier || tier === "No Rank") {
    return { code: "NR", color: "text-gray-400", priority: 0 }
  }

  const tierMap: Record<SnowfallTier, { code: string; color: string; priority: number }> = {
    "HT1": { code: "HT1", color: "text-yellow-400", priority: 13 },
    "MT1": { code: "MT1", color: "text-yellow-300", priority: 12 },
    "LT1": { code: "LT1", color: "text-yellow-200", priority: 11 },
    "HT2": { code: "HT2", color: "text-orange-400", priority: 10 },
    "MT2": { code: "MT2", color: "text-orange-300", priority: 9 },
    "LT2": { code: "LT2", color: "text-orange-200", priority: 8 },
    "HT3": { code: "HT3", color: "text-purple-400", priority: 7 },
    "MT3": { code: "MT3", color: "text-purple-300", priority: 6 },
    "LT3": { code: "LT3", color: "text-purple-200", priority: 5 },
    "HT4": { code: "HT4", color: "text-blue-400", priority: 4 },
    "MT4": { code: "MT4", color: "text-blue-300", priority: 3 },
    "LT4": { code: "LT4", color: "text-blue-200", priority: 2 },
    "No Rank": { code: "NR", color: "text-gray-400", priority: 0 }
  }

  return tierMap[tier] || { code: "NR", color: "text-gray-400", priority: 0 }
}
