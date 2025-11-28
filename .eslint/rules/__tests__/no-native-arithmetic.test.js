/**
 * Tests for no-native-arithmetic ESLint rule
 */

import { RuleTester } from 'eslint';
import rule from '../no-native-arithmetic.js';

const ruleTester = new RuleTester({
  languageOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
  },
});

ruleTester.run('no-native-arithmetic', rule, {
  valid: [
    // ✅ Loop counters are allowed
    {
      code: 'for (let i = 0; i < 10; i++) {}',
    },
    {
      code: 'const nextIndex = index + 1;',
    },
    {
      code: 'const prevIndex = idx - 1;',
    },

    // ✅ DecimalUtils usage (correct pattern)
    {
      code: `
        import { DecimalUtils } from '@/business-logic/shared/decimalUtils';
        const total = DecimalUtils.multiply(price.toString(), quantity.toString(), 'financial');
      `,
    },

    // ✅ String concatenation
    {
      code: "const message = 'Total: ' + price;",
    },

    // ✅ Test files are exempt
    {
      code: 'const total = price * quantity;',
      filename: 'test.spec.ts',
    },
    {
      code: 'const total = price * quantity;',
      filename: 'component.test.tsx',
    },
    {
      code: 'const total = price * quantity;',
      filename: '__tests__/service.test.ts',
    },
  ],

  invalid: [
    // ❌ Native multiplication with price
    {
      code: 'const total = price * quantity;',
      errors: [
        {
          messageId: 'nativeArithmetic',
          data: {
            operator: '*',
            variable: 'price',
            method: 'multiply',
          },
        },
      ],
    },

    // ❌ Native addition with total
    {
      code: 'const grandTotal = total + tax;',
      errors: [
        {
          messageId: 'nativeArithmetic',
          data: {
            operator: '+',
            variable: 'total',
            method: 'add',
          },
        },
      ],
    },

    // ❌ Native subtraction with discount
    {
      code: 'const finalPrice = price - discount;',
      errors: [
        {
          messageId: 'nativeArithmetic',
          data: {
            operator: '-',
            variable: 'price',
            method: 'subtract',
          },
        },
      ],
    },

    // ❌ Native division with revenue (AST traversal order: división primero, luego resta)
    {
      code: 'const margin = (revenue - cost) / revenue;',
      errors: [
        {
          messageId: 'nativeArithmetic',
          data: {
            operator: '/',
            variable: 'revenue',
            method: 'divide',
          },
        },
        {
          messageId: 'nativeArithmetic',
          data: {
            operator: '-',
            variable: 'revenue',
            method: 'subtract',
          },
        },
      ],
    },

    // ❌ Compound assignment with cost
    {
      code: 'totalCost += itemCost;',
      errors: [
        {
          messageId: 'nativeArithmetic',
          data: {
            operator: '+=',
            variable: 'totalCost',
            method: 'add',
          },
        },
      ],
    },

    // ❌ Member expression with financial property
    {
      code: 'const total = item.price * item.quantity;',
      errors: [
        {
          messageId: 'nativeArithmetic',
          data: {
            operator: '*',
            variable: 'price',
            method: 'multiply',
          },
        },
      ],
    },

    // ❌ Multiple financial keywords
    {
      code: 'const profit = revenue - cost;',
      errors: [
        {
          messageId: 'nativeArithmetic',
          data: {
            operator: '-',
            variable: 'revenue',
            method: 'subtract',
          },
        },
      ],
    },

    // ❌ Nested operations (AST traversal order: suma primero, luego multiplicación)
    {
      code: 'const total = (price * quantity) + tax;',
      errors: [
        {
          messageId: 'nativeArithmetic',
          data: {
            operator: '+',
            variable: 'tax',
            method: 'add',
          },
        },
        {
          messageId: 'nativeArithmetic',
          data: {
            operator: '*',
            variable: 'price',
            method: 'multiply',
          },
        },
      ],
    },

    // ❌ Camel case variants
    {
      code: 'const unitPrice = basePrice * markup;',
      errors: [
        {
          messageId: 'nativeArithmetic',
          data: {
            operator: '*',
            variable: 'basePrice',
            method: 'multiply',
          },
        },
      ],
    },

    // ❌ Financial keywords: subtotal, fee, balance
    {
      code: 'const subtotal = lineItems.reduce((sum, item) => sum + item.amount, 0);',
      errors: [
        {
          messageId: 'nativeArithmetic',
          data: {
            operator: '+',
            variable: 'amount',
            method: 'add',
          },
        },
      ],
    },
  ],
});

console.log('✅ All tests passed for no-native-arithmetic rule!');
