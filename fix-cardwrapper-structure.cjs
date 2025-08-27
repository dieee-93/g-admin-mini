// Script para arreglar la estructura incorrecta de CardWrapper
const fs = require('fs');
const path = require('path');

function fixCardWrapperStructure(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let updated = false;
    
    // Skip if file doesn't contain CardWrapper
    if (!content.includes('CardWrapper')) {
      return false;
    }
    
    // Pattern 1: Fix nested CardWrapper after variant="elevated" to use .Header
    // Look for: <CardWrapper variant="elevated"><CardWrapper>
    const pattern1 = /<CardWrapper\s+variant="elevated"[^>]*>\s*<CardWrapper>/g;
    if (pattern1.test(content)) {
      content = content.replace(pattern1, (match) => {
        const beforeWrapper = match.replace(/<CardWrapper>$/, '');
        return beforeWrapper + '<CardWrapper.Header>';
      });
      updated = true;
    }
    
    // Pattern 2: Fix </CardWrapper><CardWrapper> to </CardWrapper.Header><CardWrapper.Body>
    content = content.replace(/(<\/CardWrapper>)\s*(<CardWrapper>)/g, (match, p1, p2) => {
      // Check if this is inside a CardWrapper structure
      if (match.includes('</CardWrapper>') && match.includes('<CardWrapper>')) {
        updated = true;
        return '</CardWrapper.Header>\n            <CardWrapper.Body>';
      }
      return match;
    });
    
    // Pattern 3: Fix </CardWrapper></CardWrapper> at end to </CardWrapper.Body></CardWrapper>
    content = content.replace(/(<\/CardWrapper>)\s*(<\/CardWrapper>)(?!\s*<\/)/g, (match, p1, p2) => {
      updated = true;
      return '</CardWrapper.Body>\n        </CardWrapper>';
    });
    
    // Pattern 4: Handle Card vs CardWrapper mixed usage
    content = content.replace(/<Card([^>]*?)>/g, '<CardWrapper$1>');
    content = content.replace(/<\/Card>/g, '</CardWrapper>');
    
    if (updated) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✅ Fixed: ${filePath}`);
      return true;
    }
    
    return false;
  } catch (err) {
    console.error(`❌ Error fixing ${filePath}:`, err.message);
    return false;
  }
}

// Files with known issues
const filesToFix = [
  'src/pages/admin/settings/reporting.tsx',
  'src/pages/admin/settings/integrations.tsx',
  'src/pages/admin/settings/enterprise.tsx',
  'src/pages/admin/settings/diagnostics.tsx',
  'src/pages/admin/settings/components/sections/BusinessProfileSection.tsx',
  'src/pages/admin/settings/components/sections/IntegrationsSection.tsx',
  'src/pages/admin/settings/components/sections/UserPermissionsSection.tsx',
  'src/pages/admin/settings/components/sections/EnterpriseSection.tsx',
  'src/pages/admin/settings/components/sections/EnterpriseSection.new.tsx',
  'src/pages/admin/settings/components/sections/TaxConfigurationSection.tsx',
  'src/pages/admin/materials/procurement.tsx',
  'src/pages/admin/materials/supply-chain.tsx',
  'src/pages/admin/materials/page.tsx',
  'src/pages/admin/sales/page.tsx'
];

let totalFixed = 0;
filesToFix.forEach(file => {
  const fullPath = path.join(__dirname, file);
  if (fs.existsSync(fullPath)) {
    if (fixCardWrapperStructure(fullPath)) {
      totalFixed++;
    }
  } else {
    console.log(`⚠️  File not found: ${file}`);
  }
});

console.log(`\n🎉 Fixed ${totalFixed} files with CardWrapper structure issues!`);