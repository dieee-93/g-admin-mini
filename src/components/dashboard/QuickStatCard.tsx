// src/components/dashboard/QuickStatsCard.tsx
import { 
  Box, 
  Text, 
  VStack, 
  Skeleton 
} from '@chakra-ui/react';
import { type QuickStatsCardProps } from '@/types/ui';

export function QuickStatsCard({ 
  title, 
  value, 
  subtitle, 
  color = "blue", 
  loading = false 
}: QuickStatsCardProps) {
  return (
    <Box
      borderWidth="1px"
      borderRadius="lg"
      p={4}
      bg="white"
      shadow="sm"
      borderColor={`${color}.200`}
    >
      <VStack align="start" spacing={2}>
        <Text fontSize="sm" color="gray.600" fontWeight="medium">
          {title}
        </Text>
        
        <Skeleton isLoaded={!loading}>
          <Text 
            fontSize="2xl" 
            fontWeight="bold" 
            color={`${color}.600`}
          >
            {loading ? "---" : value}
          </Text>
        </Skeleton>
        
        <Text fontSize="xs" color="gray.500">
          {subtitle}
        </Text>
      </VStack>
    </Box>
  );
}