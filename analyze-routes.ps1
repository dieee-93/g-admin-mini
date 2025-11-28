# Script para analizar rutas en App.tsx vs routeMap.ts

Write-Host "`n🔍 ROUTE SYNCHRONIZATION ANALYSIS" -ForegroundColor Cyan
Write-Host "=" * 80 -ForegroundColor Gray

# Extraer rutas de App.tsx
$appTsxContent = Get-Content "src\App.tsx" -Raw
$appRoutes = [regex]::Matches($appTsxContent, 'path="([^"]+)"') | ForEach-Object { $_.Groups[1].Value } | Where-Object { $_ -ne "*" } | Sort-Object -Unique

Write-Host "`n📄 Routes found in App.tsx: $($appRoutes.Count)" -ForegroundColor Yellow
$appRoutes | ForEach-Object { Write-Host "  - $_" -ForegroundColor White }

# Extraer rutas de routeMap.ts
$routeMapContent = Get-Content "src\config\routeMap.ts" -Raw
$routeMapRoutes = [regex]::Matches($routeMapContent, "'(/[^']+)':\s*'") | ForEach-Object { $_.Groups[1].Value } | Sort-Object -Unique

Write-Host "`n📋 Routes found in routeMap.ts: $($routeMapRoutes.Count)" -ForegroundColor Yellow
$routeMapRoutes | ForEach-Object { Write-Host "  - $_" -ForegroundColor White }

# Rutas en App.tsx que NO están en routeMap.ts
$missingInRouteMap = $appRoutes | Where-Object { $routeMapRoutes -notcontains $_ }

Write-Host "`n❌ Routes in App.tsx but MISSING in routeMap.ts: $($missingInRouteMap.Count)" -ForegroundColor Red
$missingInRouteMap | ForEach-Object { Write-Host "  - $_" -ForegroundColor Red }

# Rutas en routeMap.ts que NO están en App.tsx
$missingInApp = $routeMapRoutes | Where-Object { $appRoutes -notcontains $_ }

Write-Host "`n⚠️  Routes in routeMap.ts but MISSING in App.tsx: $($missingInApp.Count)" -ForegroundColor Yellow
$missingInApp | ForEach-Object { Write-Host "  - $_" -ForegroundColor Yellow }

# Rutas sincronizadas
$synchronized = $appRoutes | Where-Object { $routeMapRoutes -contains $_ }

Write-Host "`n✅ Synchronized routes: $($synchronized.Count)" -ForegroundColor Green

# Estadísticas finales
Write-Host "`n📊 STATISTICS:" -ForegroundColor Cyan
Write-Host "  Total routes in App.tsx: $($appRoutes.Count)" -ForegroundColor White
Write-Host "  Total routes in routeMap.ts: $($routeMapRoutes.Count)" -ForegroundColor White
Write-Host "  Synchronized: $($synchronized.Count)" -ForegroundColor Green
Write-Host "  Missing in routeMap: $($missingInRouteMap.Count)" -ForegroundColor Red
Write-Host "  Obsolete in routeMap: $($missingInApp.Count)" -ForegroundColor Yellow
$coveragePercent = [math]::Round(($synchronized.Count / $appRoutes.Count) * 100, 2)
Write-Host "  Coverage: $coveragePercent%" -ForegroundColor $(if ($coveragePercent -ge 80) { "Green" } elseif ($coveragePercent -ge 60) { "Yellow" } else { "Red" })

Write-Host "`n" -NoNewline
