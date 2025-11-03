#!/bin/bash

# Icon Migration Script - Convert Icon name="..." to Icon as={...}

# File list
files=(
  "src/pages/admin/executive/dashboards/components/AdvancedVisualization.tsx"
  "src/pages/admin/executive/dashboards/components/ExternalDataIntegration.tsx"
  "src/pages/admin/executive/dashboards/components/NaturalLanguageBI.tsx"
  "src/pages/admin/finance/billing/components/RecurringBillingFormEnhanced.tsx"
  "src/pages/admin/finance/billing/page.tsx"
  "src/pages/admin/finance/integrations/components/IntegrationsAnalytics.tsx"
  "src/pages/admin/finance/integrations/components/MercadoPagoIntegration.tsx"
  "src/pages/admin/finance/integrations/components/MODOIntegration.tsx"
  "src/pages/admin/finance/integrations/components/PaymentWebhooks.tsx"
  "src/pages/admin/finance/integrations/components/QRInteroperableManager.tsx"
  "src/pages/admin/finance/integrations/page.tsx"
  "src/pages/admin/operations/assets/components/AssetFormEnhanced.tsx"
  "src/pages/admin/operations/memberships/components/MembershipFormEnhanced.tsx"
  "src/pages/admin/operations/memberships/page.tsx"
  "src/pages/admin/operations/rentals/components/RentalFormEnhanced.tsx"
  "src/pages/admin/operations/rentals/page.tsx"
  "src/pages/admin/tools/reporting/components/ReportingAnalyticsEnhanced.tsx"
  "src/pages/admin/tools/reporting/components/ReportingFormEnhanced.tsx"
  "src/pages/admin/tools/reporting/page.tsx"
  "src/shared/calendar/components/CalendarHeader.tsx"
  "src/shared/calendar/components/CalendarSidebar.tsx"
)

echo "Starting Icon migration for 21 files..."
echo "Converting <Icon name=\"IconName\" /> to <Icon as={IconName} />"
echo ""

for file in "${files[@]}"; do
  if [ -f "$file" ]; then
    echo "Processing: $file"
    
    # Create backup
    cp "$file" "$file.backup"
    
    # Replace Icon name patterns
    sed -i 's/<Icon name="/< Icon as={/g' "$file"
    sed -i 's/" \/>/} \/>/g' "$file"
    sed -i 's/" className/} className/g' "$file"
    sed -i 's/" size/} size/g' "$file"
    sed -i 's/" color/} color/g' "$file"
    
    echo "  ✓ Migrated: $file"
  else
    echo "  ✗ File not found: $file"
  fi
done

echo ""
echo "Migration complete! Please review changes and run TypeScript check."
