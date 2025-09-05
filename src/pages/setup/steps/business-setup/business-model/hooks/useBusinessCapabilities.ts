import { useState, useCallback, useMemo } from 'react';
import { 
  BusinessCapabilities, 
  BusinessStructure, 
  BusinessModelData,
  defaultCapabilities,
  validationRules
} from '../config/businessCapabilities';
import { 
  determineBusinessArchetype,
  getOperationalProfile,
  getInsightMessage,
} from '../config/businessLogic';

export interface UseBusinessCapabilitiesReturn {
  // State
  capabilities: BusinessCapabilities;
  businessStructure: BusinessStructure;
  expandedCards: Record<string, boolean>;
  
  // Computed values
  archetype: string;
  operationalProfile: string[];
  insightMessage: string | null;
  canSubmit: boolean;
  
  // Actions
  toggleMainCapability: (key: keyof BusinessCapabilities) => void;
  toggleSubCapability: (key: keyof BusinessCapabilities) => void;
  setBusinessStructure: (structure: BusinessStructure) => void;
  toggleCard: (cardName: string) => void;
  resetCapabilities: () => void;
  
  // Data export
  getBusinessModelData: () => BusinessModelData;
}

export function useBusinessCapabilities(): UseBusinessCapabilitiesReturn {
  const [capabilities, setCapabilities] = useState<BusinessCapabilities>(defaultCapabilities);
  const [businessStructure, setBusinessStructureState] = useState<BusinessStructure>('single_location');
  const [expandedCards, setExpandedCards] = useState({
    products: false,
    services: false,
    events: false,
    assets: false,
  });

  // Toggle main capability and handle sub-capabilities
  const toggleMainCapability = useCallback((key: keyof BusinessCapabilities) => {
    setCapabilities((prev) => {
      const newValue = !prev[key];
      const newCapabilities = {
        ...prev,
        [key]: newValue,
      };

      // If a main capability is deactivated, also deactivate its sub-options
      if (!newValue) {
        if (key === 'sells_products') {
          newCapabilities.sells_products_for_onsite_consumption = false;
          newCapabilities.sells_products_for_pickup = false;
          newCapabilities.sells_products_with_delivery = false;
          newCapabilities.sells_digital_products = false;
        } else if (key === 'sells_services') {
          newCapabilities.sells_services_by_appointment = false;
          newCapabilities.sells_services_by_class = false;
          newCapabilities.sells_space_by_reservation = false;
        } else if (key === 'manages_events') {
          newCapabilities.manages_offsite_catering = false;
          newCapabilities.hosts_private_events = false;
        } else if (key === 'manages_recurrence') {
          newCapabilities.manages_rentals = false;
          newCapabilities.manages_memberships = false;
          newCapabilities.manages_subscriptions = false;
        }
      }
      return newCapabilities;
    });
  }, []);

  // Toggle sub-capability
  const toggleSubCapability = useCallback((key: keyof BusinessCapabilities) => {
    setCapabilities((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  }, []);

  // Set business structure
  const setBusinessStructure = useCallback((structure: BusinessStructure) => {
    setBusinessStructureState(structure);
  }, []);

  // Toggle card expansion
  const toggleCard = useCallback((cardName: string) => {
    setExpandedCards((prev) => ({
      ...prev,
      [cardName]: !prev[cardName],
    }));
  }, []);

  // Reset all capabilities
  const resetCapabilities = useCallback(() => {
    setCapabilities(defaultCapabilities);
    setBusinessStructureState('single_location');
    setExpandedCards({
      products: false,
      services: false,
      events: false,
      assets: false,
    });
  }, []);

  // Computed values
  const archetype = useMemo(() =>
    determineBusinessArchetype(capabilities),
    [capabilities]
  );

  const operationalProfile = useMemo(() =>
    getOperationalProfile(capabilities, businessStructure),
    [capabilities, businessStructure]
  );
  
  const insightMessage = useMemo(() => 
    getInsightMessage(capabilities, businessStructure), 
    [capabilities, businessStructure]
  );
  
  const canSubmit = useMemo(() => 
    validationRules.requiresAtLeastOneMainCapability(capabilities), 
    [capabilities]
  );

  // Export complete business model data
  const getBusinessModelData = useCallback((): BusinessModelData => ({
    ...capabilities,
    business_structure: businessStructure,
  }), [capabilities, businessStructure]);

  return {
    // State
    capabilities,
    businessStructure,
    expandedCards,
    
    // Computed values
    archetype,
    operationalProfile,
    insightMessage,
    canSubmit,
    
    // Actions
    toggleMainCapability,
    toggleSubCapability,
    setBusinessStructure,
    toggleCard,
    resetCapabilities,
    
    // Data export
    getBusinessModelData,
  };
}