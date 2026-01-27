import React from 'react';
/**
 * MetricCard - Metric Display Card
 *
 * Card especializado para mostrar métricas y estadísticas.
 * Usado en dashboards y páginas de resumen.
 */

import { Box, Heading, Stack, Text } from '@chakra-ui/react';
interface MetricCardProps {
  /**
   * Label de la métrica
   */
  label: string;
  /**
   * Valor de la métrica
   */
  value: string | number;
  /**
   * Cambio/tendencia (opcional)
   */
  change?: string;
  /**
   * Tipo de tendencia
   */
  trend?: 'up' | 'down' | 'neutral';
  /**
   * Ícono opcional (emoji o componente)
   */
  icon?: React.ReactNode;
  /**
   * Padding variant
   */
  padding?: 'compact' | 'normal';
}
const TREND_COLORS = {
  up: 'green.600',
  down: 'red.600',
  neutral: 'gray.600'
} as const;
export function MetricCard({
  label,
  value,
  change,
  trend = 'neutral',
  icon,
  padding = 'normal'
}: MetricCardProps) {
  const paddingValue = padding === 'compact' ? '4' : '6';
  return (
    <Box
      bg="bg.surface"
      p={paddingValue}
      borderRadius="lg"
      shadow="md"
      borderWidth="1px"
      borderColor="border.default"
      transition="all 150ms ease-in-out"
      _hover={{
        shadow: 'lg',
        transform: 'translateY(-2px)'
      }}>

      <Stack gap="2">
        {icon &&
        <Box fontSize="2xl" color="blue.600">
            {icon}
          </Box>
        }

        <Text
          fontSize="sm"
          fontWeight="medium"
          color="text.secondary"
          textTransform="uppercase"
          letterSpacing="wide">

          {label}
        </Text>

        <Heading
          fontSize={{
            base: '2xl',
            md: '3xl'
          }}
          fontWeight="bold"
          color="text.primary">

          {value}
        </Heading>

        {change &&
        <Text fontSize="sm" fontWeight="medium" color={TREND_COLORS[trend]}>
            {change}
          </Text>
        }
      </Stack>
    </Box>);

}