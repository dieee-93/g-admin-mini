import { Box } from '@chakra-ui/react'
import type { ReactNode } from 'react'
import { Stack } from './Stack'
import type { SpacingProp } from './types'

interface ContentLayoutProps {
  children: ReactNode
  spacing?: 'tight' | 'normal' | 'loose'
  padding?: SpacingProp
  colorPalette?: string
  className?: string
  [key: string]: any  // Allow any Chakra props for flexibility
}

/**
 * ContentLayout - Semantic wrapper for page content
 * 
 * Replaces the repetitive pattern:
 * <Layout variant="page" p="xl">
 *   <Stack gap="xl">
 *     {children}  
 *   </Stack>
 * </Layout>
 * 
 * Usage: <ContentLayout>{children}</ContentLayout>
 */
export function ContentLayout({
  children,
  spacing = 'normal',
  padding = '8',
  colorPalette,
  className,
  ...chakraProps
}: ContentLayoutProps) {
  const spacingMap = {
    tight: '4',
    normal: '8', 
    loose: '12'
  }

  return (
    <Box
      minHeight="100vh"
      width="full"
      bg="bg.canvas"
      p={padding}
      colorPalette={colorPalette}
      className={className}
      {...chakraProps}
    >
      <Stack gap={spacingMap[spacing]} align="stretch">
        {children}
      </Stack>
    </Box>
  )
}