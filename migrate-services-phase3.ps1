# PowerShell script to update imports for Phase 3 service migrations
# Complex folders: staff/, scheduling/, geocoding/, recipe/

$projectRoot = "I:\Programacion\Proyectos\g-mini"
Set-Location $projectRoot

Write-Host "Starting Phase 3 Services Import Migration (Complex Folders)..." -ForegroundColor Cyan
Write-Host ""

# Define replacements
$replacements = @{
    # staff/ -> resources/staff/services/staff/
    "@/services/staff/staffApi" = "@/pages/admin/resources/staff/services/staff/staffApi"
    "@/services/staff/realTimeLaborCosts" = "@/pages/admin/resources/staff/services/staff/realTimeLaborCosts"
    "@/services/staff/laborCostNotifications" = "@/pages/admin/resources/staff/services/staff/laborCostNotifications"
    
    # scheduling/ -> modules/scheduling/services/scheduling/
    "@/services/scheduling/coverageApi" = "@/modules/scheduling/services/scheduling/coverageApi"
    "@/services/scheduling/autoSchedulingEngine" = "@/modules/scheduling/services/scheduling/autoSchedulingEngine"
    
    # geocoding/ -> core/crm/services/geocoding/
    "@/services/geocoding" = "@/pages/admin/core/crm/services/geocoding"
    
    # recipe/ -> modules/recipe/services/recipe-legacy/
    "@/services/recipe/api/recipeApi" = "@/modules/recipe/services/recipe-legacy/api/recipeApi"
    "@/services/recipe/types" = "@/modules/recipe/services/recipe-legacy/types"
    "@/services/recipe/types/menu-engineering" = "@/modules/recipe/services/recipe-legacy/types/menu-engineering"
}

# Get all TypeScript files
$tsFiles = Get-ChildItem -Path "src" -Include "*.ts","*.tsx" -Recurse -File

$totalFiles = $tsFiles.Count
$filesUpdated = 0
$totalReplacements = 0

Write-Host "Scanning $totalFiles TypeScript files..." -ForegroundColor Yellow
Write-Host ""

foreach ($file in $tsFiles) {
    $content = Get-Content $file.FullName -Raw -Encoding UTF8
    $originalContent = $content
    $fileHadChanges = $false
    
    foreach ($old in $replacements.Keys) {
        $new = $replacements[$old]
        
        # Pattern 1: from '@/services/...' (double quotes)
        $pattern1 = [regex]::Escape("from `"$old`"")
        $replacement1 = "from `"$new`""
        if ($content -match $pattern1) {
            $content = $content -replace $pattern1, $replacement1
            $fileHadChanges = $true
            $totalReplacements++
        }
        
        # Pattern 2: from "@/services/..." (single quotes)
        $pattern2 = [regex]::Escape("from '$old'")
        $replacement2 = "from '$new'"
        if ($content -match $pattern2) {
            $content = $content -replace $pattern2, $replacement2
            $fileHadChanges = $true
            $totalReplacements++
        }
        
        # Pattern 3: import("@/services/...")
        $pattern3 = [regex]::Escape("import(`"$old`")")
        $replacement3 = "import(`"$new`")"
        if ($content -match $pattern3) {
            $content = $content -replace $pattern3, $replacement3
            $fileHadChanges = $true
            $totalReplacements++
        }
        
        # Pattern 4: import('@/services/...')
        $pattern4 = [regex]::Escape("import('$old')")
        $replacement4 = "import('$new')"
        if ($content -match $pattern4) {
            $content = $content -replace $pattern4, $replacement4
            $fileHadChanges = $true
            $totalReplacements++
        }
    }
    
    if ($fileHadChanges) {
        Set-Content -Path $file.FullName -Value $content -Encoding UTF8 -NoNewline
        $filesUpdated++
        Write-Host "✓ Updated: $($file.FullName.Replace($projectRoot, '.'))" -ForegroundColor Green
    }
}

Write-Host ""
Write-Host "================================================" -ForegroundColor Cyan
Write-Host "Phase 3 Migration Complete!" -ForegroundColor Green
Write-Host "================================================" -ForegroundColor Cyan
Write-Host "Files scanned:    $totalFiles" -ForegroundColor White
Write-Host "Files updated:    $filesUpdated" -ForegroundColor Yellow
Write-Host "Total replacements: $totalReplacements" -ForegroundColor Yellow
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "1. Remove old folders from src/services/" -ForegroundColor White
Write-Host "2. Run: pnpm exec tsc --noEmit" -ForegroundColor White
Write-Host ""
