
-- Fix the snowfall_players table constraints to allow proper score ranges
ALTER TABLE public.snowfall_players 
  DROP CONSTRAINT IF EXISTS snowfall_players_playstyle_check,
  DROP CONSTRAINT IF EXISTS snowfall_players_movement_check,
  DROP CONSTRAINT IF EXISTS snowfall_players_pvp_check,
  DROP CONSTRAINT IF EXISTS snowfall_players_building_check,
  DROP CONSTRAINT IF EXISTS snowfall_players_projectiles_check;

-- Add correct check constraints (1-100 range instead of 0-100)
ALTER TABLE public.snowfall_players 
  ADD CONSTRAINT snowfall_players_playstyle_check CHECK (playstyle >= 1 AND playstyle <= 100),
  ADD CONSTRAINT snowfall_players_movement_check CHECK (movement >= 1 AND movement <= 100),
  ADD CONSTRAINT snowfall_players_pvp_check CHECK (pvp >= 1 AND pvp <= 100),
  ADD CONSTRAINT snowfall_players_building_check CHECK (building >= 1 AND building <= 100),
  ADD CONSTRAINT snowfall_players_projectiles_check CHECK (projectiles >= 1 AND projectiles <= 100);

-- Ensure RLS policies allow service role access
DROP POLICY IF EXISTS "Allow service role access" ON public.snowfall_players;

CREATE POLICY "Allow service role access" 
  ON public.snowfall_players 
  FOR ALL 
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Make sure the table has proper indexes for performance
CREATE INDEX IF NOT EXISTS idx_snowfall_players_username ON public.snowfall_players(minecraft_username);
CREATE INDEX IF NOT EXISTS idx_snowfall_players_score ON public.snowfall_players(overall_score DESC);
CREATE INDEX IF NOT EXISTS idx_snowfall_players_tier ON public.snowfall_players(tier);
