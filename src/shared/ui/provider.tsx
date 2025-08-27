
import { ChakraProvider } from '@chakra-ui/react'
import { type ReactNode } from 'react'
import { useThemeStore } from '@/store/themeStore'
import { getCurrentThemeSystem } from '@/lib/theming/dynamicTheming'

interface ProviderProps {
  children: ReactNode
}

export function Provider({ children }: ProviderProps) {
  const { currentTheme } = useThemeStore()
  
  // Create dynamic system based on current theme
  const dynamicSystem = getCurrentThemeSystem(currentTheme)
  
  // 🔍 DEBUG: Ver qué sistema se está usando
  console.log('🎨 Provider Debug:', {
    currentTheme: currentTheme?.id,
    systemExists: !!dynamicSystem,
    grayColors: dynamicSystem?._config?.theme?.tokens?.colors?.gray
  })
  
  return (
    <ChakraProvider value={dynamicSystem}>
      {children}
    </ChakraProvider>
  )
}