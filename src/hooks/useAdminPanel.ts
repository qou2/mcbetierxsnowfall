
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import type { Player, GameMode, TierLevel, PlayerRegion, DeviceType } from '@/services/playerService';

export function useAdminPanel() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const refreshPlayers = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { data, error } = await supabase
        .from('players')
        .select(`
          *,
          gamemode_scores (
            gamemode,
            display_tier,
            score
          )
        `)
        .order('global_points', { ascending: false });

      if (error) throw error;

      const formattedPlayers: Player[] = data.map((player: any) => ({
        id: player.id,
        ign: player.ign,
        java_username: player.java_username,
        uuid: player.uuid,
        avatar_url: player.avatar_url,
        region: player.region as PlayerRegion,
        device: player.device as DeviceType,
        global_points: player.global_points || 0,
        overall_rank: player.overall_rank,
        banned: player.banned || false,
        created_at: player.created_at,
        updated_at: player.updated_at,
        tierAssignments: player.gamemode_scores?.map((gs: any) => ({
          gamemode: gs.gamemode,
          tier: gs.display_tier,
          score: gs.score || 0
        })) || []
      }));

      setPlayers(formattedPlayers);
    } catch (err: any) {
      console.error('Error fetching players:', err);
      setError(err.message);
      toast({
        title: "Error",
        description: "Failed to load players",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updatePlayerTier = async (playerId: string, gamemode: GameMode, tier: TierLevel) => {
    try {
      // Skip if tier is "Not Ranked"
      if (tier === "Not Ranked") {
        return { success: true };
      }

      // First check if score exists
      const { data: existingScore } = await supabase
        .from('gamemode_scores')
        .select('id')
        .eq('player_id', playerId)
        .eq('gamemode', gamemode)
        .single();

      if (existingScore) {
        // Update existing score
        const { error } = await supabase
          .from('gamemode_scores')
          .update({
            display_tier: tier as any,
            internal_tier: tier as any,
            updated_at: new Date().toISOString()
          })
          .eq('player_id', playerId)
          .eq('gamemode', gamemode);
        
        if (error) throw error;
      } else {
        // Insert new score
        const { error } = await supabase
          .from('gamemode_scores')
          .insert({
            player_id: playerId,
            gamemode: gamemode as any,
            display_tier: tier as any,
            internal_tier: tier as any,
          });
        
        if (error) throw error;
      }

      toast({
        title: "Success",
        description: "Player tier updated successfully",
      });

      return { success: true };
    } catch (err: any) {
      console.error('Error updating tier:', err);
      toast({
        title: "Error",
        description: "Failed to update player tier",
        variant: "destructive",
      });
      return { success: false, error: err.message };
    }
  };

  const deletePlayer = async (playerId: string) => {
    try {
      const { error } = await supabase
        .from('players')
        .delete()
        .eq('id', playerId);

      if (error) throw error;

      return { success: true };
    } catch (err: any) {
      console.error('Error deleting player:', err);
      return { success: false, error: err.message };
    }
  };

  useEffect(() => {
    refreshPlayers();
  }, []);

  const submitPlayerResults = async (
    ign: string,
    region: string,
    device: string,
    java_username: string | undefined,
    results: Array<{ gamemode: GameMode; tier: TierLevel; points: number }>
  ) => {
    try {
      // First, try to find existing player
      let { data: existingPlayer } = await supabase
        .from('players')
        .select('id')
        .eq('ign', ign)
        .single();

      let playerId: string;
      
      if (!existingPlayer) {
        // Insert new player
        const { data: newPlayer, error: insertError } = await supabase
          .from('players')
          .insert({
            ign,
            region: region as any,
            device: device as any,
            java_username: java_username || ign,
          })
          .select('id')
          .single();

        if (insertError) throw insertError;
        playerId = newPlayer.id;
      } else {
        playerId = existingPlayer.id;
        
        // Update existing player
        const { error: updateError } = await supabase
          .from('players')
          .update({
            region: region as any,
            device: device as any,
            java_username: java_username || ign,
            updated_at: new Date().toISOString()
          })
          .eq('id', playerId);

        if (updateError) throw updateError;
      }

      // Then update gamemode scores
      for (const result of results) {
        await updatePlayerTier(playerId, result.gamemode, result.tier);
      }

      toast({
        title: "Success",
        description: "Player results submitted successfully",
      });

      await refreshPlayers();
      return { success: true };
    } catch (err: any) {
      console.error('Error submitting player results:', err);
      toast({
        title: "Error",
        description: "Failed to submit player results",
        variant: "destructive",
      });
      return { success: false, error: err.message };
    }
  };

  return {
    players,
    loading,
    error,
    refreshPlayers,
    updatePlayerTier,
    deletePlayer,
    submitPlayerResults
  };
}
