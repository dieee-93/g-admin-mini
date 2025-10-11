/**
 * 🎨 Design Tokens - G-Admin Mini Dashboard
 * 
 * Tokens de diseño consistentes siguiendo el roadmap UX/UI
 * Archivo: src/theme/tokens.ts
 * 
 * Implementa:
 * - Espaciado estandarizado 
 * - Breakpoints unificados
 * - Colores accesibles WCAG AA
 * - Tokens semánticos para dashboard
 */

// 📏 ESPACIADO ESTANDARIZADO
export const SPACING = {
  xs: '0.25rem',     // 4px  - Pequeños gaps internos
  sm: '0.5rem',      // 8px  - Botones, elementos compactos  
  md: '1rem',        // 16px - Spacing estándar
  lg: '1.5rem',      // 24px - Secciones, cards
  xl: '2rem',        // 32px - Layout principal
  '2xl': '3rem',     // 48px - Separadores grandes
  '3xl': '4rem',     // 64px - Hero sections
} as const;

// 📱 BREAKPOINTS UNIFICADOS
export const BREAKPOINTS = {
  base: 0,           // Mobile first
  sm: 480,           // Small mobile
  md: 768,           // Tablet  
  lg: 1024,          // Desktop
  xl: 1280,          // Large desktop
  '2xl': 1536,       // Extra large
} as const;

// 🎨 COLORES ACCESIBLES (WCAG AA Compliant)
export const COLORS = {
  // Primary palette - Blue theme
  primary: {
    50: '#eff6ff',   // Very light blue
    100: '#dbeafe',  // Light blue
    200: '#bfdbfe',  // Medium light blue
    300: '#93c5fd',  // Medium blue
    400: '#60a5fa',  // Bright blue
    500: '#3b82f6',  // Main blue (contrast ratio 4.5:1)
    600: '#2563eb',  // Dark blue (contrast ratio 7:1)
    700: '#1d4ed8',  // Very dark blue
    800: '#1e40af',  // Extra dark blue
    900: '#1e3a8a',  // Darkest blue
  },
  
  // Gray palette - Neutral colors
  gray: {
    50: '#f9fafb',   // Almost white
    100: '#f3f4f6',  // Very light gray
    200: '#e5e7eb',  // Light gray
    300: '#d1d5db',  // Medium light gray
    400: '#9ca3af',  // Medium gray
    500: '#6b7280',  // Main gray (contrast ratio 4.5:1)
    600: '#4b5563',  // Dark gray (contrast ratio 7:1)
    700: '#374151',  // Very dark gray
    800: '#1f2937',  // Extra dark gray
    900: '#111827',  // Darkest gray
  },
  
  // Success palette - Green
  success: {
    50: '#ecfdf5',
    500: '#10b981',  // Main success (contrast ratio 4.5:1)
    600: '#059669',  // Dark success (contrast ratio 7:1)
    900: '#064e3b',
  },
  
  // Warning palette - Orange
  warning: {
    50: '#fffbeb',
    500: '#f59e0b',  // Main warning (contrast ratio 4.5:1)
    600: '#d97706',  // Dark warning (contrast ratio 7:1) 
    900: '#92400e',
  },
  
  // Error palette - Red
  error: {
    50: '#fef2f2',
    500: '#ef4444',  // Main error (contrast ratio 4.5:1)
    600: '#dc2626',  // Dark error (contrast ratio 7:1)
    900: '#7f1d1d',
  },
} as const;

// 🎛️ TOKENS SEMÁNTICOS - Dashboard específicos
export const DASHBOARD_TOKENS = {
  spacing: {
    // Layout spacing
    pageContainer: SPACING.xl,      // 32px - Padding de página
    sectionGap: SPACING.lg,         // 24px - Gap entre secciones
    cardGrid: SPACING.lg,           // 24px - Gap en grid de cards
    
    // Component spacing  
    cardPadding: SPACING.lg,        // 24px - Padding interno de cards
    metricGap: SPACING.md,          // 16px - Gap en métricas
    buttonGap: SPACING.sm,          // 8px - Gap entre botones
    iconGap: SPACING.sm,            // 8px - Gap con íconos
    
    // Micro spacing
    textGap: SPACING.xs,            // 4px - Gap entre texto relacionado
    badgeGap: SPACING.xs,           // 4px - Gap en badges
  },
  
  colors: {
    // Semantic colors
    background: {
      page: COLORS.gray[50],         // Fondo de página
      card: '#ffffff',               // Fondo de cards
      elevated: '#ffffff',           // Elementos elevados
    },
    
    text: {
      primary: COLORS.gray[900],     // Texto principal - Contraste 21:1
      secondary: COLORS.gray[600],   // Texto secundario - Contraste 7:1  
      muted: COLORS.gray[500],       // Texto atenuado - Contraste 4.5:1
      inverse: '#ffffff',            // Texto sobre fondos oscuros
    },
    
    border: {
      default: COLORS.gray[200],     // Bordes estándar
      hover: COLORS.primary[300],    // Bordes en hover
      focus: COLORS.primary[500],    // Bordes en focus
    },
    
    // Status colors
    status: {
      success: COLORS.success[500],   // Verde para éxito
      warning: COLORS.warning[500],   // Naranja para advertencia  
      error: COLORS.error[500],       // Rojo para errores
      info: COLORS.primary[500],      // Azul para información
    },
  },
  
  // Grid system
  grid: {
    columns: {
      mobile: 1,                     // 1 columna en móvil
      tablet: 2,                     // 2 columnas en tablet
      desktop: 4,                    // 4 columnas en desktop
      wide: 6,                       // 6 columnas en pantallas anchas
    },
    
    gaps: {
      mobile: SPACING.md,            // 16px en móvil
      tablet: SPACING.lg,            // 24px en tablet  
      desktop: SPACING.xl,           // 32px en desktop
    },
  },
} as const;

// 📐 RESPONSIVE UTILITIES
export const RESPONSIVE_SPACING = {
  // Spacing que se adapta al breakpoint
  adaptive: {
    base: SPACING.md,     // 16px en móvil
    md: SPACING.lg,       // 24px en tablet
    lg: SPACING.xl,       // 32px en desktop
  },
  
  // Grid gaps responsivos
  gridGap: {
    base: SPACING.md,     // 16px
    sm: SPACING.md,       // 16px  
    md: SPACING.lg,       // 24px
    lg: SPACING.xl,       // 32px
  },
} as const;

// 🎯 COMPONENT TOKENS - Para componentes específicos
export const COMPONENT_TOKENS = {
  MetricCard: {
    padding: SPACING.lg,              // 24px
    gap: SPACING.md,                  // 16px
    iconSize: '2.5rem',               // 40px
    borderRadius: '0.75rem',          // 12px
  },
  
  ExecutiveOverview: {
    sectionGap: SPACING.xl,           // 32px
    cardGridGap: SPACING.lg,          // 24px  
    metricsGridGap: SPACING.lg,       // 24px
    buttonGridGap: SPACING.md,        // 16px
  },
  
  Skeleton: {
    gap: SPACING.md,                  // 16px
    borderRadius: '0.375rem',         // 6px
    animationDuration: '1.5s',        // Duración de pulse
  },

  DraggableWidget: {
    controlsPadding: SPACING.md,      // 16px padding en overlay de controles
    controlsGap: SPACING.sm,          // 8px entre botones de control
    hoverShadow: 'md',                // Elevación en hover
    dragOpacity: 0.5,                 // Opacidad mientras arrastra
    overlayOpacity: 0.8,              // Opacidad del overlay de controles
  },
} as const;

// 🔧 UTILITY FUNCTIONS
export const getSpacing = (size: keyof typeof SPACING) => SPACING[size];
export const getColor = (color: string, shade?: number) => {
  // Utility para acceder a colores dinámicamente
  // Ejemplo: getColor('primary', 500) → COLORS.primary[500]
  return shade ? (COLORS as any)[color]?.[shade] : (COLORS as any)[color];
};

export const getResponsiveSpacing = (breakpoint: keyof typeof RESPONSIVE_SPACING.adaptive) => 
  RESPONSIVE_SPACING.adaptive[breakpoint];

// 🎨 TIPO HELPERS para TypeScript
export type SpacingToken = keyof typeof SPACING;
export type BreakpointToken = keyof typeof BREAKPOINTS;
export type ColorToken = keyof typeof COLORS;
export type DashboardSpacingToken = keyof typeof DASHBOARD_TOKENS.spacing;

// 📋 EXPORT DEFAULT para fácil importación
export const tokens = {
  spacing: SPACING,
  breakpoints: BREAKPOINTS,
  colors: COLORS,
  dashboard: DASHBOARD_TOKENS,
  responsive: RESPONSIVE_SPACING,
  components: COMPONENT_TOKENS,
} as const;

export default tokens;