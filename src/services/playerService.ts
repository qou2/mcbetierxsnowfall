
import { supabase } from "@/integrations/supabase/client"

export type GameMode =
  | "Crystal"
  | "skywars"
  | "midfight"
  | "bridge"
  | "sumo"
  | "nodebuff"
  | "bedfight"
  | "UHC"

export type TierLevel =
  | "HT1"
  | "LT1"
  | "HT2"
  | "LT2"
  | "HT3"
  | "LT3"
  | "HT4"
  | "LT4"
  | "HT5"
  | "LT5"
  | "Retired"
  | "Not Ranked"
export type PlayerRegion = "NA" | "EU" | "ASIA" | "OCE" | "SA" | "AF"
export type DeviceType = "PC" | "Mobile" | "Console"

export interface Player {
  id: string
  ign: string
  region: string
  device?: string
  global_points: number
  overall_rank: number
  tier?: TierLevel
  avatar_url?: string
  java_username?: string
  gamemode_points?: {
    [key in GameMode]?: number
  }
  tierAssignments?: {
    gamemode: GameMode
    tier: TierLevel
    score: number
  }[]
}

// Updated tier points mapping for HT1-LT5 range with better calculation
const TIER_POINTS: Record<TierLevel, number> = {
  HT1: 65,
  LT1: 50,
  HT2: 30,
  LT2: 20,
  HT3: 10,
  LT3: 6,
  HT4: 4,
  LT4: 3,
  HT5: 2,
  LT5: 1,
  Retired: 0,
  "Not Ranked": 0,
}

export function calculateTierPoints(tier: TierLevel): number {
  return TIER_POINTS[tier] || 0
}

// Calculate total points from tier assignments
export function calculatePlayerGlobalPoints(tierAssignments: { gamemode: GameMode; tier: TierLevel; score: number }[]): number {
  let totalPoints = 0

  tierAssignments.forEach((assignment) => {
    const points = calculateTierPoints(assignment.tier)
    totalPoints += points
    console.log(`${assignment.gamemode} - ${assignment.tier}: ${points} points`)
  })

  console.log(`Total calculated points: ${totalPoints}`)
  return totalPoints
}

export async function updatePlayerGlobalPoints(playerId: string): Promise<void> {
  try {
    console.log(`Updating global points for player: ${playerId}`)

    // Get all tier assignments for the player with better error handling
    const { data: tierAssignments, error } = await supabase
      .from("gamemode_scores")
      .select("internal_tier, score")
      .eq("player_id", playerId)
      .not("internal_tier", "is", null)

    if (error) {
      console.error("Error fetching tier assignments:", error)
      return
    }

    if (!tierAssignments || tierAssignments.length === 0) {
      console.log("No tier assignments found for player:", playerId)
      // Set points to 0 if no assignments
      const { error: updateError } = await supabase
        .from("players")
        .update({
          global_points: 0,
          updated_at: new Date().toISOString(),
        })
        .eq("id", playerId)

      if (updateError) {
        console.error("Error updating global points to 0:", updateError)
      }
      return
    }

    // Calculate total points from all tiers with validation
    let totalPoints = 0
    let validAssignments = 0

    tierAssignments.forEach((assignment) => {
      if (assignment.internal_tier && assignment.internal_tier in TIER_POINTS) {
        const points = calculateTierPoints(assignment.internal_tier as TierLevel)
        totalPoints += points
        validAssignments++
        console.log(`Tier ${assignment.internal_tier} = ${points} points (Score: ${assignment.score || "N/A"})`)
      } else {
        console.warn(`Invalid tier found: ${assignment.internal_tier}`)
      }
    })

    console.log(
      `Total calculated points for player ${playerId}: ${totalPoints} from ${validAssignments} valid assignments`,
    )

    // Update player's global points with validation
    const { error: updateError } = await supabase
      .from("players")
      .update({
        global_points: totalPoints,
        updated_at: new Date().toISOString(),
      })
      .eq("id", playerId)

    if (updateError) {
      console.error("Error updating global points:", updateError)
      return
    }

    console.log(`Successfully updated player ${playerId} global points to ${totalPoints}`)
  } catch (error) {
    console.error("Error in updatePlayerGlobalPoints:", error)
  }
}

// OPTIMIZED: Single query to get leaderboard with tier assignments
export async function getLeaderboard(): Promise<Player[]> {
  try {
    console.log("Fetching optimized leaderboard data...")

    // Single query to get players with their tier assignments
    const { data: playersData, error: playersError } = await supabase
      .from("players")
      .select("*")
      .eq("banned", false)
      .order("global_points", { ascending: false })
      .limit(50)

    if (playersError) {
      console.error("Supabase error fetching leaderboard:", playersError)
      throw playersError
    }

    if (!playersData || playersData.length === 0) {
      console.log("No players found in database")
      return []
    }

    // Get all player IDs for batch fetching tier assignments
    const playerIds = playersData.map((p) => p.id)

    // Single query to get all tier assignments for all players
    const { data: tierData, error: tierError } = await supabase
      .from("gamemode_scores")
      .select("player_id, gamemode, internal_tier, score")
      .in("player_id", playerIds)

    if (tierError) {
      console.error("Error fetching tier assignments:", tierError)
    }

    // Group tier assignments by player ID for quick lookup
    const tierAssignmentsByPlayer = new Map<string, { gamemode: GameMode; tier: TierLevel; score: number }[]>()

    if (tierData) {
      tierData.forEach((tier) => {
        if (!tierAssignmentsByPlayer.has(tier.player_id)) {
          tierAssignmentsByPlayer.set(tier.player_id, [])
        }
        tierAssignmentsByPlayer.get(tier.player_id)!.push({
          gamemode: tier.gamemode as GameMode,
          tier: tier.internal_tier as TierLevel,
          score: tier.score || 0,
        })
      })
    }

    // Process players with pre-fetched tier data and calculate global points correctly
    const players: Player[] = playersData.map((player, index) => {
      const tierAssignments = tierAssignmentsByPlayer.get(player.id) || []

      // Calculate global points from tier assignments if database value seems incorrect
      const calculatedPoints = calculatePlayerGlobalPoints(tierAssignments)
      const databasePoints = player.global_points || 0

      // Use calculated points if database points are 0 but we have tier assignments
      const finalPoints = (databasePoints === 0 && calculatedPoints > 0) ? calculatedPoints : databasePoints

      console.log(`Player ${player.ign}: DB points = ${databasePoints}, Calculated = ${calculatedPoints}, Final = ${finalPoints}`)

      return {
        id: player.id,
        ign: player.ign,
        region: player.region || "NA",
        device: player.device || "PC",
        global_points: finalPoints,
        overall_rank: index + 1,
        java_username: player.java_username,
        avatar_url: player.avatar_url,
        tierAssignments: tierAssignments,
      }
    })

    // Sort by final calculated points to get correct rankings
    players.sort((a, b) => (b.global_points || 0) - (a.global_points || 0))

    // Update rankings after sorting
    players.forEach((player, index) => {
      player.overall_rank = index + 1
    })

    console.log("Optimized leaderboard processing complete:", players.length, "players")
    return players
  } catch (error) {
    console.error("Error in getLeaderboard:", error)
    throw error
  }
}

export async function getPlayerTierAssignments(
  playerId: string,
): Promise<{ gamemode: GameMode; tier: TierLevel; score: number }[]> {
  try {
    const { data, error } = await supabase
      .from("gamemode_scores")
      .select("gamemode, internal_tier, score")
      .eq("player_id", playerId)

    if (error) {
      console.error("Error fetching tier assignments:", error)
      return []
    }

    if (!data) return []

    return data.map((item) => ({
      gamemode: item.gamemode as GameMode,
      tier: item.internal_tier as TierLevel,
      score: item.score || 0,
    }))
  } catch (error) {
    console.error("Error in getPlayerTierAssignments:", error)
    return []
  }
}

// OPTIMIZED: Single query for gamemode tiers
export async function getGamemodeTiers(gamemode: GameMode): Promise<Player[]> {
  console.log(`Fetching optimized tiers for gamemode: ${gamemode}`)

  try {
    const { data, error } = await supabase
      .from("gamemode_scores")
      .select(`
        score,
        internal_tier,
        player_id,
        players!inner (
          id,
          ign,
          region,
          device,
          java_username,
          avatar_url,
          banned
        )
      `)
      .eq("gamemode", gamemode)
      .eq("players.banned", false)
      .order("score", { ascending: false })
      .limit(50)

    if (error) {
      console.error("Error fetching gamemode tiers:", error)
      throw error
    }

    if (!data || data.length === 0) {
      console.log(`No data found for gamemode: ${gamemode}`)
      return []
    }

    console.log(`Found ${data.length} players for gamemode: ${gamemode}`)

    // Get all player IDs for batch fetching tier assignments
    const playerIds = data.map((item: any) => item.players.id)

    // Single query to get all tier assignments for these players
    const { data: tierData } = await supabase
      .from("gamemode_scores")
      .select("player_id, gamemode, internal_tier, score")
      .in("player_id", playerIds)

    // Group tier assignments by player ID
    const tierAssignmentsByPlayer = new Map<string, { gamemode: GameMode; tier: TierLevel; score: number }[]>()

    if (tierData) {
      tierData.forEach((tier) => {
        if (!tierAssignmentsByPlayer.has(tier.player_id)) {
          tierAssignmentsByPlayer.set(tier.player_id, [])
        }
        tierAssignmentsByPlayer.get(tier.player_id)!.push({
          gamemode: tier.gamemode as GameMode,
          tier: tier.internal_tier as TierLevel,
          score: tier.score || 0,
        })
      })
    }

    const players: Player[] = data.map((item: any, index: number) => ({
      id: item.players.id,
      ign: item.players.ign,
      region: item.players.region || "NA",
      device: item.players.device || "PC",
      global_points: item.score,
      overall_rank: index + 1,
      tier: item.internal_tier,
      java_username: item.players.java_username,
      avatar_url: item.players.avatar_url,
      tierAssignments: tierAssignmentsByPlayer.get(item.players.id) || [],
      gamemode_points: {
        [gamemode]: item.score,
      },
    }))

    return players
  } catch (error) {
    console.error("Error in getGamemodeTiers:", error)
    throw error
  }
}

// OPTIMIZED: Batch search with tier assignments
export async function searchPlayers(query: string): Promise<Player[]> {
  try {
    const { data, error } = await supabase
      .from("players")
      .select("*")
      .eq("banned", false)
      .ilike("ign", `%${query}%`)
      .limit(20)

    if (error) {
      console.error("Error searching players:", error)
      return []
    }

    if (!data) return []

    // Batch fetch tier assignments for all search results
    const playerIds = data.map((p) => p.id)
    const { data: tierData } = await supabase
      .from("gamemode_scores")
      .select("player_id, gamemode, internal_tier, score")
      .in("player_id", playerIds)

    // Group tier assignments by player ID
    const tierAssignmentsByPlayer = new Map<string, { gamemode: GameMode; tier: TierLevel; score: number }[]>()

    if (tierData) {
      tierData.forEach((tier) => {
        if (!tierAssignmentsByPlayer.has(tier.player_id)) {
          tierAssignmentsByPlayer.set(tier.player_id, [])
        }
        tierAssignmentsByPlayer.get(tier.player_id)!.push({
          gamemode: tier.gamemode as GameMode,
          tier: tier.internal_tier as TierLevel,
          score: tier.score || 0,
        })
      })
    }

    const players: Player[] = data.map((player) => ({
      id: player.id,
      ign: player.ign,
      region: player.region || "NA",
      device: player.device || "PC",
      global_points: player.global_points || 0,
      overall_rank: 0,
      java_username: player.java_username,
      avatar_url: player.avatar_url,
      tierAssignments: tierAssignmentsByPlayer.get(player.id) || [],
    }))

    return players
  } catch (error) {
    console.error("Error in searchPlayers:", error)
    return []
  }
}

// OPTIMIZED: Single query for tier data
export async function getPlayersByTierAndGamemode(gamemode: GameMode): Promise<{
  [key in TierLevel]?: Player[]
}> {
  console.log(`Fetching optimized tier data for gamemode: ${gamemode}`)

  try {
    const { data, error } = await supabase
      .from("gamemode_scores")
      .select(`
        score,
        internal_tier,
        player_id,
        players!inner (
          id,
          ign,
          region,
          device,
          java_username,
          avatar_url,
          banned
        )
      `)
      .eq("gamemode", gamemode)
      .eq("players.banned", false)
      .order("score", { ascending: false })

    if (error) {
      console.error("Error fetching gamemode tier data:", error)
      throw error
    }

    if (!data || data.length === 0) {
      console.log(`No tier data found for gamemode: ${gamemode}`)
      return {
        HT1: [],
        LT1: [],
        HT2: [],
        LT2: [],
        HT3: [],
        LT3: [],
        HT4: [],
        LT4: [],
        HT5: [],
        LT5: [],
        Retired: [],
      }
    }

    const tierData: { [key in TierLevel]?: Player[] } = {
      HT1: [],
      LT1: [],
      HT2: [],
      LT2: [],
      HT3: [],
      LT3: [],
      HT4: [],
      LT4: [],
      HT5: [],
      LT5: [],
      Retired: [],
    }

    // Get all player IDs for batch fetching tier assignments
    const playerIds = data.map((item: any) => item.players.id)

    // Single query to get all tier assignments for these players
    const { data: allTierData } = await supabase
      .from("gamemode_scores")
      .select("player_id, gamemode, internal_tier, score")
      .in("player_id", playerIds)

    // Group tier assignments by player ID
    const tierAssignmentsByPlayer = new Map<string, { gamemode: GameMode; tier: TierLevel; score: number }[]>()

    if (allTierData) {
      allTierData.forEach((tier) => {
        if (!tierAssignmentsByPlayer.has(tier.player_id)) {
          tierAssignmentsByPlayer.set(tier.player_id, [])
        }
        tierAssignmentsByPlayer.get(tier.player_id)!.push({
          gamemode: tier.gamemode as GameMode,
          tier: tier.internal_tier as TierLevel,
          score: tier.score || 0,
        })
      })
    }

    data.forEach((item: any) => {
      const player: Player = {
        id: item.players.id,
        ign: item.players.ign,
        region: item.players.region || "NA",
        device: item.players.device || "PC",
        global_points: item.score,
        overall_rank: 0,
        tier: item.internal_tier,
        java_username: item.players.java_username,
        avatar_url: item.players.avatar_url,
        tierAssignments: tierAssignmentsByPlayer.get(item.players.id) || [],
        gamemode_points: {
          [gamemode]: item.score,
        },
      }

      const tier = item.internal_tier as TierLevel
      if (tierData[tier]) {
        tierData[tier]!.push(player)
      }
    })

    return tierData
  } catch (error) {
    console.error("Error in getPlayersByTierAndGamemode:", error)
    throw error
  }
}

// Add gamemode mapping to handle frontend display names vs database names
export function mapGameModeToDatabase(frontendMode: string): GameMode {
  const modeMap: Record<string, GameMode> = {
    Skywars: "skywars",
    Midfight: "midfight",
    Bridge: "bridge",
    Crystal: "Crystal",
    Sumo: "sumo",
    Nodebuff: "nodebuff",
    Bedfight: "bedfight",

  }

  return modeMap[frontendMode] || (frontendMode as GameMode)
}

export function mapDatabaseToDisplayMode(dbMode: GameMode): string {
  const displayMap: Record<GameMode, string> = {
    skywars: "Skywars",
    midfight: "Midfight",
    bridge: "Bridge",
    Crystal: "Crystal",
    sumo: "Sumo",
    nodebuff: "Nodebuff",
    bedfight: "Bedfight",
    UHC: "UHC",
  }

  return displayMap[dbMode] || dbMode
}

// Add the missing getPlayersByGamemode function
export async function getPlayersByGamemode(gamemode: GameMode): Promise<Player[]> {
  return getGamemodeTiers(gamemode);
}