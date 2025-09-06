import React from 'react';
import { VStack, Circle, Text, Tooltip } from '@chakra-ui/react';
import { LockClosedIcon } from '@heroicons/react/24/outline';

interface OperationalPlanetProps {
  name: string;
  isUnlocked: boolean;
  icon: string;
}

export const OperationalPlanet: React.FC<OperationalPlanetProps> = ({ name, isUnlocked, icon }) => {
  const finalBg = isUnlocked ? 'blue.400' : 'gray.300';
  const finalColor = 'white';
  const opacity = isUnlocked ? 1 : 0.7;
  const textName = name.replace(' / Nómada', '');

  const tooltipContent = isUnlocked 
    ? `${name} - Disponible` 
    : `${name} - Bloqueado. Completa los milestones requeridos para desbloquear.`;

  return (
    <Tooltip.Root
      openDelay={300}
      closeDelay={100}
      positioning={{ placement: 'top' }}
    >
      <Tooltip.Trigger asChild>
        <VStack
          gap={1}
          opacity={opacity}
          textAlign="center"
          w={{ base: '60px', md: '70px' }}
          transition="all 0.3s ease"
          cursor="pointer"
          _hover={{
            transform: 'translateY(-2px)',
            opacity: isUnlocked ? 1 : 0.8
          }}
        >
          <Circle
            size={{ base: '50px', md: '60px' }}
            bg={finalBg}
            color={finalColor}
            boxShadow="md"
            border="2px solid"
            borderColor={isUnlocked ? 'blue.500' : 'gray.400'}
            transition="all 0.3s ease"
            _hover={{
              boxShadow: isUnlocked ? 'lg' : 'md',
              borderColor: isUnlocked ? 'blue.600' : 'gray.500'
            }}
          >
            {isUnlocked ? (
              <Text fontSize={{ base: 'xl', md: '2xl' }}>{icon}</Text>
            ) : (
              <LockClosedIcon style={{ width: '20px', height: '20px', color: '#9CA3AF' }} />
            )}
          </Circle>
          <Text
            fontSize={{ base: '10px', md: 'xs' }}
            fontWeight="medium"
            color="gray.700"
            lineHeight="1.2"
          >
            {textName}
          </Text>
        </VStack>
      </Tooltip.Trigger>
      <Tooltip.Positioner>
        <Tooltip.Content
          bg={isUnlocked ? 'blue.600' : 'gray.600'}
          color="white"
          fontSize="sm"
          borderRadius="md"
          px={3}
          py={2}
        >
          <Tooltip.Arrow>
            <Tooltip.ArrowTip />
          </Tooltip.Arrow>
          {tooltipContent}
        </Tooltip.Content>
      </Tooltip.Positioner>
    </Tooltip.Root>
  );
};
