# 🔄 OFFLINE-FIRST SYSTEM - G-Admin Mini

**PROPÓSITO**: Sistema avanzado de sincronización offline-first para G-Admin Mini
**FECHA CREACIÓN**: 2025-09-19
**ESTADO**: Sistema implementado con cobertura parcial en módulos
**UBICACIÓN**: `/src/lib/offline/` + integración por módulos

---

## 🎯 **PHILOSOPHY: OFFLINE-FIRST**

G-Admin Mini está diseñado con **arquitectura offline-first**:
- ✅ **Funcionalidad completa sin conexión**
- ✅ **Sincronización automática** cuando hay conexión
- ✅ **Resolución inteligente de conflictos**
- ✅ **Optimistic updates** para UX fluida
- ✅ **Queue persistente** en IndexedDB
- ⚠️ **Implementación parcial** en módulos

---

## 🏗️ **ARQUITECTURA COMPLETA**

### **COMPONENTES PRINCIPALES**

```
OFFLINE-FIRST SYSTEM:
├── OfflineSync.ts            # ✅ Core engine con queue management
├── OfflineMonitor.tsx        # ✅ UI monitor de estado de conexión
├── useOfflineStatus.ts       # ✅ Hook para status de red
└── index.ts                  # ✅ Exports centralizados

STORAGE LAYER:
├── OfflineSyncDB class       # ✅ IndexedDB wrapper
├── Queue persistence         # ✅ Operaciones pendientes
├── Conflicts storage         # ✅ Resolución manual
└── Cleanup automatico       # ✅ Limpieza de datos antiguos

INTEGRATION POINTS:
├── EventBus integration      # ✅ System events
├── Network detection         # ✅ Anti-flapping protection
├── Service Worker ready      # ✅ Background sync
└── Module-specific hooks     # ⚠️ Implementación parcial
```

---

## 🚀 **OFFLINESYNC CORE ENGINE**

### **SINGLETON PATTERN**
```typescript
// Ubicación: /src/lib/offline/OfflineSync.ts

class OfflineSync {
  private config: SyncConfig;
  private syncQueue: SyncOperation[] = [];
  private isOnline: boolean = navigator.onLine;
  private isSyncing: boolean = false;
  private clientId: string;
  private db: OfflineSyncDB;

  constructor(config: Partial<SyncConfig> = {}) {
    this.config = {
      batchSize: 10,
      syncInterval: 30000, // 30 segundos
      maxRetries: 3,
      conflictResolution: 'merge',
      priorityOrder: ['orders', 'payments', 'inventory', 'staff', 'customers'],
      enableOptimisticUpdates: true,
      ...config
    };
  }
}
```

### **SYNC OPERATION INTERFACE**
```typescript
interface SyncOperation {
  id: string;                    // UUID único de la operación
  type: 'CREATE' | 'UPDATE' | 'DELETE';
  entity: string;                // 'orders', 'inventory', 'staff', etc.
  data: any;                     // Datos de la operación
  timestamp: number;             // Cuándo se creó la operación
  clientId: string;              // ID del cliente que creó la operación
  clientOperationId: string;     // ID para idempotencia en servidor
  retry: number;                 // Intentos de retry actuales
  priority: number;              // Prioridad basada en entity type
  dependencies?: string[];       // IDs de operaciones que deben completarse primero
  conflictsWith?: string[];      // IDs de operaciones que pueden causar conflictos
}
```

### **QUEUEING PATTERN**
```typescript
// ✅ PATTERN BÁSICO - Queue operation
const operationId = await offlineSync.queueOperation({
  type: 'UPDATE',
  entity: 'materials',
  data: {
    id: material.id,
    stock: newStock,
    lastModified: new Date().toISOString(),
    version: material.version + 1
  },
  priority: 1 // materials tienen alta prioridad
});

// ✅ La operación se ejecuta inmediatamente si hay conexión
// ✅ Se persiste en IndexedDB si no hay conexión
// ✅ Se reintenta automáticamente cuando vuelve la conexión
```

---

## 💾 **INDEXEDDB PERSISTENCE**

### **STORAGE ARCHITECTURE**
```typescript
class OfflineSyncDB {
  private readonly DB_NAME = 'G_ADMIN_OFFLINE_SYNC';
  private readonly DB_VERSION = 1;
  private readonly QUEUE_STORE = 'sync_queue';
  private readonly CONFLICTS_STORE = 'sync_conflicts';

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.DB_NAME, this.DB_VERSION);

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Queue store con índices para performance
        const queueStore = db.createObjectStore(this.QUEUE_STORE, { keyPath: 'id' });
        queueStore.createIndex('timestamp', 'timestamp');
        queueStore.createIndex('priority', 'priority');
        queueStore.createIndex('entity', 'entity');

        // Conflicts store
        const conflictsStore = db.createObjectStore(this.CONFLICTS_STORE, { keyPath: 'id' });
        conflictsStore.createIndex('timestamp', 'timestamp');
      };
    });
  }
}
```

### **PERSISTENCE PATTERNS**
```typescript
// ✅ Auto-persistence en cada queue operation
public async queueOperation(operation: Omit<SyncOperation, 'id' | 'timestamp' | 'clientId' | 'retry'>): Promise<string> {
  const syncOperation: SyncOperation = {
    ...operation,
    id: this.generateOperationId(),
    timestamp: Date.now(),
    clientId: this.clientId,
    retry: 0
  };

  // Insert en orden de prioridad
  this.insertOperationByPriority(syncOperation);

  // Persist a IndexedDB
  try {
    await this.persistQueue();
  } catch (error) {
    console.warn('[OfflineSync] Failed to persist queue to IndexedDB:', error);
  }

  return syncOperation.id;
}

// ✅ Recovery automático al inicializar
private async initialize(): Promise<void> {
  await this.db.init();

  // Restore queue desde IndexedDB
  const savedQueue = await this.db.loadQueue();
  if (savedQueue.length > 0) {
    this.syncQueue = savedQueue.sort((a, b) => a.priority - b.priority);
    console.log(`[OfflineSync] Restored ${this.syncQueue.length} operations from storage`);
  }

  // Restore conflicts
  this.persistedConflicts = await this.db.loadConflicts();
}
```

---

## 🎯 **PRIORITY SYSTEM**

### **ENTITY PRIORITIES**
```typescript
// Orden de prioridad para sincronización
const PRIORITY_ORDER = [
  'orders',      // Prioridad 0 - Más alta (ventas críticas)
  'payments',    // Prioridad 1 - Crítica (transacciones financieras)
  'inventory',   // Prioridad 2 - Alta (stock real-time)
  'staff',       // Prioridad 3 - Media (gestión de personal)
  'customers'    // Prioridad 4 - Baja (datos menos críticos)
];

private insertOperationByPriority(operation: SyncOperation): void {
  const priority = this.config.priorityOrder.indexOf(operation.entity);
  operation.priority = priority === -1 ? 999 : priority;

  // Insertar manteniendo orden de prioridad
  let insertIndex = this.syncQueue.length;
  for (let i = 0; i < this.syncQueue.length; i++) {
    if (this.syncQueue[i].priority > operation.priority) {
      insertIndex = i;
      break;
    }
  }

  this.syncQueue.splice(insertIndex, 0, operation);
}
```

### **BATCH PROCESSING**
```typescript
// ✅ Procesamiento en lotes para performance
public async syncPendingOperations(): Promise<void> {
  if (this.isSyncing || !this.isOnline || this.syncQueue.length === 0) {
    return;
  }

  this.isSyncing = true;

  try {
    // Procesar en batches de tamaño configurable
    while (this.syncQueue.length > 0 && this.isOnline) {
      const batch = this.syncQueue.splice(0, this.config.batchSize);
      await this.processBatch(batch);
    }

    console.log('[OfflineSync] Sync completed successfully');
    this.emitEvent('syncCompleted', { success: true });

  } catch (error) {
    console.error('[OfflineSync] Sync failed:', error);
    this.emitEvent('syncFailed', { error: error.message });
  } finally {
    this.isSyncing = false;
  }
}
```

---

## 🔄 **CONFLICT RESOLUTION**

### **CONFLICT TYPES**
```typescript
interface SyncConflict {
  id: string;
  operation: SyncOperation;
  serverData: any;
  clientData: any;
  conflictType: 'data_conflict' | 'version_conflict' | 'dependency_conflict';
  resolution?: 'resolved' | 'pending' | 'manual_required';
  resolvedData?: any;
  timestamp?: number;
}
```

### **RESOLUTION STRATEGIES**
```typescript
// ✅ MERGE STRATEGY (default) - Inteligente
private mergeData(serverData: any, clientData: any): any {
  const merged = { ...serverData };

  // Merge campos no conflictivos
  for (const [key, value] of Object.entries(clientData)) {
    if (!(key in serverData)) {
      merged[key] = value;
    } else if (this.shouldUseClientValue(key, serverData[key], value)) {
      merged[key] = value;
    }
  }

  // Update metadata
  merged.lastModified = new Date().toISOString();
  merged.mergedFrom = [serverData.id || 'server', clientData.id || 'client'];

  return merged;
}

// ✅ SMART VALUE SELECTION
private shouldUseClientValue(key: string, serverValue: any, clientValue: any): boolean {
  // Client preferred fields
  const clientPreferredFields = ['notes', 'customFields', 'localData'];
  if (clientPreferredFields.includes(key)) {
    return true;
  }

  // Más reciente para campos de fecha
  if (key.includes('Time') || key.includes('Date')) {
    return new Date(clientValue) > new Date(serverValue);
  }

  // Valor más alto para campos acumulativos
  if (typeof serverValue === 'number' && typeof clientValue === 'number') {
    const cumulativeFields = ['quantity', 'amount', 'count'];
    if (cumulativeFields.some(field => key.toLowerCase().includes(field))) {
      return clientValue > serverValue;
    }
  }

  return false;
}
```

### **CONFLICT RESOLUTION CONFIG**
```typescript
// ✅ Strategies disponibles
type ConflictResolution = 'client_wins' | 'server_wins' | 'merge' | 'manual';

const syncConfig = {
  conflictResolution: 'merge', // Default inteligente
  // server_wins: Para datos críticos del servidor
  // client_wins: Para preferencias de usuario
  // manual: Para casos complejos que requieren decisión humana
};
```

---

## 🌐 **NETWORK MANAGEMENT**

### **ANTI-FLAPPING PROTECTION**
```typescript
// ✅ Protección contra conexiones inestables
private handleOnline(): void {
  const now = Date.now();
  this.isOnline = true;

  // Track connection flaps
  if (now - this.lastConnectAttempt < this.FLAP_RESET_MS) {
    this.connectionFlaps++;
  } else {
    this.connectionFlaps = 1; // Reset si pasó suficiente tiempo
  }

  // Si hay muchos flaps, esperar más tiempo para estabilidad
  const waitTime = this.connectionFlaps > this.MAX_FLAPS_THRESHOLD
    ? this.RECONNECT_STABLE_MS * 2
    : this.RECONNECT_STABLE_MS;

  // Schedule sync solo después de conexión estable
  this.reconnectStableTimer = window.setTimeout(() => {
    if (this.isOnline && navigator.onLine) {
      console.log('[OfflineSync] Connection stable, starting sync');
      this.syncPendingOperations();
    }
  }, waitTime);
}
```

### **USEOFFLINESTATUS HOOK**
```typescript
// Ubicación: /src/lib/offline/useOfflineStatus.ts

export function useOfflineStatus() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isStable, setIsStable] = useState(true);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setIsStable(false);

      // Considerar conexión estable después de 3 segundos
      setTimeout(() => setIsStable(true), 3000);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setIsStable(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return { isOnline, isStable };
}
```

---

## 🎨 **UI COMPONENTS**

### **OFFLINEMONITOR COMPONENT**
```typescript
// Ubicación: /src/lib/offline/OfflineMonitor.tsx

export function OfflineMonitor() {
  const { isOnline, isStable } = useOfflineStatus();
  const [syncStatus, setSyncStatus] = useState<SyncStatus | null>(null);

  useEffect(() => {
    const updateStatus = () => {
      setSyncStatus(offlineSync.getSyncStatus());
    };

    // Update cada 5 segundos
    const interval = setInterval(updateStatus, 5000);
    updateStatus(); // Initial load

    // Listen for sync events
    offlineSync.on('syncStarted', updateStatus);
    offlineSync.on('syncCompleted', updateStatus);
    offlineSync.on('syncFailed', updateStatus);

    return () => {
      clearInterval(interval);
      offlineSync.off('syncStarted', updateStatus);
      offlineSync.off('syncCompleted', updateStatus);
      offlineSync.off('syncFailed', updateStatus);
    };
  }, []);

  if (isOnline && isStable && (!syncStatus || syncStatus.queueSize === 0)) {
    return null; // No mostrar nada si todo está bien
  }

  return (
    <Alert
      variant="outline"
      colorPalette={isOnline ? 'blue' : 'orange'}
      size="sm"
    >
      <AlertIcon />
      <AlertTitle>
        {isOnline ? 'Sincronizando...' : 'Sin conexión'}
      </AlertTitle>
      <AlertDescription>
        {isOnline
          ? `${syncStatus?.queueSize || 0} operaciones pendientes`
          : 'Los cambios se sincronizarán cuando vuelva la conexión'
        }
      </AlertDescription>
    </Alert>
  );
}
```

---

## 🔗 **INTEGRATION CON EVENTBUS**

### **SYNC EVENTS**
```typescript
// ✅ OfflineSync emite eventos al EventBus para coordinación
await EventBus.emit('system.data_synced', {
  type: 'offline_sync_operation_completed',
  operationId: operation.id,
  operationType: operation.type,
  entity: operation.entity,
  success: true,
  hasConflicts: conflicts.length > 0
}, 'OfflineSync');

// ✅ Modules pueden escuchar sync events
EventBus.on('system.data_synced', (event) => {
  const { entity, operationType, success } = event.payload;

  if (entity === 'materials' && success) {
    // Refresh UI después de sync exitoso
    materialsStore.refresh();
  }
});
```

### **ERROR INTEGRATION**
```typescript
// ✅ Errores de sync se integran con error handling system
private async syncOperation(operation: SyncOperation): Promise<SyncResult> {
  try {
    const response = await this.makeRequest(endpoint, operation);

    if (response.ok) {
      // Success path...
    } else {
      throw new Error(`Server responded with ${response.status}: ${response.statusText}`);
    }

  } catch (error) {
    // Integration con ErrorHandler
    const appError = errorHandler.handle(error, {
      operation: 'offline_sync',
      operationType: operation.type,
      entity: operation.entity,
      operationId: operation.id,
      retryCount: operation.retry
    });

    return {
      success: false,
      operation,
      error: appError.message
    };
  }
}
```

---

## 📱 **MODULE INTEGRATION PATTERNS**

### **✅ MATERIALS MODULE (IMPLEMENTADO)**
```typescript
// En MaterialsPage/hooks
const useMaterialsOffline = () => {
  const { isOnline } = useOfflineStatus();

  const createMaterial = async (data: MaterialFormData) => {
    // Optimistic update
    const tempId = `temp_${Date.now()}`;
    const tempMaterial = { ...data, id: tempId, synced: false };

    // Update UI inmediatamente
    materialsStore.addOptimistic(tempMaterial);

    try {
      if (isOnline) {
        // Intentar sync inmediato
        const result = await api.createMaterial(data);
        materialsStore.confirmOptimistic(tempId, result);
        return result;
      } else {
        // Queue para sync posterior
        await offlineSync.queueOperation({
          type: 'CREATE',
          entity: 'materials',
          data: { ...data, tempId }
        });

        notify.info({
          title: 'Material creado (offline)',
          description: 'Se sincronizará cuando vuelva la conexión'
        });

        return tempMaterial;
      }
    } catch (error) {
      // Revert optimistic update
      materialsStore.removeOptimistic(tempId);
      throw error;
    }
  };

  return { createMaterial };
};
```

### **⚠️ PENDIENTE: SALES MODULE**
```typescript
// Pattern para implementar en Sales
const useSalesOffline = () => {
  const createSale = async (saleData: SaleFormData) => {
    // TODO: Implementar pattern offline-first
    // 1. Optimistic update en salesStore
    // 2. Queue operation si offline
    // 3. Immediate sync si online
    // 4. Handle conflicts para ventas (crítico)

    if (!isOnline) {
      await offlineSync.queueOperation({
        type: 'CREATE',
        entity: 'orders',
        data: saleData,
        priority: 0 // Máxima prioridad para ventas
      });
    }
  };
};
```

### **⚠️ PENDIENTE: STAFF MODULE**
```typescript
// Pattern para implementar en Staff
const useStaffOffline = () => {
  const updateEmployee = async (employeeId: string, updates: EmployeeUpdates) => {
    // TODO: Implementar pattern offline-first
    // 1. Optimistic update para cambios de staff
    // 2. Queue para schedules changes
    // 3. Conflict resolution para horarios overlapping
  };
};
```

---

## 🎯 **PATTERNS DE DESARROLLO PARA IA**

### **✅ SIEMPRE IMPLEMENTAR OFFLINE-FIRST**

#### **1. OPTIMISTIC UPDATES PATTERN**
```typescript
// ✅ CORRECTO - Always assume success, handle failure
const updateItem = async (itemId: string, data: UpdateData) => {
  // 1. Update UI inmediatamente (optimistic)
  store.updateOptimistic(itemId, data);

  try {
    if (isOnline) {
      // 2. Sync inmediato si hay conexión
      const result = await api.updateItem(itemId, data);
      store.confirmOptimistic(itemId, result);
      return result;
    } else {
      // 3. Queue si no hay conexión
      await offlineSync.queueOperation({
        type: 'UPDATE',
        entity: getEntityType(itemId),
        data: { id: itemId, ...data }
      });

      notify.info({
        title: 'Cambio guardado (offline)',
        description: 'Se sincronizará automáticamente'
      });

      return data;
    }
  } catch (error) {
    // 4. Revert si falla
    store.revertOptimistic(itemId);
    handleError(error, { operation: 'updateItem', itemId, data });
    throw error;
  }
};
```

#### **2. QUEUE OPERATION PATTERN**
```typescript
// ✅ CORRECTO - Queue todas las operaciones críticas
const performCriticalOperation = async (operationData: any) => {
  const { isOnline } = useOfflineStatus();

  // Siempre queue primero (para durabilidad)
  const operationId = await offlineSync.queueOperation({
    type: 'CREATE',
    entity: 'critical_operations',
    data: operationData,
    priority: 0 // Alta prioridad
  });

  if (isOnline) {
    // Intentar sync inmediato
    await offlineSync.forceSync();
  } else {
    // Informar al usuario
    notify.info({
      title: 'Operación guardada',
      description: 'Se procesará cuando vuelva la conexión'
    });
  }

  return operationId;
};
```

#### **3. CONFLICT DETECTION PATTERN**
```typescript
// ✅ CORRECTO - Always include version/timestamp para conflict detection
const prepareDataForSync = (localData: any): any => {
  return {
    ...localData,
    version: (localData.version || 0) + 1,
    lastModified: new Date().toISOString(),
    modifiedBy: user.id,
    clientId: offlineSync.getClientId()
  };
};
```

#### **4. STATUS MONITORING PATTERN**
```typescript
// ✅ CORRECTO - Always show sync status en UI críticas
function CriticalDataPage() {
  const { isOnline } = useOfflineStatus();
  const [syncStatus, setSyncStatus] = useState<SyncStatus>();

  useEffect(() => {
    const updateStatus = () => setSyncStatus(offlineSync.getSyncStatus());

    offlineSync.on('syncStarted', updateStatus);
    offlineSync.on('syncCompleted', updateStatus);

    return () => {
      offlineSync.off('syncStarted', updateStatus);
      offlineSync.off('syncCompleted', updateStatus);
    };
  }, []);

  return (
    <ContentLayout>
      {/* Always include offline monitor en páginas críticas */}
      <OfflineMonitor />

      {/* Status indicator para debugging */}
      {!isOnline && (
        <Alert colorPalette="orange">
          <AlertTitle>Modo offline</AlertTitle>
          <AlertDescription>
            {syncStatus?.queueSize} operaciones pendientes
          </AlertDescription>
        </Alert>
      )}

      {/* Content */}
    </ContentLayout>
  );
}
```

---

## 🧪 **TESTING PATTERNS**

### **OFFLINE SCENARIOS TESTING**
```typescript
// ✅ Siempre testear offline scenarios
describe('MaterialsService Offline', () => {
  beforeEach(() => {
    // Mock offline state
    Object.defineProperty(navigator, 'onLine', {
      writable: true,
      value: false
    });
  });

  it('should queue operations when offline', async () => {
    const queueSpy = jest.spyOn(offlineSync, 'queueOperation');

    await materialsService.createMaterial(testData);

    expect(queueSpy).toHaveBeenCalledWith({
      type: 'CREATE',
      entity: 'materials',
      data: expect.objectContaining(testData)
    });
  });

  it('should handle optimistic updates correctly', async () => {
    const storeSpy = jest.spyOn(materialsStore, 'addOptimistic');

    await materialsService.createMaterial(testData);

    expect(storeSpy).toHaveBeenCalledWith(
      expect.objectContaining({ synced: false })
    );
  });
});
```

### **CONFLICT RESOLUTION TESTING**
```typescript
// ✅ Testear conflict scenarios
describe('OfflineSync Conflicts', () => {
  it('should resolve conflicts using merge strategy', async () => {
    const serverData = { id: '1', name: 'Server Name', version: 2 };
    const clientData = { id: '1', name: 'Client Name', version: 1 };

    const resolved = await offlineSync.resolveConflict({
      id: 'conflict_1',
      operation: createTestOperation(clientData),
      serverData,
      clientData,
      conflictType: 'version_conflict'
    });

    expect(resolved.resolvedData).toEqual(
      expect.objectContaining({
        name: 'Server Name', // Server wins en version conflict
        version: 2,
        mergedFrom: expect.arrayContaining(['server', 'client'])
      })
    );
  });
});
```

---

## 📊 **MONITORING Y ANALYTICS**

### **SYNC STATUS API**
```typescript
// ✅ API completa para monitoring
interface SyncStatus {
  isOnline: boolean;           // Estado de red
  isSyncing: boolean;          // Sync en progreso
  queueSize: number;           // Operaciones pendientes
  lastSync: number;            // Timestamp de último sync
  syncProgress: number;        // 0-100% progreso actual
  errors: string[];            // Errores recientes
  conflicts: SyncConflict[];   // Conflictos no resueltos
}

// Usage
const status = offlineSync.getSyncStatus();
console.log(`Queue: ${status.queueSize}, Last sync: ${new Date(status.lastSync)}`);
```

### **EVENT MONITORING**
```typescript
// ✅ Events para analytics y debugging
offlineSync.on('operationQueued', ({ operation }) => {
  analytics.track('offline_operation_queued', {
    type: operation.type,
    entity: operation.entity,
    priority: operation.priority
  });
});

offlineSync.on('conflictsHandled', ({ conflicts, resolved, unresolved }) => {
  analytics.track('sync_conflicts_processed', {
    total: conflicts.length,
    resolved,
    unresolved
  });
});

offlineSync.on('syncCompleted', ({ success }) => {
  analytics.track('offline_sync_completed', { success });
});
```

---

## 🔄 **MODULE IMPLEMENTATION CHECKLIST**

### **✅ PARA CADA MÓDULO QUE MANEJA DATOS**

#### **1. OFFLINE-FIRST HOOKS**
- [ ] ✅ `use[Module]Offline()` hook implementado
- [ ] ✅ Optimistic updates en todas las operaciones
- [ ] ✅ Queue operations para offline scenarios
- [ ] ✅ Error handling con revert de optimistic updates

#### **2. STORE INTEGRATION**
- [ ] ✅ `addOptimistic()` / `confirmOptimistic()` / `revertOptimistic()` methods
- [ ] ✅ `synced` field en items para tracking sync status
- [ ] ✅ Conflict resolution handlers
- [ ] ✅ Event listeners para sync completion

#### **3. UI COMPONENTS**
- [ ] ✅ `<OfflineMonitor />` en páginas principales
- [ ] ✅ Sync status indicators en items no sincronizados
- [ ] ✅ Conflict resolution UI para manual conflicts
- [ ] ✅ Retry buttons para failed operations

#### **4. TESTING**
- [ ] ✅ Offline scenarios tests
- [ ] ✅ Optimistic updates tests
- [ ] ✅ Conflict resolution tests
- [ ] ✅ Network transition tests (online ↔ offline)

---

## 🚀 **IMPLEMENTATION ROADMAP**

### **FASE 1: COMPLETAR MÓDULOS CRÍTICOS**
1. **Sales Module** - Offline sales con high priority queueing
2. **Staff Module** - Schedule changes con conflict resolution
3. **Customers Module** - Basic offline CRUD operations

### **FASE 2: ADVANCED FEATURES**
1. **Real-time conflict resolution UI** para manual resolution
2. **Background sync** con Service Worker integration
3. **Sync progress tracking** con detailed UI feedback
4. **Conflict analytics** para identificar patterns problemáticos

### **FASE 3: OPTIMIZATION**
1. **Predictive sync** basado en user patterns
2. **Bandwidth optimization** para conexiones lentas
3. **Data compression** para large payloads
4. **Multi-device sync** coordination

---

## 🎯 **QUICK REFERENCE PARA IA**

### **IMPORTS OBLIGATORIOS**
```typescript
// Siempre importar en módulos que manejen datos
import { useOfflineStatus } from '@/lib/offline/useOfflineStatus';
import offlineSync from '@/lib/offline/OfflineSync';
import { OfflineMonitor } from '@/lib/offline/OfflineMonitor';
```

### **CHECKLIST DESARROLLO**
- [ ] ✅ **Optimistic updates** en todas las operaciones de datos
- [ ] ✅ **Queue operations** para scenarios offline
- [ ] ✅ **Conflict detection** con version/timestamp
- [ ] ✅ **Status monitoring** en UI críticas
- [ ] ✅ **Error handling** con revert de optimistic updates
- [ ] ✅ **Testing** de offline scenarios

### **ANTI-PATTERNS A EVITAR**
```typescript
// ❌ NO HACER - Fail inmediatamente si no hay conexión
if (!navigator.onLine) {
  throw new Error('No connection available');
}

// ❌ NO HACER - No queue critical operations
await api.createSale(data); // Falla si no hay conexión

// ❌ NO HACER - No optimistic updates
const result = await api.updateItem(data);
store.updateItem(result); // UX lenta, falla offline

// ❌ NO HACER - No conflict detection
const data = { name: 'New Name' }; // Falta version/timestamp
```

---

**🎯 NOTA PARA IA**: SIEMPRE pensar offline-first al implementar cualquier funcionalidad que maneje datos. El sistema está diseñado para funcionar completamente offline, la conexión es solo una optimización para sync inmediato.