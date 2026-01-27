/**
 * useMercadoPagoCheckout Hook
 * Handles checkout process with Mercado Pago
 */

import { useState } from 'react';
import { logger } from '@/lib/logging';
import { notify } from '@/lib/notifications';
import type { CreatePreferenceParams, PreferenceResponse } from '../services/mercadoPagoService';

export interface CheckoutItem {
  id?: string;
  title: string;
  description?: string;
  quantity: number;
  unit_price: number;
}

export interface CheckoutParams {
  items: CheckoutItem[];
  external_reference?: string; // sale_id or order_id
  payer?: {
    name?: string;
    surname?: string;
    email?: string;
    phone?: {
      area_code?: string;
      number?: string;
    };
  };
  metadata?: Record<string, unknown>;
}

export function useMercadoPagoCheckout() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [preference, setPreference] = useState<PreferenceResponse | null>(null);

  /**
   * Create preference and redirect to Mercado Pago
   */
  const processCheckout = async (params: CheckoutParams): Promise<boolean> => {
    setIsProcessing(true);

    try {
      logger.info('useMercadoPagoCheckout', 'Processing checkout', {
        items_count: params.items.length,
        external_reference: params.external_reference,
      });

      // Get current URL for back URLs
      const baseUrl = window.location.origin;
      const backUrls = {
        success: `${baseUrl}/app/checkout/success`,
        failure: `${baseUrl}/app/checkout/failure`,
        pending: `${baseUrl}/app/checkout/success`, // Redirect to success but show pending status
      };

      // TODO: Replace with actual API call to your backend
      // Your backend should create the preference using MercadoPago SDK
      const response = await fetch('/api/mercadopago/create-preference', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          items: params.items,
          back_urls: backUrls,
          notification_url: `${baseUrl}/api/webhooks/mercadopago`,
          external_reference: params.external_reference,
          auto_return: 'approved',
          payer: params.payer,
          metadata: params.metadata,
        } as CreatePreferenceParams),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create preference');
      }

      const preferenceData: PreferenceResponse = await response.json();
      setPreference(preferenceData);

      logger.info('useMercadoPagoCheckout', 'Preference created', {
        preference_id: preferenceData.id,
      });

      // Redirect to Mercado Pago checkout
      window.location.href = preferenceData.init_point;

      return true;
    } catch (error) {
      logger.error('useMercadoPagoCheckout', 'Checkout failed', error);

      notify.error({
        title: 'Error al procesar el pago',
        description: error instanceof Error ? error.message : 'Error desconocido',
      });

      setIsProcessing(false);
      return false;
    }
  };

  /**
   * Process checkout with cart items
   * Simplified version that takes cart data and customer info
   */
  const checkoutWithCart = async (
    cartItems: Array<{
      id: string;
      name: string;
      price: number;
      quantity: number;
    }>,
    customerInfo?: {
      name?: string;
      email?: string;
      phone?: string;
    }
  ): Promise<boolean> => {
    const items: CheckoutItem[] = cartItems.map(item => ({
      id: item.id,
      title: item.name,
      quantity: item.quantity,
      unit_price: item.price,
    }));

    const payer = customerInfo ? {
      name: customerInfo.name?.split(' ')[0],
      surname: customerInfo.name?.split(' ').slice(1).join(' '),
      email: customerInfo.email,
      phone: customerInfo.phone ? {
        number: customerInfo.phone,
      } : undefined,
    } : undefined;

    return await processCheckout({
      items,
      payer,
      metadata: {
        source: 'customer_checkout',
        timestamp: new Date().toISOString(),
      },
    });
  };

  return {
    processCheckout,
    checkoutWithCart,
    isProcessing,
    preference,
  };
}
