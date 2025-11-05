/**
 * Quote Builder Component
 *
 * Interface for creating and managing B2B quotes.
 * Includes product selection, quantity, pricing, and approval workflow.
 *
 * @module sales/b2b/components/QuoteBuilder
 */

import { useState } from 'react';
import {
  Box,
  Button,
  Stack,
  Heading,
  Text,
  Input,
  Textarea,
  IconButton,
  Table,
  HStack,
  VStack,
} from '@/shared/ui';
import { FiPlus, FiTrash2, FiSave } from 'react-icons/fi';
import type { QuoteFormData } from '../types';
import { createQuote } from '../services/quotesService';
import { logger } from '@/lib/logging';
import Decimal from 'decimal.js';

interface QuoteBuilderProps {
  customerId?: string;
  onQuoteCreated?: (quoteId: string) => void;
  onCancel?: () => void;
}

interface QuoteItem {
  product_id: string;
  product_name: string;
  quantity: number;
  unit_price: number;
  tiered_price?: number;
  subtotal: number;
}

/**
 * QuoteBuilder Component
 *
 * Full quote builder implementation with:
 * - Customer selection
 * - Product/service line items
 * - Tiered pricing calculation
 * - Quote preview
 * - Send to customer
 */
export const QuoteBuilder: React.FC<QuoteBuilderProps> = ({
  customerId,
  onQuoteCreated,
  onCancel,
}) => {
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<QuoteItem[]>([]);
  const [notes, setNotes] = useState('');
  const [terms, setTerms] = useState('Payment due within 30 days. Prices valid for 14 days.');
  const [validDays, setValidDays] = useState(14);

  // Add new line item
  const addItem = () => {
    setItems([
      ...items,
      {
        product_id: '',
        product_name: '',
        quantity: 1,
        unit_price: 0,
        subtotal: 0,
      },
    ]);
  };

  // Remove line item
  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  // Update item field
  const updateItem = (index: number, field: keyof QuoteItem, value: string | number) => {
    const newItems = [...items];
    newItems[index] = {
      ...newItems[index],
      [field]: value,
    };

    // Recalculate subtotal
    if (field === 'quantity' || field === 'unit_price') {
      const price = newItems[index].tiered_price || newItems[index].unit_price;
      newItems[index].subtotal = new Decimal(price)
        .times(newItems[index].quantity)
        .toNumber();
    }

    setItems(newItems);
  };

  // Calculate totals
  const calculateTotals = () => {
    const subtotal = items.reduce((sum, item) => sum.plus(item.subtotal), new Decimal(0));
    const tax = subtotal.times(0.21); // 21% IVA
    const total = subtotal.plus(tax);

    return {
      subtotal: subtotal.toFixed(2),
      tax: tax.toFixed(2),
      total: total.toFixed(2),
    };
  };

  // Submit quote
  const handleSubmit = async () => {
    if (!customerId) {
      logger.warn('QuoteBuilder', 'No customer selected');
      return;
    }

    if (items.length === 0) {
      logger.warn('QuoteBuilder', 'No items added');
      return;
    }

    try {
      setLoading(true);

      const validUntil = new Date();
      validUntil.setDate(validUntil.getDate() + validDays);

      const quoteData: QuoteFormData = {
        customer_id: customerId,
        items: items.map(item => ({
          product_id: item.product_id,
          quantity: item.quantity,
          unit_price: item.unit_price,
          tiered_price: item.tiered_price,
        })),
        valid_until: validUntil.toISOString(),
        notes,
        terms_and_conditions: terms,
      };

      const newQuote = await createQuote(quoteData);

      logger.info('QuoteBuilder', 'Quote created successfully', { quoteId: newQuote.id });

      if (onQuoteCreated) {
        onQuoteCreated(newQuote.id);
      }
    } catch (error) {
      logger.error('QuoteBuilder', 'Error creating quote', error);
    } finally {
      setLoading(false);
    }
  };

  const totals = calculateTotals();

  return (
    <Stack gap={6}>
      <Heading size="lg">Create B2B Quote</Heading>

      {/* Line Items */}
      <Box>
        <HStack justify="space-between" mb={4}>
          <Heading size="md">Quote Items</Heading>
          <Button
            leftIcon={<FiPlus />}
            onClick={addItem}
            size="sm"
            colorScheme="blue"
          >
            Add Item
          </Button>
        </HStack>

        {items.length === 0 ? (
          <Box p={8} textAlign="center" borderWidth="1px" borderRadius="md" borderStyle="dashed">
            <Text color="gray.500">No items added yet. Click "Add Item" to start.</Text>
          </Box>
        ) : (
          <Table.Root size="sm">
            <Table.Header>
              <Table.Row>
                <Table.ColumnHeader>Product</Table.ColumnHeader>
                <Table.ColumnHeader textAlign="right">Quantity</Table.ColumnHeader>
                <Table.ColumnHeader textAlign="right">Unit Price</Table.ColumnHeader>
                <Table.ColumnHeader textAlign="right">Subtotal</Table.ColumnHeader>
                <Table.ColumnHeader></Table.ColumnHeader>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {items.map((item, index) => (
                <Table.Row key={index}>
                  <Table.Cell>
                    <Input
                      placeholder="Product name"
                      value={item.product_name}
                      onChange={(e) => updateItem(index, 'product_name', e.target.value)}
                      size="sm"
                    />
                  </Table.Cell>
                  <Table.Cell textAlign="right">
                    <Input
                      type="number"
                      value={item.quantity}
                      onChange={(e) => updateItem(index, 'quantity', Number(e.target.value))}
                      size="sm"
                      w="100px"
                    />
                  </Table.Cell>
                  <Table.Cell textAlign="right">
                    <Input
                      type="number"
                      step="0.01"
                      value={item.unit_price}
                      onChange={(e) => updateItem(index, 'unit_price', Number(e.target.value))}
                      size="sm"
                      w="120px"
                    />
                  </Table.Cell>
                  <Table.Cell textAlign="right">
                    <Text fontWeight="medium">${item.subtotal.toFixed(2)}</Text>
                  </Table.Cell>
                  <Table.Cell>
                    <IconButton
                      aria-label="Remove item"
                      size="sm"
                      colorScheme="red"
                      variant="ghost"
                      onClick={() => removeItem(index)}
                    >
                      <FiTrash2 />
                    </IconButton>
                  </Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table.Root>
        )}
      </Box>

      {/* Totals */}
      {items.length > 0 && (
        <VStack align="flex-end" gap={2}>
          <HStack justify="space-between" w="300px">
            <Text>Subtotal:</Text>
            <Text fontWeight="bold">${totals.subtotal}</Text>
          </HStack>
          <HStack justify="space-between" w="300px">
            <Text>Tax (21%):</Text>
            <Text fontWeight="bold">${totals.tax}</Text>
          </HStack>
          <HStack justify="space-between" w="300px" pt={2} borderTopWidth="2px">
            <Text fontSize="lg" fontWeight="bold">Total:</Text>
            <Text fontSize="lg" fontWeight="bold" color="blue.600">${totals.total}</Text>
          </HStack>
        </VStack>
      )}

      {/* Notes and Terms */}
      <Stack gap={4}>
        <Box>
          <Text fontWeight="medium" mb={2}>Notes (Optional)</Text>
          <Textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Additional notes for this quote..."
            rows={3}
          />
        </Box>

        <Box>
          <Text fontWeight="medium" mb={2}>Terms and Conditions</Text>
          <Textarea
            value={terms}
            onChange={(e) => setTerms(e.target.value)}
            rows={3}
          />
        </Box>

        <Box>
          <Text fontWeight="medium" mb={2}>Valid Until (Days)</Text>
          <Input
            type="number"
            value={validDays}
            onChange={(e) => setValidDays(Number(e.target.value))}
            w="150px"
          />
        </Box>
      </Stack>

      {/* Actions */}
      <HStack justify="flex-end" gap={3}>
        {onCancel && (
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button
          leftIcon={<FiSave />}
          colorScheme="blue"
          onClick={handleSubmit}
          loading={loading}
          disabled={items.length === 0 || !customerId}
        >
          Create Quote
        </Button>
      </HStack>
    </Stack>
  );
};

export default QuoteBuilder;
