import { Section } from './Section'
import type { ReactNode } from 'react'

interface StatsSectionProps {
  children: ReactNode
  colorPalette?: string
  className?: string
  [key: string]: any  // Allow any Chakra props for flexibility
}

/**
 * StatsSection - Semantic wrapper for metrics/statistics content
 * 
 * Specialized Section component for displaying statistics and metrics.
 * Typically used with SimpleGrid to create responsive stat layouts.
 * Uses flat variant by default to let the metric cards provide the elevation.
 * 
 * Usage: 
 * <StatsSection>
 *   <SimpleGrid columns={4}>
 *     <MetricCard />
 *     <MetricCard />
 *   </SimpleGrid>
 * </StatsSection>
 */
export function StatsSection({
  children,
  colorPalette,
  className,
  ...chakraProps
}: StatsSectionProps) {
  return (
    <Section
      variant="flat"  // Let metric cards provide elevation
      colorPalette={colorPalette}
      className={className}
      {...chakraProps}
    >
      {children}
    </Section>
  )
}