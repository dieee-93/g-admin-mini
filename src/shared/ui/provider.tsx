
import { ChakraProvider } from '@chakra-ui/react'
import { system } from '@/theme'
import { ReactNode } from 'react'

interface ProviderProps {
  children: ReactNode
}

export function Provider({ children }: ProviderProps) {
  return (
    <ChakraProvider value={system}>
      {children}
    </ChakraProvider>
  )
}