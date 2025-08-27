import { Tabs as ChakraTabs, Box, HStack } from '@chakra-ui/react'
import type { ReactNode } from 'react'

interface TabsProps {
  children: ReactNode
  value?: string
  defaultValue?: string
  onValueChange?: (value: string) => void
  orientation?: 'horizontal' | 'vertical'
  variant?: 'line' | 'enclosed' | 'soft-rounded' | 'solid-rounded' | 'plain'
  size?: 'sm' | 'md' | 'lg'
  colorPalette?: 'gray' | 'blue' | 'green' | 'red' | 'orange' | 'purple' | 'pink'
  fitted?: boolean
  isLazy?: boolean
  lazyBehavior?: 'keepMounted' | 'unmountOnExit'
  className?: string
}

interface TabListProps {
  children: ReactNode
  justify?: 'start' | 'center' | 'end' | 'space-between' | 'space-around' | 'space-evenly'
  gap?: 'none' | 'xs' | 'sm' | 'md' | 'lg'
  className?: string
}

interface TabProps {
  children: ReactNode
  value: string
  disabled?: boolean
  icon?: ReactNode
  badge?: ReactNode
  className?: string
}

interface TabPanelsProps {
  children: ReactNode
  className?: string
}

interface TabPanelProps {
  children: ReactNode
  value: string
  padding?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  className?: string
}

const sizeMap = {
  sm: 'sm',
  md: 'md',
  lg: 'lg',
}

const gapMap = {
  none: 0,
  xs: 1,
  sm: 2,
  md: 3,
  lg: 4,
}

const paddingMap = {
  none: 0,
  xs: 2,
  sm: 3,
  md: 4,
  lg: 6,
  xl: 8,
}

const justifyMap = {
  start: 'flex-start',
  center: 'center',
  end: 'flex-end',
  'space-between': 'space-between',
  'space-around': 'space-around',
  'space-evenly': 'space-evenly',
}

export function Tabs({
  children,
  value,
  defaultValue,
  onValueChange,
  orientation = 'horizontal',
  variant = 'line',
  size = 'md',
  colorPalette = 'brand',
  fitted = false,
  isLazy = false,
  lazyBehavior = 'keepMounted',
  className,
  ...rest
}: TabsProps) {
  
  return (
    <ChakraTabs.Root
      value={value}
      defaultValue={defaultValue}
      onValueChange={(details) => onValueChange?.(details.value)}
      orientation={orientation}
      variant={variant}
      size={sizeMap[size]}
      colorPalette={colorPalette}
      fitted={fitted}
      lazyMount={isLazy}
      unmountOnExit={lazyBehavior === 'unmountOnExit'}
      className={className}
      {...rest}
    >
      {children}
    </ChakraTabs.Root>
  )
}

export function TabList({
  children,
  justify = 'start',
  gap = 'none',
  className,
  ...rest
}: TabListProps) {
  return (
    <ChakraTabs.List
      display="flex"
      justifyContent={justifyMap[justify]}
      gap={gapMap[gap]}
      className={className}
      {...rest}
    >
      {children}
    </ChakraTabs.List>
  )
}

export function Tab({
  children,
  value,
  disabled = false,
  icon,
  badge,
  className,
  ...rest
}: TabProps) {
  
  
  // 🎨 Get theme-aware text color from parent Tabs context
  // We need to check if the parent is using theme colors

  return (
    <ChakraTabs.Trigger
      value={value}
      disabled={disabled}
      className={className}

      {...rest}
    >
      <HStack gap={2} align="center">
        {icon && (
          <Box display="flex" alignItems="center">
            {icon}
          </Box>
        )}
        <Box>{children}</Box>
        {badge && (
          <Box display="flex" alignItems="center">
            {badge}
          </Box>
        )}
      </HStack>
    </ChakraTabs.Trigger>
  )
}

export function TabPanels({
  children,
  className,
  ...rest
}: TabPanelsProps) {
  return (
    <ChakraTabs.Content className={className} {...rest}>
      {children}
    </ChakraTabs.Content>
  )
}

export function TabPanel({
  children,
  value,
  padding = 'md',
  className,
  ...rest
}: TabPanelProps) {
  
  
  // 🎨 Apply theme text color to panel content

  return (
    <ChakraTabs.Content
      value={value}
      p={paddingMap[padding]}
      className={className}

      {...rest}
    >
      {children}
    </ChakraTabs.Content>
  )
}

// Componentes especializados para casos de uso del negocio
export function ModuleTabs({
  activeModule,
  onModuleChange,
  modules,
  showBadges = false,
  ...props
}: {
  activeModule: string
  onModuleChange: (module: string) => void
  modules: Array<{
    id: string
    label: string
    icon?: ReactNode
    badge?: number | string
    disabled?: boolean
  }>
  showBadges?: boolean
} & Omit<TabsProps, 'value' | 'onValueChange' | 'children'>) {
  return (
    <Tabs
      value={activeModule}
      onValueChange={onModuleChange}
      variant="line"
      colorPalette="brand"
      {...props}
    >
      <TabList>
        {modules.map((module) => (
          <Tab
            key={module.id}
            value={module.id}
            disabled={module.disabled}
            icon={module.icon}
            badge={showBadges && module.badge ? (
              <Box
                borderRadius="full"
                px={2}
                py={1}
                fontSize="xs"
                minWidth="20px"
                textAlign="center"
                style={{ backgroundColor: 'var(--chakra-colors-error-500)', color: 'white' }}
              >
                {module.badge}
              </Box>
            ) : undefined}
          >
            {module.label}
          </Tab>
        ))}
      </TabList>
    </Tabs>
  )
}

export function SettingsTabs({
  activeSection,
  onSectionChange,
  sections,
  ...props
}: {
  activeSection: string
  onSectionChange: (section: string) => void
  sections: Array<{
    id: string
    label: string
    icon?: ReactNode
    description?: string
  }>
} & Omit<TabsProps, 'value' | 'onValueChange' | 'children' | 'orientation'>) {
  return (
    <Tabs
      value={activeSection}
      onValueChange={onSectionChange}
      orientation="vertical"
      variant="soft-rounded"
      colorPalette="gray"
      {...props}
    >
      <TabList gap="xs">
        {sections.map((section) => (
          <Tab
            key={section.id}
            value={section.id}
            icon={section.icon}
            style={{ 
              justifyContent: 'flex-start',
              textAlign: 'left',
              width: '100%'
            }}
          >
            <Box>
              <Box fontWeight="medium">{section.label}</Box>
              {section.description && (
                <Box fontSize="xs" mt={1}>
                  {section.description}
                </Box>
              )}
            </Box>
          </Tab>
        ))}
      </TabList>
    </Tabs>
  )
}

export function DataTabs({
  activeView,
  onViewChange,
  views,
  count,
  ...props
}: {
  activeView: string
  onViewChange: (view: string) => void
  views: Array<{
    id: string
    label: string
    count?: number
    icon?: ReactNode
  }>
  count?: Record<string, number>
} & Omit<TabsProps, 'value' | 'onValueChange' | 'children'>) {
  return (
    <Tabs
      value={activeView}
      onValueChange={onViewChange}
      variant="enclosed"
      colorPalette="gray"
      {...props}
    >
      <TabList>
        {views.map((view) => {
          const itemCount = count?.[view.id] ?? view.count
          return (
            <Tab
              key={view.id}
              value={view.id}
              icon={view.icon}
              badge={itemCount ? (
                <Box
                  borderRadius="full"
                  px={2}
                  fontSize="xs"
                  fontWeight="medium"
                >
                  {itemCount}
                </Box>
              ) : undefined}
            >
              {view.label}
            </Tab>
          )
        })}
      </TabList>
    </Tabs>
  )
}

// Compound component pattern
Tabs.List = TabList
Tabs.Tab = Tab
Tabs.Panels = TabPanels
Tabs.Panel = TabPanel

// Specialized components
Tabs.Module = ModuleTabs
Tabs.Settings = SettingsTabs
Tabs.Data = DataTabs