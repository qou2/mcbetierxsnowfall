
"use client"

import { useState } from "react"
import { Trophy, Shield, ChevronDown, Monitor, Smartphone, Gamepad } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { getAvatarUrl, handleAvatarError } from "@/utils/avatarUtils"
import { useQuery } from '@tanstack/react-query'
import { getSnowfallPlayersByTier } from '@/services/snowfallService'
import type { SnowfallPlayer, SnowfallTier } from '@/types/snowfall'

interface SnowfallTierGridProps {
  onPlayerClick: (player: SnowfallPlayer) => void
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

const getSnowfallTierColor = (tier: string) => {
  if (tier.includes('HT1') || tier.includes('MT1') || tier.includes('LT1')) return 'text-yellow-400'
  if (tier.includes('HT2') || tier.includes('MT2') || tier.includes('LT2')) return 'text-orange-400'
  if (tier.includes('HT3') || tier.includes('MT3') || tier.includes('LT3')) return 'text-purple-400'
  if (tier.includes('HT4') || tier.includes('MT4') || tier.includes('LT4')) return 'text-blue-400'
  return 'text-gray-400'
}

export function SnowfallTierGrid({ onPlayerClick }: SnowfallTierGridProps) {
  const { data: tierData = {}, isLoading: loading, error } = useQuery({
    queryKey: ['snowfall-tiers'],
    queryFn: getSnowfallPlayersByTier,
  })

  const [tierVisibility, setTierVisibility] = useState({
    1: { count: 10, loadMore: true },
    2: { count: 10, loadMore: true },
    3: { count: 10, loadMore: true },
    4: { count: 10, loadMore: true },
    'no-rank': { count: 10, loadMore: true },
  })

  const [showNoRank, setShowNoRank] = useState(false)

  const loadMoreForTier = (tier: number | 'no-rank') => {
    setTierVisibility((prev) => ({
      ...prev,
      [tier]: {
        ...prev[tier],
        count: prev[tier].count + 10,
      },
    }))
  }

  const tiers = [1, 2, 3, 4]

  return (
    <div className="space-y-4 md:space-y-6 pb-8">
      <div className="flex justify-end mb-2">
        <Button variant="outline" size="sm" onClick={() => setShowNoRank(!showNoRank)} className="text-sm">
          {showNoRank ? "Hide Unranked Players" : "Show Unranked Players"}
        </Button>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="text-white">Loading Snowfall tier data...</div>
        </div>
      ) : error ? (
        <div className="text-center py-12 text-red-400">Error loading Snowfall tier data</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 md:gap-6">
          {tiers.map((tier) => {
            const highTierKey = `HT${tier}` as SnowfallTier
            const midTierKey = `MT${tier}` as SnowfallTier
            const lowTierKey = `LT${tier}` as SnowfallTier
            
            const highTierPlayers = tierData[highTierKey] || []
            const midTierPlayers = tierData[midTierKey] || []
            const lowTierPlayers = tierData[lowTierKey] || []

            const sortedPlayers = [...highTierPlayers, ...midTierPlayers, ...lowTierPlayers]
              .map((player) => {
                let subtier = "Low"
                if (highTierPlayers.some((p) => p.id === player.id)) subtier = "High"
                else if (midTierPlayers.some((p) => p.id === player.id)) subtier = "Mid"
                return { ...player, subtier }
              })
              .sort((a, b) => b.assessment.overall_score - a.assessment.overall_score)

            const visibleCount = tierVisibility[tier].count
            const visiblePlayers = sortedPlayers.slice(0, visibleCount)
            const hasMore = sortedPlayers.length > visibleCount

            return (
              <div key={tier} className={`tier-column tier-${tier}`}>
                <div className="bg-dark-surface/40 rounded-xl overflow-hidden border border-white/5 h-full">
                  <div className="tier-header bg-dark-surface/70 border-b border-white/5 py-3 px-4">
                    <div className="flex items-center justify-between">
                      <h3 className={`${getSnowfallTierColor(`T${tier}`)} font-bold flex items-center`}>
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
                          return (
                            <div
                              key={player.id}
                              className="flex items-center gap-3 px-4 py-3 hover:bg-white/5 cursor-pointer transform-none"
                              onClick={() => onPlayerClick(player)}
                            >
                              <div className="relative">
                                <Avatar className="w-8 h-8 border border-white/20">
                                  <AvatarImage
                                    src={getAvatarUrl(player.minecraft_username)}
                                    alt={player.minecraft_username}
                                    className="object-cover object-center scale-110"
                                    onError={(e) => handleAvatarError(e, player.minecraft_username)}
                                  />
                                  <AvatarFallback className="bg-gray-700 text-white text-xs font-bold">
                                    {player.minecraft_username?.charAt(0) || "?"}
                                  </AvatarFallback>
                                </Avatar>
                              </div>

                              <div className="flex flex-col">
                                <div className="flex items-center gap-2 mb-1">
                                  {getDeviceIcon("PC")}
                                  <span className="text-sm font-medium">{player.minecraft_username}</span>
                                </div>
                                <span
                                  className={`text-xs ${
                                    player.subtier === "High" ? getSnowfallTierColor(`T${tier}`) : 
                                    player.subtier === "Mid" ? "text-white/70" : "text-white/50"
                                  }`}
                                >
                                  {player.subtier === "High" ? `HT${tier} Player` : 
                                   player.subtier === "Mid" ? `MT${tier} Player` : `LT${tier} Player`}
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

      {/* No Rank Section */}
      {showNoRank && (
        <div className="mt-8 pt-6 border-t border-white/10">
          <h2 className="text-xl font-bold mb-4 text-gray-400">Unranked Players</h2>

          <div className="bg-dark-surface/40 rounded-xl overflow-hidden border border-white/5">
            <div className="tier-header bg-dark-surface/70 border-b border-white/5 py-3 px-4">
              <div className="flex items-center justify-between">
                <h3 className="text-gray-400 font-bold flex items-center">
                  <Trophy className="mr-2" size={18} />
                  NO RANK
                </h3>
                <div className="flex items-center text-xs text-white/40">
                  <Shield size={14} className="mr-1" />
                  {(tierData["No Rank"] || []).length}
                </div>
              </div>
            </div>

            {tierData["No Rank"] && tierData["No Rank"].length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 divide-y divide-white/5">
                {tierData["No Rank"].slice(0, tierVisibility['no-rank'].count).map((player) => {
                  return (
                    <div
                      key={player.id}
                      className="flex items-center gap-3 px-4 py-3 hover:bg-white/5 cursor-pointer transform-none"
                      onClick={() => onPlayerClick(player)}
                    >
                      <div className="relative">
                        <Avatar className="w-8 h-8 border border-white/20">
                          <AvatarImage
                            src={getAvatarUrl(player.minecraft_username)}
                            alt={player.minecraft_username}
                            className="object-cover object-center scale-110"
                            onError={(e) => handleAvatarError(e, player.minecraft_username)}
                          />
                          <AvatarFallback className="bg-gray-700 text-white text-xs font-bold">
                            {player.minecraft_username?.charAt(0) || "?"}
                          </AvatarFallback>
                        </Avatar>
                      </div>

                      <div className="flex flex-col">
                        <div className="flex items-center gap-2 mb-1">
                          {getDeviceIcon("PC")}
                          <span className="text-sm font-medium">{player.minecraft_username}</span>
                        </div>
                        <span className="text-xs text-gray-400">Unranked Player</span>
                      </div>
                    </div>
                  )
                })}

                {tierData["No Rank"] && tierData["No Rank"].length > tierVisibility['no-rank'].count && (
                  <div className="py-3 text-center col-span-3">
                    <Button
                      variant="ghost"
                      onClick={() => loadMoreForTier('no-rank')}
                      size="sm"
                      className="text-xs flex items-center gap-1"
                    >
                      Load More <ChevronDown size={14} />
                    </Button>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-6 text-white/20 text-sm">No unranked players</div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
