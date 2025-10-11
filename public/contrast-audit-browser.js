/**
 * Contrast Audit - Versión Browser para testing
 * Se puede ejecutar en la consola del navegador
 */

// Función para calcular luminancia según especificación WCAG
const getLuminance = (rgb) => {
  const [r, g, b] = rgb.map(c => {
    c = c / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};

// Función para calcular ratio de contraste según WCAG
const getContrastRatio = (rgb1, rgb2) => {
  const lum1 = getLuminance(rgb1);
  const lum2 = getLuminance(rgb2);
  return (Math.max(lum1, lum2) + 0.05) / (Math.min(lum1, lum2) + 0.05);
};

// Función para convertir hex a RGB
const hexToRgb = (hex) => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? [
    parseInt(result[1], 16),
    parseInt(result[2], 16),
    parseInt(result[3], 16)
  ] : [0, 0, 0];
};

// Definición de colores de temas más problemáticos
const themeColors = {
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
  'dracula': {
    50: "#282a36", 100: "#44475a", 200: "#6272a4", 300: "#7d8cc4",
    400: "#9fb1d4", 500: "#bd93f9", 600: "#ff79c6", 700: "#50fa7b",
    800: "#ffb86c", 900: "#f8f8f2"
  },
  'tokyo-night': {
    50: "#16161e", 100: "#1a1b26", 200: "#24253a", 300: "#414868",
    400: "#565f89", 500: "#7aa2f7", 600: "#bb9af7", 700: "#9aa5ce",
    800: "#a9b1d6", 900: "#c0caf5"
  }
};

// Combinaciones críticas
const criticalCombinations = [
  { bg: '50', text: '900', name: 'Card Background + Primary Text (bg.surface + text.primary)' },
  { bg: '100', text: '900', name: 'Panel Background + Primary Text (bg.panel + text.primary)' },
  { bg: '200', text: '800', name: 'Subtle Background + Secondary Text (bg.subtle + text.secondary)' },
  { bg: '50', text: '600', name: 'Card Background + Muted Text (bg.surface + text.muted)' },
];

// Función principal de auditoría 
const runQuickContrastAudit = () => {
  console.log('🎨 AUDITORÍA RÁPIDA DE CONTRASTE WCAG');
  console.log('=====================================');
  
  const results = [];
  let totalTests = 0;
  let passed = 0;
  let failed = 0;
  let critical = 0;
  
  Object.entries(themeColors).forEach(([themeId, colors]) => {
    console.log(`\n🎯 TEMA: ${themeId.toUpperCase()}`);
    console.log('-------------------');
    
    criticalCombinations.forEach(combo => {
      const bgHex = colors[combo.bg];
      const textHex = colors[combo.text];
      
      const bgRgb = hexToRgb(bgHex);
      const textRgb = hexToRgb(textHex);  
      const ratio = getContrastRatio(textRgb, bgRgb);
      
      const wcagAA = ratio >= 4.5;
      const roundedRatio = Math.round(ratio * 100) / 100;
      
      totalTests++;
      
      if (wcagAA) {
        passed++;
        console.log(`✅ ${combo.name}: ${roundedRatio}:1`);
      } else {
        if (ratio < 3.0) {
          critical++;
          console.log(`🚨 ${combo.name}: ${roundedRatio}:1 (CRÍTICO)`);
        } else {
          failed++;
          console.log(`⚠️  ${combo.name}: ${roundedRatio}:1 (FALLA)`);
        }
        console.log(`    ${textHex} sobre ${bgHex} - Necesita: 4.5:1`);
      }
      
      results.push({
        theme: themeId,
        combination: combo.name,
        ratio: roundedRatio,
        status: wcagAA ? 'PASS' : (ratio < 3.0 ? 'CRITICAL' : 'FAIL')
      });
    });
  });
  
  console.log('\n📊 RESUMEN FINAL:');
  console.log('=================');
  console.log(`Total tests: ${totalTests}`);
  console.log(`✅ Passed: ${passed} (${Math.round(passed/totalTests*100)}%)`);
  console.log(`⚠️  Failed: ${failed} (${Math.round(failed/totalTests*100)}%)`);
  console.log(`🚨 Critical: ${critical} (${Math.round(critical/totalTests*100)}%)`);
  
  if (failed > 0 || critical > 0) {
    console.log('\n💡 RECOMENDACIONES:');
    console.log('- Temas oscuros necesitan gray.50 más oscuro');  
    console.log('- Temas claros necesitan gray.900 más oscuro');
    console.log('- Considerar valores intermedios para mejor contraste');
  }
  
  return results;
};

// Ejecutar la auditoría
console.log('🔍 Iniciando auditoría de contraste...');
const auditResults = runQuickContrastAudit();