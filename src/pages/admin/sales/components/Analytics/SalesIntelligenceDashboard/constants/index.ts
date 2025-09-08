import { createListCollection } from '@chakra-ui/react';

// Time range options
export const timeRangeCollection = createListCollection({
  items: [
    { value: 'today', label: 'Today' },
    { value: 'yesterday', label: 'Yesterday' },
    { value: 'week', label: 'This Week' },
    { value: 'month', label: 'This Month' },
    { value: 'quarter', label: 'This Quarter' },
    { value: 'custom', label: 'Custom Range' }
  ]
});

// Metric categories
export const categoryCollection = createListCollection({
  items: [
    { value: 'financial', label: 'Financial Performance' },
    { value: 'operational', label: 'Operational Excellence' },
    { value: 'customer', label: 'Customer Intelligence' },
    { value: 'menu', label: 'Menu Performance' }
  ]
});
