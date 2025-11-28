/**
 * PRICING SECTION (Intelligent Pricing - Variante A)
 *
 * Sección universal presente en todos los tipos de productos.
 * Calcula costo automáticamente y sugiere precio basado en margen.
 *
 * @design PRODUCTS_FORM_SECTIONS_SPEC.md - Section 6
 */

import { Stack, Text, Box, HStack, Alert, CardWrapper, Switch, Button, NumberField } from '@/shared/ui';
import { Field, Input } from '@chakra-ui/react';
import type { FormSectionProps, PricingFields, ProductCostBreakdown } from '../../types/productForm';
import {
  calculateProfitMargin,
  suggestPrice,
  isPriceBelowCost
} from '../../services/productCostCalculation';

interface PricingSectionProps extends Omit<FormSectionProps, 'data' | 'onChange'> {
  data: PricingFields;
  calculatedCosts?: ProductCostBreakdown;  // Costos calculados desde otras secciones
  onChange: (data: PricingFields) => void;
}

export function PricingSection({
  data,
  calculatedCosts,
  onChange,
  errors = [],
  readOnly = false
}: PricingSectionProps) {
  // Handle field changes
  const handleChange = <K extends keyof PricingFields>(
    field: K,
    value: PricingFields[K]
  ) => {
    onChange({
      ...data,
      [field]: value
    });
  };

  // Handle price change (marks as manual override)
  const handlePriceChange = (price: number) => {
    onChange({
      ...data,
      price,
      calculated_cost: calculatedCosts  // Keep calculated costs in sync
    });
  };

  // Apply suggested price
  const handleApplySuggestedPrice = () => {
    if (!data.profit_margin_percentage || !calculatedCosts) return;

    const suggested = suggestPrice(calculatedCosts.total, data.profit_margin_percentage);

    onChange({
      ...data,
      price: suggested,
      suggested_price: suggested,
      calculated_cost: calculatedCosts
    });
  };

  // Calculate current margin
  const currentMargin = calculatedCosts && data.price
    ? calculateProfitMargin(calculatedCosts.total, data.price)
    : 0;

  // Check if price is below cost
  const isBelowCost = calculatedCosts
    ? isPriceBelowCost(calculatedCosts.total, data.price)
    : false;

  // Get field error
  const getFieldError = (fieldName: string) => {
    return errors.find(e => e.field === `pricing.${fieldName}` || e.field === fieldName);
  };

  return (
    <Stack gap="4">
      {/* Resumen de costos calculados */}
      {calculatedCosts && calculatedCosts.total > 0 && (
        <CardWrapper variant="outline" bg="gray.50">
          <CardWrapper.Body>
            <Stack gap="2">
              <Text fontWeight="bold" fontSize="lg">Costos Calculados</Text>

              {calculatedCosts.materials > 0 && (
                <HStack justify="space-between">
                  <Text fontSize="sm">Materiales:</Text>
                  <Text fontWeight="medium">
                    ${calculatedCosts.materials.toFixed(2)}
                  </Text>
                </HStack>
              )}

              {calculatedCosts.labor > 0 && (
                <HStack justify="space-between">
                  <Text fontSize="sm">Mano de obra:</Text>
                  <Text fontWeight="medium">
                    ${calculatedCosts.labor.toFixed(2)}
                  </Text>
                </HStack>
              )}

              {calculatedCosts.overhead > 0 && (
                <HStack justify="space-between">
                  <Text fontSize="sm">Overhead (producción):</Text>
                  <Text fontWeight="medium">
                    ${calculatedCosts.overhead.toFixed(2)}
                  </Text>
                </HStack>
              )}

              <Box borderTopWidth="1px" borderColor="gray.200" pt={2} mt={2}>
                <HStack justify="space-between">
                  <Text fontWeight="bold">Costo Total:</Text>
                  <Text fontWeight="bold" fontSize="lg" color="blue.600">
                    ${calculatedCosts.total.toFixed(2)}
                  </Text>
                </HStack>
              </Box>
            </Stack>
          </CardWrapper.Body>
        </CardWrapper>
      )}

      {/* Margen objetivo */}
      <Field.Root>
        <Field.Label>Margen de ganancia objetivo (%)</Field.Label>
        <Input
          type="number"
          min={0}
          max={1000}
          step={5}
          placeholder="30"
          value={data.profit_margin_percentage || ''}
          onChange={(e) => handleChange('profit_margin_percentage', parseFloat(e.target.value) || undefined)}
          disabled={readOnly}
        />
        <Field.HelperText>
          Define tu margen deseado (ej: 30% = $100 costo → $142.86 precio)
        </Field.HelperText>

        {/* Sugerencias rápidas de margen */}
        {!readOnly && (
          <HStack gap="2" mt={2}>
            <Text fontSize="xs" color="gray.600">Sugerencias:</Text>
            <Button
              size="xs"
              variant="outline"
              onClick={() => handleChange('profit_margin_percentage', 30)}
            >
              30%
            </Button>
            <Button
              size="xs"
              variant="outline"
              onClick={() => handleChange('profit_margin_percentage', 40)}
            >
              40%
            </Button>
            <Button
              size="xs"
              variant="outline"
              onClick={() => handleChange('profit_margin_percentage', 50)}
            >
              50%
            </Button>
          </HStack>
        )}
      </Field.Root>

      {/* Precio sugerido */}
      {data.profit_margin_percentage && calculatedCosts && calculatedCosts.total > 0 && (
        <Alert.Root status="info" variant="subtle">
          <Alert.Indicator />
          <Box>
            <Text fontWeight="bold">
              Precio sugerido: ${suggestPrice(calculatedCosts.total, data.profit_margin_percentage)}
            </Text>
            <Text fontSize="sm">
              Con {data.profit_margin_percentage}% de margen
            </Text>
          </Box>
        </Alert.Root>
      )}

      {/* Precio de venta */}
      <NumberField
        label="Precio de venta"
        required
        error={getFieldError('price')?.message}
        step={0.01}
        min={0}
        placeholder="0.00"
        value={data.price || 0}
        onChange={(val) => handlePriceChange(val)}
        disabled={readOnly}
      />

      {/* Warnings/Success según precio vs costo */}
      {data.price && calculatedCosts && calculatedCosts.total > 0 && (
        <>
          {isBelowCost && (
            <Alert.Root status="error">
              <Alert.Indicator />
              <Box>
                <Alert.Title>¡Precio por debajo del costo!</Alert.Title>
                <Alert.Description>
                  Estarías perdiendo ${(calculatedCosts.total - data.price).toFixed(2)} por unidad
                </Alert.Description>
              </Box>
            </Alert.Root>
          )}

          {!isBelowCost && (
            <Alert.Root status="success" variant="subtle">
              <Alert.Indicator />
              <Box>
                <Text fontWeight="bold">
                  Margen: {currentMargin.toFixed(1)}%
                </Text>
                <Text fontSize="sm">
                  Ganancia neta: ${(data.price - calculatedCosts.total).toFixed(2)} por unidad
                </Text>
              </Box>
            </Alert.Root>
          )}
        </>
      )}

      {/* Botón para aplicar precio sugerido */}
      {data.profit_margin_percentage && calculatedCosts && calculatedCosts.total > 0 && !readOnly && (
        <Button
          colorPalette="purple"
          variant="outline"
          onClick={handleApplySuggestedPrice}
        >
          Aplicar Precio Sugerido (${suggestPrice(calculatedCosts.total, data.profit_margin_percentage)})
        </Button>
      )}

      {/* Precio comparativo (opcional) */}
      <NumberField
        label="Precio comparativo (opcional)"
        error={getFieldError('compare_at_price')?.message}
        step={0.01}
        min={0}
        placeholder="Ej: precio antes de descuento"
        value={data.compare_at_price || 0}
        onChange={(val) => handleChange('compare_at_price', val || undefined)}
        disabled={readOnly}
      />

      {/* Impuestos incluidos */}
      <Stack gap="2">
        <Switch
          checked={data.tax_included || false}
          onChange={(checked) => handleChange('tax_included', checked)}
          disabled={readOnly}
        >
          El precio incluye impuestos
        </Switch>
      </Stack>
    </Stack>
  );
}
