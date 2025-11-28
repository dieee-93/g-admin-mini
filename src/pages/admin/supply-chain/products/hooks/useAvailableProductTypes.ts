/**
 * useAvailableProductTypes Hook
 *
 * Determina qué tipos de productos están disponibles
 * basado en las capabilities activas del negocio.
 *
 * ✅ Respeta sistema de capabilities (NO hard-coded)
 * ✅ Single source of truth (CapabilityStore)
 * ✅ Memoizado para performance
 *
 * @design PRODUCTS_FORM_ARCHITECTURE.md
 */

import { useMemo } from 'react';
import { useCapabilityStore } from '@/store/capabilityStore';
import type { ProductTypeTemplate } from '../types/productForm';

/**
 * Hook que computa tipos de productos disponibles según capabilities activas
 *
 * @example
 * ```tsx
 * const availableTypes = useAvailableProductTypes()
 * // Si capabilities = ['materials', 'production']
 * // Retorna: [{ type: 'physical_product', ... }]
 * ```
 */
export function useAvailableProductTypes(): ProductTypeTemplate[] {
  const activeCapabilities = useCapabilityStore(state =>
    state.profile?.selectedCapabilities || []
  );

  return useMemo(() => {
    const templates: ProductTypeTemplate[] = [];

    // ============================================
    // TEMPLATE 1: Physical Product
    // ============================================
    // ✅ FIX Bug #5: Updated obsolete capabilities
    // Disponible si hay onsite_service O physical_products O fulfillment methods
    if (
      activeCapabilities.includes('onsite_service') ||
      activeCapabilities.includes('physical_products') ||
      activeCapabilities.includes('pickup_orders') ||
      activeCapabilities.includes('delivery_shipping')
    ) {
      templates.push({
        type: 'physical_product',
        label: 'Producto Físico',
        icon: '📦',
        description: 'Artículos tangibles que vendes o produces',
        examples: ['Comida preparada', 'Productos ensamblados', 'Retail'],
        enabled: true,
        requiredCapabilities: [],  // Al menos una de las arriba
        recommendedCapabilities: ['physical_products']
      });
    }

    // ============================================
    // TEMPLATE 2: Service
    // ============================================
    // ✅ FIX Bug #5: Updated obsolete capabilities
    // Disponible si hay onsite_service O professional_services
    if (
      activeCapabilities.includes('onsite_service') ||
      activeCapabilities.includes('professional_services')
    ) {
      templates.push({
        type: 'service',
        label: 'Servicio',
        icon: '💼',
        description: 'Servicios profesionales que ofreces',
        examples: ['Consultas', 'Tratamientos', 'Reparaciones'],
        enabled: true,
        requiredCapabilities: [],
        recommendedCapabilities: ['professional_services']
      });
    }

    // ============================================
    // TEMPLATE 3: Asset Rental
    // ============================================
    // ✅ FIXED: Usa asset_rental capability correcta
    if (activeCapabilities.includes('asset_rental')) {
      templates.push({
        type: 'rental',
        label: 'Alquiler de Activo',
        icon: '🚗',
        description: 'Alquiler de equipos, espacios o vehículos',
        examples: ['Autos', 'Salas de eventos', 'Herramientas'],
        enabled: true,
        requiredCapabilities: ['asset_rental'],
        recommendedCapabilities: []
      });
    }

    // ============================================
    // TEMPLATE 4: Digital Product
    // ============================================
    // ✅ FIXED: Usa digital_products capability correcta
    if (activeCapabilities.includes('digital_products')) {
      templates.push({
        type: 'digital',
        label: 'Producto Digital',
        icon: '💻',
        description: 'Contenido digital descargable o accesible',
        examples: ['Cursos online', 'Ebooks', 'Descargas'],
        enabled: true,
        requiredCapabilities: ['digital_products'],
        recommendedCapabilities: []
      });
    }

    // ============================================
    // TEMPLATE 5: Membership
    // ============================================
    // ✅ FIXED: Usa membership_subscriptions capability correcta
    if (activeCapabilities.includes('membership_subscriptions')) {
      templates.push({
        type: 'membership',
        label: 'Membresía',
        icon: '🎫',
        description: 'Acceso recurrente a servicios o espacios',
        examples: ['Gym', 'Club', 'Suscripción premium'],
        enabled: true,
        requiredCapabilities: ['membership_subscriptions'],
        recommendedCapabilities: ['appointment_based']
      });
    }

    return templates;
  }, [activeCapabilities]);
}

/**
 * Hook auxiliar: Verifica si un tipo específico está disponible
 *
 * @example
 * ```tsx
 * const isRentalAvailable = useIsProductTypeAvailable('rental')
 * ```
 */
export function useIsProductTypeAvailable(
  productType: ProductTypeTemplate['type']
): boolean {
  const availableTypes = useAvailableProductTypes();
  return availableTypes.some(t => t.type === productType);
}

/**
 * Hook auxiliar: Obtiene capabilities requeridas para un tipo
 *
 * @example
 * ```tsx
 * const requiredCaps = useRequiredCapabilitiesForType('rental')
 * // Returns: ['assets', 'scheduling']
 * ```
 */
export function useRequiredCapabilitiesForType(
  productType: ProductTypeTemplate['type']
): string[] {
  const availableTypes = useAvailableProductTypes();
  const template = availableTypes.find(t => t.type === productType);
  return template?.requiredCapabilities || [];
}
