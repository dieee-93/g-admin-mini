// src/features/stock/components/AlertConfigDialog.tsx
// 🎉 Dialog de configuración COMPLETAMENTE MIGRADO al sistema centralizado v3.23
// ✅ ANTES: toaster.create({ status: "success" }) - API incorrecta
// ✅ AHORA: notify.alertConfigSaved() - Sistema centralizado correcto

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  VStack,
  HStack,
  Text,
  Input,
  Button,
  NumberInput,
  Switch,
  Badge,
  Card,
  Separator
} from '@chakra-ui/react';
import {
  ExclamationTriangleIcon,
  ExclamationCircleIcon,
  InformationCircleIcon,
  LightBulbIcon,
  Cog6ToothIcon
} from '@heroicons/react/24/outline';
import { useStockAlerts, type AlertThreshold } from '../logic/useStockAlerts';
import { notify, handleApiError } from '@/lib/notifications'; // ✅ NUEVO sistema centralizado

interface AlertConfigDialogProps {
  isOpen: boolean;
  onClose: () => void;
  itemId: string;
  itemName: string;
  currentStock: number;
  unit: string;
  itemType: 'UNIT' | 'WEIGHT' | 'VOLUME' | 'ELABORATED';
}

interface ThresholdConfig {
  critical_threshold: number;
  warning_threshold: number;
  info_threshold: number;
  auto_reorder_enabled: boolean;
  suggested_reorder_quantity: number;
}

export function AlertConfigDialog({
  isOpen,
  onClose,
  itemId,
  itemName,
  currentStock,
  unit,
  itemType
}: AlertConfigDialogProps) {
  const { saveThreshold, thresholds } = useStockAlerts();
  
  const [config, setConfig] = useState<ThresholdConfig>({
    critical_threshold: 5,
    warning_threshold: 15,
    info_threshold: 25,
    auto_reorder_enabled: false,
    suggested_reorder_quantity: 50
  });

  const [errors, setErrors] = useState<Partial<Record<keyof ThresholdConfig, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load existing configuration
  useEffect(() => {
    if (isOpen && itemId) {
      const existingThreshold = thresholds.find(t => t.item_id === itemId);
      if (existingThreshold) {
        setConfig({
          critical_threshold: existingThreshold.critical_threshold,
          warning_threshold: existingThreshold.warning_threshold,
          info_threshold: existingThreshold.info_threshold,
          auto_reorder_enabled: existingThreshold.auto_reorder_enabled,
          suggested_reorder_quantity: existingThreshold.suggested_reorder_quantity
        });
      } else {
        // Set smart defaults based on item type and current stock
        const defaults = getSmartDefaults(itemType, currentStock);
        setConfig(defaults);
      }
    }
  }, [isOpen, itemId, thresholds, itemType, currentStock]);

  // Generate smart defaults based on item type and current stock
  const getSmartDefaults = (type: string, stock: number): ThresholdConfig => {
    const baseConfig = {
      auto_reorder_enabled: false,
      suggested_reorder_quantity: Math.max(stock, 50)
    };

    switch (type) {
      case 'UNIT':
        return {
          ...baseConfig,
          critical_threshold: Math.max(2, Math.floor(stock * 0.1)),
          warning_threshold: Math.max(5, Math.floor(stock * 0.2)),
          info_threshold: Math.max(10, Math.floor(stock * 0.3))
        };
      case 'WEIGHT':
      case 'VOLUME':
        return {
          ...baseConfig,
          critical_threshold: Math.max(1, Math.floor(stock * 0.15)),
          warning_threshold: Math.max(3, Math.floor(stock * 0.25)),
          info_threshold: Math.max(5, Math.floor(stock * 0.35))
        };
      case 'ELABORATED':
        return {
          ...baseConfig,
          critical_threshold: Math.max(3, Math.floor(stock * 0.2)),
          warning_threshold: Math.max(8, Math.floor(stock * 0.3)),
          info_threshold: Math.max(15, Math.floor(stock * 0.4))
        };
      default:
        return {
          ...baseConfig,
          critical_threshold: 5,
          warning_threshold: 15,
          info_threshold: 25
        };
    }
  };

  // Validation
  const validateConfig = (config: ThresholdConfig): boolean => {
    const newErrors: Partial<Record<keyof ThresholdConfig, string>> = {};

    if (config.critical_threshold <= 0) {
      newErrors.critical_threshold = 'Debe ser mayor a 0';
    }

    if (config.warning_threshold <= config.critical_threshold) {
      newErrors.warning_threshold = 'Debe ser mayor al umbral crítico';
    }

    if (config.info_threshold <= config.warning_threshold) {
      newErrors.info_threshold = 'Debe ser mayor al umbral de advertencia';
    }

    if (config.suggested_reorder_quantity <= 0) {
      newErrors.suggested_reorder_quantity = 'Debe ser mayor a 0';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async () => {
    if (!validateConfig(config)) {
      return;
    }

    setIsSubmitting(true);
    try {
      await saveThreshold(itemId, config);
      onClose();
      
      // ✅ MIGRADO: Usar helper específico del sistema centralizado
      notify.alertConfigSaved(itemName);
    } catch (error) {
      // ✅ MIGRADO: Usar handleApiError centralizado
      handleApiError(error, 'No se pudo guardar la configuración');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle input changes
  const handleNumberChange = (field: keyof ThresholdConfig) => (value: string) => {
    const numValue = parseFloat(value);
    if (!isNaN(numValue)) {
      setConfig(prev => ({ ...prev, [field]: numValue }));
    }
  };

  const handleSwitchChange = (field: keyof ThresholdConfig) => (checked: boolean) => {
    setConfig(prev => ({ ...prev, [field]: checked }));
  };

  // Apply smart suggestions
  const applySuggestions = () => {
    const suggestions = getSmartDefaults(itemType, currentStock);
    setConfig(suggestions);
    
    // ✅ MIGRADO: Usar helper específico
    notify.info({
      title: 'Sugerencias aplicadas',
      description: 'Se han aplicado los umbrales recomendados'
    });
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={(e) => !e.open && onClose()}>
      <Dialog.Backdrop />
      <Dialog.Positioner>
        <Dialog.Content maxWidth="600px">
          <Dialog.Header>
            <HStack gap="3">
              <Cog6ToothIcon className="w-6 h-6 text-blue-500" />
              <VStack align="start" gap="0">
                <Dialog.Title>Configurar Alertas</Dialog.Title>
                <Text fontSize="sm" color="gray.600">
                  {itemName} • Stock actual: {currentStock} {unit}
                </Text>
              </VStack>
            </HStack>
            <Dialog.CloseTrigger />
          </Dialog.Header>

          <Dialog.Body>
            <VStack gap="6">
              {/* Smart suggestions card */}
              <Card.Root bg="blue.50" borderColor="blue.200">
                <Card.Body p="4">
                  <HStack justify="space-between" align="start">
                    <HStack gap="3">
                      <LightBulbIcon className="w-5 h-5 text-blue-500" />
                      <VStack align="start" gap="1">
                        <Text fontSize="sm" fontWeight="medium" color="blue.700">
                          Sugerencias Inteligentes
                        </Text>
                        <Text fontSize="xs" color="blue.600">
                          Basadas en el tipo de item y stock actual
                        </Text>
                      </VStack>
                    </HStack>
                    <Button
                      size="sm"
                      colorPalette="blue"
                      variant="outline"
                      onClick={applySuggestions}
                    >
                      Aplicar
                    </Button>
                  </HStack>
                </Card.Body>
              </Card.Root>

              {/* Threshold configuration */}
              <VStack gap="4" width="100%">
                <Text fontSize="md" fontWeight="semibold">
                  Umbrales de Alerta
                </Text>

                {/* Critical threshold */}
                <VStack gap="2" width="100%">
                  <HStack justify="space-between" width="100%">
                    <HStack gap="2">
                      <ExclamationTriangleIcon className="w-4 h-4 text-red-500" />
                      <Text fontSize="sm" fontWeight="medium">
                        Crítico (0-{config.critical_threshold} {unit})
                      </Text>
                      <Badge colorPalette="red" variant="subtle" size="sm">
                        Acción inmediata
                      </Badge>
                    </HStack>
                  </HStack>
                  <HStack gap="2" width="100%">
                    <NumberInput.Root
                      value={config.critical_threshold.toString()}
                      onValueChange={(e) => handleNumberChange('critical_threshold')(e.value)}
                      min={0.1}
                      step={0.1}
                      flex="1"
                    >
                      <NumberInput.Field />
                      <NumberInput.Control>
                        <NumberInput.IncrementTrigger />
                        <NumberInput.DecrementTrigger />
                      </NumberInput.Control>
                    </NumberInput.Root>
                    <Text fontSize="sm" color="gray.600" minWidth="40px">
                      {unit}
                    </Text>
                  </HStack>
                  {errors.critical_threshold && (
                    <Text fontSize="xs" color="red.500">
                      {errors.critical_threshold}
                    </Text>
                  )}
                </VStack>

                {/* Warning threshold */}
                <VStack gap="2" width="100%">
                  <HStack justify="space-between" width="100%">
                    <HStack gap="2">
                      <ExclamationCircleIcon className="w-4 h-4 text-orange-500" />
                      <Text fontSize="sm" fontWeight="medium">
                        Advertencia ({config.critical_threshold + 1}-{config.warning_threshold} {unit})
                      </Text>
                      <Badge colorPalette="orange" variant="subtle" size="sm">
                        Planificar reposición
                      </Badge>
                    </HStack>
                  </HStack>
                  <HStack gap="2" width="100%">
                    <NumberInput.Root
                      value={config.warning_threshold.toString()}
                      onValueChange={(e) => handleNumberChange('warning_threshold')(e.value)}
                      min={0.1}
                      step={0.1}
                      flex="1"
                    >
                      <NumberInput.Field />
                      <NumberInput.Control>
                        <NumberInput.IncrementTrigger />
                        <NumberInput.DecrementTrigger />
                      </NumberInput.Control>
                    </NumberInput.Root>
                    <Text fontSize="sm" color="gray.600" minWidth="40px">
                      {unit}
                    </Text>
                  </HStack>
                  {errors.warning_threshold && (
                    <Text fontSize="xs" color="red.500">
                      {errors.warning_threshold}
                    </Text>
                  )}
                </VStack>

                {/* Info threshold */}
                <VStack gap="2" width="100%">
                  <HStack justify="space-between" width="100%">
                    <HStack gap="2">
                      <InformationCircleIcon className="w-4 h-4 text-blue-500" />
                      <Text fontSize="sm" fontWeight="medium">
                        Informativo ({config.warning_threshold + 1}-{config.info_threshold} {unit})
                      </Text>
                      <Badge colorPalette="blue" variant="subtle" size="sm">
                        Monitorear tendencia
                      </Badge>
                    </HStack>
                  </HStack>
                  <HStack gap="2" width="100%">
                    <NumberInput.Root
                      value={config.info_threshold.toString()}
                      onValueChange={(e) => handleNumberChange('info_threshold')(e.value)}
                      min={0.1}
                      step={0.1}
                      flex="1"
                    >
                      <NumberInput.Field />
                      <NumberInput.Control>
                        <NumberInput.IncrementTrigger />
                        <NumberInput.DecrementTrigger />
                      </NumberInput.Control>
                    </NumberInput.Root>
                    <Text fontSize="sm" color="gray.600" minWidth="40px">
                      {unit}
                    </Text>
                  </HStack>
                  {errors.info_threshold && (
                    <Text fontSize="xs" color="red.500">
                      {errors.info_threshold}
                    </Text>
                  )}
                </VStack>
              </VStack>

              <Separator />

              {/* Auto-reorder configuration */}
              <VStack gap="4" width="100%">
                <Text fontSize="md" fontWeight="semibold">
                  Reposición Automática
                </Text>

                <HStack justify="space-between" width="100%">
                  <VStack align="start" gap="1">
                    <Text fontSize="sm" fontWeight="medium">
                      Habilitar sugerencias automáticas
                    </Text>
                    <Text fontSize="xs" color="gray.600">
                      Recibir notificaciones con cantidades recomendadas
                    </Text>
                  </VStack>
                  <Switch
                    checked={config.auto_reorder_enabled}
                    onCheckedChange={handleSwitchChange('auto_reorder_enabled')}
                  />
                </HStack>

                {config.auto_reorder_enabled && (
                  <VStack gap="2" width="100%">
                    <HStack justify="space-between" width="100%">
                      <Text fontSize="sm" fontWeight="medium">
                        Cantidad sugerida para reposición
                      </Text>
                    </HStack>
                    <HStack gap="2" width="100%">
                      <NumberInput.Root
                        value={config.suggested_reorder_quantity.toString()}
                        onValueChange={(e) => handleNumberChange('suggested_reorder_quantity')(e.value)}
                        min={1}
                        step={1}
                        flex="1"
                      >
                        <NumberInput.Field />
                        <NumberInput.Control>
                          <NumberInput.IncrementTrigger />
                          <NumberInput.DecrementTrigger />
                        </NumberInput.Control>
                      </NumberInput.Root>
                      <Text fontSize="sm" color="gray.600" minWidth="40px">
                        {unit}
                      </Text>
                    </HStack>
                    {errors.suggested_reorder_quantity && (
                      <Text fontSize="xs" color="red.500">
                        {errors.suggested_reorder_quantity}
                      </Text>
                    )}
                  </VStack>
                )}
              </VStack>
            </VStack>
          </Dialog.Body>

          <Dialog.Footer>
            <Dialog.CloseTrigger asChild>
              <Button variant="outline" disabled={isSubmitting}>
                Cancelar
              </Button>
            </Dialog.CloseTrigger>
            <Button
              colorPalette="blue"
              onClick={handleSubmit}
              loading={isSubmitting}
              loadingText="Guardando..."
            >
              Guardar Configuración
            </Button>
          </Dialog.Footer>
        </Dialog.Content>
      </Dialog.Positioner>
    </Dialog.Root>
  );
}

/**
 * 🎯 MIGRACIÓN COMPLETADA:
 * 
 * ❌ ANTES: 
 * toaster.create({
 *   title: 'Configuración guardada',
 *   status: 'success',    // ❌ API incorrecta
 *   duration: 3000
 * });
 * 
 * ✅ AHORA:
 * notify.alertConfigSaved(itemName);  // ✅ Helper específico
 * handleApiError(error, 'mensaje');   // ✅ Error handling centralizado
 * 
 * 🚀 BENEFICIOS:
 * - API v3.23.0 correcta (type no status)
 * - Helpers específicos para operaciones
 * - Error handling unificado
 * - Código más limpio y mantenible
 */