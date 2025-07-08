import { cn } from "@/lib/utils"

interface GameModeIconProps {
  mode: string
  className?: string
  customSizes?: boolean
}

export function GameModeIcon({ mode, className = "h-7 w-7", customSizes = true }: GameModeIconProps) {
  // Custom size map for individual gamemode icons
  const customSizeMap: Record<string, string> = {
    skywars: "h-12 w-12", // 24px - smaller
    midfight: "h-8 w-8", // 32px - larger
    bridge: "h-7 w-7", // 28px - default
    crystal: "h-9 w-9", // 36px - extra large
    sumo: "h-100 w-100", // 40px - huge
    nodebuff: "h-6 w-6", // 24px - smaller
    bedfight: "h-7 w-7", // 28px - default
    uhc: "h-8 w-8", // 32px - larger
  }

  // Use custom sizes if enabled, otherwise use the passed className
  const iconSize = customSizes && customSizeMap[mode] ? customSizeMap[mode] : className

  const getIconPath = (mode: string) => {
    const iconMap: Record<string, string> = {
      skywars: "/lovable-uploads/ec8053c9-a017-4175-8a82-449514097721.png",
      midfight: "/lovable-uploads/09743052-7a91-4b8b-a703-3fbaddbbfbe6.png",
      bridge: "/lovable-uploads/bridge.jpg",
      crystal: "/lovable-uploads/80633d42-7f02-40c2-899e-9b4f53453c4e.png",
      sumo: "/lovable-uploads/sumo.png",
      nodebuff: "/lovable-uploads/pot.png",
      bedfight: "/lovable-uploads/b099b583-75a2-44b4-bede-18b063e47d28.png",
      uhc: "/lovable-uploads/afc839db-dab2-4fd5-b5e6-f9e9e33c0cdc.png",
    }
    return iconMap[mode] || "/placeholder.svg?height=32&width=32"
  }

  const getAltText = (mode: string) => {
    const altMap: Record<string, string> = {
      skywars: "skywars icon",
      midfight: "midfight icon",
      bridge: "bridge icon",
      crystal: "crystal icon",
      sumo: "sumo icon",
      nodebuff: "nodebuff icon",
      bedfight: "bedfight icon",
      uhc: "uhc icon",
    }
    return altMap[mode] || `${mode} icon`
  }

  return (
    <img
      src={getIconPath(mode) || "/placeholder.svg"}
      alt={getAltText(mode)}
      className={cn(iconSize, "object-contain")}
    />
  )
}
