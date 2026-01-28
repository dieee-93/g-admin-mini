/**
 * Payment Gateways Tab - Finance Integrations Module
 * PHASE 5: High Cohesion v3.0 Migration
 * 
 * Configuration for payment gateways (MercadoPago, MODO, Stripe, etc.)
 * Gateway-specific configs: API keys, webhooks, credentials
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
  BoltIcon,
  ShieldCheckIcon,
} from '@heroicons/react/24/outline';
import { usePaymentGateways, useUpdatePaymentGateway, useDeletePaymentGateway } from '@/modules/finance-integrations/hooks/usePayments';
import { PaymentGatewayFormModal } from './components/PaymentGatewayFormModal';
import { logger } from '@/lib/logging';

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Check if a gateway is properly configured with real credentials
 * Returns true only if the gateway has the required credentials for its provider
 */
function isGatewayConfigured(gateway: any): boolean {
  if (!gateway.config || typeof gateway.config !== 'object') {
    return false;
  }

  const config = gateway.config;
  const provider = gateway.provider?.toLowerCase();

  // Check based on provider
  switch (provider) {
    case 'mercadopago':
      // MercadoPago requires: public_key AND access_token
      return !!(config.public_key && config.access_token);

    case 'modo':
      // MODO requires: api_key AND merchant_id
      return !!(config.api_key && config.merchant_id);

    case 'stripe':
      // Stripe requires: publishable_key AND secret_key
      return !!(config.publishable_key && config.secret_key);

    default:
      // For unknown providers, check if there's any meaningful config
      // (at least one API key field present)
      const hasApiKey = config.api_key || config.access_token || config.secret_key || config.public_key;
      return !!hasApiKey;
  }
}

export function PaymentGatewaysTab() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedGateway, setSelectedGateway] = useState<any>(null);

  // TanStack Query hooks
  const { data: gateways, isLoading } = usePaymentGateways();
  const updateGatewayMutation = useUpdatePaymentGateway();
  const deleteGatewayMutation = useDeletePaymentGateway();

  // Handlers
  const handleCreate = () => {
    setSelectedGateway(null);
    setIsModalOpen(true);
  };

  const handleEdit = (gateway: any) => {
    setSelectedGateway(gateway);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('¿Estás seguro de eliminar este gateway de pago?')) {
      try {
        await deleteGatewayMutation.mutateAsync(id);
        logger.info('PaymentGatewaysTab', 'Payment gateway deleted', { id });
      } catch (error) {
        logger.error('PaymentGatewaysTab', 'Failed to delete payment gateway', error);
      }
    }
  };

  const handleToggleActive = async (id: string, currentActive: boolean) => {
    try {
      await updateGatewayMutation.mutateAsync({
        id,
        updates: { is_active: !currentActive }
      });
      logger.info('PaymentGatewaysTab', 'Payment gateway toggled', { id, newState: !currentActive });
    } catch (error) {
      logger.error('PaymentGatewaysTab', 'Failed to toggle payment gateway', error);
    }
  };

  // Stats calculation
  const stats = React.useMemo(() => {
    if (!gateways) return { total: 0, active: 0, inactive: 0, configured: 0 };
    return {
      total: gateways.length,
      active: gateways.filter(g => g.is_active).length,
      inactive: gateways.filter(g => !g.is_active).length,
      configured: gateways.filter(g => isGatewayConfigured(g)).length,
    };
  }, [gateways]);

  // Table columns
  const columns = [
    {
      header: 'Gateway',
      cell: (gateway: any) => (
        <Stack direction="row" gap="sm" align="center">
          <Icon as={CreditCardIcon} />
          <Stack gap="0">
            <strong>{gateway.name}</strong>
            <small style={{ color: 'var(--colors-gray-600)' }}>{gateway.provider}</small>
          </Stack>
        </Stack>
      ),
    },
    {
      header: 'Estado Config',
      cell: (gateway: any) => {
        const configured = isGatewayConfigured(gateway);
        return (
          <Badge colorPalette={configured ? 'green' : 'yellow'}>
            {configured ? 'Configurado' : 'Pendiente'}
          </Badge>
        );
      },
    },
    {
      header: 'Tipo',
      cell: (gateway: any) => (
        <Badge colorPalette="blue">
          {gateway.type === 'card' ? 'Tarjetas' :
           gateway.type === 'digital_wallet' ? 'Billetera Digital' :
           gateway.type === 'bank_transfer' ? 'Transferencia' :
           gateway.type === 'qr_payment' ? 'QR' :
           gateway.type === 'cash' ? 'Efectivo' :
           gateway.type === 'crypto' ? 'Crypto' :
           gateway.type === 'bnpl' ? 'Ahora 12/18' :
           gateway.type}
        </Badge>
      ),
    },
    {
      header: 'Online',
      cell: (gateway: any) => (
        <Badge colorPalette={gateway.is_online ? 'green' : 'gray'}>
          {gateway.is_online ? 'Online' : 'Offline'}
        </Badge>
      ),
    },
    {
      header: 'Activo',
      cell: (gateway: any) => (
        <Switch
          checked={gateway.is_active}
          onCheckedChange={() => handleToggleActive(gateway.id, gateway.is_active)}
          disabled={updateGatewayMutation.isPending}
        />
      ),
    },
    {
      header: 'Acciones',
      cell: (gateway: any) => (
        <Stack direction="row" gap="xs">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => handleEdit(gateway)}
          >
            <Icon as={PencilIcon} />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            colorPalette="red"
            onClick={() => handleDelete(gateway.id)}
            disabled={deleteGatewayMutation.isPending}
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
      <Section title="Resumen de Gateways" variant="elevated">
        <SimpleGrid columns={{ base: 1, md: 4 }} gap="md">
          <CardWrapper padding="md">
            <Stack gap="sm">
              <Stack direction="row" gap="sm" align="center">
                <Icon as={CreditCardIcon} boxSize="6" color="blue.500" />
                <span style={{ fontSize: '14px', color: 'var(--colors-gray-600)' }}>Total Gateways</span>
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
                <Icon as={ShieldCheckIcon} boxSize="6" color="purple.500" />
                <span style={{ fontSize: '14px', color: 'var(--colors-gray-600)' }}>Configurados</span>
              </Stack>
              <span style={{ fontSize: '32px', fontWeight: 'bold', color: 'var(--colors-purple-600)' }}>
                {stats.configured}
              </span>
            </Stack>
          </CardWrapper>

          <CardWrapper padding="md">
            <Stack gap="sm">
              <Stack direction="row" gap="sm" align="center">
                <Icon as={BoltIcon} boxSize="6" color="orange.500" />
                <span style={{ fontSize: '14px', color: 'var(--colors-gray-600)' }}>Webhooks</span>
              </Stack>
              <span style={{ fontSize: '32px', fontWeight: 'bold', color: 'var(--colors-orange-600)' }}>
                {gateways?.filter(g => g.webhook_url).length || 0}
              </span>
            </Stack>
          </CardWrapper>
        </SimpleGrid>
      </Section>

      {/* Info Alert */}
      <Alert status="info" title="Payment Gateways del Sistema">
        Configura los gateways de pago externos (MercadoPago, MODO, Stripe, etc.). Estos gateways procesan pagos con tarjetas
        y billeteras virtuales. Asegúrate de configurar correctamente las API keys y webhooks para cada gateway.
      </Alert>

      {/* Security Alert for Production */}
      <Alert status="warning" title="Seguridad en Producción">
        <strong>IMPORTANTE:</strong> Las API keys en modo producción son sensibles. Asegúrate de:
        <ul style={{ marginLeft: '20px', marginTop: '8px' }}>
          <li>Usar variables de entorno para credentials</li>
          <li>No compartir API keys en código fuente</li>
          <li>Rotar keys periódicamente</li>
          <li>Validar webhooks con signatures</li>
        </ul>
      </Alert>

      {/* Payment Gateways Table */}
      <Section
        title="Gateways Configurados"
        variant="elevated"
        action={
          <Button onClick={handleCreate}>
            <Icon as={PlusIcon} />
            Nuevo Gateway
          </Button>
        }
      >
        {isLoading ? (
          <p>Cargando gateways...</p>
        ) : gateways && gateways.length > 0 ? (
          <Table.Root>
            <Table.Header>
              <Table.Row>
                {columns.map((col, idx) => (
                  <Table.ColumnHeader key={idx}>{col.header}</Table.ColumnHeader>
                ))}
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {gateways.map((row, rowIdx) => (
                <Table.Row key={row.id || rowIdx}>
                  {columns.map((col, colIdx) => (
                    <Table.Cell key={colIdx}>{col.cell(row)}</Table.Cell>
                  ))}
                </Table.Row>
              ))}
            </Table.Body>
          </Table.Root>
        ) : (
          <Alert status="warning" title="No hay gateways configurados">
            Configura tu primer gateway de pago para comenzar a procesar pagos online.
          </Alert>
        )}
      </Section>

      {/* Popular Gateways Reference */}
      <Section title="Gateways Populares en Argentina" variant="elevated">
        <SimpleGrid columns={{ base: 1, md: 3 }} gap="md">
          <CardWrapper padding="md">
            <Stack gap="sm">
              <strong style={{ fontSize: '18px', color: 'var(--colors-blue-600)' }}>MercadoPago</strong>
              <p style={{ fontSize: '14px', color: 'var(--colors-gray-600)' }}>
                Líder del mercado argentino (74.4% market share). Soporta tarjetas, QR, billeteras.
              </p>
              <Badge colorPalette="blue">Más usado</Badge>
            </Stack>
          </CardWrapper>

          <CardWrapper padding="md">
            <Stack gap="sm">
              <strong style={{ fontSize: '18px', color: 'var(--colors-purple-600)' }}>MODO</strong>
              <p style={{ fontSize: '14px', color: 'var(--colors-gray-600)' }}>
                Consorcio de 30+ bancos argentinos. Transferencias instantáneas, QR interoperable.
              </p>
              <Badge colorPalette="purple">Banking</Badge>
            </Stack>
          </CardWrapper>

          <CardWrapper padding="md">
            <Stack gap="sm">
              <strong style={{ fontSize: '18px', color: 'var(--colors-green-600)' }}>Stripe</strong>
              <p style={{ fontSize: '14px', color: 'var(--colors-gray-600)' }}>
                Gateway internacional. Ideal para negocios con clientes fuera de Argentina.
              </p>
              <Badge colorPalette="green">Internacional</Badge>
            </Stack>
          </CardWrapper>
        </SimpleGrid>
      </Section>

      {/* Modal */}
      <PaymentGatewayFormModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedGateway(null);
        }}
        gateway={selectedGateway}
      />
    </Stack>
  );
}
