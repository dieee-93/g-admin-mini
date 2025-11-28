# 🎯 PROMPT CORREGIDO: Implementar `useCashSession` Hook en Cash Module

**Contexto**: G-Admin Mini usa **Zustand + hooks propios**, NO React Query. Necesitamos exponer un hook reutilizable para gestionar cash sessions siguiendo las convenciones del proyecto.

**IMPORTANTE**: Este proyecto usa:
- ✅ **Zustand stores** para state management
- ✅ **useState + useCallback** para hooks custom
- ✅ **useCrudOperations** (hook propio del proyecto)
- ✅ **useShallow** para subscripciones selectivas
- ❌ **NO usa React Query / TanStack Query**

---

## 📋 PATRÓN DEL PROYECTO

### Arquitectura de Hooks (Cash Module)

El proyecto sigue el patrón **Split Hooks**:

```
src/pages/admin/finance/cash/hooks/
├── useCashData.ts      ✅ Data slice (Zustand subscription)
├── useCashActions.ts   ✅ Actions slice (Zustand subscription)
└── useCashPage.ts      ✅ Orchestrator hook (combina data + actions)
```

**Ejemplo real** (`useCashData.ts`):

```typescript
import { useShallow } from 'zustand/react/shallow';
import { useCashStore } from '@/store/cashStore';

export function useCashData() {
  return useCashStore(
    useShallow((state) => ({
      moneyLocations: state.moneyLocations,
      activeSessions: state.activeSessions,
      loading: state.loading,
      error: state.error,
    }))
  );
}
```

**Ejemplo real** (`useCashPage.ts` - orchestrator):

```typescript
export function useCashPage() {
  const { user } = useAuth();
  const [isOpening, setIsOpening] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  const {
    moneyLocations,
    activeSessions,
    loading,
    error,
  } = useCashData();  // Data slice

  const storeActions = useCashActions();  // Actions slice

  const handleOpenSession = useCallback(async (input: OpenCashSessionInput) => {
    try {
      setIsOpening(true);
      const session = await openCashSession(input, user.id);
      storeActions.addSession(session);
      notify.success({ title: 'Sesión abierta' });
    } catch (error) {
      notify.error({ title: 'Error' });
    } finally {
      setIsOpening(false);
    }
  }, [user?.id, storeActions]);

  return {
    activeSessions,
    loading,
    error,
    isOpening,
    isClosing,
    handleOpenSession,
    // ...
  };
}
```

---

## 🎯 TAREA: Crear `useCashSession` para Module Exports

### Objetivo

Crear un hook **simplificado y reutilizable** que pueda ser exportado en el manifest y consumido por otros módulos (como ShiftControlWidget).

**NO necesitamos** duplicar toda la lógica de `useCashPage` (que es específica de la página).

**SÍ necesitamos** exponer:
- Active cash session
- Funciones open/close con loading states
- Conectado al store existente

---

### 1. Crear el Hook

**Archivo**: `src/modules/cash-management/hooks/useCashSession.ts`

```typescript
import { useState, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { logger } from '@/lib/logging/Logger';
import { notify } from '@/lib/notifications';
import { useCashStore } from '@/store/cashStore';
import { useShallow } from 'zustand/react/shallow';
import {
  openCashSession as openCashSessionService,
  closeCashSession as closeCashSessionService,
  type OpenCashSessionInput,
  type CloseCashSessionInput,
} from '@/modules/cash/services/cashSessionService';

/**
 * Hook for cash session management
 *
 * Provides:
 * - Active cash session (from Zustand store)
 * - Open session mutation with loading state
 * - Close session mutation with loading state
 *
 * @example
 * ```tsx
 * const { activeCashSession, openCashSession, closeCashSession, isOpening } = useCashSession();
 *
 * await openCashSession({
 *   money_location_id: 'loc-123',
 *   starting_cash: 5000
 * });
 * ```
 */
export function useCashSession() {
  const { user } = useAuth();

  // Subscribe to store data (data slice)
  const { activeSessions, loading: storeLoading } = useCashStore(
    useShallow((state) => ({
      activeSessions: state.activeSessions,
      loading: state.loading,
    }))
  );

  // Subscribe to store actions (actions slice)
  const storeActions = useCashStore(
    useShallow((state) => ({
      addSession: state.addSession,
      updateSession: state.updateSession,
      setLoading: state.setLoading,
      setError: state.setError,
    }))
  );

  // Get first active session (or null)
  const activeCashSession = activeSessions[0] || null;

  // Local loading states for mutations
  const [isOpening, setIsOpening] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  /**
   * Open a new cash session
   */
  const openCashSession = useCallback(
    async (input: OpenCashSessionInput) => {
      if (!user?.id) {
        notify.error({ title: 'Usuario no autenticado' });
        throw new Error('User not authenticated');
      }

      try {
        setIsOpening(true);
        logger.info('CashModule', 'Opening cash session', { input });

        const session = await openCashSessionService(input, user.id);

        // Update store
        storeActions.addSession(session);

        notify.success({
          title: 'Caja abierta',
          description: `Sesión iniciada con $${session.starting_cash}`
        });

        logger.info('CashModule', 'Cash session opened successfully', {
          sessionId: session.id
        });

        return session;
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Error al abrir sesión de caja';

        notify.error({
          title: 'Error al abrir caja',
          description: message
        });

        logger.error('CashModule', 'Failed to open cash session', { error });

        throw error;
      } finally {
        setIsOpening(false);
      }
    },
    [user?.id, storeActions]
  );

  /**
   * Close an active cash session
   */
  const closeCashSession = useCallback(
    async (sessionId: string, input: CloseCashSessionInput) => {
      if (!user?.id) {
        notify.error({ title: 'Usuario no autenticado' });
        throw new Error('User not authenticated');
      }

      try {
        setIsClosing(true);
        logger.info('CashModule', 'Closing cash session', { sessionId, input });

        const session = await closeCashSessionService(sessionId, input, user.id);

        // Update store
        storeActions.updateSession(sessionId, session);

        if (session.status === 'DISCREPANCY') {
          notify.warning({
            title: 'Caja cerrada con diferencia',
            description: `Diferencia: $${Math.abs(session.variance || 0)}`
          });
        } else {
          notify.success({
            title: 'Caja cerrada correctamente'
          });
        }

        logger.info('CashModule', 'Cash session closed successfully', {
          sessionId: session.id,
          status: session.status,
          variance: session.variance
        });

        return session;
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Error al cerrar sesión de caja';

        notify.error({
          title: 'Error al cerrar caja',
          description: message
        });

        logger.error('CashModule', 'Failed to close cash session', { error });

        throw error;
      } finally {
        setIsClosing(false);
      }
    },
    [user?.id, storeActions]
  );

  return {
    // Data
    activeCashSession,
    loading: storeLoading,

    // Actions
    openCashSession,
    closeCashSession,

    // Loading states
    isOpening,
    isClosing,
  };
}
```

---

### 2. Actualizar Cash Module Manifest

**Archivo**: `src/modules/cash-management/manifest.tsx`

**Cambios**:

1. Importar el hook:

```typescript
import { useCashSession } from './hooks/useCashSession';
```

2. Actualizar `exports` (reemplazar sección completa):

```typescript
exports: {
  hooks: {
    /**
     * Hook para gestión de cash sessions
     * Provee estado reactivo de sesión activa + mutaciones
     *
     * @example
     * ```tsx
     * const registry = ModuleRegistry.getInstance();
     * const cashModule = registry.getExports('cash-management');
     * const useCashSession = cashModule.hooks.useCashSession;
     *
     * function MyComponent() {
     *   const { activeCashSession, openCashSession, closeCashSession, isOpening } = useCashSession();
     *   // ...
     * }
     * ```
     */
    useCashSession: () => useCashSession, // Hook factory
  },

  // Servicios (funciones puras) - mantener para consumo directo
  services: {
    getActiveCashSession: async () => {
      const { getAllActiveSessions } = await import('@/modules/cash/services/cashSessionService');
      const sessions = await getAllActiveSessions();
      return sessions[0] || null;
    },
    openCashSession: async (input: any, userId: string) => {
      const { openCashSession } = await import('@/modules/cash/services/cashSessionService');
      return openCashSession(input, userId);
    },
    closeCashSession: async (sessionId: string, input: any, userId: string) => {
      const { closeCashSession } = await import('@/modules/cash/services/cashSessionService');
      return closeCashSession(sessionId, input, userId);
    },
  }
},
```

---

### 3. Crear Index para Hooks (Opcional)

**Archivo**: `src/modules/cash-management/hooks/index.ts`

```typescript
export { useCashSession } from './useCashSession';
```

---

### 4. TypeScript Types (Agregar al manifest)

Al final del manifest:

```typescript
/**
 * Cash Management module public API types
 */
export interface CashManagementAPI {
  hooks: {
    useCashSession: () => () => {
      activeCashSession: CashSessionRow | null;
      loading: boolean;
      openCashSession: (input: OpenCashSessionInput) => Promise<CashSessionRow>;
      closeCashSession: (sessionId: string, input: CloseCashSessionInput) => Promise<CashSessionRow>;
      isOpening: boolean;
      isClosing: boolean;
    };
  };
  services: {
    getActiveCashSession: () => Promise<CashSessionRow | null>;
    openCashSession: (input: OpenCashSessionInput, userId: string) => Promise<CashSessionRow>;
    closeCashSession: (sessionId: string, input: CloseCashSessionInput, userId: string) => Promise<CashSessionRow>;
  };
}
```

---

## 📚 ARCHIVOS DE REFERENCIA

**Para estudiar convenciones** (LEER ANTES DE IMPLEMENTAR):

1. **Hook patterns del proyecto**:
   - `src/pages/admin/finance/cash/hooks/useCashData.ts` - Data slice pattern
   - `src/pages/admin/finance/cash/hooks/useCashActions.ts` - Actions slice pattern
   - `src/pages/admin/finance/cash/hooks/useCashPage.ts` - Orchestrator pattern
   - `src/hooks/core/useCrudOperations.ts` - Hook complejo del proyecto

2. **Store pattern**:
   - `src/store/cashStore.ts` - Zustand store con devtools + persist + immer

3. **Module exports pattern**:
   - `src/modules/staff/manifest.tsx` (líneas 157-188) - Hook factory pattern

4. **Servicios**:
   - `src/modules/cash/services/cashSessionService.ts` - Servicios reales
   - `src/modules/cash/types/cashSessions.ts` - TypeScript types

5. **Utilidades**:
   - `src/contexts/AuthContext.tsx` - useAuth()
   - `src/lib/logging/Logger.ts` - logger
   - `src/lib/notifications/index.ts` - notify

---

## ✅ CHECKLIST

- [ ] Leer TODOS los archivos de referencia para entender convenciones
- [ ] Crear `src/modules/cash-management/hooks/useCashSession.ts`
- [ ] Usar **useShallow** para subscripciones a Zustand store
- [ ] Usar **useState + useCallback** (NO React Query)
- [ ] Conectar a **services reales** (cashSessionService.ts)
- [ ] Usar **useAuth()** para obtener userId
- [ ] Agregar **logger** (import from '@/lib/logging/Logger')
- [ ] Agregar **notify** (import from '@/lib/notifications')
- [ ] Actualizar manifest:
  - [ ] Importar useCashSession
  - [ ] Agregar exports.hooks.useCashSession como hook factory
  - [ ] Mantener exports.services
  - [ ] Agregar TypeScript types
- [ ] Crear exports index (opcional)
- [ ] Verificar que NO hay mocks
- [ ] Test de consumo

---

## 🚨 VALIDACIÓN FINAL

```typescript
// Test de consumo
import { ModuleRegistry } from '@/lib/modules';

function TestComponent() {
  const registry = ModuleRegistry.getInstance();
  const cashModule = registry.getExports('cash-management');
  const useCashSession = cashModule.hooks.useCashSession;

  const {
    activeCashSession,
    openCashSession,
    closeCashSession,
    isOpening,
    loading
  } = useCashSession();

  console.log('Active session:', activeCashSession);
  console.log('Is opening:', isOpening);

  return <div>Session: {activeCashSession?.id || 'None'}</div>;
}
```

### Verificar:
- [ ] Hook se importa correctamente
- [ ] activeCashSession trae datos del **Zustand store**
- [ ] openCashSession ejecuta servicio y **actualiza store**
- [ ] closeCashSession ejecuta servicio y **actualiza store**
- [ ] notify muestra notificaciones
- [ ] logger registra eventos
- [ ] NO usa React Query
- [ ] NO hay errores de TypeScript

---

## 🎯 DIFERENCIAS CLAVE CON EL PROMPT ANTERIOR (INCORRECTO)

| Aspecto | ❌ Prompt Anterior (Mal) | ✅ Prompt Correcto |
|---------|-------------------------|-------------------|
| **State Management** | useQuery (React Query) | useShallow (Zustand) |
| **Mutations** | useMutation | useState + useCallback |
| **Data Source** | queryClient | useCashStore |
| **Invalidation** | queryClient.invalidateQueries | storeActions.addSession/updateSession |
| **Pattern** | React Query pattern | Split Hooks pattern del proyecto |

---

**Tiempo estimado**: 30-45 minutos
**Prioridad**: CRÍTICA (bloquea ShiftControlWidget)
**Patrón**: ✅ Zustand + Split Hooks (patrón real del proyecto)

---

**Creado por**: Claude Code (CORREGIDO)
**Fecha**: 2025-01-26
**Para**: Nueva sesión de Claude Code
