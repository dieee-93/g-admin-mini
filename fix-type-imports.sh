#!/bin/bash

# Script para corregir imports de tipos según verbatimModuleSyntax
# Approach híbrido: automatizar casos simples, dejar casos complejos

set -e  # Exit on error

echo "🔧 Fixing type-only imports..."

# Función para procesar un archivo
fix_file() {
    local file="$1"
    local backup="${file}.backup"

    # Crear backup
    cp "$file" "$backup"

    # Patrón 1: Un solo tipo importado
    # import { Type } from 'module' -> import type { Type } from 'module'
    perl -i -pe 's/^import \{ ([A-Z][a-zA-Z0-9_]*) \} from/import type { $1 } from/' "$file"

    # Patrón 2: Múltiples tipos (todos empiezan con mayúscula)
    # import { TypeA, TypeB, TypeC } from 'module' -> import type { TypeA, TypeB, TypeC } from 'module'
    perl -i -pe 's/^import \{ ([A-Z][a-zA-Z0-9_]+(, [A-Z][a-zA-Z0-9_]+)*) \} from/import type { $1 } from/' "$file"

    # Verificar si hubo cambios
    if ! diff -q "$file" "$backup" > /dev/null 2>&1; then
        echo "  ✓ Fixed: $file"
        rm "$backup"
        return 0
    else
        # No hubo cambios, restaurar
        mv "$backup" "$file"
        return 1
    fi
}

# Archivos del sistema de calendario (mayor concentración de errores)
echo ""
echo "📅 Processing calendar system files..."
calendar_files=(
    "src/shared/calendar/engine/UnifiedCalendarEngine.ts"
    "src/shared/calendar/adapters/BaseCalendarAdapter.ts"
    "src/shared/calendar/hooks/useBookingManagement.ts"
    "src/shared/calendar/utils/dateTimeUtils.ts"
    "src/shared/calendar/hooks/useCalendarConfig.ts"
    "src/shared/calendar/hooks/useCalendarEngine.ts"
    "src/shared/calendar/components/CalendarGrid.tsx"
    "src/shared/calendar/hooks/useCalendarAdapter.ts"
    "src/shared/calendar/components/CalendarSidebar.tsx"
)

fixed_count=0
for file in "${calendar_files[@]}"; do
    if [ -f "$file" ]; then
        if fix_file "$file"; then
            ((fixed_count++))
        fi
    else
        echo "  ⚠ Not found: $file"
    fi
done

echo ""
echo "✨ Calendar system: Fixed $fixed_count files"

# Archivos simples de pages/ (un solo tipo)
echo ""
echo "📄 Processing simple pages/ files..."
simple_files=(
    "src/pages/admin/core/crm/customers/hooks/existing/useCustomerNotes.ts"
    "src/pages/admin/core/intelligence/components/CompetitorsTable.tsx"
    "src/pages/admin/core/intelligence/components/MarketTrendsPanel.tsx"
    "src/pages/admin/core/intelligence/components/PricingAnalysisPanel.tsx"
    "src/pages/admin/operations/sales/components/Analytics/SalesPerformanceInsights/data/index.ts"
    "src/pages/admin/operations/sales/components/QROrdering/QRCodeGenerator.tsx"
    "src/pages/admin/supply-chain/materials/components/MaterialsCharts/ChartCard.tsx"
    "src/pages/setup/layout/SetupHeader.tsx"
)

fixed_simple=0
for file in "${simple_files[@]}"; do
    if [ -f "$file" ]; then
        if fix_file "$file"; then
            ((fixed_simple++))
        fi
    fi
done

echo ""
echo "✨ Simple files: Fixed $fixed_simple files"

# Archivos shared/ adicionales
echo ""
echo "🔧 Processing shared/ utility files..."
shared_files=(
    "src/shared/ui/Modal.tsx"
    "src/shared/hooks/business/useFormManager.ts"
    "src/shared/factories/ModuleFactory.ts"
    "src/shared/alerts/components/AlertBadge.tsx"
    "src/shared/alerts/AlertsProvider.tsx"
)

fixed_shared=0
for file in "${shared_files[@]}"; do
    if [ -f "$file" ]; then
        if fix_file "$file"; then
            ((fixed_shared++))
        fi
    fi
done

echo ""
echo "✨ Shared files: Fixed $fixed_shared files"

total_fixed=$((fixed_count + fixed_simple + fixed_shared))
echo ""
echo "================================================"
echo "✅ Total files fixed: $total_fixed"
echo "================================================"
echo ""
echo "⚠️  MANUAL REVIEW REQUIRED for complex imports:"
echo "  - Files with mixed value/type imports"
echo "  - Files in tableApi.ts (6 types)"
echo "  - Files in ModernPaymentProcessor.tsx (2 types)"
echo "  - Files in useCustomerRFM.ts (2 types)"
echo "  - Files in useCustomerTags.ts (2 types)"
echo ""
echo "Run: pnpm -s exec tsc -b 2>&1 | grep TS1484 | wc -l"
echo "to check remaining errors"
