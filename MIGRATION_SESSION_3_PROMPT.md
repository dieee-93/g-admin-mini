# 🎯 PROMPT PARA SESIÓN 3: COMPLETAR MIGRACIÓN DE DUPLICACIONES

## 📋 **CONTEXTO ACTUAL**

**Ya completamos exitosamente:**
- ✅ **Sistema centralizado creado**: `useCrudOperations`, `FinancialCalculations`, `EntitySchemas` 
- ✅ **320 líneas eliminadas** en 7 archivos migrados
- ✅ **Patrón validado**: Todos los archivos migrados compilan y mantienen 100% compatibilidad

**Estado actual del proyecto:**
- Sistema unificado funcionando perfectamente
- Interfaz pública mantenida en todos los hooks migrados  
- TypeScript compilation exitosa
- Real-time + caching automático funcionando

## 🎯 **OBJETIVO DE ESTA SESIÓN**

Completar la eliminación de código duplicado restante aprovechando los sistemas centralizados ya creados y funcionando.

## 📊 **DUPLICACIONES PENDIENTES IDENTIFICADAS**

### **🔴 PRIORIDAD ALTA: HOOKS CRUD (1,200+ líneas eliminables)**

**Patrón a buscar**: Hooks con `useState + useEffect + useCallback` manual
**Sistema objetivo**: Usar `src/hooks/core/useCrudOperations.ts`

**Archivos específicos a migrar:**
1. `src/pages/admin/products/hooks/useMenuEngineering.ts` (~240 líneas)
2. `src/pages/admin/sales/hooks/useSalesCart.ts` (~300 líneas)  
3. `src/pages/admin/customers/hooks/useCustomerTags.ts` (~230 líneas)
4. `src/pages/admin/fiscal/hooks/useFiscal.ts` (~45 líneas)
5. `src/pages/admin/scheduling/hooks/useScheduling.ts` (~150 líneas)

**Template de migración exitoso:**
```typescript
// ANTES (patrón manual duplicado):
const [items, setItems] = useState([]);
const [loading, setLoading] = useState(true);
const [error, setError] = useState(null);

const loadItems = useCallback(async () => {
  try {
    setLoading(true);
    setError(null);
    const data = await fetchItems();
    setItems(data);
  } catch (err) {
    setError(err.message);
  } finally {
    setLoading(false);
  }
}, []);

// DESPUÉS (sistema unificado):
const crud = useCrudOperations({
  tableName: 'items',
  schema: EntitySchemas.item,
  enableRealtime: true,
  cacheKey: 'items'
});

return {
  items: crud.items,
  loading: crud.loading,
  error: crud.error,
  loadItems: crud.refresh
};
```

### **🟡 PRIORIDAD MEDIA: formatCurrency RESTANTES (200+ líneas eliminables)**

**Patrón a buscar**: `new Intl.NumberFormat` duplicado
**Sistema objetivo**: Usar `QuickCalculations.formatCurrency`

**Archivos restantes con formatCurrency:**
- `src/pages/admin/staff/components/LaborCostDashboard.tsx`
- `src/pages/admin/staff/components/sections/ManagementSection.tsx`
- `src/pages/admin/materials/components/ProcurementRecommendationsTab.tsx`
- `src/pages/admin/materials/components/analytics/ABCAnalysisSection.tsx`
- `src/pages/admin/fiscal/components/sections/AFIPIntegration.tsx`
- `src/pages/admin/fiscal/components/sections/FinancialReporting.tsx`
- `src/pages/admin/fiscal/components/sections/TaxCompliance.tsx`
- `src/pages/admin/scheduling/components/sections/RealTimeLaborTracker.tsx`
- +8 archivos más (24 total - 4 ya migrados = 20 restantes)

**Template de migración exitoso:**
```typescript
// ANTES (duplicado):
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('es-ES', {
    style: 'currency', 
    currency: 'USD'
  }).format(amount);
};

// DESPUÉS (centralizado):
import { QuickCalculations } from '@/business-logic/shared/FinancialCalculations';
// Reemplazar todas las llamadas: formatCurrency(x) → QuickCalculations.formatCurrency(x)
```

### **🟢 PRIORIDAD BAJA: Math.* HARDCODED (150+ líneas eliminables)**

**Archivos con cálculos manuales:**
- `src/business-logic/financial/financialPlanningEngine.ts` (Math.*, parseFloat hardcoded)
- `src/business-logic/fiscal/taxCalculationService.ts` (operaciones sin DecimalUtils)
- `src/pages/admin/operations/tables.tsx` (Math.floor, divisiones manuales)

## ⚠️ **ERRORES COMUNES A EVITAR (APRENDIZAJES)**

### **1. Compatibilidad de Interfaz**
- ✅ **HACER**: Mantener exactamente la misma interfaz pública del hook original
- ❌ **NO HACER**: Cambiar nombres de métodos o estructura de retorno
- **Ejemplo exitoso**: `useCustomers.ts` mantiene `addCustomer`, `editCustomer`, `removeCustomer`

### **2. Manejo de Estados**
- ✅ **HACER**: Mapear estados del sistema unificado: `crud.loading`, `crud.error`, `crud.items`
- ❌ **NO HACER**: Crear estados locales adicionales innecesarios
- **Ejemplo**: `loading: crud.loading` (no crear `useState` adicional)

### **3. Imports y Dependencies**
- ✅ **HACER**: Verificar que el archivo se pueda leer antes de editarlo
- ✅ **HACER**: Agregar import de `QuickCalculations` o `useCrudOperations`
- ❌ **NO HACER**: Asumir que los imports existen

### **4. Compilación TypeScript**
- ✅ **HACER**: Verificar `npx tsc --noEmit` después de cada migración
- ✅ **HACER**: Corregir errores de `any` y variables no usadas
- **Patrón exitoso**: `eslint-disable-next-line @typescript-eslint/no-unused-vars` cuando sea necesario

### **5. Linting**
- **Error común**: `'formatCurrency' is assigned a value but never used`
- **Solución**: Reemplazar la función eliminada con comentario `// MIGRATED: Use centralized...`

## 🛠️ **METODOLOGÍA RECOMENDADA**

### **Paso 1: Auditoría Rápida (10 min)**
```bash
# Encontrar hooks CRUD duplicados
grep -r "useState.*loading" src/pages/admin/*/hooks/ --include="*.ts"

# Encontrar formatCurrency duplicados  
grep -r "formatCurrency\|new Intl.NumberFormat" src/pages/admin/ --include="*.tsx"

# Contar líneas eliminables
wc -l [archivo_identificado]
```

### **Paso 2: Migración Sistemática (por prioridad)**
1. **Leer archivo completo** para entender la interfaz
2. **Identificar patrón duplicado** (useState + useEffect vs sistema unificado)  
3. **Migrar manteniendo interfaz** pública exacta
4. **Verificar compilación** con `npx tsc --noEmit`
5. **Próximo archivo**

### **Paso 3: Verificación Final**
- Compilación TypeScript exitosa
- Linting limpio en archivos migrados
- Interfaz pública mantenida al 100%

## 📊 **MÉTRICAS OBJETIVO**

### **ROI Esperado:**
- **Hooks CRUD**: 6 archivos × ~200 líneas promedio = **1,200 líneas eliminadas**
- **formatCurrency**: 20 archivos × ~6 líneas promedio = **120 líneas eliminadas**  
- **Math hardcoded**: 3 archivos × ~50 líneas promedio = **150 líneas eliminadas**

### **TOTAL SESIÓN 3: ~1,470 líneas eliminables**
### **GRAN TOTAL: 320 (ya eliminadas) + 1,470 = 1,790 líneas**

## 🎯 **INSTRUCCIONES ESPECÍFICAS PARA CLAUDE**

**Empezar con:** `src/pages/admin/products/hooks/useMenuEngineering.ts` (hook más grande)

**Usar TODO list** para trackear progreso:
1. Migrar useMenuEngineering.ts
2. Migrar useSalesCart.ts  
3. Migrar useCustomerTags.ts
4. Quick wins: 5-10 formatCurrency
5. Verificación final

**Al encontrar errores:**
- Mantener interfaz pública exacta
- Usar `eslint-disable` para variables no usadas cuando sea necesario
- Verificar compilación después de cada archivo
- Si un hook es muy complejo, crear versión migrada paralela primero

**Estrategia híbrida:** Alternar entre hooks grandes (impacto) y formatCurrency (victorias rápidas)

## ✅ **CRITERIO DE ÉXITO**

- [ ] 1,200+ líneas eliminadas de hooks CRUD
- [ ] 120+ líneas eliminadas de formatCurrency  
- [ ] Compilación TypeScript exitosa
- [ ] Interfaces públicas 100% mantenidas
- [ ] Real-time + caching funcionando automáticamente

**Al completar:** Crear reporte final con métricas exactas y archivos migrados.

---

**🚀 ¡Listos para eliminar 1,470+ líneas adicionales de código duplicado!**