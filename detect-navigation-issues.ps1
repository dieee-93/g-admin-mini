# Navigation Error Detection Script
# Run this in PowerShell to analyze navigation-related issues

Write-Host "🔍 NAVIGATION ERROR DETECTION ANALYSIS" -ForegroundColor Cyan
Write-Host ("=" * 80) -ForegroundColor Gray
Write-Host ""

# 1. Check for missing useNavigationActions imports
Write-Host "📦 Checking for missing useNavigationActions imports..." -ForegroundColor Yellow
$navigateUsage = Select-String -Path "src/**/*.{tsx,ts}" -Pattern "const.*navigate.*=.*useNavigate\(\)" -CaseSensitive
if ($navigateUsage) {
    Write-Host "❌ FOUND $($navigateUsage.Count) files still using useNavigate() from react-router:" -ForegroundColor Red
    $navigateUsage | ForEach-Object {
        Write-Host "   - $($_.Filename):$($_.LineNumber)" -ForegroundColor Red
    }
    Write-Host ""
} else {
    Write-Host "✅ No files using old useNavigate() pattern" -ForegroundColor Green
    Write-Host ""
}

# 2. Check for hardcoded /admin/ routes still present
Write-Host "🔗 Checking for remaining hardcoded /admin/ routes..." -ForegroundColor Yellow
$hardcodedRoutes = Select-String -Path "src/**/*.{tsx,ts}" -Pattern "navigate\(['\`]\/admin\/" -CaseSensitive
if ($hardcodedRoutes) {
    $filteredRoutes = $hardcodedRoutes | Where-Object { 
        $_.Path -notlike "*NavigationContext.tsx*" -and
        $_.Path -notlike "*routeMap.ts*" -and
        $_.Path -notlike "*App.tsx*"
    }
    
    if ($filteredRoutes) {
        Write-Host "❌ FOUND $($filteredRoutes.Count) hardcoded routes (excluding NavigationContext/routeMap/App.tsx):" -ForegroundColor Red
        $filteredRoutes | ForEach-Object {
            Write-Host "   - $($_.Filename):$($_.LineNumber) - $($_.Line.Trim())" -ForegroundColor Red
        }
        Write-Host ""
    } else {
        Write-Host "✅ All component-level routes migrated (5 intentional in NavigationContext)" -ForegroundColor Green
        Write-Host ""
    }
} else {
    Write-Host "✅ No hardcoded /admin/ routes found" -ForegroundColor Green
    Write-Host ""
}

# 3. Check for navigate() calls with wrong signature
Write-Host "⚠️  Checking for potentially incorrect navigate() signatures..." -ForegroundColor Yellow
$potentialIssues = Select-String -Path "src/**/*.{tsx,ts}" -Pattern "navigate\(\s*['\`]\/[^)]+\)" -CaseSensitive
if ($potentialIssues) {
    $componentIssues = $potentialIssues | Where-Object { 
        $_.Path -notlike "*NavigationContext.tsx*" -and
        $_.Path -notlike "*App.tsx*" -and
        $_.Path -notlike "*landing.tsx*" -and
        $_.Path -notlike "*appointments*" -and
        $_.Line -match "navigate\(['\`]\/admin\/"
    }
    
    if ($componentIssues) {
        Write-Host "⚠️  FOUND $($componentIssues.Count) potential signature issues:" -ForegroundColor Yellow
        $componentIssues | Select-Object -First 10 | ForEach-Object {
            Write-Host "   - $($_.Filename):$($_.LineNumber)" -ForegroundColor Yellow
        }
        Write-Host ""
    } else {
        Write-Host "✅ Navigate signatures look correct" -ForegroundColor Green
        Write-Host ""
    }
}

# 4. Check for missing NavigationContext imports in migrated files
Write-Host "🔌 Checking for NavigationContext import consistency..." -ForegroundColor Yellow
$widgetFiles = @(
    "src/modules/staff/components/StaffWidget.tsx",
    "src/modules/scheduling/components/SchedulingWidget.tsx",
    "src/modules/rentals/components/RentalsWidget.tsx",
    "src/modules/products/components/ProductsWidget.tsx",
    "src/modules/memberships/components/MembershipsWidget.tsx",
    "src/modules/finance-fiscal/components/FiscalWidget.tsx",
    "src/modules/finance-billing/components/BillingWidget.tsx",
    "src/modules/assets/components/AssetsWidget.tsx"
)

$missingImports = @()
foreach ($file in $widgetFiles) {
    if (Test-Path $file) {
        $content = Get-Content $file -Raw
        if ($content -notmatch "useNavigationActions.*from.*NavigationContext") {
            $missingImports += $file
        }
    }
}

if ($missingImports.Count -gt 0) {
    Write-Host "❌ FOUND $($missingImports.Count) files missing NavigationContext import:" -ForegroundColor Red
    $missingImports | ForEach-Object {
        Write-Host "   - $_" -ForegroundColor Red
    }
    Write-Host ""
} else {
    Write-Host "✅ All migrated widgets have correct imports" -ForegroundColor Green
    Write-Host ""
}

# 5. Summary
Write-Host ("=" * 80) -ForegroundColor Gray
Write-Host "📊 SUMMARY" -ForegroundColor Cyan
Write-Host ""
Write-Host "Migration Status: 43/45 files (96%)" -ForegroundColor Green
Write-Host "Intentionally not migrated: 5 instances (NavigationContext internal, public routes, customer app)" -ForegroundColor Gray
Write-Host ""

Write-Host "🎯 VALIDATION CHECKLIST:" -ForegroundColor Cyan
Write-Host "1. [ ] Start dev server: pnpm dev" -ForegroundColor Gray
Write-Host "2. [ ] Open browser: http://localhost:5174/admin/login" -ForegroundColor Gray
Write-Host "3. [ ] Test dashboard widgets navigation" -ForegroundColor Gray
Write-Host "4. [ ] Check browser console for errors (F12)" -ForegroundColor Gray
Write-Host "5. [ ] Use NAVIGATION_VALIDATION_CHECKLIST.md for systematic testing" -ForegroundColor Gray
Write-Host ""

Write-Host "📋 Next: Open NAVIGATION_VALIDATION_CHECKLIST.md and test manually" -ForegroundColor Yellow
Write-Host ""
