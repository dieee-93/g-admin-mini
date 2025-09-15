import { createListCollection } from '@chakra-ui/react';

// Collections
export const PERIOD_COLLECTION = createListCollection({
  items: [
    { label: 'Última semana', value: 'weekly' },
    { label: 'Último mes', value: 'monthly' },
    { label: 'Último trimestre', value: 'quarterly' },
    { label: 'Año actual', value: 'yearly' }
  ]
});

export const KPI_CATEGORY_COLLECTION = createListCollection({
  items: [
    { label: 'Todas las categorías', value: 'all' },
    { label: 'Financiero', value: 'financial' },
    { label: 'Operacional', value: 'operational' },
    { label: 'Cliente', value: 'customer' },
    { label: 'Estratégico', value: 'strategic' }
  ]
});
