import React from 'react';
import { VStack, Circle, Heading, Text, Tooltip } from '@chakra-ui/react';

interface ArchetypeStarProps {
  name: string;
}

const archetypeConfig = {
  'Restaurante/Bar': { icon: '🍽️', description: "El núcleo de tu negocio es la comida y la bebida." },
  'Tienda Minorista': { icon: '🛍️', description: "Te dedicas a la venta de productos al por menor." },
  'Proveedor de Servicios': { icon: '👥', description: "Ofreces tu tiempo y habilidades como servicio." },
  'Centro de Experiencias': { icon: '🎉', description: "Creas y gestionas eventos y experiencias únicas." },
  'Negocio Digital': { icon: '💻', description: "Tu negocio opera principalmente en el mundo digital." },
  'Negocio': { icon: '🏢', description: "Define la actividad principal de tu negocio para empezar." }
};

export const ArchetypeStar: React.FC<ArchetypeStarProps> = ({ name }) => {
  const config = archetypeConfig[name] || archetypeConfig['Negocio'];

  return (
    <VStack gap={2} textAlign="center">
      <Tooltip.Root positioning={{ placement: 'top' }}>
        <Tooltip.Trigger asChild>
          <Circle
            size={{ base: '100px', md: '120px' }}
            bg="yellow.300"
            boxShadow="lg"
            border="3px solid"
            borderColor="yellow.400"
          >
            <Text fontSize={{ base: '4xl', md: '5xl' }}>{config.icon}</Text>
          </Circle>
        </Tooltip.Trigger>
        <Tooltip.Positioner>
          <Tooltip.Content
            bg="gray.800"
            color="white"
            fontSize="sm"
            borderRadius="md"
            px={3}
            py={2}
          >
            <Tooltip.Arrow>
              <Tooltip.ArrowTip />
            </Tooltip.Arrow>
            {config.description}
          </Tooltip.Content>
        </Tooltip.Positioner>
      </Tooltip.Root>
      <Heading size="sm" mt={2} color="gray.800">{name}</Heading>
    </VStack>
  );
};
