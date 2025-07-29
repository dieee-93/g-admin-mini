// src/features/customers/ui/CustomerForm.tsx - Chakra UI v3.23
import {
  Box, 
  Button, 
  Input, 
  VStack, 
  HStack,
  Textarea, 
  Heading,
  Grid,
  Text,
  Badge
} from '@chakra-ui/react';
import { useState } from 'react';
import { useCustomers } from '../logic/useCustomers'; 
import { useErrorHandler } from '@/hooks/useErrorHandler';
import { type CreateCustomerData, type Customer } from '../types';

interface FormErrors {
  name?: string;
  phone?: string;
  email?: string;
}

interface CustomerFormProps {
  customer?: Customer; // Para modo edición
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function CustomerForm({ customer, onSuccess, onCancel }: CustomerFormProps) {
  const { addCustomer, editCustomer } = useCustomers();
  const { handleError, handleSuccess } = useErrorHandler();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  
  const [form, setForm] = useState({
    name: customer?.name || '',
    phone: customer?.phone || '',
    email: customer?.email || '',
    address: customer?.address || '',
    note: customer?.note || '',
  });

  const isEditMode = !!customer;

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!form.name.trim()) {
      newErrors.name = 'El nombre es requerido';
    }

    // Validación básica de email si se proporciona
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      newErrors.email = 'Email inválido';
    }

    // Validación básica de teléfono si se proporciona
    if (form.phone && form.phone.length < 8) {
      newErrors.phone = 'Teléfono debe tener al menos 8 dígitos';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    
    // Limpiar error del campo cuando el usuario escriba
    if (errors[name as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      const customerData: CreateCustomerData = {
        name: form.name.trim(),
        phone: form.phone.trim() || undefined,
        email: form.email.trim() || undefined,
        address: form.address.trim() || undefined,
        note: form.note.trim() || undefined,
      };

      if (isEditMode) {
        await editCustomer({ id: customer.id, ...customerData });
        handleSuccess('Cliente actualizado correctamente');
      } else {
        await addCustomer(customerData);
        handleSuccess('Cliente creado correctamente');
        
        // Resetear formulario solo en modo creación
        setForm({
          name: '',
          phone: '',
          email: '',
          address: '',
          note: '',
        });
      }

      onSuccess?.();
      
    } catch (error) {
      handleError(error, `Error al ${isEditMode ? 'actualizar' : 'crear'} el cliente`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Box borderWidth="1px" rounded="md" p={6} mb={6} bg="white">
      <HStack justify="space-between" align="center" mb={6}>
        <Heading size="md" color="pink.600">
          {isEditMode ? '✏️ Editar Cliente' : '👥 Nuevo Cliente'}
        </Heading>
        {isEditMode && (
          <Badge colorScheme="pink" variant="subtle">
            Modo edición
          </Badge>
        )}
      </HStack>
      
      <VStack gap="6" align="stretch">
        {/* Información básica */}
        <Box>
          <Text fontSize="sm" fontWeight="medium" color="gray.700" mb={3}>
            Información Básica
          </Text>
          <Grid templateColumns={{ base: "1fr", md: "2fr 1fr" }} gap={4}>
            <Box>
              <Text fontSize="sm" color="gray.600" mb={1}>Nombre completo *</Text>
              <Input
                placeholder="Ej: Juan Pérez"
                name="name"
                value={form.name}
                onChange={handleChange}
                borderColor={errors.name ? 'red.300' : undefined}
              />
              {errors.name && (
                <Text color="red.500" fontSize="sm" mt={1}>
                  {errors.name}
                </Text>
              )}
            </Box>

            <Box>
              <Text fontSize="sm" color="gray.600" mb={1}>Teléfono</Text>
              <Input
                placeholder="Ej: +54 11 1234-5678"
                name="phone"
                value={form.phone}
                onChange={handleChange}
                borderColor={errors.phone ? 'red.300' : undefined}
              />
              {errors.phone && (
                <Text color="red.500" fontSize="sm" mt={1}>
                  {errors.phone}
                </Text>
              )}
            </Box>
          </Grid>
        </Box>

        {/* Contacto */}
        <Box>
          <Text fontSize="sm" fontWeight="medium" color="gray.700" mb={3}>
            Información de Contacto
          </Text>
          <VStack gap="4" align="stretch">
            <Box>
              <Text fontSize="sm" color="gray.600" mb={1}>Email</Text>
              <Input
                placeholder="Ej: juan@email.com"
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                borderColor={errors.email ? 'red.300' : undefined}
              />
              {errors.email && (
                <Text color="red.500" fontSize="sm" mt={1}>
                  {errors.email}
                </Text>
              )}
            </Box>
            
            <Box>
              <Text fontSize="sm" color="gray.600" mb={1}>Dirección</Text>
              <Input
                placeholder="Ej: Av. Corrientes 1234, CABA"
                name="address"
                value={form.address}
                onChange={handleChange}
              />
            </Box>
          </VStack>
        </Box>

        {/* Separador visual */}
        <Box height="1px" bg="gray.200" />

        {/* Notas adicionales */}
        <Box>
          <Text fontSize="sm" fontWeight="medium" color="gray.700" mb={3}>
            Información Adicional
          </Text>
          <Box>
            <Text fontSize="sm" color="gray.600" mb={1}>Notas</Text>
            <Textarea
              placeholder="Información adicional sobre el cliente..."
              name="note"
              value={form.note}
              onChange={handleChange}
              rows={3}
              resize="vertical"
            />
          </Box>
        </Box>

        {/* Botones de acción */}
        <HStack gap="3" pt={2}>
          <Button 
            colorScheme="pink"
            size="lg"
            onClick={handleSubmit}
            loading={isSubmitting}
            loadingText={isEditMode ? "Actualizando..." : "Creando..."}
            flex={1}
          >
            {isEditMode ? '✅ Actualizar Cliente' : '✅ Crear Cliente'}
          </Button>
          
          {onCancel && (
            <Button 
              variant="outline" 
              colorScheme="gray"
              size="lg"
              onClick={onCancel}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
          )}
        </HStack>
      </VStack>
    </Box>
  );
}