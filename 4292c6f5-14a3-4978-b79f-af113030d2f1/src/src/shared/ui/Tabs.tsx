import React, { Component } from 'react';
/**
 * Tabs - Tabbed Interface Component
 *
 * Pestañas estandarizadas para organizar contenido.
 */

import {
  Tabs as ChakraTabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Box } from
'@chakra-ui/react';
export interface TabItem {
  /**
   * Label de la pestaña
   */
  label: string;
  /**
   * Contenido de la pestaña
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
  /**
   * Deshabilitada
   */
  disabled?: boolean;
}
export interface TabsProps {
  /**
   * Pestañas
   */
  tabs: TabItem[];
  /**
   * Índice de la pestaña activa
   */
  activeIndex?: number;
  /**
   * Callback cuando cambia la pestaña
   */
  onChange?: (index: number) => void;
  /**
   * Variante visual
   */
  variant?: 'line' | 'enclosed' | 'soft-rounded';
  /**
   * Tamaño
   */
  size?: 'sm' | 'md' | 'lg';
  /**
   * Orientación
   */
  orientation?: 'horizontal' | 'vertical';
  /**
   * Color scheme
   */
  colorScheme?: string;
}
export function Tabs({
  tabs,
  activeIndex,
  onChange,
  variant = 'line',
  size = 'md',
  orientation = 'horizontal',
  colorScheme = 'blue'
}: TabsProps) {
  return (
    <ChakraTabs
      index={activeIndex}
      onChange={onChange}
      variant={variant}
      size={size}
      orientation={orientation}
      colorScheme={colorScheme}>

      <TabList
        borderBottomWidth={variant === 'line' ? '2px' : '0'}
        borderColor="border.default">

        {tabs.map((tab, index) =>
        <Tab
          key={index}
          isDisabled={tab.disabled}
          gap="2"
          fontWeight="medium"
          color="text.secondary"
          _selected={{
            color: 'text.primary',
            borderColor: `${colorScheme}.500`
          }}>

            {tab.icon && <Box>{tab.icon}</Box>}
            {tab.label}
            {tab.badge &&
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

                {tab.badge}
              </Box>
          }
          </Tab>
        )}
      </TabList>

      <TabPanels>
        {tabs.map((tab, index) =>
        <TabPanel key={index} px="0" py="6">
            {tab.content}
          </TabPanel>
        )}
      </TabPanels>
    </ChakraTabs>);

}