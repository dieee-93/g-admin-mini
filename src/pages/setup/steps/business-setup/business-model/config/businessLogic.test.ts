import { describe, it, expect } from 'vitest';
import { determineBusinessArchetypes, getOperationalProfile } from './businessLogic';
import { BusinessCapabilities, BusinessStructure } from './businessCapabilities';
import { defaultCapabilities } from './businessCapabilities';

describe('Business Logic Engine', () => {
  describe('determineBusinessArchetypes', () => {
    it('should return "Restaurante" for onsite consumption capability', () => {
      const capabilities: BusinessCapabilities = { ...defaultCapabilities, sells_products_for_onsite_consumption: true };
      expect(determineBusinessArchetypes(capabilities)).toContain('Restaurante');
    });

    it('should return "Negocio Digital" for digital products capability', () => {
      const capabilities: BusinessCapabilities = { ...defaultCapabilities, sells_digital_products: true };
      expect(determineBusinessArchetypes(capabilities)).toContain('Negocio Digital');
    });

    it('should return "Servicios por Cita" for appointment services capability', () => {
      const capabilities: BusinessCapabilities = { ...defaultCapabilities, sells_services_by_appointment: true };
      expect(determineBusinessArchetypes(capabilities)).toContain('Servicios por Cita');
    });

    it('should return multiple archetypes for mixed capabilities', () => {
      const capabilities: BusinessCapabilities = { ...defaultCapabilities, hosts_private_events: true, sells_services_by_class: true };
      expect(determineBusinessArchetypes(capabilities)).toEqual(expect.arrayContaining(['Organizador de Eventos', 'Centro de Formación']));
    });

    it('should return "Tienda Minorista" for pickup capability', () => {
      const capabilities: BusinessCapabilities = { ...defaultCapabilities, sells_products_for_pickup: true };
      expect(determineBusinessArchetypes(capabilities)).toContain('Tienda Minorista');
    });

    it('should return ["Negocio"] as a default archetype', () => {
      const capabilities: BusinessCapabilities = { ...defaultCapabilities };
      expect(determineBusinessArchetypes(capabilities)).toEqual(['Negocio']);
    });
  });

  describe('getOperationalProfile', () => {
    it('should return a profile with "Escala Local" for a single location structure', () => {
      const profile = getOperationalProfile(defaultCapabilities, ['single_location']);
      expect(profile).toContain('Escala Local');
    });

    it('should return a profile with "Multi-Sucursal" for a multi-location structure', () => {
      const profile = getOperationalProfile(defaultCapabilities, ['multi_location']);
      expect(profile).toContain('Multi-Sucursal');
    });

    it('should return a profile with "Móvil / Nómada" for a mobile structure', () => {
      const profile = getOperationalProfile(defaultCapabilities, ['mobile']);
      expect(profile).toContain('Móvil / Nómada');
    });

    it('should handle hybrid structures like multi-location and mobile', () => {
      const profile = getOperationalProfile(defaultCapabilities, ['multi_location', 'mobile']);
      expect(profile).toContain('Multi-Sucursal');
      expect(profile).toContain('Móvil / Nómada');
    });

    it('should include "E-commerce Asincrónico" if has_online_store is true', () => {
      const capabilities = { ...defaultCapabilities, has_online_store: true };
      const profile = getOperationalProfile(capabilities, ['single_location']);
      expect(profile).toContain('E-commerce Asincrónico');
    });

    it('should include "Canal Digital Sincrónico" if sells_products_with_delivery is true', () => {
      const capabilities = { ...defaultCapabilities, sells_products_with_delivery: true };
      const profile = getOperationalProfile(capabilities, ['single_location']);
      expect(profile).toContain('Canal Digital Sincrónico');
    });

    it('should include "Enfoque B2B" if is_b2b_focused is true', () => {
      const capabilities = { ...defaultCapabilities, is_b2b_focused: true };
      const profile = getOperationalProfile(capabilities, ['single_location']);
      expect(profile).toContain('Enfoque B2B');
    });

    it('should return a complex profile with multiple dimensions', () => {
      const capabilities = {
        ...defaultCapabilities,
        has_online_store: true,
        is_b2b_focused: true
      };
      const profile = getOperationalProfile(capabilities, ['multi_location']);
      expect(profile).toEqual(expect.arrayContaining([
        'E-commerce Asincrónico',
        'Multi-Sucursal',
        'Enfoque B2B'
      ]));
    });
  });
});
