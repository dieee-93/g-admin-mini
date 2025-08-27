# Script to update Settings sections to use dynamic themes
$sections = @(
    "TaxConfigurationSection.tsx",
    "UserPermissionsSection.tsx", 
    "IntegrationsSection.tsx",
    "EnterpriseSection.tsx"
)

foreach ($section in $sections) {
    $filePath = "src\pages\admin\settings\components\sections\$section"
    Write-Host "Updating $section..."
    
    # Read file content
    $content = Get-Content $filePath -Raw
    
    # Replace Card variants to include 
    $content = $content -replace 'Card variant="([^"]*)"(?![^>]*colorPalette)', 'Card variant="$1" '
    
    # Replace brand.500 colors with theme.500
    $content = $content -replace 'color="brand\.500"', ''
    
    # Write back to file
    Set-Content $filePath -Value $content -NoNewline
    
    Write-Host "✅ Updated $section"
}

Write-Host "🎨 All Settings sections updated for dynamic theming!"
