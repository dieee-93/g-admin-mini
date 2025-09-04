import { VStack, HStack, Box } from '@chakra-ui/react'
import { 
  Button, 
  CardWrapper, 
  Typography, 
  Badge, 
  InputField,
  NumberField,
  SelectField,
  createListCollection,
  Switch,
  Tabs,
  Tab,
  TabList,
  TabPanels,
  TabPanel,
  CircularProgress,
  Avatar
} from '@/shared/ui'
import { useThemeStore, availableThemes } from '@/store/themeStore'

const frameworks = createListCollection({
  items: [
    { label: "React", value: "react" },
    { label: "Solid", value: "solid" },
    { label: "Vue", value: "vue" },
    { label: "Svelte", value: "svelte" },
  ],
})

export const FullDesignSystemDemo = () => {
  const { currentTheme, applyTheme } = useThemeStore()

  return (
    <CardWrapper variant="elevated" padding="lg" >
      <VStack gap={8} align="start">
        <Typography variant="heading" level={1} >
          🎨 Full Design System Demo
        </Typography>

        {/* Theme Selector */}
        <CardWrapper  padding="md" width="full">
          <VStack gap={4} align="start">
            <Typography variant="heading" level={3} >
              Theme Selector
            </Typography>
            <Typography variant="body" >
              Current: <Badge  variant="solid">{currentTheme?.name || 'System'}</Badge>
            </Typography>
            
            <HStack wrap="wrap" gap={2}>
              {availableThemes.map((theme) => (
                <Button
                  key={theme.id}
                  size="sm"
                  variant={currentTheme?.id === theme.id ? 'solid' : 'outline'}
                  
                  onClick={() => applyTheme(theme.id)}
                >
                  {theme.name}
                </Button>
              ))}
            </HStack>
          </VStack>
        </CardWrapper>

        {/* Typography Showcase */}
        <CardWrapper  padding="md" width="full">
          <VStack gap={3} align="start">
            <Typography variant="heading" level={3} >
              Typography with Dynamic Themes
            </Typography>
            <Typography variant="display" >Display Text</Typography>
            <Typography variant="heading" level={2} >Heading Level 2</Typography>
            <Typography variant="title" >Title Text</Typography>
            <Typography variant="body" >
              Body text that adapts to the current theme automatically. 
              This demonstrates how all typography responds to theme changes.
            </Typography>
            <Typography variant="caption" >Caption text</Typography>
            <Typography variant="label" >Label text</Typography>
          </VStack>
        </CardWrapper>

        {/* Buttons & Actions */}
        <CardWrapper  padding="md" width="full">
          <VStack gap={4} align="start">
            <Typography variant="heading" level={3} >
              Buttons & Actions
            </Typography>
            
            <VStack gap={3} align="start" w="full">
              <HStack gap={2}>
                <Button  variant="solid" size="sm">Theme Solid</Button>
                <Button  variant="outline" size="sm">Theme Outline</Button>
                <Button  variant="ghost" size="sm">Theme Ghost</Button>
                <Button  variant="subtle" size="sm">Theme Subtle</Button>
              </HStack>
              
              <HStack gap={2}>
                <Button colorPalette="green" size="sm">Success</Button>
                <Button colorPalette="orange" size="sm">Warning</Button>
                <Button colorPalette="red" size="sm">Error</Button>
                <Button colorPalette="blue" size="sm">Info</Button>
              </HStack>
            </VStack>
          </VStack>
        </CardWrapper>

        {/* Badges */}
        <CardWrapper  padding="md" w="full">
          <VStack gap={3} align="start">
            <Typography variant="heading" level={3} >
              Badges
            </Typography>
            <HStack gap={2} wrap="wrap">
              <Badge  variant="solid">Theme Solid</Badge>
              <Badge  variant="outline">Theme Outline</Badge>
              <Badge  variant="subtle">Theme Subtle</Badge>
              <Badge colorPalette="success">Success</Badge>
              <Badge colorPalette="warning">Warning</Badge>
              <Badge colorPalette="error">Error</Badge>
            </HStack>
          </VStack>
        </CardWrapper>

        {/* Form Elements */}
        <CardWrapper  padding="md" w="full">
          <VStack gap={4} align="start">
            <Typography variant="heading" level={3} >
              Form Elements
            </Typography>
            
            <HStack gap={4} w="full" wrap="wrap">
              <Box minW="200px">
                <InputField
                  label="Text Input"
                  placeholder="Enter text..."
                  colorScheme="theme"
                />
              </Box>
              
              <Box minW="200px">
                <NumberField
                  label="Number Input"
                  placeholder="Enter number..."
                  colorScheme="theme"
                />
              </Box>
              
              <Box minW="200px">
                <SelectField
                  label="Select Field"
                  placeholder="Choose option..."
                  collection={frameworks}
                  colorScheme="theme"
                />
              </Box>
            </HStack>
          </VStack>
        </CardWrapper>

        {/* Nested Cards */}
        <CardWrapper  padding="md" w="full">
          <VStack gap={4} align="start">
            <Typography variant="heading" level={3} >
              Nested Components
            </Typography>
            
            <CardWrapper  padding="sm" variant="outline" w="full">
              <HStack justify="space-between" align="center">
                <VStack align="start" gap={1}>
                  <Typography variant="label" >Nested Card Example</Typography>
                  <Typography variant="caption" >
                    This card is nested inside another card and both adapt to themes
                  </Typography>
                </VStack>
                <Button  size="sm">Action</Button>
              </HStack>
            </CardWrapper>

            <CardWrapper  padding="sm" variant="subtle" w="full">
              <HStack justify="space-between" align="center">
                <Typography variant="body" >Subtle variant card</Typography>
                <Badge  dot pulse>Live</Badge>
              </HStack>
            </CardWrapper>
          </VStack>
        </CardWrapper>

        {/* New Theme Components */}
        <CardWrapper  padding="md" width="full">
          <VStack gap={4} align="start">
            <Typography variant="heading" level={3} >
              New Theme Components
            </Typography>
            
            {/* Switch Examples */}
            <Box>
              <Typography variant="label"  mb={2}>Switch with Theme Support</Typography>
              <HStack gap={4}>
                <Switch  defaultChecked>Theme Switch</Switch>
                <Switch colorPalette="success" defaultChecked>Success</Switch>
                <Switch colorPalette="error">Error</Switch>
              </HStack>
            </Box>

            {/* Tabs Examples */}
            <Box width="full">
              <Typography variant="label"  mb={2}>Tabs with Theme Support</Typography>
              <Tabs  defaultValue="tab1">
                <TabList>
                  <Tab value="tab1">Theme Tab 1</Tab>
                  <Tab value="tab2">Theme Tab 2</Tab>
                  <Tab value="tab3">Theme Tab 3</Tab>
                </TabList>
                <TabPanels>
                  <TabPanel value="tab1" padding="md">
                    <Typography >Content for tab 1 using theme colors</Typography>
                  </TabPanel>
                  <TabPanel value="tab2" padding="md">
                    <Typography >Content for tab 2 using theme colors</Typography>
                  </TabPanel>
                  <TabPanel value="tab3" padding="md">
                    <Typography >Content for tab 3 using theme colors</Typography>
                  </TabPanel>
                </TabPanels>
              </Tabs>
            </Box>

            {/* Progress & Avatar Examples */}
            <HStack gap={6} align="start">
              <Box>
                <Typography variant="label"  mb={2}>CircularProgress with Theme</Typography>
                <VStack gap={2}>
                  <CircularProgress value={75}  showValueText />
                  <CircularProgress value={50} colorPalette="blue" showValueText />
                  <CircularProgress value={25} colorPalette="green" showValueText />
                </VStack>
              </Box>
              
              <Box>
                <Typography variant="label"  mb={2}>Avatar with Theme</Typography>
                <HStack gap={2}>
                  <Avatar  name="Theme User" />
                  <Avatar  size="lg" name="Large Theme" />
                  <Avatar colorPalette="success" name="Success User" />
                  <Avatar colorPalette="brand" name="Brand User" />
                </HStack>
              </Box>
            </HStack>
          </VStack>
        </CardWrapper>

        {/* Color Debug Visualization */}
        {currentTheme?.id === 'atom-one-dark' && (
          <CardWrapper padding="md" variant="outline"  width="full">
            <VStack gap={4} align="start">
              <Typography variant="heading" level={3} >
                🔍 Atom One Dark - Color Debug
              </Typography>
              
              <Typography variant="body" >
                Esta sección aparece solo para debuggear el tema Atom One Dark
              </Typography>
              
              {/* Color Swatches */}
              <HStack gap={4} wrap="wrap">
                <Box>
                  <Typography variant="label"  mb={2}>Primary Color</Typography>
                  <Box 
                    width="60px" 
                    height="60px" 
                    border="1px solid"
                    borderRadius="md"
                  />
                </Box>
                
                <Box>
                  <Typography variant="label"  mb={2}>Background</Typography>
                  <Box 
                    width="60px" 
                    height="60px" 
                    border="1px solid"
                    borderRadius="md"
                  />
                </Box>
                
                <Box>
                  <Typography variant="label"  mb={2}>Text Color</Typography>
                  <Box 
                    width="60px" 
                    height="60px" 
                    border="1px solid"
                    borderRadius="md"
                  />
                </Box>
                
                <Box>
                  <Typography variant="label"  mb={2}>Surface</Typography>
                  <Box 
                    width="60px" 
                    height="60px" 
                    border="1px solid"
                    borderRadius="md"
                  />
                </Box>
              </HStack>
              
              {/* Problematic Components */}
              <Typography variant="label" >
                ¿Estos componentes se ven raros?
              </Typography>
              <HStack gap={4} wrap="wrap">
                <Button  variant="solid">Primary Button</Button>
                <Button  variant="outline">Outline Button</Button>
                <Badge  variant="solid">Primary Badge</Badge>
                <Switch  defaultChecked>Switch</Switch>
              </HStack>
            </VStack>
          </CardWrapper>
        )}

        {/* Theme Debug Info */}
        <CardWrapper padding="sm" variant="outline"  w="full">
          <VStack gap={2} align="start">
            <Typography variant="label" >Theme Debug Info:</Typography>
            <Typography variant="caption" >
              ID: {currentTheme?.id || 'system'} • 
              Name: {currentTheme?.name || 'System Default'} • 
              Palette: {currentTheme?.palette || 'brand'}
            </Typography>
          </VStack>
        </CardWrapper>
      </VStack>
    </CardWrapper>
  )
}
