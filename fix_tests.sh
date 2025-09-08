#!/bin/bash

# fix_tests.sh - Script para arreglar tests fallando sistemáticamente

echo "🔧 ARREGLANDO TESTS DE G-ADMIN MINI..."
echo "====================================="

# 1. Fix React Testing act() warnings en hooks
echo "1️⃣ Arreglando warnings de act() en hooks..."

# Lista de archivos con problemas de act()
files_with_act_issues=(
  "src/hooks/__tests__/useStaffData.test.ts"
  "src/hooks/__tests__/useStaffStats.test.ts" 
  "src/hooks/__tests__/useMaterialsData.test.ts"
  "src/hooks/__tests__/useCustomerAnalytics.test.ts"
)

for file in "${files_with_act_issues[@]}"; do
  if [ -f "$file" ]; then
    echo "   Arreglando: $file"
    
    # Add act import if missing
    if ! grep -q "act" "$file"; then
      sed -i 's/import { renderHook, waitFor }/import { renderHook, waitFor, act }/' "$file"
    fi
    
    # Wrap async hook calls with act()
    sed -i 's/await result\.current\./await act(async () => { return result.current./' "$file"
    sed -i 's/);$/; });/' "$file"
    
    echo "   ✅ $file arreglado"
  else
    echo "   ⚠️ No encontrado: $file"
  fi
done

# 2. Fix module imports missing
echo "2️⃣ Arreglando imports de módulos faltantes..."

# Fix missing imports in test files  
test_files=(
  "src/lib/performance/__tests__/codeSplitting.test.tsx"
  "src/lib/utils/__tests__/helpers.test.ts"
  "src/services/__tests__/apiService.test.ts"
)

for file in "${test_files[@]}"; do
  if [ -f "$file" ]; then
    echo "   Arreglando imports: $file"
    
    # Add missing vitest imports
    if ! grep -q "vi, beforeEach" "$file"; then
      sed -i '1i import { describe, it, expect, vi, beforeEach } from "vitest";' "$file"
    fi
    
    echo "   ✅ $file imports arreglados"
  fi
done

# 3. Fix mock configurations
echo "3️⃣ Arreglando configuraciones de mocks..."

# Create setupTests helper if missing
if [ ! -f "src/test-utils/setupTests.ts" ]; then
  echo "   Creando setupTests.ts..."
  mkdir -p src/test-utils
  
  cat > src/test-utils/setupTests.ts << 'EOF'
// setupTests.ts - Configuración global de tests
import { vi } from 'vitest';
import { cleanup } from '@testing-library/react';
import { afterEach, beforeEach } from 'vitest';

// Cleanup después de cada test
afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

// Mock global de Supabase
vi.mock('@/lib/supabase/client', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          data: [],
          error: null
        }))
      })),
      insert: vi.fn(() => ({ data: null, error: null })),
      update: vi.fn(() => ({ data: null, error: null })),
      delete: vi.fn(() => ({ data: null, error: null }))
    }))
  }
}));

// Mock de notify
vi.mock('@/lib/notifications', () => ({
  notify: {
    success: vi.fn(),
    error: vi.fn(),
    warning: vi.fn(),
    info: vi.fn()
  }
}));
EOF
  
  echo "   ✅ setupTests.ts creado"
fi

# 4. Update vitest config to use setupTests
echo "4️⃣ Actualizando configuración de vitest..."

if [ -f "vitest.config.ts" ]; then
  if ! grep -q "setupFiles" vitest.config.ts; then
    sed -i '/test: {/a\    setupFiles: ["src/test-utils/setupTests.ts"],' vitest.config.ts
    echo "   ✅ vitest.config.ts actualizado"
  fi
fi

# 5. Run tests para verificar mejoras
echo "5️⃣ Corriendo tests para verificar mejoras..."
npm run test:run --silent 2>&1 | grep -E "(passed|failed|Test Files)" | tail -5

echo ""
echo "🎉 SCRIPT DE ARREGLO COMPLETADO"
echo "Revisa los resultados y ejecuta tests individuales para debugging."