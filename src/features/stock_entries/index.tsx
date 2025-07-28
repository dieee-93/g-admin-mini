import { Box } from '@chakra-ui/react';
import { StockEntryForm } from './ui/StockEntryForm';
import { StockEntryList } from './ui/StockEntryList';

export default function StockEntriesPage() {
  return (
    <Box p={4}>
      <StockEntryForm />
      <StockEntryList />
    </Box>
  );
}