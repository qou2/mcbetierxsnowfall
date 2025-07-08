
-- Create the snowfall_players table
CREATE TABLE public.snowfall_players (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  minecraft_username TEXT NOT NULL UNIQUE,
  playstyle INTEGER NOT NULL CHECK (playstyle >= 0 AND playstyle <= 100),
  movement INTEGER NOT NULL CHECK (movement >= 0 AND movement <= 100),
  pvp INTEGER NOT NULL CHECK (pvp >= 0 AND pvp <= 100),
  building INTEGER NOT NULL CHECK (building >= 0 AND building <= 100),
  projectiles INTEGER NOT NULL CHECK (projectiles >= 0 AND projectiles <= 100),
  overall_score DECIMAL(5,2) NOT NULL,
  tier TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security (RLS) for public access
ALTER TABLE public.snowfall_players ENABLE ROW LEVEL SECURITY;

-- Create policy to allow public read access
CREATE POLICY "Allow public read access to snowfall_players" 
  ON public.snowfall_players 
  FOR SELECT 
  USING (true);

-- Create policy to allow public insert access (for the API)
CREATE POLICY "Allow public insert access to snowfall_players" 
  ON public.snowfall_players 
  FOR INSERT 
  WITH CHECK (true);

-- Create policy to allow public update access (for the API)
CREATE POLICY "Allow public update access to snowfall_players" 
  ON public.snowfall_players 
  FOR UPDATE 
  USING (true);

-- Create an index for better performance on username lookups
CREATE INDEX idx_snowfall_players_minecraft_username ON public.snowfall_players(minecraft_username);

-- Create an index for better performance on overall_score ordering
CREATE INDEX idx_snowfall_players_overall_score ON public.snowfall_players(overall_score DESC);

-- Create an index for better performance on tier filtering
CREATE INDEX idx_snowfall_players_tier ON public.snowfall_players(tier);
