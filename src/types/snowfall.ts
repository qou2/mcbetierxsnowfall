
export type SnowfallTier = 
  | "No Rank"
  | "LT4" 
  | "MT4"
  | "HT4"
  | "LT3"
  | "MT3" 
  | "HT3"
  | "LT2"
  | "MT2"
  | "HT2"
  | "LT1"
  | "MT1"
  | "HT1"

export interface SnowfallAssessment {
  playstyle: number
  movement: number
  pvp: number
  building: number
  projectiles: number
  overall_score: number
  tier: SnowfallTier
}

export interface SnowfallPlayer {
  id: string
  minecraft_username: string
  assessment: SnowfallAssessment
  created_at: string
  updated_at: string
}

export function calculateSnowfallTier(avgScore: number): SnowfallTier {
  if (avgScore < 50) return "No Rank"
  if (avgScore >= 50 && avgScore <= 53.9) return "LT4"
  if (avgScore >= 54 && avgScore <= 57.9) return "MT4"
  if (avgScore >= 58 && avgScore <= 62.9) return "HT4"
  if (avgScore >= 63 && avgScore <= 66.9) return "LT3"
  if (avgScore >= 67 && avgScore <= 70.9) return "MT3"
  if (avgScore >= 71 && avgScore <= 75.9) return "HT3"
  if (avgScore >= 76 && avgScore <= 79.9) return "LT2"
  if (avgScore >= 80 && avgScore <= 83.9) return "MT2"
  if (avgScore >= 84 && avgScore <= 88.9) return "HT2"
  if (avgScore >= 89 && avgScore <= 92.9) return "LT1"
  if (avgScore >= 93 && avgScore <= 96.9) return "MT1"
  return "HT1" // avgScore >= 97
}
