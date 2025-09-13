import { describe, it, expect, beforeEach } from 'vitest';
import { testLog, perfLog } from '../test/testLogs';

describe('🧪 Test con Logs - Ejemplo', () => {
  beforeEach(() => {
    testLog('Iniciando nuevo test...');
  });

  it('should execute with detailed logs', () => {
    const startTime = Date.now();
    testLog('Ejecutando lógica de test...');
    
    // Tu código de test aquí
    const result = 2 + 2;
    testLog('Resultado calculado:', result);
    
    expect(result).toBe(4);
    
    perfLog('Test execution', startTime);
    testLog('Test completado exitosamente');
  });

  it('should show error logs', () => {
    testLog('Probando manejo de errores...');
    
    try {
      throw new Error('Error de prueba');
    } catch (error) {
      const err = error as Error;
      testLog('Error capturado:', err.message);
      expect(err.message).toBe('Error de prueba');
    }
  });
});
