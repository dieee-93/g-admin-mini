// src/features/customers/ui/CustomerForm.tsx - Professional Design
import { useState, useCallback, memo } from 'react';
import {
  Stack,
  FormSection,
  Text,
  InputField,
  TextareaField,
  Alert,
  Box,
  Flex,
  Tabs,
  DNIField,
  PhoneField,
  MobileField
} from '@/shared/ui';
import { Button as ChakraButton } from '@chakra-ui/react';
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { useCustomers } from '@/modules/customers/hooks';
import { type CreateCustomerData, type Customer } from '../../types';
import { CRUDHandlers } from '@/shared/utils/errorHandling';
import { useCustomerValidation } from '@/modules/customers/hooks';
import { notify } from '@/lib/notifications';
import { CustomerAddressManager, AddressAutocomplete } from '../AddressManager';
import { type AddressSuggestion } from '@/lib/geocoding';
import { supabase } from '@/lib/supabase/client';

interface CustomerFormProps {
  customer?: Customer;
  onSuccess?: () => void;
  onCancel?: () => void;
}

const CustomerFormComponent = ({ customer, onSuccess, onCancel }: CustomerFormProps) => {
  const { customers, addCustomer, editCustomer, reloadCustomers } = useCustomers();
  const isEditMode = !!customer;

  const [selectedAddress, setSelectedAddress] = useState<AddressSuggestion | null>(null);

  const {
    form,
    fieldErrors,
    fieldWarnings,
    validationState,
    validateForm
  } = useCustomerValidation(
    {
      name: customer?.name || '',
      phone: customer?.phone || '',
      mobile: customer?.mobile || '',
      email: customer?.email || '',
      dni: customer?.dni || '',
      notes: customer?.notes || '',
      address: ''
    },
    customers,
    customer?.id
  );

  const { register, handleSubmit, formState } = form;
  const { isSubmitting } = formState;

  const onSubmit = handleSubmit(async (data) => {
    console.log('🔵 [CustomerForm] onSubmit called with data:', data);

    const isValid = await validateForm();
    console.log('🔵 [CustomerForm] validateForm result:', isValid);

    if (!isValid) {
      notify.error({
        title: 'Validación fallida',
        description: 'Por favor corrige los errores antes de continuar'
      });
      return;
    }

    const customerData: CreateCustomerData = {
      name: data.name.trim(),
      phone: data.phone?.trim() || undefined,
      mobile: data.mobile?.trim() || undefined,
      email: data.email?.trim() || undefined,
      dni: data.dni?.trim() || undefined,
      notes: data.notes?.trim() || undefined,
    };
    console.log('🔵 [CustomerForm] customerData prepared:', customerData);

    if (isEditMode) {
      console.log('🔵 [CustomerForm] Editing customer...');
      await CRUDHandlers.update(
        () => editCustomer({ id: customer.id, ...customerData }),
        'Cliente',
        onSuccess
      );
    } else {
      console.log('🔵 [CustomerForm] Creating new customer...');
      const newCustomer = await CRUDHandlers.create(
        () => addCustomer(customerData),
        'Cliente'
      );
      console.log('🔵 [CustomerForm] newCustomer result:', newCustomer);

      if (selectedAddress && newCustomer?.id) {
        try {
          console.log('🔵 [CustomerForm] Creating address for customer:', newCustomer.id);
          console.log('🔵 [CustomerForm] selectedAddress:', selectedAddress);

          // DEBUG: Log session info
          const { data: sessionData } = await supabase.auth.getSession();
          console.log('🔍 [DEBUG] Current session:', sessionData.session);
          console.log('🔍 [DEBUG] User metadata:', sessionData.session?.user?.user_metadata);
          console.log('🔍 [DEBUG] App metadata:', sessionData.session?.user?.app_metadata);
          console.log('🔍 [DEBUG] JWT claims:', sessionData.session?.user);

          const { data: addressData, error: addressError } = await supabase
            .from('customer_addresses')
            .insert([{
              customer_id: newCustomer.id,
              label: 'Casa',
              address_line_1: `${selectedAddress.calle} ${selectedAddress.altura || 's/n'}`,
              city: selectedAddress.ciudad,
              state: selectedAddress.provincia,
              country: 'Argentina',
              latitude: selectedAddress.latitude,
              longitude: selectedAddress.longitude,
              formatted_address: selectedAddress.nomenclatura,
              is_default: true,
              is_verified: true
            }])
            .select();

          if (addressError) {
            console.error('❌ [CustomerForm] Error creating address:', addressError);
            notify.error({
              title: 'Error al guardar dirección',
              description: `No se pudo guardar la dirección: ${addressError.message}`
            });
          } else {
            console.log('✅ [CustomerForm] Address created successfully:', addressData);
            notify.success({
              title: 'Dirección guardada',
              description: 'La dirección se guardó correctamente'
            });
          }
        } catch (error) {
          console.error('❌ [CustomerForm] Exception creating address:', error);
          notify.error({
            title: 'Error al guardar dirección',
            description: error instanceof Error ? error.message : 'Error desconocido'
          });
        }
      } else {
        if (!selectedAddress) {
          console.log('ℹ️ [CustomerForm] No address selected');
        }
        if (!newCustomer?.id) {
          console.error('❌ [CustomerForm] newCustomer.id is undefined!', newCustomer);
        }
      }

      console.log('🔵 [CustomerForm] Calling onSuccess...');

      // Force refresh of customer list
      await reloadCustomers();

      onSuccess?.();
    }
  });

  // Helper for field styling based on validation
  const getFieldStyle = useCallback((fieldName: string) => ({
    borderColor: fieldErrors[fieldName] ? 'var(--colors-error)' :
      fieldWarnings[fieldName] ? 'var(--colors-warning)' :
        undefined
  }), [fieldErrors, fieldWarnings]);

  // Inline form content to prevent focus loss (no nested component function)
  const formContent = (
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

      {/* Basic Info Section */}
      <FormSection title="Información Personal">
        <Box>
          <InputField
            label="Nombre completo *"
            placeholder="Ej: Juan Pérez"
            {...register('name')}
            style={getFieldStyle('name')}
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

        <DNIField
          label="DNI"
          formatWithDots={true}
          {...register('dni')}
          error={fieldErrors.dni}
        />
      </FormSection>

      {/* Contact Info Section */}
      <FormSection title="Información de Contacto">
        <PhoneField
          label="Teléfono fijo"
          areaCode="011"
          hideAreaCode={false}
          {...register('phone')}
          error={fieldErrors.phone}
          helperText={fieldWarnings.phone ? `⚠️ ${fieldWarnings.phone}` : undefined}
        />

        <MobileField
          label="Celular"
          countryCode="+54"
          {...register('mobile')}
          error={fieldErrors.mobile}
          helperText={fieldWarnings.mobile ? `⚠️ ${fieldWarnings.mobile}` : undefined}
        />

        <Box>
          <InputField
            label="Email"
            type="email"
            placeholder="juan@email.com"
            {...register('email')}
            style={getFieldStyle('email')}
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
      </FormSection>

      {/* Address Section - Only in creation mode */}
      {!isEditMode && (
        <FormSection title="Dirección (opcional)">
          <Box>
            <Text fontSize="sm" color="text.muted" mb="3">
              Busca y selecciona una dirección. Se geocodifica automáticamente para entregas.
            </Text>
            <AddressAutocomplete
              onSelect={(address) => setSelectedAddress(address)}
              placeholder="Ej: Av. Corrientes 1234, CABA"
              showMap={true}
            />
            {selectedAddress && (
              <Alert.Root status="success" variant="subtle" mt="3">
                <Alert.Title>✅ Dirección confirmada</Alert.Title>
                <Alert.Description>
                  {selectedAddress.nomenclatura}
                </Alert.Description>
              </Alert.Root>
            )}
          </Box>
        </FormSection>
      )}

      {/* Notes Section */}
      <FormSection title="Notas">
        <TextareaField
          label="Observaciones"
          placeholder="Preferencias, información adicional sobre el cliente..."
          {...register('notes')}
          rows={3}
        />
      </FormSection>

      {/* Action Buttons */}
      <Flex
        gap="3"
        pt="4"
        justify={{ base: 'stretch', md: 'flex-end' }}
        direction={{ base: 'column-reverse', md: 'row' }}
        borderTop="1px solid"
        borderColor="border"
      >
        {onCancel && (
          <ChakraButton
            variant="outline"
            onClick={onCancel}
            disabled={isSubmitting}
            h="44px"
            fontSize="md"
            px="6"
            w={{ base: 'full', md: 'auto' }}
          >
            Cancelar
          </ChakraButton>
        )}

        <ChakraButton
          colorPalette={isSubmitting ? 'gray' : 'blue'}
          type="submit"
          disabled={isSubmitting}
          h="44px"
          fontSize="md"
          px="6"
          w={{ base: 'full', md: 'auto' }}
        >
          {isSubmitting ? 'Guardando...' : isEditMode ? 'Guardar Cambios' : 'Crear Cliente'}
        </ChakraButton>
      </Flex>
    </Stack>
  );

  return (
    <>
      {isEditMode && customer?.id ? (
        <Tabs.Root defaultValue="basic">
          <Tabs.List>
            <Tabs.Trigger value="basic">Información</Tabs.Trigger>
            <Tabs.Trigger value="addresses">Direcciones</Tabs.Trigger>
          </Tabs.List>

          <Tabs.Content value="basic">
            <form onSubmit={onSubmit}>
              {formContent}
            </form>
          </Tabs.Content>

          <Tabs.Content value="addresses">
            <CustomerAddressManager customerId={customer.id} />
          </Tabs.Content>
        </Tabs.Root>
      ) : (
        <form onSubmit={onSubmit}>
          {formContent}
        </form>
      )}
    </>
  );
};

// PERFORMANCE: Memoize to prevent re-renders when parent re-renders
export const CustomerForm = memo(CustomerFormComponent);
