import {
  Box, Button, Input, Select, Stack, Textarea, Heading,
} from '@chakra-ui/react';
import { toaster } from '@/components/ui/toaster';
import { useState, useEffect } from 'react';
import { useStockEntries } from '../logic/useStockEntries';
import { fetchItems } from '../../items/data/itemApi';
import { type Item } from '../../items/types';

export function StockEntryForm() {
  const { addStockEntry } = useStockEntries();
  const [items, setItems] = useState<Item[]>([]);
  const [form, setForm] = useState({
    item_id: '',
    quantity: '',
    unit_cost: '',
    date: new Date().toISOString().split('T')[0], // Fecha actual
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
      console.error('Error loading items:', error);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    if (!form.item_id || !form.quantity || !form.unit_cost) {
      toaster.create({
        title: 'Error',
        description: 'Por favor complete todos los campos obligatorios',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    try {
      await addStockEntry({
        item_id: form.item_id,
        quantity: parseFloat(form.quantity),
        unit_cost: parseFloat(form.unit_cost),
        date: form.date,
        note: form.note || undefined,
      });
      
      toaster.create({
        title: 'Entrada registrada',
        description: 'Se agregó correctamente la entrada de stock',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      
      setForm({ 
        item_id: '', 
        quantity: '', 
        unit_cost: '', 
        date: new Date().toISOString().split('T')[0],
        note: '' 
      });
    } catch (error) {
      toaster.create({
        title: 'Error registrando entrada',
        description: error?.message || 'Ocurrió un error',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const selectedItem = items.find(item => item.id === form.item_id);

  return (
    <Box borderWidth="1px" rounded="md" p={4} mb={6}>
      <Heading size="md" mb={4}>Registrar Entrada de Stock</Heading>
      <Stack spacing={3}>
        <Select 
          placeholder="Seleccionar insumo"
          name="item_id" 
          value={form.item_id} 
          onChange={handleChange}
        >
          {items.map((item) => (
            <option key={item.id} value={item.id}>
              {item.name} ({item.unit})
            </option>
          ))}
        </Select>
        
        <Input
          placeholder={`Cantidad${selectedItem ? ` (${selectedItem.unit})` : ''}`}
          name="quantity"
          type="number"
          step="0.01"
          value={form.quantity}
          onChange={handleChange}
        />
        
        <Input
          placeholder="Costo por unidad"
          name="unit_cost"
          type="number"
          step="0.01"
          value={form.unit_cost}
          onChange={handleChange}
        />
        
        <Input
          name="date"
          type="date"
          value={form.date}
          onChange={handleChange}
        />
        
        <Textarea
          placeholder="Nota (opcional)"
          name="note"
          value={form.note}
          onChange={handleChange}
          rows={2}
        />
        
        <Button onClick={handleSubmit} colorScheme="green">
          Registrar Entrada
        </Button>
      </Stack>
    </Box>
  );
}