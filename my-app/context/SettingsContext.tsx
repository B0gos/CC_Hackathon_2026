import React, { createContext, useContext, useState, ReactNode } from 'react';

type SettingsContextType = {
  distance: string;
  setDistance: (value: string) => void;
  gemini: boolean;
  setGemini: (value: boolean) => void;
  tts: boolean;
  setTts: (value: boolean) => void;
};

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [distance, setDistance] = useState('');
  const [gemini, setGemini] = useState(false);
  const [tts, setTts] = useState(false);

  return (
    <SettingsContext.Provider
      value={{
        distance,
        setDistance,
        gemini,
        setGemini,
        tts,
        setTts,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used inside SettingsProvider');
  }
  return context;
}