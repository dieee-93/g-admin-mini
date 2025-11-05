# Update all imports from pages/ to modules/

$files = Get-ChildItem -Recurse -Include *.ts,*.tsx src | Where-Object { $_.FullName -notlike '*node_modules*' }

$count = 0
foreach ($file in $files) {
  $content = Get-Content $file.FullName -Raw -ErrorAction SilentlyContinue
  if (-not $content) { continue }

  $original = $content
  $content = $content -replace '@/pages/admin/supply-chain/materials/types', '@/modules/materials/types'
  $content = $content -replace '@/pages/admin/supply-chain/materials/services', '@/modules/materials/services'
  $content = $content -replace '@/pages/admin/operations/sales/services', '@/modules/sales/services'
  $content = $content -replace '@/pages/admin/operations/sales/types', '@/modules/sales/types'
  $content = $content -replace '@/pages/admin/core/crm/customers/services', '@/modules/customers/services'
  $content = $content -replace '@/pages/admin/core/crm/customers/types', '@/modules/customers/types'
  $content = $content -replace '@/pages/admin/resources/staff/services', '@/modules/staff/services'
  $content = $content -replace '@/pages/admin/supply-chain/products/services', '@/modules/products/services'
  $content = $content -replace '@/pages/admin/supply-chain/products/types', '@/modules/products/types'

  if ($content -ne $original) {
    Set-Content $file.FullName $content -NoNewline
    $count++
  }
}

Write-Host "OK: $count files updated"
