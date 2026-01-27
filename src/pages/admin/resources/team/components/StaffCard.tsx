// StaffCard - Editorial Brutalist Design
// Distinctive staff card with strong typography and color-coded status bar
import { useState } from 'react';
import {
  Box,
  Stack,
  Text,
  Avatar,
  Badge,
  IconButton,
  Tooltip,
  Menu,
  MenuRoot,
  MenuTrigger,
  MenuContent,
  MenuItem,
} from '@/shared/ui';
import {
  PhoneIcon,
  EnvelopeIcon,
  EllipsisVerticalIcon,
  EyeIcon,
  PencilIcon,
  CalendarIcon,
  ExclamationTriangleIcon,
  ChatBubbleLeftIcon,
} from '@heroicons/react/24/outline';
import type { TeamMember } from '@/modules/team/store';

// ═══════════════════════════════════════════════════════════════
// DESIGN TOKENS - Editorial Brutalist Palette
// ═══════════════════════════════════════════════════════════════
const STATUS_COLORS = {
  active: { bar: '#10B981', bg: 'rgba(16, 185, 129, 0.08)', label: 'Activo' },
  inactive: { bar: '#6B7280', bg: 'rgba(107, 114, 128, 0.08)', label: 'Inactivo' },
  on_leave: { bar: '#F59E0B', bg: 'rgba(245, 158, 11, 0.08)', label: 'Licencia' },
  terminated: { bar: '#EF4444', bg: 'rgba(239, 68, 68, 0.08)', label: 'Baja' },
} as const;

const DEPT_COLORS: Record<string, string> = {
  kitchen: '#F97316',
  service: '#3B82F6',
  admin: '#8B5CF6',
  cleaning: '#22C55E',
  management: '#EC4899',
};

const DEPT_LABELS: Record<string, string> = {
  kitchen: 'Cocina',
  service: 'Servicio',
  admin: 'Admin',
  cleaning: 'Limpieza',
  management: 'Gerencia',
};

// ═══════════════════════════════════════════════════════════════
// STAFF CARD COMPONENT - Grid View
// ═══════════════════════════════════════════════════════════════
interface StaffCardProps {
  teamMember: TeamMember;
  onView?: (teamMember: TeamMember) => void;
  onEdit?: (teamMember: TeamMember) => void;
  onContact?: (teamMember: TeamMember, method: 'whatsapp' | 'call' | 'email') => void;
  onIncident?: (teamMember: TeamMember) => void;
}

export function StaffCard({
  teamMember,
  onView,
  onEdit,
  onContact,
  onIncident
}: StaffCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  const status = STATUS_COLORS[teamMember.status] || STATUS_COLORS.inactive;
  const deptColor = DEPT_COLORS[teamMember.department] || '#6B7280';
  const deptLabel = DEPT_LABELS[teamMember.department] || teamMember.department;

  // Performance score visual
  const perfScore = teamMember.performance_score ?? 0;
  const perfColor = perfScore >= 80 ? '#10B981' : perfScore >= 60 ? '#F59E0B' : '#EF4444';

  const handleWhatsApp = () => {
    if (teamMember.phone) {
      const cleanPhone = teamMember.phone.replace(/\D/g, '');
      window.open(`https://wa.me/${cleanPhone}`, '_blank');
    }
    onContact?.(teamMember, 'whatsapp');
  };

  const handleCall = () => {
    if (teamMember.phone) {
      window.open(`tel:${teamMember.phone}`, '_blank');
    }
    onContact?.(teamMember, 'call');
  };

  const handleEmail = () => {
    window.open(`mailto:${teamMember.email}`, '_blank');
    onContact?.(teamMember, 'email');
  };

  return (
    <Box
      position="relative"
      bg="white"
      borderRadius="2px"
      overflow="hidden"
      transition="all 0.2s cubic-bezier(0.4, 0, 0.2, 1)"
      transform={isHovered ? 'translateY(-2px)' : 'translateY(0)'}
      boxShadow={isHovered
        ? '0 8px 24px rgba(0,0,0,0.12)'
        : '0 1px 3px rgba(0,0,0,0.08)'
      }
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      _dark={{
        bg: 'gray.900',
        boxShadow: isHovered
          ? '0 8px 24px rgba(0,0,0,0.4)'
          : '0 1px 3px rgba(0,0,0,0.3)',
      }}
    >
      {/* STATUS BAR - Left edge accent */}
      <Box
        position="absolute"
        left="0"
        top="0"
        bottom="0"
        width="4px"
        bg={status.bar}
        transition="width 0.2s ease"
        style={{ width: isHovered ? '6px' : '4px' }}
      />

      {/* MAIN CONTENT */}
      <Box pl="20px" pr="16px" py="20px">
        {/* Header: Avatar + Identity */}
        <Stack direction="row" gap="14px" align="flex-start" mb="16px">
          <Box position="relative">
            <Avatar
              name={teamMember.name}
              src={teamMember.avatar}
              size="lg"
              borderRadius="2px"
            />
            {/* Online indicator */}
            {teamMember.status === 'active' && (
              <Box
                position="absolute"
                bottom="-2px"
                right="-2px"
                width="12px"
                height="12px"
                bg="#10B981"
                borderRadius="full"
                border="2px solid white"
                _dark={{ borderColor: 'gray.900' }}
              />
            )}
          </Box>

          <Stack direction="column" gap="2px" flex="1" minW="0">
            {/* Name - Strong typography */}
            <Text
              fontSize="15px"
              fontWeight="600"
              letterSpacing="-0.01em"
              lineHeight="1.3"
              truncate
              color="gray.900"
              _dark={{ color: 'white' }}
            >
              {teamMember.name}
            </Text>

            {/* Position */}
            <Text
              fontSize="13px"
              color="gray.500"
              lineHeight="1.3"
              truncate
              _dark={{ color: 'gray.400' }}
            >
              {teamMember.position}
            </Text>

            {/* Department badge */}
            <Box mt="6px">
              <Badge
                size="sm"
                variant="subtle"
                px="8px"
                py="2px"
                borderRadius="2px"
                fontSize="10px"
                fontWeight="600"
                textTransform="uppercase"
                letterSpacing="0.05em"
                style={{
                  backgroundColor: `${deptColor}15`,
                  color: deptColor,
                }}
              >
                {deptLabel}
              </Badge>
            </Box>
          </Stack>

          {/* Menu */}
          <MenuRoot>
            <MenuTrigger asChild>
              <IconButton
                aria-label="Opciones"
                variant="ghost"
                size="sm"
                opacity={isHovered ? 1 : 0.5}
                transition="opacity 0.15s"
              >
                <EllipsisVerticalIcon width={18} height={18} />
              </IconButton>
            </MenuTrigger>
            <MenuContent minW="160px">
              <MenuItem value="view" onClick={() => onView?.(teamMember)}>
                <EyeIcon width={16} height={16} />
                <Text ml="8px">Ver perfil</Text>
              </MenuItem>
              <MenuItem value="edit" onClick={() => onEdit?.(teamMember)}>
                <PencilIcon width={16} height={16} />
                <Text ml="8px">Editar</Text>
              </MenuItem>
              <MenuItem value="schedule" onClick={() => {}}>
                <CalendarIcon width={16} height={16} />
                <Text ml="8px">Asignar turno</Text>
              </MenuItem>
              <MenuItem value="incident" onClick={() => onIncident?.(teamMember)}>
                <ExclamationTriangleIcon width={16} height={16} />
                <Text ml="8px">Registrar incidencia</Text>
              </MenuItem>
            </MenuContent>
          </MenuRoot>
        </Stack>

        {/* METRICS ROW */}
        <Stack
          direction="row"
          justify="space-between"
          align="flex-end"
          pt="12px"
          borderTop="1px solid"
          borderColor="gray.100"
          _dark={{ borderColor: 'gray.800' }}
        >
          {/* Performance - Big number typography */}
          <Stack direction="column" gap="0">
            <Text
              fontSize="10px"
              fontWeight="500"
              textTransform="uppercase"
              letterSpacing="0.08em"
              color="gray.400"
              _dark={{ color: 'gray.500' }}
            >
              Rendimiento
            </Text>
            <Stack direction="row" align="baseline" gap="2px">
              <Text
                fontSize="28px"
                fontWeight="700"
                lineHeight="1"
                letterSpacing="-0.02em"
                style={{ color: perfColor }}
              >
                {perfScore}
              </Text>
              <Text
                fontSize="12px"
                fontWeight="500"
                color="gray.400"
                _dark={{ color: 'gray.500' }}
              >
                %
              </Text>
            </Stack>
          </Stack>

          {/* Quick Actions */}
          <Stack direction="row" gap="4px">
            {teamMember.phone && (
              <>
                <Tooltip.Root openDelay={200}>
                  <Tooltip.Trigger asChild>
                    <IconButton
                      aria-label="WhatsApp"
                      variant="ghost"
                      size="sm"
                      onClick={handleWhatsApp}
                      color="green.500"
                      _hover={{ bg: 'green.50', color: 'green.600' }}
                      _dark={{ _hover: { bg: 'green.900/30' } }}
                    >
                      <ChatBubbleLeftIcon width={18} height={18} />
                    </IconButton>
                  </Tooltip.Trigger>
                  <Tooltip.Positioner>
                    <Tooltip.Content>WhatsApp</Tooltip.Content>
                  </Tooltip.Positioner>
                </Tooltip.Root>

                <Tooltip.Root openDelay={200}>
                  <Tooltip.Trigger asChild>
                    <IconButton
                      aria-label="Llamar"
                      variant="ghost"
                      size="sm"
                      onClick={handleCall}
                      _hover={{ bg: 'gray.100' }}
                      _dark={{ _hover: { bg: 'gray.800' } }}
                    >
                      <PhoneIcon width={18} height={18} />
                    </IconButton>
                  </Tooltip.Trigger>
                  <Tooltip.Positioner>
                    <Tooltip.Content>Llamar</Tooltip.Content>
                  </Tooltip.Positioner>
                </Tooltip.Root>
              </>
            )}

            <Tooltip.Root openDelay={200}>
              <Tooltip.Trigger asChild>
                <IconButton
                  aria-label="Email"
                  variant="ghost"
                  size="sm"
                  onClick={handleEmail}
                  _hover={{ bg: 'gray.100' }}
                  _dark={{ _hover: { bg: 'gray.800' } }}
                >
                  <EnvelopeIcon width={18} height={18} />
                </IconButton>
              </Tooltip.Trigger>
              <Tooltip.Positioner>
                <Tooltip.Content>Email</Tooltip.Content>
              </Tooltip.Positioner>
            </Tooltip.Root>
          </Stack>
        </Stack>
      </Box>
    </Box>
  );
}

// ═══════════════════════════════════════════════════════════════
// STAFF LIST ITEM - Compact List View
// ═══════════════════════════════════════════════════════════════
type StaffListItemProps = StaffCardProps;

export function StaffListItem({
  teamMember,
  onView,
  onEdit,
  onContact,
  onIncident
}: StaffListItemProps) {
  const [isHovered, setIsHovered] = useState(false);

  const status = STATUS_COLORS[teamMember.status] || STATUS_COLORS.inactive;
  const deptColor = DEPT_COLORS[teamMember.department] || '#6B7280';
  const deptLabel = DEPT_LABELS[teamMember.department] || teamMember.department;

  const perfScore = teamMember.performance_score ?? 0;
  const perfColor = perfScore >= 80 ? '#10B981' : perfScore >= 60 ? '#F59E0B' : '#EF4444';

  const handleWhatsApp = () => {
    if (teamMember.phone) {
      const cleanPhone = teamMember.phone.replace(/\D/g, '');
      window.open(`https://wa.me/${cleanPhone}`, '_blank');
    }
    onContact?.(teamMember, 'whatsapp');
  };

  return (
    <Box
      position="relative"
      bg="white"
      borderRadius="2px"
      overflow="hidden"
      transition="all 0.15s ease"
      boxShadow={isHovered ? '0 2px 8px rgba(0,0,0,0.08)' : 'none'}
      borderBottom="1px solid"
      borderColor="gray.100"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      _dark={{
        bg: 'gray.900',
        borderColor: 'gray.800',
      }}
    >
      {/* Status bar - thin left accent */}
      <Box
        position="absolute"
        left="0"
        top="0"
        bottom="0"
        width="3px"
        bg={status.bar}
      />

      <Stack
        direction="row"
        align="center"
        gap="16px"
        py="12px"
        pl="20px"
        pr="12px"
      >
        {/* Avatar */}
        <Avatar
          name={teamMember.name}
          src={teamMember.avatar}
          size="sm"
          borderRadius="2px"
        />

        {/* Identity */}
        <Stack direction="column" gap="0" flex="1" minW="140px">
          <Text
            fontSize="14px"
            fontWeight="600"
            color="gray.900"
            truncate
            _dark={{ color: 'white' }}
          >
            {teamMember.name}
          </Text>
          <Text
            fontSize="12px"
            color="gray.500"
            truncate
            _dark={{ color: 'gray.400' }}
          >
            {teamMember.position}
          </Text>
        </Stack>

        {/* Department */}
        <Box minW="80px">
          <Badge
            size="sm"
            variant="subtle"
            px="6px"
            py="1px"
            borderRadius="2px"
            fontSize="10px"
            fontWeight="600"
            textTransform="uppercase"
            letterSpacing="0.04em"
            style={{
              backgroundColor: `${deptColor}12`,
              color: deptColor,
            }}
          >
            {deptLabel}
          </Badge>
        </Box>

        {/* Status */}
        <Box minW="70px">
          <Text
            fontSize="11px"
            fontWeight="500"
            textTransform="uppercase"
            letterSpacing="0.04em"
            style={{ color: status.bar }}
          >
            {status.label}
          </Text>
        </Box>

        {/* Performance - Compact number */}
        <Stack direction="row" align="baseline" gap="1px" minW="50px">
          <Text
            fontSize="18px"
            fontWeight="700"
            letterSpacing="-0.02em"
            lineHeight="1"
            style={{ color: perfColor }}
          >
            {perfScore}
          </Text>
          <Text fontSize="10px" color="gray.400">%</Text>
        </Stack>

        {/* Quick Actions - Slide in on hover */}
        <Stack
          direction="row"
          gap="2px"
          opacity={isHovered ? 1 : 0}
          transform={isHovered ? 'translateX(0)' : 'translateX(8px)'}
          transition="all 0.15s ease"
        >
          {teamMember.phone && (
            <Tooltip.Root openDelay={200}>
              <Tooltip.Trigger asChild>
                <IconButton
                  aria-label="WhatsApp"
                  variant="ghost"
                  size="xs"
                  onClick={handleWhatsApp}
                  color="green.500"
                >
                  <ChatBubbleLeftIcon width={16} height={16} />
                </IconButton>
              </Tooltip.Trigger>
              <Tooltip.Positioner>
                <Tooltip.Content>WhatsApp</Tooltip.Content>
              </Tooltip.Positioner>
            </Tooltip.Root>
          )}

          <Tooltip.Root openDelay={200}>
            <Tooltip.Trigger asChild>
              <IconButton
                aria-label="Ver"
                variant="ghost"
                size="xs"
                onClick={() => onView?.(teamMember)}
              >
                <EyeIcon width={16} height={16} />
              </IconButton>
            </Tooltip.Trigger>
            <Tooltip.Positioner>
              <Tooltip.Content>Ver perfil</Tooltip.Content>
            </Tooltip.Positioner>
          </Tooltip.Root>

          <Tooltip.Root openDelay={200}>
            <Tooltip.Trigger asChild>
              <IconButton
                aria-label="Editar"
                variant="ghost"
                size="xs"
                onClick={() => onEdit?.(teamMember)}
              >
                <PencilIcon width={16} height={16} />
              </IconButton>
            </Tooltip.Trigger>
            <Tooltip.Positioner>
              <Tooltip.Content>Editar</Tooltip.Content>
            </Tooltip.Positioner>
          </Tooltip.Root>
        </Stack>

        {/* Static menu for non-hover */}
        <MenuRoot>
          <MenuTrigger asChild>
            <IconButton
              aria-label="Opciones"
              variant="ghost"
              size="xs"
              opacity={isHovered ? 0 : 0.5}
              position={isHovered ? 'absolute' : 'relative'}
              right={isHovered ? '-100px' : 'auto'}
            >
              <EllipsisVerticalIcon width={16} height={16} />
            </IconButton>
          </MenuTrigger>
          <MenuContent minW="160px">
            <MenuItem value="view" onClick={() => onView?.(teamMember)}>
              <EyeIcon width={16} height={16} />
              <Text ml="8px">Ver perfil</Text>
            </MenuItem>
            <MenuItem value="edit" onClick={() => onEdit?.(teamMember)}>
              <PencilIcon width={16} height={16} />
              <Text ml="8px">Editar</Text>
            </MenuItem>
            <MenuItem value="schedule">
              <CalendarIcon width={16} height={16} />
              <Text ml="8px">Asignar turno</Text>
            </MenuItem>
            <MenuItem value="incident" onClick={() => onIncident?.(teamMember)}>
              <ExclamationTriangleIcon width={16} height={16} />
              <Text ml="8px">Registrar incidencia</Text>
            </MenuItem>
          </MenuContent>
        </MenuRoot>
      </Stack>
    </Box>
  );
}
