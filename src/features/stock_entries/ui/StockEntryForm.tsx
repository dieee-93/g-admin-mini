// src/features/stock_entries/ui/StockEntryForm.tsx - VERSIÓN FINAL CORREGIDA
import {
  Box, Button, Input, VStack, Textarea, Heading, Text, Select
} from '@chakra-ui/react';
import { useState, useEffect } from 'react';
import { useStockEntries } from '../logic/useStockEntries';
import { useErrorHandler } from '@/hooks/useErrorHandler';
import { fetchItems } from '../../items/data/itemApi';
import { type Item } from '../../items/types';

interface FormErrors {
  item_id?: string;
  quantity?: string;
  unit_cost?: string;
  date?: string;
}

export function StockEntryForm() {
  const { addStockEntry } = useStockEntries();
  const { handleError, handleSuccess } = useErrorHandler();
  const [items, setItems] = useState<Item[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  
  const [form, setForm] = useState({
    item_id: '',
    quantity: '',
    unit_cost: '',
    date: new Date().toISOString().split('T')[0],
    note: '',
  });

  useEffect(() => {
    loadItems();
  }, []);

  const loadItems = async () => {
    try {
      const itemsData = await fetchItems();
      setItems(itemsData);
    } catch (error) {
      handleError(error, 'Error cargando insumos');
    }
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!form.item_id) {
      newErrors.item_id = 'Debe seleccionar un insumo';
    }

    if (!form.quantity || parseFloat(form.quantity) <= 0) {
      newErrors.quantity = 'La cantidad debe ser mayor a 0';
    }

    if (!form.unit_cost || parseFloat(form.unit_cost) <= 0) {
      newErrors.unit_cost = 'El costo debe ser mayor a 0';
    }

    if (!form.date) {
      newErrors.date = 'La fecha es requerida';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    
    // Limpiar error del campo cuando el usuario empiece a escribir
    if (errors[name as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSelectChange = (value: string[]) => {
    setForm(prev => ({ ...prev, item_id: value[0] || '' }));
    
    // Limpiar error del campo
    if (errors.item_id) {
      setErrors(prev => ({ ...prev, item_id: undefined }));
    }
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      await addStockEntry({
        item_id: form.item_id,
        quantity: parseFloat(form.quantity),
        unit_cost: parseFloat(form.unit_cost),
        date: form.date,
        note: form.note || undefined,
      });
      
      handleSuccess('Se registró correctamente la entrada de stock');
      
      // Resetear formulario
      setForm({ 
        item_id: '', 
        quantity: '', 
        unit_cost: '', 
        date: new Date().toISOString().split('T')[0],
        note: '' 
      });
    } catch (error) {
      handleError(error, 'Error registrando entrada');
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedItem = items.find(item => item.id === form.item_id);

  return (
    <Box borderWidth="1px" rounded="md" p={4} mb={6}>
      <Heading size="md" mb={4} color="green.600">
        📈 Registrar Entrada de Stock
      </Heading>
      
      <VStack gap="4">
        {/* Seleccionar Insumo */}
        <Box width="100%">
          <Select.Root 
            value={form.item_id ? [form.item_id] : []}
            onValueChange={(details) => handleSelectChange(details.value)}
          >
            <Select.HiddenSelect />
            <Select.Control>
              <Select.Trigger borderColor={errors.item_id ? 'red.300' : undefined}>
                <Select.ValueText placeholder="Seleccionar insumo" />
              </Select.Trigger>
              <Select.IndicatorGroup>
                <Select.Indicator />
              </Select.IndicatorGroup>
            </Select.Control>
            <Select.Positioner>
              <Select.Content>
                {items.map((item) => (
                  <Select.Item key={item.id} item={item.id}>
                    <Select.ItemText>
                      {item.name} ({item.unit}) - Stock actual: {item.stock}
                    </Select.ItemText>
                  </Select.Item>
                ))}
              </Select.Content>
            </Select.Positioner>
          </Select.Root>
          {errors.item_id && (
            <Text color="red.500" fontSize="sm" mt={1}>
              {errors.item_id}
            </Text>
          )}
        </Box>
        
        {/* Cantidad */}
        <Box width="100%">
          <Input
            placeholder={`Cantidad${selectedItem ? ` (${selectedItem.unit})` : ''}`}
            name="quantity"
            type="number"
            step="0.01"
            min="0"
            value={form.quantity}
            onChange={handleChange}
            borderColor={errors.quantity ? 'red.300' : undefined}
          />
          {errors.quantity && (
            <Text color="red.500" fontSize="sm" mt={1}>
              {errors.quantity}
            </Text>
          )}
        </Box>
        
        {/* Costo por unidad */}
        <Box width="100%">
          <Input
            placeholder="Costo por unidad"
            name="unit_cost"
            type="number"
            step="0.01"
            min="0"
            value={form.unit_cost}
            onChange={handleChange}
            borderColor={errors.unit_cost ? 'red.300' : undefined}
          />
          {errors.unit_cost && (
            <Text color="red.500" fontSize="sm" mt={1}>
              {errors.unit_cost}
            </Text>
          )}
        </Box>
        
        {/* Fecha */}
        <Box width="100%">
          <Input
            name="date"
            type="date"
            value={form.date}
            onChange={handleChange}
            borderColor={errors.date ? 'red.300' : undefined}
          />
          {errors.date && (
            <Text color="red.500" fontSize="sm" mt={1}>
              {errors.date}
            </Text>
          )}
        </Box>
        
        {/* Nota opcional */}
        <Box width="100%">
          <Textarea
            placeholder="Nota (opcional)"
            name="note"
            value={form.note}
            onChange={handleChange}
            rows={2}
          />
        </Box>
        
        <Button 
          onClick={handleSubmit} 
          colorScheme="green"
          loading={isSubmitting}
          loadingText="Registrando..."
          width="100%"
          size="lg"
        >
          📈 Registrar Entrada
        </Button>
      </VStack>
    </Box>
  );
}