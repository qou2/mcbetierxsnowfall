
import React, { useState, useCallback, useEffect } from "react"
import { SnowfallNavbar } from "../components/SnowfallNavbar"
import { Footer } from "../components/Footer"
import { SnowfallLeaderboardTable } from "../components/SnowfallLeaderboardTable"
import { SnowfallTierGrid } from "../components/SnowfallTierGrid"
import { SnowfallLoadingScreen } from "../components/SnowfallLoadingScreen"
import { useSnowfallLeaderboard } from "../hooks/useSnowfallLeaderboard"
import { useSnowfallPopup } from "../contexts/SnowfallPopupContext"
import { useNavigate } from "react-router-dom"
import type { SnowfallPlayer } from "../types/snowfall"

const SnowfallPage = () => {
  const navigate = useNavigate()
  const [selectedMode, setSelectedMode] = useState<"overall" | "skywars">("overall")
  const [showLoading, setShowLoading] = useState(true)
  
  const { players, loading, error, fetchNextPage, hasNextPage, isFetchingNextPage } = useSnowfallLeaderboard()
  const { openPopup } = useSnowfallPopup()

  // Show loading screen for minimum 2.5 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowLoading(false)
    }, 2500)

    return () => clearTimeout(timer)
  }, [])

  const handlePlayerClick = useCallback((player: SnowfallPlayer) => {
    openPopup({
      player,
      timestamp: new Date().toISOString(),
    })
  }, [openPopup])

  const handleSelectMode = useCallback((mode: string) => {
    setSelectedMode(mode as "overall" | "skywars")
  }, [])

  if (loading || showLoading) {
    return <SnowfallLoadingScreen />
  }

  if (error) {
    return (
      <div className="flex flex-col min-h-screen bg-gradient-dark">
        <SnowfallNavbar selectedMode={selectedMode} onSelectMode={handleSelectMode} navigate={navigate} onPlayerClick={handlePlayerClick} />
        <main className="flex-grow flex justify-center items-center">
          <div className="text-red-500 text-xl">Error: {error}</div>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen bg-gradient-dark">
      <SnowfallNavbar selectedMode={selectedMode} onSelectMode={handleSelectMode} navigate={navigate} onPlayerClick={handlePlayerClick} />
      
      <main className="flex-grow w-full">
        <div className="w-full px-2 py-3">
          {/* Credit notice */}
          <div className="mb-6 text-center">
            <div className="bg-blue-900/20 border border-blue-400/30 rounded-lg p-4 inline-block">
              <p className="text-blue-200 text-sm mb-1">
                All Skywars testing and evaluation provided by{" "}
                <a 
                  href="https://discord.gg/hivesw" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-300 hover:text-blue-100 underline font-semibold"
                >
                  Snowfall
                </a>
              </p>
              <p className="text-blue-300/70 text-xs">
                Join their Discord community for more information
              </p>
            </div>
          </div>

          {selectedMode === "overall" ? (
            <SnowfallLeaderboardTable 
              players={players} 
              onPlayerClick={handlePlayerClick}
              onLoadMore={fetchNextPage}
              hasMore={hasNextPage}
              isLoadingMore={isFetchingNextPage}
            />
          ) : (
            <SnowfallTierGrid onPlayerClick={handlePlayerClick} />
          )}
        </div>
      </main>

      <Footer />
    </div>
  )
}

export default SnowfallPage
