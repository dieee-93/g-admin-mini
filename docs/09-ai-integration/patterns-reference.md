# Patrones de Problemas - Business Flow Analyzer

## Patrones de Código Desconectado

### 1. Hardcoding Detectado
```typescript
// PROBLEMA: Datos hardcodeados en lugar de API calls
const mockData = [
  { id: 1, name: "Item hardcodeado" }
];

// BUSCAR: Componentes que usan arrays estáticos en lugar de hooks
```

### 2. Funciones Aisladas de Valor
```typescript
// PROBLEMA: Lógica compleja sin integración
function complexAnalytics() {
  // Funcionalidad valiosa pero no conectada
  return calculateSomethingComplex();
}

// BUSCAR: Funciones sin usages, importaciones sin conectar
```

### 3. Hooks Sin Implementar
```typescript
// PROBLEMA: Hooks que devuelven datos estáticos
const useAnalytics = () => {
  return { data: mockData }; // Debería ser API call
};

// BUSCAR: Hooks con return hardcodeado
```

## Patrones de Relaciones Problemáticas

### 1. Recipe Polimorfismo
```typescript
// VERIFICAR: ¿Estas funciones manejan tanto Products como Items?
- calculateRecipeCost()
- generateRecipeWithAI()
- trackRecipeProgress()
- analyzeRecipeYield()

// BUSCAR: Lógica que asume un solo tipo de entidad
```

### 2. Inconsistencias Products vs Sale_Items
```sql
-- VERIFICAR: Relaciones entre estas tablas
products (id, name, type, recipe_id)
sale_items (id, product_id, sale_id, quantity)

-- BUSCAR: Lógica que confunde estas entidades
```

### 3. Módulos Desconectados
```typescript
// PROBLEMA: Módulo que debería usar datos de otro
// materials/ usando datos hardcodeados
// cuando debería conectar con products/

// BUSCAR: Import statements faltantes entre módulos relacionados
```

## Estructura de Análisis Requerida

### Template por Módulo
```markdown
## Módulo: [nombre]

### Estado Actual
- [ ] Páginas principales funcionando
- [ ] Páginas secundarias identificadas
- [ ] Conexiones de datos evaluadas

### Problemas Detectados
1. **Hardcoding**: [ubicación] - [descripción]
2. **Lógica Aislada**: [función] - [valor potencial]
3. **Conexiones Faltantes**: [qué necesita] - [de dónde]

### Prioridad de Resolución
- **CRÍTICO**: [bloquea funcionalidad principal]
- **IMPORTANTE**: [afecta UX o performance]
- **MEJORA**: [deuda técnica]

### Plan de Integración
- [ ] Conectar con: [módulos]
- [ ] Implementar: [APIs faltantes]
- [ ] Refactorizar: [componentes específicos]
```

## Señales de Alerta Específicas

### En el Código
- Comentarios "TODO" o "FIXME" antiguos
- Variables con nombre "mock", "temp", "hardcoded"
- Funciones complejas sin tests
- Imports no utilizados de módulos relacionados
- Componentes con props no utilizadas (pensadas para integración futura)

### En la Base de Datos
- Tablas con columnas sin foreign keys apropiadas
- Funciones SQL no llamadas desde el código
- Triggers o procedures desactualizadas
- Índices en columnas no utilizadas

### En la Arquitectura
- Hooks que devuelven datos estáticos
- Stores de Zustand con acciones vacías
- APIs endpoints definidas pero no conectadas
- Rutas de navegación que llevan a páginas "en construcción"

## Contexto de Negocio Restaurantero

### Flujos Críticos a Verificar
1. **Inventario → Recetas → Productos → Ventas**
2. **Clientes → Órdenes → Cocina → Entrega**
3. **Costos → Precios → Rentabilidad → Reportes**
4. **Staff → Turnos → Productividad → Nómina**

### Relaciones de Datos Esperadas
- Recipe debe funcionar para Products Y Materials elaborados
- Sales debe conectar con Inventory para validación de stock
- Customers debe conectar con Sales para historial
- Staff debe conectar con Operations para asignaciones
