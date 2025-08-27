import { createSystem, defaultConfig, defineConfig } from '@chakra-ui/react'
import { availableThemes } from '@/store/themeStore'

/**
 * Get the actual color values from our theme definitions
 * Maps theme IDs to their actual hex values
 */
const getThemeColors = (themeId: string) => {
  const themeColors: Record<string, any> = {
    // ✅ Light theme - Professional light color palette
    'light': {
      50: { value: "#ffffff" }, // Pure white text
      100: { value: "#f8fafc" }, // Very light background
      200: { value: "#e2e8f0" }, // Light borders
      300: { value: "#cbd5e1" }, // Subtle borders
      400: { value: "#94a3b8" }, // Muted text
      500: { value: "#3b82f6" }, // Primary blue
      600: { value: "#2563eb" }, // Strong blue
      700: { value: "#1d4ed8" }, // Dark blue borders
      800: { value: "#f1f5f9" }, // Light surface background
      900: { value: "#ffffff" }, // Canvas background (white)
    },
    'synthwave-84': {
      50: { value: "#fede5d" },
      100: { value: "#ff7edb" }, 
      200: { value: "#36f9f6" },
      300: { value: "#72f1b8" },
      400: { value: "#f97e72" },
      500: { value: "#ff7edb" }, // Primary
      600: { value: "#b084eb" },
      700: { value: "#495495" },
      800: { value: "#34294f" },
      900: { value: "#241b2f" }, // Dark background
    },
    'monokai-pro': {
      50: { value: "#fcfcfa" },
      100: { value: "#f8f8f2" },
      200: { value: "#e6db74" },
      300: { value: "#a6e22e" }, 
      400: { value: "#66d9ef" },
      500: { value: "#fd971f" }, // Orange primary
      600: { value: "#f92672" },
      700: { value: "#ae81ff" },
      800: { value: "#49483e" },
      900: { value: "#272822" }, // Dark background
    },
    'dracula': {
      50: { value: "#f8f8f2" },
      100: { value: "#6272a4" },
      200: { value: "#8be9fd" },
      300: { value: "#50fa7b" },
      400: { value: "#ffb86c" },
      500: { value: "#bd93f9" }, // Purple primary
      600: { value: "#ff79c6" },
      700: { value: "#ff5555" },
      800: { value: "#44475a" },
      900: { value: "#282a36" }, // Dark background
    },
    'tokyo-night': {
      50: { value: "#c0caf5" }, // Light foreground text
      100: { value: "#a9b1d6" }, // Secondary text
      200: { value: "#9aa5ce" }, // Muted text
      300: { value: "#787c99" }, // Medium contrast
      400: { value: "#565f89" }, // UI elements
      500: { value: "#414868" }, // Primary accent
      600: { value: "#33467c" }, // Darker accent
      700: { value: "#293e75" }, // Border/divider
      800: { value: "#1a1b26" }, // Surface background
      900: { value: "#16161e" }, // Canvas background
    },
    'material-oceanic': {
      50: { value: "#eeffff" }, // White text
      100: { value: "#b2ebf2" }, // Light cyan
      200: { value: "#80deea" }, // Bright cyan
      300: { value: "#4dd0e1" }, // Medium cyan
      400: { value: "#26c6da" }, // Active cyan
      500: { value: "#00acc1" }, // Primary cyan
      600: { value: "#00838f" }, // Dark cyan
      700: { value: "#006064" }, // Border/divider
      800: { value: "#004d5c" }, // Surface background
      900: { value: "#0e1419" }, // Dark canvas
    },
    'material-darker': {
      50: { value: "#ffffff" }, // Pure white text
      100: { value: "#eeffff" }, // Off-white
      200: { value: "#b2dfdb" }, // Light teal
      300: { value: "#80cbc4" }, // Medium teal
      400: { value: "#4db6ac" }, // Active teal
      500: { value: "#26a69a" }, // Primary teal
      600: { value: "#009688" }, // Strong teal
      700: { value: "#00796b" }, // Dark teal
      800: { value: "#212121" }, // Dark surface
      900: { value: "#171717" }, // Darker canvas
    },
    'material-palenight': {
      50: { value: "#ffffff" }, // White text
      100: { value: "#959dcb" }, // Light purple-gray
      200: { value: "#89ddff" }, // Bright cyan
      300: { value: "#82aaff" }, // Blue accent
      400: { value: "#c792ea" }, // Purple accent
      500: { value: "#ff9cac" }, // Pink primary
      600: { value: "#ffcb6b" }, // Yellow accent
      700: { value: "#a3f7bf" }, // Green accent
      800: { value: "#3c435e" }, // Surface background
      900: { value: "#292d3e" }, // Canvas background
    },
    'material-deep-ocean': {
      50: { value: "#ffffff" }, // White text
      100: { value: "#8f93a2" }, // Muted text
      200: { value: "#84ffff" }, // Bright cyan
      300: { value: "#82aaff" }, // Blue accent
      400: { value: "#c792ea" }, // Purple accent
      500: { value: "#ff9cac" }, // Pink primary
      600: { value: "#ffcc02" }, // Yellow accent
      700: { value: "#85e89d" }, // Green accent
      800: { value: "#2e3c43" }, // Surface background
      900: { value: "#0f111a" }, // Deep canvas
    },
    'atom-one-dark': {
      50: { value: "#abb2bf" }, // Light foreground
      100: { value: "#828997" }, // Muted text
      200: { value: "#61afef" }, // Blue accent
      300: { value: "#c678dd" }, // Purple accent
      400: { value: "#e06c75" }, // Red accent
      500: { value: "#98c379" }, // Green primary
      600: { value: "#e5c07b" }, // Yellow accent
      700: { value: "#d19a66" }, // Orange accent
      800: { value: "#3e4451" }, // Surface background
      900: { value: "#282c34" }, // Canvas background
    },
    'high-contrast': {
      50: { value: "#ffffff" }, // Pure white
      100: { value: "#f0f0f0" }, // Very light gray
      200: { value: "#d0d0d0" }, // Light gray
      300: { value: "#a0a0a0" }, // Medium light gray
      400: { value: "#808080" }, // Medium gray
      500: { value: "#606060" }, // Primary gray
      600: { value: "#404040" }, // Dark gray
      700: { value: "#303030" }, // Darker gray
      800: { value: "#202020" }, // Very dark gray
      900: { value: "#000000" }, // Pure black
    },
    // Professional light themes
    'corporate': {
      50: { value: "#eff6ff" }, // Very light blue
      100: { value: "#dbeafe" }, // Light blue
      200: { value: "#bfdbfe" }, // Soft blue
      300: { value: "#93c5fd" }, // Medium blue
      400: { value: "#60a5fa" }, // Active blue
      500: { value: "#1e40af" }, // Primary corporate blue
      600: { value: "#1d4ed8" }, // Strong blue
      700: { value: "#1e3a8a" }, // Dark blue border
      800: { value: "#1e40af" }, // Surface blue
      900: { value: "#1e3a8a" }, // Canvas blue
    },
    'nature': {
      50: { value: "#f0fdf4" }, // Very light green
      100: { value: "#dcfce7" }, // Light green
      200: { value: "#bbf7d0" }, // Soft green
      300: { value: "#86efac" }, // Medium green
      400: { value: "#4ade80" }, // Active green
      500: { value: "#16a34a" }, // Primary nature green
      600: { value: "#15803d" }, // Strong green
      700: { value: "#166534" }, // Dark green border
      800: { value: "#14532d" }, // Surface green
      900: { value: "#0f3d1a" }, // Canvas green
    },
    'sunset': {
      50: { value: "#fff7ed" }, // Very light orange
      100: { value: "#ffedd5" }, // Light orange
      200: { value: "#fed7aa" }, // Soft orange
      300: { value: "#fdba74" }, // Medium orange
      400: { value: "#fb923c" }, // Active orange
      500: { value: "#ea580c" }, // Primary sunset orange
      600: { value: "#dc2626" }, // Strong orange-red
      700: { value: "#c2410c" }, // Dark orange border
      800: { value: "#9a3412" }, // Surface orange
      900: { value: "#7c2d12" }, // Canvas orange
    },
    'ocean': {
      50: { value: "#ecfeff" }, // Very light cyan
      100: { value: "#cffafe" }, // Light cyan
      200: { value: "#a5f3fc" }, // Soft cyan
      300: { value: "#67e8f9" }, // Medium cyan
      400: { value: "#22d3ee" }, // Active cyan
      500: { value: "#0891b2" }, // Primary ocean blue
      600: { value: "#0e7490" }, // Strong blue
      700: { value: "#155e75" }, // Dark blue border
      800: { value: "#164e63" }, // Surface blue
      900: { value: "#083344" }, // Canvas blue
    },
    // Professional dark themes
    'corporate-dark': {
      50: { value: "#f0f9ff" }, // Light text
      100: { value: "#e0f2fe" }, // Secondary text
      200: { value: "#bae6fd" }, // Accent text
      300: { value: "#7dd3fc" }, // Medium elements
      400: { value: "#38bdf8" }, // Active elements
      500: { value: "#0ea5e9" }, // Primary corporate
      600: { value: "#0284c7" }, // Strong accent
      700: { value: "#0369a1" }, // Border/divider
      800: { value: "#075985" }, // Surface background
      900: { value: "#0c4a6e" }, // Dark canvas
    },
    'nature-dark': {
      50: { value: "#ecfdf5" }, // Light text
      100: { value: "#d1fae5" }, // Secondary text
      200: { value: "#a7f3d0" }, // Accent text
      300: { value: "#6ee7b7" }, // Medium elements
      400: { value: "#34d399" }, // Active elements
      500: { value: "#10b981" }, // Primary nature
      600: { value: "#059669" }, // Strong accent
      700: { value: "#047857" }, // Border/divider
      800: { value: "#065f46" }, // Surface background
      900: { value: "#064e3b" }, // Dark canvas
    },
    'sunset-dark': {
      50: { value: "#fef2f2" }, // Light text
      100: { value: "#fee2e2" }, // Secondary text
      200: { value: "#fecaca" }, // Accent text
      300: { value: "#fca5a5" }, // Medium elements
      400: { value: "#f87171" }, // Active elements
      500: { value: "#ef4444" }, // Primary sunset red
      600: { value: "#dc2626" }, // Strong accent
      700: { value: "#b91c1c" }, // Border/divider
      800: { value: "#991b1b" }, // Surface background
      900: { value: "#7f1d1d" }, // Dark canvas
    },
    'ocean-dark': {
      50: { value: "#f0fdfa" }, // Light text
      100: { value: "#ccfbf1" }, // Secondary text
      200: { value: "#99f6e4" }, // Accent text
      300: { value: "#5eead4" }, // Medium elements
      400: { value: "#2dd4bf" }, // Active elements
      500: { value: "#14b8a6" }, // Primary ocean teal
      600: { value: "#0d9488" }, // Strong accent
      700: { value: "#0f766e" }, // Border/divider
      800: { value: "#115e59" }, // Surface background
      900: { value: "#134e4a" }, // Dark canvas
    }
  }
  
  return themeColors[themeId] || null
}

/**
 * Creates a dynamic Chakra system based on theme configuration
 * Maps theme colors to native Chakra color tokens with direct hex values
 */
export const createThemeSystem = (themeId: string) => {
  const theme = availableThemes.find(t => t.id === themeId)
  
  if (!theme) {
    console.warn(`Theme ${themeId} not found, using default system`)
    return createSystem(defaultConfig)
  }

  // Handle system and dark themes
  if (['dark', 'system'].includes(themeId)) {
    return createSystem(defaultConfig) // Use default for basic themes
  }

  const themeColors = getThemeColors(themeId)
  
  if (!themeColors) {
    console.warn(`No colors defined for theme ${themeId}, using default system`)
    return createSystem(defaultConfig)
  }
  
  // 🎯 ENFOQUE CORRECTO: Solo mapear gray.* con los colores del tema
  // Todos los componentes por defecto usan gray.* automáticamente
  const config = defineConfig({
    theme: {
      tokens: {
        colors: {
          // ✅ CLAVE: Mapear SOLO gray.* con nuestros colores de tema  
          gray: {
            50: { value: themeColors[50].value },   // Light text
            100: { value: themeColors[100].value }, // Secondary light  
            200: { value: themeColors[200].value }, // Secondary text
            300: { value: themeColors[300].value }, // Muted elements
            400: { value: themeColors[400].value }, // Disabled/muted
            500: { value: themeColors[500].value }, // Primary color (botones default)
            600: { value: themeColors[600].value }, // Hover states
            700: { value: themeColors[700].value }, // Borders/dividers  
            800: { value: themeColors[800].value }, // Surface backgrounds
            900: { value: themeColors[900].value }, // Canvas/main background
          },

          // ✅ Mantener paletas estándar para colorPalette props
          blue: {
            50: { value: "#eff6ff" },
            100: { value: "#dbeafe" },
            200: { value: "#bfdbfe" },
            300: { value: "#93c5fd" },
            400: { value: "#60a5fa" },
            500: { value: "#3b82f6" },
            600: { value: "#2563eb" },
            700: { value: "#1d4ed8" },
            800: { value: "#1e40af" },
            900: { value: "#1e3a8a" },
          },
          green: {
            50: { value: "#f0fdf4" },
            100: { value: "#dcfce7" },
            200: { value: "#bbf7d0" },
            300: { value: "#86efac" },
            400: { value: "#4ade80" },
            500: { value: "#22c55e" },
            600: { value: "#16a34a" },
            700: { value: "#15803d" },
            800: { value: "#166534" },
            900: { value: "#14532d" },
          },
          red: {
            50: { value: "#fef2f2" },
            100: { value: "#fee2e2" },
            200: { value: "#fecaca" },
            300: { value: "#fca5a5" },
            400: { value: "#f87171" },
            500: { value: "#ef4444" },
            600: { value: "#dc2626" },
            700: { value: "#b91c1c" },
            800: { value: "#991b1b" },
            900: { value: "#7f1d1d" },
          },
          purple: {
            50: { value: "#faf5ff" },
            100: { value: "#f3e8ff" },
            200: { value: "#e9d5ff" },
            300: { value: "#d8b4fe" },
            400: { value: "#c084fc" },
            500: { value: "#a855f7" },
            600: { value: "#9333ea" },
            700: { value: "#7c3aed" },
            800: { value: "#6b21a8" },
            900: { value: "#581c87" },
          },
        },
      },
      
      // ✅ Semantic tokens con sintaxis CORRECTA referenciando gray.* 
      semanticTokens: {
        colors: {
          'bg.canvas': { 
            value: "{colors.gray.900}"
          },
          'bg.surface': { 
            value: "{colors.gray.800}"
          },
          'bg.subtle': {
            value: "{colors.gray.700}"
          },
          'bg.muted': {
            value: "{colors.gray.600}"
          },
          
          'text.primary': { 
            value: "{colors.gray.50}"
          },
          'text.secondary': {
            value: "{colors.gray.100}"
          },
          'text.muted': {
            value: "{colors.gray.300}"
          },
          
          'border.subtle': { 
            value: "{colors.gray.700}"
          },
          'border.default': {
            value: "{colors.gray.600}"
          },
        },
      },

      // 🎨 RECIPES según documento: Solo estructura, let Chakra handle colors
      recipes: {
        // ✅ Button Recipe - Según Phase 2: Remove color overrides
        button: {
          base: {
            fontWeight: 'medium',
            borderRadius: 'md',
          },
          // NO variant overrides - let Chakra handle colorPalette
        },

        // ✅ Card Recipe - Use gray.* tokens (our dynamic theme colors)
        card: {
          base: {
            bg: 'gray.800',           // Surface background
            color: 'gray.50',         // Text color
            borderColor: 'gray.700',  // Border color
            borderRadius: 'md',
          },
          variants: {
            elevated: {
              shadow: 'md',
            },
            outline: {
              border: '1px solid',
              borderColor: 'gray.700',
            },
            subtle: {
              bg: 'gray.700',
            },
          },
        },

        // ✅ Alert Recipe - Mantener colores específicos para status
        alert: {
          base: {
            borderRadius: 'md',
          },
          variants: {
            info: {
              bg: 'blue.50',
              borderColor: 'blue.200',
              color: 'blue.800',
            },
            success: {
              bg: 'green.50',
              borderColor: 'green.200',
              color: 'green.800',
            },
            warning: {
              bg: 'yellow.50',
              borderColor: 'yellow.200',
              color: 'yellow.800',
            },
            error: {
              bg: 'red.50',
              borderColor: 'red.200',
              color: 'red.800',
            },
          },
        },
      },
    },
  })

  console.log(`🎨 Creating system for theme: ${themeId}`, {
    themeColors,
    recipes: Object.keys(config.theme.recipes),
    grayTokens: config.theme.tokens.colors.gray,
    semanticTokens: config.theme.semanticTokens.colors
  })
  
  // ✅ RESTORE: Merge with defaultConfig to maintain base functionality
  const system = createSystem(defaultConfig, config)
  console.log('🔍 System created:', {
    hasSemanticTokens: !!system._config.theme.semanticTokens,
    bgSurface: system._config.theme.semanticTokens?.colors?.['bg.surface']
  })
  return system
}

/**
 * Get the current theme system based on store state
 */
export const getCurrentThemeSystem = (currentTheme: any) => {
  if (!currentTheme) {
    return createSystem(defaultConfig) // ✅ DefaultConfig para fallback
  }
  
  return createThemeSystem(currentTheme.id)
}