# 🔧 Fiscal Module - ESLint Fixes Action Plan

**Status**: 54/57 errors remaining after initial fixes
**Priority**: HIGH - Must fix before production
**Estimated Time**: 1-2 hours

---

## ✅ Fixed (3/57)

1. ✅ **FinancialReporting.tsx** - Fixed parsing error on line 290
2. ✅ **page.tsx** - Removed unused imports (WifiIcon, NoSymbolIcon, shouldShowOfflineView)
3. ✅ **TaxSummary.tsx** - Removed unused InformationCircleIcon

---

## 🚧 Remaining Issues (54)

### Category 1: `any` Types (17 errors) - HIGH PRIORITY

Replace `any` with proper types to ensure type safety.

#### useFiscalPage.ts (6 errors)
```typescript
// Line 130: fiscalStats
fiscalStats: any; // ❌ REPLACE WITH
fiscalStats: FiscalStats | null; // ✅

// Line 150: alertsData
alertsData: any[]; // ❌ REPLACE WITH
alertsData: FiscalAlert[]; // ✅

// Lines 385, 421, 636, 726: error parameters
} catch (error: any) { // ❌ REPLACE WITH
} catch (error: unknown) { // ✅
const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
```

**New Type Needed**:
```typescript
// Add to types/fiscalTypes.ts
export interface FiscalAlert {
  type: 'connection' | 'cae' | 'compliance' | 'queue';
  severity: 'low' | 'medium' | 'high';
  message: string;
  action?: string;
}
```

#### fiscalApi.ts (8 errors)
```typescript
// Lines 117, 186, 232, 243, 283, 326, 463, 520, 529
} catch (error: any) { // ❌ REPLACE WITH
} catch (error: unknown) { // ✅
logger.error('FiscalApi', 'Error description', error instanceof Error ? error.message : error);
```

#### FiscalAnalyticsEnhanced.tsx (2 errors)
```typescript
// Lines 84, 121
data: any[] // ❌ REPLACE WITH
data: ChartDataPoint[] // ✅

// New type:
interface ChartDataPoint {
  month?: string;
  label?: string;
  value: number;
  [key: string]: string | number | undefined;
}
```

#### FiscalFormEnhanced.tsx (3 errors)
```typescript
// Lines 64, 374, 461
handleSubmit: (data: any) => void // ❌ REPLACE WITH
handleSubmit: (data: InvoiceFormData) => void // ✅

// Use existing InvoiceGenerationData from fiscalTypes.ts
```

#### InvoiceGeneration.tsx (3 errors)
```typescript
// Lines 117, 119, 181
onChange={(e: any) => // ❌ REPLACE WITH
onChange={(e: React.ChangeEvent<HTMLInputElement>) => // ✅
```

#### useFiscalDocumentForm.tsx (1 error)
```typescript
// Line 200
value: any // ❌ REPLACE WITH
value: string | number // ✅
```

---

### Category 2: Unused Variables (15 errors) - MEDIUM PRIORITY

Remove or use these variables to clean up code.

#### FiscalAnalyticsEnhanced.tsx (4 errors)
```typescript
// Lines 299, 490, 541, 616 - Unused map index parameter
.map((item, _) => // ❌ CHANGE TO
.map((item, __unused) => // ✅ OR
.map((item) => // ✅ If index truly not needed
```

#### FiscalFormEnhanced.tsx (3 errors)
```typescript
// Line 12-13: Remove unused imports
import InvoiceAnalysis from './components/InvoiceAnalysis'; // ❌ DELETE
import TaxBreakdown from './components/TaxBreakdown'; // ❌ DELETE

// Line 241: Remove or use form destructuring
const { register, errors, isSubmitting } = form; // ❌ CHANGE TO
const { } = form; // ✅ If truly unused, or implement form validation
```

#### FiscalDocumentFormModal.tsx (1 error)
```typescript
// Line 95: Remove unused function
const validateCUITFormat = (cuit: string) => { ... }; // ❌ DELETE or USE
// If validation needed, move to validation service and import
```

#### InvoiceGeneration.tsx (1 error)
```typescript
// Line 59: Remove unused state variable
const [showCreateModal, setShowCreateModal] = useState(false); // ❌ CHANGE TO
const [, setShowCreateModal] = useState(false); // ✅ Keep setter only
```

#### OfflineFiscalView.tsx (1 error)
```typescript
// Line 238: Prefix unused error
} catch (error) { // ❌ CHANGE TO
} catch (_error) { // ✅
```

#### TaxCompliance.tsx (2 errors)
```typescript
// Line 140: Prefix unused error
} catch (error) { // ❌ CHANGE TO
} catch (_error) { // ✅

// Line 242: Prefix or use reportData
const reportData = await generateReport(); // ❌ CHANGE TO
const _reportData = await generateReport(); // ✅ OR use it in UI
```

#### useFiscalDocumentForm.tsx (1 error)
```typescript
// Line 189: Prefix unused error
} catch (error) { // ❌ CHANGE TO
} catch (_error) { // ✅
```

#### fiscalApi.ts (6 errors)
```typescript
// Unused function parameters - prefix with _ to indicate intentionally unused

// Line 261: periodo
getTaxReport(periodo: string) { // ❌ CHANGE TO
getTaxReport(_periodo: string) { // ✅

// Line 272: periodo, tipo
getTaxReportSummary(periodo: string, tipo: string) { // ❌ CHANGE TO
getTaxReportSummary(_periodo: string, _tipo: string) { // ✅

// Line 319: periodo
getTaxProjection(periodo: string) { // ❌ CHANGE TO
getTaxProjection(_periodo: string) { // ✅

// Line 348: reportId, format
exportTaxReport(reportId: string, format: 'pdf' | 'excel' | 'csv') { // ❌ CHANGE TO
exportTaxReport(_reportId: string, _format: 'pdf' | 'excel' | 'csv') { // ✅

// Line 359: periodo
getTaxFilingStatus(periodo: string) { // ❌ CHANGE TO
getTaxFilingStatus(_periodo: string) { // ✅

// Line 599: invoiceId
cancelInvoice(invoiceId: string) { // ❌ CHANGE TO
cancelInvoice(_invoiceId: string) { // ✅
```

#### fiscalApi.multi-location.ts (4 errors)
```typescript
// Line 20: Remove unused import
import { FinancialReport, ... } from '../types/fiscalTypes'; // ❌ CHANGE TO
import { /* FinancialReport removed */, ... } from '../types/fiscalTypes'; // ✅

// Line 23: Remove unused import
import { CondicionIVA, ... } from '../types/fiscalTypes'; // ❌ CHANGE TO
import { /* CondicionIVA removed */, ... } from '../types/fiscalTypes'; // ✅

// Line 150: puntoVenta unused
async generateInvoiceNumber(puntoVenta: number) { // ❌ CHANGE TO
async generateInvoiceNumber(_puntoVenta: number) { // ✅

// Line 453: reportType unused
generateConsolidatedTaxReport(reportType: string) { // ❌ CHANGE TO
generateConsolidatedTaxReport(_reportType: string) { // ✅
```

---

### Category 3: React Hook Warnings (3 warnings) - LOW PRIORITY

Fix missing dependencies in useEffect hooks.

#### useFiscalPage.ts (3 warnings)
```typescript
// Line 430: Missing selectedLocation dependency
useEffect(() => {
  // ... uses selectedLocation.id
}, [selectedLocation?.id, isMultiLocationMode, pageState.fiscalViewMode]);
// ❌ CHANGE TO
}, [selectedLocation, isMultiLocationMode, pageState.fiscalViewMode]); // ✅

// Line 531: Missing actions and setQuickActions
useEffect(() => {
  setQuickActions(getQuickActionsForTab(pageState.activeTab));
  return () => setQuickActions([]);
}, [pageState.activeTab]);
// ❌ CHANGE TO
// Either:
// 1. Add to deps (may cause infinite loop - check carefully)
}, [pageState.activeTab, actions, setQuickActions]); // ✅

// OR 2. Use useCallback for actions
const actions = useCallback(() => ({ ... }), [deps]);

// Line 848: Missing multiple metric dependencies
useMemo(() => ({
  // ... uses metrics.facturacionMesActual, metrics.crecimientoFacturacion, etc.
}), [taxConfiguration, isOnline, isMultiLocationMode, selectedLocation, afipConfig, pageState.fiscalViewMode]);
// ❌ ADD all metrics used inside
}, [...currentDeps, metrics]); // ✅ BUT check for performance impact
```

---

## 🎯 Recommended Fix Order

### Phase 1: Critical Fixes (30 min)
1. ✅ Fix `any` types in useFiscalPage.ts (add FiscalAlert interface)
2. ✅ Fix `any` types in fiscalApi.ts (replace with `unknown`)
3. ✅ Fix `any` types in FiscalAnalyticsEnhanced.tsx (add ChartDataPoint type)

### Phase 2: Code Cleanup (20 min)
4. ✅ Remove unused imports (FiscalFormEnhanced, fiscalApi.multi-location)
5. ✅ Prefix unused error variables with `_`
6. ✅ Prefix unused function parameters with `_`
7. ✅ Remove unused state variables

### Phase 3: React Hook Fixes (10 min)
8. ⚠️ Review React Hook warnings carefully (may cause infinite loops)
9. ⚠️ Add missing dependencies or use useCallback/useMemo correctly

---

## 🛠️ Automated Fix Script

Use the provided `fix_fiscal_lint.cjs` script to automate some fixes:

```bash
node fix_fiscal_lint.cjs
```

**What it fixes**:
- Unused error variables → `_error`
- Unused function parameters → `_param`
- Unused imports → removal

**Manual fixes still needed**:
- `any` type replacements (requires type definitions)
- React Hook warnings (requires careful analysis)

---

## ✅ Validation

After fixes, run:

```bash
# Check ESLint
pnpm -s exec eslint src/modules/fiscal src/pages/admin/finance/fiscal

# Check TypeScript
pnpm -s exec tsc --noEmit

# Expected result: 0 errors
```

---

## 📚 Type Definitions to Add

Add to `src/pages/admin/finance/fiscal/types/fiscalTypes.ts`:

```typescript
// Alert system types
export interface FiscalAlert {
  type: 'connection' | 'cae' | 'compliance' | 'queue';
  severity: 'low' | 'medium' | 'high';
  message: string;
  action?: string;
}

// Chart data types
export interface ChartDataPoint {
  month?: string;
  label?: string;
  value: number;
  [key: string]: string | number | undefined;
}

// Invoice form data (if not already defined)
export interface InvoiceFormData extends InvoiceGenerationData {
  // Additional form-specific fields if needed
}
```

---

**Last Updated**: 2025-01-30
**Status**: Ready for implementation
**Estimated Time**: 1-2 hours total
