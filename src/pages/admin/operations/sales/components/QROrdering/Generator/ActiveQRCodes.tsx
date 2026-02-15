import {
  Text,
  VStack,
  HStack,
  Badge,
  Grid,
  Button,
  CardWrapper,
  Icon
} from '@/shared/ui';
import {
  QrCodeIcon,
  PrinterIcon,
  ClipboardDocumentIcon
} from '@heroicons/react/24/outline';
import type { Table } from '../../../types';
import type { QRTableConfig } from './types';
import { getQRStatus, isExpired } from './utils';

interface ActiveQRCodesProps {
  qrConfigs: QRTableConfig[];
  tables: Table[];
  baseUrl: string;
  onRevoke: (tableId: string) => void;
  onCopy: (url: string) => void;
  onPrint: (tableId: string, url: string) => void;
  onView: (url: string) => void;
}

export function ActiveQRCodes({
  qrConfigs,
  tables,
  baseUrl,
  onRevoke,
  onCopy,
  onPrint,
  onView
}: ActiveQRCodesProps) {
  return (
    <CardWrapper>
      <CardWrapper.Header>
        <Text fontWeight="bold">Active QR Codes ({qrConfigs.length})</Text>
      </CardWrapper.Header>
      <CardWrapper.Body>
        {qrConfigs.length === 0 ? (
          <Text color="gray.600" textAlign="center" py="4">
            No QR codes generated yet. Create one above to get started.
          </Text>
        ) : (
          <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }} gap="4">
            {qrConfigs.map((config) => {
              const table = tables.find(t => t.id === config.tableId);
              const status = getQRStatus(config);
              const qrUrl = `${baseUrl}/order/${config.qrCode}`;

              return (
                <CardWrapper key={config.tableId} p="4" variant="outline">
                  <VStack gap="3" align="stretch">
                    <HStack justify="space-between" align="center">
                      <VStack align="start" gap="0">
                        <Text fontWeight="bold">
                          Table {table?.number || 'Unknown'}
                        </Text>
                        <Text fontSize="sm" color="gray.600">
                          {config.orderCount} orders placed
                        </Text>
                      </VStack>
                      <Badge colorPalette={status.color} size="sm">
                        {status.label}
                      </Badge>
                    </HStack>

                    <VStack gap="2" align="stretch">
                      <HStack justify="space-between">
                        <Text fontSize="sm" color="gray.600">Expires:</Text>
                        <Text fontSize="sm">
                          {new Date(config.expiresAt).toLocaleDateString()} {' '}
                          {new Date(config.expiresAt).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </Text>
                      </HStack>

                      {config.lastUsed && (
                        <HStack justify="space-between">
                          <Text fontSize="sm" color="gray.600">Last used:</Text>
                          <Text fontSize="sm">
                            {new Date(config.lastUsed).toLocaleDateString()}
                          </Text>
                        </HStack>
                      )}
                    </VStack>

                    <HStack gap="2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onCopy(qrUrl)}
                      >
                        <ClipboardDocumentIcon className="w-4 h-4" />
                        Copy URL
                      </Button>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onPrint(config.tableId, qrUrl)}
                      >
                        <PrinterIcon className="w-4 h-4" />
                        Print
                      </Button>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onView(qrUrl)}
                      >
                        <QrCodeIcon className="w-4 h-4" />
                        View
                      </Button>
                    </HStack>

                    {config.isActive && !isExpired(config.expiresAt) && (
                      <Button
                        variant="outline"
                        colorPalette="red"
                        size="sm"
                        onClick={() => onRevoke(config.tableId)}
                      >
                        Revoke QR Code
                      </Button>
                    )}
                  </VStack>
                </CardWrapper>
              );
            })}
          </Grid>
        )}
      </CardWrapper.Body>
    </CardWrapper>
  );
}
