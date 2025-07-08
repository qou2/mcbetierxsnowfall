import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { X } from 'lucide-react';
import type { Player } from '@/services/playerService';

interface MinecraftPlayerModalProps {
  player: Player | null;
  open: boolean;
  onClose: () => void;
}

export function MinecraftPlayerModal({ player, open, onClose }: MinecraftPlayerModalProps) {
  if (!player) {
    return null;
  }

  const getRankColor = (points: number) => {
    if (points >= 3000) return 'bg-yellow-500';
    if (points >= 2000) return 'bg-orange-500';
    if (points >= 1000) return 'bg-purple-500';
    return 'bg-blue-500';
  };

  const getRankInfo = (points: number) => {
    if (points >= 3000) return { title: 'Diamond', color: 'bg-yellow-500' };
    if (points >= 2000) return { title: 'Gold', color: 'bg-orange-500' };
    if (points >= 1000) return { title: 'Silver', color: 'bg-purple-500' };
    return { title: 'Bronze', color: 'bg-blue-500' };
  };

  const supportedGameModes = ["Crystal", "skywars", "midfight", "bridge", "UHC", "sumo", "nodebuff", "bedfight"];

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md mx-auto bg-black/90 border-white/20 text-white">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-bold text-white">
              {player.ign}
            </DialogTitle>
            <button
              onClick={onClose}
              className="text-white/70 hover:text-white transition-colors"
            >
              <X size={20} />
            </button>
          </div>
        </DialogHeader>

        <div className="space-y-4">
          <div className="text-center">
            <Badge className={`${getRankColor(player.global_points || 0)} text-white text-lg px-4 py-2`}>
              {getRankInfo(player.global_points || 0).title}
            </Badge>
            <div className="text-white/70 mt-2">
              Overall Points: {player.global_points || 0}
            </div>
          </div>

          <div className="space-y-3">
            {supportedGameModes.map((gamemode) => {
              const assignment = player.tierAssignments?.find((t) => t.gamemode === gamemode);
              const tier = assignment ? assignment.tier : 'Unranked';

              return (
                <div key={gamemode} className="flex justify-between items-center">
                  <span className="text-white/80">{gamemode}:</span>
                  <span className="text-white font-semibold">{tier}</span>
                </div>
              );
            })}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
