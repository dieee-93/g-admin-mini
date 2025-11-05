import React from 'react'
import { Box, Button, Text } from '@chakra-ui/react'
import { Stack, Typography, CardWrapper } from '@/shared/ui'

export const TokenTest: React.FC = () => {
  return (
    <CardWrapper variant="elevated">
      <CardWrapper.Header>
        <Typography variant="heading" level={3}>🧪 Token Test Component</Typography>
      </CardWrapper.Header>
      <CardWrapper.Body>
        <Stack direction="column" gap="md">
          
          {/* Test semantic tokens directly */}
          <Box 
             
            p="4" 
            borderRadius="md" 
            border="1px solid" 
            borderColor="border.subtle"
          >
            <Text color="text.primary" fontSize="lg" fontWeight="bold">
              Canvas Background + Primary Text
            </Text>
            <Text color="text.secondary" fontSize="md">
              Secondary text on canvas
            </Text>
            <Text color="text.muted" fontSize="sm">
              Muted text on canvas
            </Text>
          </Box>

          <Box 
             
            p="4" 
            borderRadius="md" 
            border="1px solid" 
            borderColor="border.muted"
          >
            <Text color="text.primary" fontSize="lg" fontWeight="bold">
              Surface Background + Primary Text
            </Text>
            <Text color="text.secondary" fontSize="md">
              Secondary text on surface
            </Text>
          </Box>

          <Box 
            bg="bg.subtle" 
            p="4" 
            borderRadius="md"
          >
            <Text color="text.primary" fontSize="lg" fontWeight="bold">
              Subtle Background + Primary Text
            </Text>
          </Box>

          <Box 
            bg="bg.muted" 
            p="4" 
            borderRadius="md"
          >
            <Text color="text.primary" fontSize="lg" fontWeight="bold">
              Muted Background + Primary Text
            </Text>
          </Box>

          {/* Test brand colors */}
          <Stack direction="row" gap="sm">
            <Button colorPalette="purple" variant="solid">
              Brand Solid
            </Button>
            <Button colorPalette="purple" variant="outline">
              Brand Outline
            </Button>
            <Button colorPalette="purple" variant="ghost">
              Brand Ghost
            </Button>
          </Stack>

          {/* Test with direct color values */}
          <Box p="4" borderRadius="md">
            <Text color="brand.500" fontSize="lg" fontWeight="bold">
              Brand 500 Direct
            </Text>
            <Text color="brand.50"  px="2" borderRadius="sm">
              Brand 50 on Brand 500
            </Text>
          </Box>

        </Stack>
      </CardWrapper.Body>
    </CardWrapper>
  )
}
