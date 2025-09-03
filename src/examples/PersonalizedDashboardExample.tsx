/**
 * EJEMPLO: Dashboard personalizado usando el sistema de capacidades
 * Este archivo muestra cómo implementar personalización completa
 */

import React from 'react';
import {
  ContentLayout,
  Section,
  PageHeader,
  Stack,
  Typography,
  Badge,
  StatsSection,
  CardGrid,
  MetricCard
} from '@/shared/ui';
import { 
  CapabilityGate, 
  PhysicalPresenceGate,
  DeliveryGate,
  OnlineStoreGate,
  SchedulingGate 
} from '@/components/personalization/CapabilityGate';
import { usePersonalizedDashboard } from '@/hooks/usePersonalizedExperience';

export function PersonalizedDashboardExample() {
  const { widgets, layout, tier, stats } = usePersonalizedDashboard();

  return (
    <ContentLayout spacing="normal">
      <Stack gap="lg">
        
        {/* Header personalizado con tier */}
        <PageHeader
          title="📊 Dashboard"
          subtitle={`${tier} - ${stats.activeCapabilities} capacidades activas`}
          actions={
            <Badge variant="outline" colorScheme="blue">
              {stats.totalModules} módulos disponibles
            </Badge>
          }
        />

        {/* Métricas principales - siempre visibles */}
        <StatsSection>
          <CardGrid columns={{ base: 2, md: 4 }} gap="md">
            <MetricCard
              title="Ingresos del Mes"
              value="$125,350"
              change="+12.5%"
              icon="💰"
            />
            <MetricCard
              title="Productos Activos"
              value="248"
              change="+8"
              icon="📦"
            />
            
            {/* Métricas condicionales por capacidad */}
            <PhysicalPresenceGate>
              <MetricCard
                title="Ventas Locales"
                value="$89,240"
                change="+15.2%"
                icon="🏪"
              />
            </PhysicalPresenceGate>
            
            <OnlineStoreGate>
              <MetricCard
                title="Pedidos Online"
                value="156"
                change="+22%"
                icon="🛒"
              />
            </OnlineStoreGate>
          </CardGrid>
        </StatsSection>

        {/* Secciones específicas por capacidad */}
        <CardGrid columns={{ base: 1, lg: layout === 'advanced' ? 3 : 2 }} gap="lg">
          
          {/* Sección de Ventas Locales */}
          <PhysicalPresenceGate>
            <Section variant="elevated" title="🏪 Ventas Locales">
              <Stack gap="md">
                <Typography variant="muted">
                  Rendimiento de tu local físico hoy
                </Typography>
                
                <Stack gap="sm">
                  <Stack direction="row" justify="space-between">
                    <Typography fontSize="sm">Mesas ocupadas</Typography>
                    <Badge variant="solid">8/12</Badge>
                  </Stack>
                  <Stack direction="row" justify="space-between">
                    <Typography fontSize="sm">Promedio por mesa</Typography>
                    <Typography fontSize="sm" fontWeight="medium">$2,350</Typography>
                  </Stack>
                  <Stack direction="row" justify="space-between">
                    <Typography fontSize="sm">Tiempo promedio</Typography>
                    <Typography fontSize="sm">45 min</Typography>
                  </Stack>
                </Stack>
                
                {/* Funcionalidad avanzada solo para tier alto */}
                <CapabilityGate minTier="Estructura Funcional">
                  <Typography fontSize="xs" color="green.600">
                    💡 Sugerencia: Mesa 5 libre desde hace 20min, ideal para grupo de 4
                  </Typography>
                </CapabilityGate>
              </Stack>
            </Section>
          </PhysicalPresenceGate>

          {/* Sección de Entregas */}
          <DeliveryGate>
            <Section variant="elevated" title="🚚 Estado de Entregas">
              <Stack gap="md">
                <Typography variant="muted">
                  Entregas del día en curso
                </Typography>
                
                <Stack gap="sm">
                  <Stack direction="row" justify="space-between">
                    <Typography fontSize="sm">Pendientes</Typography>
                    <Badge variant="outline" colorScheme="orange">12</Badge>
                  </Stack>
                  <Stack direction="row" justify="space-between">
                    <Typography fontSize="sm">En camino</Typography>
                    <Badge variant="outline" colorScheme="blue">5</Badge>
                  </Stack>
                  <Stack direction="row" justify="space-between">
                    <Typography fontSize="sm">Entregadas</Typography>
                    <Badge variant="outline" colorScheme="green">89</Badge>
                  </Stack>
                </Stack>

                <CapabilityGate minTier="Negocio Integrado">
                  <Typography fontSize="xs" color="blue.600">
                    🗺️ Ruta optimizada disponible - ahorra 15min por delivery
                  </Typography>
                </CapabilityGate>
              </Stack>
            </Section>
          </DeliveryGate>

          {/* Sección de Tienda Online */}
          <OnlineStoreGate>
            <Section variant="elevated" title="🛒 Tienda Online">
              <Stack gap="md">
                <Typography variant="muted">
                  Performance de tu e-commerce
                </Typography>
                
                <Stack gap="sm">
                  <Stack direction="row" justify="space-between">
                    <Typography fontSize="sm">Visitantes únicos</Typography>
                    <Typography fontSize="sm" fontWeight="medium">1,247</Typography>
                  </Stack>
                  <Stack direction="row" justify="space-between">
                    <Typography fontSize="sm">Conversión</Typography>
                    <Badge variant="solid" colorScheme="green">3.2%</Badge>
                  </Stack>
                  <Stack direction="row" justify="space-between">
                    <Typography fontSize="sm">Carrito promedio</Typography>
                    <Typography fontSize="sm" fontWeight="medium">$1,850</Typography>
                  </Stack>
                </Stack>
              </Stack>
            </Section>
          </OnlineStoreGate>

          {/* Sección de Turnos */}
          <SchedulingGate>
            <Section variant="elevated" title="📅 Agenda del Día">
              <Stack gap="md">
                <Typography variant="muted">
                  Citas y turnos programados
                </Typography>
                
                <Stack gap="sm">
                  <Stack direction="row" justify="space-between">
                    <Typography fontSize="sm">Próxima cita</Typography>
                    <Typography fontSize="sm" fontWeight="medium">14:30 - Juan P.</Typography>
                  </Stack>
                  <Stack direction="row" justify="space-between">
                    <Typography fontSize="sm">Ocupación hoy</Typography>
                    <Badge variant="solid">18/24</Badge>
                  </Stack>
                  <Stack direction="row" justify="space-between">
                    <Typography fontSize="sm">Tiempo libre</Typography>
                    <Typography fontSize="sm">16:00 - 17:30</Typography>
                  </Stack>
                </Stack>
              </Stack>
            </Section>
          </SchedulingGate>
        </CardGrid>

        {/* Sección combinada - requiere múltiples capacidades */}
        <CapabilityGate 
          requiresAll={['has_physical_presence', 'has_online_store']}
          showReason={true}
          fallback={
            <Section variant="outline" title="🔗 Integración Omnicanal">
              <Typography variant="muted" textAlign="center">
                Activa tanto "Venta Local" como "Tienda Online" para ver métricas integradas
              </Typography>
            </Section>
          }
        >
          <Section variant="elevated" title="🔗 Integración Omnicanal">
            <Stack gap="md">
              <Typography variant="muted">
                Sincronización entre tu local y tienda online
              </Typography>
              
              <CardGrid columns={{ base: 1, md: 2 }} gap="md">
                <Stack gap="sm">
                  <Typography fontSize="sm" fontWeight="medium">Stock Sincronizado</Typography>
                  <Typography fontSize="xs" color="green.600">✅ 248/248 productos</Typography>
                </Stack>
                <Stack gap="sm">
                  <Typography fontSize="sm" fontWeight="medium">Precios Actualizados</Typography>
                  <Typography fontSize="xs" color="green.600">✅ Hace 5 minutos</Typography>
                </Stack>
              </CardGrid>
            </Stack>
          </Section>
        </CapabilityGate>

        {/* Información del sistema para debugging */}
        <CapabilityGate minTier="Sistema Consolidado">
          <Section variant="flat" title="🔧 Información del Sistema">
            <Stack gap="xs" fontSize="xs" color="gray.600">
              <Typography>Tier: {tier}</Typography>
              <Typography>Widgets activos: {widgets.length}</Typography>
              <Typography>Layout: {layout}</Typography>
              <Typography>Features disponibles: {stats.activeCapabilities} capacidades</Typography>
            </Stack>
          </Section>
        </CapabilityGate>
      </Stack>
    </ContentLayout>
  );
}

// Ejemplo de uso en navegación personalizada
export function PersonalizedNavigationExample() {
  return (
    <nav>
      {/* Elementos base siempre visibles */}
      <a href="/admin">Dashboard</a>
      <a href="/admin/materials">Materiales</a>
      <a href="/admin/products">Productos</a>
      
      {/* Elementos condicionales por capacidad */}
      <PhysicalPresenceGate>
        <a href="/admin/sales">Ventas</a>
        <a href="/admin/tables">Mesas</a>
      </PhysicalPresenceGate>
      
      <DeliveryGate>
        <a href="/admin/delivery">Entregas</a>
      </DeliveryGate>
      
      <OnlineStoreGate>
        <a href="/admin/ecommerce">Tienda Online</a>
      </OnlineStoreGate>
      
      <SchedulingGate>
        <a href="/admin/scheduling">Turnos</a>
        <a href="/admin/staff">Personal</a>
      </SchedulingGate>
    </nav>
  );
}