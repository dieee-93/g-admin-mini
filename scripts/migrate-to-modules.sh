#!/bin/bash
# Script de Migración: Opción 2 Híbrida
# Mueve lógica de negocio de pages/ a modules/
# Mantiene solo UI/routing en pages/

set -e

REPO_ROOT="I:/Programacion/Proyectos/g-mini"
REPORT_FILE="$REPO_ROOT/MIGRATION_REPORT.md"

echo "# Migration Report: pages/ → modules/" > "$REPORT_FILE"
echo "Generated: $(date)" >> "$REPORT_FILE"
echo "" >> "$REPORT_FILE"

# Colores para output
RED='\033[0:31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

TOTAL_MOVED=0
TOTAL_ERRORS=0

migrate_folder() {
  local src_base="$1"      # e.g., "pages/admin/supply-chain/materials"
  local dest_base="$2"     # e.g., "modules/materials"
  local folder_name="$3"   # e.g., "hooks", "services", "types"

  local src_path="$REPO_ROOT/src/$src_base/$folder_name"
  local dest_path="$REPO_ROOT/src/$dest_base/$folder_name"

  if [ ! -d "$src_path" ]; then
    return 0
  fi

  echo -e "${YELLOW}Moving: $src_base/$folder_name → $dest_base/$folder_name${NC}"

  # Crear directorio destino si no existe
  mkdir -p "$dest_path"

  # Mover archivos (no sobrescribir si ya existen)
  local files_moved=0
  for file in "$src_path"/*; do
    if [ -f "$file" ]; then
      local filename=$(basename "$file")
      local dest_file="$dest_path/$filename"

      if [ -f "$dest_file" ]; then
        echo -e "${RED}  ⚠ CONFLICT: $filename already exists in $dest_base/$folder_name${NC}"
        echo "- ⚠ CONFLICT: \`$src_base/$folder_name/$filename\` → \`$dest_base/$folder_name/$filename\` (already exists)" >> "$REPORT_FILE"
        ((TOTAL_ERRORS++))
      else
        cp "$file" "$dest_file"
        echo -e "${GREEN}  ✓ Moved: $filename${NC}"
        echo "- ✅ \`$src_base/$folder_name/$filename\` → \`$dest_base/$folder_name/$filename\`" >> "$REPORT_FILE"
        ((files_moved++))
        ((TOTAL_MOVED++))
      fi
    fi
  done

  # Si se movieron todos los archivos exitosamente, eliminar carpeta origen
  if [ $files_moved -gt 0 ] && [ $(find "$src_path" -type f | wc -l) -eq 0 ]; then
    rm -rf "$src_path"
    echo -e "${GREEN}  ✓ Removed empty: $src_path${NC}"
  fi
}

echo "" >> "$REPORT_FILE"
echo "## Migrations" >> "$REPORT_FILE"
echo "" >> "$REPORT_FILE"

# MATERIALES
echo -e "\n${YELLOW}=== MATERIALS ===${NC}"
echo "### Materials" >> "$REPORT_FILE"
migrate_folder "pages/admin/supply-chain/materials" "modules/materials" "hooks"
migrate_folder "pages/admin/supply-chain/materials" "modules/materials" "services"
migrate_folder "pages/admin/supply-chain/materials" "modules/materials" "types"
migrate_folder "pages/admin/supply-chain/materials" "modules/materials" "utils"

# SALES
echo -e "\n${YELLOW}=== SALES ===${NC}"
echo "### Sales" >> "$REPORT_FILE"
migrate_folder "pages/admin/operations/sales" "modules/sales" "hooks"
migrate_folder "pages/admin/operations/sales" "modules/sales" "services"

# CUSTOMERS
echo -e "\n${YELLOW}=== CUSTOMERS ===${NC}"
echo "### Customers" >> "$REPORT_FILE"
migrate_folder "pages/admin/core/crm/customers" "modules/customers" "hooks"
migrate_folder "pages/admin/core/crm/customers" "modules/customers" "services"
migrate_folder "pages/admin/core/crm/customers" "modules/customers" "types"

# STAFF
echo -e "\n${YELLOW}=== STAFF ===${NC}"
echo "### Staff" >> "$REPORT_FILE"
migrate_folder "pages/admin/resources/staff" "modules/staff" "hooks"
migrate_folder "pages/admin/resources/staff" "modules/staff" "services"

# DELIVERY
echo -e "\n${YELLOW}=== DELIVERY ===${NC}"
echo "### Delivery" >> "$REPORT_FILE"
migrate_folder "pages/admin/operations/fulfillment/delivery" "modules/fulfillment/delivery" "hooks"

# PRODUCTS
echo -e "\n${YELLOW}=== PRODUCTS ===${NC}"
echo "### Products" >> "$REPORT_FILE"
migrate_folder "pages/admin/supply-chain/products" "modules/products" "hooks"
migrate_folder "pages/admin/supply-chain/products" "modules/products" "services"
migrate_folder "pages/admin/supply-chain/products" "modules/products" "types"
migrate_folder "pages/admin/supply-chain/products" "modules/products" "utils"

# Agregar más migraciones según sea necesario...

echo "" >> "$REPORT_FILE"
echo "## Summary" >> "$REPORT_FILE"
echo "- **Total files moved**: $TOTAL_MOVED" >> "$REPORT_FILE"
echo "- **Total conflicts**: $TOTAL_ERRORS" >> "$REPORT_FILE"

echo -e "\n${GREEN}=== MIGRATION COMPLETE ===${NC}"
echo -e "${GREEN}Files moved: $TOTAL_MOVED${NC}"
echo -e "${YELLOW}Conflicts: $TOTAL_ERRORS${NC}"
echo -e "\nReport: $REPORT_FILE"
