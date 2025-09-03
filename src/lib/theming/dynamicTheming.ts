import { createSystem, defaultConfig, defineConfig, mergeConfigs } from '@chakra-ui/react'
import { availableThemes } from '@/store/themeStore'

/**
 * Get the actual color values from our theme definitions
 * Maps theme IDs to their actual hex values
 */
const getThemeColors = (themeId: string) => {
  const themeColors: Record<string, any> = {
    // ✅ Light theme - Paleta gris estándar (como Chakra original)
    'light': {
      50: { value: "#f9fafb" },   // Fondo claro
      100: { value: "#f3f4f6" },  // Superficie clara
      200: { value: "#e5e7eb" },  // Bordes claros
      300: { value: "#d1d5db" },  // Elementos claros
      400: { value: "#9ca3af" },  // Texto muted
      500: { value: "#6b7280" },  // Primary gris
      600: { value: "#4b5563" },  // Hover
      700: { value: "#374151" },  // Divisores
      800: { value: "#1f2937" },  // Superficie secundaria
      900: { value: "#111827" },  // Texto negro
    },
    // ✅ Dark theme - Paleta gris oscura estándar (invertida de light)
    'dark': {
      50: { value: "#111827" },   // Fondo muy oscuro
      100: { value: "#1f2937" },  // Superficie oscura
      200: { value: "#374151" },  // Bordes oscuros
      300: { value: "#4b5563" },  // Elementos oscuros
      400: { value: "#6b7280" },  // Texto muted
      500: { value: "#9ca3af" },  // Primary gris
      600: { value: "#d1d5db" },  // Hover
      700: { value: "#e5e7eb" },  // Divisores claros
      800: { value: "#f3f4f6" },  // Superficie clara
      900: { value: "#f9fafb" },  // Texto blanco
    },
    'synthwave-84': {
      50: { value: "#241b2f" },   // Fondo principal - el más oscuro del tema original
      100: { value: "#34294f" },  // Superficie - un poco más claro
      200: { value: "#495495" },  // Bordes - color intermedio
      300: { value: "#6d5aa6" },  // Elementos - progresión natural
      400: { value: "#b084eb" },  // Elementos activos - púrpura intermedio
      500: { value: "#ff7edb" },  // Primary - el rosa característico de synthwave
      600: { value: "#72f1b8" },  // Acento fuerte - verde synthwave
      700: { value: "#36f9f6" },  // Divisores brillantes - cyan synthwave
      800: { value: "#fede5d" },  // Superficie destacada - amarillo synthwave
      900: { value: "#f8f8f2" },  // Texto principal - blanco/claro
    },
    'monokai-pro': {
      50: { value: "#272822" },   // Fondo principal - el característico verde oscuro de Monokai
      100: { value: "#3c3d37" },  // Superficie - un poco más claro
      200: { value: "#49483e" },  // Bordes - color característico de comentarios
      300: { value: "#6a6b5d" },  // Elementos - progresión natural
      400: { value: "#8b8c7d" },  // Elementos activos 
      500: { value: "#fd971f" },  // Primary - el naranja característico de Monokai
      600: { value: "#f92672" },  // Acento fuerte - rosa de Monokai
      700: { value: "#a6e22e" },  // Acento verde - verde de Monokai
      800: { value: "#e6db74" },  // Superficie destacada - amarillo de Monokai
      900: { value: "#f8f8f2" },  // Texto principal - blanco característico
    },
    'dracula': {
      50: { value: "#282a36" },   // Fondo principal - el característico fondo oscuro de Dracula
      100: { value: "#44475a" },  // Superficie - color de comentarios/UI elements
      200: { value: "#6272a4" },  // Bordes - un azul más claro
      300: { value: "#7d8cc4" },  // Elementos - progresión hacia texto
      400: { value: "#9fb1d4" },  // Elementos activos
      500: { value: "#bd93f9" },  // Primary - el púrpura característico de Dracula
      600: { value: "#ff79c6" },  // Acento fuerte - rosa de Dracula
      700: { value: "#50fa7b" },  // Acento verde - verde de Dracula
      800: { value: "#ffb86c" },  // Superficie destacada - naranja de Dracula
      900: { value: "#f8f8f2" },  // Texto principal - blanco característico
    },
    'tokyo-night': {
      50: { value: "#16161e" },   // Fondo principal - el más oscuro
      100: { value: "#1a1b26" },  // Superficie - fondo de superficie 
      200: { value: "#24253a" },  // Bordes - un poco más claro
      300: { value: "#414868" },  // Elementos - accent color original
      400: { value: "#565f89" },  // Elementos activos
      500: { value: "#7aa2f7" },  // Primary - azul característico de Tokyo Night
      600: { value: "#bb9af7" },  // Acento púrpura
      700: { value: "#9aa5ce" },  // Texto secundario
      800: { value: "#a9b1d6" },  // Superficie clara
      900: { value: "#c0caf5" },  // Texto principal - el más claro
    },
    'material-oceanic': {
      50: { value: "#0e1419" },   // Fondo principal - canvas oscuro
      100: { value: "#1e2329" },  // Superficie - un poco más claro
      200: { value: "#004d5c" },  // Bordes - azul oscuro
      300: { value: "#006064" },  // Elementos 
      400: { value: "#00838f" },  // Elementos activos
      500: { value: "#00acc1" },  // Primary - cyan característico
      600: { value: "#26c6da" },  // Acento activo
      700: { value: "#4dd0e1" },  // Acento medio
      800: { value: "#80deea" },  // Superficie destacada
      900: { value: "#eeffff" },  // Texto principal - blanco
    },
    'material-darker': {
      50: { value: "#171717" },   // Fondo principal - darker canvas
      100: { value: "#212121" },  // Superficie - dark surface
      200: { value: "#2d2d2d" },  // Bordes - un poco más claro
      300: { value: "#424242" },  // Elementos 
      400: { value: "#616161" },  // Elementos activos
      500: { value: "#26a69a" },  // Primary - teal característico
      600: { value: "#009688" },  // Teal fuerte
      700: { value: "#4db6ac" },  // Teal activo
      800: { value: "#80cbc4" },  // Superficie destacada - teal claro
      900: { value: "#ffffff" },  // Texto principal - blanco puro
    },
    'material-palenight': {
      50: { value: "#292d3e" },   // Fondo principal - canvas oscuro
      100: { value: "#3c435e" },  // Superficie 
      200: { value: "#4a5167" },  // Bordes
      300: { value: "#676e95" },  // Elementos
      400: { value: "#8087a2" },  // Elementos activos
      500: { value: "#c792ea" },  // Primary - púrpura característico
      600: { value: "#82aaff" },  // Azul accent
      700: { value: "#89ddff" },  // Cyan accent
      800: { value: "#a3f7bf" },  // Verde accent (superficie destacada)
      900: { value: "#ffffff" },  // Texto principal - blanco
    },
    'material-deep-ocean': {
      50: { value: "#0f111a" },   // Fondo principal - deep canvas
      100: { value: "#1a1d26" },  // Superficie 
      200: { value: "#2e3c43" },  // Bordes
      300: { value: "#4a5862" },  // Elementos
      400: { value: "#6b7785" },  // Elementos activos
      500: { value: "#82aaff" },  // Primary - azul característico
      600: { value: "#c792ea" },  // Púrpura accent
      700: { value: "#84ffff" },  // Cyan brillante accent
      800: { value: "#85e89d" },  // Verde accent (superficie destacada)
      900: { value: "#ffffff" },  // Texto principal - blanco
    },
    'atom-one-dark': {
      50: { value: "#282c34" },   // Fondo principal - canvas oscuro
      100: { value: "#3e4451" },  // Superficie
      200: { value: "#4b5263" },  // Bordes 
      300: { value: "#636d83" },  // Elementos
      400: { value: "#828997" },  // Elementos activos (texto muted original)
      500: { value: "#61afef" },  // Primary - azul característico
      600: { value: "#c678dd" },  // Púrpura accent
      700: { value: "#98c379" },  // Verde accent
      800: { value: "#e5c07b" },  // Amarillo accent (superficie destacada)
      900: { value: "#abb2bf" },  // Texto principal - foreground claro
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
      50: { value: "#eff6ff" }, // Very light blue - fondo principal
      100: { value: "#dbeafe" }, // Light blue - superficie
      200: { value: "#bfdbfe" }, // Soft blue - bordes
      300: { value: "#93c5fd" }, // Medium blue - elementos
      400: { value: "#60a5fa" }, // Active blue - elementos activos
      500: { value: "#1e40af" }, // Primary corporate blue
      600: { value: "#1d4ed8" }, // Strong blue - hover
      700: { value: "#1e3a8a" }, // Dark blue - divisores
      800: { value: "#1e293b" }, // Superficie secundaria (más sutil)
      900: { value: "#0f172a" }, // Texto principal (dark slate)
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
    // Professional dark themes - INVERTIDOS de sus contrapartes light
    'corporate-dark': {
      50: { value: "#0f172a" },   // Fondo oscuro (texto de corporate)
      100: { value: "#1e293b" },  // Superficie oscura (superficie secundaria de corporate)
      200: { value: "#1e3a8a" },  // Bordes oscuros (divisores de corporate)
      300: { value: "#1d4ed8" },  // Elementos oscuros (hover de corporate)
      400: { value: "#1e40af" },  // Activos oscuros (primary de corporate)
      500: { value: "#60a5fa" },  // Primary invertido (elementos activos de corporate)
      600: { value: "#93c5fd" },  // Acento fuerte (elementos de corporate)
      700: { value: "#bfdbfe" },  // Divisores claros (bordes de corporate)
      800: { value: "#dbeafe" },  // Superficie clara (superficie de corporate)
      900: { value: "#eff6ff" },  // Texto claro (fondo de corporate)
    },
    'nature-dark': {
      50: { value: "#0f3d1a" }, // Fondo oscuro (era 900 de nature)
      100: { value: "#14532d" }, // Superficie oscura (era 800 de nature)
      200: { value: "#166534" }, // Bordes oscuros (era 700 de nature)
      300: { value: "#15803d" }, // Elementos oscuros (era 600 de nature)
      400: { value: "#16a34a" }, // Activos oscuros (era 500 de nature)
      500: { value: "#4ade80" }, // Primary invertido (era 400 de nature)
      600: { value: "#86efac" }, // Acento fuerte (era 300 de nature)
      700: { value: "#bbf7d0" }, // Divisores claros (era 200 de nature)
      800: { value: "#dcfce7" }, // Superficie clara (era 100 de nature)
      900: { value: "#f0fdf4" }, // Texto claro (era 50 de nature)
    },
    'sunset-dark': {
      50: { value: "#7c2d12" }, // Fondo oscuro (era 900 de sunset)
      100: { value: "#9a3412" }, // Superficie oscura (era 800 de sunset)
      200: { value: "#c2410c" }, // Bordes oscuros (era 700 de sunset)
      300: { value: "#dc2626" }, // Elementos oscuros (era 600 de sunset)
      400: { value: "#ea580c" }, // Activos oscuros (era 500 de sunset)
      500: { value: "#fb923c" }, // Primary invertido (era 400 de sunset)
      600: { value: "#fdba74" }, // Acento fuerte (era 300 de sunset)
      700: { value: "#fed7aa" }, // Divisores claros (era 200 de sunset)
      800: { value: "#ffedd5" }, // Superficie clara (era 100 de sunset)
      900: { value: "#fff7ed" }, // Texto claro (era 50 de sunset)
    },
    'ocean-dark': {
      50: { value: "#083344" }, // Fondo oscuro (era 900 de ocean)
      100: { value: "#164e63" }, // Superficie oscura (era 800 de ocean)
      200: { value: "#155e75" }, // Bordes oscuros (era 700 de ocean)
      300: { value: "#0e7490" }, // Elementos oscuros (era 600 de ocean)
      400: { value: "#0891b2" }, // Activos oscuros (era 500 de ocean)
      500: { value: "#22d3ee" }, // Primary invertido (era 400 de ocean)
      600: { value: "#67e8f9" }, // Acento fuerte (era 300 de ocean)
      700: { value: "#a5f3fc" }, // Divisores claros (era 200 de ocean)
      800: { value: "#cffafe" }, // Superficie clara (era 100 de ocean)
      900: { value: "#ecfeff" }, // Texto claro (era 50 de ocean)
    },
    // 🌌 Nord Theme - Popular Scandinavian palette
    'nord': {
      50: { value: "#2e3440" },   // Polar Night darkest
      100: { value: "#3b4252" },  // Polar Night 
      200: { value: "#434c5e" },  // Polar Night
      300: { value: "#4c566a" },  // Polar Night lightest
      400: { value: "#5e81ac" },  // Frost blue
      500: { value: "#81a1c1" },  // Primary frost blue
      600: { value: "#88c0d0" },  // Frost cyan
      700: { value: "#8fbcbb" },  // Frost aqua
      800: { value: "#d8dee9" },  // Snow Storm
      900: { value: "#eceff4" },  // Snow Storm lightest
    },
    // 🟤 Gruvbox - Classic retro-groove theme
    'gruvbox': {
      50: { value: "#282828" },   // bg0_h (hard background)
      100: { value: "#3c3836" },  // bg1
      200: { value: "#504945" },  // bg2
      300: { value: "#665c54" },  // bg3
      400: { value: "#7c6f64" },  // bg4
      500: { value: "#d79921" },  // Primary yellow
      600: { value: "#fe8019" },  // Orange accent
      700: { value: "#8ec07c" },  // Green accent
      800: { value: "#fabd2f" },  // Bright yellow
      900: { value: "#ebdbb2" },  // fg0 (foreground)
    },
    // 🤖 Cyberpunk - Futuristic neon theme
    'cyberpunk': {
      50: { value: "#0d1117" },   // Ultra dark with blue tint
      100: { value: "#161b22" },  // Dark surface
      200: { value: "#21262d" },  // Medium dark
      300: { value: "#30363d" },  // Elements
      400: { value: "#484f58" },  // Active elements
      500: { value: "#ff007f" },  // Primary hot pink/magenta
      600: { value: "#00ff9f" },  // Neon green accent
      700: { value: "#00d4ff" },  // Electric cyan
      800: { value: "#ff6b35" },  // Neon orange
      900: { value: "#f0f6fc" },  // Bright white text
    },
    // 🌸 Pastel - Soft and modern theme
    'pastel': {
      50: { value: "#fef7ff" },   // Very light lavender
      100: { value: "#f3e8ff" },  // Light lavender
      200: { value: "#e9d5ff" },  // Soft lavender
      300: { value: "#d8b4fe" },  // Medium lavender
      400: { value: "#c084fc" },  // Active lavender
      500: { value: "#a855f7" },  // Primary vibrant purple
      600: { value: "#9333ea" },  // Deep purple
      700: { value: "#7c3aed" },  // Rich purple
      800: { value: "#6b21a8" },  // Dark purple
      900: { value: "#581c87" },  // Very dark purple
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

  // Handle system theme only (dark now has its own palette)
  if (themeId === 'system') {
    return createSystem(defaultConfig) // Use default for system theme only
  }

  const themeColors = getThemeColors(themeId)
  
  if (!themeColors) {
    console.warn(`No colors defined for theme ${themeId}, using default system`)
    return createSystem(defaultConfig)
  }
  
  // 🎯 ENFOQUE UNIFICADO: Solo mapear gray.* con los colores del tema
  // Los semantic tokens se adaptan automáticamente porque referencian gray.*
  // Todos los componentes por defecto usan gray.* automáticamente
  const config = defineConfig({
  // 🎨 Estilos globales para barras de scroll adaptadas a cada tema
  globalCss: {
    // Webkit browsers (Chrome, Safari, Edge)
    '::-webkit-scrollbar': {
      width: '10px',                   // Aumentamos el ancho para mejor visibilidad
      height: '10px',
    },
    '::-webkit-scrollbar-track': {
      bg: '{colors.bg.muted}',         // Fondo más oscuro para mayor contraste
      borderRadius: '6px',
      border: '1px solid {colors.border.subtle}',
    },
    '::-webkit-scrollbar-thumb': {
      bg: '{colors.fg.muted}',         // Thumb más contrastado
      borderRadius: '6px',
      border: '2px solid {colors.bg.muted}',  // Borde más grueso
      _hover: {
        bg: '{colors.fg.default}',     // Hover más visible
        border: '2px solid {colors.bg.subtle}',
      },
    },
    '::-webkit-scrollbar-thumb:active': {
      bg: '{colors.accent.default}',   // Activo con color de acento para máximo contraste
      border: '2px solid {colors.bg.default}',
    },
    '::-webkit-scrollbar-corner': {
      bg: '{colors.bg.muted}',         // Esquina igual al track
    },
    
    // Firefox - mayor contraste también
    html: {
      scrollbarWidth: 'thin',
      scrollbarColor: '{colors.fg.muted} {colors.bg.muted}',  // Thumb y track más contrastados
    },
    
    // Estilos adicionales para elementos con scroll personalizado
    '.custom-scrollbar': {
      scrollbarWidth: 'thin',
      scrollbarColor: '{colors.fg.muted} {colors.bg.muted}',
    },
  },    theme: {
      tokens: {
        colors: {
          // ✅ CLAVE: Mapear SOLO gray.* con nuestros colores de tema  
          gray: {
            50: { value: themeColors[50].value },   // Fondo (light) / Fondo (dark)
            100: { value: themeColors[100].value }, // Superficie (light) / Superficie (dark)
            200: { value: themeColors[200].value }, // Bordes (light) / Bordes (dark)
            300: { value: themeColors[300].value }, // Elementos (light) / Elementos (dark)
            400: { value: themeColors[400].value }, // Activos (light) / Activos (dark)
            500: { value: themeColors[500].value }, // Primary color
            600: { value: themeColors[600].value }, // Hover states
            700: { value: themeColors[700].value }, // Divisores
            800: { value: themeColors[800].value }, // Superficie secundaria
            900: { value: themeColors[900].value }, // Texto (light) / Texto (dark)
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

      // ✅ Semantic tokens UNIFICADOS - Referencian gray.* que se auto-adapta al tema
      semanticTokens: {
        colors: {
          // Fondos - Estructura anidada según documentación Chakra UI v3
          'bg': {
            'DEFAULT': { value: "{colors.gray.50}" },    // Fondo principal (claro en light, oscuro en dark)
            'canvas': { value: "{colors.gray.50}" },     // Alias para fondo principal
            'surface': { value: "{colors.gray.50}" },    // Superficie (cards, modales)
            'panel': { value: "{colors.gray.100}" },         // Paneles/dropdowns - se adapta a cada tema
            'subtle': { value: "{colors.gray.200}" },    // Superficie sutil
            'muted': { value: "{colors.gray.300}" },     // Superficie muted
          },
          
          // Texto - Referencian gray.* tokens (se adaptan automáticamente al tema)
          'text': {
            'primary': { value: "{colors.gray.900}" },   // Texto principal (oscuro en light, claro en dark)
            'secondary': { value: "{colors.gray.800}" }, // Texto secundario
            'muted': { value: "{colors.gray.600}" },     // Texto muted
          },
          
          // Foreground - Token que usan muchos componentes de Chakra para texto
          'fg': {
            'DEFAULT': { value: "{colors.gray.900}" },   // Foreground principal = text.primary
            'muted': { value: "{colors.gray.600}" },     // Foreground muted = text.muted
            'subtle': { value: "{colors.gray.700}" },    // Foreground sutil
          },
          
          // Bordes - Referencian gray.* tokens (se adaptan automáticamente al tema)
          'border': {
            'subtle': { value: "{colors.gray.200}" },    // Bordes sutiles
            'default': { value: "{colors.gray.300}" },   // Bordes default
          },
        },
      },

      // 🎨 RECIPES según documento: Solo estructura, let Chakra handle colors
      recipes: {
        // Button recipe removed - let Chakra use 100% default behavior

        // ✅ Card Recipe - CONTRASTE CORRECTO con nuestro sistema gray.*
        card: {
          base: {
            bg: 'gray.100',           // Superficie (claro en light, oscuro en dark)
            color: 'gray.900',        // Texto (oscuro en light, claro en dark)
            borderColor: 'gray.300',  // Border sutil
            borderRadius: 'md',
          },
          variants: {
            elevated: {
              shadow: 'md',
              bg: 'gray.100',         // Mantener superficie consistente
              borderColor: 'gray.200', // Border más sutil para elevated
            },
            outline: {
              border: '1px solid',
              borderColor: 'gray.300',
              bg: 'transparent',
            },
            subtle: {
              bg: 'gray.200',         // Superficie ligeramente diferente
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

        // ✅ Select Recipe - CONTRASTE CORRECTO para inputs/selects
        select: {
          base: {
            bg: 'bg.panel',           // Fondo de panel (gray.100)
            color: 'text.primary',    // Texto principal (gray.900 en light, gray.50 en dark)
            borderColor: 'border.default', // Border default (gray.300)
            borderRadius: 'md',
          },
          variants: {
            outline: {
              border: '1px solid',
              borderColor: 'border.default',
              bg: 'bg.panel',
              color: 'text.primary',
              _hover: {
                borderColor: 'gray.400',
              },
              _focus: {
                borderColor: 'gray.500',
                boxShadow: '0 0 0 1px {colors.gray.500}',
              },
            },
            filled: {
              bg: 'bg.subtle',
              color: 'text.primary',
              border: 'none',
              _hover: {
                bg: 'bg.muted',
              },
            },
          },
        },
      },
    },
  })

  // ✅ CORRECT: Use mergeConfigs explicitly before createSystem
  const mergedConfig = mergeConfigs(defaultConfig, config)
  const system = createSystem(mergedConfig)
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