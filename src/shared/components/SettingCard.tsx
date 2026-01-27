/**
 * SettingCard Component
 * Reusable card for specialized settings that link to dedicated configuration pages
 * 
 * Usage in module manifests:
 * ```tsx
 * registry.addAction(
 *   'settings.specialized.cards',
 *   () => (
 *     <SettingCard
 *       title="Horarios de Operación"
 *       description="Configura horarios de apertura para cada servicio"
 *       icon={ClockIcon}
 *       href="/admin/settings/hours"
 *       stats={{ total: 3, active: 2 }}
 *       status="configured"
 *     />
 *   ),
 *   'fulfillment-onsite',
 *   100
 * );
 * ```
 */

import { Card, HStack, VStack, Text, Icon, Badge } from '@/shared/ui';
import { ChevronRightIcon } from '@heroicons/react/24/outline';
import { useNavigate } from 'react-router-dom';
import type { ComponentType } from 'react';

// ============================================
// TYPES
// ============================================

export interface SettingCardProps {
  /** Card title */
  title: string;
  
  /** Brief description */
  description: string;
  
  /** Heroicon component */
  icon: ComponentType<{ className?: string }>;
  
  /** Navigation path */
  href: string;
  
  /** Optional statistics to display */
  stats?: {
    total?: number;
    active?: number;
    label?: string;
  };
  
  /** Configuration status */
  status?: 'configured' | 'pending' | 'incomplete';
}

// ============================================
// STATUS VARIANTS
// ============================================

const statusVariants = {
  configured: {
    color: 'green',
    label: 'Configurado'
  },
  pending: {
    color: 'yellow',
    label: 'Pendiente'
  },
  incomplete: {
    color: 'orange',
    label: 'Incompleto'
  }
} as const;

// ============================================
// COMPONENT
// ============================================

export function SettingCard({
  title,
  description,
  icon: IconComponent,
  href,
  stats,
  status
}: SettingCardProps) {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(href);
  };

  return (
    <Card.Root
      variant="outline"
      size="md"
      onClick={handleClick}
      cursor="pointer"
      transition="all 0.2s"
      _hover={{
        borderColor: 'var(--colors-border-emphasized)',
        shadow: 'md',
        transform: 'translateY(-2px)'
      }}
      flex={{ base: '1 1 100%', md: '1 1 calc(50% - 0.5rem)', lg: '1 1 calc(33.333% - 0.667rem)' }}
      minW="280px"
    >
      <Card.Body>
        <VStack align="stretch" gap="3">
          {/* Header */}
          <HStack justify="space-between">
            <HStack gap="3">
              <Icon 
                icon={IconComponent} 
                size="md"
                color="var(--colors-fg-emphasized)"
              />
              <Text fontWeight="semibold" fontSize="md">
                {title}
              </Text>
            </HStack>
            
            {/* Status badge */}
            {status && (
              <Badge 
                variant="subtle"
                colorPalette={statusVariants[status].color}
              >
                {statusVariants[status].label}
              </Badge>
            )}
          </HStack>

          {/* Description */}
          <Text fontSize="sm" color="var(--colors-fg-muted)">
            {description}
          </Text>

          {/* Stats & Arrow */}
          <HStack justify="space-between" mt="2">
            {stats && (
              <Text fontSize="xs" color="var(--colors-fg-subtle)">
                {stats.label || `${stats.active || 0}/${stats.total || 0} configurados`}
              </Text>
            )}
            
            <Icon 
              icon={ChevronRightIcon} 
              size="sm"
              color="var(--colors-fg-subtle)"
              ml="auto"
            />
          </HStack>
        </VStack>
      </Card.Body>
    </Card.Root>
  );
}
