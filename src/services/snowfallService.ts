
import { supabase } from "@/integrations/supabase/client"
import { SnowfallPlayer, SnowfallTier, calculateSnowfallTier } from "@/types/snowfall"

export async function getSnowfallLeaderboard(): Promise<SnowfallPlayer[]> {
  try {
    const { data, error } = await supabase
      .from("snowfall_players")
      .select("*")
      .order("overall_score", { ascending: false })
      .limit(50)

    if (error) {
      console.error("Error fetching Snowfall leaderboard:", error)
      throw new Error(`Failed to fetch leaderboard: ${error.message}`)
    }

    return data?.map(player => ({
      id: player.id,
      minecraft_username: player.minecraft_username,
      assessment: {
        playstyle: player.playstyle,
        movement: player.movement,
        pvp: player.pvp,
        building: player.building,
        projectiles: player.projectiles,
        overall_score: Number(player.overall_score),
        tier: player.tier as SnowfallTier
      },
      created_at: player.created_at,
      updated_at: player.updated_at
    })) || []
  } catch (error) {
    console.error("Error in getSnowfallLeaderboard:", error)
    throw error
  }
}

export async function addSnowfallRank(
  minecraft_username: string,
  playstyle: number,
  movement: number,
  pvp: number,
  building: number,
  projectiles: number
): Promise<SnowfallPlayer> {
  try {
    // Validate inputs
    if (!minecraft_username || minecraft_username.trim().length === 0) {
      throw new Error("Minecraft username is required")
    }

    const stats = [playstyle, movement, pvp, building, projectiles]
    if (stats.some(stat => stat < 1 || stat > 100)) {
      throw new Error("All stats must be between 1 and 100")
    }

    const overall_score = Number(((playstyle + movement + pvp + building + projectiles) / 5).toFixed(2))
    const tier = calculateSnowfallTier(overall_score)

    const { data, error } = await supabase
      .from("snowfall_players")
      .upsert({
        minecraft_username: minecraft_username.trim(),
        playstyle: Number(playstyle),
        movement: Number(movement),
        pvp: Number(pvp),
        building: Number(building),
        projectiles: Number(projectiles),
        overall_score,
        tier,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'minecraft_username'
      })
      .select()
      .single()

    if (error) {
      console.error("Error adding Snowfall rank:", error)
      throw new Error(`Failed to add rank: ${error.message}`)
    }

    return {
      id: data.id,
      minecraft_username: data.minecraft_username,
      assessment: {
        playstyle: data.playstyle,
        movement: data.movement,
        pvp: data.pvp,
        building: data.building,
        projectiles: data.projectiles,
        overall_score: Number(data.overall_score),
        tier: data.tier as SnowfallTier
      },
      created_at: data.created_at,
      updated_at: data.updated_at
    }
  } catch (error) {
    console.error("Error in addSnowfallRank:", error)
    throw error
  }
}

export async function getSnowfallPlayerByUsername(username: string): Promise<SnowfallPlayer | null> {
  try {
    const { data, error } = await supabase
      .from("snowfall_players")
      .select("*")
      .eq("minecraft_username", username.trim())
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        // No rows found
        return null
      }
      console.error("Error fetching Snowfall player:", error)
      throw new Error(`Failed to fetch player: ${error.message}`)
    }

    return {
      id: data.id,
      minecraft_username: data.minecraft_username,
      assessment: {
        playstyle: data.playstyle,
        movement: data.movement,
        pvp: data.pvp,
        building: data.building,
        projectiles: data.projectiles,
        overall_score: Number(data.overall_score),
        tier: data.tier as SnowfallTier
      },
      created_at: data.created_at,
      updated_at: data.updated_at
    }
  } catch (error) {
    console.error("Error in getSnowfallPlayerByUsername:", error)
    throw error
  }
}

export async function searchSnowfallPlayers(query: string): Promise<SnowfallPlayer[]> {
  try {
    if (!query || query.trim().length < 2) {
      return []
    }

    const { data, error } = await supabase
      .from("snowfall_players")
      .select("*")
      .ilike("minecraft_username", `%${query.trim()}%`)
      .order("overall_score", { ascending: false })
      .limit(10)

    if (error) {
      console.error("Error searching Snowfall players:", error)
      throw new Error(`Failed to search players: ${error.message}`)
    }

    return data?.map(player => ({
      id: player.id,
      minecraft_username: player.minecraft_username,
      assessment: {
        playstyle: player.playstyle,
        movement: player.movement,
        pvp: player.pvp,
        building: player.building,
        projectiles: player.projectiles,
        overall_score: Number(player.overall_score),
        tier: player.tier as SnowfallTier
      },
      created_at: player.created_at,
      updated_at: player.updated_at
    })) || []
  } catch (error) {
    console.error("Error in searchSnowfallPlayers:", error)
    throw error
  }
}

export async function getSnowfallPlayersByTier(): Promise<{[key in SnowfallTier]?: SnowfallPlayer[]}> {
  try {
    const { data, error } = await supabase
      .from("snowfall_players")
      .select("*")
      .order("overall_score", { ascending: false })

    if (error) {
      console.error("Error fetching Snowfall players by tier:", error)
      throw new Error(`Failed to fetch players by tier: ${error.message}`)
    }

    const tierData: {[key in SnowfallTier]?: SnowfallPlayer[]} = {
      "HT1": [],
      "MT1": [],
      "LT1": [],
      "HT2": [],
      "MT2": [],
      "LT2": [],
      "HT3": [],
      "MT3": [],
      "LT3": [],
      "HT4": [],
      "MT4": [],
      "LT4": [],
      "No Rank": []
    }

    data?.forEach(player => {
      const snowfallPlayer: SnowfallPlayer = {
        id: player.id,
        minecraft_username: player.minecraft_username,
        assessment: {
          playstyle: player.playstyle,
          movement: player.movement,
          pvp: player.pvp,
          building: player.building,
          projectiles: player.projectiles,
          overall_score: Number(player.overall_score),
          tier: player.tier as SnowfallTier
        },
        created_at: player.created_at,
        updated_at: player.updated_at
      }

      const tier = player.tier as SnowfallTier
      if (tierData[tier]) {
        tierData[tier]!.push(snowfallPlayer)
      }
    })

    return tierData
  } catch (error) {
    console.error("Error in getSnowfallPlayersByTier:", error)
    throw error
  }
}
