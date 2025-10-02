# G-Admin Mini - Logging System

Sistema unificado de logging para desarrollo y debugging.

## 🎯 Características

- ✅ **Module-based**: Logs organizados por módulo/sistema
- ✅ **Log Levels**: debug, info, warn, error, performance
- ✅ **Development-only**: Se elimina en producción (tree-shaking)
- ✅ **Performance monitoring**: Con thresholds configurables
- ✅ **Visual**: Color-coded + emojis para fácil identificación
- ✅ **Configurable**: Filtrar por módulo y nivel

## 📖 Uso Básico

```typescript
import { logger } from '@/lib/logging';

// Debug logging
logger.debug('NavigationContext', 'Calculating accessible modules');

// Info logging con data
logger.info('EventBus', 'Event emitted', { pattern: 'user.login', data: {...} });

// Warning
logger.warn('OfflineSync', 'Sync queue growing', { queueSize: 150 });

// Error con stack trace
logger.error('API', 'Failed to fetch data', error);

// Performance monitoring
const startTime = performance.now();
// ... operación costosa ...
const endTime = performance.now();
logger.performance('NavigationContext', 'Module filtering', endTime - startTime);
```

## ⚡ Performance Monitoring

### Método 1: Manual
```typescript
const startTime = performance.now();
const result = await fetchData();
const endTime = performance.now();

logger.performance('API', 'fetchUserData', endTime - startTime);
```

### Método 2: Wrapper automático
```typescript
const result = await logger.measure(
  'API',
  'fetchUserData',
  async () => await fetchData()
);
// Solo loguea si excede el threshold (default: 10ms)
```

### Método 3: Custom threshold
```typescript
logger.performance('NavigationContext', 'Heavy operation', 150, 50);
// Solo loguea si > 50ms
```

## 🎨 Log Levels

Cada nivel incluye los niveles superiores:

- `debug` - Información detallada (incluye todo)
- `info` - Información general
- `warn` - Advertencias
- `error` - Errores
- `performance` - Métricas de performance

## ⚙️ Configuración

### Configuración por defecto
```typescript
{
  enabled: process.env.NODE_ENV === 'development',
  level: 'debug',
  modules: 'all',
  performanceThreshold: 10, // ms
  includeTimestamp: true,
  includeStackTrace: false
}
```

### Configuración en runtime (Dev Console)
```javascript
// Acceder al logger global
window.__GADMIN_LOGGER__

// Solo loguear módulos específicos
__GADMIN_LOGGER__.configure({
  modules: new Set(['EventBus', 'OfflineSync'])
});

// Cambiar nivel mínimo
__GADMIN_LOGGER__.configure({
  level: 'warn' // Solo warn y error
});

// Cambiar threshold de performance
__GADMIN_LOGGER__.configure({
  performanceThreshold: 50 // Solo operaciones > 50ms
});

// Ver configuración actual
__GADMIN_LOGGER__.getConfig();
```

## 📦 Módulos Disponibles

Los módulos están tipados para autocompletado:

### Core Systems
- `NavigationContext`
- `AuthContext`
- `EventBus`
- `OfflineSync`
- `WebSocket`
- `CapabilitySystem`

### Stores
- `MaterialsStore`
- `SalesStore`
- `StaffStore`
- `CapabilityStore`

### UI Components
- `Layout`
- `Modal`
- `Form`

### Performance
- `Performance`
- `LazyLoading`

### Network
- `API`
- `Supabase`

### Generic
- `App`

## 🔧 Reemplazar Console.logs Existentes

### Antes ❌
```typescript
console.log('🔍 Module Filter Debug:', { moduleId, access });
console.warn('[OfflineSync] Queue size:', queueSize);
if (process.env.NODE_ENV === 'development') {
  console.log('[EventBus] Event emitted:', event);
}
```

### Después ✅
```typescript
logger.debug('NavigationContext', 'Module filter', { moduleId, access });
logger.warn('OfflineSync', `Queue size: ${queueSize}`);
logger.info('EventBus', 'Event emitted', event);
```

## 🎯 Ejemplos por Caso de Uso

### Navigation Context
```typescript
import { logger } from '@/lib/logging';

const accessibleModules = useMemo(() => {
  const startTime = performance.now();

  logger.debug('NavigationContext', 'Starting module filtering');

  const filtered = MODULES.filter(module => {
    const hasAccess = checkAccess(module);

    if (!hasAccess) {
      logger.debug('NavigationContext', `Module filtered out: ${module.id}`);
    }

    return hasAccess;
  });

  const endTime = performance.now();
  logger.performance('NavigationContext', 'Module filtering', endTime - startTime);

  return filtered;
}, [dependencies]);
```

### Event Bus
```typescript
import { logger } from '@/lib/logging';

emit(pattern: string, payload: any) {
  logger.debug('EventBus', `Emitting event: ${pattern}`, { payload });

  const subscribers = this.getSubscribers(pattern);
  logger.info('EventBus', `Found ${subscribers.length} subscribers for ${pattern}`);

  subscribers.forEach(sub => {
    try {
      sub.handler(payload);
    } catch (error) {
      logger.error('EventBus', `Handler error for ${pattern}`, error);
    }
  });
}
```

### API Calls
```typescript
import { logger } from '@/lib/logging';

async function fetchUserData(userId: string) {
  return await logger.measure(
    'API',
    `fetchUserData(${userId})`,
    async () => {
      logger.debug('API', `Fetching user data for: ${userId}`);

      const response = await fetch(`/api/users/${userId}`);

      if (!response.ok) {
        logger.warn('API', `API error: ${response.status}`, { userId });
      }

      return response.json();
    }
  );
}
```

### Offline Sync
```typescript
import { logger } from '@/lib/logging';

async syncQueue() {
  logger.info('OfflineSync', `Starting sync of ${this.queue.length} operations`);

  for (const op of this.queue) {
    try {
      await this.syncOperation(op);
      logger.debug('OfflineSync', `Synced: ${op.type} ${op.entity}`);
    } catch (error) {
      logger.error('OfflineSync', `Failed to sync: ${op.type}`, error);
    }
  }

  logger.info('OfflineSync', 'Sync completed');
}
```

## 🚫 Anti-Patterns

### ❌ No hagas esto
```typescript
// Log en cada render (performance issue)
function MyComponent() {
  logger.debug('MyComponent', 'Rendering'); // ❌ BAD

  return <div>...</div>;
}

// Logs en loops sin filtrar
array.forEach(item => {
  logger.debug('Loop', 'Processing item', item); // ❌ BAD si array es grande
});

// Logs sin contexto
logger.debug('App', 'Error'); // ❌ BAD - no se entiende qué pasó
```

### ✅ Haz esto
```typescript
// Log solo en eventos importantes
function MyComponent() {
  useEffect(() => {
    logger.debug('MyComponent', 'Component mounted');
  }, []);

  return <div>...</div>;
}

// Logs con contexto útil
logger.error('MaterialsStore', 'Failed to update stock', {
  materialId: material.id,
  attemptedQuantity: newQuantity,
  error: error.message
});

// Performance logging para operaciones costosas
const result = await logger.measure(
  'MaterialsStore',
  'calculateTotalCost',
  () => calculateTotalCost(materials)
);
```

## 📊 Debugging en Producción

En producción, todos los logs se eliminan automáticamente via tree-shaking.

Si necesitas debug en producción, considera:
1. Usar sistemas de logging remotos (Sentry, LogRocket)
2. Feature flags para habilitar logs específicos
3. Error boundaries con reporting

## 🔍 Troubleshooting

### Los logs no aparecen
- Verificar `NODE_ENV === 'development'`
- Verificar nivel de log: `__GADMIN_LOGGER__.getConfig()`
- Verificar filtro de módulos: `__GADMIN_LOGGER__.configure({ modules: 'all' })`

### Logs inundan la consola
- Subir el nivel: `__GADMIN_LOGGER__.configure({ level: 'warn' })`
- Filtrar módulos: `__GADMIN_LOGGER__.configure({ modules: new Set(['EventBus']) })`
- Aumentar threshold de performance: `__GADMIN_LOGGER__.configure({ performanceThreshold: 50 })`

## 🎓 Best Practices

1. **Usar módulos específicos** - No usar 'App' para todo
2. **Incluir contexto** - IDs, nombres, valores relevantes
3. **Performance logging** - Para operaciones > 5ms
4. **Error logging** - Siempre incluir el error object
5. **Evitar logs en hot paths** - Renders, loops grandes
6. **Usar niveles apropiados** - debug para detalles, info para eventos importantes

## 📚 Referencias

- [Console API - MDN](https://developer.mozilla.org/en-US/docs/Web/API/Console)
- [Performance API - MDN](https://developer.mozilla.org/en-US/docs/Web/API/Performance)
- [G-Admin Architecture](../../docs/ARCHITECTURE.md)
