// src/components/dashboard/QuickStatCard.tsx - Chakra UI v3
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
      <VStack align="start" gap="2">
        <Text fontSize="sm" color="gray.600" fontWeight="medium">
          {title}
        </Text>
        
        {loading ? (
          <Skeleton height="8" width="20" />
        ) : (
          <Text 
            fontSize="2xl" 
            fontWeight="bold" 
            color={`${color}.600`}
          >
            {value}
          </Text>
        )}
        
        <Text fontSize="xs" color="gray.500">
          {subtitle}
        </Text>
      </VStack>
    </Box>
  );
}