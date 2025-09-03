#!/bin/bash

# Fix missing component names (Stack removed incorrectly) 
echo "🔧 Fixing missing Stack component names..."

# Find and fix patterns like "< gap={" or "< align=" that should be "<Stack"
find src -name "*.tsx" | while read file; do
    if grep -q "< \(gap\|align\|justify\|direction\|spacing\|wrap\)=" "$file"; then
        echo "  Fixing missing Stack in: $file"
        
        # Replace < gap= with <Stack gap=
        sed -i 's/<\s*\(gap\|align\|justify\|direction\|spacing\|wrap\)=/<Stack \1=/g' "$file"
        
        # Make sure Stack is imported
        if ! grep -q "import.*Stack" "$file" && grep -q "<Stack" "$file"; then
            echo "    Adding Stack import to: $file"
            # Add Stack to existing Chakra imports
            sed -i 's/import[[:space:]]*{/import {\n  Stack,/g' "$file"
        fi
    fi
done

echo "✅ Fixed missing Stack components!"