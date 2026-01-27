import React, { Component } from 'react';
/**
 * CardWrapper - Standard Card Component
 *
 * Card estándar con padding, border radius, y shadow consistentes.
 * Sigue el patrón de compound components para flexibilidad.
 */

import { Box, Flex, Heading, Stack } from '@chakra-ui/react';
interface CardWrapperProps {
  children: React.ReactNode;
  /**
   * Padding variant
   * - compact: 16px
   * - normal: 24px (DEFAULT)
   * - spacious: 32px
   */
  padding?: 'compact' | 'normal' | 'spacious';
  /**
   * Hover effect
   */
  hoverable?: boolean;
}
const PADDING_MAP = {
  compact: '4',
  normal: '6',
  spacious: '8' // 32px
} as const;
export function CardWrapper({
  children,
  padding = 'normal',
  hoverable = false
}: CardWrapperProps) {
  return (
    <Box
      bg="bg.surface"
      p={PADDING_MAP[padding]}
      borderRadius="lg"
      shadow="md"
      borderWidth="1px"
      borderColor="border.default"
      transition="all 150ms ease-in-out"
      _hover={
      hoverable ?
      {
        shadow: 'lg',
        transform: 'translateY(-2px)'
      } :
      undefined
      }>

      {children}
    </Box>);

}
// Compound Components
interface CardHeaderProps {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
}
CardWrapper.Header = function CardHeader({
  title,
  subtitle,
  actions
}: CardHeaderProps) {
  return (
    <Flex justify="space-between" align="center" mb="4">
      <Stack gap="1">
        <Heading
          as="h3"
          fontSize="lg"
          fontWeight="semibold"
          color="text.primary">

          {title}
        </Heading>
        {subtitle &&
        <Heading
          as="h4"
          fontSize="sm"
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
    </Flex>);

};
interface CardBodyProps {
  children: React.ReactNode;
}
CardWrapper.Body = function CardBody({ children }: CardBodyProps) {
  return <Box>{children}</Box>;
};
interface CardFooterProps {
  children: React.ReactNode;
  justify?: 'flex-start' | 'center' | 'flex-end' | 'space-between';
}
CardWrapper.Footer = function CardFooter({
  children,
  justify = 'flex-end'
}: CardFooterProps) {
  return (
    <Flex
      justify={justify}
      gap="2"
      mt="4"
      pt="4"
      borderTopWidth="1px"
      borderColor="border.default">

      {children}
    </Flex>);

};