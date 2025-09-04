
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
  

  return (
    <ChakraProvider value={dynamicSystem}>
      {children}
    </ChakraProvider>
  )
}