import React, { useState } from 'react';
import { Box, Grid, GridItem, Heading, Text, Flex, Button, Icon, Tabs, TabList, TabPanels, Tab, TabPanel } from '@chakra-ui/react';
import { Layout } from '../layout/Layout';
import { StatCard } from '../widgets/StatCard';
import { InsightCard } from '../widgets/InsightCard';
import { AlertsSetupSection } from './AlertsSetupSection';
import { OperationalStatusWidget } from './OperationalStatusWidget';
import { QuickActionsWidget } from './QuickActionsWidget';
import { ActivityFeedWidget } from './ActivityFeedWidget';
import { SmartAlertsBar } from './SmartAlertsBar';
import { SalesTrendChart } from './charts/SalesTrendChart';
import { RevenueAreaChart } from './charts/RevenueAreaChart';
import { MetricsBarChart } from './charts/MetricsBarChart';
import { DistributionChart } from './charts/DistributionChart';
import { BarChart2, CheckCircle, Clock, Database, DollarSign, LineChart, Network, Users, ArrowUpRight, TrendingUp, Activity, LayoutDashboard } from 'lucide-react';
export const Dashboard = () => {
  const [isOpen, setIsOpen] = useState(true);
  const [alerts, setAlerts] = useState([{
    id: '1',
    title: 'Stock Crítico',
    severity: 'warning' as const,
    message: 'Material XYZ tiene solo 5 unidades disponibles',
    action: {
      label: 'Ordenar Ahora',
      onClick: () => console.log('Navigate to orders')
    }
  }]);
  const handleDismissAlert = (id: string) => {
    setAlerts(alerts.filter(alert => alert.id !== id));
  };
  return <Layout>
      {/* Hero: Operational Status */}
      <Box mb={6}>
        <OperationalStatusWidget isOpen={isOpen} currentShift="Turno Mañana" activeStaff={6} totalStaff={9} openTime="09:00" closeTime="21:00" operatingHours={4.5} alerts={alerts.length} onToggleStatus={() => setIsOpen(!isOpen)} />
      </Box>
      {/* Smart Alerts Bar (only if alerts exist) */}
      <SmartAlertsBar alerts={alerts} onDismiss={handleDismissAlert} />
      {/* Setup Progress (collapsible) */}
      <AlertsSetupSection />
      {/* Main Tabs */}
      <Tabs colorScheme="blue" variant="soft-rounded">
        <TabList bg="#152a47" p={2} borderRadius="2xl" mb={6} overflowX="auto" css={{
        '&::-webkit-scrollbar': {
          height: '6px'
        },
        '&::-webkit-scrollbar-thumb': {
          background: 'rgba(255, 255, 255, 0.2)',
          borderRadius: '10px'
        }
      }}>
          <Tab fontWeight="semibold" _selected={{
          bg: 'blue.400',
          color: 'white'
        }}>
            <Icon as={LayoutDashboard} mr={2} boxSize={4} />
            Overview
          </Tab>
          <Tab fontWeight="semibold" _selected={{
          bg: 'blue.400',
          color: 'white'
        }}>
            <Icon as={TrendingUp} mr={2} boxSize={4} />
            Analytics
          </Tab>
          <Tab fontWeight="semibold" _selected={{
          bg: 'blue.400',
          color: 'white'
        }}>
            <Icon as={Activity} mr={2} boxSize={4} />
            Operaciones
          </Tab>
          <Tab fontWeight="semibold" _selected={{
          bg: 'blue.400',
          color: 'white'
        }}>
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
              <Text fontSize="sm" fontWeight="bold" color="whiteAlpha.600" mb={4} letterSpacing="wider">
                MÉTRICAS PRINCIPALES
              </Text>
              <Grid templateColumns="repeat(12, 1fr)" gap={6}>
                <GridItem colSpan={{
                base: 12,
                md: 6,
                lg: 3
              }}>
                  <StatCard title="Revenue Hoy" value="$12,450" icon={<Icon as={DollarSign} boxSize={5} />} accentColor="green.400" trend={{
                  value: '+12.5%',
                  isPositive: true
                }} footer="vs ayer" />
                </GridItem>
                <GridItem colSpan={{
                base: 12,
                md: 6,
                lg: 3
              }}>
                  <StatCard title="Ventas Hoy" value="47" icon={<Icon as={LineChart} boxSize={5} />} accentColor="blue.400" trend={{
                  value: '+8.2%',
                  isPositive: true
                }} footer="vs ayer" />
                </GridItem>
                <GridItem colSpan={{
                base: 12,
                md: 6,
                lg: 3
              }}>
                  <StatCard title="Staff Activo" value="6/9" icon={<Icon as={Users} boxSize={5} />} accentColor="purple.400" footer="Performance" footerValue="94%" />
                </GridItem>
                <GridItem colSpan={{
                base: 12,
                md: 6,
                lg: 3
              }}>
                  <StatCard title="Órdenes Pendientes" value="12" icon={<Icon as={Database} boxSize={5} />} accentColor="orange.400" footer="En proceso" />
                </GridItem>
              </Grid>
            </Box>
            {/* Charts Preview */}
            <Box mb={8}>
              <Text fontSize="sm" fontWeight="bold" color="whiteAlpha.600" mb={4} letterSpacing="wider">
                TENDENCIAS
              </Text>
              <Grid templateColumns="repeat(12, 1fr)" gap={6}>
                <GridItem colSpan={{
                base: 12,
                lg: 8
              }}>
                  <SalesTrendChart />
                </GridItem>
                <GridItem colSpan={{
                base: 12,
                lg: 4
              }}>
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
                <Button colorScheme="purple" size="sm" rightIcon={<ArrowUpRight size={16} />} fontWeight="medium" px={6}>
                  Ver Todos
                </Button>
              </Flex>
              <Grid templateColumns="repeat(12, 1fr)" gap={6}>
                <GridItem colSpan={{
                base: 12,
                md: 6
              }}>
                  <InsightCard title="Clientes Premium generan 68% del Revenue" description="Los clientes con membresías activas tienen 3.2x mayor valor promedio" metric="+$180K" metricLabel="potencial anual" tags={['CRM', 'Memberships', 'Sales']} actionLabel="Ver Detalles" icon={<LineChart size={18} />} />
                </GridItem>
                <GridItem colSpan={{
                base: 12,
                md: 6
              }}>
                  <InsightCard title="Stock bajo en 3 materiales críticos" description="Se necesita reabastecimiento urgente para mantener producción" metric="15 días" metricLabel="hasta desabastecimiento" tags={['Inventory', 'Production']} actionLabel="Ordenar Ahora" icon={<BarChart2 size={18} />} positive={false} />
                </GridItem>
              </Grid>
            </Box>
          </TabPanel>
          {/* Tab 2: Analytics */}
          <TabPanel p={0}>
            <Grid templateColumns="repeat(12, 1fr)" gap={6}>
              {/* Sales Trend */}
              <GridItem colSpan={{
              base: 12,
              lg: 8
            }}>
                <SalesTrendChart />
              </GridItem>
              {/* Distribution */}
              <GridItem colSpan={{
              base: 12,
              lg: 4
            }}>
                <DistributionChart />
              </GridItem>
              {/* Revenue Area */}
              <GridItem colSpan={{
              base: 12,
              lg: 7
            }}>
                <RevenueAreaChart />
              </GridItem>
              {/* Metrics Bar */}
              <GridItem colSpan={{
              base: 12,
              lg: 5
            }}>
                <MetricsBarChart />
              </GridItem>
            </Grid>
          </TabPanel>
          {/* Tab 3: Operations */}
          <TabPanel p={0}>
            <Grid templateColumns="repeat(12, 1fr)" gap={6}>
              <GridItem colSpan={{
              base: 12,
              md: 6,
              lg: 4
            }}>
                <StatCard title="Módulos Integrados" value="23" subtitle="Sistema completo" icon={<Icon as={CheckCircle} boxSize={5} />} accentColor="green.400" />
              </GridItem>
              <GridItem colSpan={{
              base: 12,
              md: 6,
              lg: 4
            }}>
                <StatCard title="Conexiones Activas" value="18" subtitle="En tiempo real" icon={<Icon as={Network} boxSize={5} />} accentColor="blue.400" />
              </GridItem>
              <GridItem colSpan={{
              base: 12,
              md: 6,
              lg: 4
            }}>
                <StatCard title="Última Sincronización" value="2 min ago" subtitle="Todos los módulos" icon={<Icon as={Clock} boxSize={5} />} accentColor="blue.400" />
              </GridItem>
            </Grid>
          </TabPanel>
          {/* Tab 4: Activity */}
          <TabPanel p={0}>
            <ActivityFeedWidget />
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Layout>;
};