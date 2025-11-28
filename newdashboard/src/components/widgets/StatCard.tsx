import React from 'react';
import { Box, Flex, Text, Icon } from '@chakra-ui/react';
interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ReactElement;
  accentColor?: string;
  footer?: string;
  footerValue?: string;
  footerColor?: string;
  trend?: {
    value: string;
    isPositive: boolean;
  };
}
export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  accentColor = 'blue.400',
  footer,
  footerValue,
  footerColor,
  trend
}) => {
  return <Box bg="#152a47" p={6} borderRadius="2xl" borderLeft="4px solid" borderColor={accentColor} transition="all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)" _hover={{
    transform: 'translateY(-4px)',
    boxShadow: '0 8px 16px rgba(0, 0, 0, 0.3)'
  }}>
      <Flex justify="space-between" align="start" mb={4}>
        <Box flex={1}>
          <Text fontSize="sm" color="whiteAlpha.600" fontWeight="medium" mb={2}>
            {title}
          </Text>
          <Text fontSize="3xl" fontWeight="bold" color="white" lineHeight="1">
            {value}
          </Text>
          {subtitle && <Text fontSize="xs" color="whiteAlpha.500" mt={2}>
              {subtitle}
            </Text>}
        </Box>
        {icon && <Box p={3} borderRadius="xl" bg="whiteAlpha.100" color={accentColor}>
            {icon}
          </Box>}
      </Flex>
      {trend && <Flex align="center" mb={2}>
          <Text fontSize="sm" fontWeight="semibold" color={trend.isPositive ? 'green.400' : 'red.400'}>
            {trend.isPositive ? '↑' : '↓'} {trend.value}
          </Text>
          <Text fontSize="xs" color="whiteAlpha.500" ml={2}>
            vs período anterior
          </Text>
        </Flex>}
      {(footer || footerValue) && <Flex justify="space-between" align="center" pt={4} borderTop="1px solid" borderColor="whiteAlpha.100">
          {footer && <Text fontSize="xs" color="whiteAlpha.500" fontWeight="medium">
              {footer}
            </Text>}
          {footerValue && <Text fontSize="sm" fontWeight="semibold" color={footerColor || 'white'}>
              {footerValue}
            </Text>}
        </Flex>}
    </Box>;
};