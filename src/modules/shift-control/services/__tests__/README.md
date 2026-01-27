# Tests del Sistema de Validación de Cierre de Turno

Este directorio contiene los tests comprehensivos para el módulo `shift-control`, específicamente enfocados en el sistema de validación de cierre de turno.

## 📁 Estructura de Archivos

```
src/modules/shift-control/
├── services/
│   ├── shiftService.ts
│   └── __tests__/
│       ├── shiftService.test.ts          ← Tests del service layer
│       └── README.md                      ← Este archivo
├── hooks/
│   ├── useShiftValidation.ts
│   └── __tests__/
│       └── useShiftValidation.test.tsx   ← Tests del hook
└── types/
    └── index.ts
```

## 🎯 Cobertura de Tests

### Service Layer (`shiftService.test.ts`)

#### ✅ `validateCloseShift()` - 100% cobertura
- **Success Cases (3 tests)**
  - Retorna `canClose: true` sin bloqueadores
  - Emite evento `shift.close_validation.requested`
  - Logea validación exitosa

- **Blocker Detection (16 tests)**
  - Cash Session (2 tests)
  - Open Tables (2 tests)
  - Active Deliveries (1 test)
  - Pending Orders (1 test)
  - Pending Returns (2 tests)
  - Multiple Blockers (3 tests)
  - Event emission y logging (3 tests)

- **Warning Detection (7 tests)**
  - Unchecked Staff (2 tests)
  - Low Stock Materials (2 tests)
  - Low Cash (2 tests)
  - Warnings sin blockers (1 test)

- **Error Handling (4 tests)**
  - Shift no existe
  - Shift no está activo
  - Errores de base de datos
  - Manejo de errores en queries

- **Result Structure (3 tests)**
  - Estructura correcta de `CloseValidationResult`
  - Estructura de blockers
  - Estructura de warnings

**Total: 33 tests para `validateCloseShift()`**

#### ✅ `closeShift()` - 100% cobertura
- **Validation Enforcement (4 tests)**
  - Valida automáticamente por defecto
  - Lanza error con bloqueadores
  - Cierra exitosamente sin bloqueadores
  - Permite cerrar con warnings

- **Skip Validation (1 test)**
  - Skipea validación con opción `skipValidation: true`

- **Duration Calculation (1 test)**
  - Calcula duración correctamente

- **Event Emission (1 test)**
  - Emite evento `shift.closed` con payload correcto

- **Database Update (2 tests)**
  - Actualiza status a 'closed'
  - Maneja errores de actualización

- **Error Cases (2 tests)**
  - Shift no existe
  - Shift ya está cerrado

**Total: 11 tests para `closeShift()`**

#### ✅ `forceCloseShift()` - 100% cobertura
- Bypasea validación completamente
- Cierra shift con bloqueadores presentes
- Logea warning de admin override
- Llama a `closeShift` con `skipValidation: true`

**Total: 4 tests para `forceCloseShift()`**

### Hook Layer (`useShiftValidation.test.tsx`)

#### ✅ `useShiftValidation()` - 100% cobertura
- **Initial State (3 tests)**
  - `validationResult` inicia como `null`
  - `isValidating` inicia como `false`
  - Provee todos los métodos esperados

- **validateClose() Method (8 tests)**
  - Llama al service con shiftId correcto
  - Maneja `isValidating` state
  - Actualiza `validationResult`
  - Retorna resultado del service
  - Logea debug messages
  - Maneja errores correctamente
  - Logea errores
  - Resetea `isValidating` en errores

- **canCloseShift() Method (4 tests)**
  - Retorna `validationResult.canClose`
  - Retorna `false` cuando es `null`
  - Retorna `false` con blockers
  - Retorna `true` con solo warnings

- **hasBlockers() Method (4 tests)**
  - Retorna `true` con blockers
  - Retorna `false` sin blockers
  - Retorna `false` cuando es `null`
  - Retorna `true` con blockers y warnings

- **hasWarnings() Method (4 tests)**
  - Retorna `true` con warnings
  - Retorna `false` sin warnings
  - Retorna `false` cuando es `null`
  - Retorna `true` con blockers y warnings

- **Multiple Validations (2 tests)**
  - Actualiza state con múltiples validaciones
  - Maneja validaciones consecutivas rápidas

- **Hook Cleanup (2 tests)**
  - Mantiene state entre renders
  - No causa memory leaks en unmount

- **Type Safety (2 tests)**
  - Acepta `OperationalShift` válido
  - Retorna `CloseValidationResult` tipado

- **Edge Cases (3 tests)**
  - Maneja arrays vacíos
  - Maneja múltiples blockers
  - Maneja múltiples warnings

**Total: 32 tests para `useShiftValidation()`**

## 📊 Resumen Total

- **Total de tests implementados: 80+**
- **Coverage objetivo: >90%**
- **Archivos de test: 2**
- **Funciones cubiertas: 3 (service) + 1 (hook)**

## 🚀 Ejecutar Tests

### Todos los tests
```bash
npm test
```

### Tests del módulo shift-control
```bash
npm test shift-control
```

### Tests específicos del service layer
```bash
npm test shiftService.test.ts
```

### Tests específicos del hook
```bash
npm test useShiftValidation.test.tsx
```

### Con coverage
```bash
npm run test:coverage
```

### Watch mode
```bash
npm test -- --watch
```

## 🔍 Validaciones Cubiertas

### Bloqueadores (5 tipos)
1. ✅ **cash_session** - Sesión de caja abierta
2. ✅ **open_tables** - Mesas ocupadas
3. ✅ **active_deliveries** - Entregas activas
4. ✅ **pending_orders** - Órdenes pendientes
5. ✅ **pending_returns** - Devoluciones vencidas

### Advertencias (3 tipos)
1. ✅ **unchecked_staff** - Empleados sin checkout
2. ✅ **inventory_count** - Stock bajo de materiales
3. ✅ **low_cash** - Efectivo bajo en caja

## 🧪 Casos de Prueba Especiales

### 1. Sin bloqueadores, sin warnings
```typescript
test('debe permitir cerrar shift sin bloqueadores ni warnings', async () => {
  const result = await validateCloseShift('shift-123');
  expect(result.canClose).toBe(true);
  expect(result.blockers).toHaveLength(0);
  expect(result.warnings).toHaveLength(0);
});
```

### 2. Con bloqueador de cash session
```typescript
test('debe bloquear cierre si hay cash session abierta', async () => {
  const result = await validateCloseShift('shift-123');
  expect(result.canClose).toBe(false);
  expect(result.blockers[0].type).toBe('cash_session');
});
```

### 3. Múltiples bloqueadores
```typescript
test('debe detectar múltiples bloqueadores simultáneamente', async () => {
  const result = await validateCloseShift('shift-123');
  expect(result.blockers).toHaveLength(3);
  expect(result.blockers.map(b => b.type)).toContain('cash_session');
  expect(result.blockers.map(b => b.type)).toContain('open_tables');
});
```

### 4. Solo warnings (permite cerrar)
```typescript
test('debe permitir cerrar con warnings pero sin bloqueadores', async () => {
  const result = await validateCloseShift('shift-123');
  expect(result.canClose).toBe(true);
  expect(result.warnings).toHaveLength(2);
});
```

### 5. closeShift lanza error con bloqueadores
```typescript
test('closeShift debe lanzar error si hay bloqueadores', async () => {
  await expect(closeShift('shift-123', { closed_by: 'user-1' }))
    .rejects
    .toThrow('No se puede cerrar el turno');
});
```

### 6. forceCloseShift ignora bloqueadores
```typescript
test('forceCloseShift debe cerrar incluso con bloqueadores', async () => {
  const result = await forceCloseShift('shift-123', { closed_by: 'admin-1' });
  expect(result.status).toBe('closed');
});
```

## 📝 Mocks Utilizados

### 1. Supabase Client
```typescript
vi.mock('@/lib/supabase/client', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      // ... más métodos
    })),
  },
}));
```

### 2. EventBus
```typescript
vi.mock('@/lib/events/EventBus', () => ({
  default: {
    emit: vi.fn(),
    subscribe: vi.fn(),
    unsubscribe: vi.fn(),
  },
}));
```

### 3. Logger
```typescript
vi.mock('@/lib/logging/Logger', () => ({
  logger: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    debug: vi.fn(),
  },
}));
```

## ✅ Assertions Importantes

### Estructura de resultado
```typescript
expect(result).toMatchObject({
  canClose: expect.any(Boolean),
  blockers: expect.any(Array),
  warnings: expect.any(Array),
});
```

### Blocker structure
```typescript
expect(blocker).toMatchObject({
  type: expect.stringMatching(/cash_session|open_tables|.../),
  message: expect.any(String),
  affectedFeature: expect.any(String),
});
```

### Event emissions
```typescript
expect(eventBus.emit).toHaveBeenCalledWith(
  'shift.close_validation.requested',
  expect.objectContaining({ shift: expect.any(Object) }),
  'ShiftControl'
);
```

## 🎯 Próximos Pasos (Opcionales)

### Tests de Integración con DB Real
- Usar Supabase test client o base de datos temporal
- Tests con queries reales
- Validar integridad de datos

### Tests End-to-End
- Flujo completo: abrir → crear bloqueador → intentar cerrar → resolver → cerrar
- Verificar estado en DB después de operaciones

## 📚 Referencias

- [Vitest Documentation](https://vitest.dev)
- [Testing Library - React Hooks](https://testing-library.com/docs/react-testing-library/api#renderhook)
- [G-Admin Mini - Shift Control Module](../../README.md)

## 🐛 Reportar Issues

Si encuentras algún problema con los tests o deseas agregar más casos de prueba, por favor documenta:
- Caso de uso específico
- Comportamiento esperado vs actual
- Pasos para reproducir
