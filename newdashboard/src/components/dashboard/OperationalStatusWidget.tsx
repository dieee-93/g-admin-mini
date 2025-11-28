import React from 'react';
import { Box, Flex, Text, Icon, Badge, HStack, VStack, Button, Progress } from '@chakra-ui/react';
import { Clock, Users, AlertCircle, CheckCircle, Power, Calendar } from 'lucide-react';
interface OperationalStatusWidgetProps {
  isOpen: boolean;
  currentShift?: string;
  activeStaff?: number;
  totalStaff?: number;
  openTime?: string;
  closeTime?: string;
  operatingHours?: number;
  alerts?: number;
  onToggleStatus?: () => void;
}
export const OperationalStatusWidget: React.FC<OperationalStatusWidgetProps> = ({
  isOpen = true,
  currentShift = 'Turno Mañana',
  activeStaff = 6,
  totalStaff = 9,
  openTime = '09:00',
  closeTime = '21:00',
  operatingHours = 4.5,
  alerts = 0,
  onToggleStatus
}) => {
  const staffPercentage = activeStaff / totalStaff * 100;
  return <Box bg="linear-gradient(135deg, #1a365d 0%, #2d3748 100%)" borderRadius="3xl" p={8} position="relative" overflow="hidden" boxShadow="0 10px 30px rgba(0, 0, 0, 0.4)" border="1px solid" borderColor={isOpen ? 'green.400' : 'red.400'}>
      {/* Background Pattern */}
      <Box position="absolute" top="-50%" right="-20%" width="300px" height="300px" borderRadius="full" bg={isOpen ? 'green.400' : 'red.400'} opacity={0.05} filter="blur(60px)" />
      <Flex justify="space-between" align="start" mb={6}>
        {/* Status Badge */}
        <VStack align="start" spacing={3} flex={1}>
          <HStack spacing={3}>
            <Icon as={isOpen ? CheckCircle : AlertCircle} boxSize={8} color={isOpen ? 'green.400' : 'red.400'} />
            <Box>
              <Text fontSize="2xl" fontWeight="bold" color="white">
                {isOpen ? 'Operativo' : 'Cerrado'}
              </Text>
              <Text fontSize="sm" color="whiteAlpha.600">
                {currentShift}
              </Text>
            </Box>
          </HStack>
          <Badge colorScheme={isOpen ? 'green' : 'red'} fontSize="md" px={4} py={2} borderRadius="full" fontWeight="bold">
            {isOpen ? '● EN VIVO' : '● FUERA DE LÍNEA'}
          </Badge>
        </VStack>
        {/* Toggle Button */}
        {onToggleStatus && <Button leftIcon={<Power size={18} />} colorScheme={isOpen ? 'red' : 'green'} size="lg" onClick={onToggleStatus} fontWeight="bold" px={8} borderRadius="full">
            {isOpen ? 'Cerrar' : 'Abrir'}
          </Button>}
      </Flex>
      {/* Stats Grid */}
      <Box bg="whiteAlpha.100" borderRadius="2xl" p={6} backdropFilter="blur(10px)">
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
            <Progress value={staffPercentage} colorScheme="purple" size="sm" borderRadius="full" mt={2} />
          </Box>
          {/* Alerts */}
          <Box flex={1} minW="200px">
            <HStack spacing={3} mb={3}>
              <Icon as={AlertCircle} color={alerts > 0 ? 'orange.400' : 'green.400'} boxSize={5} />
              <Text fontSize="sm" color="whiteAlpha.600" fontWeight="medium">
                Alertas Activas
              </Text>
            </HStack>
            <Text fontSize="3xl" fontWeight="bold" color={alerts > 0 ? 'orange.400' : 'green.400'}>
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
    </Box>;
};