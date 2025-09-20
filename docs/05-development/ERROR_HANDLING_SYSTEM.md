# 🚨 ERROR HANDLING SYSTEM - G-Admin Mini

**PROPÓSITO**: Sistema centralizado de manejo de errores empresarial para G-Admin Mini
**FECHA CREACIÓN**: 2025-09-19
**ESTADO**: Sistema implementado con gaps identificados
**UBICACIÓN**: `/src/lib/error-handling/` + `/src/lib/notifications.ts`

---

## 🎯 **OVERVIEW DEL SISTEMA**

G-Admin Mini implementa un **sistema de manejo de errores empresarial** con:
- ✅ **ErrorHandler singleton** con queue y batch processing
- ✅ **ErrorBoundary React** con fallback UI
- ✅ **Sistema de notificaciones** integrado con ChakraUI v3
- ✅ **Clasificación automática** por tipo y severidad
- ✅ **Integración con EventBus** para error tracking
- ⚠️ **Gaps críticos** para aplicaciones empresariales

---

## 🏗️ **ARQUITECTURA COMPLETA**

### **COMPONENTES PRINCIPALES**

```
ERROR HANDLING SYSTEM:
├── ErrorHandler.ts           # ✅ Core singleton con queue management
├── ErrorBoundary.tsx         # ✅ React boundary con UI fallback
├── useErrorHandler.ts        # ✅ Hook para componentes
├── notifications.ts          # ✅ Sistema unificado de toasts
└── index.ts                  # ✅ Exports centralizados

INTEGRATION POINTS:
├── EventBus integration      # ✅ Error tracking y metrics
├── ChakraUI v3 toasts       # ✅ UI notifications
├── LocalStorage persistence  # ✅ Error auditing
└── Development debugging     # ✅ Stack traces y context
```

---

## 🔧 **ERRORHANDLER CORE**

### **SINGLETON PATTERN**
```typescript
// Ubicación: /src/lib/error-handling/ErrorHandler.ts

export class ErrorHandler {
  private static instance: ErrorHandler;
  private errorQueue: AppError[] = [];
  private maxQueueSize = 100;

  public static getInstance(): ErrorHandler {
    if (!ErrorHandler.instance) {
      ErrorHandler.instance = new ErrorHandler();
    }
    return ErrorHandler.instance;
  }

  public handle(error: Error | AppError, context?: Record<string, any>): AppError {
    const appError = this.normalizeError(error, context);
    this.addToQueue(appError);
    this.logError(appError);

    // Monitoring para errores críticos
    if (appError.severity === ErrorSeverity.HIGH || appError.severity === ErrorSeverity.CRITICAL) {
      this.sendToMonitoring(appError);
    }

    return appError;
  }
}
```

### **TIPOS DE ERROR**
```typescript
export enum ErrorType {
  VALIDATION = 'validation',    // Errores de validación de datos
  NETWORK = 'network',         // Errores de conexión/API
  AUTH = 'auth',              // Errores de autenticación/autorización
  BUSINESS = 'business',       // Errores de lógica de negocio
  SYSTEM = 'system'           // Errores del sistema/runtime
}

export enum ErrorSeverity {
  LOW = 'low',                // Información, no bloquea operación
  MEDIUM = 'medium',          // Afecta funcionalidad pero no crítico
  HIGH = 'high',              // Funcionalidad comprometida
  CRITICAL = 'critical'       // Sistema comprometido, requiere atención inmediata
}
```

### **INTERFACE APPERROR**
```typescript
export interface AppError {
  id: string;                 // UUID único
  type: ErrorType;           // Clasificación automática
  severity: ErrorSeverity;   // Nivel de impacto
  message: string;           // Mensaje user-friendly
  details?: any;             // Información técnica adicional
  timestamp: Date;           // Cuándo ocurrió
  userId?: string;           // Usuario afectado
  context?: Record<string, any>; // Contexto de la operación
  stack?: string;            // Stack trace para debugging
}
```

---

## 🎣 **USEERRORHANDLER HOOK**

### **API COMPLETA**
```typescript
// Ubicación: /src/lib/error-handling/useErrorHandler.ts

export const useErrorHandler = (): UseErrorHandlerReturn => {
  const handleError = useCallback((error: Error | AppError, context?: Record<string, any>) => {
    return errorHandler.handle(error, context);
  }, []);

  const handleValidationError = useCallback((message: string, details?: any) => {
    const error = new Error(message);
    error.name = 'ValidationError';
    return errorHandler.handle(error, { type: 'validation', details });
  }, []);

  // ... más helpers específicos

  return {
    handleError,
    handleValidationError,
    handleNetworkError,
    handleAuthError,
    handleBusinessError,
    getRecentErrors,
    clearErrors
  };
};
```

### **PATTERNS DE USO**
```typescript
// ✅ PATRÓN BÁSICO
const { handleError, handleNetworkError } = useErrorHandler();

try {
  await riskyOperation();
} catch (error) {
  handleError(error, {
    operation: 'createMaterial',
    moduleId: 'materials',
    userId: user.id
  });
}

// ✅ PATRÓN ESPECÍFICO
const submitForm = async (data) => {
  try {
    await createItem(data);
    notify.itemCreated(data.name);
  } catch (error) {
    if (error.status === 400) {
      handleValidationError(error.message, { formData: data });
    } else {
      handleNetworkError('No se pudo crear el item', { error, data });
    }
  }
};
```

---

## 🛡️ **ERRORBOUNDARY COMPONENT**

### **IMPLEMENTACIÓN ROBUSTA**
```typescript
// Ubicación: /src/lib/error-handling/ErrorBoundary.tsx

export class ErrorBoundary extends Component<Props, State> {
  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    const appError = errorHandler.handle(error, {
      componentStack: errorInfo.componentStack,
      errorBoundary: true
    });

    this.setState({ errorId: appError.id });

    // Callback personalizado si se proporciona
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  public render() {
    if (this.state.hasError) {
      // Custom fallback o UI por defecto
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // UI con ChakraUI + fallback HTML puro
      return (
        <Box display="flex" alignItems="center" justifyContent="center" minHeight="400px">
          <VStack gap="6" textAlign="center">
            <Heading size="lg" colorPalette="red">¡Oops! Algo salió mal</Heading>
            <Text color="gray.600">
              Ha ocurrido un error inesperado. Nuestro equipo ha sido notificado.
            </Text>
            {this.state.errorId && (
              <Text fontSize="sm" color="gray.500" fontFamily="mono">
                ID de error: {this.state.errorId}
              </Text>
            )}
            <Button colorPalette="blue" onClick={this.handleReload}>
              Intentar de nuevo
            </Button>
          </VStack>
        </Box>
      );
    }

    return this.props.children;
  }
}
```

### **PATTERNS DE USO**
```typescript
// ✅ BOUNDARY GLOBAL (en App.tsx)
<ErrorBoundary onError={(error, errorInfo) => {
  // Logging adicional para errores críticos
  console.error('Global error boundary caught:', error);
}}>
  <Router />
</ErrorBoundary>

// ✅ BOUNDARY ESPECÍFICO POR MÓDULO
<ErrorBoundary fallback={<MaterialsErrorFallback />}>
  <MaterialsPage />
</ErrorBoundary>

// ✅ BOUNDARY PARA LAZY COMPONENTS
<ErrorBoundary fallback={<ComponentLoadingError />}>
  <Suspense fallback={<Loading />}>
    <LazyComponent />
  </Suspense>
</ErrorBoundary>
```

---

## 🔔 **SISTEMA DE NOTIFICACIONES**

### **NOTIFY API UNIFICADA**
```typescript
// Ubicación: /src/lib/notifications.ts

export const notify = {
  success: (options: NotificationOptions) => {
    toaster.create({
      title: options.title,
      description: options.description,
      type: "success",
      duration: options.duration || 3000,
    });
  },

  error: (options: NotificationOptions) => {
    toaster.create({
      title: options.title,
      description: options.description,
      type: "error",
      duration: options.duration || 5000,
    });
  },

  // ... warning, info

  // 🔄 HELPERS ESPECÍFICOS PARA G-ADMIN
  itemCreated: (itemName: string) => notify.success({
    title: "Item creado",
    description: `${itemName} se ha creado exitosamente`
  }),

  stockLow: (itemName: string, currentStock: number, unit: string) => notify.warning({
    title: "Stock bajo",
    description: `${itemName} tiene solo ${currentStock} ${unit} disponibles`
  }),

  apiError: (message?: string) => notify.error({
    title: "Error de conexión",
    description: message || "No se pudo conectar con el servidor. Intenta nuevamente."
  })
};
```

### **ERROR HANDLER UTILITY**
```typescript
export const handleApiError = (
  error: unknown,
  fallbackMessage = 'Ocurrió un error inesperado'
) => {
  let message = fallbackMessage;

  if (error instanceof Error) {
    message = error.message;
  } else if (typeof error === 'string') {
    message = error;
  } else if (error && typeof error === 'object' && 'message' in error) {
    message = (error as { message: string }).message;
  }

  notify.error({
    title: 'Error',
    description: message
  });

  console.error('Error handled:', error);
};
```

---

## 🔗 **INTEGRACIÓN CON EVENTBUS**

### **ERROR TRACKING AUTOMÁTICO**
```typescript
// EventBus ya implementa error tracking automático:

// 1. Errores del EventBus se emiten como eventos
eventBus.on('global.eventbus.error', async (event) => {
  const { originalPattern, error, latency, moduleId } = event.payload;

  // Usar nuestro ErrorHandler para procesamiento centralizado
  errorHandler.handle(new Error(error), {
    eventPattern: originalPattern,
    processingLatency: latency,
    moduleId: moduleId,
    source: 'EventBus'
  });
});

// 2. Auto-recovery para errores críticos
if (originalPattern.includes('payment') || originalPattern.includes('order')) {
  await attemptAutoRecovery(moduleId, originalPattern);
}
```

### **METRICS Y MONITORING**
```typescript
// EventBus proporciona métricas de error en tiempo real
const metrics = await eventBus.getSystemHealth();
console.log({
  errorRate: metrics.errorRate,      // Errores por minuto
  avgLatency: metrics.avgLatencyMs,  // Latencia promedio
  activeModules: metrics.activeModules
});

// Alertas automáticas
if (metrics.errorRate > 5) {
  await sendSlackAlert(`🚨 EventBus error rate high: ${metrics.errorRate}/min`);
}
```

---

## 📊 **CLASIFICACIÓN AUTOMÁTICA**

### **INFERENCIA DE TIPO**
```typescript
private inferErrorType(error: Error): ErrorType {
  if (error.message.includes('fetch') || error.message.includes('network')) {
    return ErrorType.NETWORK;
  }
  if (error.message.toLowerCase().includes('unauthorized') ||
      error.message.toLowerCase().includes('forbidden')) {
    return ErrorType.AUTH;
  }
  if (error.message.includes('validation') || error.name === 'ValidationError') {
    return ErrorType.VALIDATION;
  }
  return ErrorType.SYSTEM;
}
```

### **INFERENCIA DE SEVERIDAD**
```typescript
private inferSeverity(error: Error): ErrorSeverity {
  if (error.name === 'ValidationError') return ErrorSeverity.LOW;
  if (error.message.includes('network')) return ErrorSeverity.MEDIUM;
  if (error.message.toLowerCase().includes('unauthorized')) return ErrorSeverity.HIGH;
  return ErrorSeverity.MEDIUM;
}
```

---

## 💾 **PERSISTENCIA Y AUDITORÍA**

### **LOCALSTORAGE MONITORING**
```typescript
private async sendToMonitoring(error: AppError): Promise<void> {
  try {
    const errorLog = {
      ...error,
      timestamp: error.timestamp.toISOString()
    };

    // Store en localStorage (reemplazar con servicio real en producción)
    const existingLogs = localStorage.getItem('error-logs');
    const logs = existingLogs ? JSON.parse(existingLogs) : [];
    logs.push(errorLog);

    // Mantener solo últimos 50 errores
    if (logs.length > 50) {
      logs.splice(0, logs.length - 50);
    }

    localStorage.setItem('error-logs', JSON.stringify(logs));
  } catch (e) {
    console.error('Failed to send error to monitoring:', e);
  }
}
```

### **QUEUE MANAGEMENT**
```typescript
private addToQueue(error: AppError): void {
  this.errorQueue.push(error);
  if (this.errorQueue.length > this.maxQueueSize) {
    this.errorQueue.shift(); // Remover error más antiguo
  }
}

public getRecentErrors(): AppError[] {
  return [...this.errorQueue];
}

public clearQueue(): void {
  this.errorQueue = [];
}
```

---

## ⚠️ **GAPS CRÍTICOS IDENTIFICADOS**

### **🚨 FALTANTES PARA APLICACIONES EMPRESARIALES**

#### **1. RETRY LOGIC AUTOMÁTICO**
```typescript
// ❌ NO IMPLEMENTADO - NECESARIO
interface RetryConfig {
  maxRetries: number;
  backoffMultiplier: number;
  retryableErrors: ErrorType[];
  customRetryLogic?: (error: AppError) => boolean;
}

class RetryableErrorHandler {
  async handleWithRetry(operation: () => Promise<any>, config: RetryConfig): Promise<any> {
    // Implementar retry con exponential backoff
  }
}
```

#### **2. CIRCUIT BREAKER PATTERN**
```typescript
// ❌ NO IMPLEMENTADO - CRÍTICO PARA RESILENCIA
class CircuitBreaker {
  private failureCount = 0;
  private lastFailureTime = 0;
  private state: 'CLOSED' | 'OPEN' | 'HALF_OPEN' = 'CLOSED';

  async execute<T>(operation: () => Promise<T>): Promise<T> {
    // Implementar circuit breaker para prevenir cascadas
  }
}
```

#### **3. ERROR CORRELATION**
```typescript
// ❌ NO IMPLEMENTADO - NECESARIO PARA DEBUGGING COMPLEJO
interface ErrorCorrelation {
  sessionId: string;
  transactionId: string;
  userFlow: string[];
  relatedErrors: string[];
}
```

#### **4. ERROR ANALYTICS**
```typescript
// ❌ NO IMPLEMENTADO - CRÍTICO PARA MONITORING
interface ErrorAnalytics {
  errorPatterns: Map<string, number>;
  frequentErrors: AppError[];
  errorTrends: { date: string; count: number }[];
  criticalErrorAlerts: (error: AppError) => void;
}
```

#### **5. SANITIZACIÓN DE DATOS**
```typescript
// ❌ NO IMPLEMENTADO - RIESGO DE SEGURIDAD
interface DataSanitization {
  sanitizeErrorData: (error: AppError) => AppError;
  removeSensitiveInfo: (context: Record<string, any>) => Record<string, any>;
}
```

---

## 🎯 **PATTERNS DE DESARROLLO PARA IA**

### **✅ SIEMPRE IMPLEMENTAR**

#### **1. TRY/CATCH OBLIGATORIO**
```typescript
// ✅ CORRECTO - Siempre wrap operaciones riesgosas
const { handleError } = useErrorHandler();

const saveData = async (data: any) => {
  try {
    const result = await api.save(data);
    notify.success({ title: 'Datos guardados' });
    return result;
  } catch (error) {
    handleError(error, {
      operation: 'saveData',
      data: data,
      moduleId: 'current-module'
    });
    throw error; // Re-throw si el componente necesita manejar
  }
};
```

#### **2. CONTEXT ENRICHMENT**
```typescript
// ✅ CORRECTO - Siempre proporcionar contexto útil
try {
  await updateInventory(materialId, newStock);
} catch (error) {
  handleError(error, {
    operation: 'updateInventory',
    materialId,
    newStock,
    oldStock: material.stock,
    moduleId: 'materials',
    userId: user.id,
    timestamp: Date.now()
  });
}
```

#### **3. USER-FRIENDLY MESSAGES**
```typescript
// ✅ CORRECTO - Mensajes para usuarios, detalles técnicos en context
try {
  await complexOperation();
} catch (error) {
  handleError(error, { /* technical context */ });

  // Mensaje específico para usuario
  if (error.code === 'INSUFFICIENT_STOCK') {
    notify.error({
      title: 'Stock insuficiente',
      description: 'No hay suficiente stock para completar esta operación'
    });
  } else {
    notify.error({
      title: 'Error al procesar',
      description: 'Ocurrió un problema. Nuestro equipo ha sido notificado.'
    });
  }
}
```

#### **4. ERRORBOUNDARY PLACEMENT**
```typescript
// ✅ CORRECTO - Boundaries estratégicos
function ModulePage() {
  return (
    <ErrorBoundary
      fallback={<ModuleErrorFallback />}
      onError={(error, errorInfo) => {
        // Logging específico del módulo
        console.error(`${moduleName} error:`, error, errorInfo);
      }}
    >
      <ModuleContent />
    </ErrorBoundary>
  );
}
```

---

## 🧪 **TESTING PATTERNS**

### **TESTING ERROR SCENARIOS**
```typescript
// ✅ Siempre testear paths de error
describe('MaterialsService', () => {
  it('should handle network errors gracefully', async () => {
    const mockError = new Error('Network error');
    mockError.name = 'NetworkError';

    jest.spyOn(api, 'getMaterials').mockRejectedValue(mockError);

    const { handleError } = useErrorHandler();
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

    await expect(materialsService.load()).rejects.toThrow('Network error');

    expect(handleError).toHaveBeenCalledWith(mockError, {
      operation: 'loadMaterials',
      moduleId: 'materials'
    });

    consoleSpy.mockRestore();
  });
});
```

### **ERRORBOUNDARY TESTING**
```typescript
// ✅ Testear ErrorBoundary con errores simulados
const ThrowError = ({ shouldThrow }: { shouldThrow: boolean }) => {
  if (shouldThrow) {
    throw new Error('Test error');
  }
  return <div>No error</div>;
};

test('ErrorBoundary catches and displays error', () => {
  const onError = jest.fn();
  render(
    <ErrorBoundary onError={onError}>
      <ThrowError shouldThrow={true} />
    </ErrorBoundary>
  );

  expect(screen.getByText('¡Oops! Algo salió mal')).toBeInTheDocument();
  expect(onError).toHaveBeenCalled();
});
```

---

## 🔄 **INTEGRATION CON OTROS SISTEMAS**

### **CON OFFLINE SYNC**
```typescript
// Los errores de red se integran automáticamente con offline sync
try {
  await api.updateMaterial(data);
} catch (error) {
  if (error.type === 'NetworkError') {
    // OfflineSync automáticamente queue la operación
    await offlineSync.queueOperation({
      type: 'UPDATE',
      entity: 'materials',
      data: data
    });

    notify.info({
      title: 'Sin conexión',
      description: 'La actualización se sincronizará cuando vuelva la conexión'
    });
  } else {
    handleError(error, { operation: 'updateMaterial', data });
  }
}
```

### **CON CAPABILITIES SYSTEM**
```typescript
// Errores de autorización integrados con capabilities
try {
  await restrictedOperation();
} catch (error) {
  if (error.type === 'AuthError') {
    // Verificar capabilities y mostrar mensaje apropiado
    const hasCapability = capabilities.check('required_capability');

    if (!hasCapability) {
      notify.warning({
        title: 'Función no disponible',
        description: 'Tu plan actual no incluye esta funcionalidad'
      });
    } else {
      handleAuthError('Error de autorización', { error, capabilities });
    }
  }
}
```

---

## 📚 **QUICK REFERENCE PARA IA**

### **IMPORTS OBLIGATORIOS**
```typescript
// Siempre importar en nuevos componentes que manejen errores
import { useErrorHandler } from '@/lib/error-handling';
import { notify, handleApiError } from '@/lib/notifications';
import { ErrorBoundary } from '@/lib/error-handling';
```

### **CHECKLIST DESARROLLO**
- [ ] ✅ **Try/catch** en todas las operaciones async
- [ ] ✅ **Context enriquecido** en handleError()
- [ ] ✅ **Mensajes user-friendly** con notify.*
- [ ] ✅ **ErrorBoundary** en componentes principales
- [ ] ✅ **Testing** de scenarios de error
- [ ] ✅ **Integration** con sistemas offline/EventBus

### **ANTI-PATTERNS A EVITAR**
```typescript
// ❌ NO HACER - Error silencioso
try {
  await riskyOperation();
} catch (error) {
  // Ignorar error sin logging
}

// ❌ NO HACER - Console.log como manejo de error
try {
  await operation();
} catch (error) {
  console.log('Error:', error); // Insuficiente
}

// ❌ NO HACER - Generic error sin context
catch (error) {
  handleError(error); // Falta contexto útil
}
```

---

## 🚀 **ROADMAP DE MEJORAS**

### **FASE 1: COMPLETAR SISTEMA ACTUAL**
1. **Implementar retry logic** con exponential backoff
2. **Agregar circuit breaker** para operaciones críticas
3. **Error correlation** para debugging complejo
4. **Data sanitization** para seguridad

### **FASE 2: ANALYTICS Y MONITORING**
1. **Error analytics** con trends y patterns
2. **Real-time alerting** para errores críticos
3. **Integration con Sentry/LogRocket**
4. **Dashboard de errores** para admins

### **FASE 3: OPTIMIZACIÓN**
1. **Performance monitoring** del error handling
2. **Predictive error detection**
3. **Auto-healing** para errores conocidos
4. **ML-based error classification**

---

**🎯 NOTA PARA IA**: Este documento debe consultarse OBLIGATORIAMENTE al implementar cualquier funcionalidad que pueda generar errores. Seguir patterns establecidos y evitar anti-patterns documentados.