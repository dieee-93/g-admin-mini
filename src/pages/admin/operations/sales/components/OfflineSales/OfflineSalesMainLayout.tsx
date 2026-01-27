/**
 * OfflineSalesMainLayout Component
 * Main product grid and cart layout for OfflineSalesView
 * 
 * EXTRACTED FROM: OfflineSalesView.tsx (lines 603-635)
 */

import { Grid, Stack, Typography } from '@/shared/ui';
import { ProductWithStock } from '../ProductWithStock';
import { CartValidationSummary } from '../CartValidationSummary';
import type { POSCartItem, POSCartSummary, StockValidationResult } from '@/modules/sales/hooks/usePOSCart';

interface OfflineSalesMainLayoutProps {
  // Cart state
  cart: POSCartItem[];
  summary: POSCartSummary;
  validationResult: StockValidationResult | null;
  isValidating: boolean;
  
  // UI state
  isOnline: boolean;
  isProcessing: boolean;
  
  // Cart actions
  addToCart: (item: POSCartItem) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  validateCartStock: () => Promise<StockValidationResult>;
  
  // Checkout
  onProceedToCheckout: () => void;
}

export function OfflineSalesMainLayout({
  cart,
  summary,
  validationResult,
  isValidating,
  isOnline,
  isProcessing,
  addToCart,
  updateQuantity,
  validateCartStock,
  onProceedToCheckout,
}: OfflineSalesMainLayoutProps) {
  return (
    <Grid templateColumns={{ base: "1fr", lg: "2fr 1fr" }} gap="lg">
      {/* Products Section */}
      <Stack>
        <Stack gap="lg" direction="column" align="stretch">
          <Typography fontSize="lg" fontWeight="semibold">
            Productos Disponibles
          </Typography>
          
          <ProductWithStock 
            onAddToCart={addToCart}
            onQuantityChange={updateQuantity}
            currentCart={cart as any}
            disabled={isProcessing}
            offlineMode={!isOnline}
          />
        </Stack>
      </Stack>

      {/* Cart Summary Section */}
      <Stack>
        <CartValidationSummary
          cart={cart as any}
          summary={summary}
          validationResult={validationResult}
          isValidating={isValidating}
          onProceedToCheckout={onProceedToCheckout}
          onValidateCart={() => validateCartStock()}
          disabled={isProcessing}
          isOffline={!isOnline}
        />
      </Stack>
    </Grid>
  );
}
