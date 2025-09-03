// ====================================
// ⚡ QUICK COMPONENTS - Componentes instantáneos
// ====================================
// Componentes pre-configurados para casos comunes

import { ReactNode } from 'react'
import { HStack, VStack } from '@chakra-ui/react'
import { Typography, Button, Badge, Icon, Layout } from './index'

// 📊 METRIC CARD - CardWrapper de métrica instantáneo con iconos (Dashboard-style)
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
          <Typography variant="body" color="text.secondary">
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
          <Typography variant="caption" color="text.secondary">
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
        <Typography variant="heading" level={3} color="text.muted">
          {title}
        </Typography>
        {description && (
          <Typography variant="body" color="text.secondary" textAlign="center">
            {description}
          </Typography>
        )}
      </VStack>
      {action}
    </VStack>
  )
}