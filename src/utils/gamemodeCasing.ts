import type { GameMode } from "@/services/playerService"

/**
 * Convert database gamemode string to display format
 */
export function toDisplayGameMode(gamemode: string): string {
  const displayMap: Record<string, string> = {
    // New gamemodes
    skywars: "Skywars",
    midfight: "Midfight",
    bridge: "Bridge",
    crystal: "Crystal",
    sumo: "Sumo",
    nodebuff: "Nodebuff",
    bedfight: "Bedfight",
    // Legacy gamemodes (for backwards compatibility)
    sword: "Sword",
    axe: "Axe",
    mace: "Mace",
    smp: "SMP",
    uhc: "UHC",
    nethpot: "NethPot",
    bedwars: "Bedwars",
  }

  return displayMap[gamemode.toLowerCase()] || gamemode
}

/**
 * Convert display gamemode to database format (lowercase)
 */
export function toDatabaseGameMode(gamemode: string): string {
  return gamemode.toLowerCase()
}

/**
 * Convert gamemode to proper GameMode type
 */
export function toGameMode(gamemode: string): GameMode {
  const gameModeMap: Record<string, GameMode> = {
    skywars: "skywars",
    midfight: "midfight",
    bridge: "bridge",
    crystal: "Crystal",
    sumo: "sumo",
    nodebuff: "nodebuff",
    bedfight: "bedfight",
    uhc: "UHC",
  }

  return gameModeMap[gamemode.toLowerCase()] || (gamemode as GameMode)
}
