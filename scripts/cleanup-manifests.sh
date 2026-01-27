#!/bin/bash
# MANIFEST CLEANUP SCRIPT - Bash version
# 
# Removes all leftover optionalFeatures/requiredFeatures from manifests
# More robust than Node.js regex approach

echo "🧹 Starting manifest cleanup..."
echo ""

cd "$(dirname "$0")/.."

# Find all manifest files
manifests=$(find src/modules -name "manifest.tsx")
total=$(echo "$manifests" | wc -l)

echo "📊 Found $total manifest files"
echo ""

cleaned=0
for file in $manifests; do
  module=$(basename $(dirname "$file"))
  
  # Backup original
  cp "$file" "$file.backup"
  
  # Remove standalone optionalFeatures: [] lines
  sed -i '/^[[:space:]]*optionalFeatures:[[:space:]]*\[\][[:space:]]*$/d' "$file"
  
  # Remove optionalFeatures: [...] blocks
  sed -i '/^[[:space:]]*optionalFeatures:[[:space:]]*\[$/,/^[[:space:]]*\][[:space:]]*,\?[[:space:]]*$/d' "$file"
  
  # Remove requiredFeatures: [] lines
  sed -i '/^[[:space:]]*requiredFeatures:[[:space:]]*\[\][[:space:]]*$/d' "$file"
  
  # Remove requiredFeatures: [...] blocks
  sed -i '/^[[:space:]]*requiredFeatures:[[:space:]]*\[$/,/^[[:space:]]*\][[:space:]]*,\?[[:space:]]*$/d' "$file"
  
  # Fix inline optionalFeatures (pattern: ...something,optionalFeatures: [])
  sed -i 's/\(.*\)optionalFeatures:[[:space:]]*\[[^]]*\][[:space:]]*as[[:space:]]*FeatureId\[\],[[:space:]]*$/\1/' "$file"
  
  # Fix malformed autoInstall lines
  sed -i 's/autoInstall:[[:space:]]*true,[[:space:]]*\/\/[^o]*optionalFeatures:[[:space:]]*\[[^]]*\][[:space:]]*as[[:space:]]*FeatureId\[\],/autoInstall: true,/' "$file"
  
  # Remove multiple blank lines
  sed -i '/^$/N;/^\n$/D' "$file"
  
  # Check if file was modified
  if ! diff -q "$file" "$file.backup" > /dev/null 2>&1; then
    echo "✅ $module - cleaned"
    ((cleaned++))
  else
    echo "⏭️  $module - no changes"
  fi
  
  # Remove backup
  rm "$file.backup"
done

echo ""
echo "📊 Cleanup Summary:"
echo "   ✅ Cleaned: $cleaned"
echo "   📁 Total: $total"
echo ""
echo "✅ Cleanup complete!"
