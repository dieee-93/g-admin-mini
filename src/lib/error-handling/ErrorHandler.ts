import { logger } from '@/lib/logging';

export enum ErrorType {
  VALIDATION = 'validation',
  NETWORK = 'network',
  AUTH = 'auth',
  BUSINESS = 'business',
  SYSTEM = 'system'
}

export enum ErrorSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

export interface AppError {
  id: string;
  type: ErrorType;
  severity: ErrorSeverity;
  message: string;
  details?: any;
  timestamp: Date;
  userId?: string;
  context?: Record<string, any>;
  stack?: string;
}

export class ErrorHandler {
  private static instance: ErrorHandler;
  private errorQueue: AppError[] = [];
  private maxQueueSize = 100;

  private constructor() { }

  public static getInstance(): ErrorHandler {
    if (!ErrorHandler.instance) {
      ErrorHandler.instance = new ErrorHandler();
    }
    return ErrorHandler.instance;
  }

  public handle(error: Error | AppError, context?: Record<string, any>): AppError {
    const appError = this.normalizeError(error, context);

    // Add to queue for batch processing
    this.addToQueue(appError);

    // Log based on severity
    this.logError(appError);

    // Send to monitoring service for high/critical errors
    if (appError.severity === ErrorSeverity.HIGH || appError.severity === ErrorSeverity.CRITICAL) {
      this.sendToMonitoring(appError);
    }

    return appError;
  }

  private normalizeError(error: Error | AppError, context?: Record<string, any>): AppError {
    if (typeof error === 'object' && error !== null && 'id' in error) {
      return error as AppError;
    }

    if (typeof error === 'string') {
      return {
        id: crypto.randomUUID(),
        type: ErrorType.SYSTEM,
        severity: ErrorSeverity.MEDIUM,
        message: error,
        details: error,
        timestamp: new Date(),
        context
      } as AppError;
    }

    const isError = error instanceof Error;
    const message = isError ? error.message : String(error);
    const stack = isError ? error.stack : undefined;

    return {
      id: crypto.randomUUID(),
      type: isError ? this.inferErrorType(error) : ErrorType.SYSTEM,
      severity: isError ? this.inferSeverity(error) : ErrorSeverity.MEDIUM,
      message,
      details: error,
      timestamp: new Date(),
      context,
      stack
    };
  }

  private inferErrorType(error: Error): ErrorType {
    if (error.message.includes('fetch') || error.message.includes('network')) {
      return ErrorType.NETWORK;
    }
    if (error.message.toLowerCase().includes('unauthorized') ||
      error.message.toLowerCase().includes('forbidden') ||
      error.message.toLowerCase().includes('access')) {
      return ErrorType.AUTH;
    }
    if (error.message.includes('validation') || error.name === 'ValidationError') {
      return ErrorType.VALIDATION;
    }
    return ErrorType.SYSTEM;
  }

  private inferSeverity(error: Error): ErrorSeverity {
    if (error.name === 'ValidationError') return ErrorSeverity.LOW;
    if (error.message.includes('network')) return ErrorSeverity.MEDIUM;
    if (error.message.toLowerCase().includes('unauthorized') ||
      error.message.toLowerCase().includes('forbidden') ||
      error.message.toLowerCase().includes('access')) return ErrorSeverity.HIGH;
    return ErrorSeverity.MEDIUM;
  }

  private addToQueue(error: AppError): void {
    this.errorQueue.push(error);
    if (this.errorQueue.length > this.maxQueueSize) {
      this.errorQueue.shift(); // Remove oldest error
    }
  }

  private logError(error: AppError): void {
    const logData = {
      id: error.id,
      type: error.type,
      severity: error.severity,
      message: error.message,
      timestamp: error.timestamp.toISOString(),
      context: error.context
    };

    switch (error.severity) {
      case ErrorSeverity.CRITICAL:
        logger.error('App', `🚨 CRITICAL ERROR: ${error.message}`, { logData, stack: error.stack });
        break;
      case ErrorSeverity.HIGH:
        logger.error('App', `❌ HIGH ERROR: ${error.message}`, logData);
        break;
      case ErrorSeverity.MEDIUM:
        logger.error('App', `⚠️ MEDIUM ERROR: ${error.message}`, logData);
        break;
      case ErrorSeverity.LOW:
        logger.error('App', `ℹ️ LOW ERROR: ${error.message}`, logData);
        break;
    }

  }

  private async sendToMonitoring(error: AppError): Promise<void> {
    // In production, send to your monitoring service (Sentry, LogRocket, etc.)
    // For now, we'll just store it locally
    try {
      const errorLog = {
        ...error,
        timestamp: error.timestamp.toISOString()
      };

      // Store in localStorage for now (replace with actual service)
      const existingLogs = localStorage.getItem('error-logs');
      const logs = existingLogs ? JSON.parse(existingLogs) : [];
      logs.push(errorLog);

      // Keep only last 50 errors in localStorage
      if (logs.length > 50) {
        logs.splice(0, logs.length - 50);
      }

      localStorage.setItem('error-logs', JSON.stringify(logs));
    } catch (e) {
      logger.error('App', 'Failed to send error to monitoring:', e);
    }
  }

  public getRecentErrors(): AppError[] {
    return [...this.errorQueue];
  }

  public clearQueue(): void {
    this.errorQueue = [];
  }
}

// Utility functions for common error scenarios
export const createValidationError = (message: string, details?: any): AppError => ({
  id: crypto.randomUUID(),
  type: ErrorType.VALIDATION,
  severity: ErrorSeverity.LOW,
  message,
  details,
  timestamp: new Date()
});

export const createNetworkError = (message: string, details?: any): AppError => ({
  id: crypto.randomUUID(),
  type: ErrorType.NETWORK,
  severity: ErrorSeverity.MEDIUM,
  message,
  details,
  timestamp: new Date()
});

export const createAuthError = (message: string, details?: any): AppError => ({
  id: crypto.randomUUID(),
  type: ErrorType.AUTH,
  severity: ErrorSeverity.HIGH,
  message,
  details,
  timestamp: new Date()
});

export const createBusinessError = (message: string, details?: any): AppError => ({
  id: crypto.randomUUID(),
  type: ErrorType.BUSINESS,
  severity: ErrorSeverity.MEDIUM,
  message,
  details,
  timestamp: new Date()
});

// Global error handler instance
export const errorHandler = ErrorHandler.getInstance();