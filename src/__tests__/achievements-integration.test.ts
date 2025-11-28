/**
 * ACHIEVEMENTS SYSTEM - INTEGRATION TESTS
 * 
 * Tests de integración para el flujo completo:
 * 1. Registrar requirements
 * 2. Validar operación comercial
 * 3. Bloquear acción si falta configuración
 * 4. Mostrar checklist y redireccionar
 * 
 * @version 1.0.0
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useValidationContext } from '@/hooks/useValidationContext';
import {
  TAKEAWAY_MANDATORY,
  DINEIN_MANDATORY,
  ECOMMERCE_MANDATORY,
} from '@/modules/achievements/constants';
import type { ValidationContext, Achievement } from '@/modules/achievements/types';

// ============================================
// MOCKS
// ============================================

// Mock stores
vi.mock('@/store/productsStore', () => ({
  useProductsStore: vi.fn((selector: any) => {
    if (typeof selector === 'function') {
      return selector({
        products: [],
      });
    }
    return { products: [] };
  }),
}));

vi.mock('@/store/staffStore', () => ({
  useStaffStore: vi.fn((selector: any) => {
    if (typeof selector === 'function') {
      return selector({
        staff: [],
      });
    }
    return { staff: [] };
  }),
}));

vi.mock('@/store/operationsStore', () => ({
  useOperationsStore: vi.fn((selector: any) => {
    if (typeof selector === 'function') {
      return selector({
        tables: [],
      });
    }
    return { tables: [] };
  }),
}));

vi.mock('@/store/salesStore', () => ({
  useSalesStore: vi.fn((selector: any) => {
    if (typeof selector === 'function') {
      return selector({
        totalSales: 0,
      });
    }
    return { totalSales: 0 };
  }),
}));

vi.mock('@/store/appStore', () => ({
  useAppStore: vi.fn((selector: any) => {
    if (typeof selector === 'function') {
      return selector({
        profile: null,
      });
    }
    return { profile: null };
  }),
}));

vi.mock('@/store/fiscalStore', () => ({
  useFiscalStore: vi.fn((selector: any) => {
    if (typeof selector === 'function') {
      return selector({
        afipStatus: null,
      });
    }
    return { afipStatus: null };
  }),
}));

vi.mock('@/store/materialsStore', () => ({
  useMaterialsStore: vi.fn((selector: any) => {
    if (typeof selector === 'function') {
      return selector({
        items: [],
      });
    }
    return { items: [] };
  }),
}));

vi.mock('@/store/assetsStore', () => ({
  useAssetsStore: vi.fn((selector: any) => {
    if (typeof selector === 'function') {
      return selector({
        items: [],
      });
    }
    return { items: [] };
  }),
}));

vi.mock('@/store/paymentsStore', () => ({
  usePaymentsStore: vi.fn((selector: any) => {
    if (typeof selector === 'function') {
      return selector({
        paymentMethods: [],
        paymentGateways: [],
      });
    }
    return { paymentMethods: [], paymentGateways: [] };
  }),
}));

vi.mock('@/store/suppliersStore', () => ({
  useSuppliersStore: vi.fn((selector: any) => {
    if (typeof selector === 'function') {
      return selector({
        suppliers: [],
      });
    }
    return { suppliers: [] };
  }),
}));

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Simula el flujo de validación de operación
 */
function validateOperation(
  action: string,
  requirements: Achievement[],
  context: ValidationContext
): {
  allowed: boolean;
  missingRequirements: Achievement[];
  totalRequired: number;
  completed: number;
} {
  const relevantRequirements = requirements.filter(
    (req) => req.blocksAction === action
  );

  const missingRequirements = relevantRequirements.filter(
    (req) => !req.validator(context)
  );

  return {
    allowed: missingRequirements.length === 0,
    missingRequirements,
    totalRequired: relevantRequirements.length,
    completed: relevantRequirements.length - missingRequirements.length,
  };
}

/**
 * Simula el checklist de requirements
 */
function generateChecklist(requirements: Achievement[], context: ValidationContext) {
  return requirements.map((req) => ({
    id: req.id,
    name: req.name,
    completed: req.validator(context),
    redirectUrl: req.redirectUrl,
    estimatedMinutes: req.estimatedMinutes,
  }));
}

// ============================================
// INTEGRATION TESTS
// ============================================

describe('Achievements System - Integration Flow', () => {
  describe('Validation Flow', () => {
    it('should validate complete TakeAway setup', () => {
      const context: ValidationContext = {
        profile: {
          businessName: 'Test Restaurant',
          address: '123 Main St',
          pickupHours: {
            monday: { open: '10:00', close: '20:00' },
          },
        },
        products: Array(5)
          .fill(null)
          .map((_, i) => ({
            id: String(i),
            name: `Product ${i}`,
            is_published: true,
          })),
        staff: [],
        paymentMethods: [{ id: '1', name: 'Cash', is_active: true }],
      };

      const result = validateOperation(
        'takeaway:toggle_public',
        TAKEAWAY_MANDATORY,
        context
      );

      expect(result.allowed).toBe(true);
      expect(result.missingRequirements).toHaveLength(0);
      expect(result.totalRequired).toBe(5);
      expect(result.completed).toBe(5);
    });

    it('should block TakeAway when missing requirements', () => {
      const incompleteContext: ValidationContext = {
        profile: {
          businessName: 'Test Restaurant',
          // Missing address
          // Missing pickupHours
        },
        products: [], // Missing products
        staff: [],
        paymentMethods: [], // Missing payment methods
      };

      const result = validateOperation(
        'takeaway:toggle_public',
        TAKEAWAY_MANDATORY,
        incompleteContext
      );

      expect(result.allowed).toBe(false);
      expect(result.missingRequirements.length).toBeGreaterThan(0);
      expect(result.completed).toBeLessThan(result.totalRequired);

      // Verify specific missing requirements
      const missingIds = result.missingRequirements.map((r) => r.id);
      expect(missingIds).toContain('takeaway_address');
      expect(missingIds).toContain('takeaway_pickup_hours');
      expect(missingIds).toContain('takeaway_min_products');
      expect(missingIds).toContain('takeaway_payment_method');
    });

    it('should validate complete Dine-In setup', () => {
      const context: ValidationContext = {
        profile: {
          businessName: 'Test Restaurant',
          operatingHours: {
            monday: { open: '09:00', close: '22:00' },
          },
        },
        products: Array(3)
          .fill(null)
          .map((_, i) => ({
            id: String(i),
            name: `Product ${i}`,
            is_published: true,
          })),
        staff: [{ id: '1', name: 'John Doe', is_active: true, role: 'staff' }],
        tables: [{ id: '1', name: 'Table 1', capacity: 4 }],
        paymentMethods: [{ id: '1', name: 'Cash', is_active: true }],
      };

      const result = validateOperation('dinein:open_shift', DINEIN_MANDATORY, context);

      expect(result.allowed).toBe(true);
      expect(result.missingRequirements).toHaveLength(0);
    });

    it('should block Dine-In when missing staff', () => {
      const noStaffContext: ValidationContext = {
        profile: {
          businessName: 'Test Restaurant',
          operatingHours: {
            monday: { open: '09:00', close: '22:00' },
          },
        },
        products: Array(3)
          .fill(null)
          .map((_, i) => ({
            id: String(i),
            name: `Product ${i}`,
            is_published: true,
          })),
        staff: [], // No staff
        tables: [{ id: '1', name: 'Table 1', capacity: 4 }],
        paymentMethods: [{ id: '1', name: 'Cash', is_active: true }],
      };

      const result = validateOperation('dinein:open_shift', DINEIN_MANDATORY, noStaffContext);

      expect(result.allowed).toBe(false);
      expect(result.missingRequirements.some((r) => r.id === 'dinein_active_staff')).toBe(
        true
      );
    });

    it('should validate E-commerce setup', () => {
      const context: ValidationContext = {
        profile: {
          businessName: 'Test Store',
          logoUrl: 'https://example.com/logo.png',
          contactEmail: 'contact@test.com',
          contactPhone: '+54 11 1234-5678',
          shippingPolicy: 'Free shipping',
          termsAndConditions: 'Terms apply',
        },
        products: Array(10)
          .fill(null)
          .map((_, i) => ({
            id: String(i),
            name: `Product ${i}`,
            is_published: true,
          })),
        staff: [],
        paymentGateways: [{ id: 'mp-1', type: 'online', is_active: true }],
      };

      const result = validateOperation(
        'ecommerce:toggle_public',
        ECOMMERCE_MANDATORY,
        context
      );

      expect(result.allowed).toBe(true);
      expect(result.missingRequirements).toHaveLength(0);
    });

    it('should block E-commerce without online gateway', () => {
      const noPosContext: ValidationContext = {
        profile: {
          businessName: 'Test Store',
          logoUrl: 'https://example.com/logo.png',
          contactEmail: 'contact@test.com',
          contactPhone: '+54 11 1234-5678',
          shippingPolicy: 'Free shipping',
          termsAndConditions: 'Terms apply',
        },
        products: Array(10)
          .fill(null)
          .map((_, i) => ({
            id: String(i),
            name: `Product ${i}`,
            is_published: true,
          })),
        staff: [],
        paymentGateways: [{ id: 'pos-1', type: 'pos', is_active: true }], // POS, not online
      };

      const result = validateOperation(
        'ecommerce:toggle_public',
        ECOMMERCE_MANDATORY,
        noPosContext
      );

      expect(result.allowed).toBe(false);
      expect(
        result.missingRequirements.some((r) => r.id === 'ecommerce_payment_gateway')
      ).toBe(true);
    });
  });

  describe('Checklist Generation', () => {
    it('should generate complete checklist with status', () => {
      const partialContext: ValidationContext = {
        profile: {
          businessName: 'Test Restaurant',
          // Missing address
        },
        products: Array(5)
          .fill(null)
          .map((_, i) => ({
            id: String(i),
            name: `Product ${i}`,
            is_published: true,
          })),
        staff: [],
        paymentMethods: [{ id: '1', name: 'Cash', is_active: true }],
      };

      const checklist = generateChecklist(TAKEAWAY_MANDATORY, partialContext);

      expect(checklist).toHaveLength(5);

      // Business name should be complete
      const businessNameItem = checklist.find(
        (item) => item.id === 'takeaway_business_name'
      );
      expect(businessNameItem?.completed).toBe(true);

      // Address should be incomplete
      const addressItem = checklist.find((item) => item.id === 'takeaway_address');
      expect(addressItem?.completed).toBe(false);
      expect(addressItem?.redirectUrl).toBe('/admin/settings/business');

      // Products should be complete
      const productsItem = checklist.find((item) => item.id === 'takeaway_min_products');
      expect(productsItem?.completed).toBe(true);
    });

    it('should include estimated time for each requirement', () => {
      const checklist = generateChecklist(TAKEAWAY_MANDATORY, {
        profile: null,
        products: [],
        staff: [],
      });

      checklist.forEach((item) => {
        expect(item.estimatedMinutes).toBeDefined();
        expect(item.estimatedMinutes).toBeGreaterThan(0);
      });

      const totalMinutes = checklist.reduce(
        (sum, item) => sum + (item.estimatedMinutes || 0),
        0
      );
      expect(totalMinutes).toBeGreaterThan(0);
    });
  });

  describe('Progress Tracking', () => {
    it('should calculate progress percentage', () => {
      const partialContext: ValidationContext = {
        profile: {
          businessName: 'Test Restaurant',
          address: '123 Main St',
          // Missing pickupHours
        },
        products: Array(5)
          .fill(null)
          .map((_, i) => ({
            id: String(i),
            name: `Product ${i}`,
            is_published: true,
          })),
        staff: [],
        // Missing paymentMethods
      };

      const result = validateOperation(
        'takeaway:toggle_public',
        TAKEAWAY_MANDATORY,
        partialContext
      );

      const progressPercentage = (result.completed / result.totalRequired) * 100;

      // Should be 60% (3/5 complete)
      expect(progressPercentage).toBe(60);
    });

    it('should track capability operational status', () => {
      const completeContext: ValidationContext = {
        profile: {
          businessName: 'Test Restaurant',
          address: '123 Main St',
          pickupHours: {
            monday: { open: '10:00', close: '20:00' },
          },
        },
        products: Array(5)
          .fill(null)
          .map((_, i) => ({
            id: String(i),
            name: `Product ${i}`,
            is_published: true,
          })),
        staff: [],
        paymentMethods: [{ id: '1', name: 'Cash', is_active: true }],
      };

      const result = validateOperation(
        'takeaway:toggle_public',
        TAKEAWAY_MANDATORY,
        completeContext
      );

      const isOperational = result.allowed;
      const readinessScore = (result.completed / result.totalRequired) * 100;

      expect(isOperational).toBe(true);
      expect(readinessScore).toBe(100);
    });
  });

  describe('Multiple Actions Blocking', () => {
    it('should validate multiple actions independently', () => {
      const context: ValidationContext = {
        profile: {
          businessName: 'Test Business',
          address: '123 Main St',
          pickupHours: {
            monday: { open: '10:00', close: '20:00' },
          },
          operatingHours: {
            monday: { open: '09:00', close: '22:00' },
          },
        },
        products: Array(5)
          .fill(null)
          .map((_, i) => ({
            id: String(i),
            name: `Product ${i}`,
            is_published: true,
          })),
        staff: [{ id: '1', name: 'John', is_active: true, role: 'staff' }],
        tables: [{ id: '1', name: 'Table 1', capacity: 4 }],
        paymentMethods: [{ id: '1', name: 'Cash', is_active: true }],
      };

      // TakeAway should be allowed
      const takeawayResult = validateOperation(
        'takeaway:toggle_public',
        TAKEAWAY_MANDATORY,
        context
      );
      expect(takeawayResult.allowed).toBe(true);

      // Dine-In should be allowed
      const dineinResult = validateOperation(
        'dinein:open_shift',
        DINEIN_MANDATORY,
        context
      );
      expect(dineinResult.allowed).toBe(true);

      // E-commerce should be blocked (needs 10 products + logo + gateway)
      const ecommerceResult = validateOperation(
        'ecommerce:toggle_public',
        ECOMMERCE_MANDATORY,
        context
      );
      expect(ecommerceResult.allowed).toBe(false);
    });
  });
});

// ============================================
// VALIDATION CONTEXT HOOK TESTS
// ============================================

describe('useValidationContext Hook', () => {
  it('should provide validation context', () => {
    const { result } = renderHook(() => useValidationContext());

    expect(result.current).toBeDefined();
    expect(result.current.profile).toBeDefined();
    expect(result.current.products).toBeDefined();
    expect(result.current.staff).toBeDefined();
    expect(result.current.paymentMethods).toBeDefined();
    expect(result.current.paymentGateways).toBeDefined();
  });

  it('should return stable references', () => {
    const { result, rerender } = renderHook(() => useValidationContext());

    const firstRender = result.current;
    rerender();
    const secondRender = result.current;

    // Profile should be stable
    expect(firstRender.profile).toBe(secondRender.profile);

    // Arrays should be stable (using useMemo)
    expect(firstRender.products).toBe(secondRender.products);
    expect(firstRender.staff).toBe(secondRender.staff);
  });
});
