// ============================================
// SUPPLIER FORM MODAL - Create/Edit supplier
// ============================================
// ARCHITECTURE: Follows Material Form pattern
// - Business logic in useSupplierForm hook
// - UI component is presentational only
// - Integrates useSupplierValidation for validation
// - Shows validation summary, field errors/warnings
// - Progress indicator during submission

import React from 'react';
import {
  Button,
  Stack,
  FormSection,
  Text,
  InputField,
  TextareaField,
  Dialog,
  Alert,
  Box,
  Flex,
  Progress
} from '@/shared/ui';
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { useSupplierForm } from '../hooks/useSupplierForm';
import type { Supplier } from '../types/supplierTypes';

interface SupplierFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  supplier?: Supplier | null;
}

export function SupplierFormModal({ isOpen, onClose, supplier }: SupplierFormModalProps) {
  const {
    formData,
    handleFieldChange,
    fieldErrors,
    fieldWarnings,
    validationState,
    isSubmitting,
    modalTitle,
    submitButtonContent,
    operationProgress,
    formStatusBadge,
    handleSubmit,
    onClose: closeModal
  } = useSupplierForm({ isOpen, onClose, supplier });

  return (
    <Dialog.Root
      open={isOpen}
      onOpenChange={(details) => !details.open && !isSubmitting && closeModal()}
      size={{ base: 'full', md: 'xl' }}
      closeOnEscape={!isSubmitting}
    >
      <Dialog.Backdrop />
      <Dialog.Positioner>
        <Dialog.Content
          maxW={{ base: '100%', md: '800px' }}
          maxH={{ base: '100vh', md: '90vh' }}
          w="full"
          overflowY="auto"
          borderRadius={{ base: '0', md: 'lg' }}
          m={{ base: '0', md: '4' }}
        >
          <Dialog.CloseTrigger />
          <Dialog.Header>
            <Dialog.Title>{modalTitle}</Dialog.Title>
          </Dialog.Header>

          <Dialog.Body p={{ base: '4', md: '6' }}>
            <Stack gap={{ base: '4', md: '6' }} w="full">
              {/* Validation Summary */}
              {validationState.hasErrors && (
                <Alert.Root status="error" variant="subtle">
                  <Alert.Indicator>
                    <ExclamationTriangleIcon style={{ width: '20px', height: '20px' }} />
                  </Alert.Indicator>
                  <Alert.Title>Errores de validación</Alert.Title>
                  <Alert.Description>
                    Por favor corrige {validationState.errorCount} error(es) antes de continuar
                  </Alert.Description>
                </Alert.Root>
              )}

              {validationState.hasWarnings && !validationState.hasErrors && (
                <Alert.Root status="warning" variant="subtle">
                  <Alert.Indicator>
                    <ExclamationTriangleIcon style={{ width: '20px', height: '20px' }} />
                  </Alert.Indicator>
                  <Alert.Title>Advertencias</Alert.Title>
                  <Alert.Description>
                    Hay {validationState.warningCount} advertencia(s). Puedes continuar pero revisa los campos marcados.
                  </Alert.Description>
                </Alert.Root>
              )}

              {/* Form Status Badge */}
              <Flex justify="space-between" align="center">
                <Text fontSize="lg" fontWeight="bold">
                  Información del Proveedor
                </Text>
                {formStatusBadge}
              </Flex>

              {/* Basic Info */}
              <FormSection title="Información Básica">
                <Box>
                  <InputField
                    label="Nombre *"
                    value={formData.name}
                    onChange={(e) => handleFieldChange('name')(e.target.value)}
                    placeholder="Ej: Distribuidora Central"
                    style={{
                      borderColor: fieldErrors.name ? 'var(--colors-error)' :
                                   fieldWarnings.name ? 'var(--colors-warning)' :
                                   undefined
                    }}
                  />
                  {fieldErrors.name && (
                    <Text color="error" fontSize="sm" mt="1">
                      ❌ {fieldErrors.name}
                    </Text>
                  )}
                  {!fieldErrors.name && fieldWarnings.name && (
                    <Text color="warning" fontSize="sm" mt="1">
                      ⚠️ {fieldWarnings.name}
                    </Text>
                  )}
                </Box>

                <Box>
                  <InputField
                    label="Persona de Contacto"
                    value={formData.contact_person}
                    onChange={(e) => handleFieldChange('contact_person')(e.target.value)}
                    placeholder="Ej: Juan Pérez"
                    style={{
                      borderColor: fieldWarnings.contact_person ? 'var(--colors-warning)' : undefined
                    }}
                  />
                  {fieldWarnings.contact_person && (
                    <Text color="warning" fontSize="sm" mt="1">
                      ⚠️ {fieldWarnings.contact_person}
                    </Text>
                  )}
                </Box>
              </FormSection>

              {/* Contact Info */}
              <FormSection title="Información de Contacto">
                <Box>
                  <InputField
                    label="Email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleFieldChange('email')(e.target.value)}
                    placeholder="proveedor@empresa.com"
                    style={{
                      borderColor: fieldErrors.email ? 'var(--colors-error)' :
                                   fieldWarnings.email ? 'var(--colors-warning)' :
                                   undefined
                    }}
                  />
                  {fieldErrors.email && (
                    <Text color="error" fontSize="sm" mt="1">
                      ❌ {fieldErrors.email}
                    </Text>
                  )}
                  {!fieldErrors.email && fieldWarnings.email && (
                    <Text color="warning" fontSize="sm" mt="1">
                      ⚠️ {fieldWarnings.email}
                    </Text>
                  )}
                </Box>

                <Box>
                  <InputField
                    label="Teléfono"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleFieldChange('phone')(e.target.value)}
                    placeholder="+54 11 1234-5678"
                    style={{
                      borderColor: fieldWarnings.phone ? 'var(--colors-warning)' : undefined
                    }}
                  />
                  {fieldWarnings.phone && (
                    <Text color="warning" fontSize="sm" mt="1">
                      ⚠️ {fieldWarnings.phone}
                    </Text>
                  )}
                </Box>

                <Box>
                  <TextareaField
                    label="Dirección"
                    value={formData.address}
                    onChange={(e) => handleFieldChange('address')(e.target.value)}
                    placeholder="Dirección completa"
                    rows={2}
                  />
                </Box>
              </FormSection>

              {/* Business Info */}
              <FormSection title="Información Comercial">
                <Box>
                  <InputField
                    label="CUIT/CUIL"
                    value={formData.tax_id}
                    onChange={(e) => handleFieldChange('tax_id')(e.target.value)}
                    placeholder="20-12345678-9"
                    style={{
                      borderColor: fieldErrors.tax_id ? 'var(--colors-error)' :
                                   fieldWarnings.tax_id ? 'var(--colors-warning)' :
                                   undefined
                    }}
                  />
                  {fieldErrors.tax_id && (
                    <Text color="error" fontSize="sm" mt="1">
                      ❌ {fieldErrors.tax_id}
                    </Text>
                  )}
                  {!fieldErrors.tax_id && fieldWarnings.tax_id && (
                    <Text color="warning" fontSize="sm" mt="1">
                      ⚠️ {fieldWarnings.tax_id}
                    </Text>
                  )}
                </Box>

                <Box>
                  <InputField
                    label="Términos de Pago"
                    value={formData.payment_terms}
                    onChange={(e) => handleFieldChange('payment_terms')(e.target.value)}
                    placeholder="30 días"
                    style={{
                      borderColor: fieldWarnings.payment_terms ? 'var(--colors-warning)' : undefined
                    }}
                  />
                  {fieldWarnings.payment_terms && (
                    <Text color="warning" fontSize="sm" mt="1">
                      ⚠️ {fieldWarnings.payment_terms}
                    </Text>
                  )}
                </Box>

                <Box>
                  <InputField
                    label="Rating (1-5)"
                    type="number"
                    value={formData.rating ?? ''}
                    onChange={(e) => {
                      const value = e.target.value === '' ? null : parseFloat(e.target.value);
                      handleFieldChange('rating')(value);
                    }}
                    min={1}
                    max={5}
                    step={0.1}
                    placeholder="4.5"
                    style={{
                      borderColor: fieldErrors.rating ? 'var(--colors-error)' :
                                   fieldWarnings.rating ? 'var(--colors-warning)' :
                                   undefined
                    }}
                  />
                  {fieldErrors.rating && (
                    <Text color="error" fontSize="sm" mt="1">
                      ❌ {fieldErrors.rating}
                    </Text>
                  )}
                  {!fieldErrors.rating && fieldWarnings.rating && (
                    <Text color="warning" fontSize="sm" mt="1">
                      ⚠️ {fieldWarnings.rating}
                    </Text>
                  )}
                </Box>
              </FormSection>

              {/* Notes */}
              <FormSection title="Notas">
                <TextareaField
                  label="Observaciones"
                  value={formData.notes}
                  onChange={(e) => handleFieldChange('notes')(e.target.value)}
                  placeholder="Notas adicionales..."
                  rows={3}
                />
              </FormSection>

              {/* Operation Progress */}
              {operationProgress && (
                <Box w="full" mt="4">
                  <Stack gap="2">
                    <Flex justify="space-between" align="center">
                      <Text fontSize="sm" color="text.muted">
                        {operationProgress.currentStep}
                      </Text>
                      <Text fontSize="sm" color="text.muted">
                        {operationProgress.progress}%
                      </Text>
                    </Flex>
                    <Progress.Root value={operationProgress.progress} size="sm" colorPalette="blue">
                      <Progress.Track>
                        <Progress.Range />
                      </Progress.Track>
                    </Progress.Root>
                  </Stack>
                </Box>
              )}
            </Stack>
          </Dialog.Body>

          <Dialog.Footer>
            <Flex
              gap="3"
              pt="4"
              justify={{ base: 'stretch', md: 'flex-end' }}
              direction={{ base: 'column-reverse', md: 'row' }}
              borderTop="1px solid"
              borderColor="border"
            >
              <Button
                variant="outline"
                onClick={closeModal}
                disabled={isSubmitting}
                height="44px"
                fontSize="md"
                px="6"
                w={{ base: 'full', md: 'auto' }}
              >
                Cancelar
              </Button>

              <Button
                colorPalette={isSubmitting ? 'gray' : 'blue'}
                onClick={handleSubmit}
                disabled={validationState.hasErrors || isSubmitting}
                height="44px"
                fontSize="md"
                px="6"
                w={{ base: 'full', md: 'auto' }}
              >
                {submitButtonContent}
              </Button>
            </Flex>
          </Dialog.Footer>
        </Dialog.Content>
      </Dialog.Positioner>
    </Dialog.Root>
  );
}
