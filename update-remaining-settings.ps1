# Script para actualizar todos los archivos de Settings con Card.Root
$files = @(
    "src\pages\admin\settings\diagnostics.tsx",
    "src\pages\admin\settings\enterprise.tsx", 
    "src\pages\admin\settings\integrations.tsx",
    "src\pages\admin\settings\reporting.tsx"
)

foreach ($file in $files) {
    if (Test-Path $file) {
        Write-Host "Updating $file..."
        
        # Read file content
        $content = Get-Content $file -Raw
        
        # Replace Card.Root without colorPalette to include 
        $content = $content -replace '<Card\.Root(?![^>]*colorPalette)', '<Card.Root '
        
        # Write back to file
        Set-Content $file -Value $content -NoNewline
        
        Write-Host "✅ Updated $file"
    } else {
        Write-Host "❌ File not found: $file"
    }
}

Write-Host "🎨 All remaining Settings files updated!"
