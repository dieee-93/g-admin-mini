import {
  Box,
  Text,
  Button,
  VStack,
  Grid,
  Select,
  Alert,
  createListCollection,
  InputField,
  CardWrapper
} from '@/shared/ui';
import { QrCodeIcon } from '@heroicons/react/24/outline';

interface QRGenerationFormProps {
  availableTables: ReturnType<typeof createListCollection>;
  selectedTable: string;
  onSelectTable: (table: string) => void;
  expirationHours: number;
  onExpirationChange: (hours: number) => void;
  isGenerating: boolean;
  onGenerate: (tableId: string) => void;
}

export function QRGenerationForm({
  availableTables,
  selectedTable,
  onSelectTable,
  expirationHours,
  onExpirationChange,
  isGenerating,
  onGenerate
}: QRGenerationFormProps) {
  return (
    <CardWrapper>
      <CardWrapper.Header>
        <Text fontWeight="bold">Generate New QR Code</Text>
      </CardWrapper.Header>
      <CardWrapper.Body>
        <VStack gap="4" align="stretch">
          <Grid templateColumns={{ base: "1fr", md: "2fr 1fr 1fr" }} gap="4">
            <Box>
              <Text mb="2" fontWeight="medium">Table</Text>
              <Select.Root
                collection={availableTables}
                value={selectedTable ? [selectedTable] : []}
                onValueChange={(details) => onSelectTable(details.value[0] || '')}
              >
                <Select.Trigger>
                  <Select.ValueText placeholder="Select table" />
                </Select.Trigger>
              <Select.Content>
                {availableTables.items.map((table: any) => (
                  <Select.Item key={table.value} item={table}>
                    {table.label}
                  </Select.Item>
                ))}
              </Select.Content>
              </Select.Root>
            </Box>

            <Box>
              <Text mb="2" fontWeight="medium">Expires In (Hours)</Text>
              <InputField
                type="number"
                min="1"
                max="24"
                value={expirationHours}
                onChange={(e) => onExpirationChange(parseInt(e.target.value) || 8)}
              />
            </Box>

            <Box display="flex" alignItems="end">
              <Button
                colorPalette="blue"
                onClick={() => onGenerate(selectedTable)}
                disabled={!selectedTable || isGenerating}
                loading={isGenerating}
                loadingText="Generating..."
                w="full"
              >
                <QrCodeIcon className="w-4 h-4" />
                Generate QR
              </Button>
            </Box>
          </Grid>

          <Alert.Root status="info">
            <Alert.Indicator />
            <Alert.Title>QR Code Ordering</Alert.Title>
            <Alert.Description>
              Customers can scan the QR code to access your digital menu, place orders,
              and even pay directly from their phones.
            </Alert.Description>
          </Alert.Root>
        </VStack>
      </CardWrapper.Body>
    </CardWrapper>
  );
}
