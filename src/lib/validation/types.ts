// Validation system types

export interface ValidationRule {
  field: string;
  rules: {
    required?: boolean;
    minLength?: number;
    maxLength?: number;
    min?: number;
    max?: number;
    pattern?: RegExp;
    custom?: (value: any) => boolean | string;
    type?: 'string' | 'number' | 'email' | 'phone' | 'currency' | 'date';
  };
  message?: string;
}

export interface ValidationSchema {
  rules: ValidationRule[];
  sanitize?: boolean;
  permissions?: string[];
  businessRules?: BusinessRule[];
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  sanitizedData?: any;
  warnings?: ValidationWarning[];
}

export interface ValidationError {
  field: string;
  message: string;
  code: string;
  severity: 'error' | 'warning';
}

export interface ValidationWarning {
  field: string;
  message: string;
  code: string;
}

export interface SanitizationOptions {
  trimStrings?: boolean;
  removeHtmlTags?: boolean;
  escapeHtml?: boolean;
  normalizeWhitespace?: boolean;
  removeEmptyStrings?: boolean;
  convertToNumbers?: string[];
  convertToDates?: string[];
}

export interface PermissionCheck {
  action: string;
  resource: string;
  context?: Record<string, any>;
}

export interface BusinessRule {
  name: string;
  description: string;
  validate: (data: any, context?: Record<string, any>) => boolean | string;
  severity: 'error' | 'warning';
  category: 'inventory' | 'sales' | 'finance' | 'staff' | 'general';
}

export interface SecurityOptions {
  rateLimit?: {
    maxRequests: number;
    windowMs: number;
  };
  requireAuth?: boolean;
  requiredPermissions?: string[];
  validateCsrf?: boolean;
  sanitizeInput?: boolean;
  logAccess?: boolean;
}