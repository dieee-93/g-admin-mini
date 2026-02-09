/**
 * SubtotalCard - Reusable component for cost subtotals
 *
 * Shows a highlighted card with an icon, label, and monetary value
 */

import { Box, Stack, Typography, Flex } from '@/shared/ui';
import { CheckIcon } from '@heroicons/react/24/solid';
import { memo } from 'react';

interface SubtotalCardProps {
  label: string;
  value: number;
  icon?: string;
  colorPalette?: 'green' | 'blue' | 'purple' | 'orange';
}

export const SubtotalCard = memo(function SubtotalCard({
  label,
  value,
  icon = '💰',
  colorPalette = 'green'
}: SubtotalCardProps) {
  return (
    <Box
      p="3"
      bg={`${colorPalette}.50`}
      borderLeftWidth="4px"
      borderLeftColor={`${colorPalette}.500`}
      borderRadius="md"
      boxShadow="sm"
    >
      <Flex justify="space-between" align="center">
        <Flex align="center" gap="2">
          <Typography fontSize="md">{icon}</Typography>
          <Typography fontSize="sm" fontWeight="600" color="fg.default">
            Subtotal {label}
          </Typography>
          <CheckIcon style={{ width: '16px', height: '16px', color: 'green' }} />
        </Flex>
        <Typography fontSize="lg" fontWeight="800" color={`${colorPalette}.700`}>
          ${value.toFixed(2)}
        </Typography>
      </Flex>
    </Box>
  );
});
