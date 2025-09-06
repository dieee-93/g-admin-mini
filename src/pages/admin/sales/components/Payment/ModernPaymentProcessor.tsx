// src/features/sales/components/Payment/ModernPaymentProcessor.tsx
// 🚀 PAYMENT REVOLUTION - Modern Payment Processing System
import { useState, useEffect, useMemo } from 'react';
import {
  Box,
  CardWrapper ,
  Text,
  Button,
  VStack,
  HStack,
  Badge,
  Grid,
  Input,
  Separator,
  Alert,
  Progress,
  Select,
  createListCollection
} from '@chakra-ui/react';
import {
  CreditCardIcon,
  DevicePhoneMobileIcon,
  QrCodeIcon,
  BanknotesIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import {
  PaymentType,
  PaymentMethod,
  PaymentTransactionStatus,
  SplitBill,
  SplitBillType,
  TipConfiguration,
  DEFAULT_TIP_PERCENTAGES,
  PAYMENT_PROCESSING_TIMES
} from '../../types';
import { EventBus } from '@/lib/events/EventBus';
import { RestaurantEvents, type PaymentCompletedEvent } from '@/lib/events/RestaurantEvents';
import { useTaxCalculation } from '@/modules/fiscal/hooks/useTaxCalculation';

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

  // Payment method configurations
  const paymentMethods = useMemo(() => [
    {
      type: PaymentType.CASH,
      label: 'Cash',
      icon: BanknotesIcon,
      color: 'green',
      processingTime: PAYMENT_PROCESSING_TIMES[PaymentType.CASH],
      isContactless: false,
      description: 'Traditional cash payment'
    },
    {
      type: PaymentType.CREDIT_CARD,
      label: 'Credit CardWrapper ',
      icon: CreditCardIcon,
      color: 'blue',
      processingTime: PAYMENT_PROCESSING_TIMES[PaymentType.CREDIT_CARD],
      isContactless: false,
      description: 'Insert or swipe card'
    },
    {
      type: PaymentType.NFC_CARD,
      label: 'Tap to Pay',
      icon: CreditCardIcon,
      color: 'purple',
      processingTime: PAYMENT_PROCESSING_TIMES[PaymentType.NFC_CARD],
      isContactless: true,
      description: 'Contactless card payment'
    },
    {
      type: PaymentType.MOBILE_WALLET,
      label: 'Mobile Wallet',
      icon: DevicePhoneMobileIcon,
      color: 'orange',
      processingTime: PAYMENT_PROCESSING_TIMES[PaymentType.MOBILE_WALLET],
      isContactless: true,
      description: 'Apple Pay, Google Pay, Samsung Pay'
    },
    {
      type: PaymentType.QR_CODE,
      label: 'QR Code',
      icon: QrCodeIcon,
      color: 'cyan',
      processingTime: PAYMENT_PROCESSING_TIMES[PaymentType.QR_CODE],
      isContactless: true,
      description: 'Scan QR code to pay'
    }
  ], []);

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
  }, [tipConfiguration, subtotal]);

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
  const updatePaymentAmount = (index: number, amount: number) => {
    const updated = [...selectedPayments];
    updated[index] = { ...updated[index], amount };
    setSelectedPayments(updated);
  };

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
      const paymentMethods: PaymentMethod[] = [];
      
      for (let i = 0; i < selectedPayments.length; i++) {
        const payment = selectedPayments[i];
        setProcessingStep(`Processing ${payment.type} payment ${i + 1}/${selectedPayments.length}...`);
        
        // Simulate payment processing time
        await new Promise(resolve => setTimeout(resolve, payment.processingTime * 1000));
        
        // In a real implementation, you would call your payment processor here
        const paymentMethod: PaymentMethod = {
          id: `pm_${Date.now()}_${i}`,
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
        
        paymentMethods.push(paymentMethod);

        // Emitir evento PAYMENT_COMPLETED para cada método de pago
        const paymentCompletedEvent: PaymentCompletedEvent = {
          paymentId: paymentMethod.id,
          orderId: undefined, // Will be set by higher-level component
          saleId: saleId,
          amount: payment.amount + payment.tipAmount,
          paymentMethod: payment.type,
          customerId: undefined, // Will be set by higher-level component if available
          timestamp: new Date().toISOString(),
          reference: paymentMethod.id
        };

        await EventBus.emit(RestaurantEvents.PAYMENT_COMPLETED, paymentCompletedEvent, 'PaymentModule');
      }
      
      setProcessingStep('Finalizing transaction...');
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      onPaymentComplete(paymentMethods);
      
    } catch (error) {
      onPaymentError(error instanceof Error ? error.message : 'Payment processing failed');
    } finally {
      setIsProcessing(false);
      setProcessingStep('');
    }
  };

  return (
    <VStack gap="6" align="stretch">
      {/* Payment Summary */}
      <CardWrapper .Root p="4" bg="bg.canvas">
        <VStack gap="3" align="stretch">
          <HStack justify="space-between">
            <Text fontWeight="medium">Subtotal:</Text>
            <Text>${calculatedSubtotal.toFixed(2)}</Text>
          </HStack>
          <HStack justify="space-between">
            <Text fontWeight="medium">Tax:</Text>
            <Text>${calculatedTaxes.toFixed(2)}</Text>
          </HStack>
          <HStack justify="space-between">
            <Text fontWeight="medium" color={tipAmount > 0 ? "green.600" : "gray.600"}>
              Tip ({tipPercentage}%):
            </Text>
            <Text color={tipAmount > 0 ? "green.600" : "gray.600"}>
              ${tipAmount.toFixed(2)}
            </Text>
          </HStack>
          <Separator />
          <HStack justify="space-between">
            <Text fontSize="lg" fontWeight="bold">Total:</Text>
            <Text fontSize="lg" fontWeight="bold" color="green.600">
              ${finalTotal.toFixed(2)}
            </Text>
          </HStack>
          {remainingAmount > 0 && (
            <HStack justify="space-between">
              <Text fontWeight="medium" color="red.600">Remaining:</Text>
              <Text fontWeight="bold" color="red.600">
                ${remainingAmount.toFixed(2)}
              </Text>
            </HStack>
          )}
        </VStack>
      </CardWrapper .Root>

      {/* Tip Configuration */}
      <CardWrapper .Root>
        <CardWrapper .Header>
          <Text fontWeight="bold">Tip Amount</Text>
        </CardWrapper .Header>
        <CardWrapper .Body>
          <VStack gap="4" align="stretch">
            <Select.Root
              collection={tipOptions}
              value={[customTipAmount > 0 ? 'custom' : tipPercentage.toString()]}
              onValueChange={(details) => {
                const value = details.value[0];
                if (value === 'custom') {
                  // Keep current custom amount
                } else {
                  const percentage = parseInt(value);
                  setTipPercentage(percentage);
                  setCustomTipAmount(0);
                }
              }}
            >
              <Select.Trigger>
                <Select.ValueText placeholder="Select tip percentage" />
              </Select.Trigger>
              <Select.Content>
                {tipOptions.items.map((option) => (
                  <Select.Item key={option.value} item={option}>
                    {option.label}
                  </Select.Item>
                ))}
              </Select.Content>
            </Select.Root>

            {(customTipAmount > 0 || tipOptions.items.find(item => item.value === 'custom')) && (
              <Box>
                <Text mb="2" fontSize="sm" fontWeight="medium">Custom Tip Amount</Text>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={customTipAmount}
                  onChange={(e) => setCustomTipAmount(parseFloat(e.target.value) || 0)}
                  placeholder="Enter custom tip amount"
                />
              </Box>
            )}
          </VStack>
        </CardWrapper .Body>
      </CardWrapper .Root>

      {/* Split Bill Options */}
      {allowSplitBill && customerCount > 1 && !splitBillMode && (
        <CardWrapper .Root>
          <CardWrapper .Header>
            <Text fontWeight="bold">Split Bill ({customerCount} customers)</Text>
          </CardWrapper .Header>
          <CardWrapper .Body>
            <HStack gap="3">
              <Button
                variant="outline"
                onClick={() => setupSplitBill(SplitBillType.EVEN)}
                flex="1"
              >
                Split Evenly
              </Button>
              <Button
                variant="outline"
                onClick={() => setupSplitBill(SplitBillType.CUSTOM)}
                flex="1"
              >
                Custom Split
              </Button>
            </HStack>
          </CardWrapper .Body>
        </CardWrapper .Root>
      )}

      {/* Split Bill Setup */}
      {splitBillMode && (
        <CardWrapper .Root>
          <CardWrapper .Header>
            <HStack justify="space-between">
              <Text fontWeight="bold">
                {splitBillMode === SplitBillType.EVEN ? 'Even Split' : 'Custom Split'}
              </Text>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSplitBillMode(null);
                  setSplitAmounts([]);
                  setSelectedPayments([]);
                }}
              >
                Cancel Split
              </Button>
            </HStack>
          </CardWrapper .Header>
          <CardWrapper .Body>
            <VStack gap="3" align="stretch">
              {splitAmounts.map((amount, index) => (
                <HStack key={index} gap="3">
                  <Text flex="1">Customer {index + 1}:</Text>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={amount}
                    onChange={(e) => {
                      const newAmounts = [...splitAmounts];
                      newAmounts[index] = parseFloat(e.target.value) || 0;
                      setSplitAmounts(newAmounts);
                    }}
                    width="120px"
                    disabled={splitBillMode === SplitBillType.EVEN}
                  />
                  <Text>${amount.toFixed(2)}</Text>
                </HStack>
              ))}
              <Text fontSize="sm" color="gray.600">
                Total split: ${splitAmounts.reduce((sum, amount) => sum + amount, 0).toFixed(2)}
              </Text>
            </VStack>
          </CardWrapper .Body>
        </CardWrapper .Root>
      )}

      {/* Selected Payment Methods */}
      {selectedPayments.length > 0 && (
        <CardWrapper .Root>
          <CardWrapper .Header>
            <Text fontWeight="bold">Selected Payment Methods</Text>
          </CardWrapper .Header>
          <CardWrapper .Body>
            <VStack gap="3" align="stretch">
              {selectedPayments.map((payment, index) => {
                const method = paymentMethods.find(m => m.type === payment.type);
                const Icon = method?.icon || CreditCardIcon;
                
                return (
                  <HStack key={index} gap="3" p="3" bg="bg.canvas" borderRadius="md">
                    <Icon className="w-5 h-5" />
                    <VStack align="start" flex="1" gap="1">
                      <Text fontWeight="medium">{method?.label}</Text>
                      <Text fontSize="sm" color="gray.600">
                        Amount: ${payment.amount.toFixed(2)}
                        {payment.tipAmount > 0 && ` + $${payment.tipAmount.toFixed(2)} tip`}
                      </Text>
                    </VStack>
                    {payment.isContactless && (
                      <Badge colorPalette="green" size="sm">Contactless</Badge>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      colorPalette="red"
                      onClick={() => removePaymentMethod(index)}
                    >
                      Remove
                    </Button>
                  </HStack>
                );
              })}
            </VStack>
          </CardWrapper .Body>
        </CardWrapper .Root>
      )}

      {/* Payment Method Selection */}
      <CardWrapper .Root>
        <CardWrapper .Header>
          <Text fontWeight="bold">Payment Methods</Text>
        </CardWrapper .Header>
        <CardWrapper .Body>
          <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }} gap="3">
            {paymentMethods.map((method) => {
              const Icon = method.icon;
              const isDisabled = remainingAmount <= 0;
              
              return (
                <Button
                  key={method.type}
                  variant="outline"
                  p="4"
                  h="auto"
                  onClick={() => addPaymentMethod(method.type)}
                  disabled={isDisabled || isProcessing}
                  _hover={!isDisabled ? { borderColor: `${method.color}.300` } : {}}
                >
                  <VStack gap="2">
                    <HStack gap="2">
                      <Icon className="w-5 h-5" />
                      <Text fontWeight="medium">{method.label}</Text>
                      {method.isContactless && (
                        <Badge colorPalette="green" size="sm">NFC</Badge>
                      )}
                    </HStack>
                    <Text fontSize="xs" color="gray.600" textAlign="center">
                      {method.description}
                    </Text>
                    <Text fontSize="xs" color="gray.500">
                      ~{method.processingTime}s
                    </Text>
                  </VStack>
                </Button>
              );
            })}
          </Grid>
        </CardWrapper .Body>
      </CardWrapper .Root>

      {/* Processing Status */}
      {isProcessing && (
        <Alert.Root status="info">
          <Alert.Indicator>
            <ClockIcon className="w-4 h-4" />
          </Alert.Indicator>
          <VStack align="start" flex="1" gap="2">
            <Alert.Title>Processing Payment...</Alert.Title>
            <Alert.Description>{processingStep}</Alert.Description>
            <Progress.Root value={33} size="sm" w="full">
              <Progress.Track>
                <Progress.Range />
              </Progress.Track>
            </Progress.Root>
          </VStack>
        </Alert.Root>
      )}

      {/* Process Payment Button */}
      <Button
        colorPalette="green"
        size="lg"
        onClick={processPayment}
        disabled={remainingAmount > 0.01 || selectedPayments.length === 0 || isProcessing}
        loading={isProcessing}
        loadingText="Processing..."
      >
        <CheckCircleIcon className="w-5 h-5" />
        Process Payment ${finalTotal.toFixed(2)}
      </Button>

      {/* Payment Validation */}
      {remainingAmount > 0.01 && selectedPayments.length > 0 && (
        <Alert.Root status="warning">
          <Alert.Indicator>
            <ExclamationTriangleIcon className="w-4 h-4" />
          </Alert.Indicator>
          <Alert.Title>Incomplete Payment</Alert.Title>
          <Alert.Description>
            Please add payment methods to cover the remaining ${remainingAmount.toFixed(2)}
          </Alert.Description>
        </Alert.Root>
      )}
    </VStack>
  );
}