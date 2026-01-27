# Módulo de Materials - G-Admin Mini

## 📋 Descripción del Módulo

El módulo de **Materials** gestiona el inventario completo de materias primas, control de stock, análisis ABC, y optimización de cadena de suministro. Incluye funcionalidades avanzadas de previsión de demanda, recomendaciones de compras, y alertas inteligentes basadas en datos reales de consumo.

### Características principales:
- ✅ Gestión completa de inventario y stock
- ✅ **UI profesional con tabla interactiva y búsqueda en tiempo real**
- ✅ **Acciones masivas (bulk actions) sobre múltiples items**
- ✅ **Filtros avanzados con drawer deslizante**
- ✅ Análisis ABC automático con visualizaciones (PieChart, BarChart)
- ✅ Sistema de alertas de stock con umbrales dinámicos
- ✅ Previsión de demanda y recomendaciones de compra
- ✅ Análisis de proveedores y optimización de costos
- ✅ Cálculos de stock con precisión decimal (Decimal.js)
- ✅ **Integración completa con Supabase (tabla `items`)**

### 🗺️ Feature & Route Map

| Route (Relative) | Feature Area | Components | Description |
|------------------|--------------|------------|-------------|
| **`/`** | **Inventory Management** | `InventoryTabEnhanced`, `MaterialsTable` | Main inventory control. Search, filter, and manage stock items. |
| **`/?tab=analytics`** | **Start Intelligent Analytics** | `AnalyticsTabEnhanced`, `MaterialsCharts` | ABC Analysis, visual charts for stock distribution and value evolution. |
| **`/?tab=procurement`** | **Procurement** | `ProcurementTab` | Purchase recommendations and supplier management. |

---

## 🎨 Rediseño UI v2.1 - Professional Redesign (2025)

### 🆕 Componentes Implementados

El módulo Materials ha sido rediseñado completamente con una interfaz profesional moderna:

#### 1. **MaterialsToolbar** (`components/MaterialsToolbar/`)
Barra de herramientas sticky con controles completos:
- 🔍 **Búsqueda instantánea** con icono y placeholder claro
- 🏷️ **Filtros rápidos**: Tipo, Categoría, Estado de Stock
- 👁️ **Toggle de vista**: Tabla ↔ Cards
- ➕ **Acciones primarias**: Nuevo Material, Importar, Exportar
- 🔧 **Filtros avanzados** con badge de conteo

```tsx
<MaterialsToolbar
  searchValue={search}
  onSearchChange={setSearch}
  selectedType={typeFilter}
  onTypeChange={setTypeFilter}
  viewMode="table"
  onViewModeChange={setViewMode}
  activeFiltersCount={3}
/>
```

#### 2. **MaterialsTable** (`components/MaterialsTable/`)
Tabla profesional con funcionalidades avanzadas:
- ✅ **Selección múltiple** con checkboxes
- 🔄 **Ordenamiento** por columnas (nombre, stock, valor)
- 🏷️ **Badges de estado**: Stock (OK/Bajo/Crítico), Tipo, Clase ABC
- 👁️ **Acciones inline**: Ver, Editar, Eliminar
- 🎨 **Hover states** y resaltado de filas
- 📊 **Formato argentino** para números y moneda

```tsx
<MaterialsTable
  materials={filteredMaterials}
  selectedIds={selectedItems}
  onSelect={handleSelect}
  onSelectAll={handleSelectAll}
  onEdit={handleEdit}
  onDelete={handleDelete}
  sortBy="name"
  sortOrder="asc"
/>
```

#### 3. **BulkActionsBar** (`components/BulkActionsBar/`)
Barra flotante sticky bottom para acciones masivas:
- 📤 **Exportar** selección a CSV
- ➕ **Agregar stock** a múltiples items
- ➖ **Reducir stock** de múltiples items
- 🏷️ **Cambiar categoría** en lote
- ✏️ **Editar** propiedades comunes
- 🗑️ **Eliminar** múltiples items
- 🔄 **Contador** de items seleccionados

```tsx
<BulkActionsBar
  selectedCount={selectedItems.length}
  onExport={handleBulkExport}
  onBulkAddStock={handleBulkAddStock}
  onBulkRemoveStock={handleBulkRemoveStock}
  onBulkChangeCategory={handleBulkChangeCategory}
/>
```

#### 4. **FilterDrawer** (`components/FilterDrawer/`)
Drawer deslizante desde la derecha con filtros avanzados:
- 🏷️ **Checkboxes** para tipos (MEASURABLE, COUNTABLE, ELABORATED)
- 💰 **Dual Slider** para rango de precios
- 📊 **Toggles** para estado de stock
- 🎯 **Checkboxes** para clasificación ABC
- 🏢 **Multi-select** para proveedores
- 🔢 **Badge** con conteo de filtros activos

```tsx
<FilterDrawer
  isOpen={isFiltersOpen}
  onClose={() => setIsFiltersOpen(false)}
  filters={advancedFilters}
  onFiltersChange={setAdvancedFilters}
  suppliers={suppliersList}
/>
```

#### 5. **MaterialsCharts** (`components/MaterialsCharts/`)
Sistema de visualización de datos con Recharts v3.2.1:

**ChartCard** - Wrapper consistente con loading states
**PieChart** - Distribución ABC del inventario
**BarChart** - Top 10 materiales por valor
**LineChart** - Evolución temporal del valor de inventario

```tsx
import { ChartCard, PieChart, BarChart, LineChart } from '../MaterialsCharts';

<ChartCard title="Distribución ABC" description="Valor por clasificación">
  <PieChart
    data={abcDistribution}
    showLegend
    height={300}
  />
</ChartCard>
```

#### 6. **MaterialsManagement** (`components/MaterialsManagement/`)
Componente integrador con tabs:
- 📋 **InventoryTabEnhanced**: Vista principal con toolbar, tabla, bulk actions
- 📊 **AnalyticsTabEnhanced**: Análisis ABC con 3 gráficos + listados detallados
- 💰 **ProcurementTab**: Recomendaciones de compra (legacy)

#### 7. **Hooks de Estado** (`components/MaterialsManagement/hooks/`)
- `useInventoryState.ts`: Hook unificado que gestiona todos los estados UI
  - Filtros (búsqueda, tipo, categoría, stock status, avanzados)
  - Selección múltiple
  - Modo de vista (tabla/cards)
  - Estado del drawer de filtros
  - Ordenamiento

---

## 🔌 Integración con Supabase

### Database Schema Real

La aplicación se conecta a la tabla `items` de Supabase (no `materials`):

```sql
-- Tabla real: public.items
CREATE TABLE items (
  id uuid PRIMARY KEY,
  name varchar NOT NULL,
  type text NOT NULL,           -- 'MEASURABLE' | 'COUNTABLE' | 'ELABORATED'
  stock numeric NOT NULL,
  unit_cost numeric,
  unit varchar NOT NULL,
  category text,
  precision_digits integer,

  -- Packaging
  package_size integer,
  package_unit varchar,
  package_cost numeric,
  display_mode text,

  -- Elaborated items
  recipe_id uuid,
  requires_production boolean,
  auto_calculate_cost boolean,
  ingredients_available boolean,
  production_time integer,
  batch_size numeric,

  -- Stock control
  min_stock numeric,
  max_stock numeric,
  location varchar,
  notes text,

  created_at timestamptz,
  updated_at timestamptz
);
```

### MaterialsDataNormalizer

El servicio `materialsDataNormalizer.ts` convierte entre el schema de Supabase y el formato interno:

```typescript
// Supabase → App
fromSupabase(dbMaterial: SupabaseMaterial): MaterialItem {
  return {
    id: dbMaterial.id,
    name: dbMaterial.name,
    type: dbMaterial.type,
    unit: dbMaterial.unit,           // No 'base_unit'
    stock: dbMaterial.stock,         // No 'current_stock'
    unit_cost: dbMaterial.unit_cost, // Ya correcto
    min_stock: dbMaterial.min_stock,
    // ...
  };
}

// App → Supabase
toSupabase(material: MaterialItem): Partial<SupabaseMaterial> {
  return {
    name: material.name,
    type: material.type,
    unit: material.unit,
    stock: material.stock,
    unit_cost: material.unit_cost,
    // ...
  };
}
```

### inventoryApi.ts

Todas las operaciones usan la tabla correcta:

```typescript
// ✅ CORRECTO - usa tabla 'items'
const { data } = await supabase
  .from('items')  // NO 'materials'
  .select('*')
  .order('name');

// ✅ Normaliza datos al leer
return MaterialsDataNormalizer.normalizeArray(data);

// ✅ Actualiza stock con nombre de campo correcto
await supabase
  .from('items')
  .update({ stock: newStock })  // NO 'current_stock'
  .eq('id', id);
```

---

## 🏗️ Estructura Actualizada del Módulo

```
src/pages/admin/supply-chain/materials/
├── README.md                   # 📖 Este archivo (actualizado)
├── page.tsx                    # 🎯 Página principal con MaterialsManagement
│
├── components/                 # 🧩 Componentes UI
│   ├── index.ts               # 📦 Barrel exports
│   │
│   # ✨ NUEVOS COMPONENTES (v2.1 Professional Redesign)
│   ├── MaterialsToolbar/      # 🔍 Barra de búsqueda y filtros rápidos
│   │   ├── MaterialsToolbar.tsx
│   │   └── index.ts
│   ├── MaterialsTable/        # 📋 Tabla profesional con selección
│   │   ├── MaterialsTable.tsx
│   │   └── index.ts
│   ├── BulkActionsBar/        # ⚡ Acciones masivas sticky bottom
│   │   ├── BulkActionsBar.tsx
│   │   └── index.ts
│   ├── FilterDrawer/          # 🎛️ Drawer de filtros avanzados
│   │   ├── FilterDrawer.tsx
│   │   └── index.ts
│   ├── MaterialsCharts/       # 📊 Sistema de gráficos con Recharts
│   │   ├── ChartCard.tsx      # Wrapper con loading states
│   │   ├── PieChart.tsx       # Distribución ABC
│   │   ├── BarChart.tsx       # Top 10 materiales
│   │   ├── LineChart.tsx      # Evolución temporal
│   │   └── index.ts
│   │
│   ├── MaterialsManagement/   # 🎭 Coordinador principal con tabs
│   │   ├── MaterialsManagement.tsx
│   │   ├── InventoryTabEnhanced.tsx   # ✨ Tab principal con UI nuevo
│   │   ├── AnalyticsTabEnhanced.tsx   # ✨ Análisis ABC con gráficos
│   │   ├── ProcurementTab.tsx         # Compras (legacy)
│   │   ├── hooks/
│   │   │   ├── useInventoryState.ts   # ✨ Hook unificado de estado UI
│   │   │   └── index.ts
│   │   └── index.ts
│   │
│   # Otros componentes (legacy)
│   ├── Overview/              # 📊 Vista general y métricas
│   ├── Alerts/                # ⚠️ Alertas de stock
│   ├── SmartAlerts/           # 🤖 Alertas inteligentes
│   └── [otros componentes]/
│
├── services/                  # ⚙️ Lógica de negocio y API
│   ├── index.ts              # 📦 Barrel exports
│   ├── inventoryApi.ts       # 🌐 API calls a Supabase (tabla 'items')
│   ├── materialsDataNormalizer.ts # ✨ Normalizador DB ↔ App
│   ├── suppliersApi.ts       # 🏢 API de proveedores
│   │
│   # Business Logic Services
│   ├── stockCalculation.ts   # 📈 Cálculos de stock
│   ├── abcAnalysisEngine.ts  # 📊 Análisis ABC
│   ├── demandForecastingEngine.ts # 🔮 Previsión
│   ├── procurementRecommendationsEngine.ts # 💡 Recomendaciones
│   └── smartAlertsEngine.ts  # 🚨 Alertas inteligentes
│
├── types/                    # 🏷️ Definiciones TypeScript
│   ├── index.ts
│   ├── types.ts
│   ├── materialTypes.ts      # ✨ Tipos del nuevo sistema
│   └── abc-analysis.ts
│
└── hooks/                    # 🪝 Hooks del módulo
    ├── index.ts
    └── useMaterialsPage.ts   # Orquestador de página
```

---

## 🎯 Patrón de Implementación

### Flujo de Datos

```
┌─────────────────────────────────────────────────────────┐
│ page.tsx (MaterialsPage)                                │
│   └─▶ MaterialsManagement (tabs: Inventory/Analytics)  │
└─────────────────────────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────┐
│ InventoryTabEnhanced                                     │
│   ├─▶ useInventoryState() ─────────┐                   │
│   │   ├─ Filtros (búsqueda, tipo)  │                   │
│   │   ├─ Selección múltiple         │                   │
│   │   ├─ Modo vista (tabla/cards)   │                   │
│   │   └─ Estado drawer               │                   │
│   │                                   ▼                   │
│   ├─▶ MaterialsToolbar ◀─────── Estado UI              │
│   ├─▶ MaterialsTable                                    │
│   ├─▶ BulkActionsBar (si hay selección)                │
│   └─▶ FilterDrawer (si está abierto)                   │
└─────────────────────────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────┐
│ materialsStore (Zustand)                                 │
│   ├─▶ getFilteredItems() ─────┐                        │
│   ├─▶ selectItem()             │                        │
│   └─▶ updateItem()             │                        │
└────────────────────────────────┼─────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────┐
│ inventoryApi.ts                                          │
│   ├─▶ getItems() ──▶ Supabase.from('items')            │
│   ├─▶ updateStock()                                     │
│   └─▶ deleteItem()                                      │
└────────────────────────────────┼─────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────┐
│ MaterialsDataNormalizer                                  │
│   ├─▶ fromSupabase() ─────▶ MaterialItem               │
│   └─▶ toSupabase() ────────▶ SupabaseMaterial          │
└─────────────────────────────────────────────────────────┘
```

---

## 📊 Análisis ABC con Visualizaciones

### AnalyticsTabEnhanced

El tab de Analytics incluye:

1. **3 MetricCards** con trends:
   - Clase A (Alto Valor) - rojo
   - Clase B (Valor Medio) - naranja
   - Clase C (Bajo Valor) - verde

2. **2 Gráficos principales**:
   - **PieChart**: Distribución ABC del inventario (% del valor total)
   - **LineChart**: Evolución del valor de inventario (últimos 7 días)

3. **BarChart horizontal**:
   - Top 10 materiales por valor en stock
   - Color-coded por clase ABC

4. **Listados detallados por clase**:
   - Expandibles con primeros 5 items de cada clase
   - Muestra: nombre, categoría, stock, valor unitario, valor total

### Cálculo ABC

```typescript
// Clasificación automática en materialsStore
const totalValue = materials.reduce((sum, item) =>
  sum + (item.stock * (item.unit_cost || 0)), 0);

// A: 70-80% del valor total
// B: 15-25% del valor total
// C: 5-10% del valor total

const abcClass = ABCAnalysisEngine.classifyItem(item, totalValue);
```

---

## 🎨 Sistema de Diseño - Wrappers ChakraUI v3

**IMPORTANTE**: Todos los componentes del módulo importan desde `@/shared/ui`, NUNCA directamente de `@chakra-ui/react`.

### Componentes Wrapper Nuevos

Durante el desarrollo se crearon wrappers para componentes faltantes:

#### Menu (`src/shared/ui/Menu.tsx`)
```tsx
import { Menu, MenuRoot, MenuTrigger, MenuContent, MenuItem } from '@/shared/ui';

<MenuRoot>
  <MenuTrigger asChild>
    <Button>Opciones</Button>
  </MenuTrigger>
  <MenuContent>
    <MenuItem value="edit">Editar</MenuItem>
    <MenuItem value="delete">Eliminar</MenuItem>
  </MenuContent>
</MenuRoot>
```

#### Drawer (`src/shared/ui/Drawer.tsx`)
```tsx
import { Drawer, DrawerContent, DrawerHeader, DrawerBody } from '@/shared/ui';

<Drawer.Root open={isOpen} onOpenChange={setIsOpen}>
  <Drawer.Content>
    <Drawer.Header>
      <Drawer.Title>Filtros Avanzados</Drawer.Title>
    </Drawer.Header>
    <Drawer.Body>
      {/* Contenido */}
    </Drawer.Body>
  </Drawer.Content>
</Drawer.Root>
```

Ambos wrappers toleran **todas las props** de ChakraUI v3 mediante `ComponentProps<typeof ChakraX.Y>`.

---

## 🚀 Funcionalidades Implementadas

### ✅ Completado

- [x] **UI Profesional**: Toolbar + Table + Bulk Actions + Filter Drawer
- [x] **Búsqueda instantánea** con debounce
- [x] **Filtros rápidos**: Tipo, Categoría, Estado de Stock
- [x] **Filtros avanzados**: Tipos (checkboxes), Precio (dual slider), ABC, Proveedores
- [x] **Selección múltiple** con checkboxes en tabla
- [x] **Ordenamiento** por columnas (nombre, stock, valor)
- [x] **Badges de estado**: Stock, Tipo, Clase ABC
- [x] **Acciones inline**: Ver, Editar, Eliminar
- [x] **Export CSV** de selección
- [x] **Análisis ABC** con 3 gráficos (Pie, Line, Bar)
- [x] **Integración Supabase** con tabla `items`
- [x] **Normalizador de datos** bidireccional
- [x] **Wrappers ChakraUI v3**: Menu, Drawer

---

## 📋 Próximos Pasos (Roadmap)

### 🔧 1. Implementar Bulk Action Modals

**Estado actual**: Los bulk actions muestran notifications placeholder.

**Implementación propuesta**:

```typescript
// components/BulkActionsModals/BulkStockModal.tsx
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter } from '@/shared/ui';
import { NumberField } from '@/shared/ui';

export function BulkStockModal({
  isOpen,
  onClose,
  selectedItems,
  action // 'add' | 'remove'
}) {
  const [quantity, setQuantity] = useState(0);
  const [reason, setReason] = useState('');

  const handleSubmit = async () => {
    // Para cada item seleccionado
    for (const itemId of selectedItems) {
      const currentItem = await inventoryApi.getItem(itemId);
      const newStock = action === 'add'
        ? currentItem.stock + quantity
        : currentItem.stock - quantity;

      // Actualizar stock
      await inventoryApi.updateStock(itemId, newStock);

      // Crear registro en stock_entries
      await inventoryApi.createStockEntry({
        item_id: itemId,
        type: action === 'add' ? 'IN' : 'OUT',
        quantity,
        reason,
        timestamp: new Date().toISOString()
      });
    }

    // Refrescar store
    await materialsStore.loadItems();
    onClose();
  };

  return (
    <Modal.Root open={isOpen} onClose={onClose}>
      <Modal.Content>
        <Modal.Header>
          <Modal.Title>
            {action === 'add' ? 'Agregar Stock' : 'Reducir Stock'}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Stack gap="md">
            <Text>Items seleccionados: {selectedItems.length}</Text>
            <NumberField
              label="Cantidad"
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
              min={0}
            />
            <TextareaField
              label="Motivo"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Ej: Compra recibida, ajuste de inventario..."
            />
          </Stack>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="outline" onClick={onClose}>Cancelar</Button>
          <Button colorPalette="blue" onClick={handleSubmit}>
            Confirmar
          </Button>
        </Modal.Footer>
      </Modal.Content>
    </Modal.Root>
  );
}
```

**Archivos a crear**:
- `BulkStockModal.tsx` (agregar/reducir stock)
- `BulkCategoryModal.tsx` (cambiar categoría)
- `BulkEditModal.tsx` (editar propiedades comunes)
- `BulkDeleteConfirmModal.tsx` (confirmar eliminación múltiple)

**Integración**:
```tsx
// InventoryTabEnhanced.tsx
const [bulkStockModalOpen, setBulkStockModalOpen] = useState(false);
const [bulkAction, setBulkAction] = useState<'add' | 'remove'>('add');

<BulkStockModal
  isOpen={bulkStockModalOpen}
  onClose={() => setBulkStockModalOpen(false)}
  selectedItems={selectedItems}
  action={bulkAction}
/>
```

---

### 📥 2. Import CSV Functionality

**Estado actual**: Botón "Importar" es placeholder.

**Implementación propuesta**:

```typescript
// components/ImportCSVModal/ImportCSVModal.tsx
import Papa from 'papaparse'; // npm install papaparse @types/papaparse

export function ImportCSVModal({ isOpen, onClose }) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<MaterialItem[]>([]);
  const [errors, setErrors] = useState<string[]>([]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    setFile(selectedFile);

    // Parse CSV
    Papa.parse(selectedFile, {
      header: true,
      complete: (results) => {
        // Validar y normalizar datos
        const items = results.data.map(row => ({
          name: row.name,
          type: row.type || 'MEASURABLE',
          unit: row.unit,
          stock: parseFloat(row.stock || '0'),
          unit_cost: parseFloat(row.unit_cost || '0'),
          min_stock: parseFloat(row.min_stock || '0'),
          category: row.category
        }));

        // Validar
        const validationErrors = validateItems(items);
        setErrors(validationErrors);
        setPreview(items);
      },
      error: (error) => {
        setErrors([error.message]);
      }
    });
  };

  const handleImport = async () => {
    // Importar cada item
    for (const item of preview) {
      await inventoryApi.createItem(item);
    }

    await materialsStore.loadItems();
    onClose();
  };

  return (
    <Modal.Root open={isOpen} onClose={onClose} size="xl">
      <Modal.Content>
        <Modal.Header>
          <Modal.Title>Importar Materiales desde CSV</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Stack gap="lg">
            {/* File input */}
            <input type="file" accept=".csv" onChange={handleFileSelect} />

            {/* Instrucciones */}
            <Alert>
              <Alert.Icon />
              <Alert.Description>
                El archivo CSV debe contener las columnas: name, type, unit, stock, unit_cost, min_stock, category
              </Alert.Description>
            </Alert>

            {/* Errores */}
            {errors.length > 0 && (
              <Alert status="error">
                <Alert.Icon />
                <Alert.Title>Errores de validación</Alert.Title>
                <Alert.Description>
                  <ul>
                    {errors.map((err, i) => <li key={i}>{err}</li>)}
                  </ul>
                </Alert.Description>
              </Alert>
            )}

            {/* Preview */}
            {preview.length > 0 && (
              <Box>
                <Text fontWeight="medium" mb="sm">
                  Vista previa ({preview.length} items)
                </Text>
                <MaterialsTable
                  materials={preview.slice(0, 5)}
                  selectedIds={[]}
                  onSelect={() => {}}
                  onSelectAll={() => {}}
                />
              </Box>
            )}
          </Stack>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="outline" onClick={onClose}>Cancelar</Button>
          <Button
            colorPalette="blue"
            onClick={handleImport}
            disabled={errors.length > 0 || preview.length === 0}
          >
            Importar {preview.length} items
          </Button>
        </Modal.Footer>
      </Modal.Content>
    </Modal.Root>
  );
}
```

**Template CSV de ejemplo**:
```csv
name,type,unit,stock,unit_cost,min_stock,category
Harina 000,MEASURABLE,kg,50,850.50,10,Harinas
Leche Entera,MEASURABLE,litros,30,450.00,5,Lácteos
Huevos,COUNTABLE,unidad,200,25.00,50,Proteínas
```

---

### 📊 3. Real Stock Evolution Data

**Estado actual**: LineChart usa datos simulados con variación aleatoria.

**Implementación propuesta**:

```typescript
// services/stockHistoryApi.ts
export const stockHistoryApi = {
  /**
   * Obtiene el historial de valor de inventario por día
   */
  async getStockValueHistory(days: number = 7): Promise<StockValueHistory[]> {
    // Opción 1: Agregar desde stock_entries
    const { data, error } = await supabase
      .rpc('get_stock_value_history', { days_back: days });

    if (error) throw error;
    return data;
  }
};

// Migration SQL para crear función
CREATE OR REPLACE FUNCTION get_stock_value_history(days_back integer DEFAULT 7)
RETURNS TABLE (
  date date,
  total_value numeric
) AS $$
BEGIN
  RETURN QUERY
  WITH daily_snapshots AS (
    -- Calcular valor de inventario para cada día
    SELECT
      date_trunc('day', se.created_at)::date as snapshot_date,
      SUM(i.stock * i.unit_cost) as value
    FROM stock_entries se
    JOIN items i ON i.id = se.item_id
    WHERE se.created_at >= NOW() - (days_back || ' days')::interval
    GROUP BY snapshot_date
    ORDER BY snapshot_date DESC
  )
  SELECT
    snapshot_date as date,
    value as total_value
  FROM daily_snapshots;
END;
$$ LANGUAGE plpgsql;
```

**Opción 2 (sin función SQL)**:
```typescript
// Agregar campo updated_at con timestamp
// Crear tabla stock_value_snapshots para snapshots diarios
async getDailyStockValues(days: number = 7) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const { data, error } = await supabase
    .from('stock_value_snapshots')
    .select('date, total_value')
    .gte('date', startDate.toISOString())
    .order('date', { ascending: true });

  return data || [];
}

// Job diario que calcula y guarda snapshot
async createDailySnapshot() {
  const { data: items } = await supabase
    .from('items')
    .select('stock, unit_cost');

  const totalValue = items.reduce((sum, item) =>
    sum + (item.stock * item.unit_cost), 0);

  await supabase
    .from('stock_value_snapshots')
    .insert({
      date: new Date().toISOString().split('T')[0],
      total_value: totalValue
    });
}
```

**Integración en AnalyticsTabEnhanced**:
```typescript
const [stockHistory, setStockHistory] = useState<LineChartDataPoint[]>([]);

useEffect(() => {
  stockHistoryApi.getStockValueHistory(7).then(data => {
    const chartData = data.map(d => ({
      name: new Date(d.date).toLocaleDateString('es-AR', {
        day: '2-digit',
        month: 'short'
      }),
      value: d.total_value
    }));
    setStockHistory(chartData);
  });
}, []);

<LineChart data={stockHistory} dataKey="value" />
```

---

### 🏢 4. Load Real Suppliers

**Estado actual**: FilterDrawer tiene `suppliers={[]}` vacío.

**Implementación propuesta**:

```typescript
// services/suppliersApi.ts (ampliar)
export const suppliersApi = {
  async getSuppliers(): Promise<Supplier[]> {
    const { data, error } = await supabase
      .from('suppliers')
      .select('*')
      .order('name');

    if (error) throw error;
    return data || [];
  },

  async getSuppliersByMaterials(materialIds: string[]): Promise<Supplier[]> {
    // Obtener suppliers únicos de los materiales
    const { data: items } = await supabase
      .from('items')
      .select('supplier_id')
      .in('id', materialIds);

    const supplierIds = [...new Set(items?.map(i => i.supplier_id).filter(Boolean))];

    if (supplierIds.length === 0) return [];

    const { data: suppliers } = await supabase
      .from('suppliers')
      .select('*')
      .in('id', supplierIds);

    return suppliers || [];
  }
};

// Integrar en materialsStore
export const useMaterials = create<MaterialsState>((set, get) => ({
  // ... existing state
  suppliers: [],

  async loadSuppliers() {
    const suppliers = await suppliersApi.getSuppliers();
    set({ suppliers });
  },

  // Cargar automáticamente con items
  async loadItems() {
    const items = await inventoryApi.getItems();
    set({ items });

    // Cargar suppliers en paralelo
    get().loadSuppliers();
  }
}));
```

**Schema de tabla suppliers** (si no existe):
```sql
CREATE TABLE suppliers (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name varchar NOT NULL,
  contact_person varchar,
  email varchar,
  phone varchar,
  address text,
  rating numeric CHECK (rating >= 0 AND rating <= 5),
  active boolean DEFAULT true,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Agregar FK en items si no existe
ALTER TABLE items
ADD COLUMN supplier_id uuid REFERENCES suppliers(id);
```

**Integración en FilterDrawer**:
```typescript
// InventoryTabEnhanced.tsx
const { suppliers } = useMaterials();

<FilterDrawer
  suppliers={suppliers}
  filters={advancedFilters}
  onFiltersChange={setAdvancedFilters}
/>
```

---

### 📄 5. Pagination para Tablas Grandes

**Estado actual**: MaterialsTable muestra todos los items sin paginación.

**Implementación propuesta**:

```typescript
// components/MaterialsTable/MaterialsTable.tsx
import { Pagination } from '@/shared/ui'; // Crear si no existe

interface MaterialsTableProps {
  // ... existing props
  currentPage?: number;
  pageSize?: number;
  totalItems?: number;
  onPageChange?: (page: number) => void;
}

export function MaterialsTable({
  materials,
  currentPage = 1,
  pageSize = 50,
  totalItems,
  onPageChange,
  ...props
}) {
  // Calcular items de la página actual
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedMaterials = materials.slice(startIndex, endIndex);

  return (
    <Stack direction="column" gap="md">
      <Table.Root>
        {/* ... tabla con paginatedMaterials ... */}
      </Table.Root>

      {totalItems > pageSize && (
        <Pagination
          currentPage={currentPage}
          totalPages={Math.ceil(totalItems / pageSize)}
          onPageChange={onPageChange}
          showFirstLast
          showPrevNext
        />
      )}
    </Stack>
  );
}
```

**Hook de paginación**:
```typescript
// hooks/usePagination.ts
export function usePagination<T>(
  items: T[],
  initialPageSize: number = 50
) {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(initialPageSize);

  const totalPages = Math.ceil(items.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedItems = items.slice(startIndex, endIndex);

  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  return {
    currentPage,
    pageSize,
    totalPages,
    paginatedItems,
    goToPage,
    setPageSize,
    hasNext: currentPage < totalPages,
    hasPrev: currentPage > 1
  };
}
```

**Integración**:
```typescript
// InventoryTabEnhanced.tsx
const {
  paginatedItems,
  currentPage,
  totalPages,
  goToPage
} = usePagination(filteredMaterials, 50);

<MaterialsTable
  materials={paginatedItems}
  currentPage={currentPage}
  totalPages={totalPages}
  onPageChange={goToPage}
/>
```

---

### 🔄 6. Real-time Subscriptions con Supabase

**Implementación propuesta**:

```typescript
// hooks/useRealtimeMaterials.ts
import { useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';
import { useMaterials } from '@/store/materialsStore';

export function useRealtimeMaterials() {
  const { loadItems } = useMaterials();

  useEffect(() => {
    // Suscribirse a cambios en la tabla items
    const subscription = supabase
      .channel('materials-changes')
      .on(
        'postgres_changes',
        {
          event: '*', // INSERT, UPDATE, DELETE
          schema: 'public',
          table: 'items'
        },
        (payload) => {
          console.log('Change detected:', payload);

          // Recargar items cuando haya cambios
          loadItems();

          // Opcional: notificar al usuario
          if (payload.eventType === 'INSERT') {
            notify.success(`Nuevo material agregado: ${payload.new.name}`);
          } else if (payload.eventType === 'UPDATE') {
            notify.info(`Material actualizado: ${payload.new.name}`);
          } else if (payload.eventType === 'DELETE') {
            notify.warning(`Material eliminado`);
          }
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [loadItems]);
}
```

**Integración**:
```typescript
// page.tsx o InventoryTabEnhanced.tsx
import { useRealtimeMaterials } from '../hooks/useRealtimeMaterials';

export function MaterialsPage() {
  // Activar subscriptions en tiempo real
  useRealtimeMaterials();

  return (
    <ContentLayout>
      <MaterialsManagement />
    </ContentLayout>
  );
}
```

**Optimización - Updates selectivos**:
```typescript
// En lugar de recargar todos los items, actualizar selectivamente
const subscription = supabase
  .channel('materials-changes')
  .on('postgres_changes', { event: 'UPDATE', ... }, (payload) => {
    // Actualizar solo el item modificado
    const updatedItem = MaterialsDataNormalizer.fromSupabase(payload.new);
    useMaterials.getState().updateItemInStore(updatedItem);
  })
  .on('postgres_changes', { event: 'INSERT', ... }, (payload) => {
    const newItem = MaterialsDataNormalizer.fromSupabase(payload.new);
    useMaterials.getState().addItemToStore(newItem);
  })
  .on('postgres_changes', { event: 'DELETE', ... }, (payload) => {
    useMaterials.getState().removeItemFromStore(payload.old.id);
  })
  .subscribe();
```

---

### 🔗 7. Suppliers Module Integration

**Implementación propuesta**:

```typescript
// Crear módulo suppliers en estructura paralela
src/pages/admin/supply-chain/suppliers/
├── page.tsx
├── components/
│   ├── SuppliersList/
│   ├── SupplierForm/
│   └── SupplierAnalytics/
├── services/
│   ├── suppliersApi.ts
│   └── supplierAnalysisEngine.ts
└── types/
    └── supplier.ts

// Integrar en materials - Link a supplier desde item
// components/MaterialFormModal.tsx (ampliar)
<SelectField
  label="Proveedor"
  value={formData.supplier_id}
  onChange={(e) => setFormData({ ...formData, supplier_id: e.target.value })}
>
  {suppliers.map(supplier => (
    <option key={supplier.id} value={supplier.id}>
      {supplier.name}
    </option>
  ))}
</SelectField>

// Botón para crear supplier on-the-fly
<Button
  size="sm"
  variant="outline"
  onClick={() => setShowSupplierForm(true)}
>
  <PlusIcon /> Nuevo Proveedor
</Button>

// Mostrar info de supplier en MaterialsTable
<Tooltip content={item.supplier?.name || 'Sin proveedor'}>
  <Badge>{item.supplier?.name?.substring(0, 20)}</Badge>
</Tooltip>

// materials escucha eventos de suppliers
eventBus.on('suppliers:price_updated', ({ supplierId, newPrice }) => {
  // Recalcular costos de materiales de ese proveedor
  const affectedItems = useMaterials.getState().items
    .filter(item => item.supplier_id === supplierId);

  affectedItems.forEach(item => {
    const updatedCost = calculateNewCost(item, newPrice);
    inventoryApi.updateItem(item.id, { unit_cost: updatedCost });
  });
});

// materials emite eventos hacia suppliers
eventBus.emit('materials:low_stock', {
  materialId,
  supplierId,
  currentStock,
  minStock
});
// suppliers puede generar orden de compra automática
```

---

## 🎯 Resumen de Tareas Pendientes

| Tarea | Prioridad | Complejidad | Estimación |
|-------|-----------|-------------|------------|
| **Bulk Action Modals** | 🔴 Alta | Media | 4-6 horas |
| **Import CSV** | 🟡 Media | Media | 3-4 horas |
| **Real Stock Evolution** | 🟡 Media | Alta | 4-6 horas (incluye SQL) |
| **Load Real Suppliers** | 🟢 Baja | Baja | 1-2 horas |
| **Pagination** | 🟡 Media | Baja | 2-3 horas |
| **Real-time Subscriptions** | 🟢 Baja | Media | 2-3 horas |
| **Suppliers Integration** | 🔴 Alta | Alta | 8-12 horas (módulo completo) |

**Total estimado**: 24-36 horas de desarrollo

---

## 🧪 Testing Strategy

### Tests Requeridos

```typescript
// __tests__/components/MaterialsTable.test.tsx
describe('MaterialsTable', () => {
  it('should render materials list', () => {});
  it('should handle selection', () => {});
  it('should sort by column', () => {});
  it('should show inline actions', () => {});
});

// __tests__/services/materialsDataNormalizer.test.ts
describe('MaterialsDataNormalizer', () => {
  it('should normalize from Supabase format', () => {});
  it('should convert to Supabase format', () => {});
  it('should handle missing fields', () => {});
});

// __tests__/hooks/useInventoryState.test.ts
describe('useInventoryState', () => {
  it('should manage filters state', () => {});
  it('should handle selection', () => {});
  it('should toggle view mode', () => {});
});
```

---

## 📚 Referencias Técnicas

### Dependencias Nuevas
- **Recharts v3.2.1**: Visualizaciones de datos (PieChart, BarChart, LineChart)
- **Papa Parse** (próximo): Import/Export CSV
- **@chakra-ui/react v3.23.0**: Base UI framework
- **Decimal.js**: Precisión en cálculos monetarios

### Patrones Aplicados
- ✅ **Composition Pattern**: Componentes pequeños y componibles
- ✅ **Custom Hooks**: Separación de lógica UI (useInventoryState)
- ✅ **Normalization Layer**: MaterialsDataNormalizer para DB ↔ App
- ✅ **Wrapper Pattern**: Menu, Drawer para ChakraUI v3
- ✅ **State Management**: Zustand para estado global
- ✅ **Real-time Ready**: Preparado para subscriptions de Supabase

---

**📅 Última actualización**: 2025-01-11
**✨ Versión UI**: v2.1 - Professional Redesign
**🎯 Estado**: Funcional con tareas pendientes documentadas
**👥 Mantenedores**: G-Admin Team

---

Este README documenta el rediseño completo del módulo Materials v2.1 con implementación de UI profesional, integración Supabase, y roadmap detallado de próximos pasos con investigación técnica.
