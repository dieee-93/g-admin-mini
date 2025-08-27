// TaxSummary Component - Reusable tax breakdown display - Design System v2.0
// Shows detailed tax calculations in a consistent format

import {
  Card,
  VStack,
  HStack,
  Typography,
  Badge,
  Grid
} from '@/shared/ui';
import { Separator } from '@chakra-ui/react';
import { 
  DocumentTextIcon,
  CalculatorIcon,
  InformationCircleIcon,
  CurrencyDollarIcon
} from '@heroicons/react/24/outline';

// Type definitions since the hook might not exist yet
interface SaleItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  taxable: boolean;
  category?: string;
}

interface TaxCalculationResult {
  subtotal: number;
  ivaAmount: number;
  ingresosBrutosAmount: number;
  total: number;
  effectiveRate: number;
}

interface TaxConfig {
  ivaRate: number;
  ingresosBrutosRate: number;
  enabled: boolean;
}

interface TaxSummaryProps {
  // Either provide total amount for reverse calculation
  totalAmount?: number;
  // Or provide items for forward calculation  
  items?: SaleItem[];
  // Display options
  showBreakdown?: boolean;
  showEffectiveRate?: boolean;
  showConfiguration?: boolean;
  variant?: 'default' | 'compact' | 'detailed';
  // Custom title
  title?: string;
}

export function TaxSummary({
  totalAmount,
  items = [],
  showBreakdown = true,
  showEffectiveRate = false,
  showConfiguration = false,
  variant = 'default',
  title = 'Resumen de Impuestos'
}: TaxSummaryProps) {
  
  // Mock tax configuration (replace with actual hook when available)
  const config: TaxConfig = {
    ivaRate: 0.21, // 21% IVA
    ingresosBrutosRate: 0.015, // 1.5% Ingresos Brutos
    enabled: true
  };

  // Mock calculation functions (replace with actual hook)
  const calculateTaxes = (amount: number): TaxCalculationResult => {
    const subtotal = amount / (1 + config.ivaRate + config.ingresosBrutosRate);
    const ivaAmount = subtotal * config.ivaRate;
    const ingresosBrutosAmount = subtotal * config.ingresosBrutosRate;
    const total = subtotal + ivaAmount + ingresosBrutosAmount;
    const effectiveRate = ((ivaAmount + ingresosBrutosAmount) / subtotal) * 100;

    return {
      subtotal,
      ivaAmount,
      ingresosBrutosAmount,
      total,
      effectiveRate
    };
  };

  const calculateCartTaxes = (cartItems: SaleItem[]): TaxCalculationResult => {
    const subtotal = cartItems.reduce((sum, item) => {
      return sum + (item.price * item.quantity);
    }, 0);

    const ivaAmount = subtotal * config.ivaRate;
    const ingresosBrutosAmount = subtotal * config.ingresosBrutosRate;
    const total = subtotal + ivaAmount + ingresosBrutosAmount;
    const effectiveRate = ((ivaAmount + ingresosBrutosAmount) / subtotal) * 100;

    return {
      subtotal,
      ivaAmount,
      ingresosBrutosAmount,
      total,
      effectiveRate
    };
  };

  const reverseTaxCalculation = (totalWithTax: number): TaxCalculationResult => {
    return calculateTaxes(totalWithTax);
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS'
    }).format(amount);
  };

  // Determine calculation method and get results
  const result = (() => {
    if (totalAmount && totalAmount > 0) {
      return reverseTaxCalculation(totalAmount);
    } else if (items.length > 0) {
      return calculateCartTaxes(items);
    } else {
      // Default zero state
      return {
        subtotal: 0,
        ivaAmount: 0,
        ingresosBrutosAmount: 0,
        total: 0,
        effectiveRate: 0
      };
    }
  })();

  const formatted = {
    subtotal: formatCurrency(result.subtotal),
    ivaAmount: formatCurrency(result.ivaAmount),
    ingresosBrutosAmount: formatCurrency(result.ingresosBrutosAmount),
    total: formatCurrency(result.total),
    effectiveRate: `${result.effectiveRate.toFixed(2)}%`
  };

  if (variant === 'compact') {
    return (
      <CardWrapper>
        <div className="p-3">
          <VStack gap="xs" align="stretch">
            <HStack justify="space-between">
              <Typography variant="body" className="text-sm font-medium">Subtotal:</Typography>
              <Typography variant="body" className="text-sm">{formatted.subtotal}</Typography>
            </HStack>
            <HStack justify="space-between">
              <Typography variant="body" className="text-sm font-medium">IVA ({(config.ivaRate * 100).toFixed(1)}%):</Typography>
              <Typography variant="body" className="text-sm">{formatted.ivaAmount}</Typography>
            </HStack>
            {result.ingresosBrutosAmount > 0 && (
              <HStack justify="space-between">
                <Typography variant="body" className="text-sm font-medium">Ing. Brutos:</Typography>
                <Typography variant="body" className="text-sm">{formatted.ingresosBrutosAmount}</Typography>
              </HStack>
            )}
            <Separator />
            <HStack justify="space-between">
              <Typography variant="body" className="text-sm font-bold">Total:</Typography>
              <Typography variant="body" className="text-sm font-bold text-green-600">
                {formatted.total}
              </Typography>
            </HStack>
          </VStack>
        </div>
      </CardWrapper>
    );
  }

  if (variant === 'detailed') {
    return (
      <CardWrapper>
        <div className="p-6">
          <VStack gap="lg" align="stretch">
            {/* Header */}
            <HStack gap="sm">
              <CalculatorIcon className="w-5 h-5 text-blue-500" />
              <Typography variant="heading" className="text-lg font-semibold">
                {title}
              </Typography>
              <Badge colorPalette="info" size="sm">
                AFIP Compliant
              </Badge>
            </HStack>

            {/* Tax Breakdown */}
            {showBreakdown && (
              <div>
                <Typography variant="body" className="text-sm font-medium mb-3">
                  Desglose de Impuestos
                </Typography>
                <VStack gap="sm" align="stretch">
                  <HStack justify="space-between" className="py-2">
                    <Typography variant="body" className="text-sm">Subtotal (Base imponible):</Typography>
                    <Typography variant="body" className="text-sm font-medium">{formatted.subtotal}</Typography>
                  </HStack>
                  
                  <HStack justify="space-between" className="py-2">
                    <HStack gap="xs">
                      <Typography variant="body" className="text-sm">IVA</Typography>
                      <Badge colorPalette="info" size="xs">{(config.ivaRate * 100).toFixed(1)}%</Badge>
                    </HStack>
                    <Typography variant="body" className="text-sm font-medium text-blue-600">
                      {formatted.ivaAmount}
                    </Typography>
                  </HStack>

                  {result.ingresosBrutosAmount > 0 && (
                    <HStack justify="space-between" className="py-2">
                      <HStack gap="xs">
                        <Typography variant="body" className="text-sm">Ingresos Brutos</Typography>
                        <Badge colorPalette="warning" size="xs">{(config.ingresosBrutosRate * 100).toFixed(2)}%</Badge>
                      </HStack>
                      <Typography variant="body" className="text-sm font-medium text-orange-600">
                        {formatted.ingresosBrutosAmount}
                      </Typography>
                    </HStack>
                  )}
                </VStack>
              </div>
            )}

            <Separator />

            {/* Total */}
            <HStack justify="space-between" className="py-3 bg-green-50 rounded px-4">
              <HStack gap="sm">
                <CurrencyDollarIcon className="w-5 h-5 text-green-600" />
                <Typography variant="heading" className="text-lg font-bold">Total:</Typography>
              </HStack>
              <Typography variant="heading" className="text-xl font-bold text-green-600">
                {formatted.total}
              </Typography>
            </HStack>

            {/* Effective Rate */}
            {showEffectiveRate && (
              <div className="p-3 bg-blue-50 border-l-4 border-blue-400 rounded-r">
                <Typography variant="body" className="text-sm">
                  <strong>Tasa Efectiva de Impuestos:</strong> {formatted.effectiveRate}
                </Typography>
              </div>
            )}

            {/* Configuration Info */}
            {showConfiguration && (
              <div>
                <Typography variant="body" className="text-sm font-medium mb-3">
                  Configuración Fiscal
                </Typography>
                <Grid templateColumns="repeat(2, 1fr)" gap="md">
                  <div className="p-3 bg-gray-50 rounded">
                    <Typography variant="body" className="text-xs" color="muted">IVA</Typography>
                    <Typography variant="body" className="font-semibold">
                      {(config.ivaRate * 100).toFixed(1)}%
                    </Typography>
                  </div>
                  <div className="p-3 bg-gray-50 rounded">
                    <Typography variant="body" className="text-xs" color="muted">Ingresos Brutos</Typography>
                    <Typography variant="body" className="font-semibold">
                      {(config.ingresosBrutosRate * 100).toFixed(2)}%
                    </Typography>
                  </div>
                </Grid>
              </div>
            )}

            {/* Items Breakdown (if available) */}
            {items.length > 0 && (
              <div>
                <Typography variant="body" className="text-sm font-medium mb-3">
                  Items Incluidos ({items.length})
                </Typography>
                <VStack gap="xs" align="stretch">
                  {items.slice(0, 3).map((item) => (
                    <HStack key={item.id} justify="space-between" className="py-2 px-3 bg-gray-50 rounded">
                      <VStack align="start" gap="xs">
                        <Typography variant="body" className="text-sm font-medium">{item.name}</Typography>
                        <Typography variant="body" className="text-xs" color="muted">
                          {item.quantity} x {formatCurrency(item.price)}
                        </Typography>
                      </VStack>
                      <Typography variant="body" className="text-sm font-medium">
                        {formatCurrency(item.price * item.quantity)}
                      </Typography>
                    </HStack>
                  ))}
                  {items.length > 3 && (
                    <Typography variant="body" className="text-xs text-center" color="muted">
                      +{items.length - 3} items más
                    </Typography>
                  )}
                </VStack>
              </div>
            )}
          </VStack>
        </div>
      </CardWrapper>
    );
  }

  // Default variant
  return (
    <CardWrapper>
      <div className="p-4">
        <VStack gap="md" align="stretch">
          {/* Header */}
          <HStack gap="sm">
            <DocumentTextIcon className="w-4 h-4 text-blue-500" />
            <Typography variant="heading" className="text-base font-semibold">
              {title}
            </Typography>
          </HStack>

          {/* Quick Summary */}
          <VStack gap="sm" align="stretch">
            <HStack justify="space-between">
              <Typography variant="body" className="text-sm">Subtotal:</Typography>
              <Typography variant="body" className="text-sm font-medium">{formatted.subtotal}</Typography>
            </HStack>
            
            <HStack justify="space-between">
              <Typography variant="body" className="text-sm">IVA ({(config.ivaRate * 100).toFixed(1)}%):</Typography>
              <Typography variant="body" className="text-sm font-medium text-blue-600">{formatted.ivaAmount}</Typography>
            </HStack>

            {result.ingresosBrutosAmount > 0 && (
              <HStack justify="space-between">
                <Typography variant="body" className="text-sm">Ing. Brutos:</Typography>
                <Typography variant="body" className="text-sm font-medium text-orange-600">{formatted.ingresosBrutosAmount}</Typography>
              </HStack>
            )}

            <Separator />

            <HStack justify="space-between">
              <Typography variant="body" className="font-bold">Total:</Typography>
              <Typography variant="body" className="font-bold text-green-600">
                {formatted.total}
              </Typography>
            </HStack>
          </VStack>

          {/* Additional Info */}
          {showEffectiveRate && (
            <div className="p-2 bg-blue-50 rounded">
              <Typography variant="body" className="text-xs">
                Tasa efectiva: {formatted.effectiveRate}
              </Typography>
            </div>
          )}
        </VStack>
      </div>
    </CardWrapper>
  );
}