import React from 'react';
import {
  Stack,
  Text,
  SimpleGrid,
  Switch,
  VStack,
  Collapse,
  Divider,
  Box,
} from '@chakra-ui/react';
import {
  BoltIcon,
  CubeIcon,
  UsersIcon,
  CalendarIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/outline';
import { SubCapabilityOption } from './SubCapabilityOption';
import { useBusinessCapabilities } from '../hooks/useBusinessCapabilities';

interface CapabilitiesStepProps {
  businessModel: ReturnType<typeof useBusinessCapabilities>;
  selectedCompetencies: {
    products: boolean;
    services: boolean;
    events: boolean;
    recurrence: boolean;
  };
  handleCompetencyChange: (competency: keyof CapabilitiesStepProps['selectedCompetencies']) => void;
}

const CompetencySection = ({ title, icon, isEnabled, onToggle, children }) => (
  <Box>
    <Stack>
      <HStack justify="space-between">
        <HStack>
          {icon}
          <Text fontWeight="medium">{title}</Text>
        </HStack>
        <Switch isChecked={isEnabled} onChange={onToggle} />
      </HStack>
      <Collapse in={isEnabled} animateOpacity>
        <Box pl={8} pt={4}>
          <Divider />
          <Box pt={4}>
            {children}
          </Box>
        </Box>
      </Collapse>
    </Stack>
  </Box>
);

export const CapabilitiesStep: React.FC<CapabilitiesStepProps> = ({
  businessModel,
  selectedCompetencies,
  handleCompetencyChange,
}) => {
  const { capabilities, toggleSubCapability } = businessModel;

  return (
    <VStack spacing={6} align="stretch">
      <CompetencySection
        title="Venta de Productos"
        icon={<CubeIcon width={20} height={20} />}
        isEnabled={selectedCompetencies.products}
        onToggle={() => handleCompetencyChange('products')}
      >
        <SimpleGrid columns={{ base: 1, sm: 2 }} gap={3}>
          <SubCapabilityOption
            label="Consumo en local"
            isChecked={capabilities.sells_products_for_onsite_consumption}
            onChange={() => toggleSubCapability('sells_products_for_onsite_consumption')}
          />
          <SubCapabilityOption
            label="Retiro en tienda"
            isChecked={capabilities.sells_products_for_pickup}
            onChange={() => toggleSubCapability('sells_products_for_pickup')}
          />
          <SubCapabilityOption
            label="Envío a domicilio"
            isChecked={capabilities.sells_products_with_delivery}
            onChange={() => toggleSubCapability('sells_products_with_delivery')}
          />
          <SubCapabilityOption
            label="Productos digitales"
            isChecked={capabilities.sells_digital_products}
            onChange={() => toggleSubCapability('sells_digital_products')}
          />
        </SimpleGrid>
      </CompetencySection>

      <CompetencySection
        title="Venta de Servicios"
        icon={<UsersIcon width={20} height={20} />}
        isEnabled={selectedCompetencies.services}
        onToggle={() => handleCompetencyChange('services')}
      >
        <SimpleGrid columns={{ base: 1, sm: 2 }} gap={3}>
          <SubCapabilityOption
            label="Servicios por cita"
            isChecked={capabilities.sells_services_by_appointment}
            onChange={() => toggleSubCapability('sells_services_by_appointment')}
          />
          <SubCapabilityOption
            label="Clases/Sesiones"
            isChecked={capabilities.sells_services_by_class}
            onChange={() => toggleSubCapability('sells_services_by_class')}
          />
          <SubCapabilityOption
            label="Alquiler de espacio"
            isChecked={capabilities.sells_space_by_reservation}
            onChange={() => toggleSubCapability('sells_space_by_reservation')}
          />
        </SimpleGrid>
      </CompetencySection>

      <CompetencySection
        title="Gestión de Eventos"
        icon={<CalendarIcon width={20} height={20} />}
        isEnabled={selectedCompetencies.events}
        onToggle={() => handleCompetencyChange('events')}
      >
        <SimpleGrid columns={{ base: 1, sm: 2 }} gap={3}>
          <SubCapabilityOption
            label="Catering externo"
            isChecked={capabilities.manages_offsite_catering}
            onChange={() => toggleSubCapability('manages_offsite_catering')}
          />
          <SubCapabilityOption
            label="Eventos privados"
            isChecked={capabilities.hosts_private_events}
            onChange={() => toggleSubCapability('hosts_private_events')}
          />
        </SimpleGrid>
      </CompetencySection>

      <CompetencySection
        title="Gestión de Recurrencia"
        icon={<ArrowPathIcon width={20} height={20} />}
        isEnabled={selectedCompetencies.recurrence}
        onToggle={() => handleCompetencyChange('recurrence')}
      >
        <SimpleGrid columns={{ base: 1, sm: 2 }} gap={3}>
          <SubCapabilityOption
            label="Alquileres"
            isChecked={capabilities.manages_rentals}
            onChange={() => toggleSubCapability('manages_rentals')}
          />
          <SubCapabilityOption
            label="Membresías"
            isChecked={capabilities.manages_memberships}
            onChange={() => toggleSubCapability('manages_memberships')}
          />
          <SubCapabilityOption
            label="Suscripciones"
            isChecked={capabilities.manages_subscriptions}
            onChange={() => toggleSubCapability('manages_subscriptions')}
          />
        </SimpleGrid>
      </CompetencySection>
    </VStack>
  );
};
