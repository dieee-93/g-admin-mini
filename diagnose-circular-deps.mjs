/**
 * SCRIPT DE DIAGNÓSTICO - DEPENDENCIAS CIRCULARES
 * ================================================
 * Analiza los manifiestos de módulos para detectar dependencias circulares
 * y genera un reporte detallado con el grafo de dependencias.
 * 
 * Uso: node diagnose-circular-deps.mjs
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('\n🔍 ANALIZANDO DEPENDENCIAS DE MÓDULOS...\n');

// Leer todos los manifiestos
const modulesDir = path.join(__dirname, 'src', 'modules');
const manifestFiles = [];

function findManifests(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    
    if (entry.isDirectory()) {
      findManifests(fullPath);
    } else if (entry.name === 'manifest.tsx') {
      manifestFiles.push(fullPath);
    }
  }
}

findManifests(modulesDir);
console.log(`Total de archivos manifest.tsx encontrados: ${manifestFiles.length}\n`);

// Parsear manifiestos buscando id y depends
const modules = [];
const graph = new Map();

for (const file of manifestFiles) {
  const content = fs.readFileSync(file, 'utf-8');
  
  // Extraer id del manifiesto
  const idMatch = content.match(/id:\s*['"]([^'"]+)['"]/);
  const id = idMatch ? idMatch[1] : null;
  
  if (!id) continue;
  
  // Extraer depends
  const dependsMatch = content.match(/depends:\s*\[([^\]]*)\]/s);
  let depends = [];
  
  if (dependsMatch) {
    const dependsStr = dependsMatch[1];
    const deps = dependsStr.match(/['"]([^'"]+)['"]/g);
    if (deps) {
      depends = deps.map(d => d.replace(/['"]/g, ''));
    }
  }
  
  // Extraer name
  const nameMatch = content.match(/name:\s*['"]([^'"]+)['"]/);
  const name = nameMatch ? nameMatch[1] : id;
  
  modules.push({ id, name, depends, file });
  graph.set(id, { name, depends });
}

console.log(`Módulos parseados: ${modules.length}\n`);

// Función para detectar ciclos usando DFS
function detectCycles() {
  const visited = new Set();
  const recursionStack = new Set();
  const cycles = [];
  const nodesInCycles = new Set();

  function dfs(moduleId, path = []) {
    if (!visited.has(moduleId)) {
      visited.add(moduleId);
      recursionStack.add(moduleId);
      path.push(moduleId);

      const node = graph.get(moduleId);
      if (node) {
        for (const depId of node.depends) {
          if (!visited.has(depId)) {
            dfs(depId, [...path]);
          } else if (recursionStack.has(depId)) {
            // Ciclo detectado
            const cycleStart = path.indexOf(depId);
            const cycle = path.slice(cycleStart).concat(depId);
            cycles.push(cycle);
            cycle.forEach(id => nodesInCycles.add(id));
          }
        }
      }

      recursionStack.delete(moduleId);
    }
  }

  // Ejecutar DFS desde cada nodo
  for (const moduleId of graph.keys()) {
    if (!visited.has(moduleId)) {
      dfs(moduleId);
    }
  }

  return { cycles, nodesInCycles };
}

// Detectar ciclos
const { cycles, nodesInCycles } = detectCycles();

if (cycles.length > 0) {
  console.log('❌ DEPENDENCIAS CIRCULARES DETECTADAS:\n');
  
  cycles.forEach((cycle, index) => {
    console.log(`🔄 Ciclo ${index + 1}:`);
    console.log(`   ${cycle.join(' → ')}\n`);
  });

  console.log(`\n📋 Módulos involucrados en ciclos (${nodesInCycles.size}):\n`);
  Array.from(nodesInCycles).sort().forEach(moduleId => {
    const node = graph.get(moduleId);
    console.log(`   • ${moduleId} (${node.name})`);
    console.log(`     Depende de: ${node.depends.join(', ') || 'ninguno'}\n`);
  });

} else {
  console.log('✅ No se detectaron dependencias circulares\n');
}

// Mostrar módulos sin dependencias (candidatos a Tier 1)
console.log('\n📦 MÓDULOS SIN DEPENDENCIAS (Tier 1 Foundation):\n');
Array.from(graph.entries())
  .filter(([_, node]) => node.depends.length === 0)
  .sort((a, b) => a[0].localeCompare(b[0]))
  .forEach(([moduleId, node]) => {
    console.log(`   ✓ ${moduleId} - ${node.name}`);
  });

// Verificar dependencias no resueltas
console.log('\n\n⚠️  DEPENDENCIAS NO RESUELTAS:\n');
let unresolvedCount = 0;
Array.from(graph.entries()).forEach(([moduleId, node]) => {
  const unresolved = node.depends.filter(depId => !graph.has(depId));
  if (unresolved.length > 0) {
    console.log(`   🔴 ${moduleId} depende de módulos no encontrados:`);
    unresolved.forEach(dep => console.log(`      - ${dep}`));
    unresolvedCount += unresolved.length;
  }
});

if (unresolvedCount === 0) {
  console.log('   ✅ Todas las dependencias están resueltas');
}

console.log('\n\n✨ Análisis completado\n');

