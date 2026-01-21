/**
 * Design Tokens - Sistema de Tokens Centralizado para Chakra v3
 *
 * Adaptado del nuevo sistema de diseño (Magic Patterns)
 * Compatible con createSystem() y theming dinámico
 *
 * REGLA: Usar SOLO estos tokens, NUNCA valores hardcoded.
 */

/**
 * SPACING SCALE (Base 8px)
 * Uso: padding, margin, gap
 */
export const SPACING = {
  '0': '0',
  '1': '0.25rem',  // 4px  - Micro gaps, tight spacing
  '2': '0.5rem',   // 8px  - Small gaps (button groups, badges)
  '3': '0.75rem',  // 12px - Medium-small gaps
  '4': '1rem',     // 16px - Standard spacing (form fields, card content)
  '5': '1.25rem',  // 20px - Medium gaps
  '6': '1.5rem',   // 24px - Card padding, section gaps (STANDARD CARDS)
  '7': '1.75rem',  // 28px - Large-medium gaps
  '8': '2rem',     // 32px - Page container, major sections
  '10': '2.5rem',  // 40px - Extra large gaps
  '12': '3rem',    // 48px - Section separators
  '16': '4rem',    // 64px - Hero sections, page headers
  '20': '5rem',    // 80px - Extra large sections
} as const;

/**
 * SPACING USAGE GUIDE
 * Use these semantic names when explaining spacing decisions
 */
export const SPACING_USAGE = {
  microGap: '1',      // 4px - Entre iconos y texto
  buttonGroup: '2',   // 8px - Botones en grupo
  formField: '4',     // 16px - Entre campos de formulario
  cardPadding: '6',   // 24px - Padding interno de cards (STANDARD)
  sectionGap: '8',    // 32px - Entre secciones de pagina
  majorSection: '12', // 48px - Separadores grandes
  pageHeader: '16',   // 64px - Headers de pagina
} as const;

/**
 * TYPOGRAPHY SCALE
 */
export const FONT_SIZES = {
  xs: '0.75rem',    // 12px - Captions, metadata
  sm: '0.875rem',   // 14px - Small text, labels
  md: '1rem',       // 16px - Body text (BASE)
  lg: '1.125rem',   // 18px - Large body, subtitles
  xl: '1.25rem',    // 20px - Small headings
  '2xl': '1.5rem',  // 24px - Section headings
  '3xl': '1.875rem',// 30px - Page headings
  '4xl': '2.25rem', // 36px - Large headings
  '5xl': '3rem',    // 48px - Display text
  '6xl': '3.75rem', // 60px - Hero text
} as const;

export const FONT_WEIGHTS = {
  light: 300,
  normal: 400,
  medium: 500,
  semibold: 600,
  bold: 700,
} as const;

/**
 * BORDER RADIUS
 */
export const BORDER_RADIUS = {
  none: '0',
  sm: '0.125rem',   // 2px - Small badges
  base: '0.25rem',  // 4px - Badges, small buttons
  md: '0.375rem',   // 6px - Inputs, buttons
  lg: '0.5rem',     // 8px - Cards (STANDARD)
  xl: '0.75rem',    // 12px - Modals, large cards
  '2xl': '1rem',    // 16px - Hero sections
  '3xl': '1.5rem',  // 24px - Special elements
  full: '9999px',   // Circular (avatars, pills)
} as const;

/**
 * SHADOWS (Elevation System)
 */
export const SHADOWS = {
  xs: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  sm: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)', // STANDARD CARDS
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)', // Elevated panels
  xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)', // Modals
  '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)', // Overlays
  inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
  none: 'none',
} as const;

/**
 * SEMANTIC COLOR TOKENS
 * These map to theme colors and adapt to light/dark modes
 */
export const SEMANTIC_TOKENS = {
  // Backgrounds
  'bg.canvas': 'gray.50',      // Main background
  'bg.surface': 'white',       // Cards, modals, panels
  'bg.subtle': 'gray.100',     // Subtle backgrounds
  'bg.muted': 'gray.200',      // Muted backgrounds

  // Text
  'text.primary': 'gray.900',  // Main text
  'text.secondary': 'gray.700',// Secondary text
  'text.muted': 'gray.600',    // Dimmed text
  'text.disabled': 'gray.400', // Disabled text

  // Borders
  'border.default': 'gray.200',// Default borders
  'border.muted': 'gray.300',  // Subtle borders
  'border.emphasis': 'gray.400',// Emphasized borders

  // Interactive
  'interactive.primary': 'blue.600',
  'interactive.hover': 'blue.700',
  'interactive.active': 'blue.800',

  // Status
  'status.success': 'green.600',
  'status.warning': 'yellow.600',
  'status.error': 'red.600',
  'status.info': 'blue.600',
} as const;

/**
 * Z-INDEX SCALE (Layering)
 */
export const Z_INDEX = {
  base: 0,
  dropdown: 1000,
  sticky: 1100,
  fixed: 1200,
  modalBackdrop: 1300,
  modal: 1400,
  popover: 1500,
  tooltip: 1600,
} as const;

/**
 * ANIMATION DURATIONS
 */
export const DURATIONS = {
  fast: '150ms',
  normal: '250ms',
  slow: '400ms',
} as const;

/**
 * COMPONENT STANDARD STYLES
 * Common style presets for components
 */
export const CARD_STYLES = {
  bg: 'bg.surface',
  p: '6',
  borderRadius: 'lg',
  shadow: 'md',
  borderWidth: '1px',
  borderColor: 'border.default',
} as const;

export const CARD_HOVER_STYLES = {
  shadow: 'lg',
  transform: 'translateY(-2px)',
} as const;
