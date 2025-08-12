import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { ErrorHandler, ErrorType, ErrorSeverity, createValidationError } from '../ErrorHandler';

describe('ErrorHandler', () => {
  let errorHandler: ErrorHandler;
  let consoleSpy: any;

  beforeEach(() => {
    errorHandler = ErrorHandler.getInstance();
    errorHandler.clearQueue();
    
    // Mock console methods
    consoleSpy = {
      error: vi.spyOn(console, 'error').mockImplementation(() => {}),
      warn: vi.spyOn(console, 'warn').mockImplementation(() => {}),
      info: vi.spyOn(console, 'info').mockImplementation(() => {})
    };
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should be a singleton', () => {
    const instance1 = ErrorHandler.getInstance();
    const instance2 = ErrorHandler.getInstance();
    expect(instance1).toBe(instance2);
  });

  it('should handle basic errors', () => {
    const error = new Error('Test error');
    const result = errorHandler.handle(error);

    expect(result.message).toBe('Test error');
    expect(result.type).toBe(ErrorType.SYSTEM);
    expect(result.severity).toBe(ErrorSeverity.MEDIUM);
    expect(result.id).toBeDefined();
    expect(result.timestamp).toBeInstanceOf(Date);
  });

  it('should infer network errors correctly', () => {
    const error = new Error('Failed to fetch data');
    const result = errorHandler.handle(error);

    expect(result.type).toBe(ErrorType.NETWORK);
    expect(result.severity).toBe(ErrorSeverity.MEDIUM);
  });

  it('should infer validation errors correctly', () => {
    const error = new Error('Validation failed');
    error.name = 'ValidationError';
    const result = errorHandler.handle(error);

    expect(result.type).toBe(ErrorType.VALIDATION);
    expect(result.severity).toBe(ErrorSeverity.LOW);
  });

  it('should infer auth errors correctly', () => {
    const error = new Error('Unauthorized access');
    const result = errorHandler.handle(error);

    expect(result.type).toBe(ErrorType.AUTH);
    expect(result.severity).toBe(ErrorSeverity.HIGH);
  });

  it('should log errors with correct severity', () => {
    const criticalError = new Error('Critical system failure');
    const appError = {
      ...createValidationError('Test validation error'),
      severity: ErrorSeverity.CRITICAL
    };
    
    errorHandler.handle({ ...appError });
    errorHandler.handle(criticalError);

    expect(consoleSpy.error).toHaveBeenCalled();
  });

  it('should add errors to queue', () => {
    const error1 = new Error('Error 1');
    const error2 = new Error('Error 2');

    errorHandler.handle(error1);
    errorHandler.handle(error2);

    const recentErrors = errorHandler.getRecentErrors();
    expect(recentErrors).toHaveLength(2);
    expect(recentErrors[0].message).toBe('Error 1');
    expect(recentErrors[1].message).toBe('Error 2');
  });

  it('should limit queue size', () => {
    // Create more than max queue size errors
    for (let i = 0; i < 101; i++) {
      errorHandler.handle(new Error(`Error ${i}`));
    }

    const recentErrors = errorHandler.getRecentErrors();
    expect(recentErrors.length).toBeLessThanOrEqual(100);
    expect(recentErrors[0].message).toBe('Error 1'); // Oldest should be removed
  });

  it('should clear queue', () => {
    errorHandler.handle(new Error('Test error'));
    expect(errorHandler.getRecentErrors()).toHaveLength(1);
    
    errorHandler.clearQueue();
    expect(errorHandler.getRecentErrors()).toHaveLength(0);
  });

  it('should handle context information', () => {
    const error = new Error('Test error');
    const context = { userId: '123', action: 'test' };
    
    const result = errorHandler.handle(error, context);
    
    expect(result.context).toEqual(context);
  });

  it('should preserve stack traces', () => {
    const error = new Error('Test error');
    const result = errorHandler.handle(error);
    
    expect(result.stack).toBeDefined();
    expect(result.stack).toContain('Test error');
  });
});