
import React, { createContext, useContext, useState, ReactNode } from 'react';
import { SnowfallPlayer } from '@/types/snowfall';

interface SnowfallPopupData {
  player: SnowfallPlayer;
  timestamp: string;
}

interface SnowfallPopupContextType {
  popupData: SnowfallPopupData | null;
  openPopup: (data: SnowfallPopupData) => void;
  closePopup: () => void;
}

const SnowfallPopupContext = createContext<SnowfallPopupContextType | undefined>(undefined);

export function SnowfallPopupProvider({ children }: { children: ReactNode }) {
  const [popupData, setPopupData] = useState<SnowfallPopupData | null>(null);

  const openPopup = (data: SnowfallPopupData) => {
    setPopupData(data);
  };

  const closePopup = () => {
    setPopupData(null);
  };

  return (
    <SnowfallPopupContext.Provider value={{ popupData, openPopup, closePopup }}>
      {children}
    </SnowfallPopupContext.Provider>
  );
}

export function useSnowfallPopup() {
  const context = useContext(SnowfallPopupContext);
  if (context === undefined) {
    throw new Error('useSnowfallPopup must be used within a SnowfallPopupProvider');
  }
  return context;
}
