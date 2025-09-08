import React from 'react';
import {
  Stack,
  Text,
  SimpleGrid,
} from '@chakra-ui/react';
import {
  ChartBarIcon,
  ShoppingCartIcon,
  BuildingOfficeIcon,
  HomeIcon,
  BuildingStorefrontIcon,
  TruckIcon,
} from '@heroicons/react/24/outline';
import { ChannelOption } from './ChannelOption';
import { StructureOption } from './StructureOption';
import { useBusinessCapabilities } from '../hooks/useBusinessCapabilities';

interface StepProfileProps {
  businessModel: ReturnType<typeof useBusinessCapabilities>;
}

export const StepProfile: React.FC<StepProfileProps> = ({ businessModel }) => {
  return (
    <Stack gap={4}>
      <Stack gap={1}>
        <Text
          fontWeight="medium"
          fontSize="md"
          display="flex"
          alignItems="center"
        >
          <ChartBarIcon width={16} height={16} color="gray.600" style={{ marginRight: 8 }} />
          Canales y estructura
        </Text>
        <Text fontSize="sm" color="gray.600">
          Define cómo interactúas con tus clientes y cómo está organizado tu negocio
        </Text>
      </Stack>

      {/* Channels */}
      <SimpleGrid
        columns={{
          base: 1,
          md: 2,
        }}
        gap={4}
      >
        <ChannelOption
          icon={<ShoppingCartIcon width={18} height={18} />}
          title="Tienda Online"
          description="Ventas a través de internet"
          isChecked={businessModel.capabilities.has_online_store}
          onChange={() => businessModel.toggleSubCapability('has_online_store')}
        />
        <ChannelOption
          icon={<BuildingOfficeIcon width={18} height={18} />}
          title="Enfoque B2B"
          description="Ventas a otras empresas"
          isChecked={businessModel.capabilities.is_b2b_focused}
          onChange={() => businessModel.toggleSubCapability('is_b2b_focused')}
        />
      </SimpleGrid>

      {/* Business Structure */}
      <Stack gap={3} mt={2}>
        <Text fontSize="sm" fontWeight="medium" color="gray.600">
          Estructura del negocio
        </Text>
        <SimpleGrid
          columns={{
            base: 1,
            md: 3,
          }}
          gap={4}
        >
          <StructureOption
            icon={<HomeIcon width={18} height={18} />}
            title="Local único"
            description="Una ubicación física"
            isSelected={businessModel.businessStructure.single_location}
            onClick={() => businessModel.toggleBusinessStructure('single_location')}
          />
          <StructureOption
            icon={<BuildingStorefrontIcon width={18} height={18} />}
            title="Múltiples locales"
            description="Sucursales o franquicias"
            isSelected={businessModel.businessStructure.multi_location}
            onClick={() => businessModel.toggleBusinessStructure('multi_location')}
          />
          <StructureOption
            icon={<TruckIcon width={18} height={18} />}
            title="Negocio móvil"
            description="Sin ubicación fija"
            isSelected={businessModel.businessStructure.mobile}
            onClick={() => businessModel.toggleBusinessStructure('mobile')}
          />
        </SimpleGrid>
      </Stack>
    </Stack>
  );
};
