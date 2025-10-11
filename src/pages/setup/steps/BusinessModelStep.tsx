/**
 * BUSINESS MODEL STEP - v5.0 ATOMIC
 *
 * Permite al usuario seleccionar capabilities atómicas e infrastructure.
 * Conectado con el sistema de atomic capabilities v2.0.
 *
 * @version 5.0.0 - Atomic Capabilities System
 * @see docs/ATOMIC_CAPABILITIES_DESIGN.md
 */

import React, { useState } from 'react';
import { ContentLayout, Section, Stack, Button, Badge } from '@/shared/ui';
import { useNavigate } from 'react-router-dom';
import { useCapabilities } from '@/store/capabilityStore';
import type { BusinessCapabilityId, InfrastructureId } from '@/config/types';
import {
  getAllCapabilities,
  getAllInfrastructures
} from '@/config/BusinessModelRegistry';

export default function BusinessModelStep() {
  const navigate = useNavigate();
  const { profile, setCapabilities, setInfrastructure, initializeProfile, completeSetup } = useCapabilities();

  // Obtener capabilities e infrastructures del registry
  const CAPABILITIES = getAllCapabilities();
  const INFRASTRUCTURE = getAllInfrastructures();

  // Initialize profile if not exists
  React.useEffect(() => {
    if (!profile) {
      initializeProfile({
        businessName: 'Mi Negocio',
        businessType: 'retail',
        email: '',
        phone: '',
        country: 'Argentina',
        currency: 'ARS',
        selectedActivities: [], // Legacy - será migrado a selectedCapabilities
        selectedInfrastructure: ['single_location'],
        setupCompleted: false,
        isFirstTimeInDashboard: false,
        onboardingStep: 0
      });
    }
  }, [profile, initializeProfile]);

  // State local para las selecciones
  const [selectedCapabilities, setSelectedCapabilities] = useState<BusinessCapabilityId[]>(
    profile?.selectedActivities || []
  );

  const [selectedInfra, setSelectedInfra] = useState<InfrastructureId>(
    profile?.selectedInfrastructure?.[0] || 'single_location'
  );

  const handleCapabilityToggle = (capabilityId: BusinessCapabilityId) => {
    setSelectedCapabilities(prev => {
      if (prev.includes(capabilityId)) {
        return prev.filter(id => id !== capabilityId);
      } else {
        return [...prev, capabilityId];
      }
    });
  };

  const handleInfraChange = (infraId: InfrastructureId) => {
    setSelectedInfra(infraId);
  };

  const handleContinue = async () => {
    // Guardar selecciones en el store
    setCapabilities(selectedCapabilities);
    setInfrastructure(selectedInfra);

    // Mark setup as completed
    await completeSetup();

    // Navigate to dashboard with first-time flag
    navigate('/admin/dashboard', {
      state: { isFirstTime: true },
      replace: true
    });
  };

  const isCapabilitySelected = (id: BusinessCapabilityId) => selectedCapabilities.includes(id);

  return (
    <ContentLayout spacing="normal">
      <Stack gap={8}>
        {/* Header */}
        <Section variant="flat">
          <Stack gap={3}>
            <h2 style={{ fontSize: '28px', fontWeight: 'bold', color: '#1a202c' }}>
              🎯 ¿Cómo opera tu negocio?
            </h2>
            <p style={{ fontSize: '16px', color: '#718096' }}>
              Seleccioná las capacidades que necesitás. El sistema activará automáticamente las funcionalidades correspondientes.
            </p>
          </Stack>
        </Section>

        {/* Capabilities Selection */}
        <Section variant="elevated" title="Capacidades de Negocio">
          <Stack gap={4}>
            <p style={{ fontSize: '14px', color: '#718096', marginBottom: '12px' }}>
              Podés combinar libremente las capacidades que necesites
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
              {CAPABILITIES.map((capability) => (
                <div
                  key={capability.id}
                  onClick={() => handleCapabilityToggle(capability.id)}
                  style={{
                    padding: '20px',
                    borderWidth: '2px',
                    borderStyle: 'solid',
                    borderColor: isCapabilitySelected(capability.id) ? '#3182ce' : '#e2e8f0',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    backgroundColor: isCapabilitySelected(capability.id) ? '#ebf8ff' : 'white',
                    transition: 'all 0.2s'
                  }}
                >
                  <Stack gap={2}>
                    <div style={{ fontSize: '32px' }}>{capability.icon}</div>
                    <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#2d3748' }}>
                      {capability.name}
                    </div>
                    <div style={{ fontSize: '14px', color: '#718096' }}>
                      {capability.description}
                    </div>
                    {isCapabilitySelected(capability.id) && (
                      <Badge colorScheme="blue" style={{ width: 'fit-content' }}>
                        ✓ Seleccionado
                      </Badge>
                    )}
                  </Stack>
                </div>
              ))}
            </div>
          </Stack>
        </Section>

        {/* Infrastructure Selection */}
        <Section variant="elevated" title="Infraestructura">
          <Stack gap={4}>
            <p style={{ fontSize: '14px', color: '#718096', marginBottom: '12px' }}>
              Seleccioná cómo opera físicamente tu negocio
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '16px' }}>
              {INFRASTRUCTURE.map((infra) => (
                <div
                  key={infra.id}
                  onClick={() => handleInfraChange(infra.id)}
                  style={{
                    padding: '20px',
                    borderWidth: '2px',
                    borderStyle: 'solid',
                    borderColor: selectedInfra === infra.id ? '#38a169' : '#e2e8f0',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    backgroundColor: selectedInfra === infra.id ? '#f0fff4' : 'white',
                    transition: 'all 0.2s',
                    opacity: infra.conflicts && infra.conflicts.length > 0 ? 1 : 1 // Preparado para mostrar conflicts
                  }}
                >
                  <Stack gap={2}>
                    <div style={{ fontSize: '32px' }}>{infra.icon}</div>
                    <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#2d3748' }}>
                      {infra.name}
                    </div>
                    <div style={{ fontSize: '14px', color: '#718096' }}>
                      {infra.description}
                    </div>
                    {selectedInfra === infra.id && (
                      <Badge colorScheme="green" style={{ width: 'fit-content' }}>
                        ✓ Seleccionado
                      </Badge>
                    )}
                  </Stack>
                </div>
              ))}
            </div>
          </Stack>
        </Section>

        {/* Summary & Continue */}
        <Section variant="flat">
          <Stack gap={4}>
            <div style={{
              padding: '16px',
              backgroundColor: '#edf2f7',
              borderRadius: '8px',
              borderLeft: '4px solid #3182ce'
            }}>
              <Stack gap={2}>
                <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#2d3748' }}>
                  Resumen de tu selección:
                </div>
                <div style={{ fontSize: '14px', color: '#4a5568' }}>
                  • {selectedCapabilities.length} capacidad{selectedCapabilities.length !== 1 ? 'es' : ''} seleccionada{selectedCapabilities.length !== 1 ? 's' : ''}
                </div>
                <div style={{ fontSize: '14px', color: '#4a5568' }}>
                  • Infraestructura: {INFRASTRUCTURE.find(i => i.id === selectedInfra)?.name}
                </div>
                {selectedCapabilities.length > 0 && (
                  <div style={{ fontSize: '13px', color: '#718096', marginTop: '8px', fontStyle: 'italic' }}>
                    El sistema activará automáticamente las funcionalidades necesarias para tus capacidades seleccionadas
                  </div>
                )}
              </Stack>
            </div>

            <Button
              size="lg"
              colorScheme="blue"
              onClick={handleContinue}
              isDisabled={selectedCapabilities.length === 0}
              style={{ marginTop: '16px' }}
            >
              Continuar →
            </Button>

            {selectedCapabilities.length === 0 && (
              <p style={{ fontSize: '14px', color: '#e53e3e', textAlign: 'center' }}>
                Seleccioná al menos una capacidad para continuar
              </p>
            )}
          </Stack>
        </Section>
      </Stack>
    </ContentLayout>
  );
}
