/**
 * Theme Debug Page - Professional Theme System Debugger
 * 
 * A polished interface for exploring and testing the dynamic theme system.
 */

import { useState } from 'react';
import { Box, Text, SimpleGrid, Flex, Grid, GridItem } from '@chakra-ui/react';
import {
  ContentLayout,
  Section,
  Tabs,
  Stack,
  Button,
  Badge
} from '@/shared/ui';
import { useThemeStore, availableThemes } from '@/store/themeStore';
import { DesignSystemShowcase } from './DesignSystemShowcase';

type ThemeTab = 'dynamic' | 'design-system' | 'tokens';

// Color swatch component for consistent rendering
function ColorSwatch({
  color,
  shade,
  size = 'md',
  showLabel = false
}: {
  color: string;
  shade: number;
  size?: 'sm' | 'md';
  showLabel?: boolean;
}) {
  const sizeMap = { sm: '6', md: '9' };
  const w = sizeMap[size];

  return (
    <Box
      position="relative"
      bg={`${color}.${shade}`}
      w={w}
      h={w}
      borderRadius="md"
      title={`${color}.${shade}`}
      transition="transform 0.1s"
      _hover={{ transform: 'scale(1.1)', zIndex: 1 }}
      boxShadow="sm"
    >
      {showLabel && (
        <Text
          position="absolute"
          bottom="-18px"
          left="50%"
          transform="translateX(-50%)"
          fontSize="2xs"
          color="text.muted"
        >
          {shade}
        </Text>
      )}
    </Box>
  );
}

export default function ThemeDebugPage() {
  const [activeTab, setActiveTab] = useState<ThemeTab>('dynamic');
  const { currentTheme, applyTheme } = useThemeStore();

  const tabs = [
    { id: 'dynamic' as ThemeTab, label: 'Themes', icon: '🎨' },
    { id: 'design-system' as ThemeTab, label: 'Components', icon: '🧩' },
    { id: 'tokens' as ThemeTab, label: 'Tokens', icon: '🎯' }
  ];

  // Group themes by category
  type ThemeItem = typeof availableThemes[number];
  const themesByCategory = availableThemes.reduce((acc, theme) => {
    const category = theme.category;
    if (!acc[category]) acc[category] = [];
    acc[category].push(theme);
    return acc;
  }, {} as Record<string, ThemeItem[]>);

  // Category display order
  const categoryOrder = [
    'base',
    'professional-light',
    'professional-dark',
    'vscode',
    'material',
    'futuristic',
    'modern',
    'accessibility'
  ];

  const sortedCategories = Object.entries(themesByCategory).sort(([a], [b]) => {
    return categoryOrder.indexOf(a) - categoryOrder.indexOf(b);
  });

  return (
    <ContentLayout spacing="normal">
      <Section variant="flat" title="🎨 Theme System Debugger">
        <Tabs.Root
          value={activeTab}
          onValueChange={(e) => setActiveTab(e.value as ThemeTab)}
          variant="line"
          colorPalette="purple"
        >
          <Tabs.List>
            {tabs.map(tab => (
              <Tabs.Trigger key={tab.id} value={tab.id}>
                <span>{tab.icon}</span> {tab.label}
              </Tabs.Trigger>
            ))}
          </Tabs.List>

          <Box mt="5">
            {/* ============ DYNAMIC THEMES TAB ============ */}
            <Tabs.Content value="dynamic">
              <Grid
                templateColumns={{ base: '1fr', lg: '1fr 380px' }}
                gap="6"
                alignItems="start"
              >
                {/* Left Column: Theme Selector */}
                <GridItem>
                  <Stack gap="4">
                    {/* Current Theme Header */}
                    <Flex
                      p="4"
                      bg="bg.panel"
                      borderRadius="lg"
                      justify="space-between"
                      align="center"
                      border="1px solid"
                      borderColor="border.subtle"
                    >
                      <Flex align="center" gap="3">
                        <Box
                          w="10"
                          h="10"
                          bg="purple.500"
                          borderRadius="lg"
                          display="flex"
                          alignItems="center"
                          justifyContent="center"
                        >
                          <Text fontSize="lg">🎨</Text>
                        </Box>
                        <Box>
                          <Text fontSize="sm" color="text.muted">Tema Activo</Text>
                          <Text fontWeight="bold" color="text.primary" fontSize="lg">
                            {currentTheme?.name || 'Default'}
                          </Text>
                        </Box>
                      </Flex>
                      <Badge colorPalette="purple" size="lg">
                        {currentTheme?.category?.replace(/-/g, ' ') || 'base'}
                      </Badge>
                    </Flex>

                    {/* Theme Grid */}
                    <SimpleGrid columns={{ base: 1, md: 2 }} gap="3">
                      {sortedCategories.map(([category, themes]) => (
                        <Box
                          key={category}
                          p="4"
                          bg="bg.subtle"
                          borderRadius="lg"
                          border="1px solid"
                          borderColor="border.subtle"
                          _hover={{ borderColor: 'border.default' }}
                          transition="border-color 0.2s"
                        >
                          <Text
                            fontSize="xs"
                            fontWeight="bold"
                            color="text.muted"
                            mb="3"
                            textTransform="uppercase"
                            letterSpacing="wider"
                          >
                            {category.replace(/-/g, ' ')}
                          </Text>
                          <Flex gap="2" flexWrap="wrap">
                            {themes.map(theme => (
                              <Button
                                key={theme.id}
                                size="xs"
                                variant={currentTheme?.id === theme.id ? 'solid' : 'outline'}
                                colorPalette={currentTheme?.id === theme.id ? 'purple' : 'gray'}
                                onClick={() => applyTheme(theme.id)}
                              >
                                {theme.name}
                              </Button>
                            ))}
                          </Flex>
                        </Box>
                      ))}
                    </SimpleGrid>
                  </Stack>
                </GridItem>

                {/* Right Column: Live Color Preview */}
                <GridItem>
                  <Box
                    position="sticky"
                    top="80px"
                    p="4"
                    bg="bg.panel"
                    borderRadius="lg"
                    border="1px solid"
                    borderColor="border.subtle"
                  >
                    <Text
                      fontSize="sm"
                      fontWeight="bold"
                      color="text.primary"
                      mb="4"
                    >
                      🌈 Live Color Preview
                    </Text>

                    <Stack gap="3">
                      {/* Gray - Dynamic */}
                      <Box>
                        <Flex align="center" gap="2" mb="2">
                          <Text fontSize="xs" fontWeight="semibold" color="text.muted">
                            GRAY
                          </Text>
                          <Badge size="sm" colorPalette="purple">Dynamic</Badge>
                        </Flex>
                        <Flex gap="1">
                          {[50, 100, 200, 300, 400, 500, 600, 700, 800, 900].map(shade => (
                            <ColorSwatch
                              key={shade}
                              color="gray"
                              shade={shade}
                              size="sm"
                            />
                          ))}
                        </Flex>
                      </Box>

                      {/* Fixed Palettes */}
                      {['blue', 'green', 'red', 'purple', 'orange', 'teal'].map(color => (
                        <Box key={color}>
                          <Text
                            fontSize="xs"
                            fontWeight="semibold"
                            color="text.muted"
                            mb="2"
                            textTransform="uppercase"
                          >
                            {color}
                          </Text>
                          <Flex gap="1">
                            {[50, 100, 200, 300, 400, 500, 600, 700, 800, 900].map(shade => (
                              <ColorSwatch
                                key={shade}
                                color={color}
                                shade={shade}
                                size="sm"
                              />
                            ))}
                          </Flex>
                        </Box>
                      ))}
                    </Stack>

                    <Text fontSize="xs" color="text.muted" mt="4">
                      💡 Gray se mapea al tema. Los demás colores son fijos.
                    </Text>
                  </Box>
                </GridItem>
              </Grid>
            </Tabs.Content>

            {/* ============ DESIGN SYSTEM TAB ============ */}
            <Tabs.Content value="design-system">
              <DesignSystemShowcase />
            </Tabs.Content>

            {/* ============ TOKENS TAB ============ */}
            <Tabs.Content value="tokens">
              <SimpleGrid columns={{ base: 1, md: 2 }} gap="6">
                {/* Background Tokens */}
                <Box
                  p="5"
                  bg="bg.subtle"
                  borderRadius="lg"
                  border="1px solid"
                  borderColor="border.subtle"
                >
                  <Text fontSize="sm" fontWeight="bold" color="text.primary" mb="4">
                    Background Tokens
                  </Text>
                  <Stack gap="2">
                    {[
                      { token: 'bg.surface', desc: 'Main surfaces' },
                      { token: 'bg.panel', desc: 'Elevated panels' },
                      { token: 'bg.subtle', desc: 'Subtle backgrounds' },
                      { token: 'bg.muted', desc: 'Muted areas' }
                    ].map(({ token, desc }) => (
                      <Flex key={token} align="center" gap="3">
                        <Box
                          w="12"
                          h="8"
                          bg={token}
                          borderRadius="md"
                          border="1px solid"
                          borderColor="border.default"
                        />
                        <Box>
                          <Text fontSize="xs" fontWeight="semibold" color="text.primary">{token}</Text>
                          <Text fontSize="xs" color="text.muted">{desc}</Text>
                        </Box>
                      </Flex>
                    ))}
                  </Stack>
                </Box>

                {/* Text Tokens */}
                <Box
                  p="5"
                  bg="bg.subtle"
                  borderRadius="lg"
                  border="1px solid"
                  borderColor="border.subtle"
                >
                  <Text fontSize="sm" fontWeight="bold" color="text.primary" mb="4">
                    Text Tokens
                  </Text>
                  <Stack gap="2">
                    <Text color="text.primary" fontWeight="medium">text.primary — Main text</Text>
                    <Text color="text.secondary">text.secondary — Secondary text</Text>
                    <Text color="text.muted">text.muted — Muted/disabled text</Text>
                    <Text color="fg">fg — Foreground default</Text>
                    <Text color="fg.muted">fg.muted — Foreground muted</Text>
                  </Stack>
                </Box>

                {/* Border Tokens */}
                <Box
                  p="5"
                  bg="bg.subtle"
                  borderRadius="lg"
                  border="1px solid"
                  borderColor="border.subtle"
                  gridColumn={{ md: 'span 2' }}
                >
                  <Text fontSize="sm" fontWeight="bold" color="text.primary" mb="4">
                    Border Tokens
                  </Text>
                  <Flex gap="4" flexWrap="wrap">
                    <Box p="4" border="2px solid" borderColor="border.subtle" borderRadius="lg">
                      <Text fontSize="sm" fontWeight="medium">border.subtle</Text>
                    </Box>
                    <Box p="4" border="2px solid" borderColor="border.default" borderRadius="lg">
                      <Text fontSize="sm" fontWeight="medium">border.default</Text>
                    </Box>
                  </Flex>
                </Box>
              </SimpleGrid>
            </Tabs.Content>
          </Box>
        </Tabs.Root>
      </Section>
    </ContentLayout>
  );
}