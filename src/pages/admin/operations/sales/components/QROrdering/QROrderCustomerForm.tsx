import { Box, VStack, Text, Textarea, CardWrapper } from '@/shared/ui';
import { InputField } from '@/shared/ui';

interface QROrderCustomerFormProps {
  customerName: string;
  setCustomerName: (name: string) => void;
  customerPhone: string;
  setCustomerPhone: (phone: string) => void;
  specialRequests: string;
  setSpecialRequests: (requests: string) => void;
}

export function QROrderCustomerForm({
  customerName,
  setCustomerName,
  customerPhone,
  setCustomerPhone,
  specialRequests,
  setSpecialRequests,
}: QROrderCustomerFormProps) {
  return (
    <CardWrapper mb="4">
      <CardWrapper.Header>
        <Text fontWeight="bold" fontSize="lg">Your Information</Text>
      </CardWrapper.Header>
      <CardWrapper.Body>
        <VStack gap="4" align="stretch">
          <Box>
            <Text mb="2" fontSize="sm" fontWeight="medium">
              Name <Text as="span" color="red.500">*</Text>
            </Text>
            <InputField
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="Enter your name"
            />
          </Box>

          <Box>
            <Text mb="2" fontSize="sm" fontWeight="medium">
              Phone (Optional)
            </Text>
            <InputField
              value={customerPhone}
              onChange={(e) => setCustomerPhone(e.target.value)}
              placeholder="Enter your phone number"
            />
          </Box>

          <Box>
            <Text mb="2" fontSize="sm" fontWeight="medium">
              Special Requests (Optional)
            </Text>
            <Textarea
              value={specialRequests}
              onChange={(e) => setSpecialRequests(e.target.value)}
              placeholder="Any allergies, dietary restrictions, or special requests..."
              rows={3}
            />
          </Box>
        </VStack>
      </CardWrapper.Body>
    </CardWrapper>
  );
}
