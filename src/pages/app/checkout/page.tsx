import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ContentLayout,
  Section,
  Stack,
  Text,
  Alert,
  Badge,
} from '@/shared/ui';
import {
  DeliveryStep,
  ReviewStep,
  PaymentStep,
  ConfirmationStep,
} from './components';
import { useCheckout } from './hooks/useCheckout';
import { checkoutService } from '@/modules/sales/ecommerce/services/checkoutService';
import { useAuth } from '@/contexts/AuthContext';
import { useMercadoPagoCheckout } from '@/modules/finance-integrations/hooks/useMercadoPagoCheckout';
import { useActivePaymentMethods } from '@/modules/finance-integrations/hooks/usePayments';
import { useCart } from '@/modules/sales/ecommerce/hooks/useCart';

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    currentStep,
    checkoutData,
    goToNextStep,
    goToPreviousStep,
    updateCheckoutData,
  } = useCheckout();

  // Load payment methods to determine if selected method requires gateway
  const { data: paymentMethods } = useActivePaymentMethods();

  // Load user's cart for Mercado Pago checkout
  const { cart } = useCart({
    customerId: user?.id,
    autoLoad: true,
  });

  // Mercado Pago checkout hook
  const { checkoutWithCart: mercadoPagoCheckout, isProcessing: isMercadoPagoProcessing } = useMercadoPagoCheckout();

  // Redirect if not logged in
  if (!user) {
    navigate('/login?redirect=/app/checkout');
    return null;
  }

  const handleAddressSelect = (addressId: string) => {
    updateCheckoutData({ deliveryAddressId: addressId });
  };

  const handlePaymentMethodSelect = (method: string) => {
    updateCheckoutData({ paymentMethod: method });
  };

  const handlePlaceOrder = async () => {
    if (!checkoutData.deliveryAddressId || !checkoutData.paymentMethod) {
      setError('Please complete all checkout steps');
      return;
    }

    try {
      setIsProcessing(true);
      setError(null);

      // Find selected payment method details
      const selectedMethod = paymentMethods?.find(
        (m) => m.code === checkoutData.paymentMethod
      );

      // Check if payment method requires gateway (Mercado Pago, Stripe, etc.)
      const requiresGateway = selectedMethod?.requires_gateway || false;

      if (requiresGateway) {
        // ============================================
        // MERCADO PAGO CHECKOUT FLOW
        // ============================================

        // Validate cart exists and has items
        if (!cart || !cart.items || cart.items.length === 0) {
          throw new Error('Cart is empty. Please add items to your cart.');
        }

        // Transform cart items to Mercado Pago format
        const cartItems = cart.items.map((item) => ({
          id: item.product_id,
          name: item.product_name || `Product ${item.product_id}`,
          price: item.price,
          quantity: item.quantity,
        }));

        // Get customer info (optional)
        const customerInfo = {
          email: user.email,
          name: user.user_metadata?.full_name || user.email,
        };

        // Process checkout with Mercado Pago
        const success = await mercadoPagoCheckout(cartItems, customerInfo);

        if (!success) {
          throw new Error('Failed to initiate Mercado Pago checkout');
        }

        // Note: If successful, user will be redirected to Mercado Pago
        // They will return to /app/checkout/success or /app/checkout/failure

      } else {
        // ============================================
        // TRADITIONAL CHECKOUT FLOW (Cash, etc.)
        // ============================================

        const result = await checkoutService.processCheckout({
          customerId: user.id,
          deliveryAddressId: checkoutData.deliveryAddressId,
          paymentMethod: checkoutData.paymentMethod,
        });

        if (!result.success || !result.order) {
          throw new Error(result.error || 'Failed to place order');
        }

        // Update checkout data with order ID
        updateCheckoutData({ orderId: result.order.id });

        // Move to confirmation step
        goToNextStep();
      }
    } catch (err) {
      console.error('Error placing order:', err);
      setError(err instanceof Error ? err.message : 'Failed to place order');
    } finally {
      setIsProcessing(false);
    }
  };

  // Step indicator
  const steps = [
    { id: 'delivery', label: 'Delivery', completed: !!checkoutData.deliveryAddressId },
    { id: 'review', label: 'Review', completed: false },
    { id: 'payment', label: 'Payment', completed: !!checkoutData.paymentMethod },
    { id: 'confirmation', label: 'Confirmation', completed: !!checkoutData.orderId },
  ];

  const currentStepIndex = steps.findIndex((s) => s.id === currentStep);

  return (
    <ContentLayout spacing="normal">
      {/* Header */}
      <Section variant="flat">
        <Stack gap="4">
          <Stack direction="row" align="center" gap="2">
            <span style={{ fontSize: '2rem' }}>🛒</span>
            <h1 style={{ fontSize: '1.875rem', fontWeight: 'bold' }}>
              Checkout
            </h1>
          </Stack>

          {/* Step Indicator */}
          {currentStep !== 'confirmation' && (
            <Stack direction="row" gap="2" align="center">
              {steps.map((step, index) => (
                <Stack key={step.id} direction="row" gap="2" align="center">
                  <Badge
                    colorPalette={
                      index < currentStepIndex
                        ? 'green'
                        : index === currentStepIndex
                        ? 'blue'
                        : 'gray'
                    }
                    variant={index <= currentStepIndex ? 'solid' : 'outline'}
                  >
                    {index + 1}. {step.label}
                  </Badge>
                  {index < steps.length - 1 && (
                    <Text color="gray.400">→</Text>
                  )}
                </Stack>
              ))}
            </Stack>
          )}
        </Stack>
      </Section>

      {/* Error Alert */}
      {error && (
        <Alert.Root status="error">
          <Alert.Icon />
          <Stack gap="1">
            <Alert.Title>Checkout Error</Alert.Title>
            <Alert.Description>{error}</Alert.Description>
          </Stack>
        </Alert.Root>
      )}

      {/* Checkout Steps */}
      <Section variant="elevated">
        {currentStep === 'delivery' && (
          <DeliveryStep
            selectedAddressId={checkoutData.deliveryAddressId}
            onAddressSelect={handleAddressSelect}
            onNext={goToNextStep}
          />
        )}

        {currentStep === 'review' && checkoutData.deliveryAddressId && (
          <ReviewStep
            deliveryAddressId={checkoutData.deliveryAddressId}
            onNext={goToNextStep}
            onBack={goToPreviousStep}
          />
        )}

        {currentStep === 'payment' && (
          <PaymentStep
            selectedPaymentMethod={checkoutData.paymentMethod}
            onPaymentMethodSelect={handlePaymentMethodSelect}
            onNext={handlePlaceOrder}
            onBack={goToPreviousStep}
            isProcessing={isProcessing || isMercadoPagoProcessing}
          />
        )}

        {currentStep === 'confirmation' && checkoutData.orderId && (
          <ConfirmationStep orderId={checkoutData.orderId} />
        )}
      </Section>
    </ContentLayout>
  );
}
