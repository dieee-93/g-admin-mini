import { useState, useCallback, useMemo } from 'react';
import { 
  BusinessCapabilities, 
  BusinessStructure, 
  BusinessModelData,
  defaultCapabilities,
  validationRules
} from '../config/businessCapabilities';
import { 
  determineBusinessArchetypes,
  getOperationalProfile,
  getInsightMessage,
} from '../config/businessLogic';

export interface UseBusinessCapabilitiesReturn {
  // State
  capabilities: BusinessCapabilities;
  businessStructure: Record<BusinessStructure, boolean>;
  expandedCards: Record<string, boolean>;

  // Computed values
  archetypes: string[];
  operationalProfile: string[];
  insightMessage: string | null;
  canSubmit: boolean;

  // Actions
  toggleMainCapability: (key: keyof BusinessCapabilities) => void;
  toggleSubCapability: (key: keyof BusinessCapabilities) => void;
  toggleBusinessStructure: (structure: BusinessStructure) => void;
  toggleCard: (cardName: string) => void;
  resetCapabilities: () => void;

  // Data export
  getBusinessModelData: () => BusinessModelData;
}

export function useBusinessCapabilities(): UseBusinessCapabilitiesReturn {
  const [capabilities, setCapabilities] = useState<BusinessCapabilities>(defaultCapabilities);
  const [businessStructure, setBusinessStructureState] = useState({
    single_location: true,
    multi_location: false,
    mobile: false,
  });
  const [expandedCards, setExpandedCards] = useState({
    products: false,
    services: false,
    events: false,
    assets: false,
  });

  const toggleMainCapability = useCallback((key: keyof BusinessCapabilities) => {
    setCapabilities((prev) => {
      const newValue = !prev[key];
      const newCapabilities = { ...prev, [key]: newValue };
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

  const toggleSubCapability = useCallback((key: keyof BusinessCapabilities) => {
    setCapabilities((prev) => ({ ...prev, [key]: !prev[key] }));
  }, []);

  const toggleBusinessStructure = useCallback((structure: BusinessStructure) => {
    setBusinessStructureState(prev => {
      const newState = { ...prev, [structure]: !prev[structure] };
      if (structure === 'single_location' && newState.single_location) {
        newState.multi_location = false;
      } else if (structure === 'multi_location' && newState.multi_location) {
        newState.single_location = false;
      }
      return newState;
    });
  }, []);

  const toggleCard = useCallback((cardName: string) => {
    setExpandedCards((prev) => ({ ...prev, [cardName]: !prev[cardName] }));
  }, []);

  const resetCapabilities = useCallback(() => {
    setCapabilities(defaultCapabilities);
    setBusinessStructureState({
      single_location: true,
      multi_location: false,
      mobile: false,
    });
    setExpandedCards({ products: false, services: false, events: false, assets: false });
  }, []);

  const getActiveStructures = useCallback(() => {
    return Object.keys(businessStructure).filter(k => businessStructure[k as BusinessStructure]) as BusinessStructure[];
  }, [businessStructure]);

  const archetypes = useMemo(() => determineBusinessArchetypes(capabilities), [capabilities]);

  const operationalProfile = useMemo(() =>
    getOperationalProfile(capabilities, getActiveStructures()),
    [capabilities, getActiveStructures]
  );
  
  const insightMessage = useMemo(() => 
    getInsightMessage(capabilities, getActiveStructures()),
    [capabilities, getActiveStructures]
  );
  
  const canSubmit = useMemo(() => 
    validationRules.requiresAtLeastOneMainCapability(capabilities), 
    [capabilities]
  );

  const getBusinessModelData = useCallback((): BusinessModelData => ({
    ...capabilities,
    business_structure: getActiveStructures(),
  }), [capabilities, getActiveStructures]);

  return {
    capabilities,
    businessStructure,
    expandedCards,
    archetypes,
    operationalProfile,
    insightMessage,
    canSubmit,
    toggleMainCapability,
    toggleSubCapability,
    toggleBusinessStructure,
    toggleCard,
    resetCapabilities,
    getBusinessModelData,
  };
}