import {
  Box,
  VStack,
  HStack,
  Text,
  Card,
  Badge,
  Skeleton
} from '@chakra-ui/react';
import type { MetricCardProps } from '@/modules/dashboard/types/dashboard.types';

export function MetricCard({
  title,
  value,
  subtitle,
  additionalInfo,
  icon: Icon,
  iconColor,
  iconBg,
  onClick,
  badge,
  isLoading = false
}: MetricCardProps) {
  return (
    <Card.Root 
      variant="elevated"
      bg={{ base: "white", _dark: "gray.800" }}
      borderColor={{ base: "gray.200", _dark: "gray.700" }}
      cursor={onClick ? "pointer" : "default"}
      onClick={onClick}
      _hover={onClick ? { shadow: "lg", transform: "translateY(-2px)" } : {}}
      transition="all 0.2s"
    >
      <Card.Body>
        <VStack align="start" gap="3">
          <HStack justify="space-between" w="full">
            <Box p="2" bg={iconBg} borderRadius="md">
              <Icon style={{ width: '24px', height: '24px', color: iconColor }} />
            </Box>
            {badge && (
              <Badge 
                colorPalette={badge.colorPalette} 
                variant={badge.variant || "solid"}
              >
                {badge.value}
              </Badge>
            )}
          </HStack>
          
          <VStack align="start" gap="1" w="full">
            <Skeleton isLoaded={!isLoading}>
              <Text fontSize="2xl" fontWeight="bold" color={{ base: "gray.900", _dark: "gray.50" }}>
                {typeof value === 'number' ? value.toLocaleString() : value}
              </Text>
            </Skeleton>
            
            <Skeleton isLoaded={!isLoading}>
              <Text fontSize="sm" color={{ base: "gray.600", _dark: "gray.300" }}>{title}</Text>
            </Skeleton>
            
            {additionalInfo && (
              <Skeleton isLoaded={!isLoading}>
                <Text fontSize="xs" color={iconColor} fontWeight="medium">
                  {additionalInfo}
                </Text>
              </Skeleton>
            )}
            
            {subtitle && (
              <Skeleton isLoaded={!isLoading}>
                <Text fontSize="xs" color={{ base: "gray.500", _dark: "gray.400" }}>
                  {subtitle}
                </Text>
              </Skeleton>
            )}
          </VStack>
        </VStack>
      </Card.Body>
    </Card.Root>
  );
}