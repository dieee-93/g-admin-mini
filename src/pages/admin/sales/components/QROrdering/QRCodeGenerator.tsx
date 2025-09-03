// src/features/sales/components/QROrdering/QRCodeGenerator.tsx
// 🚀 QR CODE ORDERING - Tableside Digital Menu System
import { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Card,
  Text,
  Button,
  VStack,
  HStack,
  Badge,
  Grid,
  Input,
  Select,
  Alert,
  Dialog,
  createListCollection
} from '@chakra-ui/react';
import {
  QrCodeIcon,
  PrinterIcon,
  ClipboardDocumentIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { Table } from '../../types';

interface QRCodeGeneratorProps {
  tables: Table[];
  onQRGenerated: (tableId: string, qrCode: string) => void;
  onQRRevoked: (tableId: string) => void;
  baseUrl?: string;
}

interface QRTableConfig {
  tableId: string;
  qrCode: string;
  isActive: boolean;
  expiresAt: string;
  orderCount: number;
  lastUsed?: string;
}

export function QRCodeGenerator({
  tables,
  onQRGenerated,
  onQRRevoked,
  baseUrl = window.location.origin
}: QRCodeGeneratorProps) {
  const [qrConfigs, setQRConfigs] = useState<QRTableConfig[]>([]);
  const [selectedTable, setSelectedTable] = useState<string>('');
  const [expirationHours, setExpirationHours] = useState<number>(8);
  const [showQRModal, setShowQRModal] = useState(false);
  const [currentQR, setCurrentQR] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);

  // Load existing QR configurations
  useEffect(() => {
    loadQRConfigurations();
  }, []);

  const loadQRConfigurations = async () => {
    // In a real implementation, load from your backend
    // For now, simulate with localStorage
    const stored = localStorage.getItem('qr-table-configs');
    if (stored) {
      const configs = JSON.parse(stored);
      setQRConfigs(configs);
    }
  };

  const saveQRConfigurations = (configs: QRTableConfig[]) => {
    setQRConfigs(configs);
    localStorage.setItem('qr-table-configs', JSON.stringify(configs));
  };

  // Available tables for QR generation
  const availableTables = useMemo(() => {
    return createListCollection({
      items: [
        { value: '', label: 'Select a table' },
        ...tables.map(table => ({
          value: table.id,
          label: `Table ${table.number} (${table.capacity} seats)`
        }))
      ]
    });
  }, [tables]);

  // Generate QR code for table
  const generateQRCode = async (tableId: string) => {
    setIsGenerating(true);
    
    try {
      const table = tables.find(t => t.id === tableId);
      if (!table) throw new Error('Table not found');

      // Generate unique QR code identifier
      const qrCode = `qr_${tableId}_${Date.now()}`;
      const expiresAt = new Date(Date.now() + expirationHours * 60 * 60 * 1000).toISOString();
      
      // Create QR URL
      const qrUrl = `${baseUrl}/order/${qrCode}`;
      
      // Update configurations
      const existingIndex = qrConfigs.findIndex(config => config.tableId === tableId);
      const newConfig: QRTableConfig = {
        tableId,
        qrCode,
        isActive: true,
        expiresAt,
        orderCount: 0,
        lastUsed: undefined
      };

      let updatedConfigs;
      if (existingIndex >= 0) {
        updatedConfigs = [...qrConfigs];
        updatedConfigs[existingIndex] = newConfig;
      } else {
        updatedConfigs = [...qrConfigs, newConfig];
      }

      saveQRConfigurations(updatedConfigs);
      onQRGenerated(tableId, qrCode);
      
      setCurrentQR(qrUrl);
      setShowQRModal(true);
      
    } catch (error) {
      console.error('Error generating QR code:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  // Revoke QR code
  const revokeQRCode = (tableId: string) => {
    const updatedConfigs = qrConfigs.map(config => 
      config.tableId === tableId 
        ? { ...config, isActive: false }
        : config
    );
    
    saveQRConfigurations(updatedConfigs);
    onQRRevoked(tableId);
  };

  // Copy QR URL to clipboard
  const copyToClipboard = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      // You might want to show a toast notification here
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
    }
  };

  // Print QR code (placeholder - implement with actual printing service)
  const printQRCode = (tableId: string, qrUrl: string) => {
    const table = tables.find(t => t.id === tableId);
    if (!table) return;

    // Create a simple print-friendly page
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>QR Code - Table ${table.number}</title>
            <style>
              body { 
                font-family: Arial, sans-serif; 
                text-align: center; 
                padding: 40px;
              }
              .qr-container {
                border: 2px solid #000;
                padding: 20px;
                display: inline-block;
                margin: 20px;
              }
              .table-info {
                font-size: 24px;
                font-weight: bold;
                margin-bottom: 20px;
              }
              .instructions {
                font-size: 16px;
                margin-top: 20px;
                max-width: 300px;
              }
            </style>
          </head>
          <body>
            <div class="qr-container">
              <div class="table-info">Table ${table.number}</div>
              <div id="qrcode"></div>
              <div class="instructions">
                Scan this QR code with your phone to view our menu and place your order!
              </div>
            </div>
            <script src="https://cdn.jsdelivr.net/npm/qrcode@1.5.3/build/qrcode.min.js"></script>
            <script>
              QRCode.toCanvas(document.createElement('canvas'), '${qrUrl}', {
                width: 200,
                margin: 2
              }, function (error, canvas) {
                if (error) console.error(error);
                document.getElementById('qrcode').appendChild(canvas);
                window.print();
              });
            </script>
          </body>
        </html>
      `);
      printWindow.document.close();
    }
  };

  // Check if QR code is expired
  const isExpired = (expiresAt: string) => {
    return new Date(expiresAt) < new Date();
  };

  // Get QR status
  const getQRStatus = (config: QRTableConfig) => {
    if (!config.isActive) return { label: 'Inactive', color: 'gray' };
    if (isExpired(config.expiresAt)) return { label: 'Expired', color: 'red' };
    return { label: 'Active', color: 'green' };
  };

  return (
    <VStack gap="6" align="stretch">
      {/* Header */}
      <Card.Root>
        <Card.Header>
          <HStack justify="space-between" align="center">
            <VStack align="start" gap="1">
              <Text fontSize="xl" fontWeight="bold">QR Code Management</Text>
              <Text color="gray.600" fontSize="sm">
                Generate QR codes for tableside ordering
              </Text>
            </VStack>
            <QrCodeIcon className="w-8 h-8 text-blue-500" />
          </HStack>
        </Card.Header>
      </Card.Root>

      {/* QR Generation Form */}
      <Card.Root>
        <Card.Header>
          <Text fontWeight="bold">Generate New QR Code</Text>
        </Card.Header>
        <Card.Body>
          <VStack gap="4" align="stretch">
            <Grid templateColumns={{ base: "1fr", md: "2fr 1fr 1fr" }} gap="4">
              <Box>
                <Text mb="2" fontWeight="medium">Table</Text>
                <Select.Root
                  collection={availableTables}
                  value={selectedTable ? [selectedTable] : []}
                  onValueChange={(details) => setSelectedTable(details.value[0] || '')}
                >
                  <Select.Trigger>
                    <Select.ValueText placeholder="Select table" />
                  </Select.Trigger>
                  <Select.Content>
                    {availableTables.items.map((table) => (
                      <Select.Item key={table.value} item={table}>
                        {table.label}
                      </Select.Item>
                    ))}
                  </Select.Content>
                </Select.Root>
              </Box>

              <Box>
                <Text mb="2" fontWeight="medium">Expires In (Hours)</Text>
                <Input
                  type="number"
                  min="1"
                  max="24"
                  value={expirationHours}
                  onChange={(e) => setExpirationHours(parseInt(e.target.value) || 8)}
                />
              </Box>

              <Box display="flex" alignItems="end">
                <Button
                  colorPalette="blue"
                  onClick={() => generateQRCode(selectedTable)}
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
        </Card.Body>
      </Card.Root>

      {/* Active QR Codes */}
      <Card.Root>
        <Card.Header>
          <Text fontWeight="bold">Active QR Codes ({qrConfigs.length})</Text>
        </Card.Header>
        <Card.Body>
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
                  <Card.Root key={config.tableId} p="4" variant="outline">
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
                          onClick={() => copyToClipboard(qrUrl)}
                          flex="1"
                        >
                          <ClipboardDocumentIcon className="w-4 h-4" />
                          Copy URL
                        </Button>
                        
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => printQRCode(config.tableId, qrUrl)}
                          flex="1"
                        >
                          <PrinterIcon className="w-4 h-4" />
                          Print
                        </Button>
                        
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setCurrentQR(qrUrl);
                            setShowQRModal(true);
                          }}
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
                          onClick={() => revokeQRCode(config.tableId)}
                        >
                          Revoke QR Code
                        </Button>
                      )}
                    </VStack>
                  </Card.Root>
                );
              })}
            </Grid>
          )}
        </Card.Body>
      </Card.Root>

      {/* QR Code Display Modal */}
      <Dialog.Root 
        open={showQRModal} 
        onOpenChange={({ open }) => setShowQRModal(open)}
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
                  <Input
                    value={currentQR}
                    readOnly
                    fontSize="sm"
                    bg="bg.canvas"
                  />
                </VStack>
              </VStack>
            </Dialog.Body>

            <Dialog.Footer>
              <HStack gap="3" w="full">
                <Button
                  variant="outline"
                  onClick={() => copyToClipboard(currentQR)}
                  flex="1"
                >
                  <ClipboardDocumentIcon className="w-4 h-4" />
                  Copy URL
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    // Extract table ID from current QR for printing
                    const config = qrConfigs.find(c => currentQR.includes(c.qrCode));
                    if (config) {
                      printQRCode(config.tableId, currentQR);
                    }
                  }}
                  flex="1"
                >
                  <PrinterIcon className="w-4 h-4" />
                  Print
                </Button>
              </HStack>
            </Dialog.Footer>
          </Dialog.Content>
        </Dialog.Positioner>
      </Dialog.Root>
    </VStack>
  );
}