
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { getAvatarUrl, handleAvatarError } from '@/utils/avatarUtils';
import type { Player } from '@/services/playerService';
import type { SnowfallPlayer } from '@/types/snowfall';

interface TierResultButtonProps {
  tier: string;
  players: (Player | SnowfallPlayer)[];
  onPlayerClick: (player: Player | SnowfallPlayer) => void;
  gamemode: string;
  isSnowfallData?: boolean;
}

const getTierColor = (tier: string) => {
  if (tier.includes('HT1') || tier.includes('MT1') || tier.includes('LT1')) return 'bg-yellow-500';
  if (tier.includes('HT2') || tier.includes('MT2') || tier.includes('LT2')) return 'bg-orange-500';
  if (tier.includes('HT3') || tier.includes('MT3') || tier.includes('LT3')) return 'bg-purple-500';
  if (tier.includes('HT4') || tier.includes('MT4') || tier.includes('LT4')) return 'bg-blue-500';
  if (tier.includes('HT5') || tier.includes('LT5')) return 'bg-green-500';
  return 'bg-gray-500';
};

const getPlayerName = (player: Player | SnowfallPlayer, isSnowfallData: boolean) => {
  if (isSnowfallData && 'minecraft_username' in player) {
    return player.minecraft_username;
  }
  return (player as Player).ign;
};

const getPlayerAvatarUrl = (player: Player | SnowfallPlayer, isSnowfallData: boolean) => {
  if (isSnowfallData && 'minecraft_username' in player) {
    return getAvatarUrl(player.minecraft_username);
  }
  const regularPlayer = player as Player;
  return regularPlayer.avatar_url || getAvatarUrl(regularPlayer.ign, regularPlayer.java_username);
};

export const TierResultButton: React.FC<TierResultButtonProps> = ({
  tier,
  players,
  onPlayerClick,
  gamemode,
  isSnowfallData = false,
}) => {
  const tierColor = getTierColor(tier);

  return (
    <Card className="bg-dark-surface/60 border-white/20 hover:border-white/40 transition-all duration-300 hover:shadow-lg">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <Badge className={`${tierColor} text-white font-bold px-3 py-1`}>
            {tier}
          </Badge>
          <span className="text-white/60 text-sm">
            {players.length} player{players.length !== 1 ? 's' : ''}
          </span>
        </div>
        
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {players.map((player, index) => {
            const playerName = getPlayerName(player, isSnowfallData);
            const avatarUrl = getPlayerAvatarUrl(player, isSnowfallData);
            
            return (
              <div
                key={`${playerName}-${index}`}
                className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/10 cursor-pointer transition-colors"
                onClick={() => onPlayerClick(player)}
              >
                <Avatar className="w-8 h-8 border border-white/30">
                  <AvatarImage 
                    src={avatarUrl}
                    alt={playerName}
                    onError={(e) => handleAvatarError(e, playerName)}
                  />
                  <AvatarFallback className="bg-gray-700 text-white text-xs">
                    {playerName.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="text-white font-medium text-sm">{playerName}</div>
                  {isSnowfallData && 'assessment' in player && (
                    <div className="text-white/60 text-xs">
                      Score: {player.assessment.overall_score.toFixed(1)}
                    </div>
                  )}
                  {!isSnowfallData && 'score' in player && player.score && (
                    <div className="text-white/60 text-xs">
                      Score: {String(player.score)}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
          
          {players.length === 0 && (
            <div className="text-white/40 text-center py-4">
              No players in this tier
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
