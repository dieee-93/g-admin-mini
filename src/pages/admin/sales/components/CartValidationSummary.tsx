// src/features/sales/components/CartValidationSummary.tsx
import { 
  Stack,
  Typography, 
  Button,
  Card,
  Badge,
  Alert,
  Icon
} from '@/shared/ui';
import { 
  ExclamationTriangleIcon,
  ShoppingCartIcon,
  CurrencyDollarIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import { 
  CheckCircleIcon as CheckSolid,
  XCircleIcon as ErrorSolid
} from '@heroicons/react/24/solid';

interface SaleItem {
  product_id: string;
  product_name: string;
  quantity: number;
  unit_price: number;
  max_available: number;
}

interface StockValidationResult {
  is_valid: boolean;
  error_message?: string;
  insufficient_items?: Array<{
    product_id: string;
    product_name: string;
    required: number;
    available: number;
    missing: number;
  }>;
}

interface CartSummary {
  itemCount: number;
  totalAmount: number;
  hasItems: boolean;
  isValid: boolean;
  validationMessage?: string;
}

interface CartValidationSummaryProps {
  cart: SaleItem[];
  summary: CartSummary;
  validationResult: StockValidationResult | null;
  isValidating: boolean;
  onProceedToCheckout?: () => void;
  onValidateCart?: () => void;
  disabled?: boolean;
  isOffline?: boolean;
}

export function CartValidationSummary({
  cart,
  summary,
  validationResult,
  isValidating,
  onProceedToCheckout,
  onValidateCart,
  disabled = false,
  isOffline = false
}: CartValidationSummaryProps) {

  // Determinar el estado general del carrito
  const getCartStatus = () => {
    if (!summary.hasItems) {
      return { status: 'empty', color: 'gray', icon: ShoppingCartIcon, message: 'Carrito vacío' };
    }
    
    if (isValidating) {
      return { status: 'validating', color: 'blue', icon: ClockIcon, message: 'Validando stock...' };
    }
    
    if (!validationResult) {
      return { status: 'pending', color: 'yellow', icon: ExclamationTriangleIcon, message: 'Pendiente de validación' };
    }
    
    if (validationResult.is_valid) {
      return { status: 'valid', color: 'green', icon: CheckSolid, message: 'Listo para venta' };
    }
    
    return { status: 'invalid', color: 'red', icon: ErrorSolid, message: 'Stock insuficiente' };
  };

  const cartStatus = getCartStatus();

  // Calcular progreso de validación
  const getValidationProgress = () => {
    if (!summary.hasItems) return 0;
    if (isValidating) return 50;
    if (!validationResult) return 25;
    return validationResult.is_valid ? 100 : 75;
  };

  const validationProgress = getValidationProgress();

  return (
    <Card variant="elevated">
      <Stack gap="lg">
        {/* Header del resumen */}
        <Stack direction="row" justify="space-between" align="center">
          <Stack direction="row" gap="sm" align="center">
            <Icon icon={cartStatus.icon} size="sm" />
            <Typography variant="heading" size="lg" weight="bold">
              Resumen del Carrito
            </Typography>
          </Stack>
          <Badge 
            colorPalette={cartStatus.color === 'green' ? 'success' : cartStatus.color === 'blue' ? 'info' : cartStatus.color === 'red' ? 'error' : 'warning'}
            size="md"
            variant={cartStatus.status === 'valid' ? 'solid' : 'outline'}
          >
            {cartStatus.message}
          </Badge>
        </Stack>

        {/* Progreso de validación */}
        <Stack gap="xs">
          <Stack direction="row" justify="space-between" align="center">
            <Typography variant="body" size="sm" color="secondary">Estado de validación</Typography>
            <Typography variant="body" size="sm" weight="medium">{validationProgress}%</Typography>
          </Stack>
          <div style={{
            width: '100%',
            height: '8px',
            backgroundColor: 'var(--colors-bg-muted)',
            borderRadius: '4px',
            overflow: 'hidden'
          }}>
            <div style={{
              width: `${validationProgress}%`,
              height: '100%',
              backgroundColor: `var(--colors-${cartStatus.color === 'green' ? 'success' : cartStatus.color === 'blue' ? 'info' : cartStatus.color === 'red' ? 'error' : 'warning'}-solid)`,
              borderRadius: '4px',
              transition: 'width 0.3s ease'
            }} />
          </div>
        </Stack>

        {summary.hasItems && (
          <>
            <div style={{height: '1px', backgroundColor: 'var(--colors-border-subtle)', width: '100%'}} />
            
            {/* Estadísticas del carrito */}
            <Stack gap="sm">
              <Stack direction="row" justify="space-between" align="center">
                <Stack direction="row" gap="sm" align="center">
                  <Icon icon={ShoppingCartIcon} size="xs" />
                  <Typography variant="body" size="sm">Productos en carrito</Typography>
                </Stack>
                <Badge colorPalette="info" variant="outline">
                  {summary.itemCount}
                </Badge>
              </Stack>

              <Stack direction="row" justify="space-between" align="center">
                <Stack direction="row" gap="sm" align="center">
                  <Icon icon={CurrencyDollarIcon} size="xs" />
                  <Typography variant="body" size="sm">Total de la venta</Typography>
                </Stack>
                <Typography variant="heading" size="lg" weight="bold" >
                  ${summary.totalAmount.toFixed(2)}
                </Typography>
              </Stack>
            </Stack>

            {/* Lista resumida de productos */}
            <Stack gap="sm">
              <Typography variant="body" size="sm" weight="medium" color="primary">
                Productos seleccionados:
              </Typography>
              <Stack gap="xs">
                {cart.map((item, idx) => {
                  const isStockSufficient = item.quantity <= item.max_available;
                  const statusIcon = isStockSufficient ? CheckSolid : ErrorSolid;
                  const statusColor = isStockSufficient ? 'success' : 'error';
                  
                  return (
                    <div 
                      key={idx} 
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '0.5rem',
                        backgroundColor: 'var(--colors-bg-subtle)',
                        borderRadius: '0.375rem'
                      }}
                    >
                      <Stack direction="row" gap="sm" align="center" flex="1">
                        <Icon icon={statusIcon} size="xs" color={statusColor} />
                        <Typography variant="body" size="sm" style={{
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap'
                        }}>
                          {item.product_name}
                        </Typography>
                      </Stack>
                      <Stack direction="row" gap="sm" align="center">
                        <Badge 
                          colorPalette={statusColor}
                          size="sm"
                          variant={isStockSufficient ? 'subtle' : 'solid'}
                        >
                          {item.quantity}
                        </Badge>
                        <Typography variant="body" size="sm" color="secondary">
                          ${(item.quantity * item.unit_price).toFixed(2)}
                        </Typography>
                      </Stack>
                    </div>
                  );
                })}
              </Stack>
            </Stack>

            <div style={{height: '1px', backgroundColor: 'var(--colors-border-subtle)', width: '100%'}} />

            {/* Acciones principales */}
            <Stack gap="sm">
              {/* Botón de validación manual */}
              {onValidateCart && (
                <Button
                  variant="outline"
                  colorPalette="info"
                  onClick={onValidateCart}
                  disabled={disabled || !summary.hasItems || isValidating}
                >
                  <Stack direction="row" align="center" gap="xs">
                    <Icon icon={ClockIcon} size="xs" />
                    <Typography variant="body" size="sm">
                      {isValidating ? 'Validando...' : 'Revalidar Stock'}
                    </Typography>
                  </Stack>
                </Button>
              )}

              {/* Botón principal de checkout */}
              {onProceedToCheckout && (
                <Button
                  colorPalette="success"
                  size="lg"
                  onClick={onProceedToCheckout}
                  disabled={
                    disabled || 
                    !summary.hasItems || 
                    isValidating || 
                    (validationResult && !validationResult.is_valid) ||
                    false
                  }
                >
                  <Stack direction="row" align="center" gap="xs">
                    {cartStatus.status === 'valid' ? (
                      <>
                        <Icon icon={CheckSolid} size="xs" />
                        <Typography variant="body" size="sm">Proceder al Checkout</Typography>
                      </>
                    ) : (
                      <>
                        <Icon icon={ExclamationTriangleIcon} size="xs" />
                        <Typography variant="body" size="sm">
                          {isValidating ? 'Validando...' : 'Validar y Continuar'}
                        </Typography>
                      </>
                    )}
                  </Stack>
                </Button>
              )}
            </Stack>
          </>
        )}

        {/* Mensaje cuando carrito está vacío */}
        {!summary.hasItems && (
          <div style={{textAlign: 'center', padding: '3rem 0'}}>
            <div style={{marginBottom: '0.5rem'}}>
              <Icon icon={ShoppingCartIcon} size="xl" color="muted" />
            </div>
            <Typography variant="body" size="sm" color="muted">
              Agrega productos al carrito para continuar
            </Typography>
          </div>
        )}
      </Stack>
    </CardWrapper>
  );
}

// Componente para mostrar alertas rápidas en el carrito
export function CartQuickAlert({ 
  validationResult, 
  isValidating,
  isOffline = false
}: { 
  validationResult: StockValidationResult | null;
  isValidating: boolean;
  isOffline?: boolean;
}) {
  if (isOffline) {
    return (
      <div style={{
        display: 'flex',
        gap: '0.5rem',
        padding: '0.5rem',
        backgroundColor: 'var(--colors-warning-bg)',
        borderRadius: '0.375rem'
      }}>
        <Icon icon={ExclamationTriangleIcon} size="xs"  />
        <Typography variant="body" size="sm" >
          Modo Offline: Las ventas se guardarán localmente para sincronización posterior
        </Typography>
      </div>
    );
  }

  if (isValidating) {
    return (
      <div style={{
        display: 'flex',
        gap: '0.5rem',
        padding: '0.5rem',
        backgroundColor: 'var(--colors-info-bg)',
        borderRadius: '0.375rem'
      }}>
        <Icon icon={ClockIcon} size="xs"  />
        <Typography variant="body" size="sm" >
          Verificando disponibilidad...
        </Typography>
      </div>
    );
  }

  if (validationResult && !validationResult.is_valid) {
    return (
      <div style={{
        display: 'flex',
        gap: '0.5rem',
        padding: '0.5rem',
        backgroundColor: 'var(--colors-error-bg)',
        borderRadius: '0.375rem'
      }}>
        <Icon icon={ErrorSolid} size="xs" color="error" />
        <Typography variant="body" size="sm" color="error">
          Algunos productos exceden el stock disponible
        </Typography>
      </div>
    );
  }

  if (validationResult && validationResult.is_valid) {
    return (
      <div style={{
        display: 'flex',
        gap: '0.5rem',
        padding: '0.5rem',
        backgroundColor: 'var(--colors-success-bg)',
        borderRadius: '0.375rem'
      }}>
        <Icon icon={CheckSolid} size="xs"  />
        <Typography variant="body" size="sm" >
          Stock disponible para todos los productos
        </Typography>
      </div>
    );
  }

  return null;
}