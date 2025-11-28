```index.tsx
import React from 'react'
import { ChakraProvider, extendTheme } from '@chakra-ui/react'
import { render } from 'react-dom'
import { App } from './App'
import './index.css'
const theme = extendTheme({
  styles: {
    global: {
      body: {
        bg: '#0a1929',
        color: 'white',
      },
    },
  },
  fonts: {
    body: 'Inter, system-ui, sans-serif',
    heading: 'Inter, system-ui, sans-serif',
  },
  colors: {
    brand: {
      50: '#e3f2fd',
      100: '#bbdefb',
      200: '#90caf9',
      300: '#64b5f6',
      400: '#42a5f5',
      500: '#2196f3',
      600: '#1e88e5',
      700: '#1976d2',
      800: '#1565c0',
      900: '#0d47a1',
    },
  },
})
render(
  <ChakraProvider theme={theme}>
    <App />
  </ChakraProvider>,
  document.getElementById('root'),
)

```
```App.tsx
import React from 'react'
import { Box } from '@chakra-ui/react'
import { Dashboard } from './components/dashboard/Dashboard'
export function App() {
  return (
    <Box width="100%" minHeight="100vh" bg="#0a1929">
      <Dashboard />
    </Box>
  )
}

```
```AppRouter.tsx
import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { App } from "./App";

export function AppRouter() {
  return (
    <BrowserRouter>
        <Routes>
          <Route path="/" element={<App />} />
        </Routes>
    </BrowserRouter>
  );
}
```
```components/layout/Layout.tsx
import React from 'react'
import { Box, Flex } from '@chakra-ui/react'
import { Sidebar } from './Sidebar'
import { Header } from './Header'
interface LayoutProps {
  children: React.ReactNode
}
export const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <Flex width="100%" height="100vh">
      <Sidebar />
      <Box flex="1" overflowY="auto">
        <Header />
        <Box p={4} overflowY="auto">
          {children}
        </Box>
      </Box>
    </Flex>
  )
}

```
```components/layout/Sidebar.tsx
import React from 'react'
import { Box, VStack, Icon, Tooltip, Divider } from '@chakra-ui/react'
import {
  Home,
  BarChart2,
  Users,
  Package,
  FileText,
  Settings,
  HelpCircle,
  Bell,
  Layers,
  ShoppingCart,
} from 'lucide-react'
export const Sidebar = () => {
  const iconSize = 20
  const SidebarIcon = ({
    icon,
    label,
  }: {
    icon: React.ReactElement
    label: string
  }) => (
    <Tooltip label={label} placement="right" hasArrow>
      <Box
        p={3}
        color="whiteAlpha.800"
        borderRadius="md"
        _hover={{
          bg: 'whiteAlpha.100',
          color: 'white',
        }}
        cursor="pointer"
      >
        {icon}
      </Box>
    </Tooltip>
  )
  return (
    <Box
      w="60px"
      bg="#0a1929"
      borderRight="1px solid"
      borderColor="whiteAlpha.100"
      py={4}
    >
      <VStack spacing={2} align="center">
        <Box p={2} mb={4}>
          <Icon as={Layers} color="blue.400" boxSize={6} />
        </Box>
        <SidebarIcon
          icon={<Icon as={Home} boxSize={iconSize} />}
          label="Dashboard"
        />
        <SidebarIcon
          icon={<Icon as={BarChart2} boxSize={iconSize} />}
          label="Estadísticas"
        />
        <SidebarIcon
          icon={<Icon as={Users} boxSize={iconSize} />}
          label="Usuarios"
        />
        <SidebarIcon
          icon={<Icon as={Package} boxSize={iconSize} />}
          label="Productos"
        />
        <SidebarIcon
          icon={<Icon as={ShoppingCart} boxSize={iconSize} />}
          label="Ventas"
        />
        <SidebarIcon
          icon={<Icon as={FileText} boxSize={iconSize} />}
          label="Reportes"
        />
        <Divider my={4} borderColor="whiteAlpha.200" />
        <SidebarIcon
          icon={<Icon as={Bell} boxSize={iconSize} />}
          label="Notificaciones"
        />
        <SidebarIcon
          icon={<Icon as={Settings} boxSize={iconSize} />}
          label="Configuración"
        />
        <SidebarIcon
          icon={<Icon as={HelpCircle} boxSize={iconSize} />}
          label="Ayuda"
        />
      </VStack>
    </Box>
  )
}

```
```components/layout/Header.tsx
import React, { useState } from 'react'
import {
  Box,
  Flex,
  Text,
  Avatar,
  IconButton,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  HStack,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  Input,
  InputGroup,
  InputLeftElement,
  Badge,
  VStack,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverBody,
  Button,
} from '@chakra-ui/react'
import { Bell, ChevronDown, Search, Calendar } from 'lucide-react'
export const Header = () => {
  const [notifications] = useState([
    {
      id: '1',
      title: 'Nueva venta completada',
      time: 'Hace 2 min',
      read: false,
    },
    {
      id: '2',
      title: 'Stock bajo en Material XYZ',
      time: 'Hace 15 min',
      read: false,
    },
    {
      id: '3',
      title: 'Orden de producción lista',
      time: 'Hace 1 hora',
      read: true,
    },
  ])
  const unreadCount = notifications.filter((n) => !n.read).length
  return (
    <Box
      py={4}
      px={6}
      bg="#0a1929"
      borderBottom="1px solid"
      borderColor="whiteAlpha.100"
    >
      <Flex justify="space-between" align="center">
        <Breadcrumb color="whiteAlpha.800" separator="/" spacing={2}>
          <BreadcrumbItem>
            <BreadcrumbLink
              href="#"
              fontWeight="bold"
              color="blue.400"
              fontSize="md"
            >
              G-Admin
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbItem>
            <BreadcrumbLink href="#" color="whiteAlpha.900" fontWeight="medium">
              Dashboard
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbItem>
            <Text color="whiteAlpha.500" fontSize="sm">
              Centro de operaciones
            </Text>
          </BreadcrumbItem>
        </Breadcrumb>
        <HStack spacing={3}>
          <InputGroup
            maxW="300px"
            display={{
              base: 'none',
              lg: 'block',
            }}
          >
            <InputLeftElement pointerEvents="none">
              <Search size={16} color="rgba(255, 255, 255, 0.4)" />
            </InputLeftElement>
            <Input
              placeholder="Buscar... (Ctrl+K)"
              size="sm"
              bg="whiteAlpha.100"
              border="1px solid"
              borderColor="whiteAlpha.200"
              _hover={{
                borderColor: 'whiteAlpha.300',
              }}
              _focus={{
                borderColor: 'blue.400',
                boxShadow: '0 0 0 1px #3182ce',
              }}
              color="white"
              _placeholder={{
                color: 'whiteAlpha.500',
              }}
            />
          </InputGroup>
          <Menu>
            <MenuButton
              as={Button}
              size="sm"
              variant="ghost"
              leftIcon={<Calendar size={16} />}
              color="whiteAlpha.700"
              _hover={{
                bg: 'whiteAlpha.100',
              }}
              display={{
                base: 'none',
                md: 'flex',
              }}
            >
              Hoy
            </MenuButton>
            <MenuList bg="#152a47" borderColor="whiteAlpha.200">
              <MenuItem
                bg="#152a47"
                _hover={{
                  bg: '#1e3a61',
                }}
                fontWeight="medium"
              >
                Hoy
              </MenuItem>
              <MenuItem
                bg="#152a47"
                _hover={{
                  bg: '#1e3a61',
                }}
                fontWeight="medium"
              >
                Esta Semana
              </MenuItem>
              <MenuItem
                bg="#152a47"
                _hover={{
                  bg: '#1e3a61',
                }}
                fontWeight="medium"
              >
                Este Mes
              </MenuItem>
              <MenuItem
                bg="#152a47"
                _hover={{
                  bg: '#1e3a61',
                }}
                fontWeight="medium"
              >
                Este Año
              </MenuItem>
              <MenuItem
                bg="#152a47"
                _hover={{
                  bg: '#1e3a61',
                }}
                fontWeight="medium"
              >
                Personalizado...
              </MenuItem>
            </MenuList>
          </Menu>
          <Popover placement="bottom-end">
            <PopoverTrigger>
              <Box position="relative" cursor="pointer">
                <IconButton
                  aria-label="Notifications"
                  icon={<Bell size={18} />}
                  variant="ghost"
                  color="whiteAlpha.700"
                  size="md"
                  _hover={{
                    bg: 'whiteAlpha.100',
                    color: 'white',
                  }}
                />
                {unreadCount > 0 && (
                  <Badge
                    position="absolute"
                    top="-2px"
                    right="-2px"
                    colorScheme="red"
                    borderRadius="full"
                    fontSize="xs"
                    minW="18px"
                    h="18px"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                  >
                    {unreadCount}
                  </Badge>
                )}
              </Box>
            </PopoverTrigger>
            <PopoverContent
              bg="#152a47"
              borderColor="whiteAlpha.200"
              width="350px"
            >
              <PopoverBody p={0}>
                <Box
                  p={4}
                  borderBottom="1px solid"
                  borderColor="whiteAlpha.100"
                >
                  <Text fontWeight="bold" color="white">
                    Notificaciones
                  </Text>
                </Box>
                <VStack
                  spacing={0}
                  align="stretch"
                  maxH="400px"
                  overflowY="auto"
                >
                  {notifications.map((notification) => (
                    <Box
                      key={notification.id}
                      p={4}
                      borderBottom="1px solid"
                      borderColor="whiteAlpha.100"
                      bg={notification.read ? 'transparent' : 'whiteAlpha.50'}
                      _hover={{
                        bg: 'whiteAlpha.100',
                      }}
                      cursor="pointer"
                    >
                      <Text
                        fontSize="sm"
                        fontWeight="medium"
                        color="white"
                        mb={1}
                      >
                        {notification.title}
                      </Text>
                      <Text fontSize="xs" color="whiteAlpha.500">
                        {notification.time}
                      </Text>
                    </Box>
                  ))}
                </VStack>
                <Box p={3} borderTop="1px solid" borderColor="whiteAlpha.100">
                  <Button
                    size="sm"
                    variant="ghost"
                    width="full"
                    color="blue.400"
                    fontWeight="medium"
                  >
                    Ver todas las notificaciones
                  </Button>
                </Box>
              </PopoverBody>
            </PopoverContent>
          </Popover>
          <Menu>
            <MenuButton>
              <HStack spacing={3}>
                <Avatar size="sm" name="Admin User" bg="blue.500" />
                <Box
                  textAlign="left"
                  display={{
                    base: 'none',
                    md: 'block',
                  }}
                >
                  <Text
                    fontSize="sm"
                    fontWeight="semibold"
                    color="whiteAlpha.900"
                  >
                    admin@example.com
                  </Text>
                  <Text
                    fontSize="xs"
                    color="whiteAlpha.500"
                    fontWeight="medium"
                  >
                    SUPER_ADMIN
                  </Text>
                </Box>
                <Box color="whiteAlpha.500">
                  <ChevronDown size={16} />
                </Box>
              </HStack>
            </MenuButton>
            <MenuList bg="#152a47" borderColor="whiteAlpha.200">
              <MenuItem
                bg="#152a47"
                _hover={{
                  bg: '#1e3a61',
                }}
                fontWeight="medium"
              >
                Perfil
              </MenuItem>
              <MenuItem
                bg="#152a47"
                _hover={{
                  bg: '#1e3a61',
                }}
                fontWeight="medium"
              >
                Configuración
              </MenuItem>
              <MenuItem
                bg="#152a47"
                _hover={{
                  bg: '#1e3a61',
                }}
                fontWeight="medium"
              >
                Cerrar Sesión
              </MenuItem>
            </MenuList>
          </Menu>
        </HStack>
      </Flex>
    </Box>
  )
}

```
```components/widgets/StatCard.tsx
import React from 'react'
import { Box, Flex, Text, Icon } from '@chakra-ui/react'
interface StatCardProps {
  title: string
  value: string | number
  subtitle?: string
  icon?: React.ReactElement
  accentColor?: string
  footer?: string
  footerValue?: string
  footerColor?: string
  trend?: {
    value: string
    isPositive: boolean
  }
}
export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  accentColor = 'blue.400',
  footer,
  footerValue,
  footerColor,
  trend,
}) => {
  return (
    <Box
      bg="#152a47"
      p={6}
      borderRadius="2xl"
      borderLeft="4px solid"
      borderColor={accentColor}
      transition="all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)"
      _hover={{
        transform: 'translateY(-4px)',
        boxShadow: '0 8px 16px rgba(0, 0, 0, 0.3)',
      }}
    >
      <Flex justify="space-between" align="start" mb={4}>
        <Box flex={1}>
          <Text fontSize="sm" color="whiteAlpha.600" fontWeight="medium" mb={2}>
            {title}
          </Text>
          <Text fontSize="3xl" fontWeight="bold" color="white" lineHeight="1">
            {value}
          </Text>
          {subtitle && (
            <Text fontSize="xs" color="whiteAlpha.500" mt={2}>
              {subtitle}
            </Text>
          )}
        </Box>
        {icon && (
          <Box p={3} borderRadius="xl" bg="whiteAlpha.100" color={accentColor}>
            {icon}
          </Box>
        )}
      </Flex>
      {trend && (
        <Flex align="center" mb={2}>
          <Text
            fontSize="sm"
            fontWeight="semibold"
            color={trend.isPositive ? 'green.400' : 'red.400'}
          >
            {trend.isPositive ? '↑' : '↓'} {trend.value}
          </Text>
          <Text fontSize="xs" color="whiteAlpha.500" ml={2}>
            vs período anterior
          </Text>
        </Flex>
      )}
      {(footer || footerValue) && (
        <Flex
          justify="space-between"
          align="center"
          pt={4}
          borderTop="1px solid"
          borderColor="whiteAlpha.100"
        >
          {footer && (
            <Text fontSize="xs" color="whiteAlpha.500" fontWeight="medium">
              {footer}
            </Text>
          )}
          {footerValue && (
            <Text
              fontSize="sm"
              fontWeight="semibold"
              color={footerColor || 'white'}
            >
              {footerValue}
            </Text>
          )}
        </Flex>
      )}
    </Box>
  )
}

```
```components/widgets/AlertCard.tsx
import React from 'react'
import { Box, Flex, Text, Icon, Badge } from '@chakra-ui/react'
import { AlertTriangle, CheckCircle } from 'lucide-react'
interface AlertCardProps {
  title: string
  description: string
  status?: 'success' | 'warning' | 'error' | 'info'
  icon?: React.ReactElement
}
export const AlertCard: React.FC<AlertCardProps> = ({
  title,
  description,
  status = 'info',
  icon,
}) => {
  const getStatusColor = () => {
    switch (status) {
      case 'success':
        return 'green.400'
      case 'warning':
        return 'orange.400'
      case 'error':
        return 'red.400'
      default:
        return 'blue.400'
    }
  }
  const getIcon = () => {
    if (icon) return icon
    switch (status) {
      case 'success':
        return <CheckCircle size={18} />
      default:
        return <AlertTriangle size={18} />
    }
  }
  return (
    <Box
      bg="#152a47"
      borderRadius="md"
      p={4}
      borderLeft="4px solid"
      borderColor={getStatusColor()}
    >
      <Flex align="center" mb={2}>
        <Box color={getStatusColor()} mr={2}>
          {getIcon()}
        </Box>
        <Text fontWeight="medium" color="white">
          {title}
        </Text>
      </Flex>
      <Text fontSize="sm" color="whiteAlpha.700">
        {description}
      </Text>
    </Box>
  )
}

```
```components/widgets/InsightCard.tsx
import React from 'react'
import { Box, Flex, Text, Badge, Button, Icon, HStack } from '@chakra-ui/react'
interface InsightCardProps {
  title: string
  description: string
  metric?: string
  metricLabel?: string
  tags?: string[]
  actionLabel?: string
  icon?: React.ReactElement
  positive?: boolean
  onAction?: () => void
}
export const InsightCard: React.FC<InsightCardProps> = ({
  title,
  description,
  metric,
  metricLabel,
  tags = [],
  actionLabel,
  icon,
  positive = true,
  onAction,
}) => {
  return (
    <Box
      bg="#152a47"
      p={6}
      borderRadius="2xl"
      borderLeft="4px solid"
      borderColor={positive ? 'green.400' : 'orange.400'}
      transition="all 0.3s"
      _hover={{
        transform: 'translateY(-4px)',
        boxShadow: '0 8px 16px rgba(0, 0, 0, 0.3)',
      }}
    >
      <Flex justify="space-between" align="start" mb={4}>
        <Box flex={1}>
          <Text fontSize="lg" fontWeight="bold" color="white" mb={2}>
            {title}
          </Text>
          <Text fontSize="sm" color="whiteAlpha.700" lineHeight="tall">
            {description}
          </Text>
        </Box>
        {icon && (
          <Box
            p={2}
            borderRadius="lg"
            bg={positive ? 'green.400' : 'orange.400'}
            color="white"
            ml={4}
          >
            {icon}
          </Box>
        )}
      </Flex>
      {metric && (
        <Flex align="baseline" mb={4}>
          <Text
            fontSize="2xl"
            fontWeight="bold"
            color={positive ? 'green.400' : 'orange.400'}
          >
            {metric}
          </Text>
          {metricLabel && (
            <Text fontSize="sm" color="whiteAlpha.500" ml={2}>
              {metricLabel}
            </Text>
          )}
        </Flex>
      )}
      <HStack spacing={2} flexWrap="wrap" mb={actionLabel ? 4 : 0}>
        {tags.map((tag) => (
          <Badge
            key={tag}
            size="sm"
            colorScheme="blue"
            variant="subtle"
            px={2}
            py={1}
            borderRadius="full"
            fontSize="xs"
          >
            {tag}
          </Badge>
        ))}
      </HStack>
      {actionLabel && (
        <Button
          size="sm"
          colorScheme={positive ? 'green' : 'orange'}
          variant="outline"
          width="full"
          onClick={onAction}
          fontWeight="medium"
        >
          {actionLabel}
        </Button>
      )}
    </Box>
  )
}

```
```components/dashboard/Dashboard.tsx
import React, { useState } from 'react'
import {
  Box,
  Grid,
  GridItem,
  Heading,
  Text,
  Flex,
  Button,
  Icon,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
} from '@chakra-ui/react'
import { Layout } from '../layout/Layout'
import { StatCard } from '../widgets/StatCard'
import { InsightCard } from '../widgets/InsightCard'
import { AlertsSetupSection } from './AlertsSetupSection'
import { OperationalStatusWidget } from './OperationalStatusWidget'
import { QuickActionsWidget } from './QuickActionsWidget'
import { ActivityFeedWidget } from './ActivityFeedWidget'
import { SmartAlertsBar } from './SmartAlertsBar'
import { SalesTrendChart } from './charts/SalesTrendChart'
import { RevenueAreaChart } from './charts/RevenueAreaChart'
import { MetricsBarChart } from './charts/MetricsBarChart'
import { DistributionChart } from './charts/DistributionChart'
import {
  BarChart2,
  CheckCircle,
  Clock,
  Database,
  DollarSign,
  LineChart,
  Network,
  Users,
  ArrowUpRight,
  TrendingUp,
  Activity,
  LayoutDashboard,
} from 'lucide-react'
export const Dashboard = () => {
  const [isOpen, setIsOpen] = useState(true)
  const [alerts, setAlerts] = useState([
    {
      id: '1',
      title: 'Stock Crítico',
      severity: 'warning' as const,
      message: 'Material XYZ tiene solo 5 unidades disponibles',
      action: {
        label: 'Ordenar Ahora',
        onClick: () => console.log('Navigate to orders'),
      },
    },
  ])
  const handleDismissAlert = (id: string) => {
    setAlerts(alerts.filter((alert) => alert.id !== id))
  }
  return (
    <Layout>
      {/* Hero: Operational Status */}
      <Box mb={6}>
        <OperationalStatusWidget
          isOpen={isOpen}
          currentShift="Turno Mañana"
          activeStaff={6}
          totalStaff={9}
          openTime="09:00"
          closeTime="21:00"
          operatingHours={4.5}
          alerts={alerts.length}
          onToggleStatus={() => setIsOpen(!isOpen)}
        />
      </Box>
      {/* Smart Alerts Bar (only if alerts exist) */}
      <SmartAlertsBar alerts={alerts} onDismiss={handleDismissAlert} />
      {/* Setup Progress (collapsible) */}
      <AlertsSetupSection />
      {/* Main Tabs */}
      <Tabs colorScheme="blue" variant="soft-rounded">
        <TabList
          bg="#152a47"
          p={2}
          borderRadius="2xl"
          mb={6}
          overflowX="auto"
          css={{
            '&::-webkit-scrollbar': {
              height: '6px',
            },
            '&::-webkit-scrollbar-thumb': {
              background: 'rgba(255, 255, 255, 0.2)',
              borderRadius: '10px',
            },
          }}
        >
          <Tab
            fontWeight="semibold"
            _selected={{
              bg: 'blue.400',
              color: 'white',
            }}
          >
            <Icon as={LayoutDashboard} mr={2} boxSize={4} />
            Overview
          </Tab>
          <Tab
            fontWeight="semibold"
            _selected={{
              bg: 'blue.400',
              color: 'white',
            }}
          >
            <Icon as={TrendingUp} mr={2} boxSize={4} />
            Analytics
          </Tab>
          <Tab
            fontWeight="semibold"
            _selected={{
              bg: 'blue.400',
              color: 'white',
            }}
          >
            <Icon as={Activity} mr={2} boxSize={4} />
            Operaciones
          </Tab>
          <Tab
            fontWeight="semibold"
            _selected={{
              bg: 'blue.400',
              color: 'white',
            }}
          >
            <Icon as={Clock} mr={2} boxSize={4} />
            Actividad
          </Tab>
        </TabList>
        <TabPanels>
          {/* Tab 1: Overview */}
          <TabPanel p={0}>
            {/* Quick Actions */}
            <Box mb={8}>
              <QuickActionsWidget />
            </Box>
            {/* KPI Cards */}
            <Box mb={8}>
              <Text
                fontSize="sm"
                fontWeight="bold"
                color="whiteAlpha.600"
                mb={4}
                letterSpacing="wider"
              >
                MÉTRICAS PRINCIPALES
              </Text>
              <Grid templateColumns="repeat(12, 1fr)" gap={6}>
                <GridItem
                  colSpan={{
                    base: 12,
                    md: 6,
                    lg: 3,
                  }}
                >
                  <StatCard
                    title="Revenue Hoy"
                    value="$12,450"
                    icon={<Icon as={DollarSign} boxSize={5} />}
                    accentColor="green.400"
                    trend={{
                      value: '+12.5%',
                      isPositive: true,
                    }}
                    footer="vs ayer"
                  />
                </GridItem>
                <GridItem
                  colSpan={{
                    base: 12,
                    md: 6,
                    lg: 3,
                  }}
                >
                  <StatCard
                    title="Ventas Hoy"
                    value="47"
                    icon={<Icon as={LineChart} boxSize={5} />}
                    accentColor="blue.400"
                    trend={{
                      value: '+8.2%',
                      isPositive: true,
                    }}
                    footer="vs ayer"
                  />
                </GridItem>
                <GridItem
                  colSpan={{
                    base: 12,
                    md: 6,
                    lg: 3,
                  }}
                >
                  <StatCard
                    title="Staff Activo"
                    value="6/9"
                    icon={<Icon as={Users} boxSize={5} />}
                    accentColor="purple.400"
                    footer="Performance"
                    footerValue="94%"
                  />
                </GridItem>
                <GridItem
                  colSpan={{
                    base: 12,
                    md: 6,
                    lg: 3,
                  }}
                >
                  <StatCard
                    title="Órdenes Pendientes"
                    value="12"
                    icon={<Icon as={Database} boxSize={5} />}
                    accentColor="orange.400"
                    footer="En proceso"
                  />
                </GridItem>
              </Grid>
            </Box>
            {/* Charts Preview */}
            <Box mb={8}>
              <Text
                fontSize="sm"
                fontWeight="bold"
                color="whiteAlpha.600"
                mb={4}
                letterSpacing="wider"
              >
                TENDENCIAS
              </Text>
              <Grid templateColumns="repeat(12, 1fr)" gap={6}>
                <GridItem
                  colSpan={{
                    base: 12,
                    lg: 8,
                  }}
                >
                  <SalesTrendChart />
                </GridItem>
                <GridItem
                  colSpan={{
                    base: 12,
                    lg: 4,
                  }}
                >
                  <DistributionChart />
                </GridItem>
              </Grid>
            </Box>
            {/* Insights */}
            <Box>
              <Flex justify="space-between" align="center" mb={6}>
                <Flex align="center">
                  <Icon as={BarChart2} color="blue.400" boxSize={6} mr={3} />
                  <Heading size="md" color="white" fontWeight="bold">
                    Insights Inteligentes
                  </Heading>
                </Flex>
                <Button
                  colorScheme="purple"
                  size="sm"
                  rightIcon={<ArrowUpRight size={16} />}
                  fontWeight="medium"
                  px={6}
                >
                  Ver Todos
                </Button>
              </Flex>
              <Grid templateColumns="repeat(12, 1fr)" gap={6}>
                <GridItem
                  colSpan={{
                    base: 12,
                    md: 6,
                  }}
                >
                  <InsightCard
                    title="Clientes Premium generan 68% del Revenue"
                    description="Los clientes con membresías activas tienen 3.2x mayor valor promedio"
                    metric="+$180K"
                    metricLabel="potencial anual"
                    tags={['CRM', 'Memberships', 'Sales']}
                    actionLabel="Ver Detalles"
                    icon={<LineChart size={18} />}
                  />
                </GridItem>
                <GridItem
                  colSpan={{
                    base: 12,
                    md: 6,
                  }}
                >
                  <InsightCard
                    title="Stock bajo en 3 materiales críticos"
                    description="Se necesita reabastecimiento urgente para mantener producción"
                    metric="15 días"
                    metricLabel="hasta desabastecimiento"
                    tags={['Inventory', 'Production']}
                    actionLabel="Ordenar Ahora"
                    icon={<BarChart2 size={18} />}
                    positive={false}
                  />
                </GridItem>
              </Grid>
            </Box>
          </TabPanel>
          {/* Tab 2: Analytics */}
          <TabPanel p={0}>
            <Grid templateColumns="repeat(12, 1fr)" gap={6}>
              {/* Sales Trend */}
              <GridItem
                colSpan={{
                  base: 12,
                  lg: 8,
                }}
              >
                <SalesTrendChart />
              </GridItem>
              {/* Distribution */}
              <GridItem
                colSpan={{
                  base: 12,
                  lg: 4,
                }}
              >
                <DistributionChart />
              </GridItem>
              {/* Revenue Area */}
              <GridItem
                colSpan={{
                  base: 12,
                  lg: 7,
                }}
              >
                <RevenueAreaChart />
              </GridItem>
              {/* Metrics Bar */}
              <GridItem
                colSpan={{
                  base: 12,
                  lg: 5,
                }}
              >
                <MetricsBarChart />
              </GridItem>
            </Grid>
          </TabPanel>
          {/* Tab 3: Operations */}
          <TabPanel p={0}>
            <Grid templateColumns="repeat(12, 1fr)" gap={6}>
              <GridItem
                colSpan={{
                  base: 12,
                  md: 6,
                  lg: 4,
                }}
              >
                <StatCard
                  title="Módulos Integrados"
                  value="23"
                  subtitle="Sistema completo"
                  icon={<Icon as={CheckCircle} boxSize={5} />}
                  accentColor="green.400"
                />
              </GridItem>
              <GridItem
                colSpan={{
                  base: 12,
                  md: 6,
                  lg: 4,
                }}
              >
                <StatCard
                  title="Conexiones Activas"
                  value="18"
                  subtitle="En tiempo real"
                  icon={<Icon as={Network} boxSize={5} />}
                  accentColor="blue.400"
                />
              </GridItem>
              <GridItem
                colSpan={{
                  base: 12,
                  md: 6,
                  lg: 4,
                }}
              >
                <StatCard
                  title="Última Sincronización"
                  value="2 min ago"
                  subtitle="Todos los módulos"
                  icon={<Icon as={Clock} boxSize={5} />}
                  accentColor="blue.400"
                />
              </GridItem>
            </Grid>
          </TabPanel>
          {/* Tab 4: Activity */}
          <TabPanel p={0}>
            <ActivityFeedWidget />
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Layout>
  )
}

```
```index.css
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
@tailwind base;
@tailwind components;
@tailwind utilities;
body {
  margin: 0;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen,
    Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  background-color: #0a1929;
  color: white;
}
#root {
  width: 100%;
  height: 100vh;
}
```
```components/dashboard/AlertsSetupSection.tsx
import React, { useState } from 'react'
import {
  Box,
  Flex,
  Text,
  Icon,
  Progress,
  VStack,
  HStack,
  Badge,
  Button,
} from '@chakra-ui/react'
import {
  AlertTriangle,
  CheckCircle,
  Settings,
  Database,
  Users,
  CreditCard,
  Package,
  Bell,
  Shield,
  Zap,
  Circle,
  CheckCircle2,
} from 'lucide-react'
interface Achievement {
  id: string
  title: string
  description: string
  completed: boolean
  icon: React.ElementType
  category: string
}
export const AlertsSetupSection = () => {
  const [activeTab, setActiveTab] = useState<'alerts' | 'setup'>('alerts')
  const foundationalAchievements: Achievement[] = [
    {
      id: '1',
      title: 'Configuración de Base de Datos',
      description: 'Conectar y configurar la base de datos principal',
      completed: true,
      icon: Database,
      category: 'Infraestructura',
    },
    {
      id: '2',
      title: 'Gestión de Usuarios',
      description: 'Configurar roles y permisos del sistema',
      completed: true,
      icon: Users,
      category: 'Seguridad',
    },
    {
      id: '3',
      title: 'Integración de Pagos',
      description: 'Conectar pasarela de pagos (MercadoPago/Stripe)',
      completed: true,
      icon: CreditCard,
      category: 'Finanzas',
    },
    {
      id: '4',
      title: 'Catálogo de Productos',
      description: 'Cargar productos y configurar inventario inicial',
      completed: false,
      icon: Package,
      category: 'Inventario',
    },
    {
      id: '5',
      title: 'Sistema de Notificaciones',
      description: 'Configurar emails y notificaciones push',
      completed: false,
      icon: Bell,
      category: 'Comunicación',
    },
    {
      id: '6',
      title: 'Seguridad y Backups',
      description: 'Configurar backups automáticos y 2FA',
      completed: false,
      icon: Shield,
      category: 'Seguridad',
    },
  ]
  const completedCount = foundationalAchievements.filter(
    (a) => a.completed,
  ).length
  const totalCount = foundationalAchievements.length
  const progressPercentage = (completedCount / totalCount) * 100
  const alerts = [
    {
      id: '1',
      title: 'Sistema Operando Normalmente',
      description: 'Todos los módulos funcionando correctamente',
      type: 'success' as const,
      time: 'Hace 2 minutos',
    },
    {
      id: '2',
      title: 'Sincronización Completada',
      description: 'Datos sincronizados con todos los módulos',
      type: 'success' as const,
      time: 'Hace 5 minutos',
    },
  ]
  return (
    <Box
      bg="#152a47"
      borderRadius="2xl"
      overflow="hidden"
      mb={8}
      boxShadow="0 4px 6px -1px rgba(0, 0, 0, 0.3), 0 2px 4px -1px rgba(0, 0, 0, 0.2)"
      transition="all 0.3s"
      _hover={{
        boxShadow:
          '0 8px 16px -4px rgba(0, 0, 0, 0.4), 0 4px 8px -2px rgba(0, 0, 0, 0.3)',
      }}
    >
      {/* Integrated Tabs Header */}
      <Flex bg="#0d1f35" borderBottom="1px solid" borderColor="whiteAlpha.100">
        <Box
          flex={1}
          py={4}
          px={6}
          cursor="pointer"
          bg={activeTab === 'alerts' ? '#152a47' : 'transparent'}
          borderBottom={
            activeTab === 'alerts' ? '3px solid' : '3px solid transparent'
          }
          borderColor="orange.400"
          onClick={() => setActiveTab('alerts')}
          transition="all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)"
          position="relative"
          _hover={{
            bg: activeTab === 'alerts' ? '#152a47' : 'whiteAlpha.50',
            transform: activeTab === 'alerts' ? 'none' : 'translateY(-2px)',
          }}
        >
          <Flex align="center" justify="center">
            <Icon
              as={AlertTriangle}
              color={activeTab === 'alerts' ? 'orange.400' : 'whiteAlpha.500'}
              mr={2}
              boxSize={5}
              transition="all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)"
              transform={activeTab === 'alerts' ? 'rotate(0deg)' : 'none'}
              _groupHover={{
                transform: 'rotate(10deg)',
              }}
            />
            <Text
              fontWeight="semibold"
              fontSize="md"
              color={activeTab === 'alerts' ? 'white' : 'whiteAlpha.600'}
              transition="all 0.2s"
            >
              Alertas Operacionales
            </Text>
            <Badge
              ml={3}
              colorScheme="green"
              variant="solid"
              borderRadius="full"
              px={2}
              bgGradient="linear(to-r, green.400, green.500)"
              boxShadow="0 2px 4px rgba(72, 187, 120, 0.3)"
            >
              {alerts.length}
            </Badge>
          </Flex>
        </Box>
        <Box
          flex={1}
          py={4}
          px={6}
          cursor="pointer"
          bg={activeTab === 'setup' ? '#152a47' : 'transparent'}
          borderBottom={
            activeTab === 'setup' ? '3px solid' : '3px solid transparent'
          }
          borderColor="blue.400"
          onClick={() => setActiveTab('setup')}
          transition="all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)"
          position="relative"
          _hover={{
            bg: activeTab === 'setup' ? '#152a47' : 'whiteAlpha.50',
            transform: activeTab === 'setup' ? 'none' : 'translateY(-2px)',
          }}
        >
          <Flex align="center" justify="center">
            <Icon
              as={Settings}
              color={activeTab === 'setup' ? 'blue.400' : 'whiteAlpha.500'}
              mr={2}
              boxSize={5}
              transition="all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)"
              _groupHover={{
                transform: 'rotate(90deg)',
              }}
            />
            <Text
              fontWeight="semibold"
              fontSize="md"
              color={activeTab === 'setup' ? 'white' : 'whiteAlpha.600'}
              transition="all 0.2s"
            >
              Setup Fundacional
            </Text>
            <Badge
              ml={3}
              colorScheme={progressPercentage === 100 ? 'green' : 'blue'}
              variant="solid"
              borderRadius="full"
              px={2}
              bgGradient={
                progressPercentage === 100
                  ? 'linear(to-r, green.400, green.500)'
                  : 'linear(to-r, blue.400, blue.500)'
              }
              boxShadow={
                progressPercentage === 100
                  ? '0 2px 4px rgba(72, 187, 120, 0.3)'
                  : '0 2px 4px rgba(66, 153, 225, 0.3)'
              }
            >
              {completedCount}/{totalCount}
            </Badge>
          </Flex>
        </Box>
      </Flex>
      {/* Content Area */}
      <Box p={8}>
        {activeTab === 'alerts' ? (
          <VStack spacing={6} align="stretch">
            <Box>
              <Text
                fontSize="sm"
                color="whiteAlpha.600"
                mb={5}
                fontWeight="medium"
              >
                Información urgente y notificaciones del sistema
              </Text>
              {alerts.length === 0 ? (
                <Box
                  bg="#0a1929"
                  p={8}
                  borderRadius="2xl"
                  textAlign="center"
                  border="1px solid"
                  borderColor="whiteAlpha.100"
                >
                  <Flex align="center" justify="center" mb={3}>
                    <Icon
                      as={CheckCircle}
                      color="green.400"
                      boxSize={7}
                      mr={2}
                    />
                    <Text fontSize="xl" fontWeight="semibold" color="white">
                      Todo en orden
                    </Text>
                  </Flex>
                  <Text fontSize="sm" color="whiteAlpha.600">
                    No hay alertas críticas en este momento
                  </Text>
                </Box>
              ) : (
                <VStack spacing={4} align="stretch">
                  {alerts.map((alert) => (
                    <Box
                      key={alert.id}
                      bg="#0a1929"
                      p={5}
                      borderRadius="2xl"
                      borderLeft="4px solid"
                      borderColor={
                        alert.type === 'success' ? 'green.400' : 'orange.400'
                      }
                      transition="all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)"
                      _hover={{
                        bg: '#0d1f35',
                        transform: 'translateX(8px) scale(1.01)',
                        boxShadow:
                          alert.type === 'success'
                            ? '0 4px 8px rgba(72, 187, 120, 0.2)'
                            : '0 4px 8px rgba(237, 137, 54, 0.2)',
                      }}
                    >
                      <Flex justify="space-between" align="start">
                        <Flex align="start" flex={1}>
                          <Icon
                            as={
                              alert.type === 'success'
                                ? CheckCircle
                                : AlertTriangle
                            }
                            color={
                              alert.type === 'success'
                                ? 'green.400'
                                : 'orange.400'
                            }
                            mt={0.5}
                            mr={4}
                            boxSize={5}
                          />
                          <Box flex={1}>
                            <Text
                              fontWeight="semibold"
                              color="white"
                              mb={2}
                              fontSize="md"
                            >
                              {alert.title}
                            </Text>
                            <Text
                              fontSize="sm"
                              color="whiteAlpha.700"
                              lineHeight="tall"
                            >
                              {alert.description}
                            </Text>
                          </Box>
                        </Flex>
                        <Text
                          fontSize="xs"
                          color="whiteAlpha.500"
                          whiteSpace="nowrap"
                          ml={6}
                          fontWeight="medium"
                        >
                          {alert.time}
                        </Text>
                      </Flex>
                    </Box>
                  ))}
                </VStack>
              )}
            </Box>
            <Box pt={6} borderTop="1px solid" borderColor="whiteAlpha.100">
              <Text
                fontSize="xs"
                fontWeight="bold"
                color="whiteAlpha.500"
                mb={4}
                letterSpacing="wider"
              >
                ACCIONES RÁPIDAS
              </Text>
              <Flex gap={3} flexWrap="wrap">
                <Button
                  size="sm"
                  colorScheme="orange"
                  variant="outline"
                  fontWeight="medium"
                  borderRadius="full"
                  transition="all 0.2s"
                  _hover={{
                    transform: 'translateY(-2px)',
                    boxShadow: '0 4px 8px rgba(237, 137, 54, 0.3)',
                  }}
                >
                  Importante
                </Button>
                <Button
                  size="sm"
                  colorScheme="blue"
                  variant="outline"
                  fontWeight="medium"
                  borderRadius="full"
                  transition="all 0.2s"
                  _hover={{
                    transform: 'translateY(-2px)',
                    boxShadow: '0 4px 8px rgba(66, 153, 225, 0.3)',
                  }}
                >
                  Actualizaciones
                </Button>
                <Button
                  size="sm"
                  colorScheme="purple"
                  variant="outline"
                  fontWeight="medium"
                  borderRadius="full"
                  transition="all 0.2s"
                  _hover={{
                    transform: 'translateY(-2px)',
                    boxShadow: '0 4px 8px rgba(159, 122, 234, 0.3)',
                  }}
                >
                  Staff
                </Button>
                <Button
                  size="sm"
                  colorScheme="green"
                  variant="outline"
                  fontWeight="medium"
                  borderRadius="full"
                  transition="all 0.2s"
                  _hover={{
                    transform: 'translateY(-2px)',
                    boxShadow: '0 4px 8px rgba(72, 187, 120, 0.3)',
                  }}
                >
                  Ver Todas
                </Button>
              </Flex>
            </Box>
          </VStack>
        ) : (
          <VStack spacing={8} align="stretch">
            {/* Progress Overview */}
            <Box>
              <Flex justify="space-between" align="flex-start" mb={4}>
                <Box flex={1} mr={6}>
                  <Text fontSize="xl" fontWeight="bold" color="white" mb={2}>
                    Progreso de Configuración
                  </Text>
                  <Text fontSize="sm" color="whiteAlpha.600" lineHeight="tall">
                    Completa estos logros fundacionales para activar todas las
                    funcionalidades del sistema
                  </Text>
                </Box>
                <Box textAlign="right" minW="100px">
                  <Text
                    fontSize="4xl"
                    fontWeight="bold"
                    bgGradient="linear(to-r, blue.400, blue.500)"
                    bgClip="text"
                    lineHeight="1"
                  >
                    {Math.round(progressPercentage)}%
                  </Text>
                  <Text
                    fontSize="xs"
                    color="whiteAlpha.500"
                    mt={1}
                    fontWeight="medium"
                  >
                    COMPLETADO
                  </Text>
                </Box>
              </Flex>
              <Progress
                value={progressPercentage}
                colorScheme="blue"
                borderRadius="full"
                height="12px"
                bg="#0a1929"
                sx={{
                  '& > div': {
                    transition: 'all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)',
                    bgGradient: 'linear(to-r, blue.400, blue.500)',
                    boxShadow: '0 0 10px rgba(66, 153, 225, 0.5)',
                  },
                }}
              />
            </Box>
            {/* Achievement List */}
            <VStack spacing={4} align="stretch">
              {foundationalAchievements.map((achievement) => (
                <Box
                  key={achievement.id}
                  bg="#0a1929"
                  p={5}
                  borderRadius="2xl"
                  borderLeft="4px solid"
                  borderColor={
                    achievement.completed ? 'green.400' : 'whiteAlpha.200'
                  }
                  opacity={achievement.completed ? 1 : 0.95}
                  transition="all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)"
                  cursor="pointer"
                  _hover={{
                    bg: '#0d1f35',
                    transform: 'translateX(8px) scale(1.01)',
                    boxShadow: achievement.completed
                      ? '0 4px 8px rgba(72, 187, 120, 0.2)'
                      : '0 4px 8px rgba(66, 153, 225, 0.2)',
                    borderColor: achievement.completed
                      ? 'green.400'
                      : 'blue.400',
                  }}
                >
                  <Flex justify="space-between" align="center">
                    <Flex align="center" flex={1}>
                      <Box
                        p={3}
                        borderRadius="xl"
                        bg={
                          achievement.completed ? 'green.400' : 'whiteAlpha.100'
                        }
                        mr={4}
                        transition="all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)"
                        _groupHover={{
                          transform: 'rotate(10deg) scale(1.1)',
                        }}
                        boxShadow={
                          achievement.completed
                            ? '0 4px 8px rgba(72, 187, 120, 0.4)'
                            : 'none'
                        }
                      >
                        <Icon
                          as={achievement.icon}
                          color={
                            achievement.completed ? 'white' : 'whiteAlpha.600'
                          }
                          boxSize={6}
                        />
                      </Box>
                      <Box flex={1}>
                        <Flex align="center" mb={2}>
                          <Text
                            fontWeight="semibold"
                            color="white"
                            mr={3}
                            fontSize="md"
                          >
                            {achievement.title}
                          </Text>
                          <Badge
                            size="sm"
                            colorScheme={
                              achievement.completed ? 'green' : 'gray'
                            }
                            variant="subtle"
                            px={2}
                            fontWeight="medium"
                            borderRadius="full"
                          >
                            {achievement.category}
                          </Badge>
                        </Flex>
                        <Text
                          fontSize="sm"
                          color="whiteAlpha.600"
                          lineHeight="tall"
                        >
                          {achievement.description}
                        </Text>
                      </Box>
                    </Flex>
                    <Flex align="center" ml={6}>
                      {achievement.completed ? (
                        <Icon as={CheckCircle2} color="green.400" boxSize={7} />
                      ) : (
                        <Button
                          size="sm"
                          colorScheme="blue"
                          variant="solid"
                          fontWeight="medium"
                          px={6}
                          borderRadius="full"
                          bgGradient="linear(to-r, blue.400, blue.500)"
                          _hover={{
                            bgGradient: 'linear(to-r, blue.500, blue.600)',
                            transform: 'translateY(-2px)',
                            boxShadow: '0 4px 8px rgba(66, 153, 225, 0.4)',
                          }}
                          transition="all 0.2s"
                        >
                          Configurar
                        </Button>
                      )}
                    </Flex>
                  </Flex>
                </Box>
              ))}
            </VStack>
            {/* Action Button */}
            {progressPercentage < 100 && (
              <Button
                colorScheme="blue"
                size="lg"
                width="full"
                rightIcon={<Zap size={20} />}
                py={6}
                fontSize="md"
                fontWeight="semibold"
                borderRadius="2xl"
                bgGradient="linear(to-r, blue.400, blue.500)"
                _hover={{
                  bgGradient: 'linear(to-r, blue.500, blue.600)',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 8px 16px rgba(66, 153, 225, 0.4)',
                }}
                transition="all 0.2s"
              >
                Continuar Configuración
              </Button>
            )}
            {progressPercentage === 100 && (
              <Box
                bg="#0a1929"
                p={8}
                borderRadius="2xl"
                textAlign="center"
                borderLeft="4px solid"
                borderColor="green.400"
                border="1px solid"
                borderLeftWidth="4px"
                boxShadow="0 0 20px rgba(72, 187, 120, 0.2)"
              >
                <Flex align="center" justify="center" mb={3}>
                  <Icon
                    as={CheckCircle}
                    color="green.400"
                    boxSize={10}
                    mr={3}
                  />
                  <Text fontSize="2xl" fontWeight="bold" color="white">
                    ¡Setup Completado! 🎉
                  </Text>
                </Flex>
                <Text
                  fontSize="md"
                  color="whiteAlpha.600"
                  mb={6}
                  lineHeight="tall"
                >
                  Has completado todos los logros fundacionales. Tu sistema está
                  listo para operar.
                </Text>
                <Button
                  colorScheme="green"
                  size="md"
                  fontWeight="medium"
                  px={8}
                  borderRadius="full"
                  bgGradient="linear(to-r, green.400, green.500)"
                  _hover={{
                    bgGradient: 'linear(to-r, green.500, green.600)',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 4px 8px rgba(72, 187, 120, 0.4)',
                  }}
                  transition="all 0.2s"
                >
                  Ver Logros Avanzados
                </Button>
              </Box>
            )}
          </VStack>
        )}
      </Box>
    </Box>
  )
}

```
```components/dashboard/OperationalStatusWidget.tsx
import React from 'react'
import {
  Box,
  Flex,
  Text,
  Icon,
  Badge,
  HStack,
  VStack,
  Button,
  Progress,
} from '@chakra-ui/react'
import {
  Clock,
  Users,
  AlertCircle,
  CheckCircle,
  Power,
  Calendar,
} from 'lucide-react'
interface OperationalStatusWidgetProps {
  isOpen: boolean
  currentShift?: string
  activeStaff?: number
  totalStaff?: number
  openTime?: string
  closeTime?: string
  operatingHours?: number
  alerts?: number
  onToggleStatus?: () => void
}
export const OperationalStatusWidget: React.FC<
  OperationalStatusWidgetProps
> = ({
  isOpen = true,
  currentShift = 'Turno Mañana',
  activeStaff = 6,
  totalStaff = 9,
  openTime = '09:00',
  closeTime = '21:00',
  operatingHours = 4.5,
  alerts = 0,
  onToggleStatus,
}) => {
  const staffPercentage = (activeStaff / totalStaff) * 100
  return (
    <Box
      bg="linear-gradient(135deg, #1a365d 0%, #2d3748 100%)"
      borderRadius="3xl"
      p={8}
      position="relative"
      overflow="hidden"
      boxShadow="0 10px 30px rgba(0, 0, 0, 0.4)"
      border="1px solid"
      borderColor={isOpen ? 'green.400' : 'red.400'}
    >
      {/* Background Pattern */}
      <Box
        position="absolute"
        top="-50%"
        right="-20%"
        width="300px"
        height="300px"
        borderRadius="full"
        bg={isOpen ? 'green.400' : 'red.400'}
        opacity={0.05}
        filter="blur(60px)"
      />
      <Flex justify="space-between" align="start" mb={6}>
        {/* Status Badge */}
        <VStack align="start" spacing={3} flex={1}>
          <HStack spacing={3}>
            <Icon
              as={isOpen ? CheckCircle : AlertCircle}
              boxSize={8}
              color={isOpen ? 'green.400' : 'red.400'}
            />
            <Box>
              <Text fontSize="2xl" fontWeight="bold" color="white">
                {isOpen ? 'Operativo' : 'Cerrado'}
              </Text>
              <Text fontSize="sm" color="whiteAlpha.600">
                {currentShift}
              </Text>
            </Box>
          </HStack>
          <Badge
            colorScheme={isOpen ? 'green' : 'red'}
            fontSize="md"
            px={4}
            py={2}
            borderRadius="full"
            fontWeight="bold"
          >
            {isOpen ? '● EN VIVO' : '● FUERA DE LÍNEA'}
          </Badge>
        </VStack>
        {/* Toggle Button */}
        {onToggleStatus && (
          <Button
            leftIcon={<Power size={18} />}
            colorScheme={isOpen ? 'red' : 'green'}
            size="lg"
            onClick={onToggleStatus}
            fontWeight="bold"
            px={8}
            borderRadius="full"
          >
            {isOpen ? 'Cerrar' : 'Abrir'}
          </Button>
        )}
      </Flex>
      {/* Stats Grid */}
      <Box
        bg="whiteAlpha.100"
        borderRadius="2xl"
        p={6}
        backdropFilter="blur(10px)"
      >
        <Flex gap={6} flexWrap="wrap">
          {/* Operating Hours */}
          <Box flex={1} minW="200px">
            <HStack spacing={3} mb={3}>
              <Icon as={Clock} color="blue.400" boxSize={5} />
              <Text fontSize="sm" color="whiteAlpha.600" fontWeight="medium">
                Horas de Operación Hoy
              </Text>
            </HStack>
            <Text fontSize="3xl" fontWeight="bold" color="white">
              {operatingHours}h
            </Text>
            <Text fontSize="xs" color="whiteAlpha.500" mt={1}>
              {openTime} - {closeTime}
            </Text>
          </Box>
          {/* Active Staff */}
          <Box flex={1} minW="200px">
            <HStack spacing={3} mb={3}>
              <Icon as={Users} color="purple.400" boxSize={5} />
              <Text fontSize="sm" color="whiteAlpha.600" fontWeight="medium">
                Staff Activo
              </Text>
            </HStack>
            <Text fontSize="3xl" fontWeight="bold" color="white">
              {activeStaff}/{totalStaff}
            </Text>
            <Progress
              value={staffPercentage}
              colorScheme="purple"
              size="sm"
              borderRadius="full"
              mt={2}
            />
          </Box>
          {/* Alerts */}
          <Box flex={1} minW="200px">
            <HStack spacing={3} mb={3}>
              <Icon
                as={AlertCircle}
                color={alerts > 0 ? 'orange.400' : 'green.400'}
                boxSize={5}
              />
              <Text fontSize="sm" color="whiteAlpha.600" fontWeight="medium">
                Alertas Activas
              </Text>
            </HStack>
            <Text
              fontSize="3xl"
              fontWeight="bold"
              color={alerts > 0 ? 'orange.400' : 'green.400'}
            >
              {alerts}
            </Text>
            <Text fontSize="xs" color="whiteAlpha.500" mt={1}>
              {alerts === 0 ? 'Todo en orden' : 'Requiere atención'}
            </Text>
          </Box>
        </Flex>
      </Box>
      {/* Quick Info */}
      <HStack spacing={4} mt={6}>
        <HStack spacing={2}>
          <Icon as={Calendar} color="whiteAlpha.600" boxSize={4} />
          <Text fontSize="xs" color="whiteAlpha.600">
            Última actualización: Hace 2 min
          </Text>
        </HStack>
      </HStack>
    </Box>
  )
}

```
```components/dashboard/QuickActionsWidget.tsx
import React from 'react'
import { Box, SimpleGrid, Button, Icon, Text, VStack } from '@chakra-ui/react'
import {
  ShoppingCart,
  Package,
  Users,
  FileText,
  Calendar,
  Truck,
  DollarSign,
  Settings,
} from 'lucide-react'
interface QuickAction {
  id: string
  label: string
  icon: React.ElementType
  color: string
  path: string
  requiredPermission?: string
}
const defaultActions: QuickAction[] = [
  {
    id: 'new-sale',
    label: 'Nueva Venta',
    icon: ShoppingCart,
    color: 'green',
    path: '/admin/operations/sales',
  },
  {
    id: 'new-order',
    label: 'Nueva Orden',
    icon: FileText,
    color: 'blue',
    path: '/admin/supply-chain/production',
  },
  {
    id: 'new-customer',
    label: 'Nuevo Cliente',
    icon: Users,
    color: 'purple',
    path: '/admin/customer/customers',
  },
  {
    id: 'new-product',
    label: 'Nuevo Producto',
    icon: Package,
    color: 'orange',
    path: '/admin/supply-chain/products',
  },
  {
    id: 'schedule',
    label: 'Programar',
    icon: Calendar,
    color: 'pink',
    path: '/admin/resources/scheduling',
  },
  {
    id: 'delivery',
    label: 'Envío',
    icon: Truck,
    color: 'cyan',
    path: '/admin/operations/delivery',
  },
  {
    id: 'invoice',
    label: 'Factura',
    icon: DollarSign,
    color: 'teal',
    path: '/admin/finance/billing',
  },
  {
    id: 'settings',
    label: 'Configurar',
    icon: Settings,
    color: 'gray',
    path: '/admin/core/settings',
  },
]
interface QuickActionsWidgetProps {
  actions?: QuickAction[]
  onActionClick?: (action: QuickAction) => void
}
export const QuickActionsWidget: React.FC<QuickActionsWidgetProps> = ({
  actions = defaultActions,
  onActionClick,
}) => {
  const handleClick = (action: QuickAction) => {
    if (onActionClick) {
      onActionClick(action)
    } else {
      window.location.href = action.path
    }
  }
  return (
    <Box>
      <Text
        fontSize="sm"
        fontWeight="bold"
        color="whiteAlpha.600"
        mb={4}
        letterSpacing="wider"
      >
        ACCIONES RÁPIDAS
      </Text>
      <SimpleGrid
        columns={{
          base: 2,
          md: 4,
          lg: 4,
        }}
        spacing={4}
      >
        {actions.map((action) => (
          <Button
            key={action.id}
            onClick={() => handleClick(action)}
            colorScheme={action.color}
            variant="solid"
            height="auto"
            py={6}
            px={4}
            borderRadius="xl"
            transition="all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)"
            _hover={{
              transform: 'translateY(-4px) scale(1.05)',
              boxShadow: `0 8px 20px rgba(0, 0, 0, 0.4)`,
            }}
            _active={{
              transform: 'translateY(-2px) scale(1.02)',
            }}
          >
            <VStack spacing={3}>
              <Icon as={action.icon} boxSize={8} />
              <Text fontSize="sm" fontWeight="semibold">
                {action.label}
              </Text>
            </VStack>
          </Button>
        ))}
      </SimpleGrid>
    </Box>
  )
}

```
```components/dashboard/ActivityFeedWidget.tsx
import React from 'react'
import {
  Box,
  VStack,
  HStack,
  Text,
  Avatar,
  Icon,
  Badge,
} from '@chakra-ui/react'
import {
  ShoppingCart,
  Package,
  Users,
  FileText,
  AlertTriangle,
  CheckCircle,
} from 'lucide-react'
interface Activity {
  id: string
  type: 'sale' | 'order' | 'customer' | 'alert' | 'success'
  title: string
  description: string
  user?: string
  timestamp: string
  icon?: React.ElementType
  color?: string
}
const defaultActivities: Activity[] = [
  {
    id: '1',
    type: 'sale',
    title: 'Nueva venta completada',
    description: 'Venta #1234 por $450.00',
    user: 'Juan Pérez',
    timestamp: 'Hace 2 minutos',
    icon: ShoppingCart,
    color: 'green.400',
  },
  {
    id: '2',
    type: 'order',
    title: 'Orden de producción creada',
    description: 'Orden #567 - 50 unidades',
    user: 'María García',
    timestamp: 'Hace 15 minutos',
    icon: Package,
    color: 'blue.400',
  },
  {
    id: '3',
    type: 'customer',
    title: 'Nuevo cliente registrado',
    description: 'Carlos Rodríguez - Premium',
    user: 'Sistema',
    timestamp: 'Hace 30 minutos',
    icon: Users,
    color: 'purple.400',
  },
  {
    id: '4',
    type: 'alert',
    title: 'Stock bajo en Material XYZ',
    description: 'Solo quedan 5 unidades',
    user: 'Sistema',
    timestamp: 'Hace 1 hora',
    icon: AlertTriangle,
    color: 'orange.400',
  },
  {
    id: '5',
    type: 'success',
    title: 'Sincronización completada',
    description: 'Todos los módulos actualizados',
    user: 'Sistema',
    timestamp: 'Hace 2 horas',
    icon: CheckCircle,
    color: 'green.400',
  },
]
interface ActivityFeedWidgetProps {
  activities?: Activity[]
  maxItems?: number
}
export const ActivityFeedWidget: React.FC<ActivityFeedWidgetProps> = ({
  activities = defaultActivities,
  maxItems = 10,
}) => {
  const displayedActivities = activities.slice(0, maxItems)
  return (
    <Box
      bg="#152a47"
      borderRadius="2xl"
      p={6}
      height="100%"
      maxH="600px"
      overflowY="auto"
      css={{
        '&::-webkit-scrollbar': {
          width: '8px',
        },
        '&::-webkit-scrollbar-track': {
          background: 'rgba(255, 255, 255, 0.05)',
          borderRadius: '10px',
        },
        '&::-webkit-scrollbar-thumb': {
          background: 'rgba(255, 255, 255, 0.2)',
          borderRadius: '10px',
        },
      }}
    >
      <Text fontSize="lg" fontWeight="bold" color="white" mb={6}>
        Actividad Reciente
      </Text>
      <VStack spacing={4} align="stretch">
        {displayedActivities.map((activity) => (
          <Box
            key={activity.id}
            p={4}
            bg="#0a1929"
            borderRadius="xl"
            borderLeft="3px solid"
            borderColor={activity.color}
            transition="all 0.2s"
            _hover={{
              bg: '#0d1f35',
              transform: 'translateX(4px)',
            }}
          >
            <HStack spacing={4} align="start">
              {/* Icon */}
              <Box
                p={2}
                borderRadius="lg"
                bg="whiteAlpha.100"
                color={activity.color}
                flexShrink={0}
              >
                <Icon as={activity.icon} boxSize={5} />
              </Box>
              {/* Content */}
              <Box flex={1}>
                <Text fontSize="sm" fontWeight="semibold" color="white" mb={1}>
                  {activity.title}
                </Text>
                <Text fontSize="xs" color="whiteAlpha.600" mb={2}>
                  {activity.description}
                </Text>
                <HStack spacing={3}>
                  {activity.user && (
                    <HStack spacing={2}>
                      <Avatar size="xs" name={activity.user} />
                      <Text fontSize="xs" color="whiteAlpha.500">
                        {activity.user}
                      </Text>
                    </HStack>
                  )}
                  <Text fontSize="xs" color="whiteAlpha.400">
                    {activity.timestamp}
                  </Text>
                </HStack>
              </Box>
              {/* Type Badge */}
              <Badge
                size="sm"
                colorScheme={
                  activity.type === 'sale'
                    ? 'green'
                    : activity.type === 'alert'
                      ? 'orange'
                      : 'blue'
                }
                variant="subtle"
                flexShrink={0}
              >
                {activity.type}
              </Badge>
            </HStack>
          </Box>
        ))}
      </VStack>
    </Box>
  )
}

```
```components/dashboard/charts/SalesTrendChart.tsx
import React from 'react'
import { Box, Text, Flex, Badge } from '@chakra-ui/react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'
interface SalesTrendChartProps {
  data?: Array<{
    date: string
    ventas: number
    ordenes: number
  }>
}
const defaultData = [
  {
    date: 'Lun',
    ventas: 45,
    ordenes: 32,
  },
  {
    date: 'Mar',
    ventas: 52,
    ordenes: 38,
  },
  {
    date: 'Mié',
    ventas: 48,
    ordenes: 35,
  },
  {
    date: 'Jue',
    ventas: 61,
    ordenes: 42,
  },
  {
    date: 'Vie',
    ventas: 55,
    ordenes: 40,
  },
  {
    date: 'Sáb',
    ventas: 67,
    ordenes: 48,
  },
  {
    date: 'Dom',
    ventas: 43,
    ordenes: 30,
  },
]
export const SalesTrendChart: React.FC<SalesTrendChartProps> = ({
  data = defaultData,
}) => {
  return (
    <Box bg="#152a47" p={6} borderRadius="2xl" height="100%">
      <Flex justify="space-between" align="center" mb={6}>
        <Box>
          <Text fontSize="lg" fontWeight="bold" color="white" mb={1}>
            Tendencia de Ventas
          </Text>
          <Text fontSize="sm" color="whiteAlpha.600">
            Últimos 7 días
          </Text>
        </Box>
        <Flex gap={3}>
          <Badge colorScheme="green" px={3} py={1} borderRadius="full">
            Ventas
          </Badge>
          <Badge colorScheme="blue" px={3} py={1} borderRadius="full">
            Órdenes
          </Badge>
        </Flex>
      </Flex>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
          <XAxis
            dataKey="date"
            stroke="rgba(255,255,255,0.5)"
            style={{
              fontSize: '12px',
            }}
          />
          <YAxis
            stroke="rgba(255,255,255,0.5)"
            style={{
              fontSize: '12px',
            }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#0a1929',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '8px',
              color: 'white',
            }}
          />
          <Legend
            wrapperStyle={{
              paddingTop: '20px',
              color: 'white',
            }}
          />
          <Line
            type="monotone"
            dataKey="ventas"
            stroke="#48bb78"
            strokeWidth={3}
            dot={{
              fill: '#48bb78',
              r: 5,
            }}
            activeDot={{
              r: 7,
            }}
          />
          <Line
            type="monotone"
            dataKey="ordenes"
            stroke="#4299e1"
            strokeWidth={3}
            dot={{
              fill: '#4299e1',
              r: 5,
            }}
            activeDot={{
              r: 7,
            }}
          />
        </LineChart>
      </ResponsiveContainer>
    </Box>
  )
}

```
```components/dashboard/charts/RevenueAreaChart.tsx
import React from 'react'
import { Box, Text, Flex, Icon } from '@chakra-ui/react'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { TrendingUp } from 'lucide-react'
interface RevenueAreaChartProps {
  data?: Array<{
    date: string
    revenue: number
  }>
}
const defaultData = [
  {
    date: 'Ene',
    revenue: 12400,
  },
  {
    date: 'Feb',
    revenue: 14800,
  },
  {
    date: 'Mar',
    revenue: 13200,
  },
  {
    date: 'Abr',
    revenue: 16500,
  },
  {
    date: 'May',
    revenue: 18900,
  },
  {
    date: 'Jun',
    revenue: 21300,
  },
  {
    date: 'Jul',
    revenue: 19800,
  },
  {
    date: 'Ago',
    revenue: 23400,
  },
  {
    date: 'Sep',
    revenue: 25100,
  },
  {
    date: 'Oct',
    revenue: 27800,
  },
  {
    date: 'Nov',
    revenue: 26500,
  },
  {
    date: 'Dic',
    revenue: 31200,
  },
]
export const RevenueAreaChart: React.FC<RevenueAreaChartProps> = ({
  data = defaultData,
}) => {
  return (
    <Box bg="#152a47" p={6} borderRadius="2xl" height="100%">
      <Flex justify="space-between" align="center" mb={6}>
        <Box>
          <Text fontSize="lg" fontWeight="bold" color="white" mb={1}>
            Revenue Acumulado
          </Text>
          <Text fontSize="sm" color="whiteAlpha.600">
            Últimos 12 meses
          </Text>
        </Box>
        <Flex align="center" gap={2}>
          <Icon as={TrendingUp} color="green.400" boxSize={5} />
          <Text fontSize="sm" fontWeight="semibold" color="green.400">
            +24.5%
          </Text>
        </Flex>
      </Flex>
      <ResponsiveContainer width="100%" height={300}>
        <AreaChart data={data}>
          <defs>
            <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#48bb78" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#48bb78" stopOpacity={0.1} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
          <XAxis
            dataKey="date"
            stroke="rgba(255,255,255,0.5)"
            style={{
              fontSize: '12px',
            }}
          />
          <YAxis
            stroke="rgba(255,255,255,0.5)"
            style={{
              fontSize: '12px',
            }}
            tickFormatter={(value) => `$${value / 1000}K`}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#0a1929',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '8px',
              color: 'white',
            }}
            formatter={(value: number) => [
              `$${value.toLocaleString()}`,
              'Revenue',
            ]}
          />
          <Area
            type="monotone"
            dataKey="revenue"
            stroke="#48bb78"
            strokeWidth={3}
            fillOpacity={1}
            fill="url(#colorRevenue)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </Box>
  )
}

```
```components/dashboard/charts/MetricsBarChart.tsx
import React from 'react'
import { Box, Text, Flex, SimpleGrid } from '@chakra-ui/react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'
interface MetricsBarChartProps {
  data?: Array<{
    category: string
    actual: number
    objetivo: number
  }>
}
const defaultData = [
  {
    category: 'Ventas',
    actual: 85,
    objetivo: 100,
  },
  {
    category: 'Clientes',
    actual: 92,
    objetivo: 100,
  },
  {
    category: 'Órdenes',
    actual: 78,
    objetivo: 100,
  },
  {
    category: 'Revenue',
    actual: 88,
    objetivo: 100,
  },
  {
    category: 'Satisfacción',
    actual: 95,
    objetivo: 100,
  },
]
export const MetricsBarChart: React.FC<MetricsBarChartProps> = ({
  data = defaultData,
}) => {
  return (
    <Box bg="#152a47" p={6} borderRadius="2xl" height="100%">
      <Flex justify="space-between" align="center" mb={6}>
        <Box>
          <Text fontSize="lg" fontWeight="bold" color="white" mb={1}>
            Performance vs Objetivos
          </Text>
          <Text fontSize="sm" color="whiteAlpha.600">
            Métricas del mes actual
          </Text>
        </Box>
      </Flex>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
          <XAxis
            dataKey="category"
            stroke="rgba(255,255,255,0.5)"
            style={{
              fontSize: '12px',
            }}
          />
          <YAxis
            stroke="rgba(255,255,255,0.5)"
            style={{
              fontSize: '12px',
            }}
            domain={[0, 100]}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#0a1929',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '8px',
              color: 'white',
            }}
            formatter={(value: number) => [`${value}%`, '']}
          />
          <Legend
            wrapperStyle={{
              paddingTop: '20px',
              color: 'white',
            }}
          />
          <Bar dataKey="actual" fill="#4299e1" radius={[8, 8, 0, 0]} />
          <Bar
            dataKey="objetivo"
            fill="rgba(255,255,255,0.2)"
            radius={[8, 8, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </Box>
  )
}

```
```components/dashboard/charts/DistributionChart.tsx
import React from 'react'
import { Box, Text, Flex, VStack, HStack, Badge } from '@chakra-ui/react'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'
interface DistributionChartProps {
  data?: Array<{
    name: string
    value: number
    color: string
  }>
}
const defaultData = [
  {
    name: 'Productos',
    value: 45,
    color: '#4299e1',
  },
  {
    name: 'Servicios',
    value: 30,
    color: '#48bb78',
  },
  {
    name: 'Membresías',
    value: 15,
    color: '#9f7aea',
  },
  {
    name: 'Otros',
    value: 10,
    color: '#ed8936',
  },
]
export const DistributionChart: React.FC<DistributionChartProps> = ({
  data = defaultData,
}) => {
  const total = data.reduce((sum, item) => sum + item.value, 0)
  return (
    <Box bg="#152a47" p={6} borderRadius="2xl" height="100%">
      <Box mb={6}>
        <Text fontSize="lg" fontWeight="bold" color="white" mb={1}>
          Distribución de Revenue
        </Text>
        <Text fontSize="sm" color="whiteAlpha.600">
          Por categoría
        </Text>
      </Box>
      <Flex gap={6} align="center" flexWrap="wrap">
        <Box flex="1" minW="250px">
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={90}
                paddingAngle={5}
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0a1929',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '8px',
                  color: 'white',
                }}
                formatter={(value: number) => [`${value}%`, '']}
              />
            </PieChart>
          </ResponsiveContainer>
        </Box>
        <VStack flex="1" align="stretch" spacing={3} minW="200px">
          {data.map((item) => (
            <Flex
              key={item.name}
              justify="space-between"
              align="center"
              p={3}
              bg="#0a1929"
              borderRadius="lg"
              borderLeft="3px solid"
              borderColor={item.color}
            >
              <HStack spacing={3}>
                <Box w="12px" h="12px" borderRadius="full" bg={item.color} />
                <Text fontSize="sm" color="white" fontWeight="medium">
                  {item.name}
                </Text>
              </HStack>
              <Badge colorScheme="blue" fontSize="sm" px={3} py={1}>
                {item.value}%
              </Badge>
            </Flex>
          ))}
        </VStack>
      </Flex>
    </Box>
  )
}

```
```DASHBOARD_DESIGN_REVIEW.md
# Dashboard Design Review - G-Admin
## 🎯 Análisis de Experiencia de Usuario
### ✅ Fortalezas del Diseño Actual
1. **Jerarquía Visual Clara**
   - El widget de Estado Operacional es el hero principal (correcto)
   - Sistema de tabs bien organizado para diferentes vistas
   - Colores consistentes y semántica clara (verde=éxito, rojo=error, azul=info)
2. **Flujo de Información**
   - Información crítica arriba (Estado Operacional)
   - Alertas y Setup en segundo nivel
   - Contenido detallado en tabs
   - Actividad reciente accesible pero no invasiva
3. **Acciones Rápidas**
   - Botones de acción prominentes y coloridos
   - Fácil identificación visual por íconos
   - Agrupadas lógicamente
4. **Responsive Design**
   - Grid system adaptable
   - Componentes que se apilan en mobile
   - Scroll horizontal en tabs cuando es necesario
### ⚠️ Áreas de Mejora Identificadas
1. **Sobrecarga Visual Inicial**
   - Demasiada información en la primera vista
   - El AlertsSetupSection podría ser colapsable
   - Considerar lazy loading para tabs no activos
2. **Navegación**
   - Falta breadcrumb dinámico según el contexto
   - No hay indicador de "dónde estoy" dentro de cada tab
   - Búsqueda global podría ser más prominente
3. **Espaciado y Densidad**
   - Algunos elementos podrían tener más aire
   - El padding en mobile podría optimizarse
   - Las cards podrían beneficiarse de max-width
4. **Interactividad**
   - Falta feedback visual en algunas acciones
   - Los gráficos podrían ser más interactivos
   - No hay estados de loading visibles
## 📋 Recomendaciones de Mejora
### Prioridad Alta
1. **Estado Operacional Siempre Visible**
   - Considerar un header sticky con resumen del estado
   - Mini-widget colapsado cuando se hace scroll
2. **Alertas Colapsables**
   - Por defecto mostrar solo contador
   - Expandir al hacer click
   - Reducir ruido visual inicial
3. **Quick Actions Contextuales**
   - Cambiar según el tab activo
   - Mostrar solo las 4 más relevantes
   - Resto en menú "Más acciones"
### Prioridad Media
1. **Skeleton Loading States**
   - Para gráficos y datos dinámicos
   - Mejorar percepción de velocidad
2. **Filtros y Búsqueda Avanzada**
   - En la tab de Analytics
   - Rango de fechas más visible
   - Filtros por categoría
3. **Personalización**
   - Permitir reordenar widgets
   - Guardar preferencias de vista
   - Ocultar/mostrar secciones
### Prioridad Baja
1. **Animaciones Micro**
   - Transiciones más suaves
   - Feedback visual en hover
   - Loading spinners elegantes
2. **Dark/Light Mode**
   - Toggle en header
   - Persistir preferencia
3. **Tooltips Informativos**
   - Explicaciones de métricas
   - Ayuda contextual
## 🎨 Propuesta de Orden Optimizado
### Orden Actual
```
```components/dashboard/SmartAlertsBar.tsx
import React, { useState } from 'react'
import {
  Box,
  Flex,
  Text,
  Icon,
  Badge,
  Button,
  Collapse,
  VStack,
  HStack,
  IconButton,
} from '@chakra-ui/react'
import { AlertTriangle, ChevronDown, ChevronUp, X } from 'lucide-react'
interface Alert {
  id: string
  title: string
  severity: 'critical' | 'warning' | 'info'
  message: string
  action?: {
    label: string
    onClick: () => void
  }
}
interface SmartAlertsBarProps {
  alerts?: Alert[]
  onDismiss?: (id: string) => void
}
export const SmartAlertsBar: React.FC<SmartAlertsBarProps> = ({
  alerts = [],
  onDismiss,
}) => {
  const [isExpanded, setIsExpanded] = useState(false)
  if (alerts.length === 0) return null
  const criticalCount = alerts.filter((a) => a.severity === 'critical').length
  const warningCount = alerts.filter((a) => a.severity === 'warning').length
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'red.400'
      case 'warning':
        return 'orange.400'
      default:
        return 'blue.400'
    }
  }
  return (
    <Box
      bg="#152a47"
      borderRadius="2xl"
      overflow="hidden"
      mb={6}
      border="1px solid"
      borderColor={criticalCount > 0 ? 'red.400' : 'orange.400'}
      boxShadow={
        criticalCount > 0
          ? '0 4px 12px rgba(245, 101, 101, 0.2)'
          : '0 4px 12px rgba(237, 137, 54, 0.2)'
      }
    >
      {/* Collapsed View */}
      <Flex
        p={4}
        align="center"
        justify="space-between"
        cursor="pointer"
        onClick={() => setIsExpanded(!isExpanded)}
        _hover={{
          bg: 'whiteAlpha.50',
        }}
        transition="all 0.2s"
      >
        <HStack spacing={4}>
          <Icon
            as={AlertTriangle}
            color={criticalCount > 0 ? 'red.400' : 'orange.400'}
            boxSize={6}
          />
          <Box>
            <Text fontSize="md" fontWeight="bold" color="white">
              {alerts.length} Alerta{alerts.length !== 1 ? 's' : ''} Activa
              {alerts.length !== 1 ? 's' : ''}
            </Text>
            <HStack spacing={3} mt={1}>
              {criticalCount > 0 && (
                <Badge colorScheme="red" fontSize="xs">
                  {criticalCount} Crítica{criticalCount !== 1 ? 's' : ''}
                </Badge>
              )}
              {warningCount > 0 && (
                <Badge colorScheme="orange" fontSize="xs">
                  {warningCount} Advertencia{warningCount !== 1 ? 's' : ''}
                </Badge>
              )}
            </HStack>
          </Box>
        </HStack>
        <Icon
          as={isExpanded ? ChevronUp : ChevronDown}
          color="whiteAlpha.600"
          boxSize={5}
        />
      </Flex>
      {/* Expanded View */}
      <Collapse in={isExpanded}>
        <Box
          borderTop="1px solid"
          borderColor="whiteAlpha.100"
          bg="#0a1929"
          p={4}
        >
          <VStack spacing={3} align="stretch">
            {alerts.map((alert) => (
              <Flex
                key={alert.id}
                p={4}
                bg="#152a47"
                borderRadius="lg"
                borderLeft="3px solid"
                borderColor={getSeverityColor(alert.severity)}
                justify="space-between"
                align="start"
              >
                <Box flex={1}>
                  <Flex align="center" mb={2}>
                    <Badge
                      colorScheme={
                        alert.severity === 'critical'
                          ? 'red'
                          : alert.severity === 'warning'
                            ? 'orange'
                            : 'blue'
                      }
                      mr={3}
                    >
                      {alert.severity.toUpperCase()}
                    </Badge>
                    <Text fontWeight="semibold" color="white">
                      {alert.title}
                    </Text>
                  </Flex>
                  <Text fontSize="sm" color="whiteAlpha.700" mb={3}>
                    {alert.message}
                  </Text>
                  {alert.action && (
                    <Button
                      size="sm"
                      colorScheme={
                        alert.severity === 'critical'
                          ? 'red'
                          : alert.severity === 'warning'
                            ? 'orange'
                            : 'blue'
                      }
                      onClick={alert.action.onClick}
                    >
                      {alert.action.label}
                    </Button>
                  )}
                </Box>
                {onDismiss && (
                  <IconButton
                    aria-label="Dismiss alert"
                    icon={<X size={16} />}
                    size="sm"
                    variant="ghost"
                    color="whiteAlpha.600"
                    _hover={{
                      color: 'white',
                      bg: 'whiteAlpha.100',
                    }}
                    onClick={() => onDismiss(alert.id)}
                  />
                )}
              </Flex>
            ))}
          </VStack>
        </Box>
      </Collapse>
    </Box>
  )
}

```