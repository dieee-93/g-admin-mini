import React, { useState } from 'react';
import { Box, Flex, Text, Icon, Progress, VStack, HStack, Badge, Button } from '@chakra-ui/react';
import { AlertTriangle, CheckCircle, Settings, Database, Users, CreditCard, Package, Bell, Shield, Zap, Circle, CheckCircle2 } from 'lucide-react';
interface Achievement {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  icon: React.ElementType;
  category: string;
}
export const AlertsSetupSection = () => {
  const [activeTab, setActiveTab] = useState<'alerts' | 'setup'>('alerts');
  const foundationalAchievements: Achievement[] = [{
    id: '1',
    title: 'Configuración de Base de Datos',
    description: 'Conectar y configurar la base de datos principal',
    completed: true,
    icon: Database,
    category: 'Infraestructura'
  }, {
    id: '2',
    title: 'Gestión de Usuarios',
    description: 'Configurar roles y permisos del sistema',
    completed: true,
    icon: Users,
    category: 'Seguridad'
  }, {
    id: '3',
    title: 'Integración de Pagos',
    description: 'Conectar pasarela de pagos (MercadoPago/Stripe)',
    completed: true,
    icon: CreditCard,
    category: 'Finanzas'
  }, {
    id: '4',
    title: 'Catálogo de Productos',
    description: 'Cargar productos y configurar inventario inicial',
    completed: false,
    icon: Package,
    category: 'Inventario'
  }, {
    id: '5',
    title: 'Sistema de Notificaciones',
    description: 'Configurar emails y notificaciones push',
    completed: false,
    icon: Bell,
    category: 'Comunicación'
  }, {
    id: '6',
    title: 'Seguridad y Backups',
    description: 'Configurar backups automáticos y 2FA',
    completed: false,
    icon: Shield,
    category: 'Seguridad'
  }];
  const completedCount = foundationalAchievements.filter(a => a.completed).length;
  const totalCount = foundationalAchievements.length;
  const progressPercentage = completedCount / totalCount * 100;
  const alerts = [{
    id: '1',
    title: 'Sistema Operando Normalmente',
    description: 'Todos los módulos funcionando correctamente',
    type: 'success' as const,
    time: 'Hace 2 minutos'
  }, {
    id: '2',
    title: 'Sincronización Completada',
    description: 'Datos sincronizados con todos los módulos',
    type: 'success' as const,
    time: 'Hace 5 minutos'
  }];
  return <Box bg="#152a47" borderRadius="2xl" overflow="hidden" mb={8} boxShadow="0 4px 6px -1px rgba(0, 0, 0, 0.3), 0 2px 4px -1px rgba(0, 0, 0, 0.2)" transition="all 0.3s" _hover={{
    boxShadow: '0 8px 16px -4px rgba(0, 0, 0, 0.4), 0 4px 8px -2px rgba(0, 0, 0, 0.3)'
  }}>
      {/* Integrated Tabs Header */}
      <Flex bg="#0d1f35" borderBottom="1px solid" borderColor="whiteAlpha.100">
        <Box flex={1} py={4} px={6} cursor="pointer" bg={activeTab === 'alerts' ? '#152a47' : 'transparent'} borderBottom={activeTab === 'alerts' ? '3px solid' : '3px solid transparent'} borderColor="orange.400" onClick={() => setActiveTab('alerts')} transition="all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)" position="relative" _hover={{
        bg: activeTab === 'alerts' ? '#152a47' : 'whiteAlpha.50',
        transform: activeTab === 'alerts' ? 'none' : 'translateY(-2px)'
      }}>
          <Flex align="center" justify="center">
            <Icon as={AlertTriangle} color={activeTab === 'alerts' ? 'orange.400' : 'whiteAlpha.500'} mr={2} boxSize={5} transition="all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)" transform={activeTab === 'alerts' ? 'rotate(0deg)' : 'none'} _groupHover={{
            transform: 'rotate(10deg)'
          }} />
            <Text fontWeight="semibold" fontSize="md" color={activeTab === 'alerts' ? 'white' : 'whiteAlpha.600'} transition="all 0.2s">
              Alertas Operacionales
            </Text>
            <Badge ml={3} colorScheme="green" variant="solid" borderRadius="full" px={2} bgGradient="linear(to-r, green.400, green.500)" boxShadow="0 2px 4px rgba(72, 187, 120, 0.3)">
              {alerts.length}
            </Badge>
          </Flex>
        </Box>
        <Box flex={1} py={4} px={6} cursor="pointer" bg={activeTab === 'setup' ? '#152a47' : 'transparent'} borderBottom={activeTab === 'setup' ? '3px solid' : '3px solid transparent'} borderColor="blue.400" onClick={() => setActiveTab('setup')} transition="all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)" position="relative" _hover={{
        bg: activeTab === 'setup' ? '#152a47' : 'whiteAlpha.50',
        transform: activeTab === 'setup' ? 'none' : 'translateY(-2px)'
      }}>
          <Flex align="center" justify="center">
            <Icon as={Settings} color={activeTab === 'setup' ? 'blue.400' : 'whiteAlpha.500'} mr={2} boxSize={5} transition="all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)" _groupHover={{
            transform: 'rotate(90deg)'
          }} />
            <Text fontWeight="semibold" fontSize="md" color={activeTab === 'setup' ? 'white' : 'whiteAlpha.600'} transition="all 0.2s">
              Setup Fundacional
            </Text>
            <Badge ml={3} colorScheme={progressPercentage === 100 ? 'green' : 'blue'} variant="solid" borderRadius="full" px={2} bgGradient={progressPercentage === 100 ? 'linear(to-r, green.400, green.500)' : 'linear(to-r, blue.400, blue.500)'} boxShadow={progressPercentage === 100 ? '0 2px 4px rgba(72, 187, 120, 0.3)' : '0 2px 4px rgba(66, 153, 225, 0.3)'}>
              {completedCount}/{totalCount}
            </Badge>
          </Flex>
        </Box>
      </Flex>
      {/* Content Area */}
      <Box p={8}>
        {activeTab === 'alerts' ? <VStack spacing={6} align="stretch">
            <Box>
              <Text fontSize="sm" color="whiteAlpha.600" mb={5} fontWeight="medium">
                Información urgente y notificaciones del sistema
              </Text>
              {alerts.length === 0 ? <Box bg="#0a1929" p={8} borderRadius="2xl" textAlign="center" border="1px solid" borderColor="whiteAlpha.100">
                  <Flex align="center" justify="center" mb={3}>
                    <Icon as={CheckCircle} color="green.400" boxSize={7} mr={2} />
                    <Text fontSize="xl" fontWeight="semibold" color="white">
                      Todo en orden
                    </Text>
                  </Flex>
                  <Text fontSize="sm" color="whiteAlpha.600">
                    No hay alertas críticas en este momento
                  </Text>
                </Box> : <VStack spacing={4} align="stretch">
                  {alerts.map(alert => <Box key={alert.id} bg="#0a1929" p={5} borderRadius="2xl" borderLeft="4px solid" borderColor={alert.type === 'success' ? 'green.400' : 'orange.400'} transition="all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)" _hover={{
              bg: '#0d1f35',
              transform: 'translateX(8px) scale(1.01)',
              boxShadow: alert.type === 'success' ? '0 4px 8px rgba(72, 187, 120, 0.2)' : '0 4px 8px rgba(237, 137, 54, 0.2)'
            }}>
                      <Flex justify="space-between" align="start">
                        <Flex align="start" flex={1}>
                          <Icon as={alert.type === 'success' ? CheckCircle : AlertTriangle} color={alert.type === 'success' ? 'green.400' : 'orange.400'} mt={0.5} mr={4} boxSize={5} />
                          <Box flex={1}>
                            <Text fontWeight="semibold" color="white" mb={2} fontSize="md">
                              {alert.title}
                            </Text>
                            <Text fontSize="sm" color="whiteAlpha.700" lineHeight="tall">
                              {alert.description}
                            </Text>
                          </Box>
                        </Flex>
                        <Text fontSize="xs" color="whiteAlpha.500" whiteSpace="nowrap" ml={6} fontWeight="medium">
                          {alert.time}
                        </Text>
                      </Flex>
                    </Box>)}
                </VStack>}
            </Box>
            <Box pt={6} borderTop="1px solid" borderColor="whiteAlpha.100">
              <Text fontSize="xs" fontWeight="bold" color="whiteAlpha.500" mb={4} letterSpacing="wider">
                ACCIONES RÁPIDAS
              </Text>
              <Flex gap={3} flexWrap="wrap">
                <Button size="sm" colorScheme="orange" variant="outline" fontWeight="medium" borderRadius="full" transition="all 0.2s" _hover={{
              transform: 'translateY(-2px)',
              boxShadow: '0 4px 8px rgba(237, 137, 54, 0.3)'
            }}>
                  Importante
                </Button>
                <Button size="sm" colorScheme="blue" variant="outline" fontWeight="medium" borderRadius="full" transition="all 0.2s" _hover={{
              transform: 'translateY(-2px)',
              boxShadow: '0 4px 8px rgba(66, 153, 225, 0.3)'
            }}>
                  Actualizaciones
                </Button>
                <Button size="sm" colorScheme="purple" variant="outline" fontWeight="medium" borderRadius="full" transition="all 0.2s" _hover={{
              transform: 'translateY(-2px)',
              boxShadow: '0 4px 8px rgba(159, 122, 234, 0.3)'
            }}>
                  Staff
                </Button>
                <Button size="sm" colorScheme="green" variant="outline" fontWeight="medium" borderRadius="full" transition="all 0.2s" _hover={{
              transform: 'translateY(-2px)',
              boxShadow: '0 4px 8px rgba(72, 187, 120, 0.3)'
            }}>
                  Ver Todas
                </Button>
              </Flex>
            </Box>
          </VStack> : <VStack spacing={8} align="stretch">
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
                  <Text fontSize="4xl" fontWeight="bold" bgGradient="linear(to-r, blue.400, blue.500)" bgClip="text" lineHeight="1">
                    {Math.round(progressPercentage)}%
                  </Text>
                  <Text fontSize="xs" color="whiteAlpha.500" mt={1} fontWeight="medium">
                    COMPLETADO
                  </Text>
                </Box>
              </Flex>
              <Progress value={progressPercentage} colorScheme="blue" borderRadius="full" height="12px" bg="#0a1929" sx={{
            '& > div': {
              transition: 'all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)',
              bgGradient: 'linear(to-r, blue.400, blue.500)',
              boxShadow: '0 0 10px rgba(66, 153, 225, 0.5)'
            }
          }} />
            </Box>
            {/* Achievement List */}
            <VStack spacing={4} align="stretch">
              {foundationalAchievements.map(achievement => <Box key={achievement.id} bg="#0a1929" p={5} borderRadius="2xl" borderLeft="4px solid" borderColor={achievement.completed ? 'green.400' : 'whiteAlpha.200'} opacity={achievement.completed ? 1 : 0.95} transition="all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)" cursor="pointer" _hover={{
            bg: '#0d1f35',
            transform: 'translateX(8px) scale(1.01)',
            boxShadow: achievement.completed ? '0 4px 8px rgba(72, 187, 120, 0.2)' : '0 4px 8px rgba(66, 153, 225, 0.2)',
            borderColor: achievement.completed ? 'green.400' : 'blue.400'
          }}>
                  <Flex justify="space-between" align="center">
                    <Flex align="center" flex={1}>
                      <Box p={3} borderRadius="xl" bg={achievement.completed ? 'green.400' : 'whiteAlpha.100'} mr={4} transition="all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)" _groupHover={{
                  transform: 'rotate(10deg) scale(1.1)'
                }} boxShadow={achievement.completed ? '0 4px 8px rgba(72, 187, 120, 0.4)' : 'none'}>
                        <Icon as={achievement.icon} color={achievement.completed ? 'white' : 'whiteAlpha.600'} boxSize={6} />
                      </Box>
                      <Box flex={1}>
                        <Flex align="center" mb={2}>
                          <Text fontWeight="semibold" color="white" mr={3} fontSize="md">
                            {achievement.title}
                          </Text>
                          <Badge size="sm" colorScheme={achievement.completed ? 'green' : 'gray'} variant="subtle" px={2} fontWeight="medium" borderRadius="full">
                            {achievement.category}
                          </Badge>
                        </Flex>
                        <Text fontSize="sm" color="whiteAlpha.600" lineHeight="tall">
                          {achievement.description}
                        </Text>
                      </Box>
                    </Flex>
                    <Flex align="center" ml={6}>
                      {achievement.completed ? <Icon as={CheckCircle2} color="green.400" boxSize={7} /> : <Button size="sm" colorScheme="blue" variant="solid" fontWeight="medium" px={6} borderRadius="full" bgGradient="linear(to-r, blue.400, blue.500)" _hover={{
                  bgGradient: 'linear(to-r, blue.500, blue.600)',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 4px 8px rgba(66, 153, 225, 0.4)'
                }} transition="all 0.2s">
                          Configurar
                        </Button>}
                    </Flex>
                  </Flex>
                </Box>)}
            </VStack>
            {/* Action Button */}
            {progressPercentage < 100 && <Button colorScheme="blue" size="lg" width="full" rightIcon={<Zap size={20} />} py={6} fontSize="md" fontWeight="semibold" borderRadius="2xl" bgGradient="linear(to-r, blue.400, blue.500)" _hover={{
          bgGradient: 'linear(to-r, blue.500, blue.600)',
          transform: 'translateY(-2px)',
          boxShadow: '0 8px 16px rgba(66, 153, 225, 0.4)'
        }} transition="all 0.2s">
                Continuar Configuración
              </Button>}
            {progressPercentage === 100 && <Box bg="#0a1929" p={8} borderRadius="2xl" textAlign="center" borderLeft="4px solid" borderColor="green.400" border="1px solid" borderLeftWidth="4px" boxShadow="0 0 20px rgba(72, 187, 120, 0.2)">
                <Flex align="center" justify="center" mb={3}>
                  <Icon as={CheckCircle} color="green.400" boxSize={10} mr={3} />
                  <Text fontSize="2xl" fontWeight="bold" color="white">
                    ¡Setup Completado! 🎉
                  </Text>
                </Flex>
                <Text fontSize="md" color="whiteAlpha.600" mb={6} lineHeight="tall">
                  Has completado todos los logros fundacionales. Tu sistema está
                  listo para operar.
                </Text>
                <Button colorScheme="green" size="md" fontWeight="medium" px={8} borderRadius="full" bgGradient="linear(to-r, green.400, green.500)" _hover={{
            bgGradient: 'linear(to-r, green.500, green.600)',
            transform: 'translateY(-2px)',
            boxShadow: '0 4px 8px rgba(72, 187, 120, 0.4)'
          }} transition="all 0.2s">
                  Ver Logros Avanzados
                </Button>
              </Box>}
          </VStack>}
      </Box>
    </Box>;
};