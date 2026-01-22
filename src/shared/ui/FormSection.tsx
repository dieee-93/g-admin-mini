import { Section } from './Section'
import type { ReactNode } from 'react'

interface FormSectionProps {
  children: ReactNode
  colorPalette?: string
  className?: string
  [key: string]: any  // Allow any Chakra props for flexibility
}

/**
 * FormSection - Semantic wrapper for form content
 * 
 * Specialized Section component for forms with elevated styling by default.
 * Inherits all theming capabilities from Section.
 * 
 * Usage: 
 * <FormSection>
 *   <form>...</form>
 * </FormSection>
 */
export function FormSection({
  children,
  colorPalette,
  className,
  ...chakraProps
}: FormSectionProps) {
  return (
    <Section
      variant="elevated"
      bg="bg.surface"
      borderColor="border.default"
      color="text.primary"
      colorPalette={colorPalette}
      className={className}
      {...chakraProps}
    >
      {children}
    </Section>
  )
}