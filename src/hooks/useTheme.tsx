import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import type { Palette } from '@/types'

type Theme = 'dark' | 'light'

interface ThemeContextValue {
  theme: Theme
  resolvedTheme: 'dark' | 'light'
  setTheme: (theme: Theme) => void
  cycleTheme: () => void
  palette: Palette
  setPalette: (palette: Palette) => void
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined)

const STORAGE_KEY = 'portfolio-theme'
const PALETTE_STORAGE_KEY = 'portfolio-palette'

function getInitialTheme(): 'dark' | 'light' {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored === 'dark' || stored === 'light') {
      return stored
    }
  } catch {
    // localStorage unavailable
  }
  const prefersLight = window.matchMedia('(prefers-color-scheme: light)').matches
  return prefersLight ? 'light' : 'dark'
}

function getInitialPalette(): Palette {
  try {
    const stored = localStorage.getItem(PALETTE_STORAGE_KEY)
    if (stored === 'red' || stored === 'blue') {
      return stored
    }
  } catch {
    // localStorage unavailable
  }
  return 'red'
}

function resolveTheme(theme: Theme): 'dark' | 'light' {
  return theme
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(getInitialTheme)
  const [palette, setPaletteState] = useState<Palette>(getInitialPalette)

  const resolvedTheme = resolveTheme(theme)

  // Set data-theme during render so it's available before paint
  document.documentElement.setAttribute('data-theme', resolvedTheme)
  document.documentElement.setAttribute('data-palette', palette)

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, theme)
      localStorage.setItem(PALETTE_STORAGE_KEY, palette)
    } catch {
      // localStorage unavailable
    }
  }, [theme, palette])


  const setTheme = useCallback((newTheme: Theme) => {
    setThemeState(newTheme)
  }, [])

  const cycleTheme = useCallback(() => {
    setThemeState((prev) => (prev === 'dark' ? 'light' : 'dark'))
  }, [])

  const setPalette = useCallback((next: Palette) => {
    setPaletteState(next)
  }, [])

  return (
    <ThemeContext.Provider value={{ theme, resolvedTheme, setTheme, cycleTheme, palette, setPalette }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider')
  }
  return context
}
