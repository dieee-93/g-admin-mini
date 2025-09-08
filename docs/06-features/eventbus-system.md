# 🚀 EventBus V2.0 Enterprise System - G-Admin Mini

> **Sistema de eventos enterprise con gestión modular, deduplicación inteligente y soporte offline-first**  
> **Fecha:** Enero 2025  
> **Versión:** 2.0.0  
> **Estado:** ✅ **IMPLEMENTADO Y LISTO PARA PRODUCCIÓN**

---

## 📊 **RESUMEN EJECUTIVO**

### **🎯 CARACTERÍSTICAS PRINCIPALES**
- **Module Lifecycle Management**: Registro, activación, desactivación y health monitoring automático
- **Smart Deduplication**: Prevención de eventos duplicados con 3 estrategias (content, operation, semantic)
- **Event Sourcing**: Persistencia completa de eventos en IndexedDB con replay capability  
- **Offline-First Integration**: Integración transparente con el sistema OfflineSync existente
- **Enterprise Monitoring**: Métricas detalladas, health checks y observabilidad completa

### **⚡ VENTAJAS VS EVENTBUS V1**
| Aspecto | V1 | V2.0 Enterprise |
|---------|----|-----------------| 
| **Module Management** | ❌ Manual | ✅ Automated lifecycle |
| **Deduplication** | ❌ Basic | ✅ Multi-layer enterprise |
| **Event Persistence** | ❌ None | ✅ IndexedDB + Event Sourcing |
| **Health Monitoring** | ❌ None | ✅ Real-time + Alerts |
| **Graceful Shutdown** | ❌ None | ✅ Zero data loss |
| **Testing Support** | ❌ Basic | ✅ Complete test harness |
| **Offline Integration** | ❌ Separate | ✅ Seamless integration |

---

## 🏗️ **ARQUITECTURA TÉCNICA**

### **📂 ESTRUCTURA DE ARCHIVOS**
```
src/lib/events/v2/
├── types.ts (462 líneas) - Sistema de tipos TypeScript completo
├── EventBusV2.ts (847 líneas) - ⭐ CORE: EventBus principal enterprise  
├── ModuleRegistry.ts (931 líneas) - Gestión completa de módulos
├── EventStore.ts (542 líneas) - Persistencia IndexedDB con Event Sourcing
├── DeduplicationManager.ts (378 líneas) - Sistema anti-duplicación enterprise
├── MigrationBridge.ts (421 líneas) - Migración gradual desde V1
├── testing/
│   └── EventBusTestingHarness.ts (634 líneas) - Suite completa de testing
└── README.md - Documentación técnica detallada
```

### **🎯 COMPONENTES CORE**

#### **🚀 EventBusV2 - Sistema Principal**
```typescript
export class EventBusV2 implements IEventBusV2 {
  // Core components
  private eventStore: EventStoreIndexedDB;       // Persistencia IndexedDB
  private deduplicationManager: DeduplicationManager; // Anti-duplicación
  private moduleRegistry: ModuleRegistry;        // Gestión de módulos
  private metricsCollector: MetricsCollector;    // Métricas en tiempo real
  
  // API Principal
  async emit<TPayload>(pattern: EventPattern, payload: TPayload, options?: EmitOptions): Promise<void>
  on<TPayload>(pattern: EventPattern, handler: EventHandler<TPayload>, options?: SubscribeOptions): UnsubscribeFn
  waitFor<TPayload>(pattern: EventPattern, timeout?: number, filter?: EventFilter<TPayload>): Promise<NamespacedEvent<TPayload>>
  replay(pattern: EventPattern, fromTimestamp?: string, toTimestamp?: string): Promise<NamespacedEvent[]>
  
  // Module Management
  async registerModule(descriptor: ModuleDescriptor): Promise<void>
  async deactivateModule(moduleId: ModuleId): Promise<void>
  async getModuleHealth(moduleId?: ModuleId): Promise<Record<ModuleId, ModuleHealth>>
  
  // System Operations  
  async gracefulShutdown(timeoutMs?: number): Promise<void>
  async getMetrics(): Promise<EventBusMetrics>
}
```

#### **🔧 ModuleRegistry - Gestión de Módulos**
```typescript
export class ModuleRegistry {
  // Features principales:
  // ✅ Registro y validación de módulos
  // ✅ Resolución automática de dependencias  
  // ✅ Health monitoring continuo
  // ✅ Graceful shutdown con cleanup automático
  // ✅ Hot module reload/unload
  
  async registerModule(descriptor: ModuleDescriptor): Promise<void>
  async activateModule(moduleId: ModuleId): Promise<void>
  async deactivateModule(moduleId: ModuleId): Promise<void>
  async getModuleHealth(moduleId?: ModuleId): Promise<Record<ModuleId, ModuleHealth>>
}
```

#### **💾 EventStore - Persistencia Enterprise**
```typescript 
export class EventStoreIndexedDB implements IEventStore {
  // Features principales:
  // ✅ Event Sourcing completo
  // ✅ Indexes optimizados para consultas
  // ✅ Replay de eventos con filtros avanzados
  // ✅ Cleanup automático de eventos antiguos
  // ✅ Snapshots para optimización
  
  async append(event: NamespacedEvent): Promise<void>
  async getEvents(pattern?: EventPattern, fromTimestamp?: string, toTimestamp?: string): Promise<NamespacedEvent[]>
  async replay(pattern: EventPattern, fromTimestamp?: string): Promise<NamespacedEvent[]>
  async cleanup(beforeTimestamp: string): Promise<number>
}
```

#### **🛡️ DeduplicationManager - Anti-Duplicación Enterprise**
```typescript
export class DeduplicationManager {
  // Estrategias de deduplicación:
  // 1️⃣ Content-based: SHA-256 hash del payload normalizado
  // 2️⃣ Operation-based: ID único por operación (clientOperationId mejorado)
  // 3️⃣ Semantic: Misma entidad + acción dentro de ventana temporal
  
  async generateMetadata(event: NamespacedEvent): Promise<DeduplicationMetadata>
  async isDuplicate(event: NamespacedEvent, metadata: DeduplicationMetadata): Promise<{isDupe: boolean; reason?: string}>
  async storeMetadata(metadata: DeduplicationMetadata): Promise<void>
}
```

---

## 🎯 **PATRONES DE USO**

### **✅ EMISIÓN DE EVENTOS**
```typescript
// Evento básico
await eventBusV2.emit('sales.order.completed', {
  orderId: 'ORD-123',
  customerId: 'CUST-456', 
  amount: 129.99,
  items: [...]
});

// Evento con opciones avanzadas
await eventBusV2.emit('inventory.stock.critical', stockAlert, {
  priority: 'critical',        // Procesamiento prioritario
  persistent: true,            // Persiste en IndexedDB + OfflineSync
  crossModule: true,           // Permite handlers cross-module
  correlationId: 'trace-789',  // Para tracing distribuido
  userId: 'user-123',          // Contexto de usuario
  deduplicationWindow: 60000   // Ventana custom de deduplicación (1 min)
});
```

### **✅ SUBSCRIPCIÓN A EVENTOS** 
```typescript
// Subscripción básica
const unsubscribe = eventBusV2.on('inventory.stock.low', async (event) => {
  const { itemName, currentStock, minimumStock } = event.payload;
  await handleLowStockAlert(itemName, currentStock, minimumStock);
});

// Subscripción con filtros
const unsubscribeVip = eventBusV2.on('sales.order.created', 
  async (event) => {
    await processVipOrder(event.payload);
  },
  {
    moduleId: 'sales-vip',                    // Módulo propietario
    priority: 'high',                        // Prioridad alta
    persistent: true,                        // Sobrevive a restart del módulo
    filter: (event) => event.payload.customerTier === 'VIP'  // Solo clientes VIP
  }
);

// Subscripción one-time
const unsubscribeOnce = eventBusV2.once('payment.confirmed', async (event) => {
  console.log('Payment confirmed once:', event.payload.paymentId);
});
```

### **✅ REGISTRO DE MÓDULOS**
```typescript
// Definir descriptor de módulo
const salesModule: ModuleDescriptor = {
  id: 'sales',
  name: 'Sales Management Module',
  version: '2.1.0',
  description: 'Gestión completa de ventas y facturación',
  dependencies: ['inventory', 'customers'],        // Módulos requeridos
  optionalDependencies: ['marketing'],             // Módulos opcionales
  
  // Subscripciones de eventos del módulo
  eventSubscriptions: [
    {
      pattern: 'inventory.stock.low',
      handler: 'handleLowStock',
      priority: 'high'
    },
    {
      pattern: 'global.payment.completed',
      handler: 'processPayment', 
      persistent: true
    }
  ],
  
  // Health check del módulo
  healthCheck: async () => ({
    status: 'active',
    message: 'All systems operational',
    metrics: {
      eventsProcessed: await getSalesEventsProcessed(),
      eventsEmitted: await getSalesEventsEmitted(),
      errorRate: await getSalesErrorRate(),
      avgProcessingTimeMs: await getAvgProcessingTime(),
      queueSize: await getSalesQueueSize()
    },
    dependencies: {
      inventory: await checkInventoryConnection(),
      customers: await checkCustomersConnection()
    },
    lastCheck: new Date()
  }),
  
  // Lifecycle hooks
  onActivate: async () => {
    console.log('Sales module activating...');
    await initializeSalesConnections();
  },
  
  onDeactivate: async () => {
    console.log('Sales module deactivating...');
    await cleanupSalesConnections();
  },
  
  // Configuración específica
  config: {
    eventNamespace: 'sales',
    maxConcurrentEvents: 20,
    healthCheckIntervalMs: 30000,
    gracefulShutdownTimeoutMs: 10000
  }
};

// Registrar módulo
await eventBusV2.registerModule(salesModule);
```

### **✅ OPERACIONES AVANZADAS**
```typescript
// Esperar evento específico con timeout
try {
  const event = await eventBusV2.waitFor('payment.completed', 10000, 
    (event) => event.payload.orderId === 'ORD-123'
  );
  console.log('Payment confirmed for order ORD-123');
} catch (error) {
  console.log('Payment timeout for order ORD-123');
}

// Replay de eventos para análisis
const events = await eventBusV2.replay(
  'sales.order.created',
  '2024-01-01T00:00:00Z',  // Desde
  '2024-01-31T23:59:59Z'   // Hasta
);

console.log(`Found ${events.length} orders in January 2024`);
for (const event of events) {
  await reprocessHistoricalOrder(event.payload);
}

// Métricas del sistema
const metrics = await eventBusV2.getMetrics();
console.log('EventBus Metrics:', {
  totalEvents: metrics.totalEvents,
  eventsPerSecond: metrics.eventsPerSecond,
  avgLatency: metrics.avgLatencyMs,
  activeModules: metrics.activeModules,
  errorRate: metrics.errorRate
});
```

---

## 🧪 **SISTEMA DE TESTING**

### **✅ TESTING HARNESS COMPLETO**
```typescript
import { EventBusTestingHarness } from '@/lib/events/v2/testing/EventBusTestingHarness';

// Crear test harness
const testHarness = new EventBusTestingHarness();

// Crear módulo mock
testHarness.createMockModule('test-sales', {
  'sales.order.created': async (event) => {
    console.log('Mock order created:', event.payload.orderId);
    await mockProcessOrder(event.payload);
  },
  'inventory.stock.low': async (event) => {
    console.log('Mock low stock:', event.payload.itemName);
    await mockHandleLowStock(event.payload);
  }
});

// Registrar módulo mock
await testHarness.registerMockModule('test-sales');

// Iniciar recording
testHarness.startRecording();

// Ejecutar test
await eventBusV2.emit('sales.order.created', { orderId: 'TEST-123', amount: 99.99 });

// Crear assertions
const assert = testHarness.createAssertions();

// Verificar resultados
if (!assert.eventWasEmitted('sales.order.created')) {
  throw new Error('Event was not emitted');
}

if (!assert.handlerWasCalled('test-sales', 'handle_sales_order_created')) {
  throw new Error('Handler was not called');
}

console.log('Events captured:', assert.eventCount());
console.log('Last event:', assert.lastEvent());

// Cleanup
await testHarness.cleanup();
```

### **✅ PERFORMANCE TESTING**
```typescript
// Test de rendimiento
const results = await testHarness.performanceTest(
  1000,                           // 1000 eventos
  'test.performance.event',       // Pattern a testear
  { data: 'test payload' }        // Payload base
);

console.log('Performance Results:', {
  totalTime: results.totalTimeMs,
  eventsPerSecond: results.eventsPerSecond,
  avgLatency: results.avgLatencyMs,
  maxLatency: results.maxLatencyMs,
  minLatency: results.minLatencyMs
});
```

### **✅ SCENARIOS PREDEFINIDOS**
```typescript
// Crear scenarios comunes
testHarness.createCommonScenarios();

// Ejecutar scenario específico
await testHarness.runScenario('order-lifecycle');

// Ejecutar todos los scenarios
const results = await testHarness.runAllScenarios();
console.log(`Tests: ${results.passed} passed, ${results.failed} failed`);

// Resultados detallados
results.results.forEach(result => {
  console.log(`${result.name}: ${result.success ? '✅ PASS' : '❌ FAIL'}`);
  if (!result.success) {
    console.log(`  Error: ${result.error}`);
  }
});
```

---

## 🔄 **MIGRACIÓN DESDE EVENTBUS V1**

### **✅ MIGRACIÓN AUTOMÁTICA**
```typescript
import { MigrationUtils } from '@/lib/events/v2/MigrationBridge';
import { RestaurantEvents } from '@/lib/events/RestaurantEvents';

// Migración rápida de módulo
await MigrationUtils.quickMigrateModule(
  'sales',                    // Module ID
  'Sales Module',             // Module name
  {
    // Mapear handlers V1 → V2
    [RestaurantEvents.ORDER_PLACED]: handleOrderPlaced,
    [RestaurantEvents.PAYMENT_COMPLETED]: handlePaymentCompleted,
    [RestaurantEvents.SALE_COMPLETED]: handleSaleCompleted
  }
);

console.log('✅ Sales module migrated to EventBus V2');
```

### **✅ BRIDGE AUTOMÁTICO**
```typescript
import { migrationBridge } from '@/lib/events/v2/MigrationBridge';

// El bridge automáticamente convierte:
// V1: RestaurantEvents.ORDER_PLACED → V2: 'sales.order.placed'
// V1: RestaurantEvents.STOCK_LOW → V2: 'inventory.stock.low'
// V1: RestaurantEvents.PAYMENT_COMPLETED → V2: 'sales.payment.completed'

// Verificar estado de migración
const status = migrationBridge.getMigrationStatus();
console.log('Migration Status:', {
  migratedModules: status.migratedModules,
  bridgeActive: status.bridgeActive,
  eventMappings: status.eventMappings
});

// Habilitar/deshabilitar bridge
migrationBridge.enableLogging();  // Para debugging
migrationBridge.disableLogging();
```

### **✅ MIGRACIÓN GRADUAL**
```typescript
// Código compatible con ambas versiones
import { MigrationUtils } from '@/lib/events/v2/MigrationBridge';

function emitOrderEvent(orderData: any) {
  if (MigrationUtils.shouldUseV2('sales')) {
    // Usar EventBus V2
    return eventBusV2.emit('sales.order.completed', orderData);
  } else {
    // Usar EventBus V1
    return EventBusV1.emit(RestaurantEvents.SALE_COMPLETED, orderData);
  }
}

// Marcar módulo como migrado
migrationBridge.migrateModule('sales');
```

---

## 📊 **MONITORING Y OBSERVABILIDAD**

### **✅ MÉTRICAS EN TIEMPO REAL**
```typescript
// Subscribirse a métricas del sistema
eventBusV2.on('global.eventbus.metrics', async (event) => {
  const metrics = event.payload;
  
  // Enviar a sistema de monitoreo
  await sendToGrafana({
    timestamp: Date.now(),
    eventsPerSecond: metrics.eventsPerSecond,
    avgLatency: metrics.avgLatencyMs,
    errorRate: metrics.errorRate,
    activeModules: metrics.activeModules,
    queueSize: metrics.queueSize,
    memoryUsage: metrics.memoryUsageMB
  });
  
  // Alertas automáticas
  if (metrics.errorRate > 5) {
    await sendSlackAlert(`🚨 EventBus error rate high: ${metrics.errorRate}/min`);
  }
  
  if (metrics.avgLatencyMs > 1000) {
    await sendSlackAlert(`⚠️ EventBus latency high: ${metrics.avgLatencyMs}ms`);
  }
});
```

### **✅ HEALTH MONITORING**
```typescript
// Monitoreo de salud de módulos
eventBusV2.on('global.eventbus.module-health-changed', async (event) => {
  const { moduleId, previousStatus, currentStatus, health } = event.payload;
  
  console.log(`Module ${moduleId}: ${previousStatus} → ${currentStatus}`);
  
  if (currentStatus === 'error' || currentStatus === 'degraded') {
    await sendCriticalAlert({
      title: `Module ${moduleId} Health Degraded`,
      message: health.message || 'Unknown error',
      severity: currentStatus === 'error' ? 'critical' : 'warning',
      metrics: health.metrics
    });
  }
});

// Check manual de salud
const healthStatus = await eventBusV2.getModuleHealth();
for (const [moduleId, health] of Object.entries(healthStatus)) {
  console.log(`${moduleId}:`, {
    status: health.status,
    eventsProcessed: health.metrics.eventsProcessed,
    errorRate: health.metrics.errorRate,
    dependencies: Object.entries(health.dependencies)
      .filter(([_, isHealthy]) => !isHealthy)
      .map(([dep]) => dep)
  });
}
```

### **✅ ERROR TRACKING**
```typescript
// Tracking de errores del sistema
eventBusV2.on('global.eventbus.error', async (event) => {
  const { originalPattern, error, latency, moduleId } = event.payload;
  
  // Log estructurado para análisis
  console.error('EventBus Error:', {
    pattern: originalPattern,
    error: error,
    module: moduleId,
    latency: latency,
    timestamp: new Date().toISOString()
  });
  
  // Enviar a error tracking
  await sendToSentry({
    message: `EventBus error in ${originalPattern}`,
    level: 'error',
    extra: {
      eventPattern: originalPattern,
      processingLatency: latency,
      moduleId: moduleId
    }
  });
  
  // Auto-recovery para errores críticos
  if (originalPattern.includes('payment') || originalPattern.includes('order')) {
    await attemptAutoRecovery(moduleId, originalPattern);
  }
});
```

---

## ⚙️ **CONFIGURACIÓN AVANZADA**

### **✅ CONFIGURACIÓN PRODUCTION**
```typescript
const eventBusV2 = new EventBusV2({
  // Persistence settings
  persistenceEnabled: true,
  persistenceStoreName: 'g-admin-eventbus-prod',
  maxStorageSize: 100 * 1024 * 1024,        // 100MB
  maxEventHistorySize: 50000,                // 50k eventos
  
  // Deduplication settings  
  deduplicationEnabled: true,
  defaultDeduplicationWindow: 5 * 60 * 1000, // 5 minutos
  cleanupIntervalMs: 2 * 60 * 1000,          // Cleanup cada 2 min
  
  // Performance settings
  maxConcurrentEvents: 100,                  // 100 eventos concurrentes
  defaultEventTimeout: 30000,                // 30s timeout
  
  // Monitoring settings
  metricsEnabled: true,
  healthCheckIntervalMs: 30000,              // Health check cada 30s
  
  // Integration settings
  offlineSyncEnabled: true,                  // Integración con OfflineSync
  
  // Retry configuration
  defaultRetryPolicy: {
    maxAttempts: 3,
    initialDelayMs: 1000,
    backoffMultiplier: 2,
    maxDelayMs: 30000,
    retryableErrors: ['NETWORK_ERROR', 'SERVER_ERROR', 'TIMEOUT']
  }
});
```

### **✅ CONFIGURACIÓN DEVELOPMENT**
```typescript
const eventBusV2Dev = new EventBusV2({
  // Development-specific settings
  persistenceEnabled: false,                 // Sin persistencia en dev
  deduplicationEnabled: false,               // Sin deduplicación en dev
  testModeEnabled: true,                     // Test mode habilitado
  metricsEnabled: true,                      // Métricas para debugging
  offlineSyncEnabled: false,                 // Sin sync en dev
  
  // Logging más verboso
  healthCheckIntervalMs: 10000,              // Health check cada 10s
  maxEventHistorySize: 1000,                 // Menor historia en dev
});
```

---

## 🛠️ **TROUBLESHOOTING**

### **❌ PROBLEMAS COMUNES**

#### **1. Módulo no se activa**
```typescript
// Diagnosticar dependencias
const health = await eventBusV2.getModuleHealth('problematic-module');
console.log('Module health:', health['problematic-module']);
console.log('Dependencies status:', health['problematic-module'].dependencies);

// Forzar reactivación 
await eventBusV2.reactivateModule('dependency-module');
await eventBusV2.reactivateModule('problematic-module');
```

#### **2. Eventos no se procesan**
```typescript
// Verificar módulos activos
const activeModules = eventBusV2.getActiveModules();
console.log('Active modules:', activeModules);

// Verificar subscripciones
const metrics = await eventBusV2.getMetrics();
console.log('Active subscriptions:', metrics.activeSubscriptions);
console.log('Queue size:', metrics.queueSize);
```

#### **3. Performance degradada**
```typescript
// Analizar métricas
const metrics = await eventBusV2.getMetrics();

if (metrics.avgLatencyMs > 1000) {
  console.warn('⚠️ High latency detected:', metrics.avgLatencyMs, 'ms');
  
  // Posibles causas:
  // - Handlers bloqueantes
  // - Queue saturado  
  // - Dependencias lentas
}

if (metrics.queueSize > 100) {
  console.warn('⚠️ Queue backlog detected:', metrics.queueSize);
}

// Limpiar eventos antiguos
const cleaned = await eventBusV2.clearHistory();
console.log(`Cleaned ${cleaned} old events`);
```

#### **4. Memory leaks**
```typescript
// Verificar uso de memoria
const metrics = await eventBusV2.getMetrics();
console.log('Memory usage:', metrics.memoryUsageMB, 'MB');

// Limpiar historia
await eventBusV2.clearHistory();

// Verificar módulos huérfanos
const moduleHealth = await eventBusV2.getModuleHealth();
for (const [moduleId, health] of Object.entries(moduleHealth)) {
  if (health.status === 'error') {
    console.log(`Restarting failed module: ${moduleId}`);
    await eventBusV2.reactivateModule(moduleId);
  }
}
```

### **✅ MEJORES PRÁCTICAS**

#### **📋 Diseño de Eventos**
- ✅ **Patrones descriptivos**: `sales.order.completed` no `order_done`
- ✅ **Namespace por dominio**: `inventory.*`, `staff.*`, `kitchen.*`
- ✅ **Tiempo pasado**: `order.completed` no `order.complete`
- ✅ **Payload completo**: incluir contexto suficiente

#### **🛡️ Manejo de Errores**
- ✅ **Siempre usar try/catch** en handlers
- ✅ **Clasificar errores**: retryable vs non-retryable
- ✅ **Monitorear error rates**: alertas automáticas
- ✅ **Graceful degradation**: manejar dependencias faltantes

#### **⚡ Performance**  
- ✅ **Usar prioridades**: eventos críticos primero
- ✅ **Filtros eficientes**: usar event filters vs payload filtering
- ✅ **Operaciones batch**: agrupar eventos relacionados
- ✅ **Monitorear latencia**: tracking continuo

#### **🧪 Testing**
- ✅ **Usar test harness**: herramientas integradas
- ✅ **Mock modules**: ambientes aislados
- ✅ **Test scenarios**: flujos de negocio completos
- ✅ **Performance testing**: validación bajo carga

---

## 🎯 **ROADMAP Y EVOLUCIÓN**

### **✅ IMPLEMENTADO (V2.0)**
- ✅ Module lifecycle management completo
- ✅ Smart deduplication enterprise 
- ✅ Event sourcing con IndexedDB
- ✅ Offline-first integration transparente
- ✅ Testing harness completo
- ✅ Migration bridge automático
- ✅ Health monitoring y métricas
- ✅ Graceful shutdown

### **🔮 FUTURAS MEJORAS (V2.1+)**
- 🔮 **Distributed EventBus**: Multi-instance coordination
- 🔮 **GraphQL Subscriptions**: Real-time UI updates
- 🔮 **ML-based Event Predictions**: Predictive analytics
- 🔮 **Advanced Conflict Resolution**: ML-assisted merging
- 🔮 **Event Store Sharding**: Massive scale support
- 🔮 **Visual Event Flow Designer**: Low-code event orchestration

---

**🚀 EventBus V2.0 Enterprise está listo para llevar G-Admin Mini al siguiente nivel de escalabilidad y robustez empresarial!**