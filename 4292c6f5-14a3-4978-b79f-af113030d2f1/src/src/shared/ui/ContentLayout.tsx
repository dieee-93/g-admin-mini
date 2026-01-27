import React from 'react';
/**
 * ContentLayout - Main Content Wrapper
 *
 * Wrapper principal para el contenido de todas las páginas.
 * Proporciona padding y spacing consistente.
 */

import { Box } from '@chakra-ui/react';
interface ContentLayoutProps {
  children: React.ReactNode;
  /**
   * Spacing variant
   * - compact: 16px (páginas con header)
   * - normal: 24px (páginas estándar) - DEFAULT
   * - spacious: 32px (landing pages)
   */
  spacing?: 'compact' | 'normal' | 'spacious';
  /**
   * Max width del contenedor
   */
  maxW?: string;
}
const SPACING_MAP = {
  compact: '4',
  normal: '6',
  spacious: '8' // 32px
} as const;
export function ContentLayout({
  children,
  spacing = 'normal',
  maxW = '1400px'
}: ContentLayoutProps) {
  return (
    <Box
      as="main"
      w="100%"
      minH="100vh"
      bg="bg.canvas"
      py={SPACING_MAP[spacing]}
      px={{
        base: '4',
        md: '6',
        lg: '8'
      }}>

      <Box maxW={maxW} mx="auto">
        {children}
      </Box>
    </Box>);

}