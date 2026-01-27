/**
 * STORE DEBUGGER - Identificar qué store causa infinite loop
 *
 * Este componente prueba cada store individualmente para
 * identificar cuál está causando el forceStoreRerender infinito
 */

import React, { useEffect, useRef } from 'react';
import { Box, VStack, Heading, Text, Badge } from '@/shared/ui';
import { useProducts } from '@/modules/products';
import { useTeamStore } from '@/modules/team/store';
import { useOperationsStore } from '@/store/operationsStore';
import { useSalesStore } from '@/store/salesStore';
import { useAppStore } from '@/store/appStore';
import { useBusinessProfile, useFeatureFlags } from '@/lib/capabilities';
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
  const { data: products = [] } = useProducts();
  logger.debug('App', `✅ ProductsStore OK - ${products.length} products`);

  // Test 2: Staff Store (UI state only)
  logger.debug('App', '🧪 Testing StaffStore (UI only)...');
  const staffFilters = useTeamStore((state) => state.filters);
  logger.debug('App', `✅ StaffStore OK - filters active: ${staffFilters.search}`);

  // Test 3: Operations Store
  logger.debug('App', '🧪 Testing OperationsStore...');
  const operations = useOperationsStore((state) => state);
  logger.debug('App', `✅ OperationsStore OK`);

  // Test 4: Sales Store
  logger.debug('App', '🧪 Testing SalesStore...');
  const salesCart = useSalesStore((state) => state.cart);
  logger.debug('App', `✅ SalesStore OK - ${salesCart?.length || 0} cart items`);

  // Test 5: App Store
  logger.debug('App', '🧪 Testing AppStore...');
  const settings = useAppStore((state) => state.settings);
  logger.debug('App', `✅ AppStore OK`);

  // Test 6: Business Profile & Feature Flags
  logger.debug('App', '🧪 Testing BusinessProfile & FeatureFlags...');
  const { profile } = useBusinessProfile();
  const { activeFeatures } = useFeatureFlags();
  logger.debug('App', `✅ BusinessProfile & FeatureFlags OK - ${activeFeatures.length} features`);

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
          <Text fontSize="sm" fontFamily="mono">Staff Filters: {staffFilters.department}</Text>
          <Text fontSize="sm" fontFamily="mono">Cart Items: {salesCart?.length || 0}</Text>
          <Text fontSize="sm" fontFamily="mono">Features: {activeFeatures.length}</Text>
        </VStack>

        <Text fontSize="xs" color="gray.600">
          Check browser console for detailed logs
        </Text>
      </VStack>
    </Box>
  );
}

export default StoreDebugger;
