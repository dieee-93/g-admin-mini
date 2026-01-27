# Solución: Service Layer Architecture Issues

## Código de referencia: 6.1, 6.2, 6.3, 6.4

## Categoría de impacto
**ALTO** - Afecta la mantenibilidad, testabilidad y escalabilidad de toda la aplicación. La duplicación de lógica de negocio y la mezcla de responsabilidades hacen que el sistema sea frágil ante cambios.

## 1. Servicios Duplicados (6.1)

### Descripción del anti-pattern
Existencia de múltiples archivos que implementan la misma funcionalidad de negocio o infraestructura, a menudo con ligeras variaciones, lo que lleva a comportamientos inconsistentes y dificultad de mantenimiento.

**Ejemplo encontrado en codebase:**
- `src/lib/tracking/gpsTrackingService.ts`
- `src/modules/fulfillment/delivery/services/gpsTrackingService.ts`

Ambos servicios implementan lógica de tracking GPS, instancian watchers de geolocalización y escriben en Supabase, pero tienen interfaces y comportamientos ligeramente diferentes.

### Por qué es un problema
**Fuente 1: DRY Principle (Don't Repeat Yourself)**
> "Every piece of knowledge must have a single, unambiguous, authoritative representation within a system."
> - Fuente: The Pragmatic Programmer
> - URL: https://en.wikipedia.org/wiki/Don%27t_repeat_yourself

**Fuente 2: Single Source of Truth**
> "In information systems design and theory, single source of truth (SSOT) is the practice of structuring information models and associated data schema such that every data element is mastered (or edited) in only one place."
> - Fuente: Wikipedia - SSOT
> - URL: https://en.wikipedia.org/wiki/Single_source_of_truth

### Solución recomendada
Consolidar la funcionalidad en un único servicio autorizado. Si la funcionalidad es transversal (como GPS), debe vivir en `src/lib` o `src/shared`. Si es específica de dominio, en su módulo correspondiente.

#### Código correcto

```typescript
// ✅ CORRECTO: src/lib/tracking/gpsTrackingService.ts
// Single authoritative implementation

export class GpsTrackingService {
  private static instance: GpsTrackingService;
  
  private constructor() {} // Private constructor for Singleton

  public static getInstance(): GpsTrackingService {
    if (!GpsTrackingService.instance) {
      GpsTrackingService.instance = new GpsTrackingService();
    }
    return GpsTrackingService.instance;
  }

  // ... implementation ...
}

export const gpsTrackingService = GpsTrackingService.getInstance();
```

---

## 2. Naming Inconsistente (6.2)

### Descripción del anti-pattern
Uso intercambiable y arbitrario de sufijos como `Service`, `Api`, `Engine` sin una distinción clara de responsabilidades.

**Ejemplo encontrado:**
- `customerApi.ts` contiene lógica de permisos y formateo CSV.
- `orderService.ts` hace llamadas directas a base de datos (Supabase).
- `costCalculationEngine.ts` sugiere complejidad pero a veces solo es un helper.

### Solución recomendada
Adoptar una convención estricta basada en capas de responsabilidad (Layered Architecture).

**Convención Definida:**

1.  **`*Api.ts` (Data Access Layer)**
    -   **Responsabilidad:** Comunicación pura con fuentes de datos (Supabase, REST, GraphQL).
    -   **Input:** DTOs.
    -   **Output:** Datos crudos o tipados.
    -   **No contiene:** Reglas de negocio, validaciones complejas.

2.  **`*Service.ts` (Business Logic Layer)**
    -   **Responsabilidad:** Orquestación, reglas de negocio, validaciones, coordinación entre APIs.
    -   **Input:** Datos de dominio.
    -   **Output:** Resultados de operación o Domain Objects.
    -   **Usa:** `*Api` y otros `*Service`.

3.  **`*Engine.ts` (Computation Layer - Opcional)**
    -   **Responsabilidad:** Algoritmos complejos, cálculos matemáticos puros, máquinas de estado.
    -   **Carácter:** Stateless, Pure Functions preferiblemente.
    -   **Ejemplo:** `PayrollEngine`, `RouteOptimizationEngine`.

#### Código correcto

```typescript
// 1. src/modules/sales/api/orderApi.ts (Data Access)
export const orderApi = {
  async getById(id: string): Promise<OrderDTO> {
    const { data, error } = await supabase.from('orders').select('*').eq('id', id).single();
    if (error) throw new DatabaseError(error);
    return data;
  }
};

// 2. src/modules/sales/services/orderService.ts (Business Logic)
export const orderService = {
  async processOrder(orderId: string): Promise<Order> {
    const order = await orderApi.getById(orderId); // Call API
    
    if (order.status !== 'DRAFT') {
      throw new DomainError('Only draft orders can be processed');
    }
    
    const total = TaxEngine.calculate(order.subtotal); // Call Engine
    // ... logic ...
    return finalOrder;
  }
};
```

---

## 3. Servicios que mezclan concerns (6.3)

### Descripción del anti-pattern
Servicios que violan el principio de responsabilidad única (SRP) realizando tareas dispares como acceso a datos, lógica de presentación (formateo), autorización y cálculos.

**Ejemplo incorrecto (`customerApi.ts`):**
```typescript
// ❌ INCORRECTO: Mezcla Auth, DB y Presentación
export async function getCustomers(user: AuthUser, filters: any) {
  requirePermission(user, 'customers'); // Auth Concern
  const data = await supabase.from('customers')... // DB Concern
  // ...
  return csv; // Presentation/Format Concern
}
```

### Por qué es un problema
**Fuente: Clean Architecture (Robert C. Martin)**
> "The Single Responsibility Principle (SRP) states that each software module should have one and only one reason to change."

Al mezclar concerns, un cambio en la librería de Auth rompe el servicio de Clientes. Un cambio en la estructura de la DB rompe la exportación CSV.

### Solución recomendada
Separar responsabilidades mediante inyección de dependencias o composición de funciones.

#### Patrón de Refactoring

1.  **Extraer Auth:** Usar Middleware o Decoradores, o validar permisos *antes* de llamar al servicio (en la capa de controlador/hook).
2.  **Extraer DB:** Mover queries a `*Api.ts`.
3.  **Extraer Formato:** Mover lógica de CSV a `*Utils` o `*Formatter`.

#### Código correcto

```typescript
// ✅ CORRECTO: Separación de responsabilidades

// 1. customerApi.ts (Solo DB)
export const customerApi = {
  async getAll(filters: CustomerFilters) {
    return supabase.from('customers').select('*')...
  }
}

// 2. csvFormatter.ts (Solo Formato)
export const csvFormatter = {
  toCsv(data: any[]) {
    // ... logic to convert json to csv
  }
}

// 3. customerService.ts (Orquestación)
export const customerService = {
  async exportCustomers(filters: CustomerFilters) {
    // Nota: La autorización ya debió ocurrir antes de llegar aquí o se inyecta el contexto
    const customers = await customerApi.getAll(filters);
    return csvFormatter.toCsv(customers);
  }
}
```

---

## 4. Error Handling Inconsistente (6.4)

### Descripción del anti-pattern
Manejo de errores errático: algunos servicios retornan `null`, otros lanzan excepciones nativas (`Error`), otros loguean y silencian el error, y otros retornan objetos `{ data, error }` (estilo Supabase leaking).

**Ejemplo incorrecto:**
```typescript
// ❌ INCORRECTO: Inconsistencia
async function methodA() {
  try { ... } catch (e) { console.log(e); return null; } // Silencia y retorna null
}

async function methodB() {
  const { error } = await supabase...
  if (error) throw error; // Lanza objeto error crudo de librería tercera
}
```

### Solución recomendada
Estandarizar el flujo de excepciones.
1.  **Data Access (API):** Captura errores de DB y lanza `AppError` tipados.
2.  **Service:** Captura errores o deja pasar `AppError`. Lanza errores de negocio (`DomainError`).
3.  **UI/Hooks:** Captura errores y decide cómo mostrarlos (Toast, Alert, Redirección).

#### Código correcto

```typescript
// ✅ CORRECTO: Tipos de errores estandarizados

export class AppError extends Error {
  constructor(public code: string, message: string, public originalError?: any) {
    super(message);
    this.name = 'AppError';
  }
}

// En *Api.ts
async function getUser(id: string) {
  const { data, error } = await supabase...;
  if (error) {
    // Transformar error de infraestructura a error de aplicación
    throw new AppError('DB_ERROR', 'Failed to fetch user', error);
  }
  return data;
}

// En *Service.ts
async function verifyUser(id: string) {
  const user = await getUser(id); // Si falla, el error sube
  if (!user.isActive) {
    // Error de Dominio
    throw new AppError('USER_INACTIVE', 'The user is not active');
  }
}
```

---

## Patrón de Refactoring General

### Paso 1: Auditoría y Renombramiento
1.  Identificar archivos `*Service.ts` que hacen llamadas directas a DB.
2.  Si solo hacen DB, renombrar a `*Api.ts`.
3.  Si mezclan, crear `*Api.ts` y mover las queries ahí.

### Paso 2: Limpieza de Capas
1.  En `*Service.ts`, reemplazar llamadas a `supabase` por llamadas a `*Api`.
2.  Remover lógica de presentación (formatting) de los servicios.
3.  Asegurar que los servicios sean "agnósticos" de la UI (no React hooks dentro, no toasts directos).

### Paso 3: Consolidación
1.  Identificar servicios duplicados (ej. GPS).
2.  Elegir la implementación más robusta.
3.  Redirigir todos los imports a la implementación elegida.
4.  Borrar la duplicada.

## Casos edge a considerar

1.  **Legacy Code:** Mucho código antiguo llama a Supabase directamente desde componentes.
    -   *Estrategia:* No refactorizar componentes antiguos masivamente. Crear los nuevos servicios/APIs y usarlos para nuevas features o refactors puntuales.
2.  **Circular Dependencies:** Separar `Api` y `Service` puede causar ciclos si no se tiene cuidado con los imports de tipos.
    -   *Estrategia:* Mover tipos compartidos a archivos `types.ts` o `interfaces.ts` independientes.

## Validación

- [ ] `*Api.ts` archivos importan `supabase` pero no contienen lógica de negocio compleja.
- [ ] `*Service.ts` archivos NO importan `supabase` directamente (excepto para tipos si es necesario, pero idealmente usan DTOs).
- [ ] No existen servicios con nombres idénticos en diferentes rutas haciendo lo mismo.
- [ ] Errores son manejados con clases de error personalizadas o patrones consistentes, no `console.error` sueltos.

## Esfuerzo estimado

**ALTO**
Refactorizar la capa de servicios toca la columna vertebral de la aplicación.
-   Recomendado hacer módulo por módulo (empezando por los críticos como `Sales` o `Supply Chain`).
-   Tiempo estimado: 1-2 semanas por módulo complejo.

## Referencias

1.  **Clean Architecture** - Robert C. Martin
2.  **Domain-Driven Design** - Eric Evans
3.  **Martin Fowler - Service Layer**
    - https://martinfowler.com/eaaCatalog/serviceLayer.html
4.  **Bulletproof React - Project Structure**
    - https://github.com/alan2207/bulletproof-react
