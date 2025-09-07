// Shared Types for G-Admin Design System
// Chakra UI v3 compatible type definitions

// Responsive types for Chakra UI v3
export type ResponsiveValue<T> = T | { 
  base?: T 
  sm?: T 
  md?: T 
  lg?: T 
  xl?: T 
  '2xl'?: T 
}

// Chakra UI v3 spacing tokens (numeric strings)
export type SpacingToken = 
  | '0' | '0.5' | '1' | '1.5' | '2' | '2.5' | '3' | '3.5' | '4' | '4.5' | '5' 
  | '6' | '7' | '8' | '9' | '10' | '11' | '12' | '14' | '16' | '20' | '24' 
  | '28' | '32' | '36' | '40' | '44' | '48' | '52' | '56' | '60' | '64' 
  | '72' | '80' | '96'

// Common spacing props
export type SpacingProp = ResponsiveValue<SpacingToken | string>

// Semantic spacing tokens mapping (optimized for modern UI)
export const SEMANTIC_SPACING: Record<string, SpacingToken> = {
  'none': '0',
  'xs': '1',    // 4px - minimal spacing
  'sm': '2',    // 8px - tight spacing
  'md': '4',    // 16px - standard spacing
  'lg': '6',    // 24px - comfortable spacing
  'xl': '8',    // 32px - loose spacing
  '2xl': '12'   // 48px - section spacing
} as const

// Helper function to convert semantic tokens to numeric tokens
export function getSpacingToken(value: string | ResponsiveValue<string>): any {
  if (!value) return value;
  
  // Handle responsive values
  if (typeof value === 'object' && value !== null) {
    const result: unknown = {};
    Object.keys(value).forEach(key => {
      const v = (value as any)[key];
      result[key] = typeof v === 'string' ? (SEMANTIC_SPACING[v] || v) : v;
    });
    return result;
  }
  
  // Handle simple string values
  if (typeof value === 'string') {
    return SEMANTIC_SPACING[value] || value;
  }
  
  return value;
}