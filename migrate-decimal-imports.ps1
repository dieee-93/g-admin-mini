# Script to update imports from @/business-logic to @/lib/decimal
# Migrates decimalUtils and FinancialCalculations imports

$rootPath = "I:\Programacion\Proyectos\g-mini\src"

# Define the replacements
$replacements = @(
    @{
        Old = "from '@/business-logic/shared/decimalUtils'"
        New = "from '@/lib/decimal'"
    },
    @{
        Old = "from '@/business-logic/shared/FinancialCalculations'"
        New = "from '@/lib/decimal'"
    },
    @{
        Old = 'from "@/business-logic/shared/decimalUtils"'
        New = 'from "@/lib/decimal"'
    },
    @{
        Old = 'from "@/business-logic/shared/FinancialCalculations"'
        New = 'from "@/lib/decimal"'
    }
)

# Find all TypeScript files
$files = Get-ChildItem -Path $rootPath -Include "*.ts","*.tsx" -Recurse -File | 
    Where-Object { $_.FullName -notmatch "\\node_modules\\" -and $_.FullName -notmatch "\\dist\\" }

$updatedCount = 0
$totalFiles = $files.Count

Write-Host "Found $totalFiles TypeScript files to check..." -ForegroundColor Cyan

foreach ($file in $files) {
    $content = Get-Content -Path $file.FullName -Raw -ErrorAction SilentlyContinue
    
    if ($null -eq $content) { continue }
    
    $modified = $false
    $newContent = $content
    
    foreach ($replacement in $replacements) {
        if ($newContent -match [regex]::Escape($replacement.Old)) {
            $newContent = $newContent -replace [regex]::Escape($replacement.Old), $replacement.New
            $modified = $true
        }
    }
    
    if ($modified) {
        Set-Content -Path $file.FullName -Value $newContent -NoNewline
        $updatedCount++
        $relativePath = $file.FullName.Replace($rootPath, "src")
        Write-Host "✓ Updated: $relativePath" -ForegroundColor Green
    }
}

Write-Host "`n==================================" -ForegroundColor Cyan
Write-Host "Migration complete!" -ForegroundColor Green
Write-Host "Updated $updatedCount of $totalFiles files" -ForegroundColor Yellow
Write-Host "==================================" -ForegroundColor Cyan
