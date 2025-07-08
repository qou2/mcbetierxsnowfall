"use client"

import { useState } from "react"
import { Trophy, Shield, ChevronDown, Monitor, Smartphone, Gamepad } from "lucide-react"
import { useGamemodeTiers } from "@/hooks/useGamemodeTiers"
import { useSkywarsWithSnowfall } from "@/hooks/useSkywarsWithSnowfall"
import { useSnowfallLeaderboard } from "@/hooks/useSnowfallLeaderboard"
import { Button } from "@/components/ui/button"
import { toDatabaseGameMode } from "@/utils/gamemodeCasing"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { getAvatarUrl, handleAvatarError } from "@/utils/avatarUtils"
import type { GameMode, Player } from "@/services/playerService"
import type { SnowfallPlayer } from "@/types/snowfall"

interface TierGridProps {
  selectedMode: GameMode
  onPlayerClick: (player: Player | SnowfallPlayer) => void
  useSnowfallData?: boolean
}

const getDeviceIcon = (device = "PC") => {
  switch (device?.toLowerCase()) {
    case "mobile":
    case "bedrock":
      return <Smartphone className="w-3 h-3 text-blue-400" />
    case "console":
      return <Gamepad className="w-3 h-3 text-green-400" />
    case "pc":
    case "java":
    default:
      return <Monitor className="w-3 h-3 text-white/80" />
  }
}

export function TierGrid({ selectedMode, onPlayerClick, useSnowfallData = false }: TierGridProps) {
  const databaseGameMode = toDatabaseGameMode(selectedMode) as GameMode
  
  // Regular data hooks
  const { tierData, loading: regularLoading, error: regularError } = useGamemodeTiers(databaseGameMode)
  
  // Snowfall data hooks
  const { players: skywarsPlayers, loading: skywarsLoading, error: skywarsError } = useSkywarsWithSnowfall()
  const { players: snowfallPlayers, loading: snowfallLoading, error: snowfallError } = useSnowfallLeaderboard()

  // Determine which data source to use
  const loading = useSnowfallData ? 
    (selectedMode === 'skywars' ? skywarsLoading : snowfallLoading) : 
    regularLoading
  const error = useSnowfallData ? 
    (selectedMode === 'skywars' ? skywarsError : snowfallError) : 
    regularError

  const [tierVisibility, setTierVisibility] = useState({
    1: { count: 10, loadMore: true },
    2: { count: 10, loadMore: true },
    3: { count: 10, loadMore: true },
    4: { count: 10, loadMore: true },
    5: { count: 10, loadMore: true },
    retired: { count: 10, loadMore: true },
  })

  const [showRetired, setShowRetired] = useState(false)

  const loadMoreForTier = (tier: number | "retired") => {
    setTierVisibility((prev) => ({
      ...prev,
      [tier]: {
        ...prev[tier],
        count: prev[tier].count + 10,
      },
    }))
  }

  // Process snowfall data into tier structure
  const getSnowfallTierData = () => {
    if (!useSnowfallData) return {}
    
    const players = selectedMode === 'skywars' ? skywarsPlayers : snowfallPlayers
    const snowfallTierData: Record<string, any[]> = {
      HT1: [], MT1: [], LT1: [],
      HT2: [], MT2: [], LT2: [],
      HT3: [], MT3: [], LT3: [],
      HT4: [], MT4: [], LT4: []
    }

    players.forEach((player: any) => {
      let tier: string
      if (selectedMode === 'skywars') {
        tier = player.snowfall_tier
      } else {
        tier = player.assessment?.tier
      }
      
      if (tier && snowfallTierData[tier]) {
        snowfallTierData[tier].push(player)
      }
    })

    return snowfallTierData
  }

  const snowfallTierData = getSnowfallTierData()
  const tiers = useSnowfallData ? [1, 2, 3, 4] : [1, 2, 3, 4, 5]

  return (
    <div className="space-y-4 md:space-y-6 pb-8">
      {!useSnowfallData && (
        <div className="flex justify-end mb-2">
          <Button variant="outline" size="sm" onClick={() => setShowRetired(!showRetired)} className="text-sm">
            {showRetired ? "Hide Retired Players" : "Show Retired Players"}
          </Button>
        </div>
      )}

      {loading ? (
        <div className="text-center py-12">
          <div className="text-white">Loading tier data...</div>
        </div>
      ) : error ? (
        <div className="text-center py-12 text-red-400">Error loading tier data: {error}</div>
      ) : (
        <div className={`grid grid-cols-1 ${useSnowfallData ? 'md:grid-cols-4' : 'md:grid-cols-5'} gap-4 md:gap-6`}>
          {tiers.map((tier) => {
            let sortedPlayers: any[] = []
            
            if (useSnowfallData) {
              // Handle snowfall data with HT, MT, LT subtiers
              const highTierPlayers = snowfallTierData[`HT${tier}`] || []
              const midTierPlayers = snowfallTierData[`MT${tier}`] || []
              const lowTierPlayers = snowfallTierData[`LT${tier}`] || []
              
              sortedPlayers = [
                ...highTierPlayers.map((p: any) => ({ ...p, subtier: "High" })),
                ...midTierPlayers.map((p: any) => ({ ...p, subtier: "Mid" })),
                ...lowTierPlayers.map((p: any) => ({ ...p, subtier: "Low" }))
              ]
            } else {
              // Handle regular tier data
              const highTierKey = `HT${tier}` as keyof typeof tierData
              const lowTierKey = `LT${tier}` as keyof typeof tierData
              const highTierPlayers = tierData[highTierKey] || []
              const lowTierPlayers = tierData[lowTierKey] || []

              sortedPlayers = [...highTierPlayers, ...lowTierPlayers]
                .map((player) => ({
                  ...player,
                  subtier: highTierPlayers.some((p) => p.id === player.id) ? "High" : "Low",
                }))
                .sort((a, b) => {
                  const pointsA =
                    typeof a.global_points === "string" ? Number.parseFloat(a.global_points) : a.global_points || 0
                  const pointsB =
                    typeof b.global_points === "string" ? Number.parseFloat(b.global_points) : b.global_points || 0
                  return pointsB - pointsA
                })
            }

            const visibleCount = tierVisibility[tier].count
            const visiblePlayers = sortedPlayers.slice(0, visibleCount)
            const hasMore = sortedPlayers.length > visibleCount

            return (
              <div key={tier} className={`tier-column tier-${tier}`}>
                <div className="bg-dark-surface/40 rounded-xl overflow-hidden border border-white/5 h-full">
                  <div className="tier-header bg-dark-surface/70 border-b border-white/5 py-3 px-4">
                    <div className="flex items-center justify-between">
                      <h3 className={`text-tier-${tier} font-bold flex items-center`}>
                        <Trophy className="mr-2" size={18} />
                        TIER {tier}
                      </h3>
                      <div className="flex items-center text-xs text-white/40">
                        <Shield size={14} className="mr-1" />
                        {sortedPlayers.length}
                      </div>
                    </div>
                  </div>

                  {visiblePlayers.length > 0 ? (
                    <div className="space-y-0">
                      <div className="grid grid-cols-1 divide-y divide-white/5">
                        {visiblePlayers.map((player) => {
                          const playerName = player.ign || player.username || player.name
                          const playerId = player.id || player.username || player.name
                          
                          return (
                            <div
                              key={playerId}
                              className="flex items-center gap-3 px-4 py-3 hover:bg-white/5 cursor-pointer transform-none"
                              onClick={() => onPlayerClick(player)}
                            >
                              <div className="relative">
                                <Avatar className="w-8 h-8 border border-white/20">
                                  <AvatarImage
                                    src={player.avatar_url || getAvatarUrl(playerName, player.java_username)}
                                    alt={playerName}
                                    className="object-cover object-center scale-110"
                                    onError={(e) => handleAvatarError(e, playerName, player.java_username)}
                                  />
                                  <AvatarFallback className="bg-gray-700 text-white text-xs font-bold">
                                    {playerName?.charAt(0) || "?"}
                                  </AvatarFallback>
                                </Avatar>
                              </div>

                              <div className="flex flex-col">
                                <div className="flex items-center gap-2 mb-1">
                                  {getDeviceIcon(player.device)}
                                  <span className="text-sm font-medium">{playerName}</span>
                                </div>
                                <span
                                  className={`text-xs ${
                                    player.subtier === "High" ? `text-tier-${tier}` : 
                                    player.subtier === "Mid" ? "text-orange-400" : "text-white/50"
                                  }`}
                                >
                                  {useSnowfallData ? 
                                    `${player.subtier === "High" ? "HT" : player.subtier === "Mid" ? "MT" : "LT"}${tier} Player` :
                                    `${player.subtier === "High" ? "HT" : "LT"}${tier} Player`
                                  }
                                </span>
                              </div>
                            </div>
                          )
                        })}

                        {hasMore && (
                          <div className="py-3 text-center">
                            <Button
                              variant="ghost"
                              onClick={() => loadMoreForTier(tier)}
                              size="sm"
                              className="text-xs flex items-center gap-1"
                            >
                              Load More <ChevronDown size={14} />
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-6 text-white/20 text-sm">No players in this tier</div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Retired Section - Only show for regular data */}
      {!useSnowfallData && showRetired && (
        <div className="mt-8 pt-6 border-t border-white/10">
          <h2 className="text-xl font-bold mb-4 text-gray-400">Retired Players</h2>

          <div className="bg-dark-surface/40 rounded-xl overflow-hidden border border-white/5">
            <div className="tier-header bg-dark-surface/70 border-b border-white/5 py-3 px-4">
              <div className="flex items-center justify-between">
                <h3 className="text-gray-400 font-bold flex items-center">
                  <Trophy className="mr-2" size={18} />
                  RETIRED
                </h3>
                <div className="flex items-center text-xs text-white/40">
                  <Shield size={14} className="mr-1" />
                  {(tierData["Retired"] || []).length}
                </div>
              </div>
            </div>

            {tierData["Retired"] && tierData["Retired"].length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 divide-y divide-white/5">
                {tierData["Retired"].slice(0, tierVisibility.retired.count).map((player) => {
                  return (
                    <div
                      key={player.id}
                      className="flex items-center gap-3 px-4 py-3 hover:bg-white/5 cursor-pointer transform-none"
                      onClick={() => onPlayerClick(player)}
                    >
                      <div className="relative">
                        <Avatar className="w-8 h-8 border border-white/20">
                          <AvatarImage
                            src={player.avatar_url || getAvatarUrl(player.ign, player.java_username)}
                            alt={player.ign}
                            className="object-cover object-center scale-110"
                            onError={(e) => handleAvatarError(e, player.ign, player.java_username)}
                          />
                          <AvatarFallback className="bg-gray-700 text-white text-xs font-bold">
                            {player.ign?.charAt(0) || "?"}
                          </AvatarFallback>
                        </Avatar>
                      </div>

                      <div className="flex flex-col">
                        <div className="flex items-center gap-2 mb-1">
                          {getDeviceIcon(player.device)}
                          <span className="text-sm font-medium">{player.ign}</span>
                        </div>
                        <span className="text-xs text-gray-400">Retired Player</span>
                      </div>
                    </div>
                  )
                })}

                {tierData["Retired"] && tierData["Retired"].length > tierVisibility.retired.count && (
                  <div className="py-3 text-center col-span-3">
                    <Button
                      variant="ghost"
                      onClick={() => loadMoreForTier("retired")}
                      size="sm"
                      className="text-xs flex items-center gap-1"
                    >
                      Load More <ChevronDown size={14} />
                    </Button>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-6 text-white/20 text-sm">No retired players in this gamemode</div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
