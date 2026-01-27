import React from 'react';
/**
 * Section - Content Section with Optional Title
 *
 * Agrupa contenido relacionado con título opcional y spacing consistente.
 */

import { Box, Heading, Stack } from '@chakra-ui/react';
interface SectionProps {
  /**
   * Título de la sección (opcional)
   */
  title?: string;
  /**
   * Descripción de la sección (opcional)
   */
  description?: string;
  /**
   * Contenido de la sección
   */
  children: React.ReactNode;
  /**
   * Spacing entre secciones
   */
  spacing?: 'compact' | 'normal' | 'spacious';
}
const SPACING_MAP = {
  compact: '4',
  normal: '6',
  spacious: '8' // 32px
} as const;
export function Section({
  title,
  description,
  children,
  spacing = 'normal'
}: SectionProps) {
  return (
    <Box mb={SPACING_MAP[spacing]}>
      {(title || description) &&
      <Stack gap="1" mb="4">
          {title &&
        <Heading
          as="h3"
          fontSize="xl"
          fontWeight="semibold"
          color="text.primary">

              {title}
            </Heading>
        }
          {description &&
        <Heading
          as="h4"
          fontSize="sm"
          fontWeight="normal"
          color="text.secondary">

              {description}
            </Heading>
        }
        </Stack>
      }
      {children}
    </Box>);

}