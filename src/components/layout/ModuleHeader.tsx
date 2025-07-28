// src/components/layout/ModuleHeader.tsx
import { Box, Button, Heading, Flex } from '@chakra-ui/react';
import { type ModuleHeaderProps } from '@/types/ui';

export function ModuleHeader({ title, color, onBack }: ModuleHeaderProps) {
  return (
    <Box 
      bg={`${color}.50`} 
      borderBottom="1px" 
      borderColor={`${color}.200`}
      p={4}
      mb={4}
    >
      <Flex alignItems="center" justify="space-between">
        <Heading 
          size="lg" 
          color={`${color}.600`}
        >
          {title}
        </Heading>
        
        <Button 
          variant="outline" 
          colorScheme={color}
          size="sm"
          onClick={onBack}
        >
          ← Volver al Dashboard
        </Button>
      </Flex>
    </Box>
  );
}