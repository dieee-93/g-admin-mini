import React from 'react';
import { Box, Flex, Text, Badge, Button, Icon, HStack } from '@chakra-ui/react';
interface InsightCardProps {
  title: string;
  description: string;
  metric?: string;
  metricLabel?: string;
  tags?: string[];
  actionLabel?: string;
  icon?: React.ReactElement;
  positive?: boolean;
  onAction?: () => void;
}
export const InsightCard: React.FC<InsightCardProps> = ({
  title,
  description,
  metric,
  metricLabel,
  tags = [],
  actionLabel,
  icon,
  positive = true,
  onAction
}) => {
  return <Box bg="#152a47" p={6} borderRadius="2xl" borderLeft="4px solid" borderColor={positive ? 'green.400' : 'orange.400'} transition="all 0.3s" _hover={{
    transform: 'translateY(-4px)',
    boxShadow: '0 8px 16px rgba(0, 0, 0, 0.3)'
  }}>
      <Flex justify="space-between" align="start" mb={4}>
        <Box flex={1}>
          <Text fontSize="lg" fontWeight="bold" color="white" mb={2}>
            {title}
          </Text>
          <Text fontSize="sm" color="whiteAlpha.700" lineHeight="tall">
            {description}
          </Text>
        </Box>
        {icon && <Box p={2} borderRadius="lg" bg={positive ? 'green.400' : 'orange.400'} color="white" ml={4}>
            {icon}
          </Box>}
      </Flex>
      {metric && <Flex align="baseline" mb={4}>
          <Text fontSize="2xl" fontWeight="bold" color={positive ? 'green.400' : 'orange.400'}>
            {metric}
          </Text>
          {metricLabel && <Text fontSize="sm" color="whiteAlpha.500" ml={2}>
              {metricLabel}
            </Text>}
        </Flex>}
      <HStack spacing={2} flexWrap="wrap" mb={actionLabel ? 4 : 0}>
        {tags.map(tag => <Badge key={tag} size="sm" colorScheme="blue" variant="subtle" px={2} py={1} borderRadius="full" fontSize="xs">
            {tag}
          </Badge>)}
      </HStack>
      {actionLabel && <Button size="sm" colorScheme={positive ? 'green' : 'orange'} variant="outline" width="full" onClick={onAction} fontWeight="medium">
          {actionLabel}
        </Button>}
    </Box>;
};