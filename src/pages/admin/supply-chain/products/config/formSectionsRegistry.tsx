/**
 * FORM SECTIONS REGISTRY
 *
 * Registry centralizado de todas las secciones del formulario de productos.
 * Secciones se muestran dinámicamente según tipo de producto y capabilities activas.
 *
 * ✅ Capability-driven (no hard-coded conditionals)
 * ✅ Single source of truth
 * ✅ Extensible (fácil agregar nuevas secciones)
 *
 * @design PRODUCTS_FORM_ARCHITECTURE.md
 */

import { useMemo } from 'react';
import { useBusinessProfile, useFeatureFlags } from '@/lib/capabilities';
import type { FormSection, ProductType } from '../types/productForm';
import type { FeatureId } from '@/config/FeatureRegistry';

// Import components
import { BasicInfoSection, PricingSection, BookingSection, DigitalDeliverySection, RecurringConfigSection, AssetConfigSection, RentalTermsSection, ProductOperationsSection, RecipeConfigSection } from '../components/sections';

// ============================================
// REGISTRY DEFINITION
// ============================================

/**
 * Registry de todas las secciones disponibles del formulario.
 * Cada sección define:
 * - Su component
 * - Capabilities requeridas
 * - Regla de visibilidad según tipo de producto
 * - Orden de renderizado
 */
export const FORM_SECTIONS_REGISTRY: Record<string, FormSection> = {
  // ============================================
  // SECCIONES UNIVERSALES (siempre visibles)
  // ============================================

  basic_info: {
    id: 'basic_info',
    label: 'Información Básica',
    component: BasicInfoSection,
    visibilityRule: () => true,  // Siempre visible
    order: 1
  },

  pricing: {
    id: 'pricing',
    label: 'Precio',
    component: PricingSection,
    visibilityRule: () => true,  // Siempre visible (al final)
    order: 100  // Último
  },

  // ============================================
  // SECCIONES CONDICIONALES
  // ============================================

  production_config: {
    id: 'production_config',
    label: 'Recursos y Operación',
    component: ProductOperationsSection,
    requiredFeatures: ['inventory_stock_tracking', 'staff_labor_cost_tracking'],
    visibilityRule: (type, activeFeatures) => {
      // ✅ Visible para: physical_product, service, rental
      // Requiere al menos UNA de las features relacionadas
      const hasAnyRequiredFeature =
        activeFeatures.includes('inventory_stock_tracking') ||
        activeFeatures.includes('staff_labor_cost_tracking') ||
        activeFeatures.includes('production_bom_management');

      if (!hasAnyRequiredFeature) {
        return false;
      }

      // Visible para physical_product, service, rental
      return ['physical_product', 'service', 'rental'].includes(type);
    },
    order: 2
  },

  recipe_config: {
    id: 'recipe_config',
    label: 'Bill of Materials (BOM)',
    component: RecipeConfigSection,
    requiredFeatures: ['production_bom_management'],
    visibilityRule: (type, activeFeatures) => {
      // ✅ Requiere la feature de BOM
      if (!activeFeatures.includes('production_bom_management')) {
        return false;
      }

      // ✅ Visible para physical_product (productos con BOM o kits)
      // Casos de uso:
      // - Producto con BOM: Hamburguesa (pan + carne + lechuga)
      // - Kit de productos: Combo (burger + fries + drink)
      return type === 'physical_product';
    },
    order: 3
  },

  booking: {
    id: 'booking',
    label: 'Reservas',
    component: BookingSection,
    requiredFeatures: ['scheduling_appointment_booking'],
    visibilityRule: (type, activeFeatures) => {
      // ✅ Validar contra activeFeatures
      if (!activeFeatures.includes('scheduling_appointment_booking')) {
        return false;
      }

      // ❌ NO para rental (usa availability_config en asset_config)
      if (type === 'rental') return false;

      // ✅ Para service (muy común)
      if (type === 'service') return true;

      // ✅ Para membership (opcional)
      if (type === 'membership') return true;

      // ❌ NO para physical_product (removido según el prompt)
      return false;
    },
    order: 5
  },

  asset_config: {
    id: 'asset_config',
    label: 'Configuración de Activo',
    component: AssetConfigSection,
    requiredFeatures: ['rental_item_management'],
    visibilityRule: (type, activeFeatures) => {
      // ✅ Validar contra activeFeatures
      if (!activeFeatures.includes('rental_item_management')) {
        return false;
      }

      // Solo para rental
      return type === 'rental';
    },
    order: 6
  },

  rental_terms: {
    id: 'rental_terms',
    label: 'Términos de Alquiler',
    component: RentalTermsSection,
    requiredFeatures: ['rental_item_management'],
    visibilityRule: (type, activeFeatures) => {
      // ✅ Validar contra activeFeatures
      if (!activeFeatures.includes('rental_item_management')) {
        return false;
      }

      // Solo para rental
      return type === 'rental';
    },
    order: 7
  },

  digital_delivery: {
    id: 'digital_delivery',
    label: 'Entrega Digital',
    component: DigitalDeliverySection,
    requiredFeatures: ['digital_file_delivery'],
    visibilityRule: (type, activeFeatures) => {
      // ✅ Validar contra activeFeatures
      if (!activeFeatures.includes('digital_file_delivery')) {
        return false;
      }

      // Solo para digital
      return type === 'digital';
    },
    order: 8
  },

  recurring_config: {
    id: 'recurring_config',
    label: 'Configuración Recurrente',
    component: RecurringConfigSection,
    requiredFeatures: ['membership_recurring_billing'],
    visibilityRule: (type, activeFeatures) => {
      // ✅ Validar contra activeFeatures
      if (!activeFeatures.includes('membership_recurring_billing')) {
        return false;
      }

      // Solo para membership
      return type === 'membership';
    },
    order: 9
  }
};

// ============================================
// HOOK: useVisibleFormSections
// ============================================

/**
 * Hook que computa las secciones visibles según tipo y capabilities
 *
 * @example
 * ```tsx
 * const visibleSections = useVisibleFormSections('service')
 * // Si capabilities = ['staff', 'scheduling']
 * // Retorna: [basic_info, staff, booking, pricing]
 * ```
 */
export function useVisibleFormSections(
  productType: ProductType
): FormSection[] {
  const { activeFeatures } = useFeatureFlags();

  return useMemo(() => {
    // Filtrar secciones según visibilityRule
    const visible = Object.values(FORM_SECTIONS_REGISTRY).filter(section =>
      section.visibilityRule(productType, activeFeatures)
    );

    // Ordenar por 'order'
    return visible.sort((a, b) => (a.order || 0) - (b.order || 0));
  }, [productType, activeFeatures]);
}

// ============================================
// UTILITY HOOKS
// ============================================

/**
 * Verifica si una sección específica está visible
 *
 * @example
 * ```tsx
 * const hasBooking = useIsSectionVisible('service', 'booking')
 * ```
 */
export function useIsSectionVisible(
  productType: ProductType,
  sectionId: string
): boolean {
  const visibleSections = useVisibleFormSections(productType);
  return visibleSections.some(s => s.id === sectionId);
}

/**
 * Obtiene una sección específica del registry
 */
export function getFormSection(sectionId: string): FormSection | undefined {
  return FORM_SECTIONS_REGISTRY[sectionId];
}

/**
 * Verifica si todas las features requeridas están activas
 */
export function hasRequiredFeatures(
  section: FormSection,
  activeFeatures: FeatureId[]
): boolean {
  if (!section.requiredFeatures) return true;

  return section.requiredFeatures.every(feature =>
    activeFeatures.includes(feature)
  );
}
