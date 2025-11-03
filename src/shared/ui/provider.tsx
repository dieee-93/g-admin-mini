import { ChakraProvider, createSystem, defaultConfig } from '@chakra-ui/react'
import { type ReactNode, useMemo } from 'react'
import { useThemeStore } from '../../store/themeStore'
import { getCurrentThemeSystem } from '../../lib/theming/dynamicTheming'

import { logger } from '@/lib/logging';
interface ProviderProps {
  children: ReactNode
}

export function Provider({ children }: ProviderProps) {
  const { currentTheme } = useThemeStore()
  
  // Create a stable system using memoization
  const system = useMemo(() => {
    try {
      // Use the full theme system now that it's working
      const dynamicSystem = getCurrentThemeSystem(currentTheme)
      
      // Verify the system has the required structure
      if (dynamicSystem && dynamicSystem._config) {
        console.log(`✅ Theme system loaded: ${currentTheme?.id || 'default'}`)
        return dynamicSystem
      } else {
        logger.warn('Provider', 'Dynamic system invalid, falling back to default config')
        return createSystem(defaultConfig)
      }
    } catch (error) {
      logger.error('Provider', 'Error creating theme system, falling back to default:', error)
      return createSystem(defaultConfig)
    }
  }, [currentTheme])

  return (
    <ChakraProvider value={system}>
      {children}
    </ChakraProvider>
  )
}