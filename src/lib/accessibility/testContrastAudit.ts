/**
 * Script de prueba para la auditoría de contraste
 * Ejecuta la auditoría y muestra resultados detallados
 */

import { generateContrastReport } from './contrastAudit';

// Ejecutar la auditoría
console.log('Iniciando auditoría de contraste WCAG...\n');

try {
  const auditResults = generateContrastReport();
  
  // Mostrar estadísticas adicionales
  const { results, summary } = auditResults;
  
  console.log('\n📈 ANÁLISIS DETALLADO:');
  console.log('======================');
  
  // Top 5 peores ratios
  const worstRatios = results
    .filter(r => r.status !== 'PASS')
    .sort((a, b) => a.ratio - b.ratio)
    .slice(0, 5);
    
  if (worstRatios.length > 0) {
    console.log('\n🚨 TOP 5 PEORES RATIOS DE CONTRASTE:');
    worstRatios.forEach((result, i) => {
      console.log(`${i + 1}. ${result.theme} - ${result.combination}`);
      console.log(`   Ratio: ${result.ratio}:1 (Necesita: 4.5:1)`);
      console.log(`   Colores: ${result.textColor} sobre ${result.bgColor}`);
    });
  }
  
  // Temas más problemáticos
  const themeIssues = results.reduce((acc, result) => {
    if (result.status !== 'PASS') {
      acc[result.theme] = (acc[result.theme] || 0) + 1;
    }
    return acc;
  }, {} as Record<string, number>);
  
  const sortedThemeIssues = Object.entries(themeIssues)
    .sort(([,a], [,b]) => b - a);
    
  if (sortedThemeIssues.length > 0) {
    console.log('\n📊 TEMAS CON MÁS PROBLEMAS:');
    sortedThemeIssues.forEach(([theme, count]) => {
      console.log(`• ${theme}: ${count} problema(s) de contraste`);
    });
  }
  
  // Combinaciones más problemáticas
  const comboIssues = results.reduce((acc, result) => {
    if (result.status !== 'PASS') {
      acc[result.combination] = (acc[result.combination] || 0) + 1;
    }
    return acc;
  }, {} as Record<string, number>);
  
  const sortedComboIssues = Object.entries(comboIssues)
    .sort(([,a], [,b]) => b - a);
    
  if (sortedComboIssues.length > 0) {
    console.log('\n🎯 COMBINACIONES MÁS PROBLEMÁTICAS:');
    sortedComboIssues.forEach(([combo, count]) => {
      console.log(`• ${combo}: ${count} tema(s) afectado(s)`);
    });
  }
  
} catch (error) {
  console.error('❌ Error ejecutando auditoría:', error);
}