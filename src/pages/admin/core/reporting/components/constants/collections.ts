import { createListCollection } from '@/shared/ui';

// Collections
export const CATEGORY_COLLECTION = createListCollection({
  items: [
    { label: 'Todas las categorías', value: 'all' },
    { label: 'Financiero', value: 'financial' },
    { label: 'Operacional', value: 'operational' },
    { label: 'Cliente', value: 'customer' },
    { label: 'Inventario', value: 'inventory' },
    { label: 'Personal', value: 'staff' },
    { label: 'Personalizado', value: 'custom' }
  ]
});

export const FORMAT_COLLECTION = createListCollection({
  items: [
    { label: 'PDF', value: 'pdf' },
    { label: 'Excel', value: 'excel' },
    { label: 'CSV', value: 'csv' },
    { label: 'JSON', value: 'json' }
  ]
});

export const FREQUENCY_COLLECTION = createListCollection({
  items: [
    { label: 'Diario', value: 'daily' },
    { label: 'Semanal', value: 'weekly' },
    { label: 'Mensual', value: 'monthly' },
    { label: 'Trimestral', value: 'quarterly' }
  ]
});
