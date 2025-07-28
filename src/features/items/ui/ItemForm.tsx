// src/features/items/ui/ItemForm.tsx - Versión mejorada
import {
  Box, Button, Input, Select, Stack, Text, FormControl, FormErrorMessage
} from '@chakra-ui/react';
import { useState } from 'react';
import { useItems } from '../logic/useItems'; // Renombrado de useItem
import { useErrorHandler } from '@/hooks/useErrorHandler';
import { type ItemType } from '../types';

interface ItemFormData {
  name: string;
  type: ItemType | '';
  unit: string;
  unit_cost: string;
}

interface FormErrors {
  name?: string;
  type?: string;
  unit?: string;
  unit_cost?: string;
}

const ITEM_TYPES: { value: ItemType; label: string }[] = [
  { value: 'UNIT', label: 'Unidades' },
  { value: 'WEIGHT', label: 'Peso' },
  { value: 'VOLUME', label: 'Volumen' },
  { value: 'ELABORATED', label: 'Elaborado' },
];

export function ItemForm() {
  const { addItem } = useItems();
  const { handleError, handleSuccess } = useErrorHandler();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  
  const [form, setForm] = useState<ItemFormData>({
    name: '',
    type: '',
    unit: '',
    unit_cost: '',
  });

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!form.name.trim()) {
      newErrors.name = 'El nombre es requerido';
    }

    if (!form.type) {
      newErrors.type = 'El tipo es requerido';
    }

    if (!form.unit.trim()) {
      newErrors.unit = 'La unidad es requerida';
    }

    if (form.unit_cost && isNaN(parseFloat(form.unit_cost))) {
      newErrors.unit_cost = 'Debe ser un número válido';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    
    // Limpiar error del campo cuando el usuario empiece a escribir
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
      await addItem({
        name: form.name.trim(),
        type: form.type as ItemType,
        unit: form.unit.trim(),
        unit_cost: form.unit_cost ? parseFloat(form.unit_cost) : undefined,
      });
      
      handleSuccess('Se agregó correctamente el insumo', 'Item creado');
      
      // Resetear formulario
      setForm({
        name: '',
        type: '',
        unit: '',
        unit_cost: '',
      });
    } catch (error) {
      handleError(error, 'Error al crear el item');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Box borderWidth="1px" rounded="md" p={4} mb={6}>
      <Stack spacing={4}>
        <FormControl isInvalid={!!errors.name}>
          <Input
            placeholder="Nombre del insumo"
            name="name"
            value={form.name}
            onChange={handleChange}
          />
          {errors.name && <FormErrorMessage>{errors.name}</FormErrorMessage>}
        </FormControl>

        <FormControl isInvalid={!!errors.type}>
          <Select 
            placeholder="Seleccionar tipo"
            name="type" 
            value={form.type} 
            onChange={handleChange}
          >
            {ITEM_TYPES.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </Select>
          {errors.type && <FormErrorMessage>{errors.type}</FormErrorMessage>}
        </FormControl>

        <FormControl isInvalid={!!errors.unit}>
          <Input
            placeholder="Unidad (g, ml, u, kg, etc.)"
            name="unit"
            value={form.unit}
            onChange={handleChange}
          />
          {errors.unit && <FormErrorMessage>{errors.unit}</FormErrorMessage>}
        </FormControl>

        <FormControl isInvalid={!!errors.unit_cost}>
          <Input
            placeholder="Costo por unidad (opcional)"
            name="unit_cost"
            type="number"
            step="0.01"
            min="0"
            value={form.unit_cost}
            onChange={handleChange}
          />
          {errors.unit_cost && <FormErrorMessage>{errors.unit_cost}</FormErrorMessage>}
        </FormControl>

        <Button 
          onClick={handleSubmit} 
          colorScheme="green"
          isLoading={isSubmitting}
          loadingText="Creando..."
        >
          Agregar Insumo
        </Button>
      </Stack>
    </Box>
  );
}