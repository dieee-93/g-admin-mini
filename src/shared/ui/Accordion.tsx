/**
 * Accordion - Wrapper for Chakra UI v3 Accordion
 *
 * Expandable/collapsible content sections.
 * Follows G-Admin Mini design system patterns.
 *
 * @example
 * <Accordion.Root collapsible defaultValue={["item-1"]}>
 *   <AccordionItem value="item-1">
 *     <AccordionItemTrigger>
 *       Section Title
 *     </AccordionItemTrigger>
 *     <AccordionItemContent>
 *       Section content here
 *     </AccordionItemContent>
 *   </AccordionItem>
 * </Accordion.Root>
 *
 * @see https://www.chakra-ui.com/docs/components/accordion
 */

import React from 'react';
import { Accordion as ChakraAccordion } from '@chakra-ui/react';
import { ChevronDownIcon } from '@heroicons/react/24/outline';
import { Icon } from './Icon';
import { Stack } from './Stack';

// ===============================
// ROOT
// ===============================

export interface AccordionRootProps extends ChakraAccordion.RootProps {
  /** Elementos hijos (AccordionItem) */
  children: React.ReactNode;

  /** Si se pueden colapsar items después de expandirlos */
  collapsible?: boolean;

  /** Si múltiples items pueden estar abiertos simultáneamente */
  multiple?: boolean;

  /** Valores iniciales de items expandidos */
  defaultValue?: string[];

  /** Valores controlados de items expandidos */
  value?: string[];

  /** Callback cuando cambian los valores expandidos */
  onValueChange?: (details: { value: string[] }) => void;

  /** Variante visual */
  variant?: 'outline' | 'subtle' | 'enclosed' | 'plain';

  /** Tamaño */
  size?: 'sm' | 'md' | 'lg';

  /** Paleta de colores */
  colorPalette?: string;
}

/**
 * Accordion.Root - Contenedor principal del accordion
 */
export const AccordionRoot = React.forwardRef<HTMLDivElement, AccordionRootProps>(
  function AccordionRoot(props, ref) {
    const {
      children,
      collapsible = false,
      multiple = false,
      defaultValue,
      value,
      onValueChange,
      variant = 'outline',
      size = 'md',
      colorPalette = 'gray',
      ...rest
    } = props;

    return (
      <ChakraAccordion.Root
        ref={ref}
        collapsible={collapsible}
        multiple={multiple}
        defaultValue={defaultValue}
        value={value}
        onValueChange={onValueChange}
        variant={variant}
        size={size}
        colorPalette={colorPalette}
        {...rest}
      >
        {children}
      </ChakraAccordion.Root>
    );
  }
);

// ===============================
// ITEM
// ===============================

export interface AccordionItemProps extends ChakraAccordion.ItemProps {
  /** Elementos hijos (Trigger y Content) */
  children: React.ReactNode;

  /** Valor único del item */
  value: string;

  /** Si el item está deshabilitado */
  disabled?: boolean;
}

/**
 * AccordionItem - Item individual del accordion
 */
export const AccordionItem = React.forwardRef<HTMLDivElement, AccordionItemProps>(
  function AccordionItem(props, ref) {
    const { children, value, disabled, ...rest } = props;

    return (
      <ChakraAccordion.Item ref={ref} value={value} disabled={disabled} {...rest}>
        {children}
      </ChakraAccordion.Item>
    );
  }
);

// ===============================
// ITEM TRIGGER
// ===============================

export interface AccordionItemTriggerProps extends ChakraAccordion.ItemTriggerProps {
  /** Contenido del trigger */
  children: React.ReactNode;

  /** Posición del indicador */
  indicatorPlacement?: 'start' | 'end';
}

/**
 * AccordionItemTrigger - Botón para expandir/colapsar el item
 * Con indicador de estado (chevron) integrado
 */
export const AccordionItemTrigger = React.forwardRef<HTMLButtonElement, AccordionItemTriggerProps>(
  function AccordionItemTrigger(props, ref) {
    const { children, indicatorPlacement = 'end', ...rest } = props;

    return (
      <ChakraAccordion.ItemTrigger ref={ref} {...rest}>
        {indicatorPlacement === 'start' && (
          <ChakraAccordion.ItemIndicator rotate={{ base: '-90deg', _open: '0deg' }}>
            <Icon as={ChevronDownIcon} boxSize={4} />
          </ChakraAccordion.ItemIndicator>
        )}

        <Stack direction="row" gap={4} flex={1} textAlign="start" width="full" align="center">
          {children}
        </Stack>

        {indicatorPlacement === 'end' && (
          <ChakraAccordion.ItemIndicator>
            <Icon as={ChevronDownIcon} boxSize={4} />
          </ChakraAccordion.ItemIndicator>
        )}
      </ChakraAccordion.ItemTrigger>
    );
  }
);

// ===============================
// ITEM CONTENT
// ===============================

export interface AccordionItemContentProps extends ChakraAccordion.ItemContentProps {
  /** Contenido a mostrar cuando está expandido */
  children: React.ReactNode;
}

/**
 * AccordionItemContent - Contenido expandible del item
 */
export const AccordionItemContent = React.forwardRef<HTMLDivElement, AccordionItemContentProps>(
  function AccordionItemContent(props, ref) {
    const { children, ...rest } = props;

    return (
      <ChakraAccordion.ItemContent>
        <ChakraAccordion.ItemBody ref={ref} {...rest}>
          {children}
        </ChakraAccordion.ItemBody>
      </ChakraAccordion.ItemContent>
    );
  }
);

// ===============================
// ITEM INDICATOR
// ===============================

/**
 * AccordionItemIndicator - Indicador visual de estado expandido/colapsado
 * Usualmente no se usa directamente, ya está integrado en AccordionItemTrigger
 */
export const AccordionItemIndicator = ChakraAccordion.ItemIndicator;

// ===============================
// NAMESPACE EXPORT
// ===============================

/**
 * Accordion namespace con todos los componentes
 *
 * @example
 * <Accordion.Root>
 *   <Accordion.Item value="1">
 *     <Accordion.ItemTrigger>Title</Accordion.ItemTrigger>
 *     <Accordion.ItemContent>Content</Accordion.ItemContent>
 *   </Accordion.Item>
 * </Accordion.Root>
 */
export const Accordion = {
  Root: AccordionRoot,
  Item: AccordionItem,
  ItemTrigger: AccordionItemTrigger,
  ItemContent: AccordionItemContent,
  ItemIndicator: AccordionItemIndicator
};
