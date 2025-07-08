
import React, { useState, useEffect } from 'react';
import { Snowflake, Home, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { useSnowfallPlayerSearch } from '@/hooks/useSnowfallPlayerSearch';
import type { SnowfallPlayer } from '@/types/snowfall';

interface SnowfallNavbarProps {
  selectedMode: "overall" | "skywars";
  onSelectMode: (mode: string) => void;
  navigate: (path: string) => void;
  onPlayerClick?: (player: SnowfallPlayer) => void;
}

export function SnowfallNavbar({ selectedMode, onSelectMode, navigate, onPlayerClick }: SnowfallNavbarProps) {
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  const { results: searchResults, isLoading: isSearching, query: searchQuery, setQuery: setSearchQuery } = useSnowfallPlayerSearch();

  useEffect(() => {
    if (searchQuery && searchQuery.length >= 2 && (searchResults.length > 0 || searchFocused)) {
      setShowSearchResults(true);
    } else {
      setShowSearchResults(false);
    }
  }, [searchQuery, searchResults, searchFocused]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest(".snowfall-search-container")) {
        setShowSearchResults(false);
        setSearchFocused(false);
      }
    };

    if (showSearchResults) {
      document.addEventListener("click", handleClickOutside);
      return () => document.removeEventListener("click", handleClickOutside);
    }
  }, [showSearchResults]);

  const handlePlayerSelect = (player: SnowfallPlayer) => {
    setSearchQuery("");
    if (onPlayerClick) {
      onPlayerClick(player);
    }
  };

  const handleSearchFocus = () => {
    setSearchFocused(true);
    if (searchQuery && searchQuery.length >= 2) {
      setShowSearchResults(true);
    }
  };

  const handleSearchBlur = () => {
    setTimeout(() => {
      setSearchFocused(false);
    }, 150);
  };
  return (
    <div className="pt-4 pb-2 px-2">
      <nav className="navbar rounded-xl shadow-lg">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex-shrink-0 flex items-center">
              <button onClick={() => navigate("/snowfall")} className="flex items-center">
                <img 
                  src="/lovable-uploads/ec8053c9-a017-4175-8a82-449514097721.png" 
                  alt="Snowflake" 
                  className="w-12 h-12 mr-1"
                />
                <span className="text-2xl font-bold text-white">Snowfall Rankings</span>
              </button>
            </div>

            {/* Search and Navigation */}
            <div className="flex items-center space-x-6">
              <div className="relative snowfall-search-container">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    type="text"
                    placeholder="Search Snowfall players..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onFocus={handleSearchFocus}
                    onBlur={handleSearchBlur}
                    className="pl-10 pr-4 py-2 w-64 bg-white/10 border-white/20 text-white placeholder-gray-400 focus:border-blue-400"
                  />
                </div>

                {/* Search Results */}
                {searchQuery && searchResults.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-black/90 border border-white/20 rounded-lg shadow-xl max-h-64 overflow-y-auto z-50">
                    {searchResults.map((player) => (
                      <button
                        key={player.id}
                        onClick={() => handlePlayerSelect(player)}
                        className="w-full px-4 py-2 text-left hover:bg-white/10 transition-colors"
                      >
                        <div className="text-white font-medium">{player.minecraft_username}</div>
                        <div className="text-gray-400 text-sm">
                          {player.assessment.tier} • {player.assessment.overall_score.toFixed(1)} score
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <Button
                variant="ghost"
                onClick={() => navigate("/")}
                className="text-white/80 hover:text-white hover:bg-white/10"
              >
                <Home size={20} className="mr-2" />
                Main Site
              </Button>
            </div>
          </div>

          {/* Mode Selector */}
          <div className="py-2 border-t border-white/10">
            <div className="flex space-x-4 overflow-x-auto">
              <button
                onClick={() => onSelectMode("overall")}
                className={cn(
                  "px-4 py-2 rounded-lg transition-colors whitespace-nowrap",
                  selectedMode === "overall"
                    ? "bg-blue-500 text-white"
                    : "text-white/70 hover:text-white hover:bg-white/10"
                )}
              >
                Overall Rankings
              </button>
              <button
                onClick={() => onSelectMode("skywars")}
                className={cn(
                  "px-4 py-2 rounded-lg transition-colors whitespace-nowrap",
                  selectedMode === "skywars"
                    ? "bg-blue-500 text-white"
                    : "text-white/70 hover:text-white hover:bg-white/10"
                )}
              >
                Skywars Tiers
              </button>
            </div>
          </div>
        </div>
      </nav>
    </div>
  );
}
