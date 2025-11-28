/**
 * ESLint Rule: no-native-arithmetic
 *
 * Prohibe el uso de operadores aritméticos nativos (+, -, *, /) en variables
 * que manejan dinero, costos, precios, o inventario.
 *
 * @fileoverview Enforces use of DecimalUtils for financial calculations
 * @author G-Admin Mini Team
 */

export default {
  meta: {
    type: 'problem',
    docs: {
      description: 'Disallow native arithmetic operators for financial calculations',
      category: 'Possible Errors',
      recommended: true,
      url: 'https://github.com/g-admin-mini/docs/eslint-precision-rules.md',
    },
    messages: {
      nativeArithmetic: 'Avoid using native arithmetic operator "{{operator}}" with financial variable "{{variable}}". Use DecimalUtils.{{method}}() instead.',
      nativeArithmeticGeneric: 'Avoid using native arithmetic operator "{{operator}}" for potential financial calculation. Use DecimalUtils instead.',
    },
    schema: [], // No options for this rule
    fixable: null, // This rule does not provide auto-fixes
  },

  create(context) {
    // Keywords que indican variables financieras/monetarias
    const FINANCIAL_KEYWORDS = [
      'price', 'cost', 'amount', 'total', 'subtotal', 'tax',
      'revenue', 'profit', 'margin', 'discount', 'fee', 'charge',
      'balance', 'payment', 'refund', 'credit', 'debit',
      'salary', 'wage', 'commission', 'bonus', 'tip',
      'mrr', 'arr', 'ltv', 'arpu', 'rate', 'value',
      'overhead', 'markup', 'gross', 'net', 'earning'
    ];

    // Operadores a detectar
    const ARITHMETIC_OPERATORS = ['+', '-', '*', '/'];

    // Mapeo de operadores a métodos de DecimalUtils
    const OPERATOR_TO_METHOD = {
      '+': 'add',
      '-': 'subtract',
      '*': 'multiply',
      '/': 'divide',
    };

    /**
     * Verifica si un nombre de variable contiene keywords financieros
     */
    function isFinancialVariable(name) {
      if (!name) return false;
      const lowerName = name.toLowerCase();
      return FINANCIAL_KEYWORDS.some(keyword => lowerName.includes(keyword));
    }

    /**
     * Verifica si estamos en un archivo de tests
     */
    function isTestFile() {
      const filename = context.getFilename();
      return filename.includes('.test.') ||
             filename.includes('.spec.') ||
             filename.includes('__tests__');
    }

    /**
     * Verifica si es un loop counter (i++, index + 1, etc.)
     */
    function isLoopCounter(node) {
      // Casos comunes: i++, i--, ++i, --i
      if (node.parent.type === 'UpdateExpression') {
        return true;
      }

      // Caso: i + 1, index - 1, etc.
      if (node.parent.type === 'BinaryExpression') {
        const { left, right } = node.parent;

        // Verificar si el otro operando es un número literal pequeño (0-10)
        const otherNode = left === node ? right : left;
        if (otherNode.type === 'Literal' &&
            typeof otherNode.value === 'number' &&
            Math.abs(otherNode.value) <= 10) {

          // Verificar si la variable es un índice común
          const varName = node.name?.toLowerCase();
          if (varName && ['i', 'j', 'k', 'index', 'idx', 'count'].includes(varName)) {
            return true;
          }
        }
      }

      return false;
    }

    /**
     * Obtiene el nombre de la variable en una expresión
     */
    function getVariableName(node) {
      if (node.type === 'Identifier') {
        return node.name;
      }
      if (node.type === 'MemberExpression') {
        // Para item.price, devolver 'price'
        return node.property.name;
      }
      return null;
    }

    /**
     * Verifica si es una concatenación de strings
     */
    function isStringConcatenation(node) {
      if (node.operator !== '+') return false;

      // Si uno de los operandos es un literal string, es concatenación
      if (node.left.type === 'Literal' && typeof node.left.value === 'string') {
        return true;
      }
      if (node.right.type === 'Literal' && typeof node.right.value === 'string') {
        return true;
      }

      // Si es un template literal, también es concatenación
      if (node.left.type === 'TemplateLiteral' || node.right.type === 'TemplateLiteral') {
        return true;
      }

      return false;
    }

    /**
     * Verifica si la expresión involucra variables financieras
     */
    function involvesFinancialVariable(node) {
      if (node.type === 'BinaryExpression') {
        const leftName = getVariableName(node.left);
        const rightName = getVariableName(node.right);

        return isFinancialVariable(leftName) || isFinancialVariable(rightName);
      }
      return false;
    }

    return {
      BinaryExpression(node) {
        // Ignorar archivos de tests
        if (isTestFile()) {
          return;
        }

        // Solo verificar operadores aritméticos
        if (!ARITHMETIC_OPERATORS.includes(node.operator)) {
          return;
        }

        // Ignorar loop counters
        if (isLoopCounter(node.left) || isLoopCounter(node.right)) {
          return;
        }

        // Ignorar concatenación de strings
        if (isStringConcatenation(node)) {
          return;
        }

        // Verificar si involucra variables financieras
        if (involvesFinancialVariable(node)) {
          const leftName = getVariableName(node.left);
          const rightName = getVariableName(node.right);
          const financialVar = isFinancialVariable(leftName) ? leftName : rightName;

          context.report({
            node,
            messageId: 'nativeArithmetic',
            data: {
              operator: node.operator,
              variable: financialVar,
              method: OPERATOR_TO_METHOD[node.operator],
            },
          });
        }
      },

      // Detectar compound assignments (+=, -=, *=, /=)
      AssignmentExpression(node) {
        // Ignorar archivos de tests
        if (isTestFile()) {
          return;
        }

        const compoundOperators = ['+=', '-=', '*=', '/='];
        if (!compoundOperators.includes(node.operator)) {
          return;
        }

        const varName = getVariableName(node.left);
        if (isFinancialVariable(varName)) {
          const baseOperator = node.operator.charAt(0);

          context.report({
            node,
            messageId: 'nativeArithmetic',
            data: {
              operator: node.operator,
              variable: varName,
              method: OPERATOR_TO_METHOD[baseOperator],
            },
          });
        }
      },
    };
  },
};
