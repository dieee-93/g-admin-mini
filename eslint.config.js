import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import noNativeArithmetic from './.eslint/rules/no-native-arithmetic.js'

export default tseslint.config([
  { ignores: ['dist'] },
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
    },
  },
]);