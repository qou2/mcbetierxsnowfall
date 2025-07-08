import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import type { Player } from '@/services/playerService';

interface LeaderboardTableProps {
  players: Player[];
  onPlayerClick: (player: Player) => void;
}

export function LeaderboardTable({ players, onPlayerClick }: LeaderboardTableProps) {
  const getRankColor = (points: number) => {
    if (points >= 2000) return 'bg-yellow-500';
    if (points >= 1500) return 'bg-orange-500';
    if (points >= 1000) return 'bg-purple-500';
    return 'bg-blue-500';
  };

  const getRankInfo = (points: number) => {
    if (points >= 2000) return { title: 'Diamond', color: 'text-yellow-500' };
    if (points >= 1500) return { title: 'Platinum', color: 'text-orange-500' };
    if (points >= 1000) return { title: 'Gold', color: 'text-purple-500' };
    return { title: 'Silver', color: 'text-blue-500' };
  };

  return (
    <div className="bg-black/40 rounded-lg border border-white/20 overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="border-white/20 hover:bg-white/5">
            <TableHead className="text-white font-semibold">#</TableHead>
            <TableHead className="text-white font-semibold">Player</TableHead>
            <TableHead className="text-white font-semibold">Rank</TableHead>
            <TableHead className="text-white font-semibold">Points</TableHead>
            <TableHead className="text-white font-semibold">Gamemode Tiers</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {players.map((player, index) => (
            <TableRow key={player.id} onClick={() => onPlayerClick(player)} className="border-white/20 hover:bg-white/10 cursor-pointer transition-colors">
              <TableCell className="text-white font-medium">{index + 1}</TableCell>
              <TableCell className="text-white font-medium">{player.ign}</TableCell>
              <TableCell>
                <Badge className={`${getRankColor(player.global_points || 0)} text-white`}>
                  {getRankInfo(player.global_points || 0).title}
                </Badge>
              </TableCell>
              <TableCell className="text-white">{player.global_points || 0}</TableCell>
              <TableCell>
                <div className="flex flex-wrap gap-1">
                  {player.tierAssignments?.map((assignment, idx) => (
                    <Badge key={idx} variant="outline" className="text-xs border-gray-600 text-gray-300">
                      {assignment.gamemode}: {assignment.tier}
                    </Badge>
                  ))}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
