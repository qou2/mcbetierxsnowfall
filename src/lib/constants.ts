
import { GameMode, TierLevel } from '@/services/playerService';
import { Gem, Sword, Server, Heart, Axe, FlaskConical, BedDouble} from 'lucide-react';

export const GAMEMODES: { name: GameMode; icon: React.ElementType }[] = [
  { name: 'Crystal', icon: Gem },
  { name: 'midfight', icon: Sword },
  { name: 'skywars', icon: Gem },
  { name: 'UHC', icon: Heart },
  { name: 'bridge', icon: Axe },
  { name: 'nodebuff', icon: FlaskConical },
  { name: 'bedfight', icon: BedDouble },
  { name: 'sumo', icon: Axe },
];

export const GAME_MODES: GameMode[] = ['Crystal', 'midfight', 'skywars', 'UHC', 'bridge', 'nodebuff', 'bedfight', 'sumo'];

export const TIER_LEVELS: TierLevel[] = ['HT1', 'LT1', 'HT2', 'LT2', 'HT3', 'LT3', 'HT4', 'LT4', 'HT5', 'LT5', 'Retired', 'Not Ranked'];

export const REGIONS = ['NA', 'EU', 'AS', 'OC', 'SA', 'AF'] as const;

export const DEVICES = ['PC', 'Mobile', 'Console'] as const;
