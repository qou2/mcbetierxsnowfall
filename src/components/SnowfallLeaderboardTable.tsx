
import React from 'react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Monitor, Smartphone, Gamepad, Crown, Trophy, Medal } from 'lucide-react';
import { getAvatarUrl, handleAvatarError } from '@/utils/avatarUtils';
import { useIsMobile } from '@/hooks/use-mobile';
import type { SnowfallPlayer } from '@/types/snowfall';

interface SnowfallLeaderboardTableProps {
  players: SnowfallPlayer[];
  onPlayerClick: (player: SnowfallPlayer) => void;
}

const getDeviceIcon = (device: string = 'PC') => {
  const iconProps = "w-3 h-3";
  switch(device?.toLowerCase()) {
    case 'mobile':
    case 'bedrock':
      return <Smartphone className={`${iconProps} text-blue-400`} />;
    case 'console':
      return <Gamepad className={`${iconProps} text-green-400`} />;
    case 'pc':
    case 'java':
    default:
      return <Monitor className={`${iconProps} text-white/90`} />;
  }
};

const getSnowfallTierColor = (tier: string) => {
  if (tier.includes('HT1') || tier.includes('MT1') || tier.includes('LT1')) return 'bg-yellow-500 text-black';
  if (tier.includes('HT2') || tier.includes('MT2') || tier.includes('LT2')) return 'bg-orange-500 text-white';
  if (tier.includes('HT3') || tier.includes('MT3') || tier.includes('LT3')) return 'bg-purple-500 text-white';
  if (tier.includes('HT4') || tier.includes('MT4') || tier.includes('LT4')) return 'bg-blue-500 text-white';
  return 'bg-gray-500 text-white';
};

const getEnhancedRankBadge = (position: number) => {
  if (position === 1) {
    return {
      icon: <Crown className="w-6 h-6 text-yellow-200" />,
      gradient: 'bg-gradient-to-br from-yellow-300 via-yellow-400 to-amber-500',
      text: 'text-yellow-900',
      border: 'border-4 border-yellow-200/60 shadow-lg shadow-yellow-400/40',
      size: 'w-16 h-16',
      textSize: 'text-xl font-black',
      number: position
    };
  } else if (position === 2) {
    return {
      icon: <Trophy className="w-5 h-5 text-gray-100" />,
      gradient: 'bg-gradient-to-br from-gray-200 via-gray-300 to-slate-400',
      text: 'text-gray-900',
      border: 'border-4 border-gray-200/60 shadow-lg shadow-gray-400/40',
      size: 'w-14 h-14',
      textSize: 'text-lg font-bold',
      number: position
    };
  } else if (position === 3) {
    return {
      icon: <Medal className="w-4 h-4 text-orange-100" />,
      gradient: 'bg-gradient-to-br from-orange-300 via-orange-400 to-amber-600',
      text: 'text-orange-900',
      border: 'border-4 border-orange-200/60 shadow-lg shadow-orange-500/40',
      size: 'w-12 h-12',
      textSize: 'text-base font-bold',
      number: position
    };
  } else {
    return {
      icon: null,
      gradient: 'bg-gray-600',
      text: 'text-white',
      border: '',
      size: 'w-10 h-10',
      textSize: 'text-sm font-medium',
      number: position
    };
  }
};

export function SnowfallLeaderboardTable({ players, onPlayerClick }: SnowfallLeaderboardTableProps) {
  const isMobile = useIsMobile();

  const handlePlayerRowClick = (player: SnowfallPlayer) => {
    onPlayerClick(player);
  };

  if (isMobile) {
    return (
      <div className="w-full space-y-4">
        {players.map((player, index) => {
          const rankBadge = getEnhancedRankBadge(index + 1);
          const isTopThree = index < 3;
          
          return (
            <div
              key={player.id}
              className={`relative w-full rounded-xl p-6 border cursor-pointer transform-none ${
                isTopThree 
                  ? 'bg-gradient-to-r from-dark-surface/95 via-dark-surface/90 to-dark-surface/95 border-white/40 shadow-xl backdrop-blur-sm' 
                  : 'bg-dark-surface/70 border-white/20'
              } ${isTopThree ? 'ring-2 ring-white/20' : ''}`}
              onClick={() => handlePlayerRowClick(player)}
            >
              {/* Top 3 Enhanced Background Effect */}
              {isTopThree && (
                <div className="absolute inset-0 rounded-xl opacity-10 bg-gradient-to-br from-white/10 via-transparent to-white/5 pointer-events-none" />
              )}

              <div className="flex items-center gap-4 mb-4">
                <div className={`
                  ${rankBadge.size} flex items-center justify-center rounded-2xl relative
                  ${rankBadge.gradient} ${rankBadge.text} ${rankBadge.border}
                  transition-all duration-300 hover:scale-105
                `}>
                  {rankBadge.icon ? (
                    <div className="flex flex-col items-center justify-center">
                      {rankBadge.icon}
                      <span className="text-xs font-bold mt-0.5">{rankBadge.number}</span>
                    </div>
                  ) : (
                    <span className={rankBadge.textSize}>{rankBadge.number}</span>
                  )}
                </div>

                <Avatar className={`border-4 ${isTopThree ? 'w-16 h-16 border-white/50' : 'w-12 h-12 border-white/30'} ${isTopThree ? 'shadow-lg' : ''}`}>
                  <AvatarImage 
                    src={getAvatarUrl(player.minecraft_username)}
                    alt={player.minecraft_username}
                    onError={(e) => handleAvatarError(e, player.minecraft_username)}
                  />
                  <AvatarFallback className="bg-gray-700 text-white text-lg font-bold">
                    {player.minecraft_username.charAt(0)}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    {getDeviceIcon("PC")}
                    <span className={`font-bold text-white ${isTopThree ? 'text-xl' : 'text-lg'} truncate`}>
                      {player.minecraft_username}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-3 text-sm">
                    <div className={`px-3 py-1 rounded-md text-sm font-bold ${getSnowfallTierColor(player.assessment.tier)} shadow-md`}>
                      {player.assessment.tier}
                    </div>
                    <span className="text-white/70 font-semibold">({player.assessment.overall_score.toFixed(1)} pts)</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-5 gap-2 pt-3 border-t border-white/20 text-xs">
                <div className="text-center">
                  <div className="text-white/60 mb-1">Playstyle</div>
                  <div className="text-white font-bold">{player.assessment.playstyle}</div>
                </div>
                <div className="text-center">
                  <div className="text-white/60 mb-1">Movement</div>
                  <div className="text-white font-bold">{player.assessment.movement}</div>
                </div>
                <div className="text-center">
                  <div className="text-white/60 mb-1">PvP</div>
                  <div className="text-white font-bold">{player.assessment.pvp}</div>
                </div>
                <div className="text-center">
                  <div className="text-white/60 mb-1">Building</div>
                  <div className="text-white font-bold">{player.assessment.building}</div>
                </div>
                <div className="text-center">
                  <div className="text-white/60 mb-1">Projectiles</div>
                  <div className="text-white font-bold">{player.assessment.projectiles}</div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div className="w-full bg-dark-surface/60 rounded-2xl overflow-hidden border border-white/30 shadow-2xl backdrop-blur-sm">
      <div className="grid grid-cols-12 gap-6 px-8 py-6 text-base font-bold text-white/90 border-b border-white/20 bg-dark-surface/80">
        <div className="col-span-1 text-center">RANK</div>
        <div className="col-span-3">PLAYER</div>
        <div className="col-span-2 text-center">TIER</div>
        <div className="col-span-6 text-center">STATS</div>
      </div>

      <div className="divide-y divide-white/10">
        {players.map((player, index) => {
          const rankBadge = getEnhancedRankBadge(index + 1);
          const isTopThree = index < 3;
          
          return (
            <div
              key={player.id}
              className={`grid grid-cols-12 gap-6 px-8 py-8 cursor-pointer transform-none relative ${
                isTopThree 
                  ? 'bg-gradient-to-r from-dark-surface/95 via-dark-surface/85 to-dark-surface/95 hover:from-dark-surface/100 hover:via-dark-surface/90 hover:to-dark-surface/100 ring-1 ring-white/20' 
                  : 'hover:bg-white/5'
              }`}
              onClick={() => handlePlayerRowClick(player)}
            >
              {/* Enhanced background for top 3 */}
              {isTopThree && (
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/3 to-transparent pointer-events-none" />
              )}

              <div className="col-span-1 flex items-center justify-center">
                <div className={`
                  ${rankBadge.size} flex items-center justify-center rounded-2xl relative
                  ${rankBadge.gradient} ${rankBadge.text} ${rankBadge.border}
                  transition-all duration-300 hover:scale-110
                `}>
                  {rankBadge.icon ? (
                    <div className="flex flex-col items-center justify-center">
                      {rankBadge.icon}
                      <span className="text-xs font-bold mt-0.5">{rankBadge.number}</span>
                    </div>
                  ) : (
                    <span className={rankBadge.textSize}>{rankBadge.number}</span>
                  )}
                </div>
              </div>

              <div className="col-span-3 flex items-center gap-4">
                <Avatar className={`border-4 ${isTopThree ? 'w-20 h-20 border-white/50 shadow-xl' : 'w-16 h-16 border-white/30'}`}>
                  <AvatarImage 
                    src={getAvatarUrl(player.minecraft_username)}
                    alt={player.minecraft_username}
                    onError={(e) => handleAvatarError(e, player.minecraft_username)}
                  />
                  <AvatarFallback className="bg-gray-700 text-white text-xl font-bold">
                    {player.minecraft_username.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex flex-col">
                  <div className="flex items-center gap-3 mb-2">
                    {getDeviceIcon("PC")}
                    <span className={`text-white font-bold ${isTopThree ? 'text-2xl' : 'text-xl'}`}>
                      {player.minecraft_username}
                    </span>
                  </div>
                  <div className="text-white/70 text-base font-semibold">
                    Overall Score: {player.assessment.overall_score.toFixed(1)}
                  </div>
                </div>
              </div>

              <div className="col-span-2 flex items-center justify-center">
                <div className={`px-5 py-3 rounded-md text-base font-bold ${getSnowfallTierColor(player.assessment.tier)} shadow-lg`}>
                  {player.assessment.tier}
                </div>
              </div>

              <div className="col-span-6 flex items-center justify-center">
                <div className="grid grid-cols-5 gap-4 w-full">
                  <div className="text-center">
                    <div className="text-white/60 text-sm mb-1">Playstyle</div>
                    <div className="text-white text-lg font-bold">{player.assessment.playstyle}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-white/60 text-sm mb-1">Movement</div>
                    <div className="text-white text-lg font-bold">{player.assessment.movement}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-white/60 text-sm mb-1">PvP</div>
                    <div className="text-white text-lg font-bold">{player.assessment.pvp}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-white/60 text-sm mb-1">Building</div>
                    <div className="text-white text-lg font-bold">{player.assessment.building}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-white/60 text-sm mb-1">Projectiles</div>
                    <div className="text-white text-lg font-bold">{player.assessment.projectiles}</div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
