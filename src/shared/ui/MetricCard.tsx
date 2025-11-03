/**
 * MetricCard FIXED - Layout limpio y profesional
 *
 * Problemas identificados y solucionados:
 * - Layout confuso con iconos mal posicionados
 * - Spacing inconsistente
 * - Alineación rota de elementos
 */

import React from 'react';
import {
  Stack,
  Typography,
  CardWrapper,
  Button,
  Badge,
  Icon
} from '.';
import {
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  EyeIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';

interface BaseMetricProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ComponentType<any>;
  iconColor?: string;
  colorPalette?: 'gray' | 'red' | 'orange' | 'yellow' | 'green' | 'teal' | 'blue' | 'cyan' | 'purple' | 'pink';
  onClick?: () => void;
  trend?: 'up' | 'down' | 'neutral';
  change?: string;
  badge?: {
    value: string;
    colorPalette: 'gray' | 'green' | 'orange' | 'red' | 'blue';
    variant?: 'solid' | 'subtle' | 'outline' | 'surface';
  };
  isLoading?: boolean;
}

export function MetricCard({
  title,
  value,
  subtitle,
  icon: IconComponent,
  iconColor,
  colorPalette = 'gray',
  onClick,
  trend,
  change,
  badge,
  isLoading = false
}: BaseMetricProps) {

  const formatValue = (val: string | number) => {
    if (typeof val === 'number') {
      return val.toLocaleString();
    }
    return val;
  };

  const getTrendIcon = () => {
    if (trend === 'up') return ArrowTrendingUpIcon;
    if (trend === 'down') return ArrowTrendingDownIcon;
    return null;
  };

  const getTrendColor = () => {
    if (trend === 'up') return 'green.500';
    if (trend === 'down') return 'red.500';
    return 'gray.500';
  };

  return (
    <CardWrapper
      variant="elevated"
      colorPalette={colorPalette}
      onClick={onClick}
      cursor={onClick ? "pointer" : "default"}
      _hover={onClick ? {
        transform: "translateY(-2px)",
        shadow: "lg"
      } : {}}
      transition="all 0.2s ease"
      p="6" // Padding explícito
    >
      <Stack gap="4" align="start" width="full">
        {/* Header Row: Icon + Badge */}
        <Stack direction="row" justify="space-between" align="center" width="full">
          <Icon
            icon={IconComponent}
            size="2xl"
            color={iconColor || `${colorPalette}.500`}
          />
          {badge && (
            <Badge
              colorPalette={badge.colorPalette}
              variant={badge.variant || "subtle"}
              size="sm"
            >
              {badge.value}
            </Badge>
          )}
        </Stack>

        {/* Main Value */}
        <Stack gap="1" align="start" width="full">
          <Typography
            variant="heading"
            size="4xl"
            weight="bold"
            color="text.primary"
            lineHeight="1.1"
          >
            {formatValue(value)}
          </Typography>

          {/* Change/Trend - if provided */}
          {(change || trend) && (
            <Stack direction="row" gap="2" align="center">
              {getTrendIcon() && (
                <Icon
                  icon={getTrendIcon()!}
                  size="sm"
                  color={getTrendColor()}
                />
              )}
              {change && (
                <Typography
                  variant="body"
                  size="sm"
                  weight="medium"
                  color={getTrendColor()}
                >
                  {change}
                </Typography>
              )}
            </Stack>
          )}
        </Stack>

        {/* Title and Subtitle */}
        <Stack gap="1" align="start" width="full">
          <Typography
            variant="body"
            size="md"
            color="text.muted"
            weight="semibold"
            lineHeight="1.2"
          >
            {title}
          </Typography>

          {subtitle && (
            <Typography
              variant="body"
              size="sm"
              color="text.subtle"
              lineHeight="1.2"
            >
              {subtitle}
            </Typography>
          )}
        </Stack>
      </Stack>
    </CardWrapper>
  );
}