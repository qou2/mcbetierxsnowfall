
-- Fix the snowfall_players table policies to allow proper API access
DROP POLICY IF EXISTS "Allow public read access to snowfall_players" ON public.snowfall_players;
DROP POLICY IF EXISTS "Allow public insert access to snowfall_players" ON public.snowfall_players;
DROP POLICY IF EXISTS "Allow public update access to snowfall_players" ON public.snowfall_players;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON public.snowfall_players;
DROP POLICY IF EXISTS "Enable update for authenticated users" ON public.snowfall_players;

-- Create proper policies for API access
CREATE POLICY "Allow API read access to snowfall_players" 
  ON public.snowfall_players 
  FOR SELECT 
  USING (true);

CREATE POLICY "Allow API insert access to snowfall_players" 
  ON public.snowfall_players 
  FOR INSERT 
  WITH CHECK (true);

CREATE POLICY "Allow API update access to snowfall_players" 
  ON public.snowfall_players 
  FOR UPDATE 
  USING (true);

-- Ensure the table constraints are proper
ALTER TABLE public.snowfall_players 
  ALTER COLUMN playstyle SET NOT NULL,
  ALTER COLUMN movement SET NOT NULL,
  ALTER COLUMN pvp SET NOT NULL,
  ALTER COLUMN building SET NOT NULL,
  ALTER COLUMN projectiles SET NOT NULL,
  ALTER COLUMN overall_score SET NOT NULL,
  ALTER COLUMN tier SET NOT NULL;

-- Add proper check constraints
ALTER TABLE public.snowfall_players 
  DROP CONSTRAINT IF EXISTS snowfall_players_playstyle_check,
  DROP CONSTRAINT IF EXISTS snowfall_players_movement_check,
  DROP CONSTRAINT IF EXISTS snowfall_players_pvp_check,
  DROP CONSTRAINT IF EXISTS snowfall_players_building_check,
  DROP CONSTRAINT IF EXISTS snowfall_players_projectiles_check;

ALTER TABLE public.snowfall_players 
  ADD CONSTRAINT snowfall_players_playstyle_check CHECK (playstyle >= 1 AND playstyle <= 100),
  ADD CONSTRAINT snowfall_players_movement_check CHECK (movement >= 1 AND movement <= 100),
  ADD CONSTRAINT snowfall_players_pvp_check CHECK (pvp >= 1 AND pvp <= 100),
  ADD CONSTRAINT snowfall_players_building_check CHECK (building >= 1 AND building <= 100),
  ADD CONSTRAINT snowfall_players_projectiles_check CHECK (projectiles >= 1 AND projectiles <= 100);
