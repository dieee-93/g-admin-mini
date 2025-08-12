// TaxSummary Component - Reusable tax breakdown display
// Shows detailed tax calculations in a consistent format

import {
  Box,
  VStack,
  HStack,
  Text,
  Badge,
  Card,
  Separator
} from '@chakra-ui/react';
import { 
  DocumentTextIcon,
  CalculatorIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';
import { useTaxCalculation, type SaleItem } from '../hooks/useTaxCalculation';

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
  const { calculateTaxes, calculateCartTaxes, reverseTaxCalculation, formatTaxDisplay, config } = useTaxCalculation();

  // Determine calculation method and get results
  const result = (() => {
    if (totalAmount && totalAmount > 0) {
      return reverseTaxCalculation(totalAmount);
    } else if (items.length > 0) {
      return calculateCartTaxes(items);
    } else {
      // Empty state
      return {
        subtotal: 0,
        ivaAmount: 0,
        ingresosBrutosAmount: 0,
        totalTaxes: 0,
        totalAmount: 0,
        breakdown: {
          basePrice: 0,
          ivaRate: config.ivaRate,
          ingresosBrutosRate: config.ingresosBrutosRate || 0,
          effectiveTaxRate: 0
        }
      };
    }
  })();

  const formatted = formatTaxDisplay(result);
  const isEmpty = result.totalAmount === 0;

  if (variant === 'compact') {
    return (
      <Card.Root size="sm">
        <Card.Body p="3">
          <VStack gap="2" align="stretch">
            <HStack justify="space-between">
              <Text fontSize="sm" fontWeight="medium">Subtotal:</Text>
              <Text fontSize="sm">{formatted.subtotal}</Text>
            </HStack>
            <HStack justify="space-between">
              <Text fontSize="sm" fontWeight="medium">IVA ({(config.ivaRate * 100).toFixed(1)}%):</Text>
              <Text fontSize="sm">{formatted.ivaAmount}</Text>
            </HStack>
            {result.ingresosBrutosAmount > 0 && (
              <HStack justify="space-between">
                <Text fontSize="sm" fontWeight="medium">Ing. Brutos:</Text>
                <Text fontSize="sm">{formatted.ingresosBrutosAmount}</Text>
              </HStack>
            )}
            <Separator />
            <HStack justify="space-between">
              <Text fontSize="sm" fontWeight="bold">Total:</Text>
              <Text fontSize="sm" fontWeight="bold" color="green.600">
                {formatted.totalAmount}
              </Text>
            </HStack>
          </VStack>
        </Card.Body>
      </Card.Root>
    );
  }

  return (
    <Card.Root>
      <Card.Header>
        <HStack gap="2">
          <CalculatorIcon className="w-5 h-5 text-blue-600" />
          <Text fontWeight="bold">{title}</Text>
          {isEmpty && (
            <Badge colorPalette="gray" size="sm">Vacío</Badge>
          )}
          {!isEmpty && config.taxIncludedInPrice && (
            <Badge colorPalette="blue" size="sm">Impuestos Incluidos</Badge>
          )}
        </HStack>
      </Card.Header>

      <Card.Body>
        <VStack gap="4" align="stretch">
          {isEmpty ? (
            <Box textAlign="center" py="4">
              <VStack gap="2">
                <InformationCircleIcon className="w-8 h-8 text-gray-400" />
                <Text color="gray.500">No hay datos para mostrar</Text>
                <Text fontSize="sm" color="gray.400">
                  Proporciona un monto total o items para calcular impuestos
                </Text>
              </VStack>
            </Box>
          ) : (
            <>
              {/* Main Tax Calculation */}
              <VStack gap="3" align="stretch">
                <HStack justify="space-between">
                  <Text fontWeight="medium">Subtotal (Base Imponible):</Text>
                  <Text fontWeight="medium">{formatted.subtotal}</Text>
                </HStack>

                <HStack justify="space-between">
                  <HStack gap="2">
                    <Text fontWeight="medium">IVA ({(config.ivaRate * 100).toFixed(1)}%):</Text>
                    {config.taxIncludedInPrice && (
                      <Badge colorPalette="blue" size="xs">Incluido</Badge>
                    )}
                  </HStack>
                  <Text fontWeight="medium" color="red.600">
                    +{formatted.ivaAmount}
                  </Text>
                </HStack>

                {result.ingresosBrutosAmount > 0 && (
                  <HStack justify="space-between">
                    <HStack gap="2">
                      <Text fontWeight="medium">Ingresos Brutos ({((config.ingresosBrutosRate || 0) * 100).toFixed(1)}%):</Text>
                      <Badge colorPalette="orange" size="xs">IIBB</Badge>
                    </HStack>
                    <Text fontWeight="medium" color="orange.600">
                      +{formatted.ingresosBrutosAmount}
                    </Text>
                  </HStack>
                )}

                <Separator />

                <HStack justify="space-between">
                  <Text fontSize="lg" fontWeight="bold">Total Impuestos:</Text>
                  <Text fontSize="lg" fontWeight="bold" color="red.600">
                    {formatted.totalTaxes}
                  </Text>
                </HStack>

                <HStack justify="space-between">
                  <Text fontSize="xl" fontWeight="bold">TOTAL FINAL:</Text>
                  <Text fontSize="xl" fontWeight="bold" color="green.600">
                    {formatted.totalAmount}
                  </Text>
                </HStack>
              </VStack>

              {/* Detailed Breakdown */}
              {showBreakdown && variant === 'detailed' && (
                <>
                  <Separator />
                  <Box>
                    <Text fontSize="sm" fontWeight="semibold" mb="2" color="gray.600">
                      Desglose Detallado
                    </Text>
                    <VStack gap="2" align="stretch">
                      <HStack justify="space-between">
                        <Text fontSize="sm">Base de cálculo:</Text>
                        <Text fontSize="sm">{result.breakdown.basePrice.toFixed(2)}</Text>
                      </HStack>
                      <HStack justify="space-between">
                        <Text fontSize="sm">Alícuota IVA aplicada:</Text>
                        <Text fontSize="sm">{(result.breakdown.ivaRate * 100).toFixed(2)}%</Text>
                      </HStack>
                      {result.breakdown.ingresosBrutosRate > 0 && (
                        <HStack justify="space-between">
                          <Text fontSize="sm">Alícuota IIBB aplicada:</Text>
                          <Text fontSize="sm">{(result.breakdown.ingresosBrutosRate * 100).toFixed(2)}%</Text>
                        </HStack>
                      )}
                      {showEffectiveRate && (
                        <HStack justify="space-between">
                          <Text fontSize="sm" fontWeight="medium">Tasa efectiva total:</Text>
                          <Text fontSize="sm" fontWeight="medium" color="purple.600">
                            {(result.breakdown.effectiveTaxRate * 100).toFixed(2)}%
                          </Text>
                        </HStack>
                      )}
                    </VStack>
                  </Box>
                </>
              )}

              {/* Configuration Info */}
              {showConfiguration && (
                <>
                  <Separator />
                  <Box>
                    <Text fontSize="sm" fontWeight="semibold" mb="2" color="gray.600">
                      Configuración Fiscal
                    </Text>
                    <VStack gap="1" align="stretch">
                      <HStack justify="space-between">
                        <Text fontSize="xs" color="gray.600">Sistema de precios:</Text>
                        <Badge colorPalette={config.taxIncludedInPrice ? "blue" : "orange"} size="xs">
                          {config.taxIncludedInPrice ? "Impuestos incluidos" : "Impuestos adicionales"}
                        </Badge>
                      </HStack>
                      <HStack justify="space-between">
                        <Text fontSize="xs" color="gray.600">Redondeo:</Text>
                        <Text fontSize="xs" color="gray.600">
                          {config.roundTaxes ? "Activado" : "Desactivado"}
                        </Text>
                      </HStack>
                      {config.includeIngresosBrutos && (
                        <HStack justify="space-between">
                          <Text fontSize="xs" color="gray.600">Jurisdicción:</Text>
                          <Text fontSize="xs" color="gray.600">
                            {config.jurisdiction || "CABA"}
                          </Text>
                        </HStack>
                      )}
                    </VStack>
                  </Box>
                </>
              )}
            </>
          )}
        </VStack>
      </Card.Body>
    </Card.Root>
  );
}

/**
 * Compact tax display for inline use
 */
export function InlineTaxSummary({ totalAmount, items = [] }: { totalAmount?: number; items?: SaleItem[] }) {
  const { reverseTaxCalculation, calculateCartTaxes, formatTaxDisplay } = useTaxCalculation();
  
  const result = totalAmount ? reverseTaxCalculation(totalAmount) : calculateCartTaxes(items);
  const formatted = formatTaxDisplay(result);

  if (result.totalAmount === 0) {
    return <Text fontSize="sm" color="gray.400">--</Text>;
  }

  return (
    <HStack gap="1" flexWrap="wrap">
      <Text fontSize="sm">
        <Text as="span" color="gray.600">Base:</Text>
        <Text as="span" fontWeight="medium"> {formatted.subtotal}</Text>
      </Text>
      <Text fontSize="sm">
        <Text as="span" color="red.600">+ IVA:</Text>
        <Text as="span" fontWeight="medium"> {formatted.ivaAmount}</Text>
      </Text>
      <Text fontSize="sm">
        <Text as="span" color="green.600">Total:</Text>
        <Text as="span" fontWeight="bold"> {formatted.totalAmount}</Text>
      </Text>
    </HStack>
  );
}

export default TaxSummary;