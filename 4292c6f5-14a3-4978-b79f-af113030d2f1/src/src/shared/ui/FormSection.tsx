import React from 'react';
/**
 * FormSection - Form Fields Grouper
 *
 * Agrupa campos de formulario relacionados con título y descripción opcional.
 * Proporciona spacing consistente entre campos.
 */

import { Box, Heading, Stack, Text } from '@chakra-ui/react';
interface FormSectionProps {
  /**
   * Título de la sección
   */
  title: string;
  /**
   * Descripción opcional de la sección
   */
  description?: string;
  /**
   * Campos del formulario
   */
  children: React.ReactNode;
  /**
   * Spacing entre campos
   */
  spacing?: '2' | '3' | '4' | '6';
}
export function FormSection({
  title,
  description,
  children,
  spacing = '4' // 16px default (ESTÁNDAR para forms)
}: FormSectionProps) {
  return (
    <Box mb="6">
      <Box mb="4">
        <Heading
          as="h3"
          fontSize="md"
          fontWeight="semibold"
          color="text.primary"
          mb={description ? '1' : '0'}>

          {title}
        </Heading>
        {description &&
        <Text fontSize="sm" color="text.secondary">
            {description}
          </Text>
        }
      </Box>

      <Stack gap={spacing}>{children}</Stack>
    </Box>);

}