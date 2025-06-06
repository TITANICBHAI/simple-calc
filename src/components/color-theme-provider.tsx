
"use client";

import React, { createContext, useContext, useEffect, useState, type ReactNode } from 'react';

type ColorScheme = 'blue' | 'black' | 'white';

interface ColorThemeContextType {
  colorScheme: ColorScheme;
  setColorScheme: (scheme: ColorScheme) => void;
}

const ColorThemeContext = createContext<ColorThemeContextType | undefined>(undefined);

const COLOR_SCHEME_STORAGE_KEY = 'calcul8-color-scheme';

export function ColorThemeProvider({ children }: { children: ReactNode }) {
  const [colorScheme, setColorSchemeState] = useState<ColorScheme>('blue'); // Default to blue
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const storedScheme = localStorage.getItem(COLOR_SCHEME_STORAGE_KEY) as ColorScheme | null;
    let activeScheme = 'blue' as ColorScheme;

    if (storedScheme && ['blue', 'black', 'white'].includes(storedScheme)) {
      activeScheme = storedScheme;
    }
    setColorSchemeState(activeScheme);
    document.documentElement.setAttribute('data-color-scheme', activeScheme);
  }, []);

  const setColorScheme = (scheme: ColorScheme) => {
    setColorSchemeState(scheme);
    if (isMounted) { // Only interact with localStorage on the client after mounting
        localStorage.setItem(COLOR_SCHEME_STORAGE_KEY, scheme);
    }
    document.documentElement.setAttribute('data-color-scheme', scheme);
  };

  // Removed: if (!isMounted) { return null; }

  return (
    <ColorThemeContext.Provider value={{ colorScheme, setColorScheme }}>
      {children}
    </ColorThemeContext.Provider>
  );
}

export function useColorTheme() {
  const context = useContext(ColorThemeContext);
  if (context === undefined) {
    throw new Error('useColorTheme must be used within a ColorThemeProvider');
  }
  return context;
}

    