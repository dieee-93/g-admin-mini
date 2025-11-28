#!/usr/bin/env node
/**
 * Script para agregar displayName a componentes memoizados
 * Mejora la identificación de componentes en React DevTools y React Scan
 *
 * Uso: node scripts/add-display-names.mjs
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.join(__dirname, '..');

// Directorios a procesar
const dirsToProcess = [
  'src/pages',
  'src/shared/ui',
  'src/modules',
  'src/components'
];

let filesProcessed = 0;
let componentsFound = 0;
let displayNamesAdded = 0;

/**
 * Detecta componentes memoizados sin displayName
 */
function findMemoComponentsWithoutDisplayName(content) {
  const matches = [];

  // Pattern 1: export const Component = memo(function Component...
  const pattern1 = /export const (\w+) = memo\(function \1/g;
  let match;

  while ((match = pattern1.exec(content)) !== null) {
    const componentName = match[1];
    // Check if displayName already exists
    const hasDisplayName = new RegExp(`${componentName}\\.displayName\\s*=`).test(content);

    if (!hasDisplayName) {
      matches.push({
        name: componentName,
        type: 'named-export-memo'
      });
    }
  }

  // Pattern 2: const Component = memo(({ ... }) => ...
  const pattern2 = /(?:export )?const (\w+) = memo\(\s*\(\s*\{[^}]*\}\s*\)\s*=>/g;

  while ((match = pattern2.exec(content)) !== null) {
    const componentName = match[1];
    const hasDisplayName = new RegExp(`${componentName}\\.displayName\\s*=`).test(content);

    if (!hasDisplayName) {
      matches.push({
        name: componentName,
        type: 'arrow-function-memo'
      });
    }
  }

  return matches;
}

/**
 * Agrega displayName después de la declaración del componente
 */
function addDisplayName(content, componentName) {
  // Buscar la línea donde termina la declaración del componente
  const regex = new RegExp(
    `(export const ${componentName} = memo\\([^;]+\\);)`,
    'g'
  );

  const replacement = `$1\n${componentName}.displayName = '${componentName}';`;

  return content.replace(regex, replacement);
}

/**
 * Procesa un archivo
 */
function processFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const components = findMemoComponentsWithoutDisplayName(content);

  if (components.length === 0) {
    return;
  }

  componentsFound += components.length;

  let newContent = content;

  for (const component of components) {
    console.log(`  ✨ Adding displayName to: ${component.name}`);
    newContent = addDisplayName(newContent, component.name);
    displayNamesAdded++;
  }

  // Solo escribir si hay cambios
  if (newContent !== content) {
    fs.writeFileSync(filePath, newContent, 'utf-8');
  }
}

/**
 * Procesa un directorio recursivamente
 */
function processDirectory(dir) {
  if (!fs.existsSync(dir)) {
    return;
  }

  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      // Skip node_modules, .git, etc.
      if (!entry.name.startsWith('.') && entry.name !== 'node_modules') {
        processDirectory(fullPath);
      }
    } else if (entry.isFile() && /\.(tsx|jsx)$/.test(entry.name)) {
      console.log(`📄 Processing: ${fullPath.replace(rootDir, '')}`);
      processFile(fullPath);
      filesProcessed++;
    }
  }
}

console.log('🚀 Starting displayName addition...\n');

for (const dir of dirsToProcess) {
  const fullPath = path.join(rootDir, dir);
  console.log(`\n📁 Processing directory: ${dir}`);
  processDirectory(fullPath);
}

console.log('\n✅ Done!');
console.log(`📊 Stats:
  - Files processed: ${filesProcessed}
  - Components found: ${componentsFound}
  - displayNames added: ${displayNamesAdded}
`);

if (displayNamesAdded > 0) {
  console.log('💡 Run your dev server and check React DevTools/Scan for improved component names!');
}
