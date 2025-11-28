#!/usr/bin/env pwsh
<#
.SYNOPSIS
    Navigation Audit - Quick Diagnostics Script

.DESCRIPTION
    Runs quick diagnostics on the G-Mini navigation system to identify
    issues found during the audit.

.EXAMPLE
    .\navigation-audit-diagnostics.ps1
#>

Write-Host "🔍 G-MINI NAVIGATION AUDIT - DIAGNOSTICS" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# 1. Count hardcoded routes
Write-Host "📊 1. Analyzing Hardcoded Routes..." -ForegroundColor Yellow
$hardcodedFiles = Get-ChildItem -Path "src" -Filter "*.tsx" -Recurse | 
    Select-String -Pattern "navigate\(['""]/admin" -AllMatches

$hardcodedCount = ($hardcodedFiles | Measure-Object).Count

Write-Host "   ❌ Found: $hardcodedCount hardcoded routes" -ForegroundColor Red
Write-Host "   ✅ Goal: 0 hardcoded routes (use navigateToModule())" -ForegroundColor Green
Write-Host ""

# 2. Count console.log usage
Write-Host "📊 2. Analyzing Console.log Usage..." -ForegroundColor Yellow
$consoleFiles = Get-ChildItem -Path "src" -Include "*.ts","*.tsx" -Exclude "*test*","*spec*" -Recurse |
    Select-String -Pattern "console\.(log|error|warn|info)\(" -AllMatches

$consoleCount = ($consoleFiles | Measure-Object).Count

Write-Host "   ❌ Found: $consoleCount direct console.* calls" -ForegroundColor Red
Write-Host "   ✅ Goal: 0 direct calls (use logger.* instead)" -ForegroundColor Green
Write-Host ""

# 3. Check if SkipLink is used
Write-Host "📊 3. Checking Accessibility (SkipLink)..." -ForegroundColor Yellow
$skipLinkFiles = Get-ChildItem -Path "src" -Filter "*.tsx" -Recurse | 
    Select-String -Pattern "import.*SkipLink"

$skipLinkCount = ($skipLinkFiles | Measure-Object).Count

if ($skipLinkCount -eq 0) {
    Write-Host "   ❌ SkipLink component not used anywhere" -ForegroundColor Red
} else {
    Write-Host "   ✅ SkipLink used in $skipLinkCount files" -ForegroundColor Green
}
Write-Host ""

# 4. Check Custom Link usage
Write-Host "📊 4. Checking Custom Link Component Usage..." -ForegroundColor Yellow
$customLinkFiles = Get-ChildItem -Path "src" -Filter "*.tsx" -Recurse | 
    Select-String -Pattern "from '@/shared/navigation/Link'"

$customLinkCount = ($customLinkFiles | Measure-Object).Count

if ($customLinkCount -eq 0) {
    Write-Host "   ❌ Custom Link component defined but never used" -ForegroundColor Red
} else {
    Write-Host "   ✅ Custom Link used in $customLinkCount files" -ForegroundColor Green
}
Write-Host ""

# 5. Count routes in App.tsx
Write-Host "📊 5. Analyzing App.tsx Size..." -ForegroundColor Yellow
$appTsxLines = (Get-Content "src\App.tsx").Count
$routeLines = (Select-String -Path "src\App.tsx" -Pattern "<Route").Count

Write-Host "   📏 Total lines: $appTsxLines" -ForegroundColor Cyan
Write-Host "   🛣️  Route definitions: $routeLines" -ForegroundColor Cyan

if ($appTsxLines -gt 800) {
    Write-Host "   ⚠️  File is large (goal: <500 lines)" -ForegroundColor Yellow
} else {
    Write-Host "   ✅ File size acceptable" -ForegroundColor Green
}
Write-Host ""

# 6. Check routeMap coverage
Write-Host "📊 6. Checking routeMap.ts Coverage..." -ForegroundColor Yellow
$routeMapContent = Get-Content "src\config\routeMap.ts" -Raw
$domainRouteCount = ([regex]::Matches($routeMapContent, "'[^']+': '/")).Count
$routeToFileCount = ([regex]::Matches($routeMapContent, "'/[^']+': 'pages/")).Count

Write-Host "   📦 domainRouteMap entries: $domainRouteCount" -ForegroundColor Cyan
Write-Host "   📂 routeToFileMap entries: $routeToFileCount" -ForegroundColor Cyan
Write-Host "   🛣️  Routes in App.tsx: $routeLines" -ForegroundColor Cyan

if ($routeToFileCount -lt $routeLines) {
    Write-Host "   ⚠️  routeMap incomplete (missing entries)" -ForegroundColor Yellow
} else {
    Write-Host "   ✅ routeMap coverage complete" -ForegroundColor Green
}
Write-Host ""

# 7. Check for Navigation patterns
Write-Host "📊 7. Analyzing Navigation Pattern Usage..." -ForegroundColor Yellow
$useNavActionsFiles = Get-ChildItem -Path "src" -Include "*.ts","*.tsx" -Recurse |
    Select-String -Pattern "useNavigationActions"
$useNavigationActions = ($useNavActionsFiles | Measure-Object).Count

$navToModuleFiles = Get-ChildItem -Path "src" -Filter "*.tsx" -Recurse |
    Select-String -Pattern "navigateToModule\("
$navigateToModule = ($navToModuleFiles | Measure-Object).Count

Write-Host "   ✅ useNavigationActions() usage: $useNavigationActions files" -ForegroundColor Green
Write-Host "   ✅ navigateToModule() calls: $navigateToModule times" -ForegroundColor Green
Write-Host "   ❌ Hardcoded routes: $hardcodedCount times" -ForegroundColor Red

if (($navigateToModule + $hardcodedCount) -gt 0) {
    $percentage = [math]::Round(($navigateToModule / ($navigateToModule + $hardcodedCount)) * 100, 0)
    Write-Host "   📊 Good pattern usage: $percentage%" -ForegroundColor Cyan
} else {
    Write-Host "   📊 Good pattern usage: N/A (no navigation found)" -ForegroundColor Yellow
}
Write-Host ""

# Summary
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "📊 SUMMARY" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$issues = 0
if ($hardcodedCount -gt 0) { $issues++ }
if ($consoleCount -gt 0) { $issues++ }
if ($skipLinkCount -eq 0) { $issues++ }
if ($customLinkCount -eq 0) { $issues++ }
if ($appTsxLines -gt 800) { $issues++ }
if ($routeToFileCount -lt $routeLines) { $issues++ }

Write-Host "🎯 Issues Found: $issues/6" -ForegroundColor $(if ($issues -eq 0) { "Green" } elseif ($issues -le 3) { "Yellow" } else { "Red" })
Write-Host ""

if ($issues -eq 0) {
    Write-Host "✅ All checks passed! Navigation system is clean." -ForegroundColor Green
} elseif ($issues -le 3) {
    Write-Host "⚠️  Some issues found. Review NAVIGATION_AUDIT_EXECUTIVE_SUMMARY.md" -ForegroundColor Yellow
} else {
    Write-Host "❌ Multiple issues found. See NAVIGATION_AUDIT_FINDINGS.md for details" -ForegroundColor Red
}

Write-Host ""
Write-Host "📚 Next Steps:" -ForegroundColor Cyan
Write-Host "   1. Review: NAVIGATION_AUDIT_EXECUTIVE_SUMMARY.md" -ForegroundColor White
Write-Host "   2. Implement Quick Wins (1-2 days)" -ForegroundColor White
Write-Host "   3. Follow Plan de Acción (30 days)" -ForegroundColor White
Write-Host ""
Write-Host "💡 Quick Fixes:" -ForegroundColor Cyan
Write-Host "   • Replace console.log: grep -r 'console\\.log' src/ | wc -l" -ForegroundColor White
Write-Host "   • Add ESLint rule: 'no-console': ['error', { allow: ['warn', 'error'] }]" -ForegroundColor White
Write-Host "   • Implement SkipLink in ResponsiveLayout" -ForegroundColor White
Write-Host ""
