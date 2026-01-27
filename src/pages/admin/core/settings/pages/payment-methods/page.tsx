/**
 * PAYMENT METHODS CONFIGURATION PAGE
 * 
 * ✅ CLEAN IMPLEMENTATION - No legacy code
 * Uses TanStack Query hooks exclusively
 * 
 * @see src/modules/finance-integrations/hooks/usePayments.ts
 * @version 2.0.0 - TanStack Query Migration
 */

import { useState, useMemo } from 'react';
import {
  ContentLayout,
  PageHeader,
  Section,
  Button,
  Stack,
  HStack,
  Alert,
  Badge,
  Icon,
  Tabs,
  Card,
  Switch,
  Text
} from '@/shared/ui';
import {
  CreditCardIcon,
  BanknotesIcon,
  DevicePhoneMobileIcon,
  GlobeAltIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  PlusIcon,
  TrashIcon,
  QrCodeIcon
} from '@heroicons/react/24/outline';
import { 
  usePaymentMethods, 
  usePaymentGateways, 
  usePaymentStats,
  useCreatePaymentMethod,
  useUpdatePaymentMethod,
  useDeletePaymentMethod,
  useCreatePaymentGateway,
  useUpdatePaymentGateway,
  useDeletePaymentGateway
} from '@/modules/finance-integrations/hooks/usePayments';
import { toaster } from '@/shared/ui/toaster';
import { logger } from '@/lib/logging';
import type { PaymentMethod, PaymentGateway } from '@/modules/finance-integrations/services/paymentsApi';

// ============================================
// ARGENTINA PAYMENT METHODS PRESETS
// ============================================

interface PaymentMethodPreset {
  id: string;
  name: string;
  type: 'cash' | 'card' | 'transfer' | 'other';
  icon: React.ComponentType<{ className?: string }>;
  description: string;
  popular: boolean;
  requiresGateway?: boolean;
}

const AR_PAYMENT_METHODS: PaymentMethodPreset[] = [
  {
    id: 'cash',
    name: 'Efectivo',
    type: 'cash',
    icon: BanknotesIcon,
    description: 'Pago en efectivo al momento de la entrega o en el local',
    popular: true
  },
  {
    id: 'debit_card',
    name: 'Tarjeta de Débito',
    type: 'card',
    icon: CreditCardIcon,
    description: 'Débito con terminal POS o gateway online',
    popular: true,
    requiresGateway: true
  },
  {
    id: 'credit_card',
    name: 'Tarjeta de Crédito',
    type: 'card',
    icon: CreditCardIcon,
    description: 'Crédito con terminal POS o gateway online (1 a 12 cuotas)',
    popular: true,
    requiresGateway: true
  },
  {
    id: 'bank_transfer',
    name: 'Transferencia Bancaria',
    type: 'transfer',
    icon: BanknotesIcon,
    description: 'CBU/CVU/Alias - Cliente envía comprobante',
    popular: true
  },
  {
    id: 'mercadopago',
    name: 'MercadoPago',
    type: 'other',
    icon: DevicePhoneMobileIcon,
    description: 'Link de pago o QR de MercadoPago',
    popular: true,
    requiresGateway: true
  },
  {
    id: 'modo',
    name: 'MODO',
    type: 'other',
    icon: QrCodeIcon,
    description: 'QR de MODO para pagos instantáneos',
    popular: true,
    requiresGateway: true
  },
  {
    id: 'qr_interoperable',
    name: 'QR Interoperable',
    type: 'other',
    icon: QrCodeIcon,
    description: 'QR único compatible con todas las billeteras',
    popular: false
  },
  {
    id: 'uala',
    name: 'Ualá',
    type: 'other',
    icon: DevicePhoneMobileIcon,
    description: 'Billetera digital Ualá',
    popular: false,
    requiresGateway: true
  },
  {
    id: 'naranja_x',
    name: 'Naranja X',
    type: 'other',
    icon: DevicePhoneMobileIcon,
    description: 'Billetera digital Naranja X',
    popular: false,
    requiresGateway: true
  },
  {
    id: 'cheque',
    name: 'Cheque',
    type: 'other',
    icon: BanknotesIcon,
    description: 'Cheque al día o diferido',
    popular: false
  },
  {
    id: 'crypto',
    name: 'Criptomonedas',
    type: 'other',
    icon: GlobeAltIcon,
    description: 'Bitcoin, USDT, DAI (requiere wallet)',
    popular: false,
    requiresGateway: true
  }
];

// Gateway presets para Argentina
interface GatewayPreset {
  id: string;
  name: string;
  type: 'online' | 'pos' | 'mobile';
  description: string;
  website: string;
  supports_subscriptions: boolean;
}

const AR_PAYMENT_GATEWAYS: GatewayPreset[] = [
  {
    id: 'mercadopago',
    name: 'MercadoPago',
    type: 'online',
    description: 'Gateway líder en Argentina - Links de pago, checkout, suscripciones',
    website: 'https://www.mercadopago.com.ar/developers',
    supports_subscriptions: true
  },
  {
    id: 'modo',
    name: 'MODO',
    type: 'mobile',
    description: 'QR bancario universal - Sin comisiones para comercios',
    website: 'https://modo.com.ar',
    supports_subscriptions: false
  },
  {
    id: 'posnet',
    name: 'Posnet',
    type: 'pos',
    description: 'Terminal POS físico - Débito y crédito',
    website: 'https://www.posnet.com.ar',
    supports_subscriptions: false
  },
  {
    id: 'lapos',
    name: 'Lapos',
    type: 'pos',
    description: 'Terminal POS físico - Débito, crédito, QR',
    website: 'https://www.lapos.com.ar',
    supports_subscriptions: false
  },
  {
    id: 'decidir',
    name: 'Decidir',
    type: 'online',
    description: 'Gateway de First Data - Pagos con tarjeta online',
    website: 'https://decidir.com.ar',
    supports_subscriptions: true
  },
  {
    id: 'payway',
    name: 'Payway (Prisma)',
    type: 'online',
    description: 'Gateway de Prisma - Checkout online y tokenización',
    website: 'https://www.prismamediosdepago.com',
    supports_subscriptions: true
  }
];

// ============================================
// COMPONENT
// ============================================

export default function PaymentMethodsPage() {
  // ✅ TanStack Query hooks - no legacy store
  const { data: methods = [], isLoading: methodsLoading, error: methodsError } = usePaymentMethods();
  const { data: gateways = [], isLoading: gatewaysLoading, error: gatewaysError } = usePaymentGateways();
  const stats = usePaymentStats();

  // Mutations
  const createMethod = useCreatePaymentMethod();
  const updateMethod = useUpdatePaymentMethod();
  const deleteMethod = useDeletePaymentMethod();
  const createGateway = useCreatePaymentGateway();
  const updateGateway = useUpdatePaymentGateway();
  const deleteGateway = useDeletePaymentGateway();

  // UI State
  const [activeTab, setActiveTab] = useState<'methods' | 'gateways'>('methods');

  // Derived state
  const hasActiveMethods = stats.activeMethods > 0;
  const needsSetup = methods.length === 0;

  // Quick add from preset
  const handleQuickAddMethod = (preset: PaymentMethodPreset) => {
    const existingMethod = methods.find((m) => m.id === preset.id);
    if (existingMethod) {
      toaster.create({
        title: 'Ya existe',
        description: `El método "${preset.name}" ya está configurado`,
        type: 'info'
      });
      return;
    }

    createMethod.mutate({
      name: preset.name,
      type: preset.type,
      is_active: true
    });
  };

  const handleToggleMethod = (id: string, isActive: boolean) => {
    updateMethod.mutate({ id, updates: { is_active: isActive } });
  };

  const handleDeleteMethod = (id: string) => {
    const method = methods.find((m) => m.id === id);
    deleteMethod.mutate(id);
    logger.info('Settings', 'Payment method deleted', { method: method?.name });
  };

  const handleQuickAddGateway = (preset: GatewayPreset) => {
    const existingGateway = gateways.find((g) => g.id === preset.id);
    if (existingGateway) {
      toaster.create({
        title: 'Ya existe',
        description: `El gateway "${preset.name}" ya está configurado`,
        type: 'info'
      });
      return;
    }

    createGateway.mutate({
      name: preset.name,
      type: preset.type,
      is_active: false, // Inactive by default (requires API keys)
      supports_subscriptions: preset.supports_subscriptions
    });
  };

  const handleToggleGateway = (id: string, isActive: boolean) => {
    updateGateway.mutate({ id, updates: { is_active: isActive } });
  };

  const handleDeleteGateway = (id: string) => {
    const gateway = gateways.find((g) => g.id === id);
    deleteGateway.mutate(id);
    logger.info('Settings', 'Payment gateway deleted', { gateway: gateway?.name });
  };

  // Available presets (not already added)
  const availableMethodPresets = useMemo(
    () => AR_PAYMENT_METHODS.filter((preset) => !methods.some((m) => m.name === preset.name)),
    [methods]
  );

  const availableGatewayPresets = useMemo(
    () => AR_PAYMENT_GATEWAYS.filter((preset) => !gateways.some((g) => g.name === preset.name)),
    [gateways]
  );

  if (methodsError || gatewaysError) {
    return (
      <ContentLayout>
        <Alert status="error" title="Error al cargar datos">
          {(methodsError as Error)?.message || (gatewaysError as Error)?.message}
        </Alert>
      </ContentLayout>
    );
  }

  const isLoading = methodsLoading || gatewaysLoading;

  return (
    <ContentLayout spacing="normal" data-testid="payment-methods-page">
      <PageHeader
        title="Métodos de Pago"
        subtitle="Configura cómo recibirás pagos de tus clientes"
      />

      {/* Setup Alert */}
      {needsSetup && (
        <Alert
          status="warning"
          title="Configura al menos un método de pago"
        >
          Para activar TakeAway, Delivery y otras funcionalidades, necesitas definir cómo aceptarás
          pagos. Empieza con <strong>Efectivo</strong> si no estás seguro.
        </Alert>
      )}

      {/* Stats Section */}
      <Section
        title="Resumen"
        description="Estado actual de tus métodos de pago"
      >
        <HStack gap="4" wrap="wrap">
          <Card.Root size="sm" variant="outline">
            <Card.Body>
              <Stack gap="1">
                <Text fontSize="sm" color="fg.muted">Métodos Activos</Text>
                <HStack gap="2">
                  <Icon
                    icon={hasActiveMethods ? CheckCircleIcon : ExclamationTriangleIcon}
                    size="md"
                    color={hasActiveMethods ? 'green.500' : 'orange.500'}
                  />
                  <Text fontSize="2xl" fontWeight="bold">
                    {stats.activeMethods}
                  </Text>
                  <Text fontSize="sm" color="fg.muted">/ {stats.totalMethods}</Text>
                </HStack>
              </Stack>
            </Card.Body>
          </Card.Root>

          <Card.Root size="sm" variant="outline">
            <Card.Body>
              <Stack gap="1">
                <Text fontSize="sm" color="fg.muted">Gateways Online</Text>
                <HStack gap="2">
                  <Icon icon={GlobeAltIcon} size="md" color="blue.500" />
                  <Text fontSize="2xl" fontWeight="bold">
                    {stats.activeGateways}
                  </Text>
                  <Text fontSize="sm" color="fg.muted">/ {stats.totalGateways}</Text>
                </HStack>
              </Stack>
            </Card.Body>
          </Card.Root>

          <Card.Root size="sm" variant="outline">
            <Card.Body>
              <Stack gap="1">
                <Text fontSize="sm" color="fg.muted">Soporta Suscripciones</Text>
                <HStack gap="2">
                  <Icon icon={CreditCardIcon} size="md" color="purple.500" />
                  <Text fontSize="2xl" fontWeight="bold">
                    {stats.subscriptionCapable}
                  </Text>
                </HStack>
              </Stack>
            </Card.Body>
          </Card.Root>
        </HStack>
      </Section>

      {/* Main Content */}
      <Section
        title="Configuración"
        description="Administra tus métodos de pago y gateways"
      >
        <Tabs.Root
          value={activeTab}
          onValueChange={(e) => setActiveTab(e.value as 'methods' | 'gateways')}
          variant="enclosed"
        >
          <Tabs.List>
            <Tabs.Trigger value="methods">
              <HStack gap="2">
                <Icon icon={BanknotesIcon} size="sm" />
                Métodos de Pago
                {stats.totalMethods > 0 && (
                  <Badge colorPalette="blue" size="xs">
                    {stats.totalMethods}
                  </Badge>
                )}
              </HStack>
            </Tabs.Trigger>
            <Tabs.Trigger value="gateways">
              <HStack gap="2">
                <Icon icon={GlobeAltIcon} size="sm" />
                Gateways & Integraciones
                {stats.totalGateways > 0 && (
                  <Badge colorPalette="purple" size="xs">
                    {stats.totalGateways}
                  </Badge>
                )}
              </HStack>
            </Tabs.Trigger>
          </Tabs.List>

          {/* Methods Tab */}
          <Tabs.Content value="methods">
            <Stack gap="6" mt="4">
              {/* Quick Add Popular Methods */}
              {availableMethodPresets.length > 0 && (
                <Alert status="info" size="sm">
                  <Stack gap="3">
                    <Text fontWeight="medium">Métodos populares en Argentina:</Text>
                    <HStack gap="2" wrap="wrap">
                      {availableMethodPresets
                        .filter((p) => p.popular)
                        .map((preset) => (
                          <Button
                            key={preset.id}
                            size="sm"
                            variant="outline"
                            onClick={() => handleQuickAddMethod(preset)}
                          >
                            <Icon icon={preset.icon} size="xs" />
                            {preset.name}
                          </Button>
                        ))}
                    </HStack>
                  </Stack>
                </Alert>
              )}

              {/* Current Methods */}
              {methods.length === 0 ? (
                <Alert status="info">
                  No hay métodos configurados aún. Agrega al menos uno para empezar.
                </Alert>
              ) : (
                <Stack gap="3">
                  {methods.map((method) => {
                    const preset = AR_PAYMENT_METHODS.find((p) => p.id === method.id);
                    const IconComp = preset?.icon || BanknotesIcon;

                    return (
                      <Card.Root key={method.id} variant="outline">
                        <Card.Body>
                          <HStack justify="space-between">
                            <HStack gap="3">
                              <Icon icon={IconComp} size="lg" color="fg.muted" />
                              <Stack gap="1">
                                <HStack gap="2">
                                  <Text fontWeight="medium">{method.name}</Text>
                                  {method.is_active ? (
                                    <Badge colorPalette="green" size="xs">
                                      <Icon icon={CheckCircleIcon} size="xs" />
                                      Activo
                                    </Badge>
                                  ) : (
                                    <Badge colorPalette="gray" size="xs">
                                      Inactivo
                                    </Badge>
                                  )}
                                  {preset?.requiresGateway && (
                                    <Badge colorPalette="orange" size="xs">
                                      Requiere Gateway
                                    </Badge>
                                  )}
                                </HStack>
                                {preset && (
                                  <Text fontSize="sm" color="fg.muted">
                                    {preset.description}
                                  </Text>
                                )}
                              </Stack>
                            </HStack>

                            <HStack gap="2">
                              <Switch
                                checked={method.is_active}
                                onCheckedChange={(e) =>
                                  handleToggleMethod(method.id, e.checked)
                                }
                              />
                              <Button
                                size="sm"
                                variant="ghost"
                                colorPalette="red"
                                onClick={() => handleDeleteMethod(method.id)}
                              >
                                <Icon icon={TrashIcon} size="sm" />
                              </Button>
                            </HStack>
                          </HStack>
                        </Card.Body>
                      </Card.Root>
                    );
                  })}
                </Stack>
              )}

              {/* Show More Methods */}
              {availableMethodPresets.length > 0 && (
                <details>
                  <summary style={{ cursor: 'pointer', fontWeight: 500 }}>
                    Ver más métodos ({availableMethodPresets.length})
                  </summary>
                  <Stack gap="2" mt="3">
                    {availableMethodPresets
                      .filter((p) => !p.popular)
                      .map((preset) => (
                        <Card.Root key={preset.id} variant="subtle" size="sm">
                          <Card.Body>
                            <HStack justify="space-between">
                              <HStack gap="2">
                                <Icon icon={preset.icon} size="sm" color="fg.muted" />
                                <Stack gap="0">
                                  <Text fontSize="sm" fontWeight="medium">
                                    {preset.name}
                                  </Text>
                                  <Text fontSize="xs" color="fg.muted">
                                    {preset.description}
                                  </Text>
                                </Stack>
                              </HStack>
                              <Button
                                size="xs"
                                variant="outline"
                                onClick={() => handleQuickAddMethod(preset)}
                              >
                                <Icon icon={PlusIcon} size="xs" />
                                Agregar
                              </Button>
                            </HStack>
                          </Card.Body>
                        </Card.Root>
                      ))}
                  </Stack>
                </details>
              )}
            </Stack>
          </Tabs.Content>

          {/* Gateways Tab */}
          <Tabs.Content value="gateways">
            <Stack gap="6" mt="4">
              <Alert status="info" size="sm">
                Los <strong>gateways</strong> permiten procesar pagos online (tarjetas, QR, etc.).
                Requieren registro y configuración de API keys.
              </Alert>

              {/* Quick Add Gateways */}
              {availableGatewayPresets.length > 0 && (
                <Stack gap="3">
                  <Text fontWeight="medium">Gateways disponibles en Argentina:</Text>
                  <Stack gap="2">
                    {availableGatewayPresets.map((preset) => (
                      <Card.Root key={preset.id} variant="outline" size="sm">
                        <Card.Body>
                          <HStack justify="space-between">
                            <Stack gap="1">
                              <HStack gap="2">
                                <Text fontWeight="medium">{preset.name}</Text>
                                <Badge
                                  colorPalette={
                                    preset.type === 'online'
                                      ? 'blue'
                                      : preset.type === 'mobile'
                                      ? 'green'
                                      : 'gray'
                                  }
                                  size="xs"
                                >
                                  {preset.type === 'online'
                                    ? 'Online'
                                    : preset.type === 'mobile'
                                    ? 'Móvil'
                                    : 'POS'}
                                </Badge>
                                {preset.supports_subscriptions && (
                                  <Badge colorPalette="purple" size="xs">
                                    Suscripciones
                                  </Badge>
                                )}
                              </HStack>
                              <Text fontSize="sm" color="fg.muted">
                                {preset.description}
                              </Text>
                              <Text fontSize="xs" color="blue.500">
                                <a
                                  href={preset.website}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                >
                                  {preset.website}
                                </a>
                              </Text>
                            </Stack>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleQuickAddGateway(preset)}
                            >
                              <Icon icon={PlusIcon} size="xs" />
                              Agregar
                            </Button>
                          </HStack>
                        </Card.Body>
                      </Card.Root>
                    ))}
                  </Stack>
                </Stack>
              )}

              {/* Current Gateways */}
              {gateways.length > 0 && (
                <Stack gap="3">
                  <Text fontWeight="medium">Gateways configurados:</Text>
                  {gateways.map((gateway) => {
                    const preset = AR_PAYMENT_GATEWAYS.find((p) => p.id === gateway.id);

                    return (
                      <Card.Root key={gateway.id} variant="outline">
                        <Card.Body>
                          <HStack justify="space-between">
                            <Stack gap="1">
                              <HStack gap="2">
                                <Text fontWeight="medium">{gateway.name || gateway.id}</Text>
                                {gateway.is_active ? (
                                  <Badge colorPalette="green" size="xs">
                                    <Icon icon={CheckCircleIcon} size="xs" />
                                    Activo
                                  </Badge>
                                ) : (
                                  <Badge colorPalette="orange" size="xs">
                                    <Icon icon={ExclamationTriangleIcon} size="xs" />
                                    Requiere Config
                                  </Badge>
                                )}
                                <Badge
                                  colorPalette={
                                    gateway.type === 'online'
                                      ? 'blue'
                                      : gateway.type === 'mobile'
                                      ? 'green'
                                      : 'gray'
                                  }
                                  size="xs"
                                >
                                  {gateway.type}
                                </Badge>
                              </HStack>
                              {preset && (
                                <Text fontSize="sm" color="fg.muted">
                                  {preset.description}
                                </Text>
                              )}
                            </Stack>

                            <HStack gap="2">
                              <Switch
                                checked={gateway.is_active}
                                onCheckedChange={(e) =>
                                  handleToggleGateway(gateway.id, e.checked)
                                }
                              />
                              <Button
                                size="sm"
                                variant="ghost"
                                colorPalette="red"
                                onClick={() => handleDeleteGateway(gateway.id)}
                              >
                                <Icon icon={TrashIcon} size="sm" />
                              </Button>
                            </HStack>
                          </HStack>
                        </Card.Body>
                      </Card.Root>
                    );
                  })}
                </Stack>
              )}

              {gateways.length === 0 && availableGatewayPresets.length === 0 && (
                <Alert status="success">
                  Todos los gateways disponibles ya fueron agregados.
                </Alert>
              )}

              {/* TODO: Gateway Configuration Modal */}
              <Alert status="info" size="sm">
                <Stack gap="2">
                  <Text fontWeight="medium">⚙️ Configuración de API Keys</Text>
                  <Text fontSize="sm">
                    La configuración detallada de cada gateway (API keys, webhooks, etc.) estará
                    disponible en la próxima versión. Por ahora, puedes activar/desactivar gateways
                    agregados.
                  </Text>
                </Stack>
              </Alert>
            </Stack>
          </Tabs.Content>
        </Tabs.Root>
      </Section>
    </ContentLayout>
  );
}
