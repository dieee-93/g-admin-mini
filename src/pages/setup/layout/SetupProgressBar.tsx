import React from 'react';
import { Box, Flex, Text, Progress } from '@chakra-ui/react';

interface SetupProgressBarProps {
  progressPercentage: number;
  currentStep: number;
  totalSteps: number;
}

export function SetupProgressBar({ 
  progressPercentage, 
  currentStep, 
  totalSteps 
}: SetupProgressBarProps) {
  return (
    <Box
      mb="6"
      display={{
        base: 'block',
        md: 'none',
      }}
    >
      <Progress.Root
        value={progressPercentage}
        size="sm"
        colorPalette="gray"
      >
        <Progress.Track>
          <Progress.Range />
        </Progress.Track>
      </Progress.Root>
      <Flex justify="space-between" mt="2">
        <Text fontSize="xs" color="gray.500">
          Paso {currentStep} de {totalSteps}
        </Text>
        <Text fontSize="xs" color="gray.500">
          {Math.round(progressPercentage)}% completado
        </Text>
      </Flex>
    </Box>
  );
}