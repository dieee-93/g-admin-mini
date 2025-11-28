import React from 'react';
import { Box, Flex, Text, Icon, Badge } from '@chakra-ui/react';
import { AlertTriangle, CheckCircle } from 'lucide-react';
interface AlertCardProps {
  title: string;
  description: string;
  status?: 'success' | 'warning' | 'error' | 'info';
  icon?: React.ReactElement;
}
export const AlertCard: React.FC<AlertCardProps> = ({
  title,
  description,
  status = 'info',
  icon
}) => {
  const getStatusColor = () => {
    switch (status) {
      case 'success':
        return 'green.400';
      case 'warning':
        return 'orange.400';
      case 'error':
        return 'red.400';
      default:
        return 'blue.400';
    }
  };
  const getIcon = () => {
    if (icon) return icon;
    switch (status) {
      case 'success':
        return <CheckCircle size={18} />;
      default:
        return <AlertTriangle size={18} />;
    }
  };
  return <Box bg="#152a47" borderRadius="md" p={4} borderLeft="4px solid" borderColor={getStatusColor()}>
      <Flex align="center" mb={2}>
        <Box color={getStatusColor()} mr={2}>
          {getIcon()}
        </Box>
        <Text fontWeight="medium" color="white">
          {title}
        </Text>
      </Flex>
      <Text fontSize="sm" color="whiteAlpha.700">
        {description}
      </Text>
    </Box>;
};