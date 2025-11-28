# ⚡ QUICK START - Cash Management Implementation

**Duración Estimada para Demo**: 2-3 días
**Objetivo**: Validar concepto antes de implementación completa

---

## 🎯 PASO 1: VALIDAR CONCEPTO (30 min)

### Revisar Documentación

```bash
# Leer en orden:
1. docs/cash/README.md                     # Visión general
2. docs/cash/01-DATABASE-SCHEMA.md         # Modelo de datos
3. docs/cash/04-MONEY-FLOWS.md             # Ejemplos prácticos
4. docs/cash/05-MODULE-INTEGRATION.md      # Integraciones
5. docs/cash/06-IMPLEMENTATION-PLAN.md     # Plan completo
```

### Preguntas Críticas

¿Necesitamos implementar TODO el sistema?
- ✅ **Sí**: Si necesitas reportes contables, balance sheet, cash flow
- ⏸️ **Parcial**: Si solo necesitas arqueos de caja y control de efectivo
- ❌ **No**: Si el sistema actual de `payment_methods` es suficiente

---

## 🚀 PASO 2: DEMO RÁPIDO (2-3 días)

### Objetivo
Implementar SOLO las tablas básicas y un flujo simple para validar el concepto.

### A. Crear Schema Mínimo (1 día)

**Crear archivo:**
`database/migrations/20250124_cash_demo.sql`

```sql
-- Chart of Accounts (simplificado)
CREATE TABLE public.chart_of_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_id UUID REFERENCES public.chart_of_accounts(id),
  code VARCHAR(20) UNIQUE NOT NULL,
  name TEXT NOT NULL,
  account_type TEXT NOT NULL,
  is_group BOOLEAN DEFAULT false,
  normal_balance TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Money Locations
CREATE TABLE public.money_locations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID NOT NULL REFERENCES public.chart_of_accounts(id),
  name TEXT NOT NULL,
  location_type TEXT NOT NULL,
  current_balance NUMERIC(15,4) DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Cash Sessions (simplificado)
CREATE TABLE public.cash_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  money_location_id UUID NOT NULL REFERENCES public.money_locations(id),
  opened_by UUID NOT NULL REFERENCES auth.users(id),
  opened_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  closed_at TIMESTAMPTZ,
  starting_cash NUMERIC(15,4) NOT NULL,
  cash_sales NUMERIC(15,4) DEFAULT 0,
  expected_cash NUMERIC(15,4),
  actual_cash NUMERIC(15,4),
  variance NUMERIC(15,4),
  status TEXT NOT NULL DEFAULT 'OPEN'
);

-- Datos mínimos
INSERT INTO public.chart_of_accounts (code, name, account_type, is_group, normal_balance) VALUES
('1', 'Activos', 'ASSET', true, 'DEBIT'),
('1.1', 'Activos Corrientes', 'ASSET', true, 'DEBIT'),
('1.1.01', 'Efectivo', 'ASSET', true, 'DEBIT'),
('1.1.01.001', 'Caja Registradora', 'ASSET', false, 'DEBIT');

-- Money Location de prueba
INSERT INTO public.money_locations (account_id, name, location_type)
SELECT id, 'Caja Demo', 'CASH_DRAWER'
FROM public.chart_of_accounts
WHERE code = '1.1.01.001';
```

**Aplicar:**
```bash
npx supabase db push
```

### B. Crear Servicios Básicos (1 día)

**Crear estructura:**
```bash
mkdir -p src/modules/cash/{services,types,components}
```

**Archivo:** `src/modules/cash/types/index.ts`
```typescript
export interface CashSession {
  id: string;
  money_location_id: string;
  opened_by: string;
  opened_at: string;
  closed_at?: string | null;
  starting_cash: number;
  cash_sales: number;
  expected_cash?: number | null;
  actual_cash?: number | null;
  variance?: number | null;
  status: 'OPEN' | 'CLOSED' | 'DISCREPANCY';
}

export interface MoneyLocation {
  id: string;
  account_id: string;
  name: string;
  location_type: string;
  current_balance: number;
  is_active: boolean;
}
```

**Archivo:** `src/modules/cash/services/cashSessionService.ts`
```typescript
import { supabase } from '@/lib/supabase/client';
import { CashSession } from '../types';

export async function openCashSession(
  moneyLocationId: string,
  startingCash: number,
  userId: string
): Promise<CashSession> {
  const { data, error } = await supabase
    .from('cash_sessions')
    .insert({
      money_location_id: moneyLocationId,
      opened_by: userId,
      starting_cash: startingCash,
      status: 'OPEN'
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function closeCashSession(
  sessionId: string,
  actualCash: number
): Promise<CashSession> {
  // 1. Obtener sesión
  const { data: session, error: fetchError } = await supabase
    .from('cash_sessions')
    .select('*')
    .eq('id', sessionId)
    .single();

  if (fetchError) throw fetchError;

  // 2. Calcular esperado
  const expected = session.starting_cash + session.cash_sales;
  const variance = actualCash - expected;

  // 3. Actualizar
  const { data, error } = await supabase
    .from('cash_sessions')
    .update({
      closed_at: new Date().toISOString(),
      expected_cash: expected,
      actual_cash: actualCash,
      variance: variance,
      status: Math.abs(variance) > 50 ? 'DISCREPANCY' : 'CLOSED'
    })
    .eq('id', sessionId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getActiveCashSession(): Promise<CashSession | null> {
  const { data, error } = await supabase
    .from('cash_sessions')
    .select('*')
    .eq('status', 'OPEN')
    .maybeSingle();

  if (error) throw error;
  return data;
}
```

### C. UI Mínima (1 día)

**Archivo:** `src/modules/cash/components/CashSessionDemo.tsx`
```typescript
import { useState } from 'react';
import { Box, Button, VStack, Text, Input } from '@chakra-ui/react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { openCashSession, closeCashSession, getActiveCashSession } from '../services/cashSessionService';

export function CashSessionDemo() {
  const [startingCash, setStartingCash] = useState('5000');
  const [actualCash, setActualCash] = useState('');
  const queryClient = useQueryClient();

  const { data: activeSession, isLoading } = useQuery({
    queryKey: ['active-cash-session'],
    queryFn: getActiveCashSession,
    refetchInterval: 5000
  });

  const openMutation = useMutation({
    mutationFn: () => openCashSession('money-loc-id', parseFloat(startingCash), 'user-id'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['active-cash-session'] });
      alert('Sesión abierta');
    }
  });

  const closeMutation = useMutation({
    mutationFn: () => closeCashSession(activeSession!.id, parseFloat(actualCash)),
    onSuccess: (session) => {
      queryClient.invalidateQueries({ queryKey: ['active-cash-session'] });
      alert(`Sesión cerrada. Diferencia: $${session.variance}`);
    }
  });

  if (isLoading) return <Text>Cargando...</Text>;

  return (
    <Box p={8}>
      <VStack gap={4} align="stretch" maxW="500px">
        <Text fontSize="2xl" fontWeight="bold">
          Cash Session Demo
        </Text>

        {!activeSession ? (
          <>
            <Text>No hay sesión activa</Text>
            <Input
              placeholder="Fondo inicial (ARS)"
              value={startingCash}
              onChange={(e) => setStartingCash(e.target.value)}
            />
            <Button
              colorPalette="green"
              onClick={() => openMutation.mutate()}
              loading={openMutation.isPending}
            >
              Abrir Caja
            </Button>
          </>
        ) : (
          <>
            <Box p={4} bg="green.50" borderRadius="md">
              <Text fontWeight="bold">Sesión Activa</Text>
              <Text>Fondo inicial: ${activeSession.starting_cash}</Text>
              <Text>Ventas: ${activeSession.cash_sales}</Text>
              <Text>
                Esperado: ${activeSession.starting_cash + activeSession.cash_sales}
              </Text>
            </Box>

            <Input
              placeholder="Efectivo contado"
              value={actualCash}
              onChange={(e) => setActualCash(e.target.value)}
            />
            <Button
              colorPalette="red"
              onClick={() => closeMutation.mutate()}
              loading={closeMutation.isPending}
            >
              Cerrar Caja
            </Button>
          </>
        )}
      </VStack>
    </Box>
  );
}
```

### D. Probar Demo

**Agregar ruta temporal:**
```typescript
// src/App.tsx
<Route path="/admin/cash-demo" element={<CashSessionDemo />} />
```

**Probar flujo:**
1. Ir a `/admin/cash-demo`
2. Abrir caja con $5,000
3. Simular venta (manualmente actualizar `cash_sales` en BD)
4. Cerrar caja y ver diferencia

**SQL para simular venta:**
```sql
UPDATE cash_sessions
SET cash_sales = 10000
WHERE status = 'OPEN';
```

---

## ✅ PASO 3: VALIDAR RESULTADOS

### Checklist de Validación

- [ ] Tablas creadas correctamente
- [ ] Puedo abrir una sesión de caja
- [ ] Puedo cerrar sesión y ver diferencia
- [ ] La UI es usable
- [ ] Entiendo el concepto de doble entrada

### Preguntas Post-Demo

1. **¿El concepto es claro?**
   - Si NO → Revisar `04-MONEY-FLOWS.md` con ejemplos
   - Si SÍ → Continuar

2. **¿Necesitamos el sistema completo?**
   - Si NO → Quedarse con demo (cash sessions únicamente)
   - Si SÍ → Implementar Fase 1 del plan

3. **¿Cuándo empezamos la implementación real?**
   - Definir fecha de inicio
   - Asignar equipo
   - Revisar `06-IMPLEMENTATION-PLAN.md`

---

## 🚀 PASO 4: IMPLEMENTACIÓN REAL

Si el demo fue exitoso, seguir el plan completo:

### Fase 1: Fundamentos (2-3 semanas)
Ver: `docs/cash/06-IMPLEMENTATION-PLAN.md` → Fase 1

**Tareas:**
1. Crear schema completo (`chart_of_accounts`, `money_locations`)
2. Crear tipos TypeScript completos
3. Crear servicios completos
4. Crear UI de lectura (sin edición)
5. Tests unitarios

### Fase 2: Cash Sessions (2 semanas)
Ver: `docs/cash/06-IMPLEMENTATION-PLAN.md` → Fase 2

**Tareas:**
1. Implementar apertura/cierre completo
2. UI completa con modales
3. Eventos del EventBus
4. Tests de integración

### Fase 3: Double-Entry Core (2-3 semanas)
Ver: `docs/cash/06-IMPLEMENTATION-PLAN.md` → Fase 3

**Tareas:**
1. Crear `journal_entries`, `journal_lines`
2. Implementar validación de balance
3. Trigger de PostgreSQL
4. Tests exhaustivos

### Fase 4: Module Integration (2 semanas)
Ver: `docs/cash/06-IMPLEMENTATION-PLAN.md` → Fase 4

**Tareas:**
1. Integrar con Sales
2. Integrar con Staff
3. Integrar con Fiscal
4. Feature flags

### Fase 5: Advanced Features (1-2 semanas)
Ver: `docs/cash/06-IMPLEMENTATION-PLAN.md` → Fase 5

**Tareas:**
1. Reportes (Balance Sheet, Cash Flow)
2. Dashboard
3. Alertas

---

## 📚 RECURSOS ADICIONALES

### Documentación

- **Visión General**: `README.md`
- **Base de Datos**: `01-DATABASE-SCHEMA.md`
- **Doble Entrada**: `02-JOURNAL-ENTRIES.md` (pendiente)
- **Cash Sessions**: `03-CASH-SESSIONS.md` (pendiente)
- **Flujos de Dinero**: `04-MONEY-FLOWS.md`
- **Integraciones**: `05-MODULE-INTEGRATION.md`
- **Plan Completo**: `06-IMPLEMENTATION-PLAN.md`

### Referencias Externas

- [Toast POS Docs](https://doc.toasttab.com/doc/platformguide/adminCashDrawerPOSOperations.html)
- [Square Cash Management](https://squareup.com/help/us/en/article/8344-start-and-end-a-cash-drawer-session)
- [Double Entry Bookkeeping](https://www.balanced.software/double-entry-bookkeeping-for-programmers/)

---

## 🆘 TROUBLESHOOTING

### Error: "No se pueden crear tablas"

```bash
# Verificar conexión a Supabase
npx supabase status

# Verificar permisos
psql -h host -U user -d database -c "SELECT current_user, current_database();"
```

### Error: "TypeScript no reconoce tipos"

```bash
# Regenerar tipos de Supabase
npx supabase gen types typescript --local > src/lib/supabase/database.types.ts
```

### Error: "Journal entry no balancea"

```typescript
// Verificar suma de amounts
const sum = lines.reduce((total, line) => total + parseFloat(line.amount), 0);
console.log('Balance:', sum); // Debe ser 0.0000
```

---

## 💡 DECISIÓN FINAL

### Opción A: Solo Demo
**Tiempo**: 2-3 días
**Uso**: Arqueos de caja únicamente
**Scope**: `cash_sessions` tabla solamente

### Opción B: Implementación Completa
**Tiempo**: 8-10 semanas
**Uso**: Sistema contable completo
**Scope**: Todas las tablas + integraciones + reportes

### Opción C: Híbrido
**Tiempo**: 4-6 semanas
**Uso**: Cash sessions + Journal entries básico
**Scope**: Sin reportes avanzados

---

## 📞 PRÓXIMOS PASOS

1. **Revisar documentación completa** (2-3 horas)
2. **Hacer demo técnico** (2-3 días)
3. **Decidir scope de implementación** (1 reunión)
4. **Comenzar Fase 1 si aprobado** (según plan)

---

**¿Preguntas?** Revisar `README.md` o consultar documentación específica.

**¿Listo para empezar?** Ver `06-IMPLEMENTATION-PLAN.md` Fase 1.

---

**Última actualización**: 2025-01-24
