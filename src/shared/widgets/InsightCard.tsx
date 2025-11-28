/**
 * InsightCard - Tarjeta de insights/recomendaciones
 *
 * DISEÑO COPIADO DE: newdashboard/src/components/widgets/InsightCard.tsx
 * ADAPTADO A: G-Admin Mini design system
 *
 * Widget reutilizable para mostrar insights con:
 * - Título y descripción
 * - Métrica destacada opcional
 * - Tags/categorías
 * - Botón de acción
 * - Indicador positivo/negativo
 * - Animaciones suaves en hover
 *
 * @example
 * <InsightCard
 *   title="Producto más vendido"
 *   description="Pizza Margarita representa el 23% de tus ventas"
 *   metric="$4,230"
 *   metricLabel="este mes"
 *   tags={["Tendencia", "Alto rendimiento"]}
 *   actionLabel="Ver detalles"
 *   onAction={() => navigate('products')}
 *   positive={true}
 * />
 */

import React from 'react';
import { Box, Stack, Typography, Badge, Button } from '@/shared/ui';

// ===============================
// TYPES
// ===============================

export interface InsightCardProps {
  /** Título del insight */
  title: string;

  /** Descripción detallada */
  description: string;

  /** Métrica principal (opcional) */
  metric?: string;

  /** Label de la métrica */
  metricLabel?: string;

  /** Tags/categorías del insight */
  tags?: string[];

  /** Label del botón de acción */
  actionLabel?: string;

  /** Icono decorativo */
  icon?: React.ReactElement;

  /** Si el insight es positivo (verde) o negativo (naranja) */
  positive?: boolean;

  /** Handler del botón de acción */
  onAction?: () => void;
}

// ===============================
// COMPONENT
// ===============================

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
  const accentColor = positive ? 'green.500' : 'orange.500';

  return (
    <Box
      bg="gray.100"
      p={6}
      borderRadius="2xl"
      borderLeft="4px solid"
      borderColor={accentColor}
      transition="all 0.3s"
      _hover={{
        transform: 'translateY(-4px)',
        boxShadow: 'lg'
      }}
    >
      <Stack direction="row" justify="space-between" align="start" mb={4}>
        <Box flex={1}>
          <Typography
            variant="heading"
            size="lg"
            weight="bold"
            mb={2}
          >
            {title}
          </Typography>
          <Typography
            variant="body"
            size="sm"
            color="fg.muted"
            lineHeight="tall"
          >
            {description}
          </Typography>
        </Box>

        {icon && (
          <Box
            p={2}
            borderRadius="lg"
            bg={accentColor}
            color="white"
            ml={4}
          >
            {icon}
          </Box>
        )}
      </Stack>

      {metric && (
        <Stack direction="row" align="baseline" mb={4}>
          <Typography
            variant="heading"
            size="2xl"
            weight="bold"
            color={accentColor}
          >
            {metric}
          </Typography>
          {metricLabel && (
            <Typography
              variant="body"
              size="sm"
              color="fg.subtle"
              ml={2}
            >
              {metricLabel}
            </Typography>
          )}
        </Stack>
      )}

      <Stack
        direction="row"
        gap="2"
        wrap={true}
        mb={actionLabel ? 4 : 0}
      >
        {tags.map(tag => (
          <Badge
            key={tag}
            colorPalette="blue"
            variant="subtle"
            size="sm"
            px={2}
            py={1}
            borderRadius="full"
          >
            {tag}
          </Badge>
        ))}
      </Stack>

      {actionLabel && (
        <Button
          size="sm"
          colorPalette={positive ? 'green' : 'orange'}
          variant="outline"
          width="full"
          onClick={onAction}
          fontWeight="medium"
        >
          {actionLabel}
        </Button>
      )}
    </Box>
  );
};
