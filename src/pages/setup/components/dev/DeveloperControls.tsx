import React from 'react';
import {
  Box,
  Text,
  Button,
  Flex,
  Separator,
} from '@chakra-ui/react';
import { STEP_GROUPS } from '../../config/setupSteps';
import { SystemHealth } from '../../hooks/useSetupHealth';

interface DeveloperControlsProps {
  currentGroup: number;
  currentSubStep: number;
  systemHealth: SystemHealth;
  onFillTestData: () => void;
  onResetAll: () => void;
  onJumpToGroup: (groupIndex: number) => void;
  onJumpToSubStep: (subStepIndex: number) => void;
}

export function DeveloperControls({
  currentGroup,
  currentSubStep,
  systemHealth,
  onFillTestData,
  onResetAll,
  onJumpToGroup,
  onJumpToSubStep,
}: DeveloperControlsProps) {
  // Only show in development mode
  const isDevelopmentMode = import.meta.env.DEV;
  if (!isDevelopmentMode) return null;

  return (
    <>
      <Separator my={4} />
      <Text
        fontSize="xs"
        fontWeight="medium"
        color="gray.500"
        px={2}
        mb={1}
        display={{
          base: 'none',
          md: 'block',
        }}
      >
        🛠️ DEV CONTROLS
      </Text>
      
      <Button
        size="xs"
        variant="outline"
        onClick={onFillTestData}
      >
        🧪 Fill Test Data
      </Button>
      
      <Button
        size="xs"
        variant="outline"
        onClick={onResetAll}
      >
        🔄 Reset All & Clear Progress
      </Button>
      
      {/* Progress Status */}
      <Text
        fontSize="xs"
        fontWeight="medium"
        color="purple.500"
        px={2}
        mt={2}
        mb={1}
      >
        🔍 System Health
      </Text>
      
      <Box
        p={2}
        bg="gray.100"
        borderRadius="md"
        fontSize="xs"
      >
        <Text 
          color={systemHealth.isHealthy ? "green.600" : "orange.600"} 
          fontWeight="bold"
        >
          {systemHealth.percentage}% Complete
        </Text>
        {Object.entries(systemHealth.checks).map(([key, check]) => (
          <Text key={key} color="gray.600" mt={1}>
            {check.status ? '✅' : '❌'} {check.label}
          </Text>
        ))}
      </Box>
      
      {/* Navigation Controls */}
      <Text
        fontSize="xs"
        fontWeight="medium"
        color="blue.500"
        px={2}
        mt={2}
        mb={1}
      >
        📍 Navigation
      </Text>
      
      {/* Group Navigation */}
      <Flex gap={1} flexWrap="wrap">
        {STEP_GROUPS.map((group, groupIndex) => (
          <Button
            key={group.id}
            size="xs"
            variant={currentGroup === groupIndex ? "solid" : "outline"}
            colorScheme={currentGroup === groupIndex ? "blue" : "gray"}
            onClick={() => onJumpToGroup(groupIndex)}
          >
            {groupIndex + 1}
          </Button>
        ))}
      </Flex>
      
      {/* Sub-step Navigation */}
      <Text
        fontSize="xs"
        fontWeight="medium"
        color="green.500"
        px={2}
        mt={2}
        mb={1}
      >
        🔸 Sub-steps
      </Text>
      
      <Flex gap={1} flexWrap="wrap">
        {STEP_GROUPS[currentGroup]?.subSteps.map((subStep, subIndex) => (
          <Button
            key={subStep.id}
            size="xs"
            variant={currentSubStep === subIndex ? "solid" : "outline"}
            colorScheme={currentSubStep === subIndex ? "green" : "gray"}
            onClick={() => onJumpToSubStep(subIndex)}
            title={subStep.title}
          >
            {subIndex + 1}
          </Button>
        ))}
      </Flex>
      
      {/* Quick Jump */}
      <Text
        fontSize="xs"
        fontWeight="medium"
        color="purple.500"
        px={2}
        mt={2}
        mb={1}
      >
        ⚡ Quick Jump
      </Text>
      
      <Flex gap={1} flexWrap="wrap">
        <Button
          size="xs"
          variant="outline"
          colorScheme="purple"
          onClick={() => onJumpToGroup(0)}
        >
          ⏮️ Start
        </Button>
        <Button
          size="xs"
          variant="outline"
          colorScheme="purple"
          onClick={() => onJumpToGroup(STEP_GROUPS.length - 1)}
        >
          ⏭️ End
        </Button>
      </Flex>
    </>
  );
}