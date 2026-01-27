import React from 'react';
/**
 * PageHeader - Page Title and Actions
 *
 * Header estándar para todas las páginas con título y acciones opcionales.
 */

import { Box, Flex, Heading, Stack } from '@chakra-ui/react';
interface PageHeaderProps {
  /**
   * Título de la página
   */
  title: string;
  /**
   * Subtítulo o descripción opcional
   */
  subtitle?: string;
  /**
   * Acciones (botones) en el lado derecho
   */
  actions?: React.ReactNode;
}
export function PageHeader({ title, subtitle, actions }: PageHeaderProps) {
  return (
    <Box mb="8">
      <Flex
        justify="space-between"
        align={{
          base: 'flex-start',
          md: 'center'
        }}
        direction={{
          base: 'column',
          md: 'row'
        }}
        gap="4">

        <Stack gap="1">
          <Heading
            as="h1"
            fontSize={{
              base: '2xl',
              md: '3xl'
            }}
            fontWeight="bold"
            color="text.primary">

            {title}
          </Heading>
          {subtitle &&
          <Heading
            as="h2"
            fontSize="md"
            fontWeight="normal"
            color="text.secondary">

              {subtitle}
            </Heading>
          }
        </Stack>

        {actions &&
        <Stack direction="row" gap="2">
            {actions}
          </Stack>
        }
      </Flex>
    </Box>);

}