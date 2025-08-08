// src/components/forms/FormValidation.tsx
// Form validation utilities and helpers

import React from 'react';
import { VStack, Text, Alert } from '@chakra-ui/react';

// Validation rules
export interface ValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  custom?: (value: any) => string | null;
  min?: number;
  max?: number;
}

export interface FieldValidation {
  [fieldName: string]: ValidationRule;
}

export interface ValidationErrors {
  [fieldName: string]: string;
}

// Validation function
export const validateField = (value: any, rules: ValidationRule): string | null => {
  // Required validation
  if (rules.required && (!value || (typeof value === 'string' && value.trim() === ''))) {
    return 'This field is required';
  }

  // Skip other validations if field is empty and not required
  if (!value) return null;

  // String validations
  if (typeof value === 'string') {
    if (rules.minLength && value.length < rules.minLength) {
      return `Minimum length is ${rules.minLength} characters`;
    }

    if (rules.maxLength && value.length > rules.maxLength) {
      return `Maximum length is ${rules.maxLength} characters`;
    }

    if (rules.pattern && !rules.pattern.test(value)) {
      return 'Invalid format';
    }
  }

  // Number validations
  if (typeof value === 'number') {
    if (rules.min !== undefined && value < rules.min) {
      return `Minimum value is ${rules.min}`;
    }

    if (rules.max !== undefined && value > rules.max) {
      return `Maximum value is ${rules.max}`;
    }
  }

  // Custom validation
  if (rules.custom) {
    return rules.custom(value);
  }

  return null;
};

// Validate entire form
export const validateForm = (data: Record<string, any>, validation: FieldValidation): ValidationErrors => {
  const errors: ValidationErrors = {};

  for (const fieldName in validation) {
    const error = validateField(data[fieldName], validation[fieldName]);
    if (error) {
      errors[fieldName] = error;
    }
  }

  return errors;
};

// Form validation summary component
interface FormValidationSummaryProps {
  errors: ValidationErrors;
  title?: string;
}

export function FormValidationSummary({ 
  errors, 
  title = "Please fix the following errors:" 
}: FormValidationSummaryProps) {
  const errorList = Object.entries(errors);

  if (errorList.length === 0) {
    return null;
  }

  return (
    <Alert.Root status="error">
      <Alert.Indicator />
      <VStack align="start" gap={2}>
        <Alert.Title>{title}</Alert.Title>
        <VStack align="start" gap={1}>
          {errorList.map(([field, error]) => (
            <Text key={field} fontSize="sm">
              • {field}: {error}
            </Text>
          ))}
        </VStack>
      </VStack>
    </Alert.Root>
  );
}

// Common validation patterns
export const ValidationPatterns = {
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  phone: /^[\+]?[1-9][\d]{0,15}$/,
  url: /^https?:\/\/.+\..+/,
  alphanumeric: /^[a-zA-Z0-9]+$/,
  numeric: /^\d+$/,
  decimal: /^\d+(\.\d{1,2})?$/
};

// Common validation rules
export const CommonValidations = {
  required: { required: true },
  email: { 
    required: true, 
    pattern: ValidationPatterns.email 
  },
  phone: { 
    pattern: ValidationPatterns.phone 
  },
  password: { 
    required: true, 
    minLength: 8 
  },
  positiveNumber: { 
    required: true, 
    min: 0 
  },
  currency: {
    required: true,
    min: 0,
    pattern: ValidationPatterns.decimal
  }
};

export default FormValidationSummary;