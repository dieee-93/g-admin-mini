#!/bin/bash

# Update Finance Modules (5)
echo "Updating Finance modules..."

# finance-billing
sed -i '/id: '\''finance-billing'\'',/,/depends:/ {
  /version:/a\
\
  permissionModule: '\''billing'\'', // ✅ Uses '\''billing'\'' permission
}' src/modules/finance-billing/manifest.tsx

# finance-fiscal
sed -i '/id: '\''finance-fiscal'\'',/,/depends:/ {
  /version:/a\
\
  permissionModule: '\''fiscal'\'', // ✅ Uses '\''fiscal'\'' permission
}' src/modules/finance-fiscal/manifest.tsx

# finance-corporate
sed -i '/id: '\''finance-corporate'\'',/,/depends:/ {
  /version:/a\
\
  permissionModule: '\''fiscal'\'', // ✅ Maps to '\''fiscal'\'' permission (corporate accounting)
}' src/modules/finance-corporate/manifest.tsx

# finance-integrations
sed -i '/id: '\''finance-integrations'\'',/,/depends:/ {
  /version:/a\
\
  permissionModule: '\''billing'\'', // ✅ Uses '\''billing'\'' permission
}' src/modules/finance-integrations/manifest.tsx

# cash-management
sed -i '/id: '\''cash-management'\'',/,/depends:/ {
  /version:/a\
\
  permissionModule: '\''fiscal'\'', // ✅ Uses '\''fiscal'\'' permission (cash flow & accounting)
}' src/modules/cash-management/manifest.tsx

echo "✅ Finance modules updated (5)"

# Update Operations Modules (6)
echo "Updating Operations modules..."

# production
sed -i '/id: '\''production'\'',/,/depends:/ {
  /version:/a\
\
  permissionModule: '\''operations'\'', // ✅ Uses '\''operations'\'' permission
}' src/modules/production/manifest.tsx

# fulfillment
sed -i '/id: '\''fulfillment'\'',/,/depends:/ {
  /version:/a\
\
  permissionModule: '\''operations'\'', // ✅ Uses '\''operations'\'' permission
}' src/modules/fulfillment/manifest.tsx

# fulfillment-onsite
sed -i '/id: '\''fulfillment-onsite'\'',/,/depends:/ {
  /version:/a\
\
  permissionModule: '\''operations'\'', // ✅ Uses '\''operations'\'' permission
}' src/modules/fulfillment/onsite/manifest.tsx

# fulfillment-pickup
sed -i '/id: '\''fulfillment-pickup'\'',/,/depends:/ {
  /version:/a\
\
  permissionModule: '\''operations'\'', // ✅ Uses '\''operations'\'' permission
}' src/modules/fulfillment/pickup/manifest.tsx

# fulfillment-delivery
sed -i '/id: '\''fulfillment-delivery'\'',/,/depends:/ {
  /version:/a\
\
  permissionModule: '\''operations'\'', // ✅ Uses '\''operations'\'' permission
}' src/modules/fulfillment/delivery/manifest.tsx

# mobile
sed -i '/id: '\''mobile'\'',/,/depends:/ {
  /version:/a\
\
  permissionModule: '\''operations'\'', // ✅ Uses '\''operations'\'' permission
}' src/modules/mobile/manifest.tsx

# assets
sed -i '/id: '\''assets'\'',/,/depends:/ {
  /version:/a\
\
  permissionModule: '\''operations'\'', // ✅ Uses '\''operations'\'' permission
}' src/modules/assets/manifest.tsx

# memberships
sed -i '/id: '\''memberships'\'',/,/depends:/ {
  /version:/a\
\
  permissionModule: '\''operations'\'', // ✅ Uses '\''operations'\'' permission
}' src/modules/memberships/manifest.tsx

# rentals
sed -i '/id: '\''rentals'\'',/,/depends:/ {
  /version:/a\
\
  permissionModule: '\''operations'\'', // ✅ Uses '\''operations'\'' permission
}' src/modules/rentals/manifest.tsx

echo "✅ Operations modules updated (9)"

# Update Supply Chain Modules (3)
echo "Updating Supply Chain modules..."

# materials-procurement
sed -i '/id: '\''materials-procurement'\'',/,/depends:/ {
  /version:/a\
\
  permissionModule: '\''materials'\'', // ✅ Uses '\''materials'\'' permission (procurement submodule)
}' src/modules/materials/procurement/manifest.tsx

# products-analytics
sed -i '/id: '\''products-analytics'\'',/,/depends:/ {
  /version:/a\
\
  permissionModule: '\''products'\'', // ✅ Uses '\''products'\'' permission (analytics submodule)
}' src/modules/products/analytics/manifest.tsx

# suppliers
sed -i '/id: '\''suppliers'\'',/,/depends:/ {
  /version:/a\
\
  permissionModule: '\''materials'\'', // ✅ Uses '\''materials'\'' permission (supplier management)
}' src/modules/suppliers/manifest.tsx

echo "✅ Supply Chain modules updated (3)"

# Update Core Modules (2)
echo "Updating Core modules..."

# customers
sed -i '/id: '\''customers'\'',/,/depends:/ {
  /version:/a\
\
  permissionModule: '\''sales'\'', // ✅ Uses '\''sales'\'' permission (CRM)
}' src/modules/customers/manifest.tsx

# intelligence
sed -i '/id: '\''intelligence'\'',/,/depends:/ {
  /version:/a\
\
  permissionModule: '\''reporting'\'', // ✅ Uses '\''reporting'\'' permission
}' src/modules/intelligence/manifest.tsx

# achievements
sed -i '/id: '\''achievements'\'',/,/depends:/ {
  /version:/a\
\
  permissionModule: '\''gamification'\'', // ✅ Uses '\''gamification'\'' permission
}' src/modules/achievements/manifest.tsx

echo "✅ Core modules updated (3)"

echo ""
echo "🎉 ALL MANIFESTS UPDATED SUCCESSFULLY"
echo "Total modules updated: 20"
