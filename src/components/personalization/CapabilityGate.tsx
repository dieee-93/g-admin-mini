/**
 * Componente CapabilityGate - Renderizado condicional basado en capacidades
 * Permite mostrar/ocultar contenido según las capacidades del negocio
 */

import React from 'react';
import { usePersonalizedExperience } from '@/hooks/usePersonalizedExperience';
import type { BusinessCapabilities } from '@/types/businessCapabilities';

interface CapabilityGateProps {
  children: React.ReactNode;
  
  // Capacidades requeridas (OR logic)
  requires?: Array<keyof BusinessCapabilities>;
  
  // Capacidades que deben estar todas presentes (AND logic)
  requiresAll?: Array<keyof BusinessCapabilities>;
  
  // Features específicas requeridas
  requiresFeatures?: string[];
  
  // Tier mínimo requerido
  minTier?: 'Base Operativa' | 'Estructura Funcional' | 'Negocio Integrado' | 'Sistema Consolidado';
  
  // Componente a mostrar cuando no se cumplen los requisitos
  fallback?: React.ReactNode;
  
  // Mostrar explicación de por qué no se puede ver
  showReason?: boolean;
}

export function CapabilityGate({
  children,
  requires,
  requiresAll,
  requiresFeatures,
  minTier,
  fallback,
  showReason = false
}: CapabilityGateProps) {
  const { hasCapability, shouldShowFeature, tier, enabledFeatures } = usePersonalizedExperience();

  // Verificar capacidades individuales (OR logic)
  const hasRequiredCapabilities = requires 
    ? requires.some(capability => hasCapability(capability))
    : true;

  // Verificar que todas las capacidades estén presentes (AND logic)
  const hasAllRequiredCapabilities = requiresAll
    ? requiresAll.every(capability => hasCapability(capability))
    : true;

  // Verificar features específicas
  const hasRequiredFeatures = requiresFeatures
    ? requiresFeatures.every(feature => shouldShowFeature(feature))
    : true;

  // Verificar tier mínimo
  const tierLevels = {
    'Base Operativa': 1,
    'Estructura Funcional': 2,
    'Negocio Integrado': 3,
    'Sistema Consolidado': 4
  };
  
  const currentTierLevel = tierLevels[tier as keyof typeof tierLevels] || 0;
  const requiredTierLevel = minTier ? tierLevels[minTier] : 0;
  
  const hasTierRequirement = currentTierLevel >= requiredTierLevel;

  // Determinar si se debe mostrar el contenido
  const shouldShow = hasRequiredCapabilities && 
                    hasAllRequiredCapabilities && 
                    hasRequiredFeatures && 
                    hasTierRequirement;

  if (shouldShow) {
    return <>{children}</>;
  }

  // Si se especifica un fallback, mostrarlo
  if (fallback) {
    return <>{fallback}</>;
  }

  // Si se debe mostrar la razón, crear un mensaje explicativo
  if (showReason) {
    const reasons = [];
    
    if (!hasRequiredCapabilities && requires) {
      reasons.push(`Requiere alguna de estas capacidades: ${requires.join(', ')}`);
    }
    
    if (!hasAllRequiredCapabilities && requiresAll) {
      reasons.push(`Requiere todas estas capacidades: ${requiresAll.join(', ')}`);
    }
    
    if (!hasRequiredFeatures && requiresFeatures) {
      reasons.push(`Requiere estas funcionalidades: ${requiresFeatures.join(', ')}`);
    }
    
    if (!hasTierRequirement && minTier) {
      reasons.push(`Requiere tier mínimo: ${minTier} (actual: ${tier})`);
    }

    return (
      <div style={{ 
        padding: '1rem', 
        background: '#f8f9fa', 
        border: '1px solid #dee2e6', 
        borderRadius: '8px',
        color: '#6c757d',
        fontSize: '0.875rem'
      }}>
        <strong>Funcionalidad no disponible</strong>
        <ul style={{ margin: '0.5rem 0', paddingLeft: '1.5rem' }}>
          {reasons.map((reason, index) => (
            <li key={index}>{reason}</li>
          ))}
        </ul>
      </div>
    );
  }

  // Por defecto, no mostrar nada
  return null;
}

// Componente de conveniencia para casos comunes
export function PhysicalPresenceGate({ children, fallback }: { children: React.ReactNode; fallback?: React.ReactNode }) {
  return (
    <CapabilityGate requires={['has_physical_presence']} fallback={fallback}>
      {children}
    </CapabilityGate>
  );
}

export function DeliveryGate({ children, fallback }: { children: React.ReactNode; fallback?: React.ReactNode }) {
  return (
    <CapabilityGate requires={['has_delivery_logistics']} fallback={fallback}>
      {children}
    </CapabilityGate>
  );
}

export function OnlineStoreGate({ children, fallback }: { children: React.ReactNode; fallback?: React.ReactNode }) {
  return (
    <CapabilityGate requires={['has_online_store']} fallback={fallback}>
      {children}
    </CapabilityGate>
  );
}

export function SchedulingGate({ children, fallback }: { children: React.ReactNode; fallback?: React.ReactNode }) {
  return (
    <CapabilityGate requires={['has_scheduling_system']} fallback={fallback}>
      {children}
    </CapabilityGate>
  );
}

// Hook para usar en lógica condicional sin JSX
export function useCapabilityCheck() {
  const { hasCapability, shouldShowFeature, tier } = usePersonalizedExperience();
  
  return {
    can: (capability: keyof BusinessCapabilities) => hasCapability(capability),
    hasFeature: (feature: string) => shouldShowFeature(feature),
    canAccessTier: (minTier: string) => {
      const tierLevels = {
        'Base Operativa': 1,
        'Estructura Funcional': 2,
        'Negocio Integrado': 3,
        'Sistema Consolidado': 4
      };
      
      const currentLevel = tierLevels[tier as keyof typeof tierLevels] || 0;
      const requiredLevel = tierLevels[minTier as keyof typeof tierLevels] || 0;
      
      return currentLevel >= requiredLevel;
    },
    tier
  };
}