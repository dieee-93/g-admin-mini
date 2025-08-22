import { Button, HStack, Text, Select } from '@chakra-ui/react'
import { SunIcon, MoonIcon, ComputerDesktopIcon } from '@heroicons/react/24/outline'
import { useTheme } from '@/hooks/useZustandStores'

const themeOptions = [
  { value: 'system', label: 'Sistema', icon: ComputerDesktopIcon },
  { value: 'light', label: 'Claro', icon: SunIcon },
  { value: 'dark', label: 'Oscuro', icon: MoonIcon },
  { value: 'corporate', label: 'Corporativo' },
  { value: 'nature', label: 'Natural' },
  { value: 'sunset', label: 'Atardecer' },
  { value: 'ocean', label: 'Océano' },
  { value: 'high-contrast', label: 'Alto Contraste' },
]

export function ThemeToggle() {
  const { theme, setTheme, getThemeColors } = useTheme()
  const currentColors = getThemeColors()

  return (
    <HStack gap={3}>
      <Text fontSize="sm" fontWeight="medium">
        Tema:
      </Text>
      <Select.Root 
        value={theme}
        onValueChange={(value) => setTheme(value.value as any)}
        size="sm"
        width="180px"
      >
        <Select.Trigger>
          <Select.ValueText>{themeOptions.find(opt => opt.value === theme)?.label || 'Sistema'}</Select.ValueText>
        </Select.Trigger>
        <Select.Content>
          {themeOptions.map((option) => {
            const Icon = option.icon
            return (
              <Select.Item key={option.value} item={option}>
                <HStack gap={2}>
                  {Icon && <Icon className="w-4 h-4" />}
                  <Text>{option.label}</Text>
                  {['corporate', 'nature', 'sunset', 'ocean', 'high-contrast'].includes(option.value) && (
                    <div
                      style={{
                        width: '12px',
                        height: '12px',
                        borderRadius: '2px',
                        backgroundColor: option.value === theme ? currentColors.primary : '#ccc',
                        marginLeft: 'auto',
                      }}
                    />
                  )}
                </HStack>
              </Select.Item>
            )
          })}
        </Select.Content>
      </Select.Root>
    </HStack>
  )
}

export function QuickThemeToggle() {
  const { toggleTheme, resolvedTheme } = useTheme()

  return (
    <Button
      size="sm"
      variant="ghost"
      onClick={toggleTheme}
      px={2}
    >
      {resolvedTheme === 'dark' ? (
        <SunIcon className="w-4 h-4" />
      ) : (
        <MoonIcon className="w-4 h-4" />
      )}
    </Button>
  )
}