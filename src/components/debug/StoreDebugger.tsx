/**
 * STORE DEBUGGER - Identificar qué store causa infinite loop
 *
 * Este componente prueba cada store individualmente para
 * identificar cuál está causando el forceStoreRerender infinito
 */

import React, { useEffect, useRef } from 'react';
import { Box, VStack, Heading, Text, Badge } from '@/shared/ui';
import { useProductsStore } from '@/store/productsStore';
import { useStaffStore } from '@/store/staffStore';
import { useOperationsStore } from '@/store/operationsStore';
import { useSalesStore } from '@/store/salesStore';
import { useAppStore } from '@/store/appStore';
import { useCapabilityStore } from '@/store/capabilityStore';
import { logger } from '@/lib/logging';

export function StoreDebugger() {
  const renderCount = useRef(0);
  const [suspect, setSuspect] = React.useState<string>('');

  useEffect(() => {
    renderCount.current += 1;
    logger.warn('App', `🔍 StoreDebugger render #${renderCount.current}`);

    if (renderCount.current > 20) {
      logger.error('App', '❌ INFINITE LOOP DETECTED in StoreDebugger');
    }
  });

  // Test 1: Products Store
  logger.debug('App', '🧪 Testing ProductsStore...');
  const products = useProductsStore((state) => state.products);
  logger.debug('App', `✅ ProductsStore OK - ${products.length} products`);

  // Test 2: Staff Store
  logger.debug('App', '🧪 Testing StaffStore...');
  const staff = useStaffStore((state) => state.staff);
  logger.debug('App', `✅ StaffStore OK - ${staff.length} staff`);

  // Test 3: Operations Store
  logger.debug('App', '🧪 Testing OperationsStore...');
  const operations = useOperationsStore((state) => state);
  logger.debug('App', `✅ OperationsStore OK`);

  // Test 4: Sales Store
  logger.debug('App', '🧪 Testing SalesStore...');
  const sales = useSalesStore((state) => state.sales);
  logger.debug('App', `✅ SalesStore OK - ${sales?.length || 0} sales`);

  // Test 5: App Store
  logger.debug('App', '🧪 Testing AppStore...');
  const settings = useAppStore((state) => state.settings);
  logger.debug('App', `✅ AppStore OK`);

  // Test 6: Capability Store (SOSPECHOSO)
  logger.debug('App', '🧪 Testing CapabilityStore...');
  const capStore = useCapabilityStore((state) => state);
  logger.debug('App', `✅ CapabilityStore OK - ${capStore.features.activeFeatures.length} features`);

  useEffect(() => {
    if (renderCount.current > 15) {
      setSuspect('⚠️ LOOP DETECTADO - Revisar logs arriba');
    }
  }, []);

  return (
    <Box p="6" bg="red.50" borderRadius="lg" border="2px solid" borderColor="red.300">
      <VStack align="start" gap="4">
        <Heading size="lg" color="red.700">
          🔍 Store Debugger
        </Heading>

        <Text>
          <strong>Render Count:</strong> {renderCount.current}
        </Text>

        {renderCount.current > 20 && (
          <Badge colorPalette="red" size="lg">
            ❌ INFINITE LOOP DETECTED
          </Badge>
        )}

        {suspect && (
          <Text color="red.700" fontWeight="bold">
            {suspect}
          </Text>
        )}

        <VStack align="start" gap="2" w="full">
          <Text fontSize="sm" fontFamily="mono">Products: {products.length}</Text>
          <Text fontSize="sm" fontFamily="mono">Staff: {staff.length}</Text>
          <Text fontSize="sm" fontFamily="mono">Sales: {sales?.length || 0}</Text>
          <Text fontSize="sm" fontFamily="mono">Features: {capStore.features.activeFeatures.length}</Text>
        </VStack>

        <Text fontSize="xs" color="gray.600">
          Check browser console for detailed logs
        </Text>
      </VStack>
    </Box>
  );
}

export default StoreDebugger;
