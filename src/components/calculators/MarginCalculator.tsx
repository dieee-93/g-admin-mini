/**
 * MarginCalculator - Componente educativo para entender Markup vs Margin
 *
 * CRITICAL: Markup y Margin NO son lo mismo
 * - Markup: Ganancia sobre el COSTO (markup = ganancia / costo * 100)
 * - Margin: Ganancia sobre el PRECIO (margin = ganancia / precio * 100)
 *
 * Formulas de conversion:
 * - Markup → Margin: margin = markup / (1 + markup)
 * - Margin → Markup: markup = margin / (1 - margin)
 *
 * Ejemplos:
 * - 50% markup = 33.33% margin
 * - 100% markup = 50% margin
 * - 33.33% margin = 50% markup
 *
 * Referencia: docs/teoria-administrativa/01-COSTOS-FUNDAMENTALES.md
 */

import React, { useState, useEffect } from 'react';
import {
  CardWrapper,
  Stack,
  HStack,
  VStack,
  Heading,
  Text,
  Separator,
  Badge,
  Field,
  Input
} from '@/shared/ui';
import { DecimalUtils } from '@/lib/decimal/decimalUtils';

type CalculationMode = 'markup' | 'margin' | 'none';

export const MarginCalculator: React.FC = () => {
  // Input states
  const [cost, setCost] = useState<string>('100');
  const [markup, setMarkup] = useState<string>('50');
  const [margin, setMargin] = useState<string>('');
  const [price, setPrice] = useState<string>('');

  // UI state
  const [activeInput, setActiveInput] = useState<CalculationMode>('none');
  const [error, setError] = useState<string | null>(null);

  // Recalcular cuando cambian inputs
  useEffect(() => {
    try {
      setError(null);

      const costDec = DecimalUtils.fromValueSafe(cost, 'financial', 0);

      if (activeInput === 'markup' && markup !== '') {
        // Usuario modifico markup → calcular margin y precio
        const markupDec = DecimalUtils.fromValueSafe(markup, 'financial', 0);

        // Calcular precio desde markup
        const priceDec = DecimalUtils.applyMarkup(costDec, markupDec);
        setPrice(priceDec.toFixed(2));

        // Convertir markup a margin
        const marginDec = DecimalUtils.convertMarkupToMargin(markupDec);
        setMargin(marginDec.toFixed(2));

      } else if (activeInput === 'margin' && margin !== '') {
        // Usuario modifico margin → calcular markup y precio
        const marginDec = DecimalUtils.fromValueSafe(margin, 'financial', 0);

        // Validar margin < 100%
        if (marginDec.greaterThanOrEqualTo(100)) {
          setError('Margin no puede ser >= 100%');
          setMarkup('');
          setPrice('');
          return;
        }

        // Calcular precio desde margin
        const priceDec = DecimalUtils.calculatePriceFromMargin(costDec, marginDec);
        setPrice(priceDec.toFixed(2));

        // Convertir margin a markup
        const markupDec = DecimalUtils.convertMarginToMarkup(marginDec);
        setMarkup(markupDec.toFixed(2));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error en calculo');
      console.error('MarginCalculator error:', err);
    }
  }, [cost, markup, margin, activeInput]);

  const handleCostChange = (value: string) => {
    setCost(value);
    // Recalcular automaticamente
    if (activeInput !== 'none') {
      // Trigger recalculation
    }
  };

  const handleMarkupChange = (value: string) => {
    setMarkup(value);
    setActiveInput('markup');
  };

  const handleMarginChange = (value: string) => {
    setMargin(value);
    setActiveInput('margin');
  };

  // Calcular ganancia para display
  const profit = price && cost
    ? DecimalUtils.subtract(price, cost, 'financial').toFixed(2)
    : '0.00';

  return (
    <CardWrapper variant="elevated">
      <CardWrapper.Header>
        <HStack justify="space-between">
          <CardWrapper.Title>Calculadora Markup vs Margin</CardWrapper.Title>
          <Badge colorPalette="blue">Educativa</Badge>
        </HStack>
        <CardWrapper.Description>
          Entiende la diferencia critica entre Markup y Margin
        </CardWrapper.Description>
      </CardWrapper.Header>

      <CardWrapper.Body>
        <Stack gap="6">
          {/* Error Alert */}
          {error && (
            <Badge colorPalette="red" fontSize="sm">
              {error}
            </Badge>
          )}

          {/* Input: Costo */}
          <Field.Root>
            <Field.Label>Costo</Field.Label>
            <Input
              type="number"
              value={cost}
              onChange={(e) => handleCostChange(e.target.value)}
              placeholder="100.00"
            />
            <Field.HelperText>
              Costo base del producto (sin ganancia)
            </Field.HelperText>
          </Field.Root>

          <Separator />

          {/* Input: Markup */}
          <Field.Root>
            <Field.Label>
              Markup (%)
              {activeInput === 'markup' && (
                <Badge ml={2} colorPalette="green" size="sm">Activo</Badge>
              )}
            </Field.Label>
            <Input
              type="number"
              value={markup}
              onChange={(e) => handleMarkupChange(e.target.value)}
              placeholder="50.00"
            />
            <Field.HelperText>
              Ganancia sobre el <strong>COSTO</strong> (ganancia / costo x 100)
            </Field.HelperText>
          </Field.Root>

          {/* Input: Margin */}
          <Field.Root>
            <Field.Label>
              Margin (%)
              {activeInput === 'margin' && (
                <Badge colorPalette="green" size="sm">Activo</Badge>
              )}
            </Field.Label>
            <Input
              type="number"
              value={margin}
              onChange={(e) => handleMarginChange(e.target.value)}
              placeholder="33.33"
            />
            <Field.HelperText>
              Ganancia sobre el <strong>PRECIO</strong> (ganancia / precio x 100)
            </Field.HelperText>
          </Field.Root>

          <Separator />

          {/* Output: Resultados */}
          <VStack align="stretch" gap={3} bg="gray.50" p={4} borderRadius="md">
            <Heading size="sm">Resultados Calculados</Heading>

            <HStack justify="space-between">
              <Text fontWeight="medium">Precio de Venta:</Text>
              <Text fontSize="lg" fontWeight="bold" color="green.600">
                ${price || '0.00'}
              </Text>
            </HStack>

            <HStack justify="space-between">
              <Text fontWeight="medium">Ganancia:</Text>
              <Text fontSize="lg" fontWeight="bold" color="blue.600">
                ${profit}
              </Text>
            </HStack>

            <Separator />

            <VStack align="stretch" fontSize="sm" color="gray.600">
              <Text>
                <strong>Costo:</strong> ${cost || '0.00'}
              </Text>
              <Text>
                <strong>Markup:</strong> {markup || '0.00'}% (ganancia / costo)
              </Text>
              <Text>
                <strong>Margin:</strong> {margin || '0.00'}% (ganancia / precio)
              </Text>
            </VStack>
          </VStack>

          {/* Educational Info */}
          <VStack align="stretch" bg="blue.50" p={4} borderRadius="md" fontSize="sm">
            <Heading size="xs" color="blue.800">Sabias que?</Heading>
            <Text color="blue.700">
              Un <strong>50% markup</strong> equivale a solo un <strong>33.33% margin</strong>.
              No son lo mismo!
            </Text>
            <Text color="blue.700" mt={2}>
              <strong>Markup:</strong> "Vendo al doble del costo" = 100% markup = 50% margin
            </Text>
            <Text color="blue.700">
              <strong>Margin:</strong> "Quiero 30% de ganancia del precio" = 30% margin = 42.86% markup
            </Text>
          </VStack>

          {/* Industria Reference */}
          <VStack align="stretch" bg="purple.50" p={4} borderRadius="md" fontSize="sm">
            <Heading size="xs" color="purple.800">Targets por Industria</Heading>
            <HStack justify="space-between">
              <Text color="purple.700"><strong>Software:</strong></Text>
              <Text color="purple.700">75-85% margin</Text>
            </HStack>
            <HStack justify="space-between">
              <Text color="purple.700"><strong>Food Service:</strong></Text>
              <Text color="purple.700">60-70% margin</Text>
            </HStack>
            <HStack justify="space-between">
              <Text color="purple.700"><strong>Retail:</strong></Text>
              <Text color="purple.700">20-55% margin</Text>
            </HStack>
            <Text color="purple.600" mt={2} fontSize="xs">
              Fuente: docs/teoria-administrativa/MATRIZ-CONCEPTOS-INDUSTRIAS.md
            </Text>
          </VStack>
        </Stack>
      </CardWrapper.Body>
    </CardWrapper>
  );
};
