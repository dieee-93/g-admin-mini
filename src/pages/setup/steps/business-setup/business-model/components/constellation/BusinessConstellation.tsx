import React from 'react';
import { Box } from '@chakra-ui/react';
import { ArchetypeStar } from './ArchetypeStar';
import { OperationalPlanet } from './OperationalPlanet';

interface OperationalProfileItem {
  name: string;
  isUnlocked: boolean;
  icon: string;
}

interface BusinessConstellationProps {
  archetype: string;
  operationalProfile: OperationalProfileItem[];
}

export const BusinessConstellation: React.FC<BusinessConstellationProps> = ({ archetype, operationalProfile }) => {
  // Filter out the 'Escala Local' profile from the planets
  const planets = operationalProfile.filter(p => p.name !== 'Escala Local');

  return (
    <Box
      position="relative"
      w="100%"
      h={{ base: '450px', md: '400px' }}
      display="flex"
      alignItems="center"
      justifyContent="center"
    >
      <ArchetypeStar name={archetype} />
      {planets.map((planet, index) => {
        const angle = (index / planets.length) * 2 * Math.PI - Math.PI / 2; // Start from top
        const radius = { base: 140, md: 160 };
        const x = `calc(${radius.md}px * ${Math.cos(angle)})`;
        const y = `calc(${radius.md}px * ${Math.sin(angle)})`;

        return (
          <Box
            key={planet.name}
            position="absolute"
            top="50%"
            left="50%"
            transform={`translate(-50%, -50%) translate(${x}, ${y})`}
            transition="transform 0.5s ease-out"
          >
            <OperationalPlanet {...planet} />
          </Box>
        );
      })}
    </Box>
  );
};
