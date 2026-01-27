// src/features/sales/components/Payment/ModernPaymentProcessor.tsx
// 🚀 PAYMENT REVOLUTION - Modern Payment Processing System
import { useState, useMemo } from 'react';
import { VStack, createListCollection, Spinner, Text } from '@chakra-ui/react';
import {
  CreditCardIcon,
  DevicePhoneMobileIcon,
  QrCodeIcon,
  BanknotesIcon,
} from '@heroicons/react/24/outline';
import {
  PaymentType,
  PaymentTransactionStatus,
  SplitBillType,
  DEFAULT_TIP_PERCENTAGES,
  PAYMENT_PROCESSING_TIMES
} from '../../types';
import type {
  PaymentMethod,
  TipConfiguration,
} from '../../types';
import { EventBus } from '@/lib/events';
import { useTaxCalculation } from '@/pages/admin/finance/fiscal/hooks/useTaxCalculation';
import { useActivePaymentMethods } from '@/modules/finance-integrations/hooks/usePayments';
import { PaymentSummary } from './PaymentSummary';
import { TipConfiguration as TipConfigComponent } from './TipConfiguration';
import { SplitBillSetup } from './SplitBillSetup';
import { SelectedPaymentMethods } from './SelectedPaymentMethods';
import { PaymentMethodSelection } from './PaymentMethodSelection';
import { PaymentProcessingStatus } from './PaymentProcessingStatus';
import { PaymentActionButton } from './PaymentActionButton';

// Event payload type for payment completion
interface PaymentCompletedEvent {
  paymentId: string;
  orderId?: string;
  saleId?: string;
  amount: number;
  paymentMethod: string;
  customerId?: string;
  timestamp: string;
  reference?: string;
}

interface ModernPaymentProcessorProps {
  saleId: string;
  totalAmount: number;
  subtotal: number;
  taxes: number;
  onPaymentComplete: (payments: PaymentMethod[]) => void;
  onPaymentError: (error: string) => void;
  allowSplitBill?: boolean;
  tipConfiguration?: TipConfiguration;
  customerCount?: number;
}

interface PaymentSelection {
  type: PaymentType;
  amount: number;
  tipAmount: number;
  processingTime: number;
  isContactless: boolean;
}

// Map DB payment method codes to POS PaymentType enum
const PAYMENT_CODE_TO_TYPE_MAP: Record<string, PaymentType> = {
  'cash': PaymentType.CASH,
  'credit_card': PaymentType.CREDIT_CARD,
  'debit_card': PaymentType.NFC_CARD, // Assume debit is contactless
  'qr_payment': PaymentType.QR_CODE,
  'digital_wallet': PaymentType.MOBILE_WALLET,
  'bank_transfer': PaymentType.CREDIT_CARD, // Fallback to card
};

// Map PaymentType to handler method name (for salesPaymentHandler)
const PAYMENT_TYPE_TO_HANDLER_MAP: Record<PaymentType, string> = {
  [PaymentType.CASH]: 'CASH',
  [PaymentType.CREDIT_CARD]: 'CARD',
  [PaymentType.DEBIT_CARD]: 'CARD',
  [PaymentType.NFC_CARD]: 'CARD',
  [PaymentType.MOBILE_WALLET]: 'QR', // Mobile wallets use QR in Argentina
  [PaymentType.QR_CODE]: 'QR',
  [PaymentType.BANK_TRANSFER]: 'TRANSFER',
};

export function ModernPaymentProcessor({
  saleId,
  totalAmount,
  subtotal,
  taxes,
  onPaymentComplete,
  onPaymentError,
  allowSplitBill = true,
  tipConfiguration,
  customerCount = 1
}: ModernPaymentProcessorProps) {
  // Use centralized tax calculation for consistency
  const { helpers } = useTaxCalculation();

  // Load payment methods from database
  const { data: dbPaymentMethods, isLoading: isLoadingPaymentMethods, error: paymentMethodsError } = useActivePaymentMethods();

  // Recalculate using fiscal service for consistency (fallback to props if service unavailable)
  const calculatedTaxes = helpers.getTaxAmount(totalAmount) || taxes;
  const calculatedSubtotal = helpers.getSubtotal(totalAmount) || subtotal;
  // Payment state
  const [selectedPayments, setSelectedPayments] = useState<PaymentSelection[]>([]);
  const [tipPercentage, setTipPercentage] = useState<number>(18);
  const [customTipAmount, setCustomTipAmount] = useState<number>(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStep, setProcessingStep] = useState<string>('');
  const [splitBillMode, setSplitBillMode] = useState<SplitBillType | null>(null);
  const [splitAmounts, setSplitAmounts] = useState<number[]>([]);

  // Calculate tip amount
  const tipAmount = useMemo(() => {
    if (customTipAmount > 0) return customTipAmount;
    return Math.round((calculatedSubtotal * tipPercentage / 100) * 100) / 100;
  }, [calculatedSubtotal, tipPercentage, customTipAmount]);

  // Calculate final total with tip
  const finalTotal = useMemo(() => {
    return totalAmount + tipAmount;
  }, [totalAmount, tipAmount]);

  // Calculate remaining amount to pay
  const remainingAmount = useMemo(() => {
    const paidAmount = selectedPayments.reduce((sum, payment) =>
      sum + payment.amount + payment.tipAmount, 0
    );
    return Math.max(0, finalTotal - paidAmount);
  }, [selectedPayments, finalTotal]);

  // Payment method configurations - transformed from DB
  const paymentMethods = useMemo(() => {
    if (!dbPaymentMethods) return [];

    // Icon mapping
    const iconMap: Record<PaymentType, any> = {
      [PaymentType.CASH]: BanknotesIcon,
      [PaymentType.CREDIT_CARD]: CreditCardIcon,
      [PaymentType.DEBIT_CARD]: CreditCardIcon,
      [PaymentType.NFC_CARD]: CreditCardIcon,
      [PaymentType.MOBILE_WALLET]: DevicePhoneMobileIcon,
      [PaymentType.QR_CODE]: QrCodeIcon,
      [PaymentType.BANK_TRANSFER]: CreditCardIcon,
    };

    // Color mapping
    const colorMap: Record<PaymentType, string> = {
      [PaymentType.CASH]: 'green',
      [PaymentType.CREDIT_CARD]: 'blue',
      [PaymentType.DEBIT_CARD]: 'blue',
      [PaymentType.NFC_CARD]: 'purple',
      [PaymentType.MOBILE_WALLET]: 'orange',
      [PaymentType.QR_CODE]: 'cyan',
      [PaymentType.BANK_TRANSFER]: 'teal',
    };

    // Transform DB payment methods to POS format
    return dbPaymentMethods
      .map((dbMethod) => {
        const type = PAYMENT_CODE_TO_TYPE_MAP[dbMethod.code];
        if (!type) return null; // Skip unknown payment types

        const isContactless = [
          PaymentType.NFC_CARD,
          PaymentType.MOBILE_WALLET,
          PaymentType.QR_CODE
        ].includes(type);

        return {
          type,
          label: dbMethod.display_name,
          icon: iconMap[type] || BanknotesIcon,
          color: colorMap[type] || 'gray',
          processingTime: PAYMENT_PROCESSING_TIMES[type] || 3,
          isContactless,
          description: dbMethod.description || `Pay with ${dbMethod.display_name.toLowerCase()}`,
          // Store DB method info for later use
          dbCode: dbMethod.code,
          dbId: dbMethod.id,
          requiresGateway: dbMethod.requires_gateway,
          gatewayId: dbMethod.gateway_id,
        };
      })
      .filter(Boolean); // Remove nulls
  }, [dbPaymentMethods]);

  // Tip percentage options
  const tipOptions = useMemo(() => {
    const percentages = tipConfiguration?.suggested_percentages || DEFAULT_TIP_PERCENTAGES;
    return createListCollection({
      items: [
        ...percentages.map(percentage => ({
          value: percentage.toString(),
          label: `${percentage}% ($${((calculatedSubtotal * percentage / 100)).toFixed(2)})`
        })),
        { value: 'custom', label: 'Custom Amount' },
        ...(tipConfiguration?.allow_no_tip ? [{ value: '0', label: 'No Tip' }] : [])
      ]
    });
  }, [tipConfiguration, calculatedSubtotal]);

  // Add payment method
  const addPaymentMethod = (type: PaymentType) => {
    const method = paymentMethods.find(m => m.type === type);
    if (!method) return;

    const paymentAmount = splitBillMode ?
      (splitAmounts[selectedPayments.length] || 0) : remainingAmount;

    const newPayment: PaymentSelection = {
      type,
      amount: Math.min(paymentAmount, remainingAmount - tipAmount),
      tipAmount: selectedPayments.length === 0 ? tipAmount : 0, // Only first payment gets tip
      processingTime: method.processingTime,
      isContactless: method.isContactless
    };

    setSelectedPayments([...selectedPayments, newPayment]);
  };

  // Remove payment method
  const removePaymentMethod = (index: number) => {
    setSelectedPayments(selectedPayments.filter((_, i) => i !== index));
  };

  // Update payment amount
  // TODO: Implement amount editing UI
  // const updatePaymentAmount = (index: number, amount: number) => {
  //   const updated = [...selectedPayments];
  //   updated[index] = { ...updated[index], amount };
  //   setSelectedPayments(updated);
  // };

  // Setup split bill
  const setupSplitBill = (type: SplitBillType) => {
    setSplitBillMode(type);

    if (type === SplitBillType.EVEN) {
      const splitAmount = Math.round((finalTotal / customerCount) * 100) / 100;
      setSplitAmounts(Array(customerCount).fill(splitAmount));
    } else {
      setSplitAmounts(Array(customerCount).fill(0));
    }

    setSelectedPayments([]);
  };

  // Process payment
  const processPayment = async () => {
    if (remainingAmount > 0.01) {
      onPaymentError('Please complete all payments before processing');
      return;
    }

    setIsProcessing(true);

    try {
      const paymentMethodsResult: PaymentMethod[] = [];

      for (let i = 0; i < selectedPayments.length; i++) {
        const payment = selectedPayments[i];

        // Get payment method config from DB
        const paymentConfig = paymentMethods.find(m => m.type === payment.type);

        setProcessingStep(`Processing ${payment.type} payment ${i + 1}/${selectedPayments.length}...`);

        // Simulate payment processing time (visual feedback)
        await new Promise(resolve => setTimeout(resolve, payment.processingTime * 1000));

        // Generate payment ID and idempotency key
        const paymentId = `pm_${Date.now()}_${i}`;
        const idempotencyKey = `${saleId}-${payment.type}-${payment.amount + payment.tipAmount}-${Date.now()}`;

        // Create payment method object (for UI/callback)
        const paymentMethod: PaymentMethod = {
          id: paymentId,
          sale_id: saleId,
          type: payment.type,
          amount: payment.amount,
          tip_amount: payment.tipAmount,
          status: PaymentTransactionStatus.COMPLETED,
          is_contactless: payment.isContactless,
          processing_time: payment.processingTime,
          processed_at: new Date().toISOString(),
          created_at: new Date().toISOString()
        };

        paymentMethodsResult.push(paymentMethod);

        // Map POS PaymentType to handler method name (CASH, CARD, QR, TRANSFER)
        const handlerMethod = PAYMENT_TYPE_TO_HANDLER_MAP[payment.type];

        // ============================================
        // EMIT REAL EVENT → salesPaymentHandler will:
        // 1. Create journal entry
        // 2. Create sale_payments record
        // 3. Update cash_sessions (via trigger)
        // 4. Update operational_shifts (via trigger)
        // ============================================
        const paymentCompletedEvent: PaymentCompletedEvent = {
          paymentId: paymentId,
          orderId: undefined, // Will be set by higher-level component if needed
          saleId: saleId,
          amount: payment.amount + payment.tipAmount,
          paymentMethod: handlerMethod, // 'CASH', 'CARD', 'QR', 'TRANSFER'
          customerId: undefined, // Will be set by higher-level component if available
          timestamp: new Date().toISOString(),
          reference: paymentId,
          idempotencyKey: idempotencyKey,
          metadata: {
            pos_payment_type: payment.type,
            is_contactless: payment.isContactless,
            processing_time: payment.processingTime,
            tip_amount: payment.tipAmount,
            db_payment_method_id: paymentConfig?.dbId,
            db_payment_method_code: paymentConfig?.dbCode,
            requires_gateway: paymentConfig?.requiresGateway,
            gateway_id: paymentConfig?.gatewayId,
          }
        };

        await EventBus.emit('sales.payment.completed', paymentCompletedEvent, 'PaymentModule');

        // TODO: For gateway payments (CARD, QR), we should wait for webhook confirmation
        // For now, we're marking all as COMPLETED immediately
        // In production, CARD/QR payments would be INITIATED and wait for gateway callback
      }

      setProcessingStep('Finalizing transaction...');
      await new Promise(resolve => setTimeout(resolve, 1000));

      onPaymentComplete(paymentMethodsResult);

    } catch (error) {
      onPaymentError(error instanceof Error ? error.message : 'Payment processing failed');
    } finally {
      setIsProcessing(false);
      setProcessingStep('');
    }
  };

  // Show loading state while payment methods are loading
  if (isLoadingPaymentMethods) {
    return (
      <VStack gap="4" align="center" py="8">
        <Spinner size="lg" />
        <Text>Loading payment methods...</Text>
      </VStack>
    );
  }

  // Show error if payment methods failed to load
  if (paymentMethodsError) {
    return (
      <VStack gap="4" align="center" py="8">
        <Text color="red.500" fontWeight="bold">Error loading payment methods</Text>
        <Text color="gray.600">
          {paymentMethodsError instanceof Error ? paymentMethodsError.message : 'Unknown error'}
        </Text>
        <Text fontSize="sm" color="gray.500">Please check your payment methods configuration in settings.</Text>
      </VStack>
    );
  }

  // Show warning if no payment methods available
  if (!paymentMethods || paymentMethods.length === 0) {
    return (
      <VStack gap="4" align="center" py="8">
        <Text color="orange.500" fontWeight="bold">No payment methods available</Text>
        <Text color="gray.600">
          Please configure payment methods in the admin panel before processing sales.
        </Text>
      </VStack>
    );
  }

  return (
    <VStack gap="6" align="stretch">
      {/* Payment Summary */}
      <PaymentSummary
        subtotal={calculatedSubtotal}
        taxes={calculatedTaxes}
        tipAmount={tipAmount}
        tipPercentage={tipPercentage}
        finalTotal={finalTotal}
        remainingAmount={remainingAmount}
      />

      {/* Tip Configuration */}
      <TipConfigComponent
        tipOptions={tipOptions}
        tipPercentage={tipPercentage}
        customTipAmount={customTipAmount}
        onTipPercentageChange={(percentage) => {
          setTipPercentage(percentage);
          setCustomTipAmount(0);
        }}
        onCustomTipChange={setCustomTipAmount}
      />

      {/* Split Bill Options & Setup */}
      {allowSplitBill && customerCount > 1 && (
        <SplitBillSetup
          splitBillMode={splitBillMode}
          customerCount={customerCount}
          splitAmounts={splitAmounts}
          onSetupSplitBill={setupSplitBill}
          onCancelSplit={() => {
            setSplitBillMode(null);
            setSplitAmounts([]);
            setSelectedPayments([]);
          }}
          onUpdateSplitAmount={(index, amount) => {
            const newAmounts = [...splitAmounts];
            newAmounts[index] = amount;
            setSplitAmounts(newAmounts);
          }}
        />
      )}

      {/* Selected Payment Methods */}
      <SelectedPaymentMethods
        selectedPayments={selectedPayments}
        paymentMethods={paymentMethods}
        onRemove={removePaymentMethod}
      />

      {/* Payment Method Selection */}
      <PaymentMethodSelection
        paymentMethods={paymentMethods}
        remainingAmount={remainingAmount}
        isProcessing={isProcessing}
        onSelectMethod={addPaymentMethod}
      />

      {/* Processing Status */}
      <PaymentProcessingStatus
        isProcessing={isProcessing}
        processingStep={processingStep}
      />

      {/* Process Payment Button */}
      <PaymentActionButton
        finalTotal={finalTotal}
        remainingAmount={remainingAmount}
        selectedPaymentsCount={selectedPayments.length}
        isProcessing={isProcessing}
        onProcessPayment={processPayment}
      />
    </VStack>
  );
}