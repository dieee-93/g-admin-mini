import { create } from 'zustand'
import { persist } from 'zustand/middleware'

type Theme = 'light' | 'dark' | 'system' | 'corporate' | 'nature' | 'sunset' | 'ocean' | 'high-contrast'

interface ThemeState {
  theme: Theme
  resolvedTheme: 'light' | 'dark' | 'corporate' | 'nature' | 'sunset' | 'ocean' | 'high-contrast'
  setTheme: (theme: Theme) => void
  toggleTheme: () => void
  getThemeColors: () => ThemeColors
}

interface ThemeColors {
  name: string
  primary: string
  secondary: string
  accent: string
  background: string
  surface: string
  text: string
}

const themeColors: Record<string, ThemeColors> = {
  light: {
    name: 'Light',
    primary: '#0ea5ff',
    secondary: '#64748b',
    accent: '#06b6d4',
    background: '#ffffff',
    surface: '#f8fafc',
    text: '#0f172a',
  },
  dark: {
    name: 'Dark',
    primary: '#0ea5ff',
    secondary: '#94a3b8',
    accent: '#22d3ee',
    background: '#0f172a',
    surface: '#1e293b',
    text: '#f8fafc',
  },
  corporate: {
    name: 'Corporate',
    primary: '#1e40af',
    secondary: '#475569',
    accent: '#059669',
    background: '#f8fafc',
    surface: '#ffffff',
    text: '#1e293b',
  },
  nature: {
    name: 'Nature',
    primary: '#16a34a',
    secondary: '#65a30d',
    accent: '#ca8a04',
    background: '#f0fdf4',
    surface: '#ffffff',
    text: '#14532d',
  },
  sunset: {
    name: 'Sunset',
    primary: '#ea580c',
    secondary: '#dc2626',
    accent: '#eab308',
    background: '#fff7ed',
    surface: '#ffffff',
    text: '#9a3412',
  },
  ocean: {
    name: 'Ocean',
    primary: '#0891b2',
    secondary: '#0e7490',
    accent: '#06b6d4',
    background: '#ecfeff',
    surface: '#ffffff',
    text: '#164e63',
  },
  'high-contrast': {
    name: 'High Contrast',
    primary: '#000000',
    secondary: '#333333',
    accent: '#0066cc',
    background: '#ffffff',
    surface: '#f5f5f5',
    text: '#000000',
  },
}

const getSystemTheme = (): 'light' | 'dark' => {
  if (typeof window === 'undefined') return 'light'
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

const resolveTheme = (theme: Theme): 'light' | 'dark' | 'corporate' | 'nature' | 'sunset' | 'ocean' | 'high-contrast' => {
  if (theme === 'system') return getSystemTheme()
  return theme as any
}

const applyThemeToDOM = (resolvedTheme: 'light' | 'dark' | 'corporate' | 'nature' | 'sunset' | 'ocean' | 'high-contrast') => {
  if (typeof document === 'undefined') return
  
  const root = document.documentElement
  
  // Remove all theme classes
  root.classList.remove('light', 'dark', 'corporate', 'nature', 'sunset', 'ocean', 'high-contrast')
  root.classList.add(resolvedTheme)
  
  // Update Chakra UI color mode (for system themes, use light/dark)
  const colorMode = ['light', 'corporate', 'nature', 'sunset', 'ocean', 'high-contrast'].includes(resolvedTheme) ? 'light' : 'dark'
  root.setAttribute('data-theme', colorMode)
  
  // Apply custom CSS variables for custom themes
  if (resolvedTheme !== 'light' && resolvedTheme !== 'dark') {
    const colors = themeColors[resolvedTheme]
    if (colors) {
      root.style.setProperty('--theme-primary', colors.primary)
      root.style.setProperty('--theme-secondary', colors.secondary)
      root.style.setProperty('--theme-accent', colors.accent)
      root.style.setProperty('--theme-background', colors.background)
      root.style.setProperty('--theme-surface', colors.surface)
      root.style.setProperty('--theme-text', colors.text)
    }
  } else {
    // Remove custom variables for system themes
    root.style.removeProperty('--theme-primary')
    root.style.removeProperty('--theme-secondary')
    root.style.removeProperty('--theme-accent')
    root.style.removeProperty('--theme-background')
    root.style.removeProperty('--theme-surface')
    root.style.removeProperty('--theme-text')
  }
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      theme: 'system',
      resolvedTheme: getSystemTheme(),
      
      setTheme: (theme: Theme) => {
        const resolvedTheme = resolveTheme(theme)
        applyThemeToDOM(resolvedTheme)
        set({ theme, resolvedTheme })
      },
      
      toggleTheme: () => {
        const { resolvedTheme } = get()
        const newTheme = resolvedTheme === 'light' ? 'dark' : 'light'
        applyThemeToDOM(newTheme)
        set({ theme: newTheme, resolvedTheme: newTheme })
      },
      
      getThemeColors: () => {
        const { resolvedTheme } = get()
        return themeColors[resolvedTheme] || themeColors.light
      },
    }),
    {
      name: 'g-admin-theme',
      onRehydrateStorage: () => (state) => {
        if (state) {
          const resolvedTheme = resolveTheme(state.theme)
          applyThemeToDOM(resolvedTheme)
          state.resolvedTheme = resolvedTheme
        }
      },
    }
  )
)

// Initialize theme on import
if (typeof window !== 'undefined') {
  const stored = localStorage.getItem('g-admin-theme')
  if (stored) {
    try {
      const { state } = JSON.parse(stored)
      const resolvedTheme = resolveTheme(state.theme)
      applyThemeToDOM(resolvedTheme)
    } catch {
      // Fallback to system theme
      applyThemeToDOM(getSystemTheme())
    }
  } else {
    applyThemeToDOM(getSystemTheme())
  }
  
  // Listen for system theme changes
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
    const { theme, setTheme } = useThemeStore.getState()
    if (theme === 'system') {
      const systemTheme = e.matches ? 'dark' : 'light'
      applyThemeToDOM(systemTheme)
      useThemeStore.setState({ resolvedTheme: systemTheme })
    }
  })
}