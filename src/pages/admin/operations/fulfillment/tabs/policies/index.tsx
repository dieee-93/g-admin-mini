/**
 * FULFILLMENT POLICIES TAB
 * 
 * Configure delivery, pickup, and fulfillment operational settings
 * Migrated from /admin/settings/fulfillment/policies to Fulfillment module tab
 */

import { Card, Stack, HStack, Badge, Switch, Button, Icon } from '@/shared/ui';
import { useState } from 'react';
import { useSystemFulfillmentPolicies, useToggleDelivery, useTogglePickup, useToggleAutoAssignDrivers, useToggleTips, useToggleServiceCharge, useToggleOrderTracking } from '@/hooks/useFulfillmentPolicies';
import { FulfillmentPoliciesFormModal } from './components/FulfillmentPoliciesFormModal';
import { TruckIcon, ShoppingBagIcon, MapPinIcon, BanknotesIcon, ClockIcon, UserGroupIcon, PencilSquareIcon } from '@heroicons/react/24/outline';
import { DecimalUtils } from '@/lib/decimal';

export function PoliciesTab() {
  const { data: policies, isLoading, error } = useSystemFulfillmentPolicies();
  const toggleDelivery = useToggleDelivery();
  const togglePickup = useTogglePickup();
  const toggleAutoAssignDrivers = useToggleAutoAssignDrivers();
  const toggleTips = useToggleTips();
  const toggleServiceCharge = useToggleServiceCharge();
  const toggleOrderTracking = useToggleOrderTracking();

  const [isModalOpen, setIsModalOpen] = useState(false);

  if (isLoading) {
    return (
      <div style={{ padding: '48px', textAlign: 'center' }}>
        Cargando configuración...
      </div>
    );
  }

  if (error || !policies) {
    return (
      <div style={{ padding: '48px', textAlign: 'center', color: 'var(--colors-red-500)' }}>
        Error al cargar configuración
      </div>
    );
  }

  const handleToggleDelivery = () => {
    toggleDelivery.mutate({ id: policies.id, enabled: !policies.delivery_enabled });
  };

  const handleTogglePickup = () => {
    togglePickup.mutate({ id: policies.id, enabled: !policies.pickup_enabled });
  };

  const handleToggleAutoAssignDrivers = () => {
    toggleAutoAssignDrivers.mutate({ id: policies.id, enabled: !policies.auto_assign_drivers });
  };

  const handleToggleTips = () => {
    toggleTips.mutate({ id: policies.id, enabled: !policies.tips_enabled });
  };

  const handleToggleServiceCharge = () => {
    toggleServiceCharge.mutate({ id: policies.id, enabled: !policies.service_charge_enabled });
  };

  const handleToggleOrderTracking = () => {
    toggleOrderTracking.mutate({ id: policies.id, enabled: !policies.order_tracking_enabled });
  };

  return (
    <Stack gap="6" p="6">
      <HStack justify="space-between" align="center">
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '4px' }}>
            Políticas de Fulfillment
          </h2>
          <p style={{ fontSize: '0.875rem', color: 'var(--colors-gray-600)' }}>
            Configura las políticas operacionales para delivery, pickup y cumplimiento de pedidos
          </p>
        </div>
        <Button onClick={() => setIsModalOpen(true)} variant="solid" colorPalette="purple">
          <Icon icon={PencilSquareIcon} />
          Editar Políticas
        </Button>
      </HStack>

      {/* Delivery Configuration */}
      <div>
        <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '12px' }}>
          Configuración de Delivery
        </h3>
        <Stack gap="4">
          <Card p="6">
            <HStack justify="space-between">
              <HStack gap="3">
                <Icon icon={TruckIcon} size="lg" color="purple.500" />
                <Stack gap="1">
                  <strong>Habilitar Delivery</strong>
                  <span style={{ fontSize: '0.9rem', color: 'var(--colors-gray-600)' }}>
                    Permitir entregas a domicilio
                  </span>
                </Stack>
              </HStack>
              <Switch
                checked={policies.delivery_enabled}
                onCheckedChange={handleToggleDelivery}
                disabled={toggleDelivery.isPending}
              />
            </HStack>
          </Card>

          {policies.delivery_enabled && (
            <>
              <Card p="6">
                <Stack gap="3">
                  <HStack justify="space-between">
                    <strong>Tarifa de Delivery por Defecto</strong>
                    <Badge colorPalette="green" size="lg">
                      {DecimalUtils.formatCurrency(DecimalUtils.fromValue(policies.default_delivery_fee, 'currency'))}
                    </Badge>
                  </HStack>
                  <HStack justify="space-between">
                    <strong>Delivery Gratis desde</strong>
                    <Badge colorPalette="blue" size="lg">
                      {DecimalUtils.formatCurrency(DecimalUtils.fromValue(policies.free_delivery_threshold, 'currency'))}
                    </Badge>
                  </HStack>
                  <HStack justify="space-between">
                    <strong>Pedido Mínimo para Delivery</strong>
                    <Badge colorPalette="purple" size="lg">
                      {DecimalUtils.formatCurrency(DecimalUtils.fromValue(policies.min_order_delivery, 'currency'))}
                    </Badge>
                  </HStack>
                </Stack>
              </Card>

              <Card p="6">
                <Stack gap="3">
                  <strong>Zonas de Delivery Configuradas</strong>
                  <Stack gap="2">
                    {policies.delivery_zones.map((zone) => (
                      <HStack key={zone.id} justify="space-between" p="3" style={{ borderRadius: '8px', backgroundColor: 'var(--colors-gray-50)' }}>
                        <HStack gap="2">
                          <Icon icon={MapPinIcon} size="sm" color="purple.500" />
                          <span>{zone.name}</span>
                          <Badge colorPalette="gray" size="sm">{zone.radius_km}km</Badge>
                        </HStack>
                        <HStack gap="2">
                          <Badge colorPalette="green">{DecimalUtils.formatCurrency(DecimalUtils.fromValue(zone.fee, 'currency'))}</Badge>
                          <Badge colorPalette="purple">Min: {DecimalUtils.formatCurrency(DecimalUtils.fromValue(zone.min_order, 'currency'))}</Badge>
                        </HStack>
                      </HStack>
                    ))}
                  </Stack>
                </Stack>
              </Card>
            </>
          )}
        </Stack>
      </div>

      {/* Pickup Configuration */}
      <div>
        <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '12px' }}>
          Configuración de Pickup
        </h3>
        <Stack gap="4">
          <Card p="6">
            <HStack justify="space-between">
              <HStack gap="3">
                <Icon icon={ShoppingBagIcon} size="lg" color="blue.500" />
                <Stack gap="1">
                  <strong>Habilitar Pickup</strong>
                  <span style={{ fontSize: '0.9rem', color: 'var(--colors-gray-600)' }}>
                    Permitir retiro en local
                  </span>
                </Stack>
              </HStack>
              <Switch
                checked={policies.pickup_enabled}
                onCheckedChange={handleTogglePickup}
                disabled={togglePickup.isPending}
              />
            </HStack>
          </Card>

          {policies.pickup_enabled && (
            <Card p="6">
              <Stack gap="3">
                <HStack justify="space-between">
                  <strong>Descuento por Pickup</strong>
                  <Badge colorPalette="green" size="lg">{policies.pickup_discount_percent}%</Badge>
                </HStack>
                <HStack justify="space-between">
                  <strong>Tiempo de Preparación</strong>
                  <Badge colorPalette="blue" size="lg">{policies.pickup_ready_time_minutes} min</Badge>
                </HStack>
                <HStack justify="space-between">
                  <strong>Pedido Mínimo para Pickup</strong>
                  <Badge colorPalette="purple" size="lg">
                    {DecimalUtils.formatCurrency(DecimalUtils.fromValue(policies.min_order_pickup, 'currency'))}
                  </Badge>
                </HStack>
              </Stack>
            </Card>
          )}
        </Stack>
      </div>

      {/* Order Processing */}
      <div>
        <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '12px' }}>
          Procesamiento de Pedidos
        </h3>
        <Card p="6">
          <Stack gap="3">
            <HStack justify="space-between">
              <strong>Confirmación Manual Requerida</strong>
              <Badge colorPalette={policies.order_confirmation_required ? 'orange' : 'gray'}>
                {policies.order_confirmation_required ? 'Sí' : 'No'}
              </Badge>
            </HStack>
            <HStack justify="space-between">
              <strong>Aceptar Pedidos Automáticamente</strong>
              <Badge colorPalette={policies.auto_accept_orders ? 'green' : 'gray'}>
                {policies.auto_accept_orders ? 'Sí' : 'No'}
              </Badge>
            </HStack>
            <HStack justify="space-between">
              <strong>Timeout de Aceptación</strong>
              <Badge colorPalette="red" size="lg">{policies.order_acceptance_timeout_minutes} min</Badge>
            </HStack>
          </Stack>
        </Card>
      </div>

      {/* Fulfillment Times */}
      <div>
        <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '12px' }}>
          Tiempos de Fulfillment
        </h3>
        <Card p="6">
          <Stack gap="3">
            <HStack justify="space-between">
              <HStack gap="2">
                <Icon icon={ClockIcon} size="sm" color="purple.500" />
                <strong>Tiempo de Preparación Estimado</strong>
              </HStack>
              <Badge colorPalette="blue" size="lg">{policies.estimated_prep_time_minutes} min</Badge>
            </HStack>
            <HStack justify="space-between">
              <HStack gap="2">
                <Icon icon={TruckIcon} size="sm" color="purple.500" />
                <strong>Tiempo de Delivery Estimado</strong>
              </HStack>
              <Badge colorPalette="green" size="lg">{policies.estimated_delivery_time_minutes} min</Badge>
            </HStack>
            <HStack justify="space-between">
              <strong>Pedidos con Anticipación (Máx.)</strong>
              <Badge colorPalette="purple" size="lg">{policies.max_advance_order_days} días</Badge>
            </HStack>
          </Stack>
        </Card>
      </div>

      {/* Driver Management */}
      <div>
        <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '12px' }}>
          Gestión de Conductores
        </h3>
        <Stack gap="4">
          <Card p="6">
            <HStack justify="space-between">
              <HStack gap="3">
                <Icon icon={UserGroupIcon} size="lg" color="green.500" />
                <Stack gap="1">
                  <strong>Asignación Automática de Conductores</strong>
                  <span style={{ fontSize: '0.9rem', color: 'var(--colors-gray-600)' }}>
                    Asignar pedidos automáticamente al conductor más cercano
                  </span>
                </Stack>
              </HStack>
              <Switch
                checked={policies.auto_assign_drivers}
                onCheckedChange={handleToggleAutoAssignDrivers}
                disabled={toggleAutoAssignDrivers.isPending}
              />
            </HStack>
          </Card>

          {policies.auto_assign_drivers && (
            <Card p="6">
              <Stack gap="3">
                <HStack justify="space-between">
                  <strong>Radio de Asignación</strong>
                  <Badge colorPalette="blue" size="lg">{policies.driver_assignment_radius_km}km</Badge>
                </HStack>
                <HStack justify="space-between">
                  <strong>Entregas Simultáneas por Conductor</strong>
                  <Badge colorPalette="purple" size="lg">{policies.max_concurrent_deliveries_per_driver}</Badge>
                </HStack>
              </Stack>
            </Card>
          )}
        </Stack>
      </div>

      {/* Returns & Cancellations */}
      <div>
        <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '12px' }}>
          Devoluciones y Cancelaciones
        </h3>
        <Card p="6">
          <Stack gap="3">
            <HStack justify="space-between">
              <strong>Permitir Cancelaciones</strong>
              <Badge colorPalette={policies.cancellation_allowed ? 'green' : 'red'}>
                {policies.cancellation_allowed ? 'Sí' : 'No'}
              </Badge>
            </HStack>
            {policies.cancellation_allowed && (
              <HStack justify="space-between">
                <strong>Límite de Cancelación</strong>
                <Badge colorPalette="orange" size="lg">{policies.cancellation_deadline_minutes} min después del pedido</Badge>
              </HStack>
            )}
            <HStack justify="space-between">
              <strong>Política de Reembolsos Habilitada</strong>
              <Badge colorPalette={policies.refund_policy_enabled ? 'green' : 'gray'}>
                {policies.refund_policy_enabled ? 'Sí' : 'No'}
              </Badge>
            </HStack>
            {policies.refund_policy_enabled && (
              <HStack justify="space-between">
                <strong>Días para Procesar Reembolso</strong>
                <Badge colorPalette="blue" size="lg">{policies.refund_processing_days} días</Badge>
              </HStack>
            )}
          </Stack>
        </Card>
      </div>

      {/* Tips & Service Charges */}
      <div>
        <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '12px' }}>
          Propinas y Cargos por Servicio
        </h3>
        <Stack gap="4">
          <Card p="6">
            <HStack justify="space-between">
              <HStack gap="3">
                <Icon icon={BanknotesIcon} size="lg" color="yellow.500" />
                <Stack gap="1">
                  <strong>Habilitar Propinas</strong>
                  <span style={{ fontSize: '0.9rem', color: 'var(--colors-gray-600)' }}>
                    Permitir que clientes dejen propina
                  </span>
                </Stack>
              </HStack>
              <Switch
                checked={policies.tips_enabled}
                onCheckedChange={handleToggleTips}
                disabled={toggleTips.isPending}
              />
            </HStack>
          </Card>

          {policies.tips_enabled && (
            <Card p="6">
              <Stack gap="2">
                <strong>Sugerencias de Propina</strong>
                <HStack gap="2">
                  {policies.suggested_tip_percentages.map((percentage) => (
                    <Badge key={percentage} colorPalette="yellow" size="lg">
                      {percentage}%
                    </Badge>
                  ))}
                </HStack>
              </Stack>
            </Card>
          )}

          <Card p="6">
            <HStack justify="space-between">
              <HStack gap="3">
                <Icon icon={BanknotesIcon} size="lg" color="purple.500" />
                <Stack gap="1">
                  <strong>Cargo por Servicio</strong>
                  <span style={{ fontSize: '0.9rem', color: 'var(--colors-gray-600)' }}>
                    Cargo obligatorio adicional al subtotal
                  </span>
                </Stack>
              </HStack>
              <Switch
                checked={policies.service_charge_enabled}
                onCheckedChange={handleToggleServiceCharge}
                disabled={toggleServiceCharge.isPending}
              />
            </HStack>
          </Card>

          {policies.service_charge_enabled && (
            <Card p="6">
              <HStack justify="space-between">
                <strong>Porcentaje de Cargo por Servicio</strong>
                <Badge colorPalette="purple" size="lg">{policies.service_charge_percent}%</Badge>
              </HStack>
            </Card>
          )}
        </Stack>
      </div>

      {/* Tracking & Notifications */}
      <div>
        <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '12px' }}>
          Seguimiento y Notificaciones
        </h3>
        <Stack gap="4">
          <Card p="6">
            <HStack justify="space-between">
              <Stack gap="1">
                <strong>Seguimiento de Pedidos Habilitado</strong>
                <span style={{ fontSize: '0.9rem', color: 'var(--colors-gray-600)' }}>
                  Permitir que clientes rastreen sus pedidos en tiempo real
                </span>
              </Stack>
              <Switch
                checked={policies.order_tracking_enabled}
                onCheckedChange={handleToggleOrderTracking}
                disabled={toggleOrderTracking.isPending}
              />
            </HStack>
          </Card>

          <Card p="6">
            <Stack gap="3">
              <HStack justify="space-between">
                <strong>Contacto del Cliente Requerido</strong>
                <Badge colorPalette={policies.customer_contact_required ? 'orange' : 'gray'}>
                  {policies.customer_contact_required ? 'Sí' : 'No'}
                </Badge>
              </HStack>
              <HStack justify="space-between">
                <strong>Notificaciones de Delivery</strong>
                <Badge colorPalette={policies.delivery_notifications_enabled ? 'green' : 'gray'}>
                  {policies.delivery_notifications_enabled ? 'Habilitadas' : 'Deshabilitadas'}
                </Badge>
              </HStack>
            </Stack>
          </Card>
        </Stack>
      </div>

      <FulfillmentPoliciesFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        policy={policies}
      />
    </Stack>
  );
}
