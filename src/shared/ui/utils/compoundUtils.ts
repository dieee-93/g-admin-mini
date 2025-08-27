import React, { ReactNode } from 'react'

/**
 * Utility para detectar si un componente contiene subcomponentes específicos
 * Usado para evitar double-padding y otros problemas en compound components
 */
export function hasSubcomponents(
  children: ReactNode, 
  componentNames: string[]
): boolean {
  return React.Children.toArray(children).some(child =>
    React.isValidElement(child) && 
    componentNames.includes(child.type?.displayName || '')
  )
}

/**
 * Crea displayNames consistentes para compound components
 */
export function createDisplayName(
  baseComponentName: string, 
  subComponentName: string
): string {
  return `${baseComponentName}${subComponentName}`
}

/**
 * HOC para aplicar displayNames automáticamente a compound components
 */
export function withDisplayName<P extends object>(
  Component: React.ComponentType<P>,
  displayName: string
) {
  Component.displayName = displayName
  return Component
}

/**
 * Detecta automáticamente compound patterns y aplica estilos apropiados
 */
export function useCompoundDetection(
  children: ReactNode,
  config: {
    componentName: string
    subComponents: string[]
    withSubcomponentsStyle?: Record<string, any>
    withoutSubcomponentsStyle?: Record<string, any>
  }
) {
  const hasSubcomps = hasSubcomponents(children, config.subComponents)
  
  return {
    hasSubcomponents: hasSubcomps,
    styles: hasSubcomps 
      ? (config.withSubcomponentsStyle || {})
      : (config.withoutSubcomponentsStyle || {})
  }
}

/**
 * Lista de componentes compound conocidos para consistency checks
 */
export const COMPOUND_COMPONENTS = {
  Card: ['CardHeader', 'CardBody', 'CardFooter'],
  Modal: ['ModalHeader', 'ModalBody', 'ModalFooter'],
  Tabs: ['TabList', 'Tab', 'TabPanels', 'TabPanel'],
  Alert: ['AlertIcon', 'AlertTitle', 'AlertDescription', 'AlertAction'],
} as const

/**
 * Error boundary específico para compound components
 */
export class CompoundComponentError extends Error {
  constructor(componentName: string, expectedParent: string) {
    super(
      `${componentName} must be used within ${expectedParent}. ` +
      `Make sure you're using the compound component pattern correctly.`
    )
    this.name = 'CompoundComponentError'
  }
}

/**
 * Hook para validar uso correcto de compound components
 */
export function useCompoundValidation(
  componentName: string, 
  expectedParent: string,
  parentContext: any
) {
  if (!parentContext) {
    console.warn(
      `Warning: ${componentName} is recommended to be used within ${expectedParent} ` +
      `for optimal styling and behavior.`
    )
  }
}