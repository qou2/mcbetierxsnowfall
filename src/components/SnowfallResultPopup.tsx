
import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { useSnowfallPopup } from '@/contexts/SnowfallPopupContext';
import { X } from 'lucide-react';
export function SnowfallResultPopup() {
  const { popupData, closePopup } = useSnowfallPopup();
  const [isVisible, setIsVisible] = useState(false);
  const [animatedScores, setAnimatedScores] = useState({
    playstyle: 0,
    movement: 0,
    pvp: 0,
    building: 0,
    projectiles: 0,
  });
  useEffect(() => {
    if (popupData) {
      setIsVisible(true);
      setAnimatedScores({
        playstyle: 0,
        movement: 0,
        pvp: 0,
        building: 0,
        projectiles: 0,
      });
      const timer = setTimeout(() => {
        const { assessment } = popupData.player;
        const skillOrder = ['playstyle', 'movement', 'pvp', 'building', 'projectiles'] as const;
        const animationDuration = 800; 
        const delayBetweenAnimations = 200;
        skillOrder.forEach((skill, index) => {
          const startDelay = index * delayBetweenAnimations;
          const targetValue = assessment[skill];
          setTimeout(() => {
            const steps = 40;
            const stepDuration = animationDuration / steps;
            let currentStep = 0;

            const animateSkill = () => {
              currentStep++;
              const progress = Math.min(currentStep / steps, 1);

              // Easing function for smooth animation
              const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);
              const easedProgress = easeOutCubic(progress);

              setAnimatedScores(prev => ({
                ...prev,
                [skill]: Math.round(targetValue * easedProgress)
              }));

              if (progress < 1) {
                setTimeout(animateSkill, stepDuration);
              }
            };

            animateSkill();
          }, startDelay);
        });
      }, 800); // Start animations after popup is visible

      return () => clearTimeout(timer);
    } else {
      setIsVisible(false);
    }
  }, [popupData]);

  if (!popupData) return null;

  const { player } = popupData;
  const { assessment } = player;

  const getTierColor = (tier: string) => {
    if (tier.includes('HT1') || tier.includes('MT1') || tier.includes('LT1')) return 'bg-yellow-500 border-yellow-400';
    if (tier.includes('HT2') || tier.includes('MT2') || tier.includes('LT2')) return 'bg-orange-500 border-orange-400';
    if (tier.includes('HT3') || tier.includes('MT3') || tier.includes('LT3')) return 'bg-purple-500 border-purple-400';
    if (tier.includes('HT4') || tier.includes('MT4') || tier.includes('LT4')) return 'bg-blue-500 border-blue-400';
    return 'bg-gray-500 border-gray-400';
  };

  const getTierTextColor = (tier: string) => {
    if (tier.includes('HT1') || tier.includes('MT1') || tier.includes('LT1')) return 'text-yellow-400';
    if (tier.includes('HT2') || tier.includes('MT2') || tier.includes('LT2')) return 'text-orange-400';
    if (tier.includes('HT3') || tier.includes('MT3') || tier.includes('LT3')) return 'text-purple-400';
    if (tier.includes('HT4') || tier.includes('MT4') || tier.includes('LT4')) return 'text-blue-400';
    return 'text-gray-400';
  };

  return (
    <Dialog open={!!popupData} onOpenChange={closePopup}>
      <DialogContent className={`max-w-md mx-auto bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border-2 border-white/20 text-white shadow-2xl transition-all duration-700 ease-out ${
        isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
      }`}>
        <DialogHeader className="relative">
          <button
            onClick={closePopup}
            className="absolute -top-2 -right-2 bg-red-500/80 hover:bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center transition-all duration-200 hover:scale-110 z-10"
            aria-label="Close"
          >
            <X size={16} />
          </button>
          <DialogTitle className={`text-2xl font-bold text-center pt-2 bg-gradient-to-r from-white via-blue-100 to-white bg-clip-text text-transparent transition-all duration-1000 delay-300 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}>
            {player.minecraft_username}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 pt-4">
          <div className={`text-center transition-all duration-1000 delay-500 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}>
            <Badge className={`${getTierColor(assessment.tier)} text-white text-xl px-6 py-3 shadow-lg border-2`}>
              {assessment.tier}
            </Badge>
            <div className="text-white/80 mt-3 text-lg font-semibold">
              Overall Score: <span className={getTierTextColor(assessment.tier)}>{assessment.overall_score.toFixed(1)}</span>/100
            </div>
          </div>

          <div className={`bg-black/20 rounded-xl p-4 space-y-4 border border-white/10 transition-all duration-1000 delay-700 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}>
            <h3 className="text-lg font-semibold text-center text-white/90 mb-4">Skill Breakdown</h3>

            <div className="grid grid-cols-1 gap-3">
              <div className="flex justify-between items-center p-2 rounded-lg bg-white/5">
                <span className="text-white/90 font-medium">Playstyle:</span>
                <div className="flex items-center gap-2">
                  <div className="w-20 h-2 bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 transition-all duration-300 ease-out"
                      style={{ width: `${animatedScores.playstyle}%` }}
                    />
                  </div>
                  <span className="text-white font-bold w-8 text-right">{animatedScores.playstyle}</span>
                </div>
              </div>

              <div className="flex justify-between items-center p-2 rounded-lg bg-white/5">
                <span className="text-white/90 font-medium">Movement:</span>
                <div className="flex items-center gap-2">
                  <div className="w-20 h-2 bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-green-500 to-emerald-400 transition-all duration-300 ease-out"
                      style={{ width: `${animatedScores.movement}%` }}
                    />
                  </div>
                  <span className="text-white font-bold w-8 text-right">{animatedScores.movement}</span>
                </div>
              </div>

              <div className="flex justify-between items-center p-2 rounded-lg bg-white/5">
                <span className="text-white/90 font-medium">PvP:</span>
                <div className="flex items-center gap-2">
                  <div className="w-20 h-2 bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-red-500 to-pink-400 transition-all duration-300 ease-out"
                      style={{ width: `${animatedScores.pvp}%` }}
                    />
                  </div>
                  <span className="text-white font-bold w-8 text-right">{animatedScores.pvp}</span>
                </div>
              </div>

              <div className="flex justify-between items-center p-2 rounded-lg bg-white/5">
                <span className="text-white/90 font-medium">Building:</span>
                <div className="flex items-center gap-2">
                  <div className="w-20 h-2 bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-amber-500 to-yellow-400 transition-all duration-300 ease-out"
                      style={{ width: `${animatedScores.building}%` }}
                    />
                  </div>
                  <span className="text-white font-bold w-8 text-right">{animatedScores.building}</span>
                </div>
              </div>

              <div className="flex justify-between items-center p-2 rounded-lg bg-white/5">
                <span className="text-white/90 font-medium">Projectiles:</span>
                <div className="flex items-center gap-2">
                  <div className="w-20 h-2 bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-violet-500 to-purple-400 transition-all duration-300 ease-out"
                      style={{ width: `${animatedScores.projectiles}%` }}
                    />
                  </div>
                  <span className="text-white font-bold w-8 text-right">{animatedScores.projectiles}</span>
                </div>
              </div>
            </div>
          </div>

          <div className={`text-center text-white/60 text-sm border-t border-white/10 pt-4 transition-all duration-1000 delay-1000 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}>
            Click outside to close
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
