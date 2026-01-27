/**
 * INVENTORY ALERT SETTINGS FORM MODAL
 * 
 * Modal for editing inventory alert thresholds and reorder rules
 * Follows pattern from SupplierFormModal.tsx (FormSection + Dialog)
 */

import { useState, useEffect } from 'react';
import {
  Dialog,
  Button,
  FormSection,
  InputField,
  Stack,
  Text,
  Box,
  Flex,
  SelectField,
} from '@/shared/ui';
import { useUpdateInventoryAlertSettings } from '@/modules/materials';
import type { InventoryAlertSettings } from '@/pages/admin/supply-chain/materials/services/inventoryAlertsApi';

interface InventoryAlertSettingsFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: InventoryAlertSettings;
}

interface FormData {
  // Thresholds
  low_stock_threshold: number;
  critical_stock_threshold: number;
  out_of_stock_threshold: number;
  
  // ABC Analysis
  abc_a_threshold: number;
  abc_b_threshold: number;
  abc_c_threshold: number;
  
  // Expiry
  expiry_warning_days: number;
  expiry_critical_days: number;
  
  // Waste
  waste_threshold_percent: number;
  
  // Reorder Rules
  reorder_method: 'economic_order_quantity' | 'fixed' | 'days_of_supply';
  min_order: number;
  max_order: number;
  safety_stock_days: number;
  lead_time_days: number;
  reorder_multiplier: number;
}

interface FieldErrors {
  low_stock_threshold?: string;
  critical_stock_threshold?: string;
  out_of_stock_threshold?: string;
  abc_a_threshold?: string;
  abc_b_threshold?: string;
  abc_c_threshold?: string;
  expiry_warning_days?: string;
  expiry_critical_days?: string;
  waste_threshold_percent?: string;
  min_order?: string;
  max_order?: string;
  safety_stock_days?: string;
  lead_time_days?: string;
  reorder_multiplier?: string;
}

const REORDER_METHOD_OPTIONS = [
  { value: 'economic_order_quantity', label: 'Cantidad Económica de Pedido (EOQ)' },
  { value: 'fixed', label: 'Cantidad Fija' },
  { value: 'days_of_supply', label: 'Días de Suministro' },
];

export function InventoryAlertSettingsFormModal({
  isOpen,
  onClose,
  settings,
}: InventoryAlertSettingsFormModalProps) {
  const [formData, setFormData] = useState<FormData>({
    low_stock_threshold: 10,
    critical_stock_threshold: 5,
    out_of_stock_threshold: 0,
    abc_a_threshold: 80,
    abc_b_threshold: 15,
    abc_c_threshold: 5,
    expiry_warning_days: 7,
    expiry_critical_days: 3,
    waste_threshold_percent: 5,
    reorder_method: 'economic_order_quantity',
    min_order: 10,
    max_order: 100,
    safety_stock_days: 7,
    lead_time_days: 3,
    reorder_multiplier: 1.5,
  });

  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  const updateSettings = useUpdateInventoryAlertSettings();

  // Initialize form data when modal opens
  useEffect(() => {
    if (isOpen && settings) {
      setFormData({
        low_stock_threshold: settings.low_stock_threshold,
        critical_stock_threshold: settings.critical_stock_threshold,
        out_of_stock_threshold: settings.out_of_stock_threshold,
        abc_a_threshold: settings.abc_analysis_thresholds.a_threshold,
        abc_b_threshold: settings.abc_analysis_thresholds.b_threshold,
        abc_c_threshold: settings.abc_analysis_thresholds.c_threshold,
        expiry_warning_days: settings.expiry_warning_days,
        expiry_critical_days: settings.expiry_critical_days,
        waste_threshold_percent: settings.waste_threshold_percent,
        reorder_method: settings.reorder_quantity_rules.method,
        min_order: settings.reorder_quantity_rules.min_order,
        max_order: settings.reorder_quantity_rules.max_order,
        safety_stock_days: settings.reorder_quantity_rules.safety_stock_days,
        lead_time_days: settings.reorder_quantity_rules.lead_time_days,
        reorder_multiplier: settings.reorder_quantity_rules.reorder_multiplier,
      });
      setFieldErrors({});
    }
  }, [isOpen, settings]);

  // Field change handler
  const handleFieldChange = (field: keyof FormData) => (value: string | number) => {
    const numValue = typeof value === 'string' ? parseFloat(value) : value;
    
    setFormData((prev) => ({
      ...prev,
      [field]: numValue,
    }));

    // Clear error for this field
    if (fieldErrors[field as keyof FieldErrors]) {
      setFieldErrors((prev) => ({
        ...prev,
        [field]: undefined,
      }));
    }
  };

  // Validation
  const validate = (): boolean => {
    const errors: FieldErrors = {};

    // Threshold validation: low > critical >= out_of_stock
    if (formData.low_stock_threshold <= formData.critical_stock_threshold) {
      errors.low_stock_threshold = 'Debe ser mayor que stock crítico';
    }
    if (formData.critical_stock_threshold < formData.out_of_stock_threshold) {
      errors.critical_stock_threshold = 'Debe ser mayor o igual que sin stock';
    }
    if (formData.out_of_stock_threshold < 0) {
      errors.out_of_stock_threshold = 'No puede ser negativo';
    }

    // ABC validation: must sum to 100
    const abcSum =
      formData.abc_a_threshold + formData.abc_b_threshold + formData.abc_c_threshold;
    if (Math.abs(abcSum - 100) > 0.01) {
      errors.abc_a_threshold = 'La suma de A+B+C debe ser 100%';
    }

    // Expiry validation: warning > critical >= 0
    if (formData.expiry_warning_days <= formData.expiry_critical_days) {
      errors.expiry_warning_days = 'Debe ser mayor que días críticos';
    }
    if (formData.expiry_critical_days < 0) {
      errors.expiry_critical_days = 'No puede ser negativo';
    }

    // Waste validation: 0-100%
    if (formData.waste_threshold_percent < 0 || formData.waste_threshold_percent > 100) {
      errors.waste_threshold_percent = 'Debe estar entre 0 y 100';
    }

    // Reorder validation: max > min > 0
    if (formData.min_order <= 0) {
      errors.min_order = 'Debe ser mayor que 0';
    }
    if (formData.max_order <= formData.min_order) {
      errors.max_order = 'Debe ser mayor que pedido mínimo';
    }
    if (formData.safety_stock_days < 0) {
      errors.safety_stock_days = 'No puede ser negativo';
    }
    if (formData.lead_time_days < 0) {
      errors.lead_time_days = 'No puede ser negativo';
    }
    if (formData.reorder_multiplier <= 0) {
      errors.reorder_multiplier = 'Debe ser mayor que 0';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Submit handler
  const handleSubmit = () => {
    if (!validate()) return;

    updateSettings.mutate(
      {
        id: settings.id,
        updates: {
          low_stock_threshold: formData.low_stock_threshold,
          critical_stock_threshold: formData.critical_stock_threshold,
          out_of_stock_threshold: formData.out_of_stock_threshold,
          abc_analysis_thresholds: {
            a_threshold: formData.abc_a_threshold,
            b_threshold: formData.abc_b_threshold,
            c_threshold: formData.abc_c_threshold,
          },
          expiry_warning_days: formData.expiry_warning_days,
          expiry_critical_days: formData.expiry_critical_days,
          waste_threshold_percent: formData.waste_threshold_percent,
          reorder_quantity_rules: {
            method: formData.reorder_method,
            min_order: formData.min_order,
            max_order: formData.max_order,
            safety_stock_days: formData.safety_stock_days,
            lead_time_days: formData.lead_time_days,
            order_point_method: 'reorder_point',
            reorder_multiplier: formData.reorder_multiplier,
          },
        },
      },
      {
        onSuccess: () => {
          onClose();
        },
      }
    );
  };

  return (
    <Dialog.Root
      open={isOpen}
      onOpenChange={(details) => {
        if (!details.open && !updateSettings.isPending) {
          onClose();
        }
      }}
    >
      <Dialog.Backdrop />
      <Dialog.Positioner>
        <Dialog.Content maxWidth="3xl">
          <Dialog.Header>
            <Dialog.Title>Editar Configuración de Alertas</Dialog.Title>
            <Dialog.CloseTrigger />
          </Dialog.Header>

          <Dialog.Body>
            <Stack gap={6}>
              {/* Stock Thresholds */}
              <FormSection
                title="Umbrales de Stock"
                description="Define los niveles críticos de inventario"
              >
                <Stack gap="4">
                  <InputField
                    label="Stock Bajo *"
                    type="number"
                    value={formData.low_stock_threshold}
                    onChange={(e) =>
                      handleFieldChange('low_stock_threshold')(e.target.value)
                    }
                    style={{
                      borderColor: fieldErrors.low_stock_threshold
                        ? 'var(--colors-error)'
                        : undefined,
                    }}
                  />
                  {fieldErrors.low_stock_threshold && (
                    <Text color="red.500" fontSize="sm">
                      {fieldErrors.low_stock_threshold}
                    </Text>
                  )}

                  <InputField
                    label="Stock Crítico *"
                    type="number"
                    value={formData.critical_stock_threshold}
                    onChange={(e) =>
                      handleFieldChange('critical_stock_threshold')(e.target.value)
                    }
                    style={{
                      borderColor: fieldErrors.critical_stock_threshold
                        ? 'var(--colors-error)'
                        : undefined,
                    }}
                  />
                  {fieldErrors.critical_stock_threshold && (
                    <Text color="red.500" fontSize="sm">
                      {fieldErrors.critical_stock_threshold}
                    </Text>
                  )}

                  <InputField
                    label="Sin Stock *"
                    type="number"
                    value={formData.out_of_stock_threshold}
                    onChange={(e) =>
                      handleFieldChange('out_of_stock_threshold')(e.target.value)
                    }
                    style={{
                      borderColor: fieldErrors.out_of_stock_threshold
                        ? 'var(--colors-error)'
                        : undefined,
                    }}
                  />
                  {fieldErrors.out_of_stock_threshold && (
                    <Text color="red.500" fontSize="sm">
                      {fieldErrors.out_of_stock_threshold}
                    </Text>
                  )}
                </Stack>
              </FormSection>

              {/* ABC Analysis Thresholds */}
              <FormSection
                title="Umbrales de Análisis ABC"
                description="Porcentajes de clasificación (deben sumar 100%)"
              >
                <Stack gap="4">
                  <Flex gap="4">
                    <Box flex="1">
                      <InputField
                        label="Categoría A (%) *"
                        type="number"
                        value={formData.abc_a_threshold}
                        onChange={(e) =>
                          handleFieldChange('abc_a_threshold')(e.target.value)
                        }
                        style={{
                          borderColor: fieldErrors.abc_a_threshold
                            ? 'var(--colors-error)'
                            : undefined,
                        }}
                      />
                    </Box>
                    <Box flex="1">
                      <InputField
                        label="Categoría B (%) *"
                        type="number"
                        value={formData.abc_b_threshold}
                        onChange={(e) =>
                          handleFieldChange('abc_b_threshold')(e.target.value)
                        }
                      />
                    </Box>
                    <Box flex="1">
                      <InputField
                        label="Categoría C (%) *"
                        type="number"
                        value={formData.abc_c_threshold}
                        onChange={(e) =>
                          handleFieldChange('abc_c_threshold')(e.target.value)
                        }
                      />
                    </Box>
                  </Flex>
                  {fieldErrors.abc_a_threshold && (
                    <Text color="red.500" fontSize="sm">
                      {fieldErrors.abc_a_threshold}
                    </Text>
                  )}
                </Stack>
              </FormSection>

              {/* Expiry Alerts */}
              <FormSection
                title="Alertas de Vencimiento"
                description="Días antes del vencimiento para activar alertas"
              >
                <Stack gap="4">
                  <InputField
                    label="Advertencia (días) *"
                    type="number"
                    value={formData.expiry_warning_days}
                    onChange={(e) =>
                      handleFieldChange('expiry_warning_days')(e.target.value)
                    }
                    style={{
                      borderColor: fieldErrors.expiry_warning_days
                        ? 'var(--colors-error)'
                        : undefined,
                    }}
                  />
                  {fieldErrors.expiry_warning_days && (
                    <Text color="red.500" fontSize="sm">
                      {fieldErrors.expiry_warning_days}
                    </Text>
                  )}

                  <InputField
                    label="Crítica (días) *"
                    type="number"
                    value={formData.expiry_critical_days}
                    onChange={(e) =>
                      handleFieldChange('expiry_critical_days')(e.target.value)
                    }
                    style={{
                      borderColor: fieldErrors.expiry_critical_days
                        ? 'var(--colors-error)'
                        : undefined,
                    }}
                  />
                  {fieldErrors.expiry_critical_days && (
                    <Text color="red.500" fontSize="sm">
                      {fieldErrors.expiry_critical_days}
                    </Text>
                  )}
                </Stack>
              </FormSection>

              {/* Waste Threshold */}
              <FormSection
                title="Umbral de Desperdicio"
                description="Porcentaje de desperdicio para activar alerta"
              >
                <InputField
                  label="Desperdicio (%) *"
                  type="number"
                  value={formData.waste_threshold_percent}
                  onChange={(e) =>
                    handleFieldChange('waste_threshold_percent')(e.target.value)
                  }
                  style={{
                    borderColor: fieldErrors.waste_threshold_percent
                      ? 'var(--colors-error)'
                      : undefined,
                  }}
                />
                {fieldErrors.waste_threshold_percent && (
                  <Text color="red.500" fontSize="sm">
                    {fieldErrors.waste_threshold_percent}
                  </Text>
                )}
              </FormSection>

              {/* Reorder Rules */}
              <FormSection
                title="Reglas de Auto-Reorden"
                description="Configuración para generación automática de órdenes"
              >
                <Stack gap="4">
                  <SelectField
                    label="Método de Reorden *"
                    value={[formData.reorder_method]}
                    onValueChange={(details) =>
                      handleFieldChange('reorder_method')(
                        details.value[0] as FormData['reorder_method']
                      )
                    }
                    options={REORDER_METHOD_OPTIONS}
                  />

                  <Flex gap="4">
                    <Box flex="1">
                      <InputField
                        label="Pedido Mínimo *"
                        type="number"
                        value={formData.min_order}
                        onChange={(e) => handleFieldChange('min_order')(e.target.value)}
                        style={{
                          borderColor: fieldErrors.min_order
                            ? 'var(--colors-error)'
                            : undefined,
                        }}
                      />
                      {fieldErrors.min_order && (
                        <Text color="red.500" fontSize="sm">
                          {fieldErrors.min_order}
                        </Text>
                      )}
                    </Box>
                    <Box flex="1">
                      <InputField
                        label="Pedido Máximo *"
                        type="number"
                        value={formData.max_order}
                        onChange={(e) => handleFieldChange('max_order')(e.target.value)}
                        style={{
                          borderColor: fieldErrors.max_order
                            ? 'var(--colors-error)'
                            : undefined,
                        }}
                      />
                      {fieldErrors.max_order && (
                        <Text color="red.500" fontSize="sm">
                          {fieldErrors.max_order}
                        </Text>
                      )}
                    </Box>
                  </Flex>

                  <Flex gap="4">
                    <Box flex="1">
                      <InputField
                        label="Stock de Seguridad (días) *"
                        type="number"
                        value={formData.safety_stock_days}
                        onChange={(e) =>
                          handleFieldChange('safety_stock_days')(e.target.value)
                        }
                        style={{
                          borderColor: fieldErrors.safety_stock_days
                            ? 'var(--colors-error)'
                            : undefined,
                        }}
                      />
                      {fieldErrors.safety_stock_days && (
                        <Text color="red.500" fontSize="sm">
                          {fieldErrors.safety_stock_days}
                        </Text>
                      )}
                    </Box>
                    <Box flex="1">
                      <InputField
                        label="Tiempo de Entrega (días) *"
                        type="number"
                        value={formData.lead_time_days}
                        onChange={(e) =>
                          handleFieldChange('lead_time_days')(e.target.value)
                        }
                        style={{
                          borderColor: fieldErrors.lead_time_days
                            ? 'var(--colors-error)'
                            : undefined,
                        }}
                      />
                      {fieldErrors.lead_time_days && (
                        <Text color="red.500" fontSize="sm">
                          {fieldErrors.lead_time_days}
                        </Text>
                      )}
                    </Box>
                  </Flex>

                  <InputField
                    label="Multiplicador de Reorden *"
                    type="number"
                    step="0.1"
                    value={formData.reorder_multiplier}
                    onChange={(e) =>
                      handleFieldChange('reorder_multiplier')(e.target.value)
                    }
                    style={{
                      borderColor: fieldErrors.reorder_multiplier
                        ? 'var(--colors-error)'
                        : undefined,
                    }}
                  />
                  {fieldErrors.reorder_multiplier && (
                    <Text color="red.500" fontSize="sm">
                      {fieldErrors.reorder_multiplier}
                    </Text>
                  )}
                </Stack>
              </FormSection>
            </Stack>
          </Dialog.Body>

          <Dialog.Footer>
            <Button
              variant="outline"
              onClick={onClose}
              disabled={updateSettings.isPending}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSubmit}
              loading={updateSettings.isPending}
              colorPalette="blue"
            >
              Guardar Cambios
            </Button>
          </Dialog.Footer>
        </Dialog.Content>
      </Dialog.Positioner>
    </Dialog.Root>
  );
}
