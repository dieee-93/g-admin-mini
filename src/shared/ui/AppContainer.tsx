import React from 'react'
import { Box } from '@chakra-ui/react'

export function AppContainer({ children }: { children: React.ReactNode }) {
  return (
    <Box maxW="container.xl" mx="auto" px={{ base: 4, md: 6 }}>
      {children}
    </Box>
  )
}

export default AppContainer
