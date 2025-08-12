import { SanitizationOptions } from './types';

/**
 * Sanitizes a string by removing/escaping potentially harmful content
 */
export function sanitizeInput(input: string, options: SanitizationOptions = {}): string {
  if (typeof input !== 'string') {
    return input;
  }

  let sanitized = input;

  // Trim whitespace
  if (options.trimStrings !== false) {
    sanitized = sanitized.trim();
  }

  // Remove HTML tags
  if (options.removeHtmlTags) {
    sanitized = sanitized.replace(/<[^>]*>/g, '');
  }

  // Escape HTML entities
  if (options.escapeHtml) {
    sanitized = escapeHtml(sanitized);
  }

  // Normalize whitespace
  if (options.normalizeWhitespace) {
    sanitized = sanitized.replace(/\s+/g, ' ');
  }

  // Remove empty strings if requested
  if (options.removeEmptyStrings && sanitized === '') {
    return null as any;
  }

  return sanitized;
}

/**
 * Sanitizes an entire object recursively
 */
export function sanitizeObject(obj: any, options: SanitizationOptions = {}): any {
  if (obj === null || obj === undefined) {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(item => sanitizeObject(item, options)).filter(item => item !== null);
  }

  if (typeof obj === 'string') {
    return sanitizeInput(obj, options);
  }

  if (typeof obj === 'number') {
    // Convert to numbers if specified
    if (options.convertToNumbers && options.convertToNumbers.includes('*')) {
      return obj;
    }
    return obj;
  }

  if (typeof obj === 'object') {
    const sanitized: any = {};
    
    for (const [key, value] of Object.entries(obj)) {
      // Convert to number if specified
      if (options.convertToNumbers && options.convertToNumbers.includes(key)) {
        const numValue = parseFloat(value as string);
        sanitized[key] = isNaN(numValue) ? value : numValue;
        continue;
      }

      // Convert to date if specified
      if (options.convertToDates && options.convertToDates.includes(key)) {
        const dateValue = new Date(value as string);
        sanitized[key] = isNaN(dateValue.getTime()) ? value : dateValue.toISOString();
        continue;
      }

      // Recursively sanitize
      const sanitizedValue = sanitizeObject(value, options);
      
      // Skip null values if removeEmptyStrings is true
      if (options.removeEmptyStrings && sanitizedValue === null) {
        continue;
      }

      sanitized[key] = sanitizedValue;
    }

    return sanitized;
  }

  return obj;
}

/**
 * Escapes HTML entities to prevent XSS attacks
 */
export function escapeHtml(text: string): string {
  const htmlEscapes: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '/': '&#x2F;',
    '`': '&#96;',
    '=': '&#x3D;'
  };

  return text.replace(/[&<>"'`=\/]/g, (match) => htmlEscapes[match]);
}

/**
 * Removes potentially dangerous characters from file names
 */
export function sanitizeFileName(fileName: string): string {
  return fileName
    .replace(/[^a-zA-Z0-9\-_\.\s]/g, '') // Remove special chars except basic ones
    .replace(/\s+/g, '_') // Replace spaces with underscores
    .replace(/_{2,}/g, '_') // Replace multiple underscores with single
    .toLowerCase()
    .substring(0, 100); // Limit length
}

/**
 * Sanitizes SQL input to prevent SQL injection
 * Note: This is a basic implementation. Use parameterized queries for real protection.
 */
export function sanitizeSql(input: string): string {
  return input
    .replace(/'/g, "''") // Escape single quotes
    .replace(/--/g, '') // Remove SQL comments
    .replace(/\/\*/g, '') // Remove multi-line comments start
    .replace(/\*\//g, '') // Remove multi-line comments end
    .replace(/;/g, '') // Remove semicolons
    .replace(/\b(DROP|DELETE|INSERT|UPDATE|CREATE|ALTER|EXEC|EXECUTE)\b/gi, ''); // Remove dangerous keywords
}

/**
 * Validates and sanitizes URLs
 */
export function sanitizeUrl(url: string): string | null {
  try {
    const parsedUrl = new URL(url);
    
    // Only allow http and https protocols
    if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
      return null;
    }

    return parsedUrl.toString();
  } catch {
    return null;
  }
}

/**
 * Sanitizes JSON input to prevent JSON injection
 */
export function sanitizeJson(input: string): any {
  try {
    const parsed = JSON.parse(input);
    return sanitizeObject(parsed, {
      removeHtmlTags: true,
      escapeHtml: true,
      normalizeWhitespace: true
    });
  } catch {
    return null;
  }
}

/**
 * Validates and sanitizes phone numbers
 */
export function sanitizePhoneNumber(phone: string): string {
  return phone
    .replace(/[^\d\+\-\(\)\s]/g, '') // Keep only numbers, +, -, (, ), and spaces
    .replace(/\s+/g, ' ') // Normalize spaces
    .trim();
}

/**
 * Validates and sanitizes email addresses
 */
export function sanitizeEmail(email: string): string {
  return email
    .toLowerCase()
    .trim()
    .replace(/[^\w\@\.\-\+]/g, ''); // Keep only valid email characters
}