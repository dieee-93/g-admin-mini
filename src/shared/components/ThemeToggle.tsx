import { SelectField, Stack, Typography, Button, Icon } from '@/shared/ui'
import { SunIcon, MoonIcon, ComputerDesktopIcon } from '@heroicons/react/24/outline'
import { useThemeStore, availableThemes } from '@/store/themeStore'

export function ThemeToggle() {
  const { currentTheme, applyTheme } = useThemeStore()

  // Create options from our availableThemes
  const themeOptions = availableThemes.map(theme => ({
    value: theme.id,
    label: theme.name,
    ...(theme.id === 'system' && { icon: ComputerDesktopIcon }),
    ...(theme.id === 'light' && { icon: SunIcon }),
    ...(theme.id === 'dark' && { icon: MoonIcon }),
  }))

  const handleThemeChange = (value: string | string[]) => {
    const selectedTheme = Array.isArray(value) ? value[0] : value
    applyTheme(selectedTheme)
  }

  return (
    <Stack direction="column" gap="sm">
      <Stack direction="row" gap="sm" align="center">
        <Typography variant="label">
          Tema Activo: {currentTheme?.name || 'System Default'}
        </Typography>
        <SelectField 
          value={currentTheme?.id || 'system'}
          onChange={handleThemeChange}
          placeholder="Selecciona un tema"
          width="220px"
          options={themeOptions}
        />
      </Stack>
      <Typography variant="caption" color="text.muted">
        {availableThemes.length} themes únicos disponibles con paletas profesionales y VSCode auténticas.
      </Typography>
    </Stack>
  )
}

export function QuickThemeToggle() {
  const { theme, toggleTheme } = useThemeStore()

  return (
    <Button
      size="sm"
      variant="ghost"
      onClick={toggleTheme}
    >
      {theme === 'dark' ? (
        <Icon icon={SunIcon} size="sm" />
      ) : (
        <Icon icon={MoonIcon} size="sm" />
      )}
    </Button>
  )
}