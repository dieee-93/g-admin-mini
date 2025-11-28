/**
 * OPERATIONS CONFIG SECTION - Unified Section
 *
 * Sección unificada que agrupa Materials + Staff + Production en tabs.
 * Visible para: physical_product, service, rental
 *
 * ✅ Reduce redundancia (3 pasos → 1 paso)
 * ✅ Contexto claro (todo relacionado junto)
 * ✅ Activación individual por tab
 * ✅ Persistencia de estado entre tabs
 * ✅ ModuleRegistry integration
 *
 * @design PRODUCT_FORM_UX_REDESIGN.md - Solution 1
 */

import { Stack, Text, Tabs } from '@/shared/ui';
import type { FormSectionProps, ProductFormData, ProductType } from '../../types/productForm';
import { MaterialsSection } from './MaterialsSection';
import { StaffSection } from './StaffSection';
import { ProductionSection } from './ProductionSection';

interface ProductionConfigSectionProps extends Omit<FormSectionProps, 'data' | 'onChange'> {
  data: ProductFormData;
  productType: ProductType;
  onChange: (data: Partial<ProductFormData>) => void;
}

export function ProductionConfigSection({
  data,
  productType,
  onChange,
  errors = [],
  readOnly = false
}: ProductionConfigSectionProps) {
  // Determinar si debe mostrar el tab de Production (solo physical_product)
  const showProductionTab = productType === 'physical_product';

  // Helper text según tipo de producto
  const getHelperText = () => {
    switch (productType) {
      case 'physical_product':
        return 'Configure materiales, personal y proceso de producción';
      case 'service':
        return 'Configure materiales consumibles y personal del servicio';
      case 'rental':
        return 'Configure consumibles y personal incluidos en el alquiler';
      default:
        return 'Configure los recursos operativos';
    }
  };

  return (
    <Stack gap={4}>
      {/* Helper text */}
      <Text color="fg.muted" fontSize="sm">
        {getHelperText()}
      </Text>

      {/* Tabs para Materials / Staff / Production */}
      <Tabs.Root
        defaultValue="materials"
        variant="enclosed"
        colorPalette="blue"
      >
        <Tabs.List>
          <Tabs.Trigger value="materials">
            Materiales
          </Tabs.Trigger>
          <Tabs.Trigger value="staff">
            Personal
          </Tabs.Trigger>
          {showProductionTab && (
            <Tabs.Trigger value="production">
              Proceso
            </Tabs.Trigger>
          )}
        </Tabs.List>

        <Tabs.Content value="materials">
          <Stack gap={4} pt={4}>
            <MaterialsSection
              data={data.materials || { has_materials: false }}
              productType={productType}
              onChange={(materialsData) => onChange({ materials: materialsData })}
              errors={errors.filter(e => e.field?.startsWith('materials'))}
              readOnly={readOnly}
            />
          </Stack>
        </Tabs.Content>

        <Tabs.Content value="staff">
          <Stack gap={4} pt={4}>
            <StaffSection
              data={data.staff || { has_staff_requirements: false }}
              productType={productType}
              hasBooking={data.booking?.requires_booking || false}
              onChange={(staffData) => onChange({ staff: staffData })}
              errors={errors.filter(e => e.field?.startsWith('staff'))}
              readOnly={readOnly}
            />
          </Stack>
        </Tabs.Content>

        {showProductionTab && (
          <Tabs.Content value="production">
            <Stack gap={4} pt={4}>
              <ProductionSection
                data={data.production || { requires_production: false }}
                onChange={(productionData) => onChange({ production: productionData })}
                errors={errors.filter(e => e.field?.startsWith('production'))}
                readOnly={readOnly}
              />
            </Stack>
          </Tabs.Content>
        )}
      </Tabs.Root>

      {/* Info footer */}
      <Text fontSize="xs" color="fg.muted">
        💡 Cada sección es opcional - active solo las que necesite
      </Text>
    </Stack>
  );
}
