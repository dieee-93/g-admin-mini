import { useState } from 'react';

export type CheckoutStep = 'delivery' | 'review' | 'payment' | 'confirmation';

export interface CheckoutData {
  deliveryAddressId: string | null;
  paymentMethod: string | null;
  orderId: string | null;
}

interface UseCheckoutReturn {
  currentStep: CheckoutStep;
  checkoutData: CheckoutData;
  goToNextStep: () => void;
  goToPreviousStep: () => void;
  goToStep: (step: CheckoutStep) => void;
  updateCheckoutData: (data: Partial<CheckoutData>) => void;
  canProceed: boolean;
}

const STEP_ORDER: CheckoutStep[] = ['delivery', 'review', 'payment', 'confirmation'];

export function useCheckout(): UseCheckoutReturn {
  const [currentStep, setCurrentStep] = useState<CheckoutStep>('delivery');
  const [checkoutData, setCheckoutData] = useState<CheckoutData>({
    deliveryAddressId: null,
    paymentMethod: null,
    orderId: null,
  });

  const goToNextStep = () => {
    const currentIndex = STEP_ORDER.indexOf(currentStep);
    if (currentIndex < STEP_ORDER.length - 1) {
      setCurrentStep(STEP_ORDER[currentIndex + 1]);
    }
  };

  const goToPreviousStep = () => {
    const currentIndex = STEP_ORDER.indexOf(currentStep);
    if (currentIndex > 0) {
      setCurrentStep(STEP_ORDER[currentIndex - 1]);
    }
  };

  const goToStep = (step: CheckoutStep) => {
    setCurrentStep(step);
  };

  const updateCheckoutData = (data: Partial<CheckoutData>) => {
    setCheckoutData((prev) => ({ ...prev, ...data }));
  };

  // Validation logic for each step
  const canProceed = (() => {
    switch (currentStep) {
      case 'delivery':
        return checkoutData.deliveryAddressId !== null;
      case 'review':
        return true; // Always can proceed from review
      case 'payment':
        return checkoutData.paymentMethod !== null;
      case 'confirmation':
        return false; // Final step, no proceed
      default:
        return false;
    }
  })();

  return {
    currentStep,
    checkoutData,
    goToNextStep,
    goToPreviousStep,
    goToStep,
    updateCheckoutData,
    canProceed,
  };
}
