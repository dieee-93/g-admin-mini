# Script para correr tests del EventBus y guardar logs
# Uso: .\run-eventbus-tests.ps1

$timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
$logFile = "test-results\eventbus-$timestamp.log"
$jsonFile = "test-results\eventbus-$timestamp.json"

Write-Host "🧪 Iniciando tests del EventBus..." -ForegroundColor Green
Write-Host "📝 Logs se guardarán en: $logFile" -ForegroundColor Yellow
Write-Host "📊 Resultados JSON en: $jsonFile" -ForegroundColor Yellow

# Crear directorio si no existe
if (!(Test-Path "test-results")) {
    New-Item -ItemType Directory -Path "test-results"
}

# Correr tests con logs verbose (sin colores)
Write-Host "`n🚀 Ejecutando tests con logs detallados..." -ForegroundColor Cyan
$env:NO_COLOR = "1"
pnpm vitest run src/lib/events/v2/__tests__ --reporter=verbose --no-colors 2>&1 | Out-File -FilePath $logFile -Encoding UTF8

# Correr tests con output JSON para análisis
Write-Host "📈 Ejecutando tests con output JSON..." -ForegroundColor Cyan
pnpm vitest run src/lib/events/v2/__tests__ --reporter=json --no-colors 2>&1 | Out-File -FilePath $jsonFile -Encoding UTF8
Remove-Item Env:NO_COLOR

Write-Host "`n✅ Tests completados!" -ForegroundColor Green
Write-Host "📁 Archivos generados:" -ForegroundColor White
Write-Host "   - $logFile" -ForegroundColor Gray
Write-Host "   - $jsonFile" -ForegroundColor Gray

# Mostrar resumen del archivo de logs
if (Test-Path $logFile) {
    $logContent = Get-Content $logFile
    $totalLines = $logContent.Count
    $errorLines = $logContent | Where-Object { $_ -match "FAIL|ERROR|✗" }
    $passLines = $logContent | Where-Object { $_ -match "PASS|✓" }
    
    Write-Host "`n📊 Resumen rápido:" -ForegroundColor White
    Write-Host "   - Total de líneas: $totalLines" -ForegroundColor Gray
    Write-Host "   - Líneas con errores: $($errorLines.Count)" -ForegroundColor Red
    Write-Host "   - Líneas con éxito: $($passLines.Count)" -ForegroundColor Green
}

Write-Host "`n💡 Para analizar los resultados:" -ForegroundColor Yellow
Write-Host "   - Abrir $logFile en tu editor" -ForegroundColor Gray
Write-Host "   - Buscar 'FAIL' para encontrar errores" -ForegroundColor Gray
Write-Host "   - Buscar 'PASS' para ver tests exitosos" -ForegroundColor Gray
