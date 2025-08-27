// ====================================
// ⚡ QUICK COMPONENTS - Componentes instantáneos
// ====================================
// Componentes pre-configurados para casos comunes

import { ReactNode } from 'react'
import { HStack, VStack } from '@chakra-ui/react'
import { Typography, Button, Badge, Icon, CardWrapper, Layout } from './index'

// 📊 METRIC CARD - CardWrapper de métrica instantáneo con iconos (Dashboard-style)
export function MetricCard({ 
  title, 
  value, 
  subtitle,
  color = "brand",
  icon
}: { 
  title: string
  value: string | number
  subtitle?: string
  color?: "brand" | "success" | "warning" | "error" | "info" | "theme"
  icon?: any // HeroIcon component
}) {
  return (
    <CardWrapper 
      variant="elevated" 
       
      padding="lg"
      width="100%"
      flex="1"
      minWidth="0"
    >
      <HStack gap="md" align="center" justify="space-between" width="100%">
        {/* Left side - Content */}
        <VStack gap="xs" align="start" flex={1} minWidth="0">
          <Typography variant="caption" color="secondary">
            {title}
          </Typography>
          <Typography variant="heading" level={3} color={color} noWrap>
            {value}
          </Typography>
          {subtitle && (
            <Typography variant="caption" color="muted" size="xs">
              {subtitle}
            </Typography>
          )}
        </VStack>
        
        {/* Right side - Icon */}
        {icon && (
          <Icon 
            icon={icon} 
            size="lg" 
            color={`${color}.500`}
            bg={`${color}.50`}
            p="sm"
            borderRadius="md"
            flexShrink={0}
          />
        )}
      </HStack>
    </CardWrapper>
  )
}

// 🏷️ QUICK STATUS - Badge de estado instantáneo  
export function QuickStatus({ 
  status, 
  children 
}: { 
  status: 'active' | 'inactive' | 'pending' | 'error'
  children: ReactNode 
}) {
  const colorMap = {
    active: 'success',
    inactive: 'gray',
    pending: 'warning',
    error: 'error'
  }
  
  return (
    <Badge colorPalette={colorMap[status]} variant="subtle">
      {children}
    </Badge>
  )
}

// 📄 PAGE TITLE - Título de página estándar
export function PageTitle({ 
  title, 
  subtitle,
  badge 
}: { 
  title: string
  subtitle?: string
  badge?: ReactNode
}) {
  return (
    <HStack gap={3} align="center">
      <VStack gap={1} align="start" flex={1}>
        <Typography variant="heading" level={1}>
          {title}
        </Typography>
        {subtitle && (
          <Typography variant="body" color="secondary">
            {subtitle}
          </Typography>
        )}
      </VStack>
      {badge}
    </HStack>
  )
}

// 🎛️ ACTION BAR - Barra de acciones estándar
export function ActionBar({ 
  primary, 
  secondary 
}: { 
  primary?: ReactNode
  secondary?: ReactNode 
}) {
  return (
    <HStack justify="space-between" align="center" w="full">
      <HStack gap={2}>
        {secondary}
      </HStack>
      <HStack gap={2}>
        {primary}
      </HStack>
    </HStack>
  )
}

// 📋 LIST ITEM - Item de lista estándar
export function ListItem({ 
  title, 
  subtitle,
  status,
  actions 
}: { 
  title: string
  subtitle?: string
  status?: ReactNode
  actions?: ReactNode
}) {
  return (
    <HStack 
      justify="space-between" 
      align="center" 
      p={3}
      borderRadius="md"
      _hover={{ bg: "bg.subtle" }}
    >
      <VStack gap={1} align="start" flex={1}>
        <Typography variant="body" weight="medium">
          {title}
        </Typography>
        {subtitle && (
          <Typography variant="caption" color="secondary">
            {subtitle}
          </Typography>
        )}
      </VStack>
      
      <HStack gap={2}>
        {status}
        {actions}
      </HStack>
    </HStack>
  )
}

// 🗃️ EMPTY STATE - Estado vacío estándar
export function EmptyState({ 
  title, 
  description,
  action 
}: { 
  title: string
  description?: string
  action?: ReactNode
}) {
  return (
    <VStack gap={4} align="center" py={12}>
      <VStack gap={2} align="center">
        <Typography variant="heading" level={3} color="muted">
          {title}
        </Typography>
        {description && (
          <Typography variant="body" color="secondary" textAlign="center">
            {description}
          </Typography>
        )}
      </VStack>
      {action}
    </VStack>
  )
}