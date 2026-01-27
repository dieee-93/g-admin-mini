import {
  Box,
  Text,
  VStack,
  HStack,
  Dialog,
} from '@chakra-ui/react';
import { Button } from '@/shared/ui/Button';
import { InputField } from '@/shared/ui';
import {
  ClipboardDocumentIcon,
  PrinterIcon,
} from '@heroicons/react/24/outline';
import type { QRTableConfig } from './types';

interface QRCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentQR: string;
  qrConfigs: QRTableConfig[];
  onCopy: (url: string) => void;
  onPrint: (tableId: string, url: string) => void;
}

export function QRCodeModal({
  isOpen,
  onClose,
  currentQR,
  qrConfigs,
  onCopy,
  onPrint,
}: QRCodeModalProps) {
  return (
    <Dialog.Root
      open={isOpen}
      onOpenChange={({ open }) => !open && onClose()}
    >
      <Dialog.Backdrop />
      <Dialog.Positioner>
        <Dialog.Content maxW="md">
          <Dialog.Header>
            <Dialog.Title>QR Code</Dialog.Title>
            <Dialog.CloseTrigger />
          </Dialog.Header>

          <Dialog.Body>
            <VStack gap="4" align="center">
              <Text textAlign="center" color="gray.600">
                Customers can scan this QR code to access your digital menu
              </Text>

              <Box
                p="4"
                bg="white"
                borderRadius="md"
                border="1px solid"
                borderColor="border.default"
                id="qr-display"
              >
                {/* QR code will be rendered here */}
                <Text color="gray.400" textAlign="center">
                  QR Code will be generated here
                </Text>
              </Box>

              <VStack gap="2" align="stretch" w="full">
                <Text fontSize="sm" fontWeight="medium">QR Code URL:</Text>
                <InputField
                  value={currentQR}
                  readOnly
                  fontSize="sm"
                  bg="gray.50"
                />
              </VStack>
            </VStack>
          </Dialog.Body>

          <Dialog.Footer>
            <HStack gap="3" w="full">
              <Box flex="1">
                <Button
                  variant="outline"
                  onClick={() => onCopy(currentQR)}
                  fullWidth
                >
                  <ClipboardDocumentIcon className="w-4 h-4" />
                  Copy URL
                </Button>
              </Box>
              <Box flex="1">
                <Button
                  variant="outline"
                  onClick={() => {
                    // Extract table ID from current QR for printing
                    const config = qrConfigs.find(c => currentQR.includes(c.qrCode));
                    if (config) {
                      onPrint(config.tableId, currentQR);
                    }
                  }}
                  fullWidth
                >
                  <PrinterIcon className="w-4 h-4" />
                  Print
                </Button>
              </Box>
            </HStack>
          </Dialog.Footer>
        </Dialog.Content>
      </Dialog.Positioner>
    </Dialog.Root>
  );
}
