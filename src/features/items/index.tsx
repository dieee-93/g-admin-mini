import { Box } from '@chakra-ui/react';
import { ItemForm } from './ui/ItemForm';
import { ItemList } from './ui/ItemList';

export default function ItemsPage() {
  return (
    <Box p={4}>
      <ItemForm />
      <ItemList />
    </Box>
  );
}
