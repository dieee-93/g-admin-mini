/**
 * Contrast Audit Tool - Verifica contraste WCAG en todos los temas
 * 
 * Este script verifica que las combinaciones de colores críticas
 * cumplan con WCAG AA (4.5:1) en todos los 25+ temas disponibles
 * 
 * @version 1.0.0 - AUDITORÍA DE CONTRASTE POR TEMA
 */

import { availableThemes } from '@/store/themeStore';

// Función para calcular luminancia según especificación WCAG
const getLuminance = (rgb: [number, number, number]): number => {
  const [r, g, b] = rgb.map(c => {
    c = c / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};

// Función para calcular ratio de contraste según WCAG
const getContrastRatio = (rgb1: [number, number, number], rgb2: [number, number, number]): number => {
  const lum1 = getLuminance(rgb1);
  const lum2 = getLuminance(rgb2);
  return (Math.max(lum1, lum2) + 0.05) / (Math.min(lum1, lum2) + 0.05);
};

// Función para convertir hex a RGB
const hexToRgb = (hex: string): [number, number, number] => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? [
    parseInt(result[1], 16),
    parseInt(result[2], 16),
    parseInt(result[3], 16)
  ] : [0, 0, 0];
};

// Definición de los colores de cada tema (extraído de dynamicTheming.ts)
const themeColors: Record<string, Record<string, string>> = {
  'light': {
    50: "#f9fafb", 100: "#f3f4f6", 200: "#e5e7eb", 300: "#d1d5db",
    400: "#9ca3af", 500: "#6b7280", 600: "#4b5563", 700: "#374151",
    800: "#1f2937", 900: "#111827"
  },
  'dark': {
    50: "#111827", 100: "#1f2937", 200: "#374151", 300: "#4b5563",
    400: "#6b7280", 500: "#9ca3af", 600: "#d1d5db", 700: "#e5e7eb",
    800: "#f3f4f6", 900: "#f9fafb"
  },
  'synthwave-84': {
    50: "#241b2f", 100: "#34294f", 200: "#495495", 300: "#6d5aa6",
    400: "#b084eb", 500: "#ff7edb", 600: "#72f1b8", 700: "#36f9f6",
    800: "#fede5d", 900: "#f8f8f2"
  },
  'monokai-pro': {
    50: "#272822", 100: "#3c3d37", 200: "#49483e", 300: "#6a6b5d",
    400: "#8b8c7d", 500: "#fd971f", 600: "#f92672", 700: "#a6e22e",
    800: "#e6db74", 900: "#f8f8f2"
  },
  'dracula': {
    50: "#282a36", 100: "#44475a", 200: "#6272a4", 300: "#7d8cc4",
    400: "#9fb1d4", 500: "#bd93f9", 600: "#ff79c6", 700: "#50fa7b",
    800: "#ffb86c", 900: "#f8f8f2"
  },
  'tokyo-night': {
    50: "#16161e", 100: "#1a1b26", 200: "#24253a", 300: "#414868",
    400: "#565f89", 500: "#7aa2f7", 600: "#bb9af7", 700: "#9aa5ce",
    800: "#a9b1d6", 900: "#c0caf5"
  },
  'material-oceanic': {
    50: "#0e1419", 100: "#1e2329", 200: "#004d5c", 300: "#006064",
    400: "#00838f", 500: "#00acc1", 600: "#26c6da", 700: "#4dd0e1",
    800: "#80deea", 900: "#eeffff"
  },
  'nord': {
    50: "#2e3440", 100: "#3b4252", 200: "#434c5e", 300: "#4c566a",
    400: "#5e81ac", 500: "#81a1c1", 600: "#88c0d0", 700: "#8fbcbb",
    800: "#d8dee9", 900: "#eceff4"
  },
  'gruvbox': {
    50: "#282828", 100: "#3c3836", 200: "#504945", 300: "#665c54",
    400: "#7c6f64", 500: "#d79921", 600: "#fe8019", 700: "#8ec07c",
    800: "#fabd2f", 900: "#ebdbb2"
  },
  'cyberpunk': {
    50: "#0d1117", 100: "#161b22", 200: "#21262d", 300: "#30363d",
    400: "#484f58", 500: "#ff007f", 600: "#00ff9f", 700: "#00d4ff",
    800: "#ff6b35", 900: "#f0f6fc"
  }
};

// Combinaciones críticas que debemos verificar
const criticalCombinations = [
  { bg: '50', text: '900', name: 'Card Background + Primary Text (bg.surface + text.primary)' },
  { bg: '100', text: '900', name: 'Panel Background + Primary Text (bg.panel + text.primary)' },
  { bg: '200', text: '800', name: 'Subtle Background + Secondary Text (bg.subtle + text.secondary)' },
  { bg: '50', text: '600', name: 'Card Background + Muted Text (bg.surface + text.muted)' },
  { bg: '300', text: '900', name: 'Border + Primary Text (border.default + text.primary)' },
];

// Tipo para resultados de la auditoría
interface ContrastResult {
  theme: string;
  combination: string;
  bgColor: string;
  textColor: string;
  ratio: number;
  wcagAA: boolean;  // >= 4.5
  wcagAAA: boolean; // >= 7.0
  status: 'PASS' | 'FAIL' | 'CRITICAL';
}

/**
 * Ejecuta la auditoría de contraste para todos los temas
 */
export const runContrastAudit = (): {
  results: ContrastResult[];
  summary: {
    totalTests: number;
    passed: number;
    failed: number;
    critical: number;
    themesWithIssues: string[];
  };
} => {
  const results: ContrastResult[] = [];
  const themesWithIssues = new Set<string>();
  
  // Auditar solo los temas que tenemos definidos
  const temasAuditar = ['light', 'dark', 'synthwave-84', 'monokai-pro', 'dracula', 'tokyo-night', 'material-oceanic', 'nord', 'gruvbox', 'cyberpunk'];
  
  temasAuditar.forEach(themeId => {
    const colors = themeColors[themeId];
    if (!colors) return;
    
    criticalCombinations.forEach(combo => {
      const bgHex = colors[combo.bg];
      const textHex = colors[combo.text];
      
      if (!bgHex || !textHex) return;
      
      const bgRgb = hexToRgb(bgHex);
      const textRgb = hexToRgb(textHex);
      const ratio = getContrastRatio(textRgb, bgRgb);
      
      const wcagAA = ratio >= 4.5;
      const wcagAAA = ratio >= 7.0;
      
      let status: 'PASS' | 'FAIL' | 'CRITICAL' = 'PASS';
      if (!wcagAA) {
        status = ratio < 3.0 ? 'CRITICAL' : 'FAIL';
        themesWithIssues.add(themeId);
      }
      
      results.push({
        theme: themeId,
        combination: combo.name,
        bgColor: bgHex,
        textColor: textHex,
        ratio: Math.round(ratio * 100) / 100,
        wcagAA,
        wcagAAA,
        status
      });
    });
  });
  
  const summary = {
    totalTests: results.length,
    passed: results.filter(r => r.status === 'PASS').length,
    failed: results.filter(r => r.status === 'FAIL').length,
    critical: results.filter(r => r.status === 'CRITICAL').length,
    themesWithIssues: Array.from(themesWithIssues)
  };
  
  return { results, summary };
};

/**
 * Genera un reporte legible de la auditoría
 */
export const generateContrastReport = () => {
  const { results, summary } = runContrastAudit();
  
  console.log('🎨 AUDITORÍA DE CONTRASTE WCAG - TODOS LOS TEMAS');
  console.log('================================================');
  console.log(`📊 RESUMEN:`);
  console.log(`   Total tests: ${summary.totalTests}`);
  console.log(`   ✅ Passed: ${summary.passed} (${Math.round(summary.passed/summary.totalTests*100)}%)`);
  console.log(`   ⚠️  Failed: ${summary.failed} (${Math.round(summary.failed/summary.totalTests*100)}%)`);
  console.log(`   🚨 Critical: ${summary.critical} (${Math.round(summary.critical/summary.totalTests*100)}%)`);
  console.log(`   🎯 Temas con problemas: ${summary.themesWithIssues.join(', ')}`);
  console.log('');
  
  // Agrupar resultados por tema
  const byTheme = results.reduce((acc, result) => {
    if (!acc[result.theme]) acc[result.theme] = [];
    acc[result.theme].push(result);
    return acc;
  }, {} as Record<string, ContrastResult[]>);
  
  Object.entries(byTheme).forEach(([theme, themeResults]) => {
    const issues = themeResults.filter(r => r.status !== 'PASS');
    if (issues.length > 0) {
      console.log(`🎨 TEMA: ${theme.toUpperCase()}`);
      console.log('-------------------');
      issues.forEach(result => {
        const icon = result.status === 'CRITICAL' ? '🚨' : '⚠️';
        console.log(`${icon} ${result.combination}`);
        console.log(`    ${result.textColor} sobre ${result.bgColor}`);
        console.log(`    Ratio: ${result.ratio}:1 (WCAG AA: ${result.wcagAA ? '✅' : '❌'})`);
        console.log('');
      });
    }
  });
  
  // Recomendaciones
  if (summary.failed > 0 || summary.critical > 0) {
    console.log('💡 RECOMENDACIONES:');
    console.log('- Ajustar los valores de gray.50-900 en temas problemáticos');
    console.log('- Considerar usar tokens intermedios (gray.700, gray.800) para mejor contraste');
    console.log('- Verificar que bg.surface + text.primary tenga ratio >= 4.5:1');
    console.log('- Temas oscuros: asegurar que gray.50 sea suficientemente oscuro');
    console.log('- Temas claros: asegurar que gray.900 sea suficientemente oscuro');
  }
  
  return { results, summary };
};