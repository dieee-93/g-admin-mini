import React from 'react';
import { Box } from '@chakra-ui/react';
import { motion, AnimatePresence } from 'framer-motion';
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
      <AnimatePresence>
        {planets.map((planet, index) => {
          const angle = (index / planets.length) * 2 * Math.PI - Math.PI / 2;
          const radius = 160;
          const x = `calc(${radius}px * ${Math.cos(angle)})`;
          const y = `calc(${radius}px * ${Math.sin(angle)})`;

          return (
            <motion.div
              key={planet.name}
              initial={{ scale: 0, opacity: 0 }}
              animate={{
                scale: 1,
                opacity: 1,
                x: x,
                y: y,
                transition: { type: 'spring', stiffness: 100, damping: 15 },
              }}
              exit={{ scale: 0, opacity: 0, transition: { duration: 0.3 } }}
              style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                marginTop: '-35px', // half of planet height
                marginLeft: '-35px', // half of planet width
              }}
            >
              <OperationalPlanet {...planet} />
            </motion.div>
          );
        })}
      </AnimatePresence>
    </Box>
  );
};
