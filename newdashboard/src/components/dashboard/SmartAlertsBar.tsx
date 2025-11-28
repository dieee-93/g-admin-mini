import React, { useState } from 'react';
import { Box, Flex, Text, Icon, Badge, Button, Collapse, VStack, HStack, IconButton } from '@chakra-ui/react';
import { AlertTriangle, ChevronDown, ChevronUp, X } from 'lucide-react';
interface Alert {
  id: string;
  title: string;
  severity: 'critical' | 'warning' | 'info';
  message: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}
interface SmartAlertsBarProps {
  alerts?: Alert[];
  onDismiss?: (id: string) => void;
}
export const SmartAlertsBar: React.FC<SmartAlertsBarProps> = ({
  alerts = [],
  onDismiss
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  if (alerts.length === 0) return null;
  const criticalCount = alerts.filter(a => a.severity === 'critical').length;
  const warningCount = alerts.filter(a => a.severity === 'warning').length;
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'red.400';
      case 'warning':
        return 'orange.400';
      default:
        return 'blue.400';
    }
  };
  return <Box bg="#152a47" borderRadius="2xl" overflow="hidden" mb={6} border="1px solid" borderColor={criticalCount > 0 ? 'red.400' : 'orange.400'} boxShadow={criticalCount > 0 ? '0 4px 12px rgba(245, 101, 101, 0.2)' : '0 4px 12px rgba(237, 137, 54, 0.2)'}>
      {/* Collapsed View */}
      <Flex p={4} align="center" justify="space-between" cursor="pointer" onClick={() => setIsExpanded(!isExpanded)} _hover={{
      bg: 'whiteAlpha.50'
    }} transition="all 0.2s">
        <HStack spacing={4}>
          <Icon as={AlertTriangle} color={criticalCount > 0 ? 'red.400' : 'orange.400'} boxSize={6} />
          <Box>
            <Text fontSize="md" fontWeight="bold" color="white">
              {alerts.length} Alerta{alerts.length !== 1 ? 's' : ''} Activa
              {alerts.length !== 1 ? 's' : ''}
            </Text>
            <HStack spacing={3} mt={1}>
              {criticalCount > 0 && <Badge colorScheme="red" fontSize="xs">
                  {criticalCount} Crítica{criticalCount !== 1 ? 's' : ''}
                </Badge>}
              {warningCount > 0 && <Badge colorScheme="orange" fontSize="xs">
                  {warningCount} Advertencia{warningCount !== 1 ? 's' : ''}
                </Badge>}
            </HStack>
          </Box>
        </HStack>
        <Icon as={isExpanded ? ChevronUp : ChevronDown} color="whiteAlpha.600" boxSize={5} />
      </Flex>
      {/* Expanded View */}
      <Collapse in={isExpanded}>
        <Box borderTop="1px solid" borderColor="whiteAlpha.100" bg="#0a1929" p={4}>
          <VStack spacing={3} align="stretch">
            {alerts.map(alert => <Flex key={alert.id} p={4} bg="#152a47" borderRadius="lg" borderLeft="3px solid" borderColor={getSeverityColor(alert.severity)} justify="space-between" align="start">
                <Box flex={1}>
                  <Flex align="center" mb={2}>
                    <Badge colorScheme={alert.severity === 'critical' ? 'red' : alert.severity === 'warning' ? 'orange' : 'blue'} mr={3}>
                      {alert.severity.toUpperCase()}
                    </Badge>
                    <Text fontWeight="semibold" color="white">
                      {alert.title}
                    </Text>
                  </Flex>
                  <Text fontSize="sm" color="whiteAlpha.700" mb={3}>
                    {alert.message}
                  </Text>
                  {alert.action && <Button size="sm" colorScheme={alert.severity === 'critical' ? 'red' : alert.severity === 'warning' ? 'orange' : 'blue'} onClick={alert.action.onClick}>
                      {alert.action.label}
                    </Button>}
                </Box>
                {onDismiss && <IconButton aria-label="Dismiss alert" icon={<X size={16} />} size="sm" variant="ghost" color="whiteAlpha.600" _hover={{
              color: 'white',
              bg: 'whiteAlpha.100'
            }} onClick={() => onDismiss(alert.id)} />}
              </Flex>)}
          </VStack>
        </Box>
      </Collapse>
    </Box>;
};