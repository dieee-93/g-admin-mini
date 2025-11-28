/**
 * MOCK VALIDATION CONTEXT
 * 
 * Utilities para crear contextos de validación en tests.
 * Facilita la creación de escenarios específicos.
 * 
 * @version 1.0.0
 */

import type { ValidationContext } from '@/modules/achievements/types';

// ============================================
// BASE CONTEXTS
// ============================================

/**
 * Context vacío - útil como punto de partida
 */
export const createEmptyContext = (): ValidationContext => ({
  profile: null,
  products: [],
  staff: [],
  tables: [],
  paymentMethods: [],
  paymentGateways: [],
  deliveryZones: [],
  materials: [],
  assets: [],
  suppliers: [],
  salesCount: 0,
});

/**
 * Context con profile básico
 */
export const createBasicProfileContext = (
  overrides?: Partial<ValidationContext['profile']>
): ValidationContext => ({
  ...createEmptyContext(),
  profile: {
    businessName: 'Test Business',
    address: '123 Main Street',
    contactEmail: 'test@example.com',
    contactPhone: '+54 11 1234-5678',
    ...overrides,
  },
});

/**
 * Context con profile completo
 */
export const createCompleteProfileContext = (
  overrides?: Partial<ValidationContext['profile']>
): ValidationContext => ({
  ...createEmptyContext(),
  profile: {
    businessName: 'Complete Business',
    address: '456 Full Avenue, Buenos Aires',
    logoUrl: 'https://example.com/logo.png',
    taxId: '20-12345678-9',
    contactEmail: 'contact@complete.com',
    contactPhone: '+54 11 9999-8888',
    operatingHours: {
      monday: { open: '09:00', close: '18:00' },
      tuesday: { open: '09:00', close: '18:00' },
      wednesday: { open: '09:00', close: '18:00' },
      thursday: { open: '09:00', close: '18:00' },
      friday: { open: '09:00', close: '18:00' },
    },
    pickupHours: {
      monday: { open: '10:00', close: '20:00' },
      tuesday: { open: '10:00', close: '20:00' },
      wednesday: { open: '10:00', close: '20:00' },
      thursday: { open: '10:00', close: '20:00' },
      friday: { open: '10:00', close: '20:00' },
    },
    deliveryHours: {
      monday: { open: '11:00', close: '22:00' },
      tuesday: { open: '11:00', close: '22:00' },
    },
    shippingPolicy: 'Free shipping on orders over $1000',
    termsAndConditions: 'Full terms and conditions available at /terms',
    ...overrides,
  },
});

// ============================================
// BUILDER FUNCTIONS
// ============================================

/**
 * Agrega productos al contexto
 */
export const withProducts = (
  context: ValidationContext,
  count: number,
  published = true
): ValidationContext => ({
  ...context,
  products: Array.from({ length: count }, (_, i) => ({
    id: `product-${i + 1}`,
    name: `Product ${i + 1}`,
    is_published: published,
    images: i < 3 ? [`https://example.com/product-${i + 1}.jpg`] : [],
  })),
});

/**
 * Agrega staff al contexto
 */
export const withStaff = (
  context: ValidationContext,
  count: number,
  options?: { role?: string; allActive?: boolean }
): ValidationContext => ({
  ...context,
  staff: Array.from({ length: count }, (_, i) => ({
    id: `staff-${i + 1}`,
    name: `Employee ${i + 1}`,
    is_active: options?.allActive !== false ? true : i < count / 2,
    role: options?.role || 'staff',
  })),
});

/**
 * Agrega couriers al staff
 */
export const withCouriers = (
  context: ValidationContext,
  count: number
): ValidationContext => withStaff(context, count, { role: 'courier' });

/**
 * Agrega tables al contexto
 */
export const withTables = (
  context: ValidationContext,
  count: number
): ValidationContext => ({
  ...context,
  tables: Array.from({ length: count }, (_, i) => ({
    id: `table-${i + 1}`,
    name: `Table ${i + 1}`,
    capacity: 4,
  })),
});

/**
 * Agrega payment methods al contexto
 */
export const withPaymentMethods = (
  context: ValidationContext,
  methods: string[] = ['Efectivo', 'Tarjeta']
): ValidationContext => ({
  ...context,
  paymentMethods: methods.map((name, i) => ({
    id: `method-${i + 1}`,
    name,
    is_active: true,
  })),
});

/**
 * Agrega payment gateways al contexto
 */
export const withPaymentGateways = (
  context: ValidationContext,
  gateways: Array<{ type: 'online' | 'pos' | 'mobile'; name?: string }> = [
    { type: 'online', name: 'MercadoPago' },
  ]
): ValidationContext => ({
  ...context,
  paymentGateways: gateways.map((gateway, i) => ({
    id: `gateway-${i + 1}`,
    type: gateway.type,
    name: gateway.name,
    is_active: true,
  })),
});

/**
 * Agrega delivery zones al contexto
 */
export const withDeliveryZones = (
  context: ValidationContext,
  count: number
): ValidationContext => ({
  ...context,
  deliveryZones: Array.from({ length: count }, (_, i) => ({
    id: `zone-${i + 1}`,
    name: `Zone ${String.fromCharCode(65 + i)}`,
    deliveryFee: 200 + i * 50,
  })),
});

/**
 * Agrega materials al contexto
 */
export const withMaterials = (
  context: ValidationContext,
  count: number
): ValidationContext => ({
  ...context,
  materials: Array.from({ length: count }, (_, i) => ({
    id: `material-${i + 1}`,
    name: `Material ${i + 1}`,
    type: (['MEASURABLE', 'COUNTABLE', 'ELABORATED'] as const)[i % 3],
  })),
});

/**
 * Agrega assets al contexto
 */
export const withAssets = (
  context: ValidationContext,
  count: number
): ValidationContext => ({
  ...context,
  assets: Array.from({ length: count }, (_, i) => ({
    id: `asset-${i + 1}`,
    name: `Asset ${i + 1}`,
    is_available: true,
  })),
});

/**
 * Agrega suppliers al contexto
 */
export const withSuppliers = (
  context: ValidationContext,
  count: number
): ValidationContext => ({
  ...context,
  suppliers: Array.from({ length: count }, (_, i) => ({
    id: `supplier-${i + 1}`,
    name: `Supplier ${i + 1}`,
    is_active: true,
  })),
});

/**
 * Agrega sales count al contexto
 */
export const withSales = (
  context: ValidationContext,
  count: number
): ValidationContext => ({
  ...context,
  salesCount: count,
});

// ============================================
// PRESET CONTEXTS
// ============================================

/**
 * Context listo para TakeAway (todas las validaciones pasan)
 */
export const createTakeAwayReadyContext = (): ValidationContext => {
  let context = createCompleteProfileContext();
  context = withProducts(context, 5, true);
  context = withPaymentMethods(context);
  return context;
};

/**
 * Context listo para Dine-In (todas las validaciones pasan)
 */
export const createDineInReadyContext = (): ValidationContext => {
  let context = createCompleteProfileContext();
  context = withProducts(context, 3, true);
  context = withStaff(context, 2);
  context = withTables(context, 5);
  context = withPaymentMethods(context);
  return context;
};

/**
 * Context listo para E-commerce (todas las validaciones pasan)
 */
export const createECommerceReadyContext = (): ValidationContext => {
  let context = createCompleteProfileContext();
  context = withProducts(context, 10, true);
  context = withPaymentGateways(context, [{ type: 'online', name: 'MercadoPago' }]);
  return context;
};

/**
 * Context listo para Delivery (todas las validaciones pasan)
 */
export const createDeliveryReadyContext = (): ValidationContext => {
  let context = createCompleteProfileContext();
  context = withDeliveryZones(context, 3);
  context = withCouriers(context, 2);
  return context;
};

/**
 * Context listo para Physical Products (todas las validaciones pasan)
 */
export const createPhysicalProductsReadyContext = (): ValidationContext => {
  let context = createCompleteProfileContext();
  context = withMaterials(context, 5);
  context = withSuppliers(context, 2);
  context = withProducts(context, 3, true);
  context = withPaymentMethods(context);
  return context;
};

/**
 * Context listo para Professional Services (todas las validaciones pasan)
 */
export const createProfessionalServicesReadyContext = (): ValidationContext => {
  let context = createCompleteProfileContext();
  context = withStaff(context, 2, { role: 'professional' });
  context = withProducts(context, 2, true); // Services as products
  context = withPaymentMethods(context);
  return context;
};

/**
 * Context listo para Asset Rental (todas las validaciones pasan)
 */
export const createAssetRentalReadyContext = (): ValidationContext => {
  let context = createCompleteProfileContext();
  context = withAssets(context, 3);
  context = withProducts(context, 1, true); // Rental products
  return context;
};

// ============================================
// HELPER UTILITIES
// ============================================

/**
 * Aplica múltiples builders en secuencia
 */
export const composeContext = (
  ...builders: Array<(ctx: ValidationContext) => ValidationContext>
): ValidationContext => {
  let context = createEmptyContext();
  for (const builder of builders) {
    context = builder(context);
  }
  return context;
};

/**
 * Clona un contexto
 */
export const cloneContext = (context: ValidationContext): ValidationContext => ({
  ...context,
  profile: context.profile ? { ...context.profile } : null,
  products: [...context.products],
  staff: [...context.staff],
  tables: context.tables ? [...context.tables] : [],
  paymentMethods: context.paymentMethods ? [...context.paymentMethods] : [],
  paymentGateways: context.paymentGateways ? [...context.paymentGateways] : [],
  deliveryZones: context.deliveryZones ? [...context.deliveryZones] : [],
  materials: context.materials ? [...context.materials] : [],
  assets: context.assets ? [...context.assets] : [],
  suppliers: context.suppliers ? [...context.suppliers] : [],
});

/**
 * Imprime un resumen del contexto (útil para debugging de tests)
 */
export const summarizeContext = (context: ValidationContext): string => {
  return `
ValidationContext Summary:
- Profile: ${context.profile ? '✓' : '✗'}
  - Business Name: ${context.profile?.businessName || 'N/A'}
  - Address: ${context.profile?.address || 'N/A'}
  - Logo: ${context.profile?.logoUrl ? '✓' : '✗'}
- Products: ${context.products.length} (${context.products.filter((p) => p.is_published).length} published)
- Staff: ${context.staff.length} (${context.staff.filter((s) => s.is_active).length} active)
- Tables: ${context.tables?.length || 0}
- Payment Methods: ${context.paymentMethods?.length || 0}
- Payment Gateways: ${context.paymentGateways?.length || 0}
  - Online: ${context.paymentGateways?.filter((g) => g.type === 'online').length || 0}
- Delivery Zones: ${context.deliveryZones?.length || 0}
- Materials: ${context.materials?.length || 0}
- Assets: ${context.assets?.length || 0}
- Suppliers: ${context.suppliers?.length || 0}
- Sales Count: ${context.salesCount || 0}
  `.trim();
};
