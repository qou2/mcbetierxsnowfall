
"use client"

import React, { useState, useCallback, useMemo } from "react"
import { Navbar } from "../components/Navbar"
import { Footer } from "../components/Footer"
import { MinecraftLeaderboardTable } from "../components/MinecraftLeaderboardTable"
import { useLeaderboard } from "../hooks/useLeaderboard"
import { TierGrid } from "../components/TierGrid"
import { usePopup } from "../contexts/PopupContext"
import { useNavigate } from "react-router-dom"
import type { GameMode, Player } from "../services/playerService"
import { toDatabaseGameMode } from "@/utils/gamemodeCasing"
import { getPlayerRank } from "@/utils/rankUtils"
import { usePointsCalculation } from "@/hooks/usePointsCalculation"
import { useSkywarsWithSnowfall } from "@/hooks/useSkywarsWithSnowfall"
import { getAllPlayersWithSnowfallIntegration, getSnowfallTierDisplay } from "@/services/snowfallIntegrationService"
import { useQuery } from '@tanstack/react-query'

const Index = () => {
  const navigate = useNavigate()
  const [selectedMode, setSelectedMode] = useState<GameMode | "overall">("overall")

  const { players: regularPlayers, loading: leaderboardLoading, error: leaderboardError } = useLeaderboard()
  const { players: skywarsPlayers, loading: skywarsLoading, error: skywarsError } = useSkywarsWithSnowfall()
  
  // Get all players with snowfall integration for overall leaderboard
  const { data: allPlayersWithSnowfall = [], isLoading: allPlayersLoading, error: allPlayersError } = useQuery({
    queryKey: ['all-players-with-snowfall'],
    queryFn: getAllPlayersWithSnowfallIntegration,
    staleTime: 10 * 60 * 1000,
    gcTime: 20 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchInterval: false,
    refetchOnReconnect: false,
  })
  
  // Convert to the expected Player format for the overall leaderboard
  const players = useMemo(() => {
    return allPlayersWithSnowfall.map(player => {
      // Build tier assignments array
      const tierAssignments = []
      
      // Add existing tier assignments if this player exists in regular players
      const regularPlayer = regularPlayers.find(rp => 
        rp.ign.toLowerCase() === player.ign.toLowerCase() ||
        (rp.java_username && player.java_username && rp.java_username.toLowerCase() === player.java_username.toLowerCase())
      )
      
      if (regularPlayer?.tierAssignments) {
        // Add all non-skywars tier assignments from regular player
        tierAssignments.push(...regularPlayer.tierAssignments.filter(ta => ta.gamemode !== 'skywars'))
      }
      
      // Add snowfall tier as skywars tier assignment
      if (player.snowfall_tier) {
        tierAssignments.push({
          gamemode: 'skywars' as GameMode,
          tier: player.snowfall_tier as any,
          score: player.snowfall_score || 0
        })
      }
      
      return {
        ...player,
        tierAssignments
      }
    })
  }, [allPlayersWithSnowfall, regularPlayers])
  const { openPopup } = usePopup()

  // Enable automatic points calculation
  usePointsCalculation()

  // Memoize the player click handler to prevent unnecessary re-renders
  const handlePlayerClick = useCallback(
    (player: Player) => {
      const rankInfo = getPlayerRank(player.global_points || 0)

      // Enhanced tier assignments with snowfall tiers
      const tierAssignments = (player.tierAssignments || []).map((assignment) => {
        // For skywars, use snowfall tier if available
        if (assignment.gamemode === 'skywars') {
          const snowfallPlayer = skywarsPlayers.find(sp => 
            sp.ign.toLowerCase() === player.ign.toLowerCase() || 
            (sp.java_username && player.java_username && sp.java_username.toLowerCase() === player.java_username.toLowerCase())
          )
          
          if (snowfallPlayer?.snowfall_tier) {
            return {
              gamemode: assignment.gamemode,
              tier: snowfallPlayer.snowfall_tier as any,
              score: snowfallPlayer.snowfall_score || assignment.score,
            }
          }
        }
        
        return {
          gamemode: assignment.gamemode,
          tier: assignment.tier,
          score: assignment.score,
        }
      })

      openPopup({
        player,
        tierAssignments,
        combatRank: {
          title: rankInfo.title,
          points: player.global_points || 0,
          color: rankInfo.color,
          effectType: "general",
          rankNumber: player.overall_rank || 1,
          borderColor: rankInfo.borderColor,
        },
        timestamp: new Date().toISOString(),
      })
    },
    [openPopup, skywarsPlayers],
  )

  // Memoize the mode selection handler
  const handleSelectMode = useCallback((mode: string) => {
    setSelectedMode(mode as GameMode | "overall")
  }, [])

  // Memoize the loading and error states
  const loading = selectedMode === "overall" ? allPlayersLoading : 
                  selectedMode === "skywars" ? skywarsLoading : leaderboardLoading
  const error = selectedMode === "overall" ? (allPlayersError as Error)?.message : 
                selectedMode === "skywars" ? skywarsError : leaderboardError

  // Memoize the main content to prevent unnecessary re-renders
  const mainContent = useMemo(() => {
    if (loading) {
      return (
        <div className="flex justify-center py-8">
          <div className="text-white">Loading...</div>
        </div>
      )
    }

    if (error) {
      return <div className="text-red-500 text-center py-8">Error: {error}</div>
    }

    if (selectedMode === "overall") {
      return (
        <div className="w-full simple-animation">
          <MinecraftLeaderboardTable 
            players={players} 
            onPlayerClick={handlePlayerClick}
            showSnowfallTiers={true}
          />
        </div>
      )
    }

    if (selectedMode === "skywars") {
      return (
        <div className="w-full simple-animation">
          <TierGrid 
            selectedMode="skywars" 
            onPlayerClick={handlePlayerClick}
            useSnowfallData={true}
          />
        </div>
      )
    }

    return (
      <div className="w-full simple-animation">
        <TierGrid selectedMode={toDatabaseGameMode(selectedMode) as GameMode} onPlayerClick={handlePlayerClick} />
      </div>
    )
  }, [loading, error, selectedMode, players, handlePlayerClick])

  return (
    <div className="flex flex-col min-h-screen bg-gradient-dark">
      <Navbar selectedMode={selectedMode} onSelectMode={handleSelectMode} navigate={navigate} />

      <main className="flex-grow w-full">
        <div className="w-full px-2 py-3">{mainContent}</div>
      </main>

      <Footer />
    </div>
  )
}

export default React.memo(Index)
