import { createListCollection } from '@chakra-ui/react';

// Collections
export const FORECAST_HORIZON_COLLECTION = createListCollection({
  items: [
    { label: '3 días', value: '3' },
    { label: '7 días', value: '7' },
    { label: '14 días', value: '14' },
    { label: '30 días', value: '30' }
  ]
});

export const MATERIAL_FILTER_COLLECTION = createListCollection({
  items: [
    { label: 'Todos los materiales', value: 'all' },
    { label: 'Ingredientes principales', value: 'main' },
    { label: 'Condimentos', value: 'seasoning' },
    { label: 'Embalaje', value: 'packaging' }
  ]
});
