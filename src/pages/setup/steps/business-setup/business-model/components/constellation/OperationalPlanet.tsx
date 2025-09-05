import React from 'react';
import { VStack, Circle, Text, Tooltip } from '@chakra-ui/react';
import { LockIcon } from '@chakra-ui/icons';

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

  return (
    <Tooltip label={name} placement="top" hasArrow>
      <VStack
        gap={1}
        opacity={opacity}
        textAlign="center"
        w={{ base: '60px', md: '70px' }}
        transition="opacity 0.3s"
      >
        <Circle
          size={{ base: '50px', md: '60px' }}
          bg={finalBg}
          color={finalColor}
          boxShadow="md"
          border="2px solid"
          borderColor={isUnlocked ? 'blue.500' : 'gray.400'}
        >
          {isUnlocked ? <Text fontSize={{ base: 'xl', md: '2xl' }}>{icon}</Text> : <LockIcon w={5} h={5} color="gray.600" />}
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
    </Tooltip>
  );
};
