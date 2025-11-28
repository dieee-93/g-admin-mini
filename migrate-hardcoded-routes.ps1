# Script para migrar rutas hardcoded a NavigationContext

$files = @(
    "src\modules\staff\components\StaffWidget.tsx",
    "src\modules\scheduling\components\SchedulingWidget.tsx",
    "src\modules\rentals\components\RentalsWidget.tsx",
    "src\modules\products\components\ProductsWidget.tsx",
    "src\modules\memberships\components\MembershipsWidget.tsx",
    "src\modules\finance-fiscal\components\FiscalWidget.tsx",
    "src\modules\finance-billing\components\BillingWidget.tsx",
    "src\modules\assets\components\AssetsWidget.tsx"
)

$replacements = @{
    "import { useNavigate } from 'react-router-dom';" = "// Removed: useNavigate - using NavigationContext instead"
    "const navigate = useNavigate();" = "// Removed: useNavigate hook"
    "navigate('/admin/resources/staff')" = "// TODO: Use NavigationContext navigate('staff')"
    "navigate('/admin/resources/scheduling')" = "// TODO: Use NavigationContext navigate('scheduling')"
    "navigate('/admin/operations/rentals')" = "// TODO: Use NavigationContext navigate('rentals')"
    "navigate('/admin/supply-chain/products')" = "// TODO: Use NavigationContext navigate('products')"
    "navigate('/admin/operations/memberships')" = "// TODO: Use NavigationContext navigate('memberships')"
    "navigate('/admin/finance/fiscal')" = "// TODO: Use NavigationContext navigate('fiscal')"
    "navigate('/admin/finance/billing')" = "// TODO: Use NavigationContext navigate('billing')"
    "navigate('/admin/supply-chain/assets')" = "// TODO: Use NavigationContext navigate('assets')"
}

Write-Host "🔄 Analyzing files for hardcoded routes..." -ForegroundColor Cyan

foreach ($file in $files) {
    if (Test-Path $file) {
        $content = Get-Content $file -Raw
        $hasNavigate = $content -match "useNavigate"
        
        if ($hasNavigate) {
            Write-Host "  ✓ $file - Contains useNavigate" -ForegroundColor Yellow
        } else {
            Write-Host "  - $file - Clean" -ForegroundColor Green
        }
    }
}

Write-Host "`n📊 Summary: Use manual migration with NavigationContext patterns" -ForegroundColor Cyan
Write-Host "Pattern: const { navigate } = useNavigationActions();" -ForegroundColor White
Write-Host "Usage: navigate('moduleName', '/subpath')" -ForegroundColor White
