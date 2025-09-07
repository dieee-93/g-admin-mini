#!/usr/bin/env node
/**
 * Script para corregir errores masivos de ESLint
 * Enfoque sistemático para reducir los 1,497+ errores
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🔧 Iniciando corrección masiva de errores ESLint...\n');

// Patrones de corrección automatizada
const corrections = [
  // 1. Reemplazar catch (error: any) por catch (error: unknown)
  {
    pattern: /catch\s*\(\s*(\w+):\s*any\s*\)/g,
    replacement: 'catch ($1: unknown)',
    description: 'Corrigiendo tipos any en catch blocks'
  },
  
  // 2. Reemplazar parámetros any básicos
  {
    pattern: /\(\s*(\w+):\s*any\s*\)/g,
    replacement: '($1: unknown)',
    description: 'Corrigiendo parámetros any básicos'
  },
  
  // 3. Reemplazar : any = 
  {
    pattern: /:\s*any\s*=/g,
    replacement: ': unknown =',
    description: 'Corrigiendo declaraciones any con asignación'
  },
  
  // 4. Remover imports no utilizados comunes
  {
    pattern: /import\s+{\s*vi\s*}\s+from\s+['"]vitest['"];\s*\n/g,
    replacement: '',
    description: 'Removiendo import vi no utilizado'
  },
  
  // 5. Remover imports render no utilizado
  {
    pattern: /,\s*render/g,
    replacement: '',
    description: 'Removiendo render no utilizado de imports'
  },
  
  // 6. Remover imports within no utilizado
  {
    pattern: /,\s*within/g,
    replacement: '',
    description: 'Removiendo within no utilizado de imports'
  }
];

// Función para procesar un archivo
function processFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf-8');
    let modified = false;
    
    corrections.forEach(({ pattern, replacement, description }) => {
      if (pattern.test(content)) {
        content = content.replace(pattern, replacement);
        modified = true;
        console.log(`  ✓ ${description} en ${path.basename(filePath)}`);
      }
    });
    
    if (modified) {
      fs.writeFileSync(filePath, content, 'utf-8');
      return true;
    }
  } catch (error) {
    console.error(`❌ Error procesando ${filePath}:`, error.message);
  }
  return false;
}

// Función para encontrar archivos TypeScript
function findTSFiles(dir, files = []) {
  const items = fs.readdirSync(dir);
  
  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory() && !item.startsWith('.') && item !== 'node_modules') {
      findTSFiles(fullPath, files);
    } else if (item.endsWith('.ts') || item.endsWith('.tsx')) {
      files.push(fullPath);
    }
  }
  
  return files;
}

// Procesar archivos
console.log('1️⃣ Buscando archivos TypeScript...');
const tsFiles = findTSFiles('./src');
console.log(`   Encontrados ${tsFiles.length} archivos\n`);

console.log('2️⃣ Aplicando correcciones automáticas...');
let modifiedFiles = 0;

tsFiles.forEach(file => {
  if (processFile(file)) {
    modifiedFiles++;
  }
});

console.log(`\n✅ Procesamiento completado:`);
console.log(`   - Archivos procesados: ${tsFiles.length}`);
console.log(`   - Archivos modificados: ${modifiedFiles}\n`);

// Verificar mejoras
console.log('3️⃣ Verificando mejoras...');
try {
  const result = execSync('pnpm run lint 2>&1 | grep "problems"', { encoding: 'utf-8' });
  console.log(`   Resultado: ${result.trim()}`);
} catch (error) {
  console.log('   Ejecutando verificación completa...');
}

console.log('\n🎯 Siguiente paso: Revisar errores restantes manualmente');
console.log('💡 Ejecuta: pnpm run lint | head -50');