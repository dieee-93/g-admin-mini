import { useState } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Card,
  Button,
  Grid,
  Badge
} from '@chakra-ui/react';
import { Collapsible } from '@chakra-ui/react';
import { 
  ChevronDownIcon, 
  ChevronUpIcon,
  CogIcon
} from '@heroicons/react/24/outline';

interface SummaryMetric {
  id: string;
  label: string;
  value: string | number;
  icon?: React.ComponentType<any>;
  status?: 'success' | 'warning' | 'error' | 'info';
  subtitle?: string;
}

interface SummaryPanelProps {
  title: string;
  metrics: SummaryMetric[];
  status?: {
    text: string;
    type: 'online' | 'warning' | 'error';
  };
  onConfigure?: () => void;
  defaultExpanded?: boolean;
}

export function SummaryPanel({
  title,
  metrics,
  status,
  onConfigure,
  defaultExpanded = false
}: SummaryPanelProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  const getStatusColor = (type: string) => {
    switch (type) {
      case 'online': return 'green';
      case 'warning': return 'orange';
      case 'error': return 'red';
      default: return 'gray';
    }
  };

  const getStatusDot = (type: string) => {
    const color = getStatusColor(type);
    return (
      <Box
        w="8px"
        h="8px"
        borderRadius="full"
        bg={`${color}.500`}
        animation={type === 'online' ? 'pulse 2s infinite' : undefined}
      />
    );
  };

  const formatValue = (value: string | number) => {
    if (typeof value === 'number') {
      return value.toLocaleString();
    }
    return value;
  };

  return (
    <Card.Root variant="elevated" bg={{ base: "white", _dark: "gray.800" }} border="1px solid" borderColor={{ base: "gray.200", _dark: "gray.700" }}>
      <Card.Header 
        cursor="pointer" 
        onClick={() => setIsExpanded(!isExpanded)}
        _hover={{ bg: { base: 'gray.50', _dark: 'gray.700' } }}
        transition="background 0.2s"
      >
        <HStack justify="space-between" w="full">
          <HStack gap="3">
            <Text fontSize="lg" fontWeight="semibold" color={{ base: "gray.700", _dark: "gray.200" }}>
              🎯 {title}
            </Text>
            {status && (
              <HStack gap="2" align="center">
                {getStatusDot(status.type)}
                <Text fontSize="sm" color={`${getStatusColor(status.type)}.600`} fontWeight="medium">
                  {status.text}
                </Text>
              </HStack>
            )}
          </HStack>
          
          <HStack gap="2">
            {onConfigure && (
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onConfigure();
                }}
              >
                <CogIcon style={{ width: '16px', height: '16px', marginRight: '6px' }} />
                Configurar
              </Button>
            )}
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              {isExpanded ? (
                <ChevronUpIcon style={{ width: '20px', height: '20px' }} />
              ) : (
                <ChevronDownIcon style={{ width: '20px', height: '20px' }} />
              )}
            </Button>
          </HStack>
        </HStack>
      </Card.Header>

      <Collapsible.Root open={isExpanded}>
        <Collapsible.Content>
          <Card.Body pt="0">
            <Grid 
              templateColumns={{ 
                base: "1fr", 
                md: "repeat(2, 1fr)", 
                lg: "repeat(4, 1fr)" 
              }} 
              gap="4"
            >
              {metrics.map((metric) => {
                const IconComponent = metric.icon;
                
                return (
                  <Box key={metric.id} p="4" bg={{ base: "gray.50", _dark: "gray.700" }} borderRadius="md">
                    <VStack align="start" gap="2">
                      <HStack gap="2" align="center">
                        {IconComponent && (
                          <IconComponent style={{ width: '18px', height: '18px', color: 'var(--chakra-colors-gray-600)' }} />
                        )}
                        <Text fontSize="sm" color={{ base: "gray.600", _dark: "gray.300" }} fontWeight="medium">
                          {metric.label}
                        </Text>
                        {metric.status && (
                          <Badge 
                            colorPalette={metric.status === 'success' ? 'green' : 
                                         metric.status === 'warning' ? 'orange' : 
                                         metric.status === 'error' ? 'red' : 'blue'} 
                            variant="subtle" 
                            size="sm"
                          />
                        )}
                      </HStack>
                      
                      <Text fontSize="xl" fontWeight="bold" color={{ base: "gray.900", _dark: "gray.50" }}>
                        {formatValue(metric.value)}
                      </Text>
                      
                      {metric.subtitle && (
                        <Text fontSize="xs" color={{ base: "gray.500", _dark: "gray.400" }}>
                          {metric.subtitle}
                        </Text>
                      )}
                    </VStack>
                  </Box>
                );
              })}
            </Grid>
          </Card.Body>
        </Collapsible.Content>
      </Collapsible.Root>
    </Card.Root>
  );
}