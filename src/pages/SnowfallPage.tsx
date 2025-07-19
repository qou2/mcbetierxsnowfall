
import React, { useState, useCallback, useEffect } from "react"
import { SnowfallNavbar } from "../components/SnowfallNavbar"
import { Footer } from "../components/Footer"
import { SnowfallLeaderboardTable } from "../components/SnowfallLeaderboardTable"
import { SnowfallTierGrid } from "../components/SnowfallTierGrid"
import { SnowfallLoadingScreen } from "../components/SnowfallLoadingScreen"
import { useInfiniteSnowfallLeaderboard } from "../hooks/useInfiniteSnowfallLeaderboard"
import { useInfiniteScroll } from "../hooks/useInfiniteScroll"
import { useSnowfallPopup } from "../contexts/SnowfallPopupContext"
import { useNavigate } from "react-router-dom"
import type { SnowfallPlayer } from "../types/snowfall"

const SnowfallPage = () => {
  const navigate = useNavigate()
  const [selectedMode, setSelectedMode] = useState<"overall" | "skywars">("overall")
  const [showLoading, setShowLoading] = useState(true)
  
  const { players, loading, loadingMore, error, hasMore, loadMorePlayers } = useInfiniteSnowfallLeaderboard()
  const { openPopup } = useSnowfallPopup()

  // Set up infinite scroll for overall tab
  useInfiniteScroll({
    hasMore: selectedMode === "overall" ? hasMore : false,
    loading: loadingMore,
    onLoadMore: loadMorePlayers
  })

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
        <SnowfallNavbar selectedMode={selectedMode} onSelectMode={handleSelectMode} navigate={navigate} />
        <main className="flex-grow flex justify-center items-center">
          <div className="text-red-500 text-xl">Error: {error}</div>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen bg-gradient-dark">
      <SnowfallNavbar selectedMode={selectedMode} onSelectMode={handleSelectMode} navigate={navigate} />
      
      <main className="flex-grow w-full">
        <div className="w-full px-2 py-3">
          {selectedMode === "overall" ? (
            <>
              <SnowfallLeaderboardTable players={players} onPlayerClick={handlePlayerClick} />
              {loadingMore && (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                </div>
              )}
              {!hasMore && players.length > 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  End of leaderboard
                </div>
              )}
            </>
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
