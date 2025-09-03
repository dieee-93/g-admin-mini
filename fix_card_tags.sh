#!/bin/bash

# Script para corregir tags JSX mixtos Card/CardWrapper
# Reemplaza todos los </CardWrapper> por </Card>

echo "🔧 Corrigiendo tags JSX mixtos Card/CardWrapper..."

# Buscar archivos con el problema
files_with_issue=$(find src -name "*.tsx" -exec grep -l "Card.*>" {} \; | xargs grep -l "CardWrapper.*>" | head -10)

echo "📂 Archivos a corregir:"
echo "$files_with_issue"

# Reemplazar </CardWrapper> por </Card> en todos los archivos
for file in $files_with_issue; do
    echo "🔧 Corrigiendo: $file"
    sed -i 's|</CardWrapper>|</Card>|g' "$file"
done

echo "✅ Corrección completada!"