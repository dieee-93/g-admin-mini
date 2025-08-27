import { DynamicThemeTest } from '@/components/debug/DynamicThemeTest'
import { Layout, Stack, Typography, Button, CardWrapper } from '@/shared/ui'
import { Box } from '@chakra-ui/react'

export function ThemeTestPage() {
  return (
    <Layout variant="page" padding="lg">
      <Stack direction="column" gap="lg" maxWidth="1200px">
        <Typography variant="heading" level={1}>
          🎨 Theme System Test Page
        </Typography>
        
        <Typography variant="body" color="secondary" textAlign="center">
          Testing automatic theme switching with default components and colorPalette overrides.
        </Typography>
        
        {/* 🔍 PRIMITIVES TEST - Box directo de Chakra */}
        <CardWrapper variant="elevated" padding="md">
          <CardWrapper.Header>
            <Typography variant="heading" level={3}>
              🧪 Primitives Test (Chakra Box directo)
            </Typography>
          </CardWrapper.Header>
          <CardWrapper.Body>
            <Stack direction="column" gap="sm">
              <Typography variant="body">
                Estos son Box de Chakra directos - deberían cambiar si gray.* funciona:
              </Typography>
              
              <Box bg="gray.800" color="gray.50" p={4} borderRadius="md">
                <Typography variant="body">Box con bg="gray.800" - Debería cambiar</Typography>
              </Box>
              
              <Box bg="gray.700" color="gray.100" p={4} borderRadius="md">
                <Typography variant="body">Box con bg="gray.700" - Debería cambiar</Typography>
              </Box>
              
              <Box bg="blue.500" color="white" p={4} borderRadius="md">
                <Typography variant="body">Box con bg="blue.500" - NO debería cambiar</Typography>
              </Box>
              
              {/* 🔍 SEMANTIC TOKENS TEST */}
              <Typography variant="body" weight="semibold" color="secondary" mt={4}>
                Semantic Tokens Test (deberían cambiar si funcionan):
              </Typography>
              
              <Box bg="bg.surface" color="text.primary" p={4} borderRadius="md" border="1px solid" borderColor="border.subtle">
                <Typography variant="body">Box con bg="bg.surface" - ¿Cambia?</Typography>
              </Box>
              
              <Box bg="bg.canvas" color="text.primary" p={4} borderRadius="md">
                <Typography variant="body">Box con bg="bg.canvas" - ¿Cambia?</Typography>
              </Box>
            </Stack>
          </CardWrapper.Body>
        </CardWrapper>

        {/* NEW Compact Dynamic Theme Test */}
        <DynamicThemeTest />
        
        {/* Component behavior tests */}
        <CardWrapper variant="elevated" padding="md">
          <CardWrapper.Header>
            <Typography variant="heading" level={3}>
              🧪 Default Component Behavior (Should Change with Theme)
            </Typography>
          </CardWrapper.Header>
          <CardWrapper.Body>
            <Stack direction="column" gap="md">
              <Typography variant="body">
                These components should automatically change colors when you switch themes above:
              </Typography>
              
              <Stack direction="row" gap="sm" wrap="wrap">
                <Button variant="solid">Default Button</Button>
                <Button variant="outline">Outline Button</Button>
                <Button variant="ghost">Ghost Button</Button>
                <Button variant="subtle">Subtle Button</Button>
              </Stack>
              
              <CardWrapper variant="outline" padding="sm">
                <Typography variant="body">
                  This card and text should also change colors automatically.
                </Typography>
              </CardWrapper>
            </Stack>
          </CardWrapper.Body>
        </CardWrapper>
        
        {/* Specific colorPalette tests */}
        <CardWrapper variant="elevated" padding="md">
          <CardWrapper.Header>
            <Typography variant="heading" level={3}>
              🎨 colorPalette Overrides (Should Stay Same Color)
            </Typography>
          </CardWrapper.Header>
          <CardWrapper.Body>
            <Stack direction="column" gap="md">
              <Typography variant="body">
                These use colorPalette and should NOT change when switching themes:
              </Typography>
              
              <Stack direction="row" gap="sm" wrap="wrap">
                <Button colorPalette="blue">Always Blue</Button>
                <Button colorPalette="green">Always Green</Button>
                <Button colorPalette="red">Always Red</Button>
                <Button colorPalette="purple">Always Purple</Button>
              </Stack>
            </Stack>
          </CardWrapper.Body>
        </CardWrapper>
        
        <Typography variant="body" size="sm" textAlign="center">
          ✅ Expected: Default components change colors, colorPalette components stay fixed colors
        </Typography>
      </Stack>
    </Layout>
  )
}

// Export default for lazy loading
export default ThemeTestPage
