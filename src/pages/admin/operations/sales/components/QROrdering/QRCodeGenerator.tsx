// src/features/sales/components/QROrdering/QRCodeGenerator.tsx
// 🚀 QR CODE ORDERING - Tableside Digital Menu System
import { useState, useEffect, useMemo } from 'react';
import {
  Text,
  VStack,
  HStack,
  createListCollection
} from '@chakra-ui/react';
import { CardWrapper } from '@/shared/ui';
import {
  QrCodeIcon,
} from '@heroicons/react/24/outline';
import type { Table } from '../../types';
import { QRGenerationForm } from './Generator/QRGenerationForm';
import { ActiveQRCodes } from './Generator/ActiveQRCodes';
import { QRCodeModal } from './Generator/QRCodeModal';
import type { QRTableConfig } from './Generator/types';
import { logger } from '@/lib/logging';

interface QRCodeGeneratorProps {
  tables: Table[];
  onQRGenerated: (tableId: string, qrCode: string) => void;
  onQRRevoked: (tableId: string) => void;
  baseUrl?: string;
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
      logger.error('SalesStore', 'Error generating QR code:', error);
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
      logger.error('SalesStore', 'Failed to copy to clipboard:', error);
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
                if (error) logger.error('SalesStore', error);
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

  return (
    <VStack gap="6" align="stretch">
      {/* Header */}
      <CardWrapper>
        <CardWrapper.Header>
          <HStack justify="space-between" align="center">
            <VStack align="start" gap="1">
              <Text fontSize="xl" fontWeight="bold">QR Code Management</Text>
              <Text color="gray.600" fontSize="sm">
                Generate QR codes for tableside ordering
              </Text>
            </VStack>
            <QrCodeIcon className="w-8 h-8 text-blue-500" />
          </HStack>
        </CardWrapper.Header>
      </CardWrapper>

      {/* QR Generation Form */}
      <QRGenerationForm
        availableTables={availableTables as any}
        selectedTable={selectedTable}
        onSelectTable={setSelectedTable}
        expirationHours={expirationHours}
        onExpirationChange={setExpirationHours}
        isGenerating={isGenerating}
        onGenerate={generateQRCode}
      />

      {/* Active QR Codes */}
      <ActiveQRCodes
        qrConfigs={qrConfigs}
        tables={tables}
        baseUrl={baseUrl}
        onCopy={copyToClipboard}
        onPrint={printQRCode}
        onView={(qrUrl) => {
          setCurrentQR(qrUrl);
          setShowQRModal(true);
        }}
        onRevoke={revokeQRCode}
      />

      {/* QR Code Display Modal */}
      <QRCodeModal
        isOpen={showQRModal}
        onClose={() => setShowQRModal(false)}
        currentQR={currentQR}
        qrConfigs={qrConfigs}
        onCopy={copyToClipboard}
        onPrint={printQRCode}
      />
    </VStack>
  );
}