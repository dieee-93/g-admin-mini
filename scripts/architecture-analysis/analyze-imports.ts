/**
 * Import Anti-Pattern Analyzer
 * 
 * Detecta automáticamente:
 * - Imports directos de Chakra UI (debería usar @/shared/ui)
 * - Imports directos entre módulos (tight coupling)
 * - Server data en Zustand stores (debería usar TanStack Query)
 * 
 * Usage: npx tsx scripts/architecture-analysis/analyze-imports.ts
 */

import fs from 'fs';
import path from 'path';

interface Issue {
  type: 'DIRECT_CHAKRA_IMPORT' | 'TIGHT_COUPLING' | 'SERVER_DATA_IN_STORE';
  file: string;
  line?: number;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  message: string;
  pattern?: string;
}

// Patrones anti-pattern a detectar
const ANTI_PATTERNS = {
  directChakra: /from\s+['"]@chakra-ui\/react['"]/g,
  directModuleImport: /from\s+['"]@\/modules\/[\w-]+\/(?:api|services|utils|handlers)['"]/g,
  serverDataInStore: /^\s*(materials|suppliers|sales|customers|staff|products):\s*\w+\[\]/gm,
};

// Exclusiones (archivos que pueden tener excepciones válidas)
const EXCLUSIONS = {
  directChakra: [
    'src/shared/ui/index.ts',
    'src/components/ui/provider.tsx',
  ],
  directModuleImport: [
    'src/modules/index.ts',
  ],
};

function getAllFiles(dir: string, ext: string[] = ['.ts', '.tsx'], files: string[] = []): string[] {
  try {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      
      if (entry.isDirectory()) {
        // Skip node_modules, dist, build, etc.
        if (!['node_modules', 'dist', 'build', '.next', '.git'].includes(entry.name)) {
          getAllFiles(fullPath, ext, files);
        }
      } else if (entry.isFile()) {
        const fileExt = path.extname(entry.name);
        if (ext.includes(fileExt) && !entry.name.includes('.test.') && !entry.name.includes('.spec.')) {
          files.push(fullPath);
        }
      }
    }
  } catch (err) {
    // Skip directories we can't read
  }
  
  return files;
}

function analyzeFile(filePath: string): Issue[] {
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');
  const issues: Issue[] = [];
  
  // Check for direct Chakra imports
  if (!EXCLUSIONS.directChakra.some(exc => filePath.includes(exc.replace(/\//g, path.sep)))) {
    let match;
    ANTI_PATTERNS.directChakra.lastIndex = 0;
    while ((match = ANTI_PATTERNS.directChakra.exec(content)) !== null) {
      const lineNumber = content.substring(0, match.index).split('\n').length;
      issues.push({
        type: 'DIRECT_CHAKRA_IMPORT',
        file: filePath,
        line: lineNumber,
        severity: 'HIGH',
        message: 'Direct Chakra import found. Use @/shared/ui instead.',
        pattern: match[0],
      });
    }
  }
  
  // Check for direct module imports (tight coupling)
  if (!EXCLUSIONS.directModuleImport.some(exc => filePath.includes(exc.replace(/\//g, path.sep)))) {
    let match;
    ANTI_PATTERNS.directModuleImport.lastIndex = 0;
    while ((match = ANTI_PATTERNS.directModuleImport.exec(content)) !== null) {
      const lineNumber = content.substring(0, match.index).split('\n').length;
      issues.push({
        type: 'TIGHT_COUPLING',
        file: filePath,
        line: lineNumber,
        severity: 'MEDIUM',
        message: 'Direct module import found. Consider using ModuleRegistry.getExports().',
        pattern: match[0],
      });
    }
  }
  
  // Check for server data in Zustand stores
  if (filePath.includes('Store.ts') || filePath.includes('store.ts') || filePath.includes('store' + path.sep)) {
    let match;
    ANTI_PATTERNS.serverDataInStore.lastIndex = 0;
    while ((match = ANTI_PATTERNS.serverDataInStore.exec(content)) !== null) {
      const lineNumber = content.substring(0, match.index).split('\n').length;
      
      // Verificar que no esté comentado
      const lineContent = lines[lineNumber - 1];
      if (lineContent && !lineContent.trim().startsWith('//')) {
        issues.push({
          type: 'SERVER_DATA_IN_STORE',
          file: filePath,
          line: lineNumber,
          severity: 'CRITICAL',
          message: 'Potential server data in Zustand store. Use TanStack Query instead.',
          pattern: match[0].trim(),
        });
      }
    }
  }
  
  return issues;
}

function analyzeImports() {
  console.log('🔍 Analyzing imports across codebase...\n');
  
  const srcDir = path.join(process.cwd(), 'src');
  const files = getAllFiles(srcDir, ['.ts', '.tsx']);
  
  const allIssues: Issue[] = [];
  
  for (const file of files) {
    const issues = analyzeFile(file);
    allIssues.push(...issues);
  }
  
  // Generate report
  console.log('📊 IMPORT ANALYSIS REPORT');
  console.log('═'.repeat(80));
  console.log(`Files analyzed: ${files.length}`);
  console.log(`Issues found: ${allIssues.length}\n`);
  
  // Group by severity
  const bySeverity = {
    CRITICAL: allIssues.filter(i => i.severity === 'CRITICAL'),
    HIGH: allIssues.filter(i => i.severity === 'HIGH'),
    MEDIUM: allIssues.filter(i => i.severity === 'MEDIUM'),
    LOW: allIssues.filter(i => i.severity === 'LOW'),
  };
  
  console.log('Severity Breakdown:');
  console.log(`  🔴 CRITICAL: ${bySeverity.CRITICAL.length}`);
  console.log(`  🟠 HIGH:     ${bySeverity.HIGH.length}`);
  console.log(`  🟡 MEDIUM:   ${bySeverity.MEDIUM.length}`);
  console.log(`  🟢 LOW:      ${bySeverity.LOW.length}\n`);
  
  // Group by type
  const byType = {
    DIRECT_CHAKRA_IMPORT: allIssues.filter(i => i.type === 'DIRECT_CHAKRA_IMPORT'),
    TIGHT_COUPLING: allIssues.filter(i => i.type === 'TIGHT_COUPLING'),
    SERVER_DATA_IN_STORE: allIssues.filter(i => i.type === 'SERVER_DATA_IN_STORE'),
  };
  
  console.log('Issue Types:');
  console.log(`  📦 Direct Chakra Imports:   ${byType.DIRECT_CHAKRA_IMPORT.length}`);
  console.log(`  🔗 Tight Coupling:          ${byType.TIGHT_COUPLING.length}`);
  console.log(`  💾 Server Data in Store:    ${byType.SERVER_DATA_IN_STORE.length}\n`);
  
  // Detailed issues
  if (bySeverity.CRITICAL.length > 0) {
    console.log('🔴 CRITICAL ISSUES:');
    console.log('─'.repeat(80));
    bySeverity.CRITICAL.slice(0, 10).forEach(issue => {
      const relPath = path.relative(process.cwd(), issue.file);
      console.log(`  ${relPath}:${issue.line}`);
      console.log(`  └─ ${issue.message}`);
      console.log(`     Pattern: ${issue.pattern}\n`);
    });
    if (bySeverity.CRITICAL.length > 10) {
      console.log(`  ... and ${bySeverity.CRITICAL.length - 10} more critical issues\n`);
    }
  }
  
  if (bySeverity.HIGH.length > 0) {
    console.log('🟠 HIGH PRIORITY ISSUES:');
    console.log('─'.repeat(80));
    const uniqueFiles = [...new Set(bySeverity.HIGH.map(i => i.file))];
    uniqueFiles.slice(0, 10).forEach(file => {
      const relPath = path.relative(process.cwd(), file);
      const count = bySeverity.HIGH.filter(i => i.file === file).length;
      console.log(`  ${relPath} (${count} issue${count > 1 ? 's' : ''})`);
    });
    if (uniqueFiles.length > 10) {
      console.log(`  ... and ${uniqueFiles.length - 10} more files\n`);
    } else {
      console.log('');
    }
  }
  
  if (bySeverity.MEDIUM.length > 0) {
    console.log('🟡 MEDIUM PRIORITY ISSUES:');
    console.log('─'.repeat(80));
    const uniqueFiles = [...new Set(bySeverity.MEDIUM.map(i => i.file))];
    console.log(`  ${uniqueFiles.length} files with tight coupling issues\n`);
  }
  
  // Save JSON report
  const reportPath = path.join(process.cwd(), 'scripts', 'architecture-analysis', 'reports', 'import-analysis.json');
  fs.mkdirSync(path.dirname(reportPath), { recursive: true });
  fs.writeFileSync(reportPath, JSON.stringify({
    timestamp: new Date().toISOString(),
    summary: {
      filesAnalyzed: files.length,
      totalIssues: allIssues.length,
      bySeverity: {
        CRITICAL: bySeverity.CRITICAL.length,
        HIGH: bySeverity.HIGH.length,
        MEDIUM: bySeverity.MEDIUM.length,
        LOW: bySeverity.LOW.length,
      },
      byType: {
        DIRECT_CHAKRA_IMPORT: byType.DIRECT_CHAKRA_IMPORT.length,
        TIGHT_COUPLING: byType.TIGHT_COUPLING.length,
        SERVER_DATA_IN_STORE: byType.SERVER_DATA_IN_STORE.length,
      },
    },
    issues: allIssues.map(i => ({
      ...i,
      file: path.relative(process.cwd(), i.file),
    })),
  }, null, 2));
  
  console.log(`📄 Full report saved to: ${path.relative(process.cwd(), reportPath)}`);
  console.log('═'.repeat(80));
  
  return allIssues;
}

// Execute
analyzeImports();

export { analyzeImports, Issue };
