// ==================================================
// SUPPLIER FORM CONTENT - Reusable form component
// ==================================================
// PURPOSE: Pure form component consumable via HookPoint
// - Extracted from SupplierFormModal for cross-module use
// - Can be used standalone or within MaterialFormDialog wizard
// - Maintains all validation and business logic via useSupplierForm
// PERFORMANCE: Memoized to prevent unnecessary re-renders from parent

import React, { useCallback } from 'react';
import {
    Stack,
    FormSection,
    Text,
    InputField,
    TextareaField,
    Alert,
    Box,
    Flex,
    Progress,
    SelectField,
    Switch,
    Button
} from '@/shared/ui';
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { useSupplierForm } from '../hooks/useSupplierForm';
import type { Supplier } from '../types/supplierTypes';

const IIBB_CONDITION_OPTIONS = [
    { value: 'local', label: 'Local (Inscripto en una provincia)' },
    { value: 'multilateral', label: 'Convenio Multilateral' },
    { value: 'simplified', label: 'Régimen Simplificado / Monotributo' },
    { value: 'exempt', label: 'Exento / No Alcanzado' }
];

export interface SupplierFormContentProps {
    /** Callback when supplier is successfully created/updated */
    onSuccess: (supplier: Supplier) => void;
    /** Callback when user cancels the form */
    onCancel: () => void;
    /** Optional supplier for edit mode */
    supplier?: Supplier | null;
}

const SupplierFormContentComponent = ({
    onSuccess,
    onCancel,
    supplier
}: SupplierFormContentProps) => {
    const {
        formData,
        handleFieldChange,
        fieldErrors,
        fieldWarnings,
        validationState,
        isSubmitting,
        submitButtonContent,
        operationProgress,
        formStatusBadge,
        handleSubmit: originalHandleSubmit,
        iibbSameAsCuit,
        toggleIibbSync,
        formatCuit,
        cleanCuit
    } = useSupplierForm({
        isOpen: true,
        onClose: onCancel,
        supplier
    });

    // Wrap handleSubmit to call onSuccess with created supplier
    const handleSubmit = useCallback(async () => {
        const createdSupplier = await originalHandleSubmit();
        if (createdSupplier) {
            onSuccess(createdSupplier);
        }
    }, [originalHandleSubmit, onSuccess]);

    return (
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
                        onChange={(e) => handleFieldChange('name', e.target.value)}
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
                        onChange={(e) => handleFieldChange('contact_person', e.target.value)}
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
                        onChange={(e) => handleFieldChange('email', e.target.value)}
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
                        onChange={(e) => handleFieldChange('phone', e.target.value)}
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
                        onChange={(e) => handleFieldChange('address', e.target.value)}
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
                        value={formatCuit(formData.tax_id || '')}
                        onChange={(e) => {
                            const val = e.target.value;
                            if (val.length < (formData.tax_id?.length || 0) || /^[0-9-]*$/.test(val)) {
                                const cleaned = cleanCuit(val);
                                console.log('📝 [DEBUG CUIT INPUT]', {
                                    raw: val,
                                    cleaned,
                                    formatted: formatCuit(cleaned)
                                });
                                handleFieldChange('tax_id', cleaned);
                            }
                        }}
                        placeholder="20-12345678-9"
                        maxLength={13}
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
                </Box>

                <Box>
                    <SelectField
                        label="Condición IIBB"
                        options={IIBB_CONDITION_OPTIONS}
                        value={formData.iibb_condition ? [formData.iibb_condition] : []}
                        onValueChange={(details) => handleFieldChange('iibb_condition', details.value[0])}
                        placeholder="Seleccionar condición..."
                        noPortal={true}
                    />
                </Box>

                {formData.iibb_condition !== 'exempt' && (
                    <Box>
                        <Flex justify="space-between" align="center" mb="2">
                            <Text fontSize="sm" fontWeight="medium">
                                Nro. Inscripción IIBB
                            </Text>
                            <Switch
                                checked={iibbSameAsCuit}
                                onChange={(checked) => toggleIibbSync(checked)}
                                size="sm"
                            >
                                Mismo que CUIT
                            </Switch>
                        </Flex>
                        <InputField
                            value={formData.iibb_number || ''}
                            onChange={(e) => {
                                if (!iibbSameAsCuit) {
                                    handleFieldChange('iibb_number', e.target.value.replace(/\D/g, ''));
                                }
                            }}
                            placeholder="Número de inscripción"
                            disabled={iibbSameAsCuit}
                        />
                    </Box>
                )}

                <Box>
                    <InputField
                        label="Términos de Pago"
                        value={formData.payment_terms}
                        onChange={(e) => handleFieldChange('payment_terms', e.target.value)}
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
                            const value = e.target.value === '' ? undefined : parseFloat(e.target.value);
                            handleFieldChange('rating', value);
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
                    onChange={(e) => handleFieldChange('notes', e.target.value)}
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

            {/* Action Buttons */}
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
                    onClick={onCancel}
                    disabled={isSubmitting}
                    h="44px"
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
                    h="44px"
                    fontSize="md"
                    px="6"
                    w={{ base: 'full', md: 'auto' }}
                >
                    {submitButtonContent}
                </Button>
            </Flex>
        </Stack>
    );
};

// PERFORMANCE: Memoize to prevent re-renders when parent re-renders
// Only re-render when props actually change (onSuccess, onCancel, supplier)
export const SupplierFormContent = React.memo(SupplierFormContentComponent);
