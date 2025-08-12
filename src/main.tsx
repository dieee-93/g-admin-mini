import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import AppLazy from './AppLazy.tsx'
import { ChakraProvider, defaultSystem } from '@chakra-ui/react'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ChakraProvider value={defaultSystem}>    
    <AppLazy />
    </ChakraProvider>
  </StrictMode>,
)
