import {
  Box,
  VStack,
  HStack,
  Text,
  Card,
  Button,
  Badge
} from '@chakra-ui/react';
import { 
  ArrowTrendingUpIcon, 
  ArrowTrendingDownIcon,
  EyeIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';

interface HeroMetricCardProps {
  title: string;
  value: string | number;
  change?: {
    value: number;
    period: string;
    type: 'increase' | 'decrease' | 'neutral';
  };
  icon: React.ComponentType<any>;
  iconColor: string;
  iconBg: string;
  status?: {
    text: string;
    color: string;
  };
  actions?: {
    primary?: {
      label: string;
      onClick: () => void;
    };
    secondary?: {
      label: string;
      onClick: () => void;
    };
  };
  isLoading?: boolean;
}

export function HeroMetricCard({
  title,
  value,
  change,
  icon: Icon,
  iconColor,
  iconBg,
  status,
  actions,
  isLoading = false
}: HeroMetricCardProps) {
  const formatValue = (val: string | number) => {
    if (typeof val === 'number') {
      return val.toLocaleString();
    }
    return val;
  };

  const getTrendIcon = () => {
    if (!change) return null;
    
    return change.type === 'increase' ? (
      <ArrowTrendingUpIcon style={{ width: '20px', height: '20px' }} />
    ) : change.type === 'decrease' ? (
      <ArrowTrendingDownIcon style={{ width: '20px', height: '20px' }} />
    ) : null;
  };

  const getTrendColor = () => {
    if (!change) return 'gray.600';
    return change.type === 'increase' ? 'green.600' : 
           change.type === 'decrease' ? 'red.600' : 'gray.600';
  };

  return (
    <Card.Root 
      variant="elevated" 
      bg={{ base: "white", _dark: "gray.800" }}
      border="1px solid"
      borderColor={{ base: "gray.200", _dark: "gray.700" }}
      shadow="lg"
      h="auto"
      minH="140px"
      maxH="180px"
      _hover={{ shadow: "xl" }}
      transition="all 0.2s"
    >
      <Card.Body p="4">
        <VStack align="stretch" gap="3" h="full">
          {/* Header con ícono y título */}
          <HStack justify="space-between" align="start">
            <VStack align="start" gap="1">
              <HStack gap="3" align="center">
                <Box p="3" bg={iconBg} borderRadius="lg" shadow="sm">
                  <Icon style={{ width: '28px', height: '28px', color: iconColor }} />
                </Box>
                <Text fontSize="lg" fontWeight="semibold" color={{ base: "gray.700", _dark: "gray.200" }}>
                  {title}
                </Text>
              </HStack>
            </VStack>
            
            {status && (
              <Badge 
                colorPalette={status.color} 
                variant="surface"
                fontSize="xs"
              >
                {status.text}
              </Badge>
            )}
          </HStack>

          {/* Valor principal */}
          <VStack align="start" gap="2" flex="1">
            <Text 
              fontSize="3xl" 
              fontWeight="bold" 
              color={{ base: "gray.900", _dark: "gray.50" }}
              lineHeight="1"
            >
              {formatValue(value)}
            </Text>
            
            {/* Cambio/Tendencia */}
            {change && (
              <HStack gap="2" align="center">
                <HStack gap="1" color={getTrendColor()}>
                  {getTrendIcon()}
                  <Text fontSize="sm" fontWeight="medium">
                    {change.type === 'increase' ? '+' : change.type === 'decrease' ? '-' : ''}
                    {Math.abs(change.value)}%
                  </Text>
                </HStack>
                <Text fontSize="sm" color={{ base: "gray.500", _dark: "gray.400" }}>
                  vs {change.period}
                </Text>
              </HStack>
            )}
          </VStack>

          {/* Acciones */}
          {actions && (
            <HStack gap="2" mt="auto" flexWrap="wrap">
              {actions.primary && (
                <Button
                  variant="solid"
                  size="xs"
                  colorPalette="blue"
                  onClick={actions.primary.onClick}
                  minH="6"
                  px="2"
                  fontSize="xs"
                >
                  <EyeIcon style={{ width: '14px', height: '14px' }} />
                  <Text ml="1">{actions.primary.label}</Text>
                </Button>
              )}
              {actions.secondary && (
                <Button
                  variant="outline"
                  size="xs"
                  colorPalette="gray"
                  onClick={actions.secondary.onClick}
                  minH="6"
                  px="2"
                  fontSize="xs"
                >
                  <ChartBarIcon style={{ width: '14px', height: '14px' }} />
                  <Text ml="1">{actions.secondary.label}</Text>
                </Button>
              )}
            </HStack>
          )}
        </VStack>
      </Card.Body>
    </Card.Root>
  );
}