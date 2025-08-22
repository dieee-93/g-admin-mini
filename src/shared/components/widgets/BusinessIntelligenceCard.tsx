import {
  Box,
  VStack,
  HStack,
  Text,
  Card,
  Button
} from '@chakra-ui/react';
import type { BusinessIntelligenceCardProps } from '@/modules/dashboard/types/dashboard.types';

export function BusinessIntelligenceCard({
  title,
  description,
  icon: Icon,
  colorPalette,
  onClick,
  actionLabel = "Open Analysis"
}: BusinessIntelligenceCardProps) {
  return (
    <Card.Root 
      variant="outline" 
      cursor="pointer"
      onClick={onClick}
      _hover={{ shadow: "lg", transform: "translateY(-2px)" }}
      transition="all 0.2s"
    >
      <Card.Body p="4">
        <VStack align="start" gap="3">
          <HStack gap="3">
            <Box p="2" bg={`${colorPalette}.100`} borderRadius="md">
              <Icon style={{ 
                width: '20px', 
                height: '20px', 
                color: `var(--chakra-colors-${colorPalette}-600)` 
              }} />
            </Box>
            <VStack align="start" gap="0">
              <Text fontWeight="bold">{title}</Text>
              <Text fontSize="sm" color="gray.600">{description}</Text>
            </VStack>
          </HStack>
          <Button 
            size="sm" 
            variant="outline" 
            colorPalette={colorPalette} 
            w="full"
            onClick={(e) => {
              e.stopPropagation();
              onClick();
            }}
          >
            {actionLabel}
          </Button>
        </VStack>
      </Card.Body>
    </Card.Root>
  );
}