
-- Drop all existing policies on snowfall_players
DROP POLICY IF EXISTS "Allow API read access to snowfall_players" ON public.snowfall_players;
DROP POLICY IF EXISTS "Allow API insert access to snowfall_players" ON public.snowfall_players;
DROP POLICY IF EXISTS "Allow API update access to snowfall_players" ON public.snowfall_players;
DROP POLICY IF EXISTS "Allow all inserts" ON public.snowfall_players;
DROP POLICY IF EXISTS "Allow service role access" ON public.snowfall_players;

-- Create a comprehensive policy for service role access
CREATE POLICY "Enable all operations for service role" 
  ON public.snowfall_players 
  FOR ALL 
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Create a policy for public read access (for the website)
CREATE POLICY "Enable read access for all users" 
  ON public.snowfall_players 
  FOR SELECT 
  USING (true);

-- Grant necessary permissions to service_role
GRANT ALL ON public.snowfall_players TO service_role;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO service_role;

-- Make sure the service_role can bypass RLS if needed
ALTER TABLE public.snowfall_players FORCE ROW LEVEL SECURITY;
