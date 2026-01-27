/**
 * FULFILLMENT POLICIES FORM MODAL
 * 
 * Modal component for editing fulfillment policies settings
 * @version 1.0.0
 */

import { useState, useEffect } from 'react';
import { Dialog, FormSection, InputField, Button, Stack } from '@/shared/ui';
import { useUpdateFulfillmentPolicies } from '@/hooks/useFulfillmentPolicies';
import type { FulfillmentPolicies } from '@/pages/admin/operations/fulfillment/services/fulfillmentPoliciesApi';

interface FulfillmentPoliciesFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  policy: FulfillmentPolicies | null;
}

interface FormData {
  // Delivery
  default_delivery_fee: string;
  free_delivery_threshold: string;
  min_order_delivery: string;
  
  // Pickup
  pickup_discount_percent: string;
  pickup_ready_time_minutes: string;
  min_order_pickup: string;
  
  // Order Processing
  order_acceptance_timeout_minutes: string;
  
  // Fulfillment Times
  estimated_prep_time_minutes: string;
  estimated_delivery_time_minutes: string;
  max_advance_order_days: string;
  
  // Driver Management
  driver_assignment_radius_km: string;
  max_concurrent_deliveries_per_driver: string;
  
  // Packaging
  packaging_fee: string;
  special_instructions_max_length: string;
  
  // Returns & Refunds
  cancellation_deadline_minutes: string;
  refund_processing_days: string;
  
  // Service Charge
  service_charge_percent: string;
}

interface FieldErrors {
  [key: string]: string | undefined;
}

export function FulfillmentPoliciesFormModal({
  isOpen,
  onClose,
  policy,
}: FulfillmentPoliciesFormModalProps) {
  const updatePolicies = useUpdateFulfillmentPolicies();

  const [formData, setFormData] = useState<FormData>({
    default_delivery_fee: '',
    free_delivery_threshold: '',
    min_order_delivery: '',
    pickup_discount_percent: '',
    pickup_ready_time_minutes: '',
    min_order_pickup: '',
    order_acceptance_timeout_minutes: '',
    estimated_prep_time_minutes: '',
    estimated_delivery_time_minutes: '',
    max_advance_order_days: '',
    driver_assignment_radius_km: '',
    max_concurrent_deliveries_per_driver: '',
    packaging_fee: '',
    special_instructions_max_length: '',
    cancellation_deadline_minutes: '',
    refund_processing_days: '',
    service_charge_percent: '',
  });

  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  useEffect(() => {
    if (isOpen && policy) {
      setFormData({
        default_delivery_fee: policy.default_delivery_fee.toString(),
        free_delivery_threshold: policy.free_delivery_threshold.toString(),
        min_order_delivery: policy.min_order_delivery.toString(),
        pickup_discount_percent: policy.pickup_discount_percent.toString(),
        pickup_ready_time_minutes: policy.pickup_ready_time_minutes.toString(),
        min_order_pickup: policy.min_order_pickup.toString(),
        order_acceptance_timeout_minutes: policy.order_acceptance_timeout_minutes.toString(),
        estimated_prep_time_minutes: policy.estimated_prep_time_minutes.toString(),
        estimated_delivery_time_minutes: policy.estimated_delivery_time_minutes.toString(),
        max_advance_order_days: policy.max_advance_order_days.toString(),
        driver_assignment_radius_km: policy.driver_assignment_radius_km.toString(),
        max_concurrent_deliveries_per_driver: policy.max_concurrent_deliveries_per_driver.toString(),
        packaging_fee: policy.packaging_fee.toString(),
        special_instructions_max_length: policy.special_instructions_max_length.toString(),
        cancellation_deadline_minutes: policy.cancellation_deadline_minutes.toString(),
        refund_processing_days: policy.refund_processing_days.toString(),
        service_charge_percent: policy.service_charge_percent.toString(),
      });
      setFieldErrors({});
    }
  }, [isOpen, policy]);

  const handleFieldChange = (field: keyof FormData) => (value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (fieldErrors[field]) {
      setFieldErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const errors: FieldErrors = {};

    // Delivery validation
    const deliveryFee = parseFloat(formData.default_delivery_fee);
    const freeThreshold = parseFloat(formData.free_delivery_threshold);
    const minDelivery = parseFloat(formData.min_order_delivery);

    if (isNaN(deliveryFee) || deliveryFee < 0) {
      errors.default_delivery_fee = 'Debe ser un valor positivo';
    }
    if (isNaN(freeThreshold) || freeThreshold < 0) {
      errors.free_delivery_threshold = 'Debe ser un valor positivo';
    }
    if (isNaN(minDelivery) || minDelivery < 0) {
      errors.min_order_delivery = 'Debe ser un valor positivo';
    }

    // Pickup validation
    const pickupDiscount = parseFloat(formData.pickup_discount_percent);
    const pickupTime = parseInt(formData.pickup_ready_time_minutes, 10);
    const minPickup = parseFloat(formData.min_order_pickup);

    if (isNaN(pickupDiscount) || pickupDiscount < 0 || pickupDiscount > 100) {
      errors.pickup_discount_percent = 'Debe estar entre 0 y 100';
    }
    if (isNaN(pickupTime) || pickupTime <= 0) {
      errors.pickup_ready_time_minutes = 'Debe ser mayor a 0';
    }
    if (isNaN(minPickup) || minPickup < 0) {
      errors.min_order_pickup = 'Debe ser un valor positivo';
    }

    // Order processing validation
    const timeout = parseInt(formData.order_acceptance_timeout_minutes, 10);
    if (isNaN(timeout) || timeout <= 0) {
      errors.order_acceptance_timeout_minutes = 'Debe ser mayor a 0';
    }

    // Fulfillment times validation
    const prepTime = parseInt(formData.estimated_prep_time_minutes, 10);
    const deliveryTime = parseInt(formData.estimated_delivery_time_minutes, 10);
    const advanceDays = parseInt(formData.max_advance_order_days, 10);

    if (isNaN(prepTime) || prepTime <= 0) {
      errors.estimated_prep_time_minutes = 'Debe ser mayor a 0';
    }
    if (isNaN(deliveryTime) || deliveryTime <= 0) {
      errors.estimated_delivery_time_minutes = 'Debe ser mayor a 0';
    }
    if (isNaN(advanceDays) || advanceDays < 0) {
      errors.max_advance_order_days = 'Debe ser 0 o mayor';
    }

    // Driver validation
    const driverRadius = parseFloat(formData.driver_assignment_radius_km);
    const maxConcurrent = parseInt(formData.max_concurrent_deliveries_per_driver, 10);

    if (isNaN(driverRadius) || driverRadius <= 0) {
      errors.driver_assignment_radius_km = 'Debe ser mayor a 0';
    }
    if (isNaN(maxConcurrent) || maxConcurrent <= 0) {
      errors.max_concurrent_deliveries_per_driver = 'Debe ser mayor a 0';
    }

    // Packaging validation
    const packagingFee = parseFloat(formData.packaging_fee);
    const maxInstructions = parseInt(formData.special_instructions_max_length, 10);

    if (isNaN(packagingFee) || packagingFee < 0) {
      errors.packaging_fee = 'Debe ser un valor positivo o 0';
    }
    if (isNaN(maxInstructions) || maxInstructions <= 0) {
      errors.special_instructions_max_length = 'Debe ser mayor a 0';
    }

    // Returns validation
    const cancelDeadline = parseInt(formData.cancellation_deadline_minutes, 10);
    const refundDays = parseInt(formData.refund_processing_days, 10);

    if (isNaN(cancelDeadline) || cancelDeadline < 0) {
      errors.cancellation_deadline_minutes = 'Debe ser 0 o mayor';
    }
    if (isNaN(refundDays) || refundDays <= 0) {
      errors.refund_processing_days = 'Debe ser mayor a 0';
    }

    // Service charge validation
    const serviceCharge = parseFloat(formData.service_charge_percent);
    if (isNaN(serviceCharge) || serviceCharge < 0 || serviceCharge > 100) {
      errors.service_charge_percent = 'Debe estar entre 0 y 100';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async () => {
    if (!policy || !validateForm()) return;

    try {
      await updatePolicies.mutateAsync({
        id: policy.id,
        updates: {
          default_delivery_fee: parseFloat(formData.default_delivery_fee),
          free_delivery_threshold: parseFloat(formData.free_delivery_threshold),
          min_order_delivery: parseFloat(formData.min_order_delivery),
          pickup_discount_percent: parseFloat(formData.pickup_discount_percent),
          pickup_ready_time_minutes: parseInt(formData.pickup_ready_time_minutes, 10),
          min_order_pickup: parseFloat(formData.min_order_pickup),
          order_acceptance_timeout_minutes: parseInt(formData.order_acceptance_timeout_minutes, 10),
          estimated_prep_time_minutes: parseInt(formData.estimated_prep_time_minutes, 10),
          estimated_delivery_time_minutes: parseInt(formData.estimated_delivery_time_minutes, 10),
          max_advance_order_days: parseInt(formData.max_advance_order_days, 10),
          driver_assignment_radius_km: parseFloat(formData.driver_assignment_radius_km),
          max_concurrent_deliveries_per_driver: parseInt(formData.max_concurrent_deliveries_per_driver, 10),
          packaging_fee: parseFloat(formData.packaging_fee),
          special_instructions_max_length: parseInt(formData.special_instructions_max_length, 10),
          cancellation_deadline_minutes: parseInt(formData.cancellation_deadline_minutes, 10),
          refund_processing_days: parseInt(formData.refund_processing_days, 10),
          service_charge_percent: parseFloat(formData.service_charge_percent),
        },
      });
      onClose();
    } catch {
      // Error handling is done in the mutation hook
    }
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={(details) => !details.open && onClose()}>
      <Dialog.Backdrop />
      <Dialog.Positioner>
        <Dialog.Content maxW="800px" maxH="90vh" overflowY="auto">
          <Dialog.Header>
            <Dialog.Title>Editar Políticas de Fulfillment</Dialog.Title>
          </Dialog.Header>

          <Dialog.Body>
            <Stack gap="6">
              {/* Delivery Configuration */}
              <FormSection title="Configuración de Delivery">
                <Stack gap="4">
                  <InputField
                    label="Tarifa de Delivery por Defecto *"
                    type="number"
                    step="0.01"
                    value={formData.default_delivery_fee}
                    onChange={(e) => handleFieldChange('default_delivery_fee')(e.target.value)}
                    placeholder="50.00"
                    style={{ borderColor: fieldErrors.default_delivery_fee ? 'var(--colors-error)' : undefined }}
                  />
                  {fieldErrors.default_delivery_fee && (
                    <span style={{ fontSize: '0.875rem', color: 'var(--colors-error)' }}>
                      {fieldErrors.default_delivery_fee}
                    </span>
                  )}

                  <InputField
                    label="Delivery Gratis desde *"
                    type="number"
                    step="0.01"
                    value={formData.free_delivery_threshold}
                    onChange={(e) => handleFieldChange('free_delivery_threshold')(e.target.value)}
                    placeholder="500.00"
                    style={{ borderColor: fieldErrors.free_delivery_threshold ? 'var(--colors-error)' : undefined }}
                  />
                  {fieldErrors.free_delivery_threshold && (
                    <span style={{ fontSize: '0.875rem', color: 'var(--colors-error)' }}>
                      {fieldErrors.free_delivery_threshold}
                    </span>
                  )}

                  <InputField
                    label="Pedido Mínimo para Delivery *"
                    type="number"
                    step="0.01"
                    value={formData.min_order_delivery}
                    onChange={(e) => handleFieldChange('min_order_delivery')(e.target.value)}
                    placeholder="200.00"
                    style={{ borderColor: fieldErrors.min_order_delivery ? 'var(--colors-error)' : undefined }}
                  />
                  {fieldErrors.min_order_delivery && (
                    <span style={{ fontSize: '0.875rem', color: 'var(--colors-error)' }}>
                      {fieldErrors.min_order_delivery}
                    </span>
                  )}
                </Stack>
              </FormSection>

              {/* Pickup Configuration */}
              <FormSection title="Configuración de Pickup">
                <Stack gap="4">
                  <InputField
                    label="Descuento por Pickup (%) *"
                    type="number"
                    step="0.01"
                    value={formData.pickup_discount_percent}
                    onChange={(e) => handleFieldChange('pickup_discount_percent')(e.target.value)}
                    placeholder="10.00"
                    style={{ borderColor: fieldErrors.pickup_discount_percent ? 'var(--colors-error)' : undefined }}
                  />
                  {fieldErrors.pickup_discount_percent && (
                    <span style={{ fontSize: '0.875rem', color: 'var(--colors-error)' }}>
                      {fieldErrors.pickup_discount_percent}
                    </span>
                  )}

                  <InputField
                    label="Tiempo de Preparación (minutos) *"
                    type="number"
                    value={formData.pickup_ready_time_minutes}
                    onChange={(e) => handleFieldChange('pickup_ready_time_minutes')(e.target.value)}
                    placeholder="20"
                    style={{ borderColor: fieldErrors.pickup_ready_time_minutes ? 'var(--colors-error)' : undefined }}
                  />
                  {fieldErrors.pickup_ready_time_minutes && (
                    <span style={{ fontSize: '0.875rem', color: 'var(--colors-error)' }}>
                      {fieldErrors.pickup_ready_time_minutes}
                    </span>
                  )}

                  <InputField
                    label="Pedido Mínimo para Pickup *"
                    type="number"
                    step="0.01"
                    value={formData.min_order_pickup}
                    onChange={(e) => handleFieldChange('min_order_pickup')(e.target.value)}
                    placeholder="100.00"
                    style={{ borderColor: fieldErrors.min_order_pickup ? 'var(--colors-error)' : undefined }}
                  />
                  {fieldErrors.min_order_pickup && (
                    <span style={{ fontSize: '0.875rem', color: 'var(--colors-error)' }}>
                      {fieldErrors.min_order_pickup}
                    </span>
                  )}
                </Stack>
              </FormSection>

              {/* Order Processing */}
              <FormSection title="Procesamiento de Pedidos">
                <InputField
                  label="Timeout de Aceptación (minutos) *"
                  type="number"
                  value={formData.order_acceptance_timeout_minutes}
                  onChange={(e) => handleFieldChange('order_acceptance_timeout_minutes')(e.target.value)}
                  placeholder="10"
                  style={{ borderColor: fieldErrors.order_acceptance_timeout_minutes ? 'var(--colors-error)' : undefined }}
                />
                {fieldErrors.order_acceptance_timeout_minutes && (
                  <span style={{ fontSize: '0.875rem', color: 'var(--colors-error)' }}>
                    {fieldErrors.order_acceptance_timeout_minutes}
                  </span>
                )}
              </FormSection>

              {/* Fulfillment Times */}
              <FormSection title="Tiempos de Fulfillment">
                <Stack gap="4">
                  <InputField
                    label="Tiempo de Preparación Estimado (min) *"
                    type="number"
                    value={formData.estimated_prep_time_minutes}
                    onChange={(e) => handleFieldChange('estimated_prep_time_minutes')(e.target.value)}
                    placeholder="30"
                    style={{ borderColor: fieldErrors.estimated_prep_time_minutes ? 'var(--colors-error)' : undefined }}
                  />
                  {fieldErrors.estimated_prep_time_minutes && (
                    <span style={{ fontSize: '0.875rem', color: 'var(--colors-error)' }}>
                      {fieldErrors.estimated_prep_time_minutes}
                    </span>
                  )}

                  <InputField
                    label="Tiempo de Delivery Estimado (min) *"
                    type="number"
                    value={formData.estimated_delivery_time_minutes}
                    onChange={(e) => handleFieldChange('estimated_delivery_time_minutes')(e.target.value)}
                    placeholder="45"
                    style={{ borderColor: fieldErrors.estimated_delivery_time_minutes ? 'var(--colors-error)' : undefined }}
                  />
                  {fieldErrors.estimated_delivery_time_minutes && (
                    <span style={{ fontSize: '0.875rem', color: 'var(--colors-error)' }}>
                      {fieldErrors.estimated_delivery_time_minutes}
                    </span>
                  )}

                  <InputField
                    label="Pedidos con Anticipación Máxima (días) *"
                    type="number"
                    value={formData.max_advance_order_days}
                    onChange={(e) => handleFieldChange('max_advance_order_days')(e.target.value)}
                    placeholder="7"
                    style={{ borderColor: fieldErrors.max_advance_order_days ? 'var(--colors-error)' : undefined }}
                  />
                  {fieldErrors.max_advance_order_days && (
                    <span style={{ fontSize: '0.875rem', color: 'var(--colors-error)' }}>
                      {fieldErrors.max_advance_order_days}
                    </span>
                  )}
                </Stack>
              </FormSection>

              {/* Driver Management */}
              <FormSection title="Gestión de Conductores">
                <Stack gap="4">
                  <InputField
                    label="Radio de Asignación (km) *"
                    type="number"
                    step="0.1"
                    value={formData.driver_assignment_radius_km}
                    onChange={(e) => handleFieldChange('driver_assignment_radius_km')(e.target.value)}
                    placeholder="10.0"
                    style={{ borderColor: fieldErrors.driver_assignment_radius_km ? 'var(--colors-error)' : undefined }}
                  />
                  {fieldErrors.driver_assignment_radius_km && (
                    <span style={{ fontSize: '0.875rem', color: 'var(--colors-error)' }}>
                      {fieldErrors.driver_assignment_radius_km}
                    </span>
                  )}

                  <InputField
                    label="Entregas Simultáneas por Conductor *"
                    type="number"
                    value={formData.max_concurrent_deliveries_per_driver}
                    onChange={(e) => handleFieldChange('max_concurrent_deliveries_per_driver')(e.target.value)}
                    placeholder="3"
                    style={{ borderColor: fieldErrors.max_concurrent_deliveries_per_driver ? 'var(--colors-error)' : undefined }}
                  />
                  {fieldErrors.max_concurrent_deliveries_per_driver && (
                    <span style={{ fontSize: '0.875rem', color: 'var(--colors-error)' }}>
                      {fieldErrors.max_concurrent_deliveries_per_driver}
                    </span>
                  )}
                </Stack>
              </FormSection>

              {/* Packaging */}
              <FormSection title="Empaque y Manejo">
                <Stack gap="4">
                  <InputField
                    label="Cargo por Empaque *"
                    type="number"
                    step="0.01"
                    value={formData.packaging_fee}
                    onChange={(e) => handleFieldChange('packaging_fee')(e.target.value)}
                    placeholder="0.00"
                    style={{ borderColor: fieldErrors.packaging_fee ? 'var(--colors-error)' : undefined }}
                  />
                  {fieldErrors.packaging_fee && (
                    <span style={{ fontSize: '0.875rem', color: 'var(--colors-error)' }}>
                      {fieldErrors.packaging_fee}
                    </span>
                  )}

                  <InputField
                    label="Máximo de Caracteres en Instrucciones *"
                    type="number"
                    value={formData.special_instructions_max_length}
                    onChange={(e) => handleFieldChange('special_instructions_max_length')(e.target.value)}
                    placeholder="500"
                    style={{ borderColor: fieldErrors.special_instructions_max_length ? 'var(--colors-error)' : undefined }}
                  />
                  {fieldErrors.special_instructions_max_length && (
                    <span style={{ fontSize: '0.875rem', color: 'var(--colors-error)' }}>
                      {fieldErrors.special_instructions_max_length}
                    </span>
                  )}
                </Stack>
              </FormSection>

              {/* Returns & Refunds */}
              <FormSection title="Devoluciones y Reembolsos">
                <Stack gap="4">
                  <InputField
                    label="Límite de Cancelación (minutos) *"
                    type="number"
                    value={formData.cancellation_deadline_minutes}
                    onChange={(e) => handleFieldChange('cancellation_deadline_minutes')(e.target.value)}
                    placeholder="15"
                    style={{ borderColor: fieldErrors.cancellation_deadline_minutes ? 'var(--colors-error)' : undefined }}
                  />
                  {fieldErrors.cancellation_deadline_minutes && (
                    <span style={{ fontSize: '0.875rem', color: 'var(--colors-error)' }}>
                      {fieldErrors.cancellation_deadline_minutes}
                    </span>
                  )}

                  <InputField
                    label="Días para Procesar Reembolso *"
                    type="number"
                    value={formData.refund_processing_days}
                    onChange={(e) => handleFieldChange('refund_processing_days')(e.target.value)}
                    placeholder="7"
                    style={{ borderColor: fieldErrors.refund_processing_days ? 'var(--colors-error)' : undefined }}
                  />
                  {fieldErrors.refund_processing_days && (
                    <span style={{ fontSize: '0.875rem', color: 'var(--colors-error)' }}>
                      {fieldErrors.refund_processing_days}
                    </span>
                  )}
                </Stack>
              </FormSection>

              {/* Service Charge */}
              <FormSection title="Cargo por Servicio">
                <InputField
                  label="Porcentaje de Cargo por Servicio (%) *"
                  type="number"
                  step="0.01"
                  value={formData.service_charge_percent}
                  onChange={(e) => handleFieldChange('service_charge_percent')(e.target.value)}
                  placeholder="10.00"
                  style={{ borderColor: fieldErrors.service_charge_percent ? 'var(--colors-error)' : undefined }}
                />
                {fieldErrors.service_charge_percent && (
                  <span style={{ fontSize: '0.875rem', color: 'var(--colors-error)' }}>
                    {fieldErrors.service_charge_percent}
                  </span>
                )}
              </FormSection>
            </Stack>
          </Dialog.Body>

          <Dialog.Footer>
            <Dialog.CloseTrigger asChild>
              <Button variant="outline" onClick={onClose}>
                Cancelar
              </Button>
            </Dialog.CloseTrigger>
            <Button
              onClick={handleSubmit}
              disabled={updatePolicies.isPending}
              colorPalette="purple"
            >
              {updatePolicies.isPending ? 'Guardando...' : 'Guardar Cambios'}
            </Button>
          </Dialog.Footer>
        </Dialog.Content>
      </Dialog.Positioner>
    </Dialog.Root>
  );
}
