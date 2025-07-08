import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { X } from 'lucide-react';

export function ResultPopup() {
  const { popupData, closePopup } = React.useContext(
    React.createContext({
      popupData: null,
      closePopup: () => {},
    })
  );

  if (!popupData) return null;

  const { player, tierAssignments, combatRank } = popupData;

  const supportedGameModes = ["Crystal", "skywars", "midfight", "bridge", "UHC", "sumo", "nodebuff", "bedfight"];

  const getTierColor = (tier: string) => {
    if (tier.includes('HT1') || tier.includes('MT1') || tier.includes('LT1')) return 'bg-yellow-500';
    if (tier.includes('HT2') || tier.includes('MT2') || tier.includes('LT2')) return 'bg-orange-500';
    if (tier.includes('HT3') || tier.includes('MT3') || tier.includes('LT3')) return 'bg-purple-500';
    if (tier.includes('HT4') || tier.includes('MT4') || tier.includes('LT4')) return 'bg-blue-500';
    return 'bg-gray-500';
  };

  return (
    <Dialog open={!!popupData} onOpenChange={closePopup}>
      <DialogContent className="max-w-md mx-auto bg-black/90 border-white/20 text-white">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-bold text-white">
              {player.ign}
            </DialogTitle>
            <button
              onClick={closePopup}
              className="text-white/70 hover:text-white transition-colors"
            >
              <X size={20} />
            </button>
          </div>
        </DialogHeader>

        <div className="space-y-4">
          <div className="text-center">
            <Badge className={`${getTierColor(combatRank.title)} text-white text-lg px-4 py-2`}>
              {combatRank.title}
            </Badge>
            <div className="text-white/70 mt-2">
              Global Points: {combatRank.points}
            </div>
          </div>

          <div className="space-y-3">
            {supportedGameModes.map((mode) => {
              const assignment = tierAssignments.find((t) => t.gamemode === mode);
              if (!assignment) return null;

              return (
                <div key={mode} className="flex justify-between items-center">
                  <span className="text-white/80">{mode}:</span>
                  <Badge className={`${getTierColor(assignment.tier)} text-white`}>
                    {assignment.tier}
                  </Badge>
                </div>
              );
            })}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
