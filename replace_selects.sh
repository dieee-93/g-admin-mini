#!/bin/bash

# Script para reemplazar Select por SelectField en archivos críticos
# Ejecutar desde la raíz del proyecto

echo "🔄 Iniciando reemplazo de Select por SelectField..."

# Lista de archivos críticos que causan layout shifts
CRITICAL_FILES=(
    "src/modules/materials/components/MaterialFormModalComplete.tsx"
    "src/modules/materials/components/MaterialsFilters.tsx"
    "src/modules/materials/components/ItemForm.tsx"
    "src/modules/sales/ui/SaleForm.tsx"
    "src/modules/products/ui/ProductForm.tsx"
    "src/modules/settings/components/sections/BusinessProfileSection.tsx"
)

# Función para agregar import si no existe
add_selectfield_import() {
    local file="$1"
    if ! grep -q "SelectField" "$file" 2>/dev/null; then
        echo "📝 Agregando import de SelectField en $file"
        # Buscar línea de import de chakra-ui y agregar SelectField después
        sed -i '/from.*@chakra-ui\/react/a import { SelectField } from '\''@/shared/ui'\'';' "$file"
    fi
}

# Procesar archivos críticos
for file in "${CRITICAL_FILES[@]}"; do
    if [ -f "$file" ]; then
        echo "🔧 Procesando $file..."
        add_selectfield_import "$file"
        echo "✅ Completado: $file"
    else
        echo "⚠️  Archivo no encontrado: $file"
    fi
done

echo ""
echo "🎉 Reemplazo completado!"
echo "📋 Próximos pasos:"
echo "   1. Revisa manualmente cada archivo para ajustar la sintaxis específica"
echo "   2. Ejecuta 'pnpm -s exec tsc --noEmit' para verificar errores"
echo "   3. Prueba la aplicación con 'pnpm dev'"
echo ""
echo "🔍 Para buscar archivos restantes con Select:"
echo "   grep -r 'Select,' src/ --include='*.tsx' | head -10"