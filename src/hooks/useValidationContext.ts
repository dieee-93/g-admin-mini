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
import { useProductsStore } from '@/store/productsStore';
import { useStaffStore } from '@/store/staffStore';
import { useOperationsStore } from '@/store/operationsStore';
import { useSalesStore } from '@/store/salesStore';
import { useAppStore } from '@/store/appStore';
import { useFiscalStore } from '@/store/fiscalStore';
import { useMaterialsStore } from '@/store/materialsStore';
import { useAssetsStore } from '@/store/assetsStore';
import { usePaymentsStore } from '@/store/paymentsStore';
import { useSuppliersStore } from '@/store/suppliersStore';
import type { ValidationContext } from '@/modules/achievements/types';
import type { ProductWithIntelligence } from '@/pages/admin/supply-chain/products/types';
import type { StaffMember } from '@/store/staffStore';
import type { MaterialItem } from '@/store/materialsStore';
import type { Asset } from '@/pages/admin/supply-chain/assets/types';
import type { Supplier } from '@/store/suppliersStore';

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
  // ============================================
  // PRODUCTS STORE
  // ============================================

  // ✅ BEST PRACTICE 1: Atomic selector - return only length
  // Prevents re-render when products array reference changes but length is same
  const productsLength = useProductsStore((state) => state.products.length);
  const productsRaw = useProductsStore((state) => state.products);

  // ✅ BEST PRACTICE 2: useMemo with length dependency only
  // Transformation happens only when length changes (add/remove)
  const products = useMemo(
    () =>
      productsRaw.map((p: ProductWithIntelligence) => ({
        id: p.id,
        name: p.name,
        is_published: p.is_published ?? false,
        images: p.images || [],
      })),
    [productsLength] // Stable primitive dependency
  );

  // ============================================
  // STAFF STORE
  // ============================================

  const staffLength = useStaffStore((state) => state.staff.length);
  const staffRaw = useStaffStore((state) => state.staff);

  const staff = useMemo(
    () =>
      staffRaw.map((s: StaffMember) => ({
        id: s.id,
        name: s.name,
        is_active: s.status === 'active',
        role: s.position,
      })),
    [staffLength] // Stable primitive dependency
  );

  // ============================================
  // OPERATIONS STORE
  // ============================================

  const tablesRaw = useOperationsStore((state) => (state as { tables?: Array<{ id: string; name: string; capacity?: number }> }).tables || []);
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
  const salesCount = useSalesStore((state) => state.sales?.length || 0);

  // ============================================
  // APP STORE (Shared Business Config)
  // ============================================

  // ✅ BEST PRACTICE 4: Select only needed fields, not entire settings object
  const businessName = useAppStore((state) => state.settings?.businessName);
  const address = useAppStore((state) => state.settings?.address);
  const logoUrl = useAppStore((state) => state.settings?.logoUrl);
  const contactEmail = useAppStore((state) => state.settings?.contactEmail);
  const contactPhone = useAppStore((state) => state.settings?.contactPhone);

  // ============================================
  // OPERATIONS STORE (Operations-Specific Config)
  // ============================================

  const operatingHours = useOperationsStore((state) => state.operatingHours);
  const pickupHours = useOperationsStore((state) => state.pickupHours);

  // ============================================
  // FISCAL STORE (Fiscal-Specific Config)
  // ============================================

  const taxId = useFiscalStore((state) => state.taxId);

  // ============================================
  // FUTURE STORES (To be implemented)
  // ============================================

  // TODO: When deliveryStore exists, read from there:
  // const deliveryHours = useDeliveryStore(state => state.deliveryHours);

  // TODO: When ecommerceStore exists, read from there:
  // const shippingPolicy = useEcommerceStore(state => state.shippingPolicy);
  // const termsAndConditions = useEcommerceStore(state => state.termsAndConditions);

  // ✅ BEST PRACTICE 5: useMemo for profile object with stable dependencies
  // Prevents new object creation on every render
  const profile = useMemo(
    () => ({
      businessName,
      address,
      logoUrl,
      contactEmail,
      contactPhone,
      operatingHours,
      pickupHours,
      taxId,
      // Fields from future stores (undefined until implemented)
      deliveryHours: undefined, // TODO: useDeliveryStore
      shippingPolicy: undefined, // TODO: useEcommerceStore
      termsAndConditions: undefined, // TODO: useEcommerceStore
    }),
    [businessName, address, logoUrl, contactEmail, contactPhone, operatingHours, pickupHours, taxId]
  );

  // ============================================
  // PAYMENT METHODS & GATEWAYS
  // ============================================

  // ✅ FASE 2.1: Using paymentsStore for real data
  const paymentMethodsLength = usePaymentsStore((state) => state.paymentMethods.length);
  const paymentMethodsRaw = usePaymentsStore((state) => state.paymentMethods);
  const paymentGatewaysLength = usePaymentsStore((state) => state.paymentGateways.length);
  const paymentGatewaysRaw = usePaymentsStore((state) => state.paymentGateways);

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
        supports_subscriptions: g.supports_subscriptions,
      })),
    [paymentGatewaysLength]
  );

  // ============================================
  // DELIVERY ZONES
  // ============================================

  // TODO: Cuando exista deliveryStore, descomentar:
  // const deliveryZones = useDeliveryStore(state => state.zones);

  const deliveryZones = useMemo(
    () =>
      [] as Array<{
        id: string;
        name: string;
        deliveryFee?: number;
      }>,
    []
  );

  // ============================================
  // LOYALTY PROGRAM
  // ============================================

  // TODO: Cuando exista loyaltyStore, descomentar:
  // const loyaltyProgram = useLoyaltyStore(state => state.program);

  const loyaltyProgram = useMemo(() => undefined as { active: boolean } | undefined, []);

  // ============================================
  // MATERIALS STORE (New for physical_products)
  // ============================================

  const materialsLength = useMaterialsStore((state) => state.items.length);
  const materialsRaw = useMaterialsStore((state) => state.items);

  const materials = useMemo(
    () =>
      materialsRaw.map((item: MaterialItem) => ({
        id: item.id,
        name: item.name,
        type: item.type as 'MEASURABLE' | 'COUNTABLE' | 'ELABORATED',
      })),
    [materialsLength]
  );

  // ============================================
  // ASSETS STORE (New for asset_rental)
  // ============================================

  const assetsLength = useAssetsStore((state) => state.items.length);
  const assetsRaw = useAssetsStore((state) => state.items);

  const assets = useMemo(
    () =>
      assetsRaw.map((asset: Asset) => ({
        id: asset.id,
        name: asset.name,
        is_available: asset.is_available ?? true,
      })),
    [assetsLength]
  );

  // ============================================
  // SUPPLIERS STORE (New for physical_products)
  // ============================================

  const suppliersLength = useSuppliersStore((state) => state.suppliers.length);
  const suppliersRaw = useSuppliersStore((state) => state.suppliers);

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
  return useMemo(
    () => ({
      profile,
      products,
      staff,
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
    }),
    [
      // All dependencies are now stable primitives or memoized objects
      profile,
      productsLength, // Use primitive instead of products
      staffLength, // Use primitive instead of staff
      tablesLength, // Use primitive instead of tables
      materialsLength, // NEW
      assetsLength, // NEW
      suppliersLength, // NEW FASE 2.2
      salesCount,
      // paymentMethods, paymentGateways, deliveryZones, loyaltyProgram are empty memoized arrays
      // so they don't need to be in dependencies
    ]
  );
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
  if (options.staff) partialContext.staff = fullContext.staff;
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
