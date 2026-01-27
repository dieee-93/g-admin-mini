/**
 * SaleFormModal - Complete Point of Sale Modal
 * ARCHITECTURE: Material Form Pattern (Cart/POS variation)
 * - Business logic in useSaleForm hook
 * - UI component is presentational
 * - Integrates stock validation
 * - Real-time totals calculation
 * - Payment flow management
 *
 * Features:
 * - Product selection with stock validation
 * - Visual cart with item management
 * - Real-time totals calculation
 * - Multiple payment methods
 * - Progress indicator during checkout
 */

import {
  Dialog,
  Stack,
} from '@/shared/ui';

import { PaymentConfirmationModal } from './PaymentConfirmationModal';
import { ProductTypeSelector } from './ProductTypeSelector';
import { FulfillmentSelector } from './FulfillmentSelector';
import { DigitalCheckoutView } from './DigitalCheckoutView';
import { useSaleForm } from '../hooks/useSaleForm';
import { HookPoint } from '@/lib/modules';
import { SaleFormHeader, SaleFormFooter, SaleFormFallbackView } from './SaleForm';
import type { SaleContext } from '@/modules/fulfillment/onsite/events';

interface SaleFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  /** Pre-selected context (e.g., table from FloorPlanView) */
  initialContext?: SaleContext;
}

export function SaleFormModal({ isOpen, onClose, initialContext }: SaleFormModalProps) {
  // ========================================================================
  // USE SALE FORM HOOK (All business logic)
  // ========================================================================
  // Capability-aware architecture: Hook detects active features and determines
  // available ProductTypes and sale patterns automatically.

  const {
    cart,
    handleAddToCart,
    handleRemoveItem,
    handleUpdateQuantity,
    handleClearCart,
    totals,
    validationState,
    isProcessing,
    showPaymentConfirmation,
    setShowPaymentConfirmation,
    handleOpenPaymentConfirmation,
    handleConfirmPayment,
    submitButtonContent,
    operationProgress,
    cartStatusBadge,
    onClose: closeModal,
    // Context for HookPoint
    saleContext,
    handleContextSelect,
    // Product Flow (for SERVICE/RENTAL)
    selectedProduct,
    handleProductSelect,
    handleFlowComplete,
    flowData,
    // ========================================================================
    // CAPABILITY-AWARE ARCHITECTURE (NEW - Adaptive POS)
    // ========================================================================
    availableProductTypes,
    productType,
    setProductType,
    salePattern,
    // ========================================================================
    // CONTEXT-BASED ARCHITECTURE (REVISED - Correct Adaptive POS)
    // ========================================================================
    availableContexts,
    selectedContext,
    setSelectedContext,
    // ========================================================================
    // PRODUCTTYPE-FIRST ARCHITECTURE (NEW - Opción B)
    // ========================================================================
    availableFulfillments,
    selectedFulfillment,
    setSelectedFulfillment,
    handleProductTypeSelect,
    handleBackToProductType
  } = useSaleForm({
    isOpen,
    onClose,
    initialContext
  });


  return (
    <Dialog.Root
      open={isOpen}
      onOpenChange={(details) => !details.open && !isProcessing && closeModal()}
      size="xl"
      closeOnEscape={!isProcessing}
    >
      <Dialog.Backdrop />
      <Dialog.Positioner>
        <Dialog.Content
          maxW="1200px"
          maxH={{ base: "100vh", md: "90vh" }}
          w="full"
          overflowY="auto"
        >
          <Dialog.CloseTrigger />

          {/* ✅ HEADER */}
          <SaleFormHeader
            productType={productType}
            selectedFulfillment={selectedFulfillment}
            cartStatusBadge={cartStatusBadge}
          />

          {/* ✅ BODY */}
          <Dialog.Body p={{ base: "4", md: "6" }}>
            {/* ═══════════════════════════════════════════════════════════════════
                PRODUCTTYPE-FIRST ADAPTIVE POS ARCHITECTURE (Opción B)
                ═══════════════════════════════════════════════════════════════════
                1. If no productType → Show ProductTypeSelector
                2. If PHYSICAL and no fulfillment → Show FulfillmentSelector
                3. Otherwise → Show context-specific view
            */}
            {!productType ? (
              /* STEP 1: ProductType Selection */
              <ProductTypeSelector
                availableTypes={availableProductTypes}
                selectedType={productType}
                onSelect={handleProductTypeSelect}
              />
            ) : productType === 'PHYSICAL' && !selectedFulfillment ? (
              /* STEP 2 (PHYSICAL Only): Fulfillment Selection */
              <FulfillmentSelector
                availableTypes={availableFulfillments}
                selectedFulfillment={selectedFulfillment}
                onSelect={setSelectedFulfillment}
                onBack={handleBackToProductType}
              />
            ) : productType === 'DIGITAL' ? (
              /* DIGITAL: Direct checkout view (no HookPoint, built-in) */
              <DigitalCheckoutView
                cart={cart as any}
                onAddToCart={handleAddToCart as any}
                onRemoveItem={handleRemoveItem}
                onClearCart={handleClearCart}
                totals={{ ...totals, tax: totals.taxAmount }}
                onBack={handleBackToProductType}
                onCheckout={() => {
                  // Trigger checkout modal
                  handleOpenPaymentConfirmation();
                }}
              />
            ) : (
              /* STEP 3: Type/Context-specific Flow */
              <Stack direction="column" gap="4" h="full">
                {/* 🎯 HOOK POINT: ProductType-Specific Views
                    Modules inject their POS views based on productType:
                    - PHYSICAL + onsite → OnsitePOSView (from fulfillment-onsite module)
                    - PHYSICAL + pickup → Default cart view
                    - PHYSICAL + delivery → DeliveryPOSView (from fulfillment-delivery module)
                    - SERVICE → AppointmentPOSView (from scheduling module)
                    - RENTAL → RentalPOSView (from rental module)
                */}
                <HookPoint
                  name="sales.pos.context_view"
                  data={{
                    // Pass both productType and fulfillment for flexibility
                    selectedContext: productType === 'PHYSICAL' ? selectedFulfillment : productType?.toLowerCase(),
                    productType,
                    selectedFulfillment,
                    cart,
                    onAddToCart: handleAddToCart,
                    onRemoveItem: handleRemoveItem,
                    onUpdateQuantity: handleUpdateQuantity,
                    onClearCart: handleClearCart,
                    totals,
                    saleContext,
                    onBack: handleBackToProductType,
                  }}
                  fallback={
                    /* DEFAULT FALLBACK: Generic product/cart UI for contexts without dedicated views */
                    <SaleFormFallbackView
                      validationState={validationState}
                      cart={cart}
                      totals={totals}
                      selectedProduct={selectedProduct}
                      operationProgress={operationProgress}
                      onAddToCart={handleAddToCart}
                      onRemoveItem={handleRemoveItem}
                      onUpdateQuantity={handleUpdateQuantity}
                      onClearCart={handleClearCart}
                      onFlowComplete={handleFlowComplete}
                    />
                  }
                />
              </Stack>
            )}
          </Dialog.Body>

          {/* ✅ FOOTER */}
          <SaleFormFooter
            onClose={closeModal}
            isProcessing={isProcessing}
            cartLength={cart.length}
            onClearCart={handleClearCart}
            onOpenPaymentConfirmation={handleOpenPaymentConfirmation}
            submitButtonContent={submitButtonContent}
            hasValidationErrors={validationState.hasErrors}
          />
        </Dialog.Content>
      </Dialog.Positioner >

      {/* ✅ MODAL DE CONFIRMACIÓN DE PAGO */}
      {
        showPaymentConfirmation && (
          <PaymentConfirmationModal
            isOpen={showPaymentConfirmation}
            onClose={() => setShowPaymentConfirmation(false)}
            total={totals.total}
            onConfirm={handleConfirmPayment}
          />
        )
      }
    </Dialog.Root >
  );
}
