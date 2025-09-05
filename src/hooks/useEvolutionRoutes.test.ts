import { renderHook } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { useEvolutionRoutes } from './useEvolutionRoutes';
import { useBusinessProfile } from '../store/useBusinessProfile';
import type { BusinessProfile } from '../pages/setup/steps/business-setup/business-model/config/businessCapabilities';
import { defaultCapabilities } from '../pages/setup/steps/business-setup/business-model/config/businessCapabilities';

// Mock the business profile store
vi.mock('../store/useBusinessProfile');

const mockBaseProfile: BusinessProfile = {
  businessName: 'Test Biz',
  businessType: 'Retail',
  email: 'test@test.com',
  phone: '123456',
  country: 'AR',
  currency: 'ARS',
  capabilities: {
    ...defaultCapabilities,
    sells_products_for_onsite_consumption: true, // Archetype: Restaurante/Bar
    sells_products_with_delivery: true, // Profile: Canal Digital Sincrónico (locked)
    has_online_store: true, // Profile: E-commerce Asincrónico (locked)
  },
  businessStructure: 'single_location', // Profile: Escala Local
  setupCompleted: false,
  onboardingStep: 1,
  customizations: {
    milestonesCompleted: [],
    enabledModules: [],
    tutorialsCompleted: [],
    dashboardLayout: 'default',
  },
};

describe('useEvolutionRoutes Hook', () => {
  it('should return isLoading true when the profile is loading', () => {
    vi.mocked(useBusinessProfile).mockReturnValue({ profile: null, isLoading: true });
    const { result } = renderHook(() => useEvolutionRoutes());
    expect(result.current.isLoading).toBe(true);
    expect(result.current.suggestedRoutes).toEqual([]);
  });

  it('should return empty suggestions if profile is not available', () => {
    vi.mocked(useBusinessProfile).mockReturnValue({ profile: null, isLoading: false });
    const { result } = renderHook(() => useEvolutionRoutes());
    expect(result.current.suggestedRoutes).toEqual([]);
  });

  it('should suggest routes for locked planets with associated milestones', () => {
    vi.mocked(useBusinessProfile).mockReturnValue({ profile: mockBaseProfile, isLoading: false });
    const { result } = renderHook(() => useEvolutionRoutes());

    expect(result.current.isLoading).toBe(false);
    expect(result.current.suggestedRoutes.length).toBe(2);

    const ecommerceRoute = result.current.suggestedRoutes.find(r => r.planetName === 'E-commerce Asincrónico');
    expect(ecommerceRoute).toBeDefined();
    expect(ecommerceRoute?.milestone.id).toBe('setup-payment-gateway');

    const deliveryRoute = result.current.suggestedRoutes.find(r => r.planetName === 'Canal Digital Sincrónico');
    expect(deliveryRoute).toBeDefined();
    expect(deliveryRoute?.milestone.id).toBe('configure-delivery-zones');
  });

  it('should not suggest routes for planets that are already unlocked', () => {
    const profileWithCompletedMilestone: BusinessProfile = {
      ...mockBaseProfile,
      customizations: {
        ...mockBaseProfile.customizations,
        milestonesCompleted: ['setup-payment-gateway'], // Unlock E-commerce
      },
    };
    vi.mocked(useBusinessProfile).mockReturnValue({ profile: profileWithCompletedMilestone, isLoading: false });
    const { result } = renderHook(() => useEvolutionRoutes());

    expect(result.current.suggestedRoutes.length).toBe(1);
    const ecommerceRoute = result.current.suggestedRoutes.find(r => r.planetName === 'E-commerce Asincrónico');
    expect(ecommerceRoute).toBeUndefined();
  });

  it('should prioritize "Configuración Esencial" milestones', () => {
    vi.mocked(useBusinessProfile).mockReturnValue({ profile: mockBaseProfile, isLoading: false });
    const { result } = renderHook(() => useEvolutionRoutes());

    // Both suggested milestones in mockBaseProfile are 'Configuración Esencial', so order isn't guaranteed
    // but we can check that they are all from that category
    expect(result.current.suggestedRoutes[0].milestone.category).toBe('Configuración Esencial');
    expect(result.current.suggestedRoutes[1].milestone.category).toBe('Configuración Esencial');
  });

  it('should return a maximum of 3 suggestions', () => {
    const complexProfile: BusinessProfile = {
        ...mockBaseProfile,
        capabilities: {
            ...mockBaseProfile.capabilities,
            is_b2b_focused: true, // Planet: Enfoque B2B (Primeros Pasos)
            sells_services_by_appointment: true, // Another planet to ensure we have more than 3
        },
        businessStructure: 'multi_location', // Planet: Multi-Sucursal
    };
    vi.mocked(useBusinessProfile).mockReturnValue({ profile: complexProfile, isLoading: false });
    const { result } = renderHook(() => useEvolutionRoutes());

    expect(result.current.suggestedRoutes.length).toBe(3);
  });
});
