# 8. Debugging de Async Operations y Side Effects

> **Documentación completa sobre debugging de operaciones asíncronas y efectos secundarios en React**
> 
> Esta guía cubre las técnicas, herramientas y mejores prácticas para debuggear:
> - Fetch y API calls con network inspection, CORS, timeouts, retry strategies
> - Promises con async/await, error handling, race conditions
> - WebSockets con connection state, reconnection, message tracking
> - Timers e intervals con cleanup, drift correction, tracking
> - Event listeners con bubbling/capturing, memory leaks, delegation

## 🎯 Quick Reference

| Problema | Solución Rápida | Sección |
|----------|-----------------|---------|
| Race conditions en fetch | `ignore` flag o `AbortController` | [1.6](#16-abortsignal-y-cancellation), [2.5](#25-race-conditions) |
| CORS errors | Vite proxy o backend headers | [1.3](#13-cors-errors-debugging) |
| Memory leaks en timers | Cleanup con `clearInterval/clearTimeout` | [4.1](#41-settimeoutsetinterval-tracking) |
| Memory leaks en listeners | `removeEventListener` en cleanup | [5.1](#51-addeventlistener-debugging) |
| Unhandled promise rejections | Global handler `unhandledrejection` | [2.3](#23-unhandled-rejections) |
| WebSocket reconnection | Exponential backoff strategy | [3.1](#31-connection-state-tracking) |
| Query debugging | TanStack Query DevTools | [1.7](#17-tanstack-query-devtools) |
| Timeout en requests | AbortController con timeout | [1.5](#15-timeout-y-retry-strategies) |

---

## Tabla de Contenidos

1. [Fetch y API Calls Debugging](#1-fetch-y-api-calls-debugging)
2. [Promises Debugging](#2-promises-debugging)
3. [WebSockets Debugging](#3-websockets-debugging)
4. [Timers y Intervals](#4-timers-y-intervals)
5. [Event Listeners](#5-event-listeners)

---

## 1. Fetch y API Calls Debugging

### 1.1 Network Tab Usage para React Apps

#### Herramientas del Browser DevTools

**Chrome DevTools - Network Tab**

```typescript
// Ejemplo de configuración de headers para debugging
const fetchWithDebug = async (url: string, options?: RequestInit) => {
  console.group(`🌐 API Call: ${url}`);
  console.log('Request Options:', options);
  console.time(`⏱️ ${url}`);
  
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        ...options?.headers,
        'X-Request-ID': crypto.randomUUID(), // Para tracking
        'X-Debug-Mode': 'true',
      },
    });
    
    console.log('Response Status:', response.status);
    console.log('Response Headers:', Object.fromEntries(response.headers));
    console.timeEnd(`⏱️ ${url}`);
    
    return response;
  } catch (error) {
    console.error('Fetch Error:', error);
    console.timeEnd(`⏱️ ${url}`);
    throw error;
  } finally {
    console.groupEnd();
  }
};
```

**Network Tab Features Esenciales:**

1. **Filter by Type**: XHR, Fetch, WS
2. **Throttling**: Simular conexiones lentas (Fast 3G, Slow 3G)
3. **Preserve Log**: Mantener logs entre navegaciones
4. **Disable Cache**: Forzar nuevas requests
5. **Copy as cURL**: Reproducir requests en terminal

---

### 1.2 Request/Response Inspection

#### Debugging con Interceptores

**❌ Bug Común: No verificar response.ok con fetch**

```typescript
// 🚩 MAL - fetch no lanza error en 404, 500, etc.
const fetchUser = async (id: string) => {
  const response = await fetch(`/api/users/${id}`);
  const data = await response.json(); // ⚠️ Puede fallar si response.ok es false
  return data;
};
```

**✅ Solución Correcta:**

```typescript
const fetchUser = async (id: string) => {
  const response = await fetch(`/api/users/${id}`);
  
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  
  const data = await response.json();
  return data;
};

// Con TanStack Query
useQuery({
  queryKey: ['user', userId],
  queryFn: async () => {
    const response = await fetch(`/api/users/${userId}`);
    
    // ✅ TanStack Query detecta errores lanzados
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    
    return response.json();
  },
});
```

#### Axios - Manejo Automático de Errores

```typescript
import axios from 'axios';

// ✅ Axios lanza error automáticamente si status no es 2xx
const axiosInstance = axios.create({
  baseURL: '/api',
  timeout: 10000,
});

// Request Interceptor
axiosInstance.interceptors.request.use(
  (config) => {
    console.log('📤 Request:', {
      method: config.method?.toUpperCase(),
      url: config.url,
      headers: config.headers,
      data: config.data,
    });
    return config;
  },
  (error) => {
    console.error('❌ Request Error:', error);
    return Promise.reject(error);
  }
);

// Response Interceptor
axiosInstance.interceptors.response.use(
  (response) => {
    console.log('📥 Response:', {
      status: response.status,
      data: response.data,
      headers: response.headers,
    });
    return response;
  },
  (error) => {
    if (error.response) {
      // ✅ Servidor respondió con status fuera de 2xx
      console.error('❌ Response Error:', {
        status: error.response.status,
        data: error.response.data,
        headers: error.response.headers,
      });
    } else if (error.request) {
      // ✅ Request enviado pero sin respuesta
      console.error('❌ No Response:', error.request);
    } else {
      // ✅ Error al configurar request
      console.error('❌ Request Setup Error:', error.message);
    }
    
    console.log('Error Config:', error.config);
    return Promise.reject(error);
  }
);
```

---

### 1.3 CORS Errors Debugging

#### Errores CORS Comunes

**❌ Bug: CORS Error en desarrollo**

```
Access to fetch at 'https://api.example.com/data' from origin 'http://localhost:5173' 
has been blocked by CORS policy: No 'Access-Control-Allow-Origin' header is present 
on the requested resource.
```

**✅ Soluciones:**

**1. Vite Proxy (Desarrollo)**

```typescript
// vite.config.ts
import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    proxy: {
      '/api': {
        target: 'https://api.example.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
        configure: (proxy, _options) => {
          proxy.on('error', (err, _req, _res) => {
            console.log('🔴 Proxy Error:', err);
          });
          proxy.on('proxyReq', (proxyReq, req, _res) => {
            console.log('📤 Proxying:', req.method, req.url);
          });
          proxy.on('proxyRes', (proxyRes, req, _res) => {
            console.log('📥 Proxy Response:', proxyRes.statusCode, req.url);
          });
        },
      },
    },
  },
});
```

**2. Backend Headers (Producción)**

```typescript
// Express.js ejemplo
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', process.env.ALLOWED_ORIGIN || '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.header('Access-Control-Allow-Credentials', 'true');
  
  // Preflight request
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  
  next();
});
```

**3. Debugging CORS en DevTools**

```typescript
// Verificar headers de respuesta
fetch('https://api.example.com/data', {
  method: 'GET',
  headers: {
    'Content-Type': 'application/json',
  },
})
  .then(response => {
    // ✅ Inspeccionar headers CORS
    console.log('CORS Headers:', {
      'access-control-allow-origin': response.headers.get('access-control-allow-origin'),
      'access-control-allow-credentials': response.headers.get('access-control-allow-credentials'),
      'access-control-allow-methods': response.headers.get('access-control-allow-methods'),
    });
    return response.json();
  });
```

---

### 1.4 Authentication Errors (401/403)

#### Manejo de Autenticación con Interceptores

**❌ Bug: Token expirado sin manejo**

```typescript
// 🚩 Sin manejo de token refresh
const fetchProtectedData = async () => {
  const token = localStorage.getItem('token');
  const response = await fetch('/api/protected', {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  // ⚠️ Falla si token expiró
  return response.json();
};
```

**✅ Solución: Auto-refresh con Axios**

```typescript
import axios from 'axios';

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: unknown) => void;
  reject: (reason?: any) => void;
}> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  
  failedQueue = [];
};

const api = axios.create({
  baseURL: '/api',
});

// Request Interceptor - Adjuntar token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor - Auto-refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // ✅ Detectar 401 y retry
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // ✅ Encolar requests mientras se refresca
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(token => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch(err => Promise.reject(err));
      }
      
      originalRequest._retry = true;
      isRefreshing = true;
      
      try {
        const refreshToken = localStorage.getItem('refreshToken');
        const { data } = await axios.post('/api/auth/refresh', {
          refreshToken,
        });
        
        const { token: newToken } = data;
        localStorage.setItem('token', newToken);
        
        // ✅ Procesar requests encolados
        processQueue(null, newToken);
        
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        
        // ✅ Redirect a login si refresh falla
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login';
        
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }
    
    // ✅ 403 - Sin permisos
    if (error.response?.status === 403) {
      console.error('❌ Forbidden:', error.response.data);
      // Mostrar mensaje o redirect
    }
    
    return Promise.reject(error);
  }
);

export default api;
```

---

### 1.5 Timeout y Retry Strategies

#### Configuración de Timeouts

**❌ Bug: Sin timeout**

```typescript
// 🚩 Request puede colgar indefinidamente
const fetchData = async () => {
  const response = await fetch('/api/slow-endpoint');
  return response.json();
};
```

**✅ Solución: AbortSignal con timeout**

```typescript
// Helper para crear AbortSignal con timeout
function createAbortSignal(timeoutMs: number): AbortSignal {
  const abortController = new AbortController();
  setTimeout(() => abortController.abort(), timeoutMs);
  return abortController.signal;
}

// Uso con fetch
const fetchWithTimeout = async (url: string, timeoutMs = 5000) => {
  try {
    const response = await fetch(url, {
      signal: createAbortSignal(timeoutMs),
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error(`Request timeout after ${timeoutMs}ms`);
    }
    throw error;
  }
};

// Con TanStack Query
useQuery({
  queryKey: ['data'],
  queryFn: async ({ signal }) => {
    // ✅ TanStack Query pasa signal automáticamente
    const response = await fetch('/api/data', {
      signal, // Cancela automáticamente en unmount
    });
    
    if (!response.ok) throw new Error('Network error');
    return response.json();
  },
  retry: 3, // ✅ Reintentos automáticos
  retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000), // Exponential backoff
});
```

#### Retry Strategy con Exponential Backoff

```typescript
interface RetryConfig {
  maxRetries: number;
  initialDelay: number;
  maxDelay: number;
  backoffMultiplier: number;
  retryableStatuses: number[];
}

const defaultRetryConfig: RetryConfig = {
  maxRetries: 3,
  initialDelay: 1000,
  maxDelay: 30000,
  backoffMultiplier: 2,
  retryableStatuses: [408, 429, 500, 502, 503, 504],
};

async function fetchWithRetry<T>(
  url: string,
  options?: RequestInit,
  config: Partial<RetryConfig> = {}
): Promise<T> {
  const retryConfig = { ...defaultRetryConfig, ...config };
  let lastError: Error;
  
  for (let attempt = 0; attempt <= retryConfig.maxRetries; attempt++) {
    try {
      console.log(`🔄 Attempt ${attempt + 1}/${retryConfig.maxRetries + 1}: ${url}`);
      
      const response = await fetch(url, options);
      
      // ✅ Verificar si status es retryable
      if (!response.ok) {
        if (retryConfig.retryableStatuses.includes(response.status)) {
          throw new Error(`Retryable error: ${response.status}`);
        }
        throw new Error(`Non-retryable error: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      lastError = error as Error;
      
      // No retry si es el último intento
      if (attempt === retryConfig.maxRetries) {
        break;
      }
      
      // Calcular delay con exponential backoff
      const delay = Math.min(
        retryConfig.initialDelay * retryConfig.backoffMultiplier ** attempt,
        retryConfig.maxDelay
      );
      
      console.log(`⏳ Retrying after ${delay}ms...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw lastError!;
}

// Uso
try {
  const data = await fetchWithRetry<User>('/api/users/1', {
    headers: { 'Content-Type': 'application/json' },
  }, {
    maxRetries: 5,
    retryableStatuses: [429, 503],
  });
} catch (error) {
  console.error('❌ All retries failed:', error);
}
```

---

### 1.6 AbortSignal y Cancellation

#### Cancelación de Requests

**❌ Bug: Race condition sin cancelación**

```typescript
// 🚩 Race condition - respuestas fuera de orden
function SearchComponent() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  
  useEffect(() => {
    const fetchResults = async () => {
      const response = await fetch(`/api/search?q=${query}`);
      const data = await response.json();
      setResults(data); // ⚠️ Puede actualizar con resultados viejos
    };
    
    if (query) {
      fetchResults();
    }
  }, [query]);
  
  return (/* ... */);
}
```

**✅ Solución: AbortController**

```typescript
function SearchComponent() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  
  useEffect(() => {
    // ✅ Crear AbortController por cada request
    const abortController = new AbortController();
    
    const fetchResults = async () => {
      try {
        const response = await fetch(`/api/search?q=${query}`, {
          signal: abortController.signal,
        });
        
        if (!response.ok) throw new Error('Network error');
        
        const data = await response.json();
        setResults(data);
      } catch (error) {
        if (error instanceof Error && error.name === 'AbortError') {
          console.log('🔴 Request cancelled:', query);
          return; // ✅ No mostrar error, es esperado
        }
        console.error('❌ Fetch error:', error);
      }
    };
    
    if (query) {
      fetchResults();
    }
    
    // ✅ Cancelar request anterior en cleanup
    return () => {
      abortController.abort();
    };
  }, [query]);
  
  return (/* ... */);
}
```

**Con TanStack Query (Cancelación automática):**

```typescript
function SearchComponent() {
  const [query, setQuery] = useState('');
  
  const { data: results, isLoading } = useQuery({
    queryKey: ['search', query],
    queryFn: async ({ signal }) => {
      // ✅ TanStack Query pasa signal automáticamente
      const response = await fetch(`/api/search?q=${query}`, { signal });
      if (!response.ok) throw new Error('Network error');
      return response.json();
    },
    enabled: !!query, // Solo fetch si hay query
    staleTime: 5000, // Cache 5 segundos
  });
  
  return (/* ... */);
}
```

---

### 1.7 TanStack Query DevTools

#### Instalación y Setup

```typescript
// main.tsx
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5000,
      retry: 3,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <YourApp />
      {/* ✅ DevTools solo en desarrollo */}
      <ReactQueryDevtools initialIsOpen={false} position="bottom-right" />
    </QueryClientProvider>
  );
}
```

#### Features del DevTools

**1. Query Inspector**
- Ver estado de todas las queries (fresh, fetching, stale, inactive)
- Inspeccionar data y error de cada query
- Ver timestamps (dataUpdatedAt, errorUpdatedAt)
- Monitorear observers count

**2. Network Mode Debugging**

```typescript
// El DevTools muestra queries en estado "paused" cuando no hay conexión
const { data, status, fetchStatus } = useQuery({
  queryKey: ['todos'],
  queryFn: fetchTodos,
  networkMode: 'offlineFirst', // 'online' | 'always' | 'offlineFirst'
});

// Estados visibles en DevTools:
// - status: 'pending' | 'error' | 'success'
// - fetchStatus: 'fetching' | 'paused' | 'idle'
```

**3. Mock Offline Behavior**

El DevTools incluye un botón para simular modo offline sin afectar la conexión real del navegador. Esto permite probar:
- Queries en estado `paused`
- Comportamiento de reconexión
- Mutations que se encolan cuando no hay red

**4. Manual Query Manipulation**

Desde el DevTools puedes:
- Refetch manualmente una query
- Invalidar queries
- Reset queries al estado inicial
- Remove queries del cache

```typescript
// Comandos disponibles desde DevTools UI:
// - Refetch: queryClient.refetchQueries({ queryKey: ['todos'] })
// - Invalidate: queryClient.invalidateQueries({ queryKey: ['todos'] })
// - Reset: queryClient.resetQueries({ queryKey: ['todos'] })
// - Remove: queryClient.removeQueries({ queryKey: ['todos'] })
```

---

### 1.8 Testing API Calls

#### Mock Service Worker (MSW)

```typescript
// mocks/handlers.ts
import { http, HttpResponse, delay } from 'msw';

export const handlers = [
  // ✅ Mock exitoso
  http.get('/api/users/:id', async ({ params }) => {
    await delay(100); // Simular latencia
    
    return HttpResponse.json({
      id: params.id,
      name: 'John Doe',
      email: 'john@example.com',
    });
  }),
  
  // ✅ Mock error 404
  http.get('/api/users/999', () => {
    return HttpResponse.json(
      { error: 'User not found' },
      { status: 404 }
    );
  }),
  
  // ✅ Mock error de red
  http.get('/api/users/network-error', () => {
    return HttpResponse.error();
  }),
  
  // ✅ Mock timeout
  http.get('/api/users/slow', async () => {
    await delay(10000); // Más que el timeout
    return HttpResponse.json({ id: 1 });
  }),
];

// mocks/browser.ts
import { setupWorker } from 'msw/browser';
import { handlers } from './handlers';

export const worker = setupWorker(...handlers);

// main.tsx
if (process.env.NODE_ENV === 'development') {
  const { worker } = await import('./mocks/browser');
  await worker.start({
    onUnhandledRequest: 'warn',
  });
}
```

#### Test con Vitest + MSW

```typescript
// __tests__/api.test.ts
import { describe, it, expect, beforeAll, afterEach, afterAll } from 'vitest';
import { setupServer } from 'msw/node';
import { http, HttpResponse } from 'msw';
import { fetchUser } from '../api';

const server = setupServer();

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('fetchUser', () => {
  it('✅ should fetch user successfully', async () => {
    server.use(
      http.get('/api/users/1', () => {
        return HttpResponse.json({ id: 1, name: 'John' });
      })
    );
    
    const user = await fetchUser('1');
    expect(user).toEqual({ id: 1, name: 'John' });
  });
  
  it('❌ should handle 404 error', async () => {
    server.use(
      http.get('/api/users/999', () => {
        return HttpResponse.json(
          { error: 'Not found' },
          { status: 404 }
        );
      })
    );
    
    await expect(fetchUser('999')).rejects.toThrow('HTTP error! status: 404');
  });
  
  it('⏱️ should handle timeout', async () => {
    server.use(
      http.get('/api/users/1', async () => {
        await delay(6000); // Más que timeout de 5000ms
        return HttpResponse.json({ id: 1 });
      })
    );
    
    await expect(fetchUser('1')).rejects.toThrow('Request timeout');
  });
  
  it('🔄 should retry on 503', async () => {
    let attempts = 0;
    
    server.use(
      http.get('/api/users/1', () => {
        attempts++;
        if (attempts < 3) {
          return HttpResponse.json(
            { error: 'Service unavailable' },
            { status: 503 }
          );
        }
        return HttpResponse.json({ id: 1, name: 'John' });
      })
    );
    
    const user = await fetchUser('1');
    expect(attempts).toBe(3);
    expect(user).toEqual({ id: 1, name: 'John' });
  });
});
```

---

### 1.9 React Query Error Handling Avanzado

#### Retry Strategy con Función Personalizada

```typescript
// ✅ Retry condicional basado en el error
const { data, error } = useQuery({
  queryKey: ['user', userId],
  queryFn: fetchUser,
  retry: (failureCount, error) => {
    // No retry en errores 404
    if (error instanceof Error && error.message.includes('404')) {
      return false;
    }
    
    // Máximo 3 reintentos para otros errores
    return failureCount < 3;
  },
  retryDelay: (attemptIndex) => {
    // Exponential backoff: 1s, 2s, 4s, 8s...
    return Math.min(1000 * 2 ** attemptIndex, 30000);
  },
});
```

#### Error Logging y Tracking

```typescript
// ✅ Global error handler
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 3,
      onError: (error) => {
        console.error('❌ Query error:', error);
        // Enviar a Sentry, LogRocket, etc.
        // Sentry.captureException(error);
      },
    },
    mutations: {
      retry: 1,
      onError: (error, variables, context) => {
        console.error('❌ Mutation error:', {
          error,
          variables,
          context,
        });
        // Log mutation failures
      },
    },
  },
});
```

#### Debugging Query State con DevTools

```typescript
// ✅ Inspeccionar query state en tiempo real
function UserProfile({ userId }: { userId: string }) {
  const queryInfo = useQuery({
    queryKey: ['user', userId],
    queryFn: async () => {
      console.log('🔄 Fetching user:', userId);
      const response = await fetch(`/api/users/${userId}`);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      return response.json();
    },
    // ✅ Logging para debugging
    meta: {
      errorMessage: 'Failed to load user profile',
    },
  });
  
  // Inspeccionar estado completo
  console.log('Query State:', {
    status: queryInfo.status,
    fetchStatus: queryInfo.fetchStatus,
    data: queryInfo.data,
    error: queryInfo.error,
    failureCount: queryInfo.failureCount,
    failureReason: queryInfo.failureReason,
    isStale: queryInfo.isStale,
    isLoading: queryInfo.isLoading,
    isFetching: queryInfo.isFetching,
  });
  
  if (queryInfo.isLoading) return <div>Loading...</div>;
  if (queryInfo.error) {
    return (
      <div>
        <h3>Error loading user</h3>
        <pre>{queryInfo.error.message}</pre>
        <button onClick={() => queryInfo.refetch()}>Retry</button>
      </div>
    );
  }
  
  return <div>{queryInfo.data?.name}</div>;
}
```

#### Cancellation con AbortSignal (React Query)

```typescript
// ✅ Cancellation automático con React Query
const { data } = useQuery({
  queryKey: ['search', searchTerm],
  queryFn: async ({ signal }) => {
    console.log('🔍 Searching for:', searchTerm);
    
    // ✅ React Query pasa AbortSignal automáticamente
    const response = await fetch(`/api/search?q=${searchTerm}`, {
      signal, // Cancela request anterior cuando searchTerm cambia
    });
    
    if (!response.ok) throw new Error('Search failed');
    return response.json();
  },
  enabled: searchTerm.length > 2, // Solo buscar si hay 3+ caracteres
  staleTime: 5000, // Cache resultados por 5 segundos
});

// ✅ Cuando searchTerm cambia:
// 1. Request anterior se cancela automáticamente
// 2. Nuevo request se inicia
// 3. No hay race conditions
```

---

## 2. Promises Debugging

### 2.1 Promise Chains Debugging

#### Visualización de Promise States

**❌ Bug: Error swallowing en promise chain**

```typescript
// 🚩 Error no se propaga correctamente
fetchUser(userId)
  .then(user => {
    console.log(user);
    // ⚠️ Si esta línea falla, el error se traga
    processUser(user);
  })
  .catch(error => {
    console.error('Error:', error); // No captura errores en processUser
  });
```

**✅ Solución: Return en promise chains**

```typescript
// ✅ Propagar resultado de processUser
fetchUser(userId)
  .then(user => {
    console.log(user);
    return processUser(user); // ✅ Return promise
  })
  .then(result => {
    console.log('Processed:', result);
  })
  .catch(error => {
    console.error('Error:', error); // ✅ Captura todos los errores
  });
```

#### Debugging con Promise State Tracker

```typescript
// Wrapper para debugging de promises
function debugPromise<T>(
  promise: Promise<T>,
  label: string
): Promise<T> {
  console.log(`🟡 [${label}] Pending...`);
  
  return promise
    .then(value => {
      console.log(`✅ [${label}] Fulfilled:`, value);
      return value;
    })
    .catch(error => {
      console.error(`❌ [${label}] Rejected:`, error);
      throw error;
    });
}

// Uso
debugPromise(fetchUser('1'), 'Fetch User')
  .then(user => debugPromise(processUser(user), 'Process User'))
  .then(result => debugPromise(saveUser(result), 'Save User'))
  .catch(error => {
    console.error('❌ Final error:', error);
  });
```

---

### 2.2 Async/Await Error Handling

**❌ Bug: Sin try-catch en async**

```typescript
// 🚩 Error no manejado - app crashea
async function loadUserData() {
  const user = await fetchUser(userId); // ⚠️ Puede fallar
  const posts = await fetchPosts(user.id); // ⚠️ Puede fallar
  return { user, posts };
}
```

**✅ Solución: Try-catch correcto**

```typescript
async function loadUserData(): Promise<UserData | null> {
  try {
    const user = await fetchUser(userId);
    const posts = await fetchPosts(user.id);
    return { user, posts };
  } catch (error) {
    if (error instanceof NetworkError) {
      console.error('❌ Network error:', error.message);
      // Retry logic
    } else if (error instanceof ValidationError) {
      console.error('❌ Validation error:', error.message);
      // User feedback
    } else {
      console.error('❌ Unexpected error:', error);
      // Error tracking (Sentry, etc.)
    }
    return null;
  }
}
```

#### Error Boundaries para Async Errors

```typescript
// React Error Boundary
class AsyncErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  
  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }
  
  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('❌ Async Error Boundary:', error, errorInfo);
    // Log to error tracking service
  }
  
  render() {
    if (this.state.hasError) {
      return (
        <div>
          <h2>Something went wrong.</h2>
          <details>
            <summary>Error details</summary>
            <pre>{this.state.error?.message}</pre>
          </details>
        </div>
      );
    }
    
    return this.props.children;
  }
}

// Con TanStack Query throwOnError
function UserProfile() {
  const { data: user } = useQuery({
    queryKey: ['user', userId],
    queryFn: fetchUser,
    throwOnError: true, // ✅ Lanza error a Error Boundary
  });
  
  return <div>{user.name}</div>;
}

// App
<AsyncErrorBoundary>
  <UserProfile />
</AsyncErrorBoundary>
```

---

### 2.3 Unhandled Rejections

#### Detectar Unhandled Rejections

**❌ Bug: Promise rejection sin handler**

```typescript
// 🚩 Unhandled rejection warning
function dangerousFunction() {
  Promise.reject(new Error('Something failed'));
  // ⚠️ No .catch() - browser warning
}
```

**✅ Solución: Global handlers**

```typescript
// main.tsx
window.addEventListener('unhandledrejection', (event) => {
  console.error('❌ Unhandled Promise Rejection:', {
    reason: event.reason,
    promise: event.promise,
  });
  
  // ✅ Log to error tracking
  // Sentry.captureException(event.reason);
  
  // ✅ Mostrar UI de error
  toast.error('An unexpected error occurred');
  
  // Prevenir default browser behavior
  event.preventDefault();
});

// ✅ También capturar handled rejections que se vuelven unhandled
window.addEventListener('rejectionhandled', (event) => {
  console.warn('⚠️ Promise rejection handled late:', event.promise);
});
```

#### DevTools para Unhandled Rejections

```typescript
// Debug mode con stack traces
if (process.env.NODE_ENV === 'development') {
  const originalReject = Promise.reject.bind(Promise);
  
  Promise.reject = function<T = never>(reason?: any): Promise<T> {
    console.error('🔴 Promise.reject called:', {
      reason,
      stack: new Error().stack,
    });
    return originalReject(reason);
  };
}
```

---

### 2.4 Promise.all/race/allSettled Debugging

#### Promise.all - Fail fast

**❌ Bug: Un error cancela todas**

```typescript
// 🚩 Si fetchPosts falla, fetchComments se cancela
async function loadData() {
  try {
    const [user, posts, comments] = await Promise.all([
      fetchUser(userId),
      fetchPosts(userId), // ⚠️ Si falla aquí
      fetchComments(userId), // ⚠️ Esta se cancela
    ]);
    return { user, posts, comments };
  } catch (error) {
    console.error('Error:', error);
    return null;
  }
}
```

**✅ Solución: Promise.allSettled**

```typescript
async function loadData() {
  const results = await Promise.allSettled([
    fetchUser(userId),
    fetchPosts(userId),
    fetchComments(userId),
  ]);
  
  // ✅ Analizar cada resultado individualmente
  const [userResult, postsResult, commentsResult] = results;
  
  console.log('Results:', {
    user: userResult.status === 'fulfilled' ? userResult.value : null,
    posts: postsResult.status === 'fulfilled' ? postsResult.value : [],
    comments: commentsResult.status === 'fulfilled' ? commentsResult.value : [],
  });
  
  // ✅ Logging de errores
  results.forEach((result, index) => {
    if (result.status === 'rejected') {
      const names = ['user', 'posts', 'comments'];
      console.error(`❌ Failed to load ${names[index]}:`, result.reason);
    }
  });
  
  return {
    user: userResult.status === 'fulfilled' ? userResult.value : null,
    posts: postsResult.status === 'fulfilled' ? postsResult.value : [],
    comments: commentsResult.status === 'fulfilled' ? commentsResult.value : [],
  };
}
```

#### Promise.race Debugging

```typescript
// ✅ Race con timeout
async function fetchWithRaceTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number
): Promise<T> {
  const timeout = new Promise<never>((_, reject) => {
    setTimeout(() => {
      reject(new Error(`Timeout after ${timeoutMs}ms`));
    }, timeoutMs);
  });
  
  return Promise.race([promise, timeout]);
}

// Uso
try {
  const data = await fetchWithRaceTimeout(
    fetchSlowEndpoint(),
    5000
  );
  console.log('✅ Data loaded:', data);
} catch (error) {
  if (error instanceof Error && error.message.includes('Timeout')) {
    console.error('⏱️ Request timed out');
  } else {
    console.error('❌ Request failed:', error);
  }
}
```

---

### 2.5 Race Conditions

**React Docs: Cleanup Pattern con ignore flag**

El patrón oficial de React para prevenir race conditions usa una flag `ignore` en el cleanup de `useEffect`:

**❌ Bug: Race condition en búsqueda**

```typescript
// 🚩 Resultados fuera de orden
function SearchResults() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  
  useEffect(() => {
    async function search() {
      const data = await fetchSearch(query);
      setResults(data); // ⚠️ Puede actualizar con query viejo
    }
    
    if (query) {
      search();
    }
  }, [query]);
  
  return (/* ... */);
}
```

**✅ Solución 1: Ignore flag (React Official Pattern)**

```typescript
// ✅ Patrón oficial de React para data fetching
function SearchResults() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  
  useEffect(() => {
    let ignore = false; // ✅ Flag para ignorar respuestas viejas
    
    async function search() {
      const data = await fetchSearch(query);
      
      // ✅ Solo actualizar si el Effect no se limpió
      if (!ignore) {
        setResults(data);
      } else {
        console.log('🔴 Ignored stale result for:', query);
      }
    }
    
    if (query) {
      search();
    }
    
    // ✅ Cleanup: marcar como stale
    return () => {
      ignore = true;
    };
  }, [query]);
  
  return (/* ... */);
}

// Ejemplo de React Docs con planetas:
function Page() {
  const [planetList, setPlanetList] = useState([]);
  const [planetId, setPlanetId] = useState('');
  const [placeList, setPlaceList] = useState([]);
  const [placeId, setPlaceId] = useState('');
  
  // ✅ Efecto 1: Cargar planetas
  useEffect(() => {
    let ignore = false;
    
    fetchData('/planets').then(result => {
      if (!ignore) {
        console.log('Fetched a list of planets.');
        setPlanetList(result);
        setPlanetId(result[0].id);
      }
    });
    
    return () => {
      ignore = true;
    };
  }, []);
  
  // ✅ Efecto 2: Cargar lugares del planeta
  useEffect(() => {
    if (planetId === '') return;
    
    let ignore = false;
    
    fetchData(`/planets/${planetId}/places`).then(result => {
      if (!ignore) {
        console.log(`Fetched places on "${planetId}".`);
        setPlaceList(result);
        setPlaceId(result[0].id);
      }
    });
    
    return () => {
      ignore = true;
    };
  }, [planetId]);
  
  return (/* ... */);
}
```

**✅ Solución 2: AbortController**

```typescript
function SearchResults() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  
  useEffect(() => {
    const abortController = new AbortController();
    
    async function search() {
      try {
        const data = await fetchSearch(query, {
          signal: abortController.signal,
        });
        setResults(data);
      } catch (error) {
        if (error instanceof Error && error.name === 'AbortError') {
          console.log('🔴 Cancelled search for:', query);
          return;
        }
        console.error('❌ Search error:', error);
      }
    }
    
    if (query) {
      search();
    }
    
    return () => {
      abortController.abort();
    };
  }, [query]);
  
  return (/* ... */);
}
```

**✅ Solución 3: TanStack Query (automático)**

```typescript
function SearchResults() {
  const [query, setQuery] = useState('');
  
  const { data: results } = useQuery({
    queryKey: ['search', query],
    queryFn: ({ signal }) => fetchSearch(query, { signal }),
    enabled: !!query,
    staleTime: 5000,
  });
  // ✅ TanStack Query maneja race conditions automáticamente
  
  return (/* ... */);
}
```

---

### 2.6 Testing Promises

```typescript
// __tests__/promises.test.ts
import { describe, it, expect, vi } from 'vitest';

describe('Promise error handling', () => {
  it('✅ should handle resolved promise', async () => {
    const promise = Promise.resolve('success');
    await expect(promise).resolves.toBe('success');
  });
  
  it('❌ should handle rejected promise', async () => {
    const promise = Promise.reject(new Error('failed'));
    await expect(promise).rejects.toThrow('failed');
  });
  
  it('⏱️ should timeout long-running promise', async () => {
    const slowPromise = new Promise((resolve) => {
      setTimeout(() => resolve('done'), 10000);
    });
    
    const timeout = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('timeout')), 100);
    });
    
    await expect(Promise.race([slowPromise, timeout])).rejects.toThrow('timeout');
  });
  
  it('🔄 should handle Promise.allSettled', async () => {
    const results = await Promise.allSettled([
      Promise.resolve('success'),
      Promise.reject(new Error('failed')),
      Promise.resolve('also success'),
    ]);
    
    expect(results[0]).toEqual({ status: 'fulfilled', value: 'success' });
    expect(results[1]).toEqual({ status: 'rejected', reason: expect.any(Error) });
    expect(results[2]).toEqual({ status: 'fulfilled', value: 'also success' });
  });
});
```

---

## 3. WebSockets Debugging

### 3.1 Connection State Tracking

#### WebSocket State Machine

```typescript
type WSState = 'connecting' | 'connected' | 'disconnected' | 'reconnecting' | 'error';

class WebSocketClient {
  private ws: WebSocket | null = null;
  private state: WSState = 'disconnected';
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  
  constructor(private url: string) {}
  
  connect() {
    if (this.state === 'connected' || this.state === 'connecting') {
      console.warn('⚠️ Already connected or connecting');
      return;
    }
    
    this.setState('connecting');
    console.log('🔄 Connecting to WebSocket:', this.url);
    
    this.ws = new WebSocket(this.url);
    
    this.ws.onopen = () => {
      this.setState('connected');
      this.reconnectAttempts = 0;
      console.log('✅ WebSocket connected');
    };
    
    this.ws.onclose = (event) => {
      console.log('🔴 WebSocket closed:', {
        code: event.code,
        reason: event.reason,
        wasClean: event.wasClean,
      });
      
      this.setState('disconnected');
      this.handleReconnect();
    };
    
    this.ws.onerror = (error) => {
      console.error('❌ WebSocket error:', error);
      this.setState('error');
    };
    
    this.ws.onmessage = (event) => {
      this.handleMessage(event.data);
    };
  }
  
  private setState(state: WSState) {
    console.log(`🔄 State: ${this.state} → ${state}`);
    this.state = state;
  }
  
  private handleReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('❌ Max reconnect attempts reached');
      return;
    }
    
    this.setState('reconnecting');
    this.reconnectAttempts++;
    
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);
    console.log(`⏳ Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
    
    setTimeout(() => {
      this.connect();
    }, delay);
  }
  
  private handleMessage(data: string) {
    try {
      const message = JSON.parse(data);
      console.log('📥 Message received:', message);
    } catch (error) {
      console.error('❌ Failed to parse message:', data);
    }
  }
  
  send(data: any) {
    if (this.state !== 'connected') {
      console.error('❌ Cannot send: WebSocket not connected');
      return;
    }
    
    try {
      const message = JSON.stringify(data);
      this.ws?.send(message);
      console.log('📤 Message sent:', data);
    } catch (error) {
      console.error('❌ Failed to send message:', error);
    }
  }
  
  disconnect() {
    if (this.ws) {
      this.ws.close(1000, 'Client disconnect');
      this.ws = null;
    }
  }
  
  getState(): WSState {
    return this.state;
  }
}
```

---

### 3.2 Message Flow Debugging

```typescript
// WebSocket con logging detallado
class DebugWebSocketClient extends WebSocketClient {
  private messageLog: Array<{
    timestamp: number;
    direction: 'sent' | 'received';
    data: any;
  }> = [];
  
  private logMessage(direction: 'sent' | 'received', data: any) {
    const entry = {
      timestamp: Date.now(),
      direction,
      data,
    };
    
    this.messageLog.push(entry);
    
    console.log(`${direction === 'sent' ? '📤' : '📥'} [${new Date(entry.timestamp).toISOString()}]`, data);
  }
  
  send(data: any) {
    this.logMessage('sent', data);
    super.send(data);
  }
  
  private handleMessage(data: string) {
    const parsed = JSON.parse(data);
    this.logMessage('received', parsed);
    super.handleMessage(data);
  }
  
  getMessageLog() {
    return this.messageLog;
  }
  
  exportLog() {
    const log = this.messageLog.map(entry => ({
      ...entry,
      timestamp: new Date(entry.timestamp).toISOString(),
    }));
    
    const blob = new Blob([JSON.stringify(log, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `websocket-log-${Date.now()}.json`;
    a.click();
  }
}
```

---

### 3.3 Memory Leaks con WebSockets

**❌ Bug: WebSocket no cerrado**

```typescript
// 🚩 Memory leak - WebSocket nunca se cierra
function ChatComponent() {
  const [messages, setMessages] = useState([]);
  
  useEffect(() => {
    const ws = new WebSocket('ws://localhost:3000');
    
    ws.onmessage = (event) => {
      setMessages(prev => [...prev, event.data]);
    };
    
    // ⚠️ Sin cleanup - WebSocket queda abierto
  }, []);
  
  return (/* ... */);
}
```

**✅ Solución: Cleanup en useEffect**

```typescript
function ChatComponent() {
  const [messages, setMessages] = useState([]);
  
  useEffect(() => {
    console.log('🔄 Setting up WebSocket');
    const ws = new WebSocket('ws://localhost:3000');
    
    ws.onopen = () => {
      console.log('✅ WebSocket connected');
    };
    
    ws.onmessage = (event) => {
      setMessages(prev => [...prev, event.data]);
    };
    
    ws.onerror = (error) => {
      console.error('❌ WebSocket error:', error);
    };
    
    ws.onclose = () => {
      console.log('🔴 WebSocket closed');
    };
    
    // ✅ Cleanup function
    return () => {
      console.log('🧹 Cleaning up WebSocket');
      if (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING) {
        ws.close(1000, 'Component unmount');
      }
    };
  }, []);
  
  return (/* ... */);
}
```

---

### 3.4 DevTools para WebSocket

#### Chrome DevTools - WS Tab

```typescript
// Agregar metadata a mensajes para debugging
class TrackedWebSocket {
  private ws: WebSocket;
  private messageId = 0;
  
  constructor(url: string) {
    this.ws = new WebSocket(url);
    
    // ✅ Interceptar mensajes para agregar ID
    this.ws.addEventListener('message', (event) => {
      console.log(`📥 Message #${++this.messageId}:`, {
        data: event.data,
        timestamp: new Date().toISOString(),
        origin: event.origin,
      });
    });
  }
  
  send(data: any) {
    const enriched = {
      ...data,
      _metadata: {
        id: ++this.messageId,
        timestamp: Date.now(),
        userAgent: navigator.userAgent,
      },
    };
    
    console.log(`📤 Sending #${this.messageId}:`, enriched);
    this.ws.send(JSON.stringify(enriched));
  }
}
```

**Herramientas de terceros:**

1. **Websocket King**: Chrome extension para testing
2. **wscat**: CLI tool para testing WebSockets
3. **Postman**: Soporte para WebSocket requests

```bash
# wscat usage
npm install -g wscat
wscat -c ws://localhost:3000
# > {"type": "ping"}
# < {"type": "pong"}
```

---

### 3.5 Testing WebSockets

```typescript
// __tests__/websocket.test.ts
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import WS from 'jest-websocket-mock';

describe('WebSocket Client', () => {
  let server: WS;
  let client: WebSocketClient;
  
  beforeEach(() => {
    server = new WS('ws://localhost:3000');
  });
  
  afterEach(() => {
    client?.disconnect();
    WS.clean();
  });
  
  it('✅ should connect successfully', async () => {
    client = new WebSocketClient('ws://localhost:3000');
    client.connect();
    
    await server.connected;
    expect(client.getState()).toBe('connected');
  });
  
  it('📤 should send messages', async () => {
    client = new WebSocketClient('ws://localhost:3000');
    client.connect();
    await server.connected;
    
    client.send({ type: 'test', data: 'hello' });
    
    await expect(server).toReceiveMessage(
      JSON.stringify({ type: 'test', data: 'hello' })
    );
  });
  
  it('📥 should receive messages', async () => {
    const onMessage = vi.fn();
    client = new WebSocketClient('ws://localhost:3000');
    client.on('message', onMessage);
    client.connect();
    
    await server.connected;
    
    server.send(JSON.stringify({ type: 'notification', message: 'hi' }));
    
    expect(onMessage).toHaveBeenCalledWith({
      type: 'notification',
      message: 'hi',
    });
  });
  
  it('🔄 should reconnect on disconnect', async () => {
    client = new WebSocketClient('ws://localhost:3000');
    client.connect();
    
    await server.connected;
    
    server.close();
    
    // Wait for reconnect
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    await server.connected;
    expect(client.getState()).toBe('connected');
  });
});
```

---

## 4. Timers y Intervals

### 4.1 setTimeout/setInterval Tracking

**❌ Bug: Timer no limpiado**

```typescript
// 🚩 Memory leak - timer nunca se limpia
function CountdownComponent() {
  const [count, setCount] = useState(10);
  
  useEffect(() => {
    setInterval(() => {
      setCount(prev => prev - 1);
    }, 1000);
    
    // ⚠️ Sin cleanup - interval sigue corriendo
  }, []);
  
  return <div>{count}</div>;
}
```

**✅ Solución: Cleanup timers**

```typescript
function CountdownComponent() {
  const [count, setCount] = useState(10);
  
  useEffect(() => {
    console.log('⏱️ Starting countdown');
    
    const intervalId = setInterval(() => {
      setCount(prev => {
        if (prev <= 1) {
          clearInterval(intervalId); // ✅ Auto-cleanup cuando llega a 0
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    // ✅ Cleanup en unmount
    return () => {
      console.log('🧹 Cleaning up countdown');
      clearInterval(intervalId);
    };
  }, []);
  
  return <div>{count}</div>;
}
```

---

### 4.2 Timer Tracking Tool

```typescript
// Debug wrapper para timers
class TimerManager {
  private timers = new Map<number, {
    type: 'timeout' | 'interval';
    callback: Function;
    delay: number;
    createdAt: number;
    stack: string;
  }>();
  
  private nextId = 1;
  
  setTimeout(callback: Function, delay: number): number {
    const id = this.nextId++;
    
    this.timers.set(id, {
      type: 'timeout',
      callback,
      delay,
      createdAt: Date.now(),
      stack: new Error().stack || '',
    });
    
    console.log(`⏱️ setTimeout #${id} created (${delay}ms)`);
    
    const wrappedCallback = () => {
      console.log(`✅ setTimeout #${id} executed`);
      this.timers.delete(id);
      callback();
    };
    
    const timerId = window.setTimeout(wrappedCallback, delay);
    return id;
  }
  
  setInterval(callback: Function, delay: number): number {
    const id = this.nextId++;
    
    this.timers.set(id, {
      type: 'interval',
      callback,
      delay,
      createdAt: Date.now(),
      stack: new Error().stack || '',
    });
    
    console.log(`🔄 setInterval #${id} created (${delay}ms)`);
    
    let execCount = 0;
    const wrappedCallback = () => {
      execCount++;
      console.log(`🔄 setInterval #${id} executed (count: ${execCount})`);
      callback();
    };
    
    const timerId = window.setInterval(wrappedCallback, delay);
    return id;
  }
  
  clearTimeout(id: number) {
    const timer = this.timers.get(id);
    if (timer && timer.type === 'timeout') {
      console.log(`🧹 Cleared setTimeout #${id}`);
      this.timers.delete(id);
    }
  }
  
  clearInterval(id: number) {
    const timer = this.timers.get(id);
    if (timer && timer.type === 'interval') {
      console.log(`🧹 Cleared setInterval #${id}`);
      this.timers.delete(id);
    }
  }
  
  getActiveTimers() {
    return Array.from(this.timers.entries()).map(([id, timer]) => ({
      id,
      ...timer,
      age: Date.now() - timer.createdAt,
    }));
  }
  
  clearAll() {
    console.log(`🧹 Clearing ${this.timers.size} active timers`);
    this.timers.clear();
  }
  
  logActiveTimers() {
    const active = this.getActiveTimers();
    console.table(active.map(t => ({
      id: t.id,
      type: t.type,
      delay: t.delay,
      age: `${t.age}ms`,
    })));
  }
}

// Uso global en desarrollo
if (process.env.NODE_ENV === 'development') {
  window.timerManager = new TimerManager();
  
  // Exponer en consola
  console.log('💡 Timer debugging enabled. Use window.timerManager.logActiveTimers()');
}
```

---

### 4.3 Timing Issues y Drift

**❌ Bug: Clock drift con setInterval**

```typescript
// 🚩 Drift acumulativo - se desfasa con el tiempo
function ClockComponent() {
  const [time, setTime] = useState(new Date());
  
  useEffect(() => {
    const intervalId = setInterval(() => {
      setTime(new Date()); // ⚠️ Puede desfasarse varios segundos
    }, 1000);
    
    return () => clearInterval(intervalId);
  }, []);
  
  return <div>{time.toLocaleTimeString()}</div>;
}
```

**✅ Solución: Self-correcting timer**

```typescript
function ClockComponent() {
  const [time, setTime] = useState(new Date());
  
  useEffect(() => {
    let timeoutId: number;
    
    const tick = () => {
      const now = new Date();
      setTime(now);
      
      // ✅ Calcular próximo tick para alinearse con el segundo
      const nextTick = 1000 - (now.getMilliseconds());
      
      timeoutId = window.setTimeout(tick, nextTick);
    };
    
    tick(); // Inicial
    
    return () => {
      clearTimeout(timeoutId);
    };
  }, []);
  
  return <div>{time.toLocaleTimeString()}</div>;
}
```

---

### 4.4 requestAnimationFrame Debugging

```typescript
// ✅ Animation loop con debugging
function useAnimationFrame(callback: (deltaTime: number) => void) {
  const requestRef = useRef<number>();
  const previousTimeRef = useRef<number>();
  const frameCountRef = useRef(0);
  
  useEffect(() => {
    const animate = (time: number) => {
      if (previousTimeRef.current !== undefined) {
        const deltaTime = time - previousTimeRef.current;
        frameCountRef.current++;
        
        // ✅ Log performance cada 60 frames
        if (frameCountRef.current % 60 === 0) {
          const fps = 1000 / deltaTime;
          console.log(`🎬 FPS: ${fps.toFixed(2)}`);
        }
        
        callback(deltaTime);
      }
      
      previousTimeRef.current = time;
      requestRef.current = requestAnimationFrame(animate);
    };
    
    requestRef.current = requestAnimationFrame(animate);
    
    // ✅ Cleanup
    return () => {
      if (requestRef.current) {
        console.log('🧹 Cancelling animation frame');
        cancelAnimationFrame(requestRef.current);
      }
    };
  }, [callback]);
}

// Uso
function AnimatedComponent() {
  const [position, setPosition] = useState(0);
  
  useAnimationFrame((deltaTime) => {
    setPosition(prev => prev + (deltaTime * 0.1)); // Move 0.1px per ms
  });
  
  return <div style={{ transform: `translateX(${position}px)` }}>Moving</div>;
}
```

---

### 4.5 Testing Timers

```typescript
// __tests__/timers.test.ts
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

describe('Timer cleanup', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  
  afterEach(() => {
    vi.restoreAllMocks();
  });
  
  it('✅ should clean up setTimeout', () => {
    const callback = vi.fn();
    
    const { unmount } = render(<ComponentWithTimeout callback={callback} />);
    
    // Fast-forward time
    vi.advanceTimersByTime(500);
    expect(callback).not.toHaveBeenCalled();
    
    // Unmount before timeout
    unmount();
    
    // Fast-forward remaining time
    vi.advanceTimersByTime(500);
    
    // ✅ Callback no debería ejecutarse
    expect(callback).not.toHaveBeenCalled();
  });
  
  it('✅ should clean up setInterval', () => {
    const callback = vi.fn();
    
    const { unmount } = render(<ComponentWithInterval callback={callback} />);
    
    vi.advanceTimersByTime(3000);
    expect(callback).toHaveBeenCalledTimes(3);
    
    unmount();
    
    vi.advanceTimersByTime(2000);
    
    // ✅ No más llamadas después de unmount
    expect(callback).toHaveBeenCalledTimes(3);
  });
  
  it('⏱️ should handle timer drift correction', () => {
    const callback = vi.fn();
    
    render(<SelfCorrectingTimer callback={callback} />);
    
    // Simular drift
    vi.advanceTimersByTime(1050);
    expect(callback).toHaveBeenCalledTimes(1);
    
    // Siguiente tick debería corregir (950ms en vez de 1000ms)
    vi.advanceTimersByTime(950);
    expect(callback).toHaveBeenCalledTimes(2);
  });
});
```

---

## 5. Event Listeners

### 5.1 addEventListener Debugging

**❌ Bug: Event listener no removido**

```typescript
// 🚩 Memory leak - listener nunca se remueve
function ScrollTracker() {
  const [scrollY, setScrollY] = useState(0);
  
  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };
    
    window.addEventListener('scroll', handleScroll);
    
    // ⚠️ Sin cleanup
  }, []);
  
  return <div>Scroll: {scrollY}px</div>;
}
```

**✅ Solución: removeEventListener**

```typescript
function ScrollTracker() {
  const [scrollY, setScrollY] = useState(0);
  
  useEffect(() => {
    console.log('📌 Adding scroll listener');
    
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    
    // ✅ Cleanup
    return () => {
      console.log('🧹 Removing scroll listener');
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);
  
  return <div>Scroll: {scrollY}px</div>;
}
```

---

### 5.2 Event Listener Tracker

```typescript
// Debug tool para event listeners
class EventListenerTracker {
  private listeners = new Map<string, Array<{
    element: EventTarget;
    type: string;
    listener: EventListener;
    options?: AddEventListenerOptions;
    stack: string;
  }>>();
  
  private nextId = 1;
  
  addEventListener(
    element: EventTarget,
    type: string,
    listener: EventListener,
    options?: AddEventListenerOptions
  ): string {
    const id = `listener-${this.nextId++}`;
    
    const entry = {
      element,
      type,
      listener,
      options,
      stack: new Error().stack || '',
    };
    
    if (!this.listeners.has(type)) {
      this.listeners.set(type, []);
    }
    
    this.listeners.get(type)!.push(entry);
    
    console.log(`📌 Added ${type} listener #${id}`, {
      element: this.getElementName(element),
      options,
    });
    
    element.addEventListener(type, listener, options);
    
    return id;
  }
  
  removeEventListener(
    element: EventTarget,
    type: string,
    listener: EventListener
  ) {
    const listeners = this.listeners.get(type);
    if (!listeners) return;
    
    const index = listeners.findIndex(
      l => l.element === element && l.listener === listener
    );
    
    if (index !== -1) {
      listeners.splice(index, 1);
      console.log(`🧹 Removed ${type} listener`, {
        element: this.getElementName(element),
      });
    }
    
    element.removeEventListener(type, listener);
  }
  
  private getElementName(element: EventTarget): string {
    if (element === window) return 'window';
    if (element === document) return 'document';
    if (element instanceof HTMLElement) {
      return `<${element.tagName.toLowerCase()}${element.id ? `#${element.id}` : ''}${element.className ? `.${element.className.replace(/ /g, '.')}` : ''}>`;
    }
    return 'unknown';
  }
  
  getActiveListeners() {
    const active: Array<{ type: string; count: number }> = [];
    
    this.listeners.forEach((listeners, type) => {
      active.push({ type, count: listeners.length });
    });
    
    return active;
  }
  
  logActiveListeners() {
    console.table(this.getActiveListeners());
    
    this.listeners.forEach((listeners, type) => {
      console.group(`${type} (${listeners.length} listeners)`);
      listeners.forEach((listener, index) => {
        console.log(`#${index + 1}:`, {
          element: this.getElementName(listener.element),
          options: listener.options,
        });
      });
      console.groupEnd();
    });
  }
}

// Global en desarrollo
if (process.env.NODE_ENV === 'development') {
  window.eventTracker = new EventListenerTracker();
}
```

### 5.3 Event Bubbling/Capturing

**React Docs: Fases de Event Propagation**

Los eventos en React siguen el mismo modelo del DOM: **Capture → Target → Bubble**

```typescript
// ✅ Ejemplo de las 3 fases del evento
function EventPropagationDemo() {
  const log = (phase: string, target: string) => {
    console.log(`${phase}: ${target}`);
  };
  
  return (
    <div
      // FASE 1: CAPTURE (de arriba hacia abajo)
      onClickCapture={() => log('CAPTURE', 'grandparent')}
      // FASE 3: BUBBLE (de abajo hacia arriba)
      onClick={() => log('BUBBLE', 'grandparent')}
      style={{ padding: '20px', border: '2px solid red' }}
    >
      Grandparent
      
      <div
        onClickCapture={() => log('CAPTURE', 'parent')}
        onClick={() => log('BUBBLE', 'parent')}
        style={{ padding: '20px', border: '2px solid blue' }}
      >
        Parent
        
        <button
          onClickCapture={() => log('CAPTURE', 'child')}
          onClick={() => log('BUBBLE', 'child')}
        >
          Child (Click me)
        </button>
      </div>
    </div>
  );
}

// Output al hacer click en "Child":
// CAPTURE: grandparent  ⬇️ Fase de captura (arriba → abajo)
// CAPTURE: parent       ⬇️
// CAPTURE: child        ⬇️
// BUBBLE: child         ⬆️ Fase de burbujeo (abajo → arriba)
// BUBBLE: parent        ⬆️
// BUBBLE: grandparent   ⬆️
```

**✅ Stopping Propagation**

```typescript
// React Docs: stopPropagation en botones
function Button({ onClick, children }) {
  return (
    <button onClick={e => {
      e.stopPropagation(); // ✅ Detener propagación
      onClick();
    }}>
      {children}
    </button>
  );
}

function Toolbar() {
  return (
    <div className="Toolbar" onClick={() => {
      alert('You clicked on the toolbar!');
    }}>
      <Button onClick={() => alert('Playing!')}>
        Play Movie
      </Button>
      <Button onClick={() => alert('Uploading!')}>
        Upload Image
      </Button>
    </div>
  );
}

// ✅ Al hacer click en los botones:
// - Se ejecuta el onClick del botón
// - NO se ejecuta el onClick del Toolbar (propagación detenida)
```

**✅ Capture Phase para interceptar eventos**

```typescript
// React Docs: Usar onClickCapture para interceptar antes que children
<div onClickCapture={() => { /* this runs first */ }}>
  <button onClick={e => e.stopPropagation()} />
  <button onClick={e => e.stopPropagation()} />
</div>

// ✅ Útil para:
// - Analytics (capturar todos los clicks)
// - Logging global
// - Prevenir acciones en ciertos estados (e.g., disabled)
```

**✅ Distinguir target vs currentTarget**

```typescript
// React Docs: onFocus con event bubbling
function FocusExample() {
  return (
    <div
      tabIndex={1}
      onFocus={(e) => {
        // ✅ currentTarget = elemento con el listener (div)
        // ✅ target = elemento que disparó el evento (input)
        
        if (e.currentTarget === e.target) {
          console.log('focused parent');
        } else {
          console.log('focused child', e.target.name);
        }
        
        // ✅ Detectar si focus entró al subtree
        if (!e.currentTarget.contains(e.relatedTarget)) {
          console.log('focus entered parent');
        }
      }}
      onBlur={(e) => {
        if (e.currentTarget === e.target) {
          console.log('unfocused parent');
        } else {
          console.log('unfocused child', e.target.name);
        }
        
        // ✅ Detectar si focus salió del subtree
        if (!e.currentTarget.contains(e.relatedTarget)) {
          console.log('focus left parent');
        }
      }}
    >
      <label>
        First name:
        <input name="firstName" />
      </label>
      <label>
        Last name:
        <input name="lastName" />
      </label>
    </div>
  );
}
```

---

### 5.4 Synthetic Events en React

**❌ Bug: Event pooling (React <17)**

```typescript
// 🚩 En React <17, event se reutiliza (pooling)
function InputComponent() {
  const handleChange = (e) => {
    setTimeout(() => {
      console.log(e.target.value); // ⚠️ null en React <17
    }, 100);
  };
  
  return <input onChange={handleChange} />;
}
```

**✅ Solución para React <17:**

```typescript
function InputComponent() {
  const handleChange = (e) => {
    e.persist(); // ✅ Preservar event
    
    setTimeout(() => {
      console.log(e.target.value); // ✅ Funciona
    }, 100);
  };
  
  return <input onChange={handleChange} />;
}
```

**✅ React 17+ (sin pooling):**

```typescript
function InputComponent() {
  const handleChange = (e) => {
    // ✅ Event no se reutiliza en React 17+
    setTimeout(() => {
      console.log(e.target.value); // ✅ Funciona sin persist()
    }, 100);
  };
  
  return <input onChange={handleChange} />;
}
```

---

### 5.5 Memory Leaks por Listeners

**Detector de Memory Leaks:**

```typescript
// Hook para detectar listeners no limpiados
function useEventListenerLeak(targetName: string = 'window') {
  useEffect(() => {
    const target = targetName === 'window' ? window : document;
    
    // Método para contar listeners (no estándar, solo Chrome)
    const getListenerCount = () => {
      if ('getEventListeners' in window) {
        const listeners = (window as any).getEventListeners(target);
        return Object.keys(listeners).reduce(
          (sum, key) => sum + listeners[key].length,
          0
        );
      }
      return 0;
    };
    
    const initialCount = getListenerCount();
    console.log(`📊 Initial ${targetName} listeners: ${initialCount}`);
    
    return () => {
      const finalCount = getListenerCount();
      const leaked = finalCount - initialCount;
      
      if (leaked > 0) {
        console.error(`🔴 Memory leak: ${leaked} listeners not cleaned up on ${targetName}`);
      } else {
        console.log(`✅ All ${targetName} listeners cleaned up`);
      }
    };
  }, [targetName]);
}

// Uso
function App() {
  useEventListenerLeak('window');
  useEventListenerLeak('document');
  
  return <div>App</div>;
}
```

---

### 5.6 Event Delegation

**✅ Pattern eficiente:**

```typescript
// ❌ Múltiples listeners (ineficiente)
function TodoListBad({ todos }) {
  return (
    <ul>
      {todos.map(todo => (
        <li key={todo.id} onClick={() => handleClick(todo.id)}>
          {todo.text}
        </li>
      ))}
    </ul>
  );
  // ⚠️ N listeners para N items
}

// ✅ Event delegation (eficiente)
function TodoListGood({ todos }) {
  const handleClick = (e: React.MouseEvent<HTMLUListElement>) => {
    const target = e.target as HTMLElement;
    const li = target.closest('li');
    
    if (li) {
      const todoId = li.dataset.todoId;
      console.log('Clicked todo:', todoId);
    }
  };
  
  return (
    <ul onClick={handleClick}>
      {todos.map(todo => (
        <li key={todo.id} data-todo-id={todo.id}>
          {todo.text}
        </li>
      ))}
    </ul>
  );
  // ✅ 1 listener para N items
}
```

---

### 5.7 Testing Event Listeners

```typescript
// __tests__/events.test.tsx
import { describe, it, expect, vi } from 'vitest';
import { render, fireEvent, cleanup } from '@testing-library/react';

describe('Event listeners cleanup', () => {
  it('✅ should remove scroll listener on unmount', () => {
    const addSpy = vi.spyOn(window, 'addEventListener');
    const removeSpy = vi.spyOn(window, 'removeEventListener');
    
    const { unmount } = render(<ScrollTracker />);
    
    expect(addSpy).toHaveBeenCalledWith('scroll', expect.any(Function), expect.anything());
    
    unmount();
    
    expect(removeSpy).toHaveBeenCalledWith('scroll', expect.any(Function));
  });
  
  it('✅ should handle click event', () => {
    const onClick = vi.fn();
    
    const { getByText } = render(
      <button onClick={onClick}>Click me</button>
    );
    
    fireEvent.click(getByText('Click me'));
    
    expect(onClick).toHaveBeenCalledTimes(1);
  });
  
  it('✅ should stop propagation', () => {
    const parentClick = vi.fn();
    const childClick = vi.fn((e) => e.stopPropagation());
    
    const { getByTestId } = render(
      <div onClick={parentClick}>
        <button data-testid="child" onClick={childClick}>
          Child
        </button>
      </div>
    );
    
    fireEvent.click(getByTestId('child'));
    
    expect(childClick).toHaveBeenCalledTimes(1);
    expect(parentClick).not.toHaveBeenCalled(); // ✅ Propagación detenida
  });
});
```

---

## 6. Best Practices y Patrones de Debugging

### 6.1 Checklist de Debugging para Async Operations

**Fetch/API Calls:**
- [ ] ✅ Verificar `response.ok` antes de parsear JSON
- [ ] ✅ Implementar timeout con AbortController
- [ ] ✅ Configurar retry strategy para errores transitorios
- [ ] ✅ Manejar errores de red (offline, timeout, CORS)
- [ ] ✅ Logging de requests/responses en desarrollo
- [ ] ✅ Usar TanStack Query DevTools para inspección en tiempo real

**Promises:**
- [ ] ✅ Siempre usar try-catch con async/await
- [ ] ✅ Implementar global unhandledrejection handler
- [ ] ✅ Usar Promise.allSettled cuando necesitas resultados parciales
- [ ] ✅ Evitar error swallowing en promise chains
- [ ] ✅ Implementar race condition prevention (ignore flag o AbortController)

**WebSockets:**
- [ ] ✅ Implementar state machine (connecting, connected, disconnected, etc.)
- [ ] ✅ Auto-reconnect con exponential backoff
- [ ] ✅ Cleanup en useEffect (cerrar conexión en unmount)
- [ ] ✅ Logging de mensajes para debugging
- [ ] ✅ Heartbeat/ping-pong para detectar conexiones muertas

**Timers:**
- [ ] ✅ Siempre limpiar timers en cleanup de useEffect
- [ ] ✅ Usar requestAnimationFrame para animaciones
- [ ] ✅ Implementar self-correcting timers para prevenir drift
- [ ] ✅ Tracking de timers activos en desarrollo
- [ ] ✅ Testing con fake timers (vitest.useFakeTimers())

**Event Listeners:**
- [ ] ✅ Remover listeners en cleanup de useEffect
- [ ] ✅ Usar event delegation para listas grandes
- [ ] ✅ Especificar { passive: true } para scroll/touch events
- [ ] ✅ Entender capture vs bubble phase
- [ ] ✅ Memory leak detection en desarrollo

---

### 6.2 Debugging Tools Summary

| Tool | Use Case | Availability |
|------|----------|--------------|
| **Chrome DevTools - Network** | Inspeccionar requests/responses, timing, headers | Browser |
| **Chrome DevTools - Performance** | Analizar timers, event listeners, memory | Browser |
| **React DevTools** | Inspeccionar componentes, props, state | Browser Extension |
| **TanStack Query DevTools** | Query state, cache, refetch, mutations | npm package |
| **Redux DevTools** | State management debugging | Browser Extension |
| **MSW (Mock Service Worker)** | Mocking API calls en tests y desarrollo | npm package |
| **Vitest** | Testing timers, promises, async operations | npm package |
| **wscat** | Testing WebSocket connections | CLI tool |

---

### 6.3 Common Anti-Patterns

**❌ Anti-Pattern 1: No limpiar side effects**

```typescript
// 🚩 MAL
useEffect(() => {
  const interval = setInterval(() => {/* ... */}, 1000);
  const ws = new WebSocket('ws://localhost:3000');
  window.addEventListener('scroll', handleScroll);
  // ⚠️ Sin cleanup - memory leak
}, []);
```

```typescript
// ✅ BIEN
useEffect(() => {
  const interval = setInterval(() => {/* ... */}, 1000);
  const ws = new WebSocket('ws://localhost:3000');
  window.addEventListener('scroll', handleScroll);
  
  // ✅ Cleanup function
  return () => {
    clearInterval(interval);
    ws.close();
    window.removeEventListener('scroll', handleScroll);
  };
}, []);
```

**❌ Anti-Pattern 2: Actualizar estado en componente unmounted**

```typescript
// 🚩 MAL
useEffect(() => {
  fetchData().then(data => {
    setState(data); // ⚠️ Puede ejecutarse después de unmount
  });
}, []);
```

```typescript
// ✅ BIEN
useEffect(() => {
  let ignore = false;
  
  fetchData().then(data => {
    if (!ignore) {
      setState(data);
    }
  });
  
  return () => {
    ignore = true;
  };
}, []);
```

**❌ Anti-Pattern 3: Usar async directamente en useEffect**

```typescript
// 🚩 MAL
useEffect(async () => {
  const data = await fetchData(); // ⚠️ useEffect no puede ser async
  setState(data);
}, []);
```

```typescript
// ✅ BIEN
useEffect(() => {
  async function loadData() {
    const data = await fetchData();
    setState(data);
  }
  
  loadData();
}, []);
```

---

### 6.4 Debugging Workflow

**Paso 1: Identificar el problema**
1. Revisar console errors/warnings
2. Verificar Network tab para API calls
3. Inspeccionar React DevTools para component state
4. Usar TanStack Query DevTools para cache state

**Paso 2: Reproducir consistentemente**
1. Aislar el componente problemático
2. Crear minimal reproduction
3. Agregar logging estratégico
4. Usar breakpoints en DevTools

**Paso 3: Diagnosticar**
1. Verificar cleanup functions (memory leaks)
2. Revisar race conditions (ignore flags, AbortController)
3. Inspeccionar error handling (try-catch, error boundaries)
4. Analizar timing issues (timers, intervals)

**Paso 4: Resolver**
1. Implementar fix siguiendo best practices
2. Agregar tests para prevenir regresión
3. Verificar con DevTools que el problema se resolvió
4. Documentar el issue y la solución

---

### 6.5 Performance Tips

**Optimizar Fetch Operations:**
```typescript
// ✅ Usar staleTime para evitar refetches innecesarios
const { data } = useQuery({
  queryKey: ['user', userId],
  queryFn: fetchUser,
  staleTime: 5 * 60 * 1000, // 5 minutos
  cacheTime: 10 * 60 * 1000, // 10 minutos
});
```

**Debounce para reducir requests:**
```typescript
// ✅ Debounce search input
import { useDebouncedValue } from '@/hooks/useDebouncedValue';

function SearchComponent() {
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebouncedValue(search, 500);
  
  const { data } = useQuery({
    queryKey: ['search', debouncedSearch],
    queryFn: () => fetchSearch(debouncedSearch),
    enabled: debouncedSearch.length > 2,
  });
  
  return <input value={search} onChange={e => setSearch(e.target.value)} />;
}
```

**Event Delegation para listas:**
```typescript
// ✅ Un listener para múltiples items
function TodoList({ todos }) {
  const handleClick = (e: React.MouseEvent<HTMLUListElement>) => {
    const li = (e.target as HTMLElement).closest('li');
    if (li) {
      const todoId = li.dataset.todoId;
      handleTodoClick(todoId);
    }
  };
  
  return (
    <ul onClick={handleClick}>
      {todos.map(todo => (
        <li key={todo.id} data-todo-id={todo.id}>
          {todo.text}
        </li>
      ))}
    </ul>
  );
}
```

---

## 📚 Referencias y Documentación

### Fetch y API Calls
- [MDN - Fetch API](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API)
- [MDN - Using Fetch](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch)
- [TanStack Query Docs](https://tanstack.com/query/latest/docs/framework/react/overview)
- [Axios Documentation](https://axios-http.com/docs/intro)
- [AbortController API](https://developer.mozilla.org/en-US/docs/Web/API/AbortController)

### Promises
- [MDN - Promise](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)
- [MDN - async/await](https://developer.mozilla.org/en-US/docs/Learn/JavaScript/Asynchronous/Promises)
- [JavaScript.info - Promises](https://javascript.info/promise-basics)

### WebSockets
- [MDN - WebSocket](https://developer.mozilla.org/en-US/docs/Web/API/WebSocket)
- [WebSocket API Spec](https://websockets.spec.whatwg.org/)
- [Socket.io Documentation](https://socket.io/docs/v4/)

### Timers
- [MDN - setTimeout](https://developer.mozilla.org/en-US/docs/Web/API/setTimeout)
- [MDN - setInterval](https://developer.mozilla.org/en-US/docs/Web/API/setInterval)
- [MDN - requestAnimationFrame](https://developer.mozilla.org/en-US/docs/Web/API/window/requestAnimationFrame)

### Event Listeners
- [MDN - addEventListener](https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener)
- [MDN - Event Bubbling and Capturing](https://developer.mozilla.org/en-US/docs/Learn/JavaScript/Building_blocks/Events#event_bubbling_and_capture)
- [React - Handling Events](https://react.dev/learn/responding-to-events)
- [React - Event Reference](https://react.dev/reference/react-dom/components/common#react-event-object)

### Testing
- [Vitest Documentation](https://vitest.dev/)
- [Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [MSW (Mock Service Worker)](https://mswjs.io/)
- [jest-websocket-mock](https://github.com/romgain/jest-websocket-mock)

### DevTools
- [Chrome DevTools - Network](https://developer.chrome.com/docs/devtools/network/)
- [Chrome DevTools - Performance](https://developer.chrome.com/docs/devtools/performance/)
- [React DevTools](https://react.dev/learn/react-developer-tools)

---

**Siguiente:** [09-performance-debugging.md](./09-performance-debugging.md)
**Anterior:** [07-state-management-debugging.md](./07-state-management-debugging.md)
**Índice:** [README.md](./README.md)
