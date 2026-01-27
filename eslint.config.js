import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import noNativeArithmetic from './.eslint/rules/no-native-arithmetic.js'

export default tseslint.config([
  { ignores: ['dist', '4292c6f5-14a3-4978-b79f-af113030d2f1/**'] },
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      ...tseslint.configs.recommended,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
      'precision': {
        rules: {
          'no-native-arithmetic': noNativeArithmetic,
        },
      },
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true },
      ],
      
      // 🚫 NO CONSOLE.LOG - Use logger.* from @/lib/logging instead
      'no-console': ['error', {
        allow: ['warn', 'error'] // Only allow console.warn and console.error for critical cases
      }],
      
      // 🎯 PRECISION - Use DecimalUtils for financial calculations
      'precision/no-native-arithmetic': 'error',
      
      // 🎨 DESIGN SYSTEM - Enforce design tokens usage
      'no-restricted-syntax': [
        'error',
        {
          selector: 'JSXAttribute[name.name=\'padding\'][value.type=\'Literal\']',
          message: '❌ No uses valores hardcoded para padding. Usa tokens: p="6" (24px), p="4" (16px), etc.'
        },
        {
          selector: 'JSXAttribute[name.name=\'margin\'][value.type=\'Literal\']',
          message: '❌ No uses valores hardcoded para margin. Usa tokens: m="6", m="4", etc.'
        },
        {
          selector: 'JSXAttribute[name.name=\'gap\'][value.type=\'Literal\']',
          message: '❌ No uses valores hardcoded para gap. Usa tokens: gap="4" (16px), gap="2" (8px), etc.'
        },
        {
          selector: 'JSXAttribute[name.name=\'fontSize\'][value.type=\'Literal\']',
          message: '❌ No uses valores hardcoded para fontSize. Usa tokens: fontSize="md", fontSize="lg", etc.'
        },
        {
          selector: 'JSXAttribute[name.name=\'borderRadius\'][value.type=\'Literal\']',
          message: '❌ No uses valores hardcoded para borderRadius. Usa tokens: borderRadius="lg" (8px), borderRadius="md" (6px), etc.'
        }
      ],
      
      // 🎨 DESIGN SYSTEM - Force imports from @/shared/ui
      'no-restricted-imports': [
        'error',
        {
          paths: [
            {
              name: '@chakra-ui/react',
              message: '❌ NO importes directamente de Chakra UI. Usa: import { Box, Button } from \'@/shared/ui\''
            }
          ]
        }
      ],
    },
  },
]);