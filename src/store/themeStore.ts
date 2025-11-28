import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// Simplified theme store - Cache bust v1.0
type Theme = 'light' | 'dark' | 'system'

// ✅ CLEAN: Simplified theme definitions - colors handled by dynamicTheming.ts
export const availableThemes = [
  // Base themes
  { id: 'light', name: 'Light', category: 'base' },
  { id: 'dark', name: 'Dark', category: 'base' },
  { id: 'system', name: 'System', category: 'base' },
  
  // Professional Light themes
  { id: 'corporate', name: 'Corporate', category: 'professional-light' },
  { id: 'nature', name: 'Nature', category: 'professional-light' },
  { id: 'sunset', name: 'Sunset', category: 'professional-light' },
  { id: 'ocean', name: 'Ocean', category: 'professional-light' },
  
  // Professional Dark themes
  { id: 'corporate-dark', name: 'Corporate Dark', category: 'professional-dark' },
  { id: 'nature-dark', name: 'Nature Dark', category: 'professional-dark' },
  { id: 'sunset-dark', name: 'Sunset Dark', category: 'professional-dark' },
  { id: 'ocean-dark', name: 'Ocean Dark', category: 'professional-dark' },
  
  // VSCode inspired themes
  { id: 'dracula', name: 'Dracula', category: 'vscode' },
  { id: 'tokyo-night', name: 'Tokyo Night', category: 'vscode' },
  { id: 'synthwave-84', name: 'Synthwave \'84', category: 'vscode' },
  { id: 'monokai-pro', name: 'Monokai Pro', category: 'vscode' },
  
  // Material Theme variations
  { id: 'material-oceanic', name: 'Material Oceanic', category: 'material' },
  { id: 'material-darker', name: 'Material Darker', category: 'material' },
  { id: 'material-palenight', name: 'Material Palenight', category: 'material' },
  { id: 'material-deep-ocean', name: 'Material Deep Ocean', category: 'material' },
  
  // Popular VSCode themes
  { id: 'atom-one-dark', name: 'Atom One Dark', category: 'vscode' },
  
  // New Popular themes
  { id: 'nord', name: 'Nord', category: 'vscode' },
  { id: 'gruvbox', name: 'Gruvbox', category: 'vscode' },
  { id: 'cyberpunk', name: 'Cyberpunk', category: 'futuristic' },
  { id: 'pastel', name: 'Pastel', category: 'modern' },
  
  // Accessibility
  { id: 'high-contrast', name: 'High Contrast', category: 'accessibility' },
] as const

// ✅ CLEAN: Standard color palettes for colorPalette props
export const availableColorPalettes = [
  'gray', 'blue', 'green', 'red', 'purple', 'orange', 'cyan', 'teal', 'pink', 'yellow'
] as const

export type ColorPalette = typeof availableColorPalettes[number]

interface ThemeState {
  theme: Theme
  currentTheme: typeof availableThemes[number] | null
  currentColorPalette: ColorPalette
  setTheme: (theme: Theme) => void
  toggleTheme: () => void
  applyTheme: (themeId: string) => void
  setColorPalette: (palette: ColorPalette) => void
}

// Helper to detect system theme preference
const getSystemTheme = (): 'light' | 'dark' => {
  if (typeof window === 'undefined') return 'light'
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

// Apply the base theme (light/dark) to the DOM via data attributes
const applyThemeToDOM = (theme: Theme) => {
  if (typeof document === 'undefined') return
  
  const resolvedTheme = theme === 'system' ? getSystemTheme() : theme
  document.documentElement.setAttribute('data-theme', resolvedTheme)
  document.documentElement.style.colorScheme = resolvedTheme
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      theme: 'system',
      currentTheme: null,
      currentColorPalette: 'blue' as ColorPalette,
      
      setTheme: (theme: Theme) => {
        applyThemeToDOM(theme)
        set({ theme })
      },
      
      toggleTheme: () => {
        const { theme } = get()
        const newTheme = theme === 'light' ? 'dark' : 'light'
        applyThemeToDOM(newTheme)
        set({ theme: newTheme })
      },
      
      setColorPalette: (palette: ColorPalette) => {
        set({ currentColorPalette: palette })
      },
      
      applyTheme: (themeId: string) => {
        const selectedTheme = availableThemes.find(t => t.id === themeId)
        if (selectedTheme) {
          // ✅ NO mapear a light/dark automáticamente
          // Cada tema es fijo - Dracula siempre oscuro, Corporate siempre claro
          
          // Solo aplicar light/dark para los temas básicos
          if (['light', 'dark', 'system'].includes(themeId as Theme)) {
            const baseTheme = themeId as Theme
            applyThemeToDOM(baseTheme)
            set({ 
              theme: baseTheme, 
              currentTheme: selectedTheme 
            })
          } else {
            // ✅ Para temas personalizados, NO cambiar data-theme
            // El tema se maneja completamente por createSystem()
            set({ 
              theme: themeId as Theme, // Mantener el ID del tema actual
              currentTheme: selectedTheme 
            })
          }
        }
      },
    }),
    {
      name: 'g-admin-theme',
      partialize: (state) => ({
        theme: state.theme,
        currentTheme: state.currentTheme,
        currentColorPalette: state.currentColorPalette
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          applyThemeToDOM(state.theme)
        }
      },
    }
  )
)

// Initialize theme on import
if (typeof window !== 'undefined') {
  // Initialize with system theme
  const currentState = useThemeStore.getState()
  if (!currentState.theme) {
    applyThemeToDOM('system')
  }
  
  // Listen for system theme changes
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
    const { theme } = useThemeStore.getState()
    if (theme === 'system') {
      applyThemeToDOM('system')
    }
  })
}
