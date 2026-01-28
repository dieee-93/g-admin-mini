/**
 * Payment Methods Tab - Finance Integrations Module
 * PHASE 5: High Cohesion v3.0 Migration
 * 
 * Configuration for payment methods available in the system.
 * 10 config fields: cash, credit card, debit card, transfer, etc.
 * 
 * Architecture: Module Internal Config (not Settings)
 * Reason: Finance-Integrations is the module owner (Finance Bounded Context)
 */

import React, { useState } from 'react';
import {
  Section,
  Stack,
  Button,
  Table,
  Badge,
  Alert,
  SimpleGrid,
  CardWrapper,
  Switch,
} from '@/shared/ui';
import { Icon } from '@/shared/ui';
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  CheckCircleIcon,
  XCircleIcon,
  CreditCardIcon,
  BanknotesIcon,
  BuildingLibraryIcon,
} from '@heroicons/react/24/outline';
import { usePaymentMethods, useUpdatePaymentMethod, useDeletePaymentMethod } from '@/modules/finance-integrations/hooks/usePayments';
import { PaymentMethodFormModal } from './components/PaymentMethodFormModal';
import { logger } from '@/lib/logging';

export function PaymentMethodsTab() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState<any>(null);

  // TanStack Query hooks
  const { data: methods, isLoading } = usePaymentMethods();
  const updateMethodMutation = useUpdatePaymentMethod();
  const deleteMethodMutation = useDeletePaymentMethod();

  // Handlers
  const handleCreate = () => {
    setSelectedMethod(null);
    setIsModalOpen(true);
  };

  const handleEdit = (method: any) => {
    setSelectedMethod(method);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('¿Estás seguro de eliminar este método de pago?')) {
      try {
        await deleteMethodMutation.mutateAsync(id);
        logger.info('PaymentMethodsTab', 'Payment method deleted', { id });
      } catch (error) {
        logger.error('PaymentMethodsTab', 'Failed to delete payment method', error);
      }
    }
  };

  const handleToggleActive = async (id: string, currentActive: boolean) => {
    try {
      await updateMethodMutation.mutateAsync({
        id,
        updates: { is_active: !currentActive }
      });
      logger.info('PaymentMethodsTab', 'Payment method toggled', { id, newState: !currentActive });
    } catch (error) {
      logger.error('PaymentMethodsTab', 'Failed to toggle payment method', error);
    }
  };

  // Stats calculation
  const stats = React.useMemo(() => {
    if (!methods) return { total: 0, active: 0, inactive: 0 };
    return {
      total: methods.length,
      active: methods.filter(m => m.is_active).length,
      inactive: methods.filter(m => !m.is_active).length,
    };
  }, [methods]);

  // Table columns
  const columns = [
    {
      header: 'Método',
      cell: (method: any) => (
        <Stack direction="row" gap="sm" align="center">
          {method.icon && <span style={{ fontSize: '20px' }}>{method.icon}</span>}
          {!method.icon && <Icon as={getMethodIcon(method.code)} />}
          <Stack gap="0">
            <strong>{method.display_name || method.name}</strong>
            <small style={{ color: 'var(--colors-gray-600)' }}>{method.code}</small>
          </Stack>
        </Stack>
      ),
    },
    {
      header: 'Descripción',
      cell: (method: any) => method.description || '-',
    },
    {
      header: 'Gateway',
      cell: (method: any) => (
        method.requires_gateway ? (
          <Badge colorPalette={method.gateway_id ? 'green' : 'yellow'}>
            {method.gateway_id ? 'Asignado' : 'Requerido'}
          </Badge>
        ) : (
          <Badge colorPalette="gray">No requiere</Badge>
        )
      ),
    },
    {
      header: 'Orden',
      cell: (method: any) => method.sort_order ?? '-',
    },
    {
      header: 'Estado',
      cell: (method: any) => (
        <Switch
          checked={method.is_active}
          onCheckedChange={() => handleToggleActive(method.id, method.is_active)}
          disabled={updateMethodMutation.isPending}
        />
      ),
    },
    {
      header: 'Acciones',
      cell: (method: any) => (
        <Stack direction="row" gap="xs">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => handleEdit(method)}
          >
            <Icon as={PencilIcon} />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            colorPalette="red"
            onClick={() => handleDelete(method.id)}
            disabled={deleteMethodMutation.isPending}
          >
            <Icon as={TrashIcon} />
          </Button>
        </Stack>
      ),
    },
  ];

  return (
    <Stack gap="lg">
      {/* Stats Section */}
      <Section title="Resumen de Métodos de Pago" variant="elevated">
        <SimpleGrid columns={{ base: 1, md: 3 }} gap="md">
          <CardWrapper padding="md">
            <Stack gap="sm">
              <Stack direction="row" gap="sm" align="center">
                <Icon as={CreditCardIcon} boxSize="6" color="blue.500" />
                <span style={{ fontSize: '14px', color: 'var(--colors-gray-600)' }}>Total Métodos</span>
              </Stack>
              <span style={{ fontSize: '32px', fontWeight: 'bold' }}>{stats.total}</span>
            </Stack>
          </CardWrapper>

          <CardWrapper padding="md">
            <Stack gap="sm">
              <Stack direction="row" gap="sm" align="center">
                <Icon as={CheckCircleIcon} boxSize="6" color="green.500" />
                <span style={{ fontSize: '14px', color: 'var(--colors-gray-600)' }}>Activos</span>
              </Stack>
              <span style={{ fontSize: '32px', fontWeight: 'bold', color: 'var(--colors-green-600)' }}>
                {stats.active}
              </span>
            </Stack>
          </CardWrapper>

          <CardWrapper padding="md">
            <Stack gap="sm">
              <Stack direction="row" gap="sm" align="center">
                <Icon as={XCircleIcon} boxSize="6" color="gray.400" />
                <span style={{ fontSize: '14px', color: 'var(--colors-gray-600)' }}>Inactivos</span>
              </Stack>
              <span style={{ fontSize: '32px', fontWeight: 'bold', color: 'var(--colors-gray-600)' }}>
                {stats.inactive}
              </span>
            </Stack>
          </CardWrapper>
        </SimpleGrid>
      </Section>

      {/* Info Alert */}
      <Alert status="info" title="Métodos de Pago del Sistema">
        Configura los métodos de pago disponibles en tu negocio. Estos métodos se utilizan en el módulo de Sales (POS), 
        Cash (cierre de caja), y Reporting (análisis de pagos). Los gateways (MercadoPago, MODO) se configuran en la pestaña "Gateways".
      </Alert>

      {/* Payment Methods Table */}
      <Section
        title="Métodos de Pago Configurados"
        variant="elevated"
        action={
          <Button onClick={handleCreate}>
            <Icon as={PlusIcon} />
            Nuevo Método
          </Button>
        }
      >
        {isLoading ? (
          <p>Cargando métodos de pago...</p>
        ) : methods && methods.length > 0 ? (
          <Table.Root>
            <Table.Header>
              <Table.Row>
                {columns.map((col, idx) => (
                  <Table.ColumnHeader key={idx}>{col.header}</Table.ColumnHeader>
                ))}
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {methods.map((row, rowIdx) => (
                <Table.Row key={row.id || rowIdx}>
                  {columns.map((col, colIdx) => (
                    <Table.Cell key={colIdx}>{col.cell(row)}</Table.Cell>
                  ))}
                </Table.Row>
              ))}
            </Table.Body>
          </Table.Root>
        ) : (
          <Alert status="warning" title="No hay métodos de pago configurados">
            Crea tu primer método de pago para comenzar a aceptar pagos en tu sistema.
          </Alert>
        )}
      </Section>

      {/* Payment Types Reference */}
      <Section title="Tipos de Métodos de Pago" variant="elevated">
        <SimpleGrid columns={{ base: 1, md: 3 }} gap="md">
          <CardWrapper padding="md">
            <Stack gap="sm">
              <Icon as={BanknotesIcon} boxSize="8" color="green.500" />
              <strong>Efectivo</strong>
              <p style={{ fontSize: '14px', color: 'var(--colors-gray-600)' }}>
                Pago en efectivo, moneda local (ARS)
              </p>
            </Stack>
          </CardWrapper>

          <CardWrapper padding="md">
            <Stack gap="sm">
              <Icon as={CreditCardIcon} boxSize="8" color="blue.500" />
              <strong>Tarjetas</strong>
              <p style={{ fontSize: '14px', color: 'var(--colors-gray-600)' }}>
                Crédito, débito, prepagas (Visa, Mastercard, Cabal)
              </p>
            </Stack>
          </CardWrapper>

          <CardWrapper padding="md">
            <Stack gap="sm">
              <Icon as={BuildingLibraryIcon} boxSize="8" color="purple.500" />
              <strong>Transferencias</strong>
              <p style={{ fontSize: '14px', color: 'var(--colors-gray-600)' }}>
                Transferencias bancarias, CBU/CVU, QR interoperable
              </p>
            </Stack>
          </CardWrapper>
        </SimpleGrid>
      </Section>

      {/* Modal */}
      <PaymentMethodFormModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedMethod(null);
        }}
        method={selectedMethod}
      />
    </Stack>
  );
}

// Helper function
function getMethodIcon(code: string) {
  switch (code) {
    case 'cash':
      return BanknotesIcon;
    case 'credit_card':
    case 'debit_card':
      return CreditCardIcon;
    case 'bank_transfer':
    case 'qr_payment':
      return BuildingLibraryIcon;
    default:
      return CreditCardIcon;
  }
}
