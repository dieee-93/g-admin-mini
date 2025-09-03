import React from 'react';
import { Stack, Text, SimpleGrid } from '@chakra-ui/react';
import {
  BoltIcon,
  CubeIcon,
  UsersIcon,
  CalendarIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/outline';
import { CapabilityCard } from './CapabilityCard';
import { SubCapabilityOption } from './SubCapabilityOption';
import { BusinessCapabilities } from '../config/businessCapabilities';

interface CapabilitySelectorProps {
  capabilities: BusinessCapabilities;
  expandedCards: Record<string, boolean>;
  onToggleMain: (key: keyof BusinessCapabilities) => void;
  onToggleSub: (key: keyof BusinessCapabilities) => void;
  onToggleCard: (cardName: string) => void;
}

export function CapabilitySelector({
  capabilities,
  expandedCards,
  onToggleMain,
  onToggleSub,
  onToggleCard,
}: CapabilitySelectorProps) {
  return (
    <Stack gap={4}>
      <Stack gap={1}>
        <Text
          fontWeight="medium"
          fontSize="md"
          display="flex"
          alignItems="center"
        >
          <BoltIcon width={16} height={16} color="gray.600" style={{ marginRight: 8 }} />
          Actividades principales
        </Text>
        <Text fontSize="sm" color="gray.600">
          Selecciona las actividades principales de tu negocio
        </Text>
      </Stack>

      {/* Core Capabilities Grid */}
      <SimpleGrid
        columns={{
          base: 1,
          md: 2,
        }}
        gap={4}
      >
        {/* Products Card */}
        <CapabilityCard
          icon={<CubeIcon width={20} height={20} />}
          title="Productos"
          description="Venta de ítems físicos o digitales"
          isSelected={capabilities.sells_products}
          isExpanded={expandedCards.products}
          onSelect={() => {
            onToggleMain('sells_products');
            if (!capabilities.sells_products && !expandedCards.products) {
              onToggleCard('products');
            }
          }}
          onToggle={() => onToggleCard('products')}
        >
          <SimpleGrid
            columns={{
              base: 1,
              sm: 2,
            }}
            gap={3}
          >
            <SubCapabilityOption
              label="Consumo en local"
              isChecked={capabilities.sells_products_for_onsite_consumption}
              onChange={() => onToggleSub('sells_products_for_onsite_consumption')}
            />
            <SubCapabilityOption
              label="Retiro en tienda"
              isChecked={capabilities.sells_products_for_pickup}
              onChange={() => onToggleSub('sells_products_for_pickup')}
            />
            <SubCapabilityOption
              label="Envío a domicilio"
              isChecked={capabilities.sells_products_with_delivery}
              onChange={() => onToggleSub('sells_products_with_delivery')}
            />
            <SubCapabilityOption
              label="Productos digitales"
              isChecked={capabilities.sells_digital_products}
              onChange={() => onToggleSub('sells_digital_products')}
            />
          </SimpleGrid>
        </CapabilityCard>

        {/* Services Card */}
        <CapabilityCard
          icon={<UsersIcon width={20} height={20} />}
          title="Servicios"
          description="Prestación de servicios personalizados"
          isSelected={capabilities.sells_services}
          isExpanded={expandedCards.services}
          onSelect={() => {
            onToggleMain('sells_services');
            if (!capabilities.sells_services && !expandedCards.services) {
              onToggleCard('services');
            }
          }}
          onToggle={() => onToggleCard('services')}
        >
          <SimpleGrid
            columns={{
              base: 1,
              sm: 2,
            }}
            gap={3}
          >
            <SubCapabilityOption
              label="Servicios por cita"
              isChecked={capabilities.sells_services_by_appointment}
              onChange={() => onToggleSub('sells_services_by_appointment')}
            />
            <SubCapabilityOption
              label="Clases/Sesiones"
              isChecked={capabilities.sells_services_by_class}
              onChange={() => onToggleSub('sells_services_by_class')}
            />
            <SubCapabilityOption
              label="Alquiler de espacio"
              isChecked={capabilities.sells_space_by_reservation}
              onChange={() => onToggleSub('sells_space_by_reservation')}
            />
          </SimpleGrid>
        </CapabilityCard>

        {/* Events Card */}
        <CapabilityCard
          icon={<CalendarIcon width={20} height={20} />}
          title="Eventos"
          description="Organización y gestión de eventos"
          isSelected={capabilities.manages_events}
          isExpanded={expandedCards.events}
          onSelect={() => {
            onToggleMain('manages_events');
            if (!capabilities.manages_events && !expandedCards.events) {
              onToggleCard('events');
            }
          }}
          onToggle={() => onToggleCard('events')}
        >
          <SimpleGrid
            columns={{
              base: 1,
              sm: 2,
            }}
            gap={3}
          >
            <SubCapabilityOption
              label="Catering externo"
              isChecked={capabilities.manages_offsite_catering}
              onChange={() => onToggleSub('manages_offsite_catering')}
            />
            <SubCapabilityOption
              label="Eventos privados"
              isChecked={capabilities.hosts_private_events}
              onChange={() => onToggleSub('hosts_private_events')}
            />
          </SimpleGrid>
        </CapabilityCard>

        {/* Recurrence/Assets Card */}
        <CapabilityCard
          icon={<ArrowPathIcon width={20} height={20} />}
          title="Recurrencia"
          description="Modelos de ingresos recurrentes"
          isSelected={capabilities.manages_recurrence}
          isExpanded={expandedCards.assets}
          onSelect={() => {
            onToggleMain('manages_recurrence');
            if (!capabilities.manages_recurrence && !expandedCards.assets) {
              onToggleCard('assets');
            }
          }}
          onToggle={() => onToggleCard('assets')}
        >
          <SimpleGrid
            columns={{
              base: 1,
              sm: 2,
            }}
            gap={3}
          >
            <SubCapabilityOption
              label="Alquileres"
              isChecked={capabilities.manages_rentals}
              onChange={() => onToggleSub('manages_rentals')}
            />
            <SubCapabilityOption
              label="Membresías"
              isChecked={capabilities.manages_memberships}
              onChange={() => onToggleSub('manages_memberships')}
            />
            <SubCapabilityOption
              label="Suscripciones"
              isChecked={capabilities.manages_subscriptions}
              onChange={() => onToggleSub('manages_subscriptions')}
            />
          </SimpleGrid>
        </CapabilityCard>
      </SimpleGrid>
    </Stack>
  );
}