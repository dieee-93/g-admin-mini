const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// ============================================
// CONFIGURATION
// ============================================

const EXCLUDE_PATTERNS = [
  '__tests__/',
  '__test__/',
  '.test.ts',
  '.test.tsx',
  'debug-',
  'test-',
  '/test/',
  'TestUtils',
  'testUtils',
  'EventBus.ts', // Ya limpiado
  'OfflineSync.ts', // Ya limpiado
  'NavigationContext.tsx', // Ya limpiado parcialmente
  'taxCalculationService.ts', // Ya limpiado en test
  'CreateAdminUserForm.tsx', // Ya limpiado en test
  'useDashboardStats.ts', // Ya limpiado en test
];

const MODULE_MAP = {
  // Core systems
  'lib/websocket': 'WebSocket',
  'lib/offline': 'OfflineSync',
  'lib/events': 'EventBus',
  'lib/achievements': 'CapabilitySystem',
  'lib/ml': 'Performance',
  'lib/routing': 'NavigationContext',
  'lib/performance': 'Performance',

  // Contexts
  'contexts/AuthContext': 'AuthContext',
  'contexts/NavigationContext': 'NavigationContext',

  // Business logic
  'business-logic/fiscal': 'API',
  'business-logic/inventory': 'MaterialsStore',
  'business-logic/recipes': 'MaterialsStore',

  // Services
  'services/staff': 'StaffStore',

  // Pages/Features
  'pages/admin/gamification/achievements': 'CapabilitySystem',
  'pages/admin/finance/fiscal': 'API',
  'pages/admin/resources/scheduling': 'API',
  'pages/admin/resources/staff': 'StaffStore',
  'pages/admin/operations/sales': 'SalesStore',
  'pages/admin/supply-chain/materials': 'MaterialsStore',

  // Shared
  'shared/events': 'EventBus',

  // Default
  'default': 'App'
};

// ============================================
// FILE DISCOVERY (usando Node.js en vez de rg)
// ============================================

function findFilesWithConsoleLogs(dir) {
  const files = [];

  function walk(currentPath) {
    const entries = fs.readdirSync(currentPath, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(currentPath, entry.name);

      if (entry.isDirectory()) {
        // Skip node_modules, dist, etc.
        if (entry.name === 'node_modules' || entry.name === 'dist' || entry.name === 'build') {
          continue;
        }
        walk(fullPath);
      } else if (entry.isFile()) {
        // Solo archivos TypeScript/JavaScript
        if (entry.name.match(/\.(ts|tsx|js|jsx)$/)) {
          // Leer archivo y verificar si tiene console.logs
          try {
            const content = fs.readFileSync(fullPath, 'utf8');
            if (content.match(/console\.(log|warn|info|error)/)) {
              // Convertir a path relativo
              const relativePath = path.relative(__dirname, fullPath).replace(/\\/g, '/');
              files.push(relativePath);
            }
          } catch (err) {
            // Ignorar archivos que no se puedan leer
          }
        }
      }
    }
  }

  walk(dir);
  return files;
}

// ============================================
// UTILITIES
// ============================================

function shouldExclude(filePath) {
  return EXCLUDE_PATTERNS.some(pattern => filePath.includes(pattern));
}

function inferModule(filePath) {
  const normalized = filePath.replace(/\\/g, '/');

  for (const [pattern, module] of Object.entries(MODULE_MAP)) {
    if (normalized.includes(pattern)) {
      return module;
    }
  }

  return 'App';
}

function inferLogLevel(logLine) {
  const lowerLine = logLine.toLowerCase();

  // Error patterns
  if (lowerLine.includes('error') ||
      lowerLine.includes('failed') ||
      lowerLine.includes('fail:') ||
      lowerLine.includes('exception') ||
      logLine.includes('console.error')) {
    return 'error';
  }

  // Warning patterns
  if (lowerLine.includes('warn') ||
      lowerLine.includes('warning') ||
      lowerLine.includes('deprecated') ||
      logLine.includes('console.warn')) {
    return 'warn';
  }

  // Debug patterns (detailed/technical)
  if (lowerLine.includes('debug') ||
      lowerLine.includes('trace') ||
      lowerLine.includes('processing') ||
      lowerLine.includes('checking') ||
      lowerLine.includes('validating') ||
      lowerLine.includes('calculating')) {
    return 'debug';
  }

  // Default to info
  return 'info';
}

function extractMessageAndData(consoleCall) {
  // Match: console.log('message', data) or console.log(`message ${var}`, data)
  const match = consoleCall.match(/console\.(log|warn|info|error)\((.*)\)/s);

  if (!match) return null;

  const args = match[2];

  // Try to split by comma, but respect string boundaries
  let parts = [];
  let current = '';
  let inString = false;
  let stringChar = null;
  let depth = 0;

  for (let i = 0; i < args.length; i++) {
    const char = args[i];
    const prevChar = i > 0 ? args[i-1] : '';

    if ((char === '"' || char === "'" || char === '`') && prevChar !== '\\') {
      if (!inString) {
        inString = true;
        stringChar = char;
      } else if (char === stringChar) {
        inString = false;
        stringChar = null;
      }
    }

    if (char === '(' || char === '{' || char === '[') depth++;
    if (char === ')' || char === '}' || char === ']') depth--;

    if (char === ',' && !inString && depth === 0) {
      parts.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }

  if (current.trim()) {
    parts.push(current.trim());
  }

  const message = parts[0] || "''";
  const data = parts.slice(1).join(', ');

  return { message, data };
}

function replaceConsoleLogs(filePath, module) {
  let content = fs.readFileSync(filePath, 'utf8');
  const originalContent = content;

  // Check if logger is already imported
  const hasLoggerImport = content.includes("from '@/lib/logging'");

  if (!hasLoggerImport) {
    // Find the last import statement
    const importRegex = /^import\s+.*?from\s+['"].*?['"];?\s*$/gm;
    const imports = content.match(importRegex);

    if (imports && imports.length > 0) {
      const lastImport = imports[imports.length - 1];
      const lastImportIndex = content.lastIndexOf(lastImport);
      const insertPosition = lastImportIndex + lastImport.length;

      content = content.slice(0, insertPosition) +
                "\nimport { logger } from '@/lib/logging';" +
                content.slice(insertPosition);
    } else {
      // No imports found, add at the beginning after comments/blank lines
      const lines = content.split('\n');
      let insertIndex = 0;

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        if (line && !line.startsWith('//') && !line.startsWith('/*') && !line.startsWith('*')) {
          insertIndex = i;
          break;
        }
      }

      lines.splice(insertIndex, 0, "import { logger } from '@/lib/logging';", '');
      content = lines.join('\n');
    }
  }

  let replacements = 0;

  // Replace console.log/warn/info/error calls
  // Match multiline console calls
  const consoleRegex = /console\.(log|warn|info|error)\(([\s\S]*?)\);/g;

  content = content.replace(consoleRegex, (match, method, args) => {
    const fullLine = match;
    const level = inferLogLevel(fullLine);

    const parsed = extractMessageAndData(match);
    if (!parsed) {
      console.warn(`⚠️  Could not parse: ${match.substring(0, 50)}...`);
      return match; // Keep original if can't parse
    }

    const { message, data } = parsed;

    replacements++;

    if (data) {
      return `logger.${level}('${module}', ${message}, ${data});`;
    } else {
      return `logger.${level}('${module}', ${message});`;
    }
  });

  // Only write if changes were made
  if (content !== originalContent) {
    fs.writeFileSync(filePath, content, 'utf8');
    return replacements;
  }

  return 0;
}

// ============================================
// MAIN
// ============================================

function main() {
  console.log('🔍 Finding files with console.logs...\n');

  // Get all files with console logs usando Node.js
  const srcPath = path.join(__dirname, 'src');
  const allFiles = findFilesWithConsoleLogs(srcPath);

  // Filter out excluded files
  const filesToProcess = allFiles.filter(file => !shouldExclude(file));

  console.log(`📊 Found ${allFiles.length} files with console.logs`);
  console.log(`✅ Processing ${filesToProcess.length} files (excluded ${allFiles.length - filesToProcess.length} test/debug files)\n`);

  const stats = {
    filesProcessed: 0,
    filesModified: 0,
    totalReplacements: 0,
    byModule: {},
  };

  // Process each file
  for (const file of filesToProcess) {
    const fullPath = path.join(__dirname, file);
    const module = inferModule(file);

    stats.filesProcessed++;

    try {
      const replacements = replaceConsoleLogs(fullPath, module);

      if (replacements > 0) {
        stats.filesModified++;
        stats.totalReplacements += replacements;
        stats.byModule[module] = (stats.byModule[module] || 0) + replacements;

        console.log(`✓ ${file}`);
        console.log(`  └─ ${replacements} replacements (module: ${module})`);
      }
    } catch (error) {
      console.error(`✗ ${file}`);
      console.error(`  └─ Error: ${error.message}`);
    }
  }

  // Final report
  console.log('\n' + '='.repeat(60));
  console.log('📋 FINAL REPORT');
  console.log('='.repeat(60));
  console.log(`Files processed: ${stats.filesProcessed}`);
  console.log(`Files modified: ${stats.filesModified}`);
  console.log(`Total replacements: ${stats.totalReplacements}`);
  console.log('\nReplacements by module:');

  for (const [module, count] of Object.entries(stats.byModule).sort((a, b) => b[1] - a[1])) {
    console.log(`  ${module}: ${count}`);
  }

  console.log('\n✅ Mass replacement completed!');
  console.log('\n🔧 Running TypeScript check...');

  try {
    execSync('pnpm -s exec tsc --noEmit', {
      encoding: 'utf8',
      cwd: __dirname,
      stdio: 'inherit'
    });
    console.log('✅ TypeScript check passed!');
  } catch (error) {
    console.error('❌ TypeScript check failed - review changes');
    process.exit(1);
  }
}

main();
