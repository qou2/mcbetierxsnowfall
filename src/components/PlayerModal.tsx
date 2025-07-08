import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { X } from 'lucide-react';

interface PlayerModalProps {
  isOpen: boolean;
  onClose: () => void;
  player: any; // Replace 'any' with your actual Player type
}

export function PlayerModal() {
  const supportedGameModes = ["Crystal", "skywars", "midfight", "bridge", "UHC", "sumo", "nodebuff", "bedfight"];

  return (
    <div>Player Modal</div>
  );
}
