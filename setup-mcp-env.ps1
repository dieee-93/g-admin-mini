# MCP Environment Variables Setup Script
# Configura las variables de entorno para los MCPs en Windows

Write-Host "MCP Environment Variables Setup" -ForegroundColor Cyan
Write-Host "==============================" -ForegroundColor Cyan
Write-Host ""

# Verificar si .env.mcp existe
if (-not (Test-Path ".env.mcp")) {
    Write-Host "ERROR: .env.mcp no encontrado" -ForegroundColor Red
    Write-Host "Por favor copia .env.mcp.example a .env.mcp y completa tus API keys" -ForegroundColor Yellow
    exit 1
}

# Leer .env.mcp y parsear las variables
Write-Host "Leyendo .env.mcp..." -ForegroundColor Green
$envVars = @{}
Get-Content ".env.mcp" | ForEach-Object {
    $line = $_.Trim()
    if ($line -and -not $line.StartsWith("#")) {
        $parts = $line.Split("=", 2)
        if ($parts.Length -eq 2) {
            $key = $parts[0].Trim()
            $value = $parts[1].Trim()
            if ($value) {
                $envVars[$key] = $value
            }
        }
    }
}

Write-Host ""
Write-Host "Variables encontradas:" -ForegroundColor Cyan
$envVars.Keys | ForEach-Object {
    $maskedValue = if ($envVars[$_].Length -gt 10) {
        $envVars[$_].Substring(0, 10) + "..."
    } else {
        "***"
    }
    Write-Host "  - ${_}: $maskedValue" -ForegroundColor Gray
}

# Preguntar al usuario donde configurar las variables
Write-Host ""
Write-Host "Donde quieres configurar las variables?" -ForegroundColor Yellow
Write-Host "  1. Usuario actual (solo para tu cuenta)" -ForegroundColor White
Write-Host "  2. Sistema (para todos los usuarios - requiere Admin)" -ForegroundColor White
$choice = Read-Host "Selecciona (1/2)"

$target = if ($choice -eq "2") { "Machine" } else { "User" }
$targetName = if ($choice -eq "2") { "Sistema" } else { "Usuario" }

Write-Host ""
Write-Host "Configurando variables de entorno en: $targetName" -ForegroundColor Green

try {
    foreach ($key in $envVars.Keys) {
        [System.Environment]::SetEnvironmentVariable($key, $envVars[$key], $target)
        Write-Host "  - $key configurada" -ForegroundColor Green
    }

    Write-Host ""
    Write-Host "Configuracion completada!" -ForegroundColor Green
    Write-Host ""
    Write-Host "IMPORTANTE: Reinicia Claude Code para que cargue las nuevas variables" -ForegroundColor Yellow

} catch {
    Write-Host ""
    Write-Host "Error al configurar variables: $_" -ForegroundColor Red
    Write-Host "Si elegiste 'Sistema', asegurate de ejecutar como Administrador" -ForegroundColor Yellow
    exit 1
}

Write-Host ""
Write-Host "Para verificar:" -ForegroundColor Cyan
Write-Host "  1. Reinicia Claude Code completamente" -ForegroundColor White
Write-Host "  2. Ejecuta: claude mcp list" -ForegroundColor White
Write-Host "  3. Los MCPs deberian aparecer sin warnings" -ForegroundColor White
