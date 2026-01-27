import React, { Component } from 'react';
/**
 * EmptyState - Empty State Component
 *
 * Componente para mostrar estados vacíos en listas, tablas, etc.
 */

import { Box, Heading, Text, Stack, Button } from '@chakra-ui/react';
export interface EmptyStateProps {
  /**
   * Ícono o ilustración
   */
  icon?: React.ReactNode;
  /**
   * Título
   */
  title: string;
  /**
   * Descripción
   */
  description?: string;
  /**
   * Acción principal
   */
  action?: {
    label: string;
    onClick: () => void;
  };
  /**
   * Acción secundaria
   */
  secondaryAction?: {
    label: string;
    onClick: () => void;
  };
}
export function EmptyState({
  icon,
  title,
  description,
  action,
  secondaryAction
}: EmptyStateProps) {
  return (
    <Box
      bg="bg.surface"
      p="12"
      borderRadius="lg"
      borderWidth="1px"
      borderColor="border.default"
      textAlign="center">

      <Stack align="center" gap="4" maxW="md" mx="auto">
        {icon &&
        <Box fontSize="4xl" color="text.muted">
            {icon}
          </Box>
        }

        <Stack gap="2">
          <Heading fontSize="lg" fontWeight="semibold" color="text.primary">
            {title}
          </Heading>

          {description &&
          <Text fontSize="sm" color="text.secondary">
              {description}
            </Text>
          }
        </Stack>

        {(action || secondaryAction) &&
        <Stack
          direction={{
            base: 'column',
            sm: 'row'
          }}
          gap="2"
          mt="2">

            {action &&
          <Button colorScheme="blue" onClick={action.onClick}>
                {action.label}
              </Button>
          }
            {secondaryAction &&
          <Button variant="outline" onClick={secondaryAction.onClick}>
                {secondaryAction.label}
              </Button>
          }
          </Stack>
        }
      </Stack>
    </Box>);

}