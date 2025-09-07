import React from 'react'
import { useThemeStore, availableThemes } from '@/store/themeStore'
import { SelectField } from '@/shared/ui/SelectField'
import { 
  Layout, Stack, Typography, CardWrapper, Button, Badge, Alert
} from '@/shared/ui'
import { 
  PaintBrushIcon, 
  SparklesIcon,
  EyeIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline'

export const DynamicThemeTest = () => {
  const { currentTheme, applyTheme } = useThemeStore()

  // Organize themes by category
  const themeCategories = {
    'VSCode/Editor': ['synthwave-84', 'monokai-pro', 'dracula', 'tokyo-night', 'atom-one-dark', 'material-oceanic', 'material-darker', 'material-palenight', 'material-deep-ocean'],
    'Professional': ['corporate', 'nature', 'sunset', 'ocean', 'corporate-dark', 'nature-dark', 'sunset-dark', 'ocean-dark'],
    'Base': ['light', 'dark', 'system'],
    'Accessibility': ['high-contrast']
  }

  // Create options for SelectField
  const themeOptions = availableThemes.map(theme => ({
    value: theme.id,
    label: theme.name
  }))

  const handleThemeChange = (value: string | string[]) => {
    const selectedTheme = Array.isArray(value) ? value[0] : value
    applyTheme(selectedTheme)
  }

  const getCategoryForTheme = (themeId: string) => {
    for (const [category, themes] of Object.entries(themeCategories)) {
      if (themes.includes(themeId)) return category
    }
    return 'Other'
  }

  return (
    <CardWrapper variant="elevated" padding="lg">
      <Stack direction="column" gap="lg">
        
        {/* Header */}
        <Stack direction="row" gap="md" align="center">
          <PaintBrushIcon style={{ width: '2rem', height: '2rem', color: 'var(--chakra-colors-gray-500)' }} />
          <Stack gap="xs">
            <Typography variant="heading" level={2}>
              🚀 G-Admin Theme Studio
            </Typography>
            <Typography variant="body" color="text.secondary">
              Testing {availableThemes.length} themes using gray.* token mapping approach
            </Typography>
          </Stack>
        </Stack>

        {/* Current Theme Status */}
        <Alert variant="subtle" status="success">
          <Stack direction="row" gap="sm" align="center">
            <CheckCircleIcon style={{ width: '1.25rem', height: '1.25rem' }} />
            <Typography variant="body">
              <strong>Active:</strong> {currentTheme?.name || 'System Default'}
            </Typography>
            <Badge variant="subtle" colorPalette="green">
              {getCategoryForTheme(currentTheme?.id || 'system')}
            </Badge>
          </Stack>
        </Alert>

        {/* Enhanced Theme Selector */}
        <CardWrapper variant="outline" padding="md">
          <CardWrapper.Header>
            <Stack direction="row" gap="sm" align="center">
              <SparklesIcon style={{ width: '1.25rem', height: '1.25rem' }} />
              <Typography variant="heading" level={4}>Theme Selector</Typography>
            </Stack>
          </CardWrapper.Header>
          <CardWrapper.Body>
            <Stack direction="column" gap="md">
    
              <Typography variant="caption" color="text.secondary">
                Each theme maps colors to gray.* tokens for automatic component theming
              </Typography>
            </Stack>
          </CardWrapper.Body>
        </CardWrapper>

        {/* Quick Theme Buttons */}
        <CardWrapper variant="outline" padding="md">
          <CardWrapper.Header>
            <Stack direction="row" gap="sm" align="center">
              <EyeIcon style={{ width: '1.25rem', height: '1.25rem' }} />
              <Typography variant="heading" level={4}>Quick Theme Selection</Typography>
            </Stack>
          </CardWrapper.Header>
          <CardWrapper.Body>
            <Stack direction="column" gap="md">
              <Typography variant="body" color="text.secondary">
                Click any theme below to see instant color changes:
              </Typography>
              
              <Stack direction="row" gap="xs" wrap="wrap">
                {availableThemes.slice(0, 12).map((theme) => (
                  <Button
                    key={theme.id}
                    size="sm"
                    variant={currentTheme?.id === theme.id ? 'solid' : 'outline'}
                    onClick={() => applyTheme(theme.id)}
                  >
                    {theme.name}
                  </Button>
                ))}
              </Stack>
              
              {availableThemes.length > 12 && (
                <Typography variant="caption" color="text.muted">
                  Showing first 12 themes. Use dropdown above for full list.
                </Typography>
              )}
            </Stack>
          </CardWrapper.Body>
        </CardWrapper>

        {/* Current Status Indicator */}
        <CardWrapper variant="subtle" padding="md">
          <Stack direction="column" gap="sm">
            <Typography variant="body" weight="medium">
              🎯 System Status
            </Typography>
            <Typography variant="body" color="text.secondary">
              Current approach: Dynamic createSystem() with gray.* token override
            </Typography>
            <Typography variant="caption" color="text.muted">
              Expected behavior: All default components should change colors automatically when switching themes
            </Typography>
          </Stack>
        </CardWrapper>

      </Stack>
    </CardWrapper>
  )
}