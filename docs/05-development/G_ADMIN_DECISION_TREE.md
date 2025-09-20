# 🌳 G-ADMIN DECISION TREE - GUÍA DE DECISIONES ARQUITECTÓNICAS

**Objetivo**: Automatizar decisiones para evitar errores arquitectónicos
**Basado en**: Errores reales detectados en módulos existentes
**Uso**: Consultar DURANTE el desarrollo

---

## 🎯 **DECISION TREE PRINCIPAL**

### **📊 COMPONENTE QUE MUESTRA DATOS**

```
¿Tu componente muestra datos de negocio?
├── SÍ → ¿Los datos vienen de props?
│   ├── SÍ → 🚨 PROBLEMA: Posible prop drilling
│   │   └── ✅ SOLUCIÓN: Usar hook directo (useMaterials, useSales, etc.)
│   └── NO → ✅ CORRECTO: Hook directo
└── NO → ✅ CORRECTO: Componente presentacional
```

### **🔗 COMUNICACIÓN ENTRE COMPONENTES**

```
¿Necesitas pasar información a otro componente?
├── ¿Es un evento de negocio? (stock_updated, order_created, etc.)
│   ├── SÍ → ✅ USA: EventBus (useModuleIntegration)
│   └── NO → Continúa abajo
├── ¿Es lógica de negocio? (calcular precio, validar stock, etc.)
│   ├── SÍ → ✅ USA: Hook compartido (useBusinessLogic)
│   └── NO → Continúa abajo
├── ¿Es estado de UI? (modal open/close, selected tab, etc.)
│   ├── SÍ → ✅ USA: Props o useState local
│   └── NO → Continúa abajo
└── ¿Es data presentacional? (user.name, product.price, etc.)
    ├── SÍ → ✅ USA: Props
    └── NO → 🚨 REVISAR: ¿Realmente necesitas pasar esto?
```

---

## 🚨 **DETECTORES DE ANTI-PATTERNS**

### **🔍 DETECTOR: Prop Drilling de Business Logic**

**SEÑALES DE ALERTA:**
```typescript
// 🚨 RED FLAGS
interface Props {
  onStockUpdate: (item: any) => void;     // ← Business event
  onCalculatePrice: (data: any) => number; // ← Business logic
  onValidateInventory: () => boolean;      // ← Business validation
  userCapabilities: string[];             // ← Authentication data
}
```

**SOLUCIÓN:**
```typescript
// ✅ CORRECTO
function Component() {
  const { emitEvent } = useModuleIntegration('materials');  // EventBus
  const { calculatePrice } = useBusinessLogic();           // Business logic
  const { hasCapability } = useCapabilities();            // Authentication
}
```

### **🔍 DETECTOR: Componente Sin Datos**

**SEÑALES DE ALERTA:**
```typescript
// 🚨 RED FLAG - Componente que no muestra datos reales
function MaterialsList() {
  return (
    <Section>
      <MaterialsInventoryGrid /> {/* ← No datos */}
    </Section>
  );
}
```

**SOLUCIÓN:**
```typescript
// ✅ CORRECTO - Hook directo a datos
function MaterialsList() {
  const { getFilteredItems } = useMaterials(); // ← Datos reales
  const items = getFilteredItems();

  return (
    <Section>
      <MaterialsGrid items={items} /> {/* ← Con datos */}
    </Section>
  );
}
```

---

## 🏗️ **PATTERNS POR TIPO DE COMPONENTE**

### **📋 LIST COMPONENTS (MaterialsList, SalesList, etc.)**

```typescript
// ✅ PATTERN CORRECTO
function [Module]List() {
  // 1. Datos via hook directo
  const { getFilteredItems, loading } = use[Module]();

  // 2. EventBus para eventos de negocio
  const { emitEvent } = useModuleIntegration('[module]', config);

  // 3. Event handlers con EventBus
  const handleItemAction = (item) => {
    // Lógica local
    updateLocalState(item);
    // EventBus para otros módulos
    emitEvent('item_updated', item);
  };

  if (loading) return <SkeletonLoader />;

  return (
    <Section>
      <[Module]Grid
        items={getFilteredItems()}
        onItemAction={handleItemAction}
      />
    </Section>
  );
}
```

### **📊 METRIC COMPONENTS (MetricCard, Analytics, etc.)**

```typescript
// ✅ PATTERN CORRECTO
function [Module]Metrics() {
  // 1. Datos via hook directo (NO props)
  const { stats } = use[Module]();

  // 2. Capabilities para renderizado condicional
  const { hasCapability } = useCapabilities();

  return (
    <StatsSection>
      <CardGrid>
        <MetricCard title="Total" value={stats.total} />

        {hasCapability('advanced_analytics') && (
          <MetricCard title="Advanced" value={stats.advanced} />
        )}
      </CardGrid>
    </StatsSection>
  );
}
```

### **📝 FORM COMPONENTS**

```typescript
// ✅ PATTERN CORRECTO
function [Module]Form({ initialData, onSuccess }) {
  // 1. Form logic local
  const { handleSubmit, register, formState } = useForm();

  // 2. Business logic via hook
  const { createItem, updateItem } = use[Module]();

  // 3. EventBus para notificar otros módulos
  const { emitEvent } = useModuleIntegration('[module]', config);

  const onSubmit = async (data) => {
    const result = await createItem(data);

    // EventBus notification
    emitEvent('item_created', result);

    // UI callback
    onSuccess?.(result);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      {/* Form fields */}
    </form>
  );
}
```

---

## 🎯 **DECISION TREES POR SITUACIÓN**

### **🔄 "Necesito actualizar datos en otro módulo"**

```
¿Qué tipo de actualización?
├── Notificar cambio de estado → ✅ EventBus: emitEvent('state_changed')
├── Solicitar acción → ✅ EventBus: emitEvent('action_requested')
├── Compartir data procesada → ✅ EventBus: emitEvent('data_processed')
└── Solo mostrar en UI → ✅ Props simple
```

### **🎨 "¿Qué componente usar?"**

```
¿Qué necesitas mostrar?
├── Lista de datos → ContentLayout + Section + [Module]Grid
├── Métricas → StatsSection + CardGrid + MetricCard
├── Formulario → FormSection + Form components
├── Navegación por tabs → Tabs component
└── Condicional por capabilities → CapabilityGate
```

### **📡 "¿Cómo comunicar módulos?"**

```
¿Qué tipo de comunicación?
├── Evento de negocio → useModuleIntegration + emitEvent
├── Request/Response → EventBus.waitFor()
├── State sharing → Zustand store + EventBus notification
└── UI coordination → Props + callbacks
```

---

## 🔧 **HERRAMIENTAS DE VALIDACIÓN**

### **📝 CODE REVIEW CHECKLIST**

**ANTES DE APROBAR PR:**
- [ ] ¿Props con nombres como `onBusinessAction`, `onStockUpdate`? → ❌ Prop drilling
- [ ] ¿Componente recibe data pero no la usa directamente? → ❌ Prop drilling
- [ ] ¿useModuleIntegration usado en cada componente que emite eventos? → ✅ Correcto
- [ ] ¿Imports solo de @/shared/ui? → ✅ Correcto
- [ ] ¿Capabilities checkeadas localmente? → ✅ Correcto

### **🚨 AUTOMATIC LINTING (Futuro)**

```javascript
// Detectar prop drilling automáticamente
rules: {
  'no-business-props': {
    'onStockUpdate': 'Use useModuleIntegration instead',
    'onBusinessAction': 'Create specific business hook',
    'userCapabilities': 'Use useCapabilities hook'
  }
}
```

---

## 🎯 **QUICK REFERENCE**

### **❌ CUANDO VES ESTO → HAZ ESTO**
- `onStockUpdate` prop → `useModuleIntegration + emitEvent`
- `onCalculatePrice` prop → `useBusinessLogic hook`
- `userCapabilities` prop → `useCapabilities hook`
- Componente sin datos → Agregar `use[Module]()` hook
- Import de chakra → Cambiar a `@/shared/ui`

### **✅ PATTERNS SIEMPRE CORRECTOS**
- Hook directo para datos: `const { items } = useMaterials()`
- EventBus para eventos: `emitEvent('item_updated', data)`
- Capabilities local: `const canEdit = hasCapability('edit')`
- UI callbacks: `onClose={() => setOpen(false)}`

---

**🎯 MANTRA: "Si es business logic → Hook directo. Si es UI simple → Props OK."**