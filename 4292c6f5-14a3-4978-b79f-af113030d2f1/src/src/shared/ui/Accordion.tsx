import React, { Component } from 'react';
/**
 * Accordion - Collapsible Content Component
 *
 * Acordeón para contenido colapsable.
 */

import {
  Accordion as ChakraAccordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  Box,
  Heading } from
'@chakra-ui/react';
export interface AccordionItemData {
  /**
   * Título del item
   */
  title: string;
  /**
   * Contenido del item
   */
  content: React.ReactNode;
  /**
   * Badge/contador opcional
   */
  badge?: string | number;
  /**
   * Ícono opcional
   */
  icon?: React.ReactNode;
}
export interface AccordionProps {
  /**
   * Items del acordeón
   */
  items: AccordionItemData[];
  /**
   * Permitir múltiples items abiertos
   */
  allowMultiple?: boolean;
  /**
   * Permitir cerrar todos los items
   */
  allowToggle?: boolean;
  /**
   * Índices de items abiertos por defecto
   */
  defaultIndex?: number | number[];
}
export function Accordion({
  items,
  allowMultiple = false,
  allowToggle = true,
  defaultIndex
}: AccordionProps) {
  return (
    <ChakraAccordion
      allowMultiple={allowMultiple}
      allowToggle={allowToggle}
      defaultIndex={defaultIndex}
      bg="bg.surface"
      borderRadius="lg"
      borderWidth="1px"
      borderColor="border.default">

      {items.map((item, index) =>
      <AccordionItem key={index} borderColor="border.default">
          <AccordionButton
          py="4"
          px="6"
          _hover={{
            bg: 'bg.subtle'
          }}
          transition="background 150ms ease-in-out">

            <Box flex="1" textAlign="left">
              <Heading
              fontSize="md"
              fontWeight="semibold"
              color="text.primary"
              display="flex"
              alignItems="center"
              gap="2">

                {item.icon && <Box>{item.icon}</Box>}
                {item.title}
                {item.badge &&
              <Box
                as="span"
                bg="bg.muted"
                color="text.secondary"
                fontSize="xs"
                fontWeight="semibold"
                px="2"
                py="0.5"
                borderRadius="full"
                minW="5"
                textAlign="center">

                    {item.badge}
                  </Box>
              }
              </Heading>
            </Box>
            <AccordionIcon />
          </AccordionButton>
          <AccordionPanel px="6" pb="4">
            {item.content}
          </AccordionPanel>
        </AccordionItem>
      )}
    </ChakraAccordion>);

}