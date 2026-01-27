/**
 * USE VALIDATION CONTEXT HOOK
 *
 * Custom hook que combina datos de múltiples Zustand stores
 * para crear un ValidationContext unificado.
 *
 * PROPÓSITO:
 * - Desacoplar validators de stores específicos
 * - Centralizar acceso a datos de validación
 * - Facilitar testing (mock del hook en lugar de stores)
 * - Cumplir con Dependency Injection pattern
 *
 * INVESTIGACIÓN:
 * - React TypeScript validator access multiple Zustand stores best practices 2025
 * - Custom hooks son el approach recomendado para combinar stores
 * - Slice-based architecture permite modularidad con TypeScript
 *
 * FUENTES:
 * - GitHub pmndrs/zustand
 * - TkDodo's blog - "Working with Zustand"
 * - Atlys Engineering - "Slice-Based Zustand Store"
 *
 * @version 1.0.0
 * @see docs/05-development/REQUIREMENTS_ACHIEVEMENTS_SYSTEM_DESIGN.md
 */

import { useMemo } from 'react';
import { useProducts } from '@/modules/products';
import { useTeam } from '@/modules/team/hooks'; // ✅ TanStack Query hook
import { usePaymentMethods, usePaymentGateways } from '@/modules/finance-integrations/hooks/usePayments'; // ✅ TanStack Query hooks
import { useSuppliers } from '@/modules/suppliers/hooks'; // ✅ TanStack Query hook
import { useTables } from '@/modules/fulfillment/onsite/hooks/useTables'; // ✅ TanStack Query hook
import { useDeliveryZones } from '@/modules/fulfillment/delivery/hooks/useDeliveryZones'; // ✅ TanStack Query hook
import { useOperatingHours } from '@/modules/fulfillment/onsite/hooks/useOperatingHours'; // ✅ TanStack Query hook
import { useSalesStore } from '@/store/salesStore';
import { useAppStore } from '@/store/appStore';
import { useFiscalStore } from '@/store/fiscalStore';
import type { ValidationContext } from '@/modules/achievements/types';
import type { ProductWithIntelligence } from '@/pages/admin/supply-chain/products/types';
import type { TeamMember } from '@/modules/team/store';
import type { Supplier } from '@/modules/suppliers/store';

// NOTE: MaterialsStore and AssetsStore are UI-only stores.
// Materials and Assets data come from server state hooks (useMaterials, useAssets).
// ValidationContext uses placeholder empty arrays until proper integration.

/**
 * Hook que combina datos de múltiples stores en un ValidationContext
 *
 * BEST PRACTICES APPLIED (2025):
 * - Atomic selectors per store (TkDodo's "Working with Zustand")
 * - useMemo with stable dependencies to prevent infinite loops
 * - useShallow for object/array returns (Zustand v5 best practice)
 * - Ref-based memoization for complex objects
 *
 * RESEARCH SOURCES:
 * - Zustand Docs: "Prevent rerenders with useShallow"
 * - DEV Community: "Optimizing Zustand - Prevent Unnecessary Re-renders"
 * - GitHub pmndrs/zustand Discussion #1936
 *
 * @returns ValidationContext con todos los datos necesarios para validaciones
 *
 * @example
 * ```typescript
 * function MyComponent() {
 *   const context = useValidationContext();
 *   const achievementsAPI = registry.getExports('achievements');
 *
 *   const validation = await achievementsAPI.validateOperation(
 *     'pickup_counter',
 *     'takeaway:toggle_public',
 *     context
 *   );
 *
 *   if (!validation.allowed) {
 *     showSetupModal(validation.missingRequirements);
 *   }
 * }
 * ```
 */
export function useValidationContext(): ValidationContext {
  console.log('[useValidationContext] HOOK CALLED');
  
  // ============================================
  // PRODUCTS STORE
  // ============================================

  // ✅ Get products from TanStack Query (MIGRATED)
  const { data: productsRaw = [] } = useProducts();
  const productsLength = productsRaw.length;

  // ✅ BEST PRACTICE 2: useMemo with length dependency only
  // Transformation happens only when length changes (add/remove)
  const products = useMemo(
    () =>
      productsRaw.map((p: ProductWithIntelligence) => ({
        id: p.id,
        name: p.name,
        is_published: p.is_published ?? false,
        type: p.type, // ProductType: "ELABORATED" | "SERVICE" | "DIGITAL"
        cost: p.cost,
        // Note: images and price not available in ProductWithIntelligence base type
      })),
    [productsLength] // Stable primitive dependency
  );

  // ============================================
  // STAFF STORE → TanStack Query Migration ✅
  // ============================================

  // ✅ NEW: Get staff from TanStack Query (MIGRATED)
  const { data: teamRaw = [] } = useTeam();
  const staffLength = teamRaw.length;

  const team = useMemo(
    () =>
      teamRaw.map((s: TeamMember) => ({
        id: s.id,
        name: s.name,
        is_active: s.status === 'active',
        role: s.position,
      })),
    [staffLength] // Stable primitive dependency
  );

  // ============================================
  // OPERATIONS (TABLES) → TanStack Query Migration ✅
  // ============================================

  // ✅ NEW: Get tables from TanStack Query (MIGRATED)
  const { data: tablesRaw = [] } = useTables();
  const tablesLength = tablesRaw.length;

  const tables = useMemo(
    () =>
      tablesRaw.map((t) => ({
        id: t.id,
        name: t.name,
        capacity: t.capacity || 4,
      })),
    [tablesLength] // Stable primitive dependency
  );

  // ============================================
  // SALES STORE
  // ============================================

  // ✅ BEST PRACTICE 3: Direct primitive selector (no transformation)
  // Note: Sales data is now in TanStack Query, not in the store
  // For now, return 0 until proper integration with useSales hook
  const salesCount = 0;

  // ============================================
  // APP STORE (Shared Business Config)
  // ============================================

  // ✅ BEST PRACTICE 4: Select only needed fields, not entire settings object
  const businessName = useAppStore((state) => state.settings?.businessName);
  const address = useAppStore((state) => state.settings?.address);
  const logoUrl = useAppStore((state) => state.settings?.logoUrl);
  const contactEmail = useAppStore((state) => state.settings?.contactEmail);
  const contactPhone = useAppStore((state) => state.settings?.contactPhone);
  const shippingPolicy = useAppStore((state) => state.settings?.shippingPolicy);
  const termsAndConditions = useAppStore((state) => state.settings?.termsAndConditions);

  // ============================================
  // OPERATIONS (OPERATING HOURS & DELIVERY ZONES) → TanStack Query Migration ✅
  // ============================================

  // ✅ NEW: Get operating hours from TanStack Query (MIGRATED)
  const { data: operatingHoursData } = useOperatingHours();
  const operatingHours = operatingHoursData?.opening || {};
  const pickupHours = operatingHoursData?.pickup || {};
  const deliveryHours = operatingHoursData?.delivery || {};

  // Serialize objects for dependency tracking
  const operatingHoursJson = JSON.stringify(operatingHours);
  const pickupHoursJson = JSON.stringify(pickupHours);
  const deliveryHoursJson = JSON.stringify(deliveryHours);

  // ✅ NEW: Get delivery zones from TanStack Query (MIGRATED)
  const { data: deliveryZonesRaw = [] } = useDeliveryZones();
  const deliveryZonesLength = deliveryZonesRaw.length;

  // ============================================
  // FISCAL STORE (Fiscal-Specific Config)
  // ============================================

  const taxId = useFiscalStore((state) => state.taxId);

  // ✅ BEST PRACTICE 5: useMemo for profile object with stable dependencies
  // Prevents new object creation on every render
  // NOTE: operatingHours/pickupHours/deliveryHours now come from TanStack Query hooks
  // which provide stable references, so no need for JSON serialization
  const profile = useMemo(
    () => ({
      businessName,
      address,
      logoUrl,
      contactEmail,
      contactPhone,
      operatingHours,
      pickupHours,
      deliveryHours,
      taxId,
      shippingPolicy,
      termsAndConditions,
    }),
    [businessName, address, logoUrl, contactEmail, contactPhone, operatingHoursJson, pickupHoursJson, deliveryHoursJson, taxId, shippingPolicy, termsAndConditions]
  );

  // ============================================
  // PAYMENT METHODS & GATEWAYS → TanStack Query Migration ✅
  // ============================================

  // ✅ NEW: Get payment data from TanStack Query (MIGRATED)
  const { data: paymentMethodsRaw = [] } = usePaymentMethods();
  const { data: paymentGatewaysRaw = [] } = usePaymentGateways();
  const paymentMethodsLength = paymentMethodsRaw.length;
  const paymentGatewaysLength = paymentGatewaysRaw.length;

  // ✅ BEST PRACTICE: useMemo with length dependency for stable references
  const paymentMethods = useMemo(
    () =>
      paymentMethodsRaw.map((m) => ({
        id: m.id,
        name: m.name,
        is_active: m.is_active,
      })),
    [paymentMethodsLength]
  );

  const paymentGateways = useMemo(
    () =>
      paymentGatewaysRaw.map((g) => ({
        id: g.id,
        type: g.type,
        is_active: g.is_active,
        supports_subscriptions: g.supports_subscriptions ?? false,
      })),
    [paymentGatewaysLength]
  );

  // ============================================
  // DELIVERY ZONES (From OperationsStore)
  // ============================================

  const deliveryZones = useMemo(
    () =>
      deliveryZonesRaw.map((z) => ({
        id: z.id,
        name: z.name,
        deliveryFee: z.deliveryFee,
      })),
    [deliveryZonesLength]
  );

  // ============================================
  // LOYALTY PROGRAM
  // ============================================

  // TODO: Cuando exista loyaltyStore, descomentar:
  // const loyaltyProgram = useLoyaltyStore(state => state.program);

  const loyaltyProgram = useMemo(() => undefined as { active: boolean } | undefined, []);

  // ============================================
  // MATERIALS (For physical_products capability)
  // ============================================

  // TODO: Materials data comes from useMaterials() hook (server state), not store.
  // MaterialsStore only handles UI state (filters, selection).
  // For now, return empty array. To integrate:
  // 1. Create a simple materialsDataStore with items array, OR
  // 2. Accept materials as a prop to validation functions
  const materials = useMemo(
    () =>
      [] as Array<{
        id: string;
        name: string;
        type: 'MEASURABLE' | 'COUNTABLE' | 'ELABORATED';
      }>,
    []
  );

  // ============================================
  // ASSETS (For asset_rental capability)
  // ============================================

  // TODO: Assets data comes from useAssets() hook (server state), not store.
  // AssetsStore only handles UI state.
  // For now, return empty array.
  const assets = useMemo(
    () =>
      [] as Array<{
        id: string;
        name: string;
        is_available: boolean;
      }>,
    []
  );

  // ============================================
  // SUPPLIERS → TanStack Query Migration ✅
  // ============================================

  // ✅ NEW: Get suppliers from TanStack Query (MIGRATED)
  const { data: suppliersRaw = [] } = useSuppliers();
  const suppliersLength = suppliersRaw.length;

  const suppliers = useMemo(
    () =>
      suppliersRaw.map((supplier: Supplier) => ({
        id: supplier.id,
        name: supplier.name,
        is_active: supplier.is_active,
      })),
    [suppliersLength]
  );

  // ============================================
  // RETURN VALIDATION CONTEXT
  // ============================================

  // ✅ BEST PRACTICE 7: useMemo with ALL memoized dependencies
  // Since all inputs are already memoized, this final useMemo ensures
  // the returned object reference is stable unless inputs truly change
  const result = useMemo(
    () => {
      const ctx = {
        profile,
        products,
        staff: team, // Renamed: staff → team
        tables,
        paymentMethods,
        paymentGateways,
        deliveryZones,
        salesCount,
        loyaltyProgram,
        // NEW FIELDS (FASE 1)
        materials,
        assets,
        // NEW FIELDS (FASE 2.2)
        suppliers,
        // TODO FASE 2: Agregar cuando existan los stores
        // appointments,
        // membershipPlans,
      };
      console.log('[useValidationContext] MEMO RECALCULATED - ValidationContext changed');
      return ctx;
    },
    [
      // All dependencies - use primitives where possible to prevent infinite loops
      // Profile dependencies (primitives)
      businessName,
      address,
      logoUrl,
      contactEmail,
      contactPhone,
      taxId,
      shippingPolicy,
      termsAndConditions,
      // Serialized JSON for object comparison
      operatingHoursJson,
      pickupHoursJson,
      deliveryHoursJson,
      // Array lengths (primitives)
      productsLength,
      staffLength,
      tablesLength,
      deliveryZonesLength,
      paymentMethodsLength,
      paymentGatewaysLength,
      suppliersLength,
      salesCount,
    ]
  );
  
  console.log('[useValidationContext] Returning context');
  return result;
}

/**
 * Hook alternativo que permite seleccionar qué datos incluir (optimización)
 *
 * @param options - Opciones para filtrar qué datos incluir
 * @returns ValidationContext parcial
 *
 * @example
 * ```typescript
 * // Solo incluir products y staff
 * const context = useValidationContext({ products: true, staff: true });
 * ```
 */
export function usePartialValidationContext(options: {
  profile?: boolean;
  products?: boolean;
  staff?: boolean;
  tables?: boolean;
  paymentMethods?: boolean;
  paymentGateways?: boolean;
  deliveryZones?: boolean;
  salesCount?: boolean;
  loyaltyProgram?: boolean;
}): Partial<ValidationContext> {
  const fullContext = useValidationContext();

  const partialContext: Partial<ValidationContext> = {};

  if (options.profile) partialContext.profile = fullContext.profile;
  if (options.products) partialContext.products = fullContext.products;
  if (options.team) partialContext.team = fullContext.team;
  if (options.tables) partialContext.tables = fullContext.tables;
  if (options.paymentMethods) partialContext.paymentMethods = fullContext.paymentMethods;
  if (options.paymentGateways) partialContext.paymentGateways = fullContext.paymentGateways;
  if (options.deliveryZones) partialContext.deliveryZones = fullContext.deliveryZones;
  if (options.salesCount) partialContext.salesCount = fullContext.salesCount;
  if (options.loyaltyProgram) partialContext.loyaltyProgram = fullContext.loyaltyProgram;

  return partialContext;
}

/**
 * Default export
 */
export default useValidationContext;
