# 🔒 GAP 2: RECORD-LEVEL PERMISSIONS - ¿QUÉ SON Y LOS NECESITÁS?

**Fecha**: 2025-01-30
**Estado**: 📚 INVESTIGACIÓN + ANÁLISIS

---

## 📖 ¿QUÉ ES "RECORD-LEVEL PERMISSION"?

### **Definición simple**:
> Controlar **QUÉ registros específicos** puede ver/editar cada usuario, **NO solo el módulo completo**.

### **Ejemplo con ventas**:

#### **Sin Record-Level (Solo RBAC)** ← TU SISTEMA ACTUAL
```typescript
// PermissionsRegistry
EMPLEADO: {
  sales: ['read', 'create', 'update']  // ✅ Puede editar ventas
}

// Resultado
empleado1 abre Sales module:
  - Ve TODAS las ventas ✅
  - Puede editar TODAS las ventas ✅ ← PROBLEMA!

empleado1 edita venta de empleado2:
  - Sistema permite ✅ ← PROBLEMA!
```

#### **Con Record-Level (RBAC + Ownership)** ← LO QUE FALTA
```typescript
// RBAC (module-level)
EMPLEADO: {
  sales: ['read', 'create', 'update']
}

// Record Rules (record-level)
EMPLEADO can UPDATE sale IF:
  - sale.created_by === empleado.id  // ✅ Solo SUS ventas
  - sale.state === 'draft'           // ✅ Solo si está en borrador

// Resultado
empleado1 abre Sales module:
  - Ve TODAS las ventas ✅
  - Puede editar SOLO SUS ventas en draft ✅

empleado1 intenta editar venta de empleado2:
  - Sistema bloquea ❌ "No puedes editar ventas de otros"
```

---

## 🤔 TUS PREGUNTAS RESPONDIDAS

### **1. "¿Qué es el estado DRAFT?"**

**DRAFT** (Borrador) es un **workflow state** (estado de flujo de trabajo).

#### **Ejemplo: Lifecycle de una venta**

```
┌──────────┐   Empleado crea    ┌──────────┐   Supervisor aprueba   ┌────────────┐
│  DRAFT   │ ──────────────────>│ PENDING  │ ─────────────────────>│ CONFIRMED  │
│(Borrador)│                    │(Pendiente)│                        │(Confirmada)│
└──────────┘                    └──────────┘                        └────────────┘
     ↓                                 ↓                                    ↓
 Puede editar                   Solo lectura                         Solo lectura
 Puede eliminar                 Puede aprobar                        Puede anular

                                                                     ┌────────────┐
                                                                     │   VOIDED   │
                                                                     │ (Anulada)  │
                                                                     └────────────┘
```

#### **Permisos por estado**:

| Estado | EMPLEADO | SUPERVISOR | GERENTE | ADMIN |
|--------|----------|------------|---------|-------|
| **DRAFT** | Editar/Eliminar (solo propias) | Ver todas | Ver todas | Ver todas |
| **PENDING** | Solo ver propias | Aprobar/Rechazar | Aprobar/Rechazar | Aprobar/Rechazar |
| **CONFIRMED** | Solo ver propias | Ver todas | Anular | Anular |
| **VOIDED** | Solo ver propias | Ver todas | Ver todas | Editar/Restaurar |

---

### **2. "¿No sería peligroso que un cajero edite ventas aunque sean suyas sin notificar?"**

**¡EXCELENTE PUNTO!** Ahí es donde entra el **Audit Log** (registro de auditoría).

#### **Patrón Enterprise**:

```
Record-Level Permission + Audit Log + Workflow Approval
```

#### **Ejemplo: Cajero edita venta**

**Escenario A: Venta en DRAFT** (recién creada, aún no confirmada)
```
1. Cajero crea venta (estado: DRAFT)
2. Cajero se equivoca en precio → Edita
3. Sistema:
   ✅ Permite editar (es suya + está en DRAFT)
   📝 Registra en audit log:
      { user: 'cajero1', action: 'UPDATE', field: 'total', old: 100, new: 120 }
4. Supervisor puede ver audit log después
```

**Escenario B: Venta CONFIRMED** (ya cobrada)
```
1. Cajero intenta editar venta confirmada
2. Sistema:
   ❌ Bloquea edición "Venta confirmada no puede editarse"
   💡 Sugiere: "Crear nota de crédito" o "Solicitar aprobación a supervisor"
```

**Escenario C: Cajero solicita aprobación**
```
1. Cajero crea "Request" (solicitud de cambio)
2. Request:
   - sale_id: 123
   - requested_by: cajero1
   - reason: "Cliente devolvió producto"
   - action: "void_sale"
   - status: PENDING_APPROVAL
3. Supervisor recibe notificación
4. Supervisor:
   ✅ Aprueba → Sistema anula venta + registra en audit
   ❌ Rechaza → Venta no se modifica
```

---

### **3. "¿Se deja un registro?"**

**SÍ, SIEMPRE.** Se llama **Audit Trail** o **Audit Log**.

#### **Ejemplo de tabla audit_logs**:

```sql
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY,
  table_name TEXT,         -- 'sales', 'items', etc.
  record_id UUID,          -- ID del registro modificado
  action TEXT,             -- 'INSERT', 'UPDATE', 'DELETE'
  user_id UUID,            -- Quién hizo el cambio
  user_role TEXT,          -- Rol del usuario
  timestamp TIMESTAMPTZ,   -- Cuándo
  old_values JSONB,        -- Valores anteriores
  new_values JSONB,        -- Valores nuevos
  ip_address TEXT,         -- Desde dónde
  reason TEXT              -- Por qué (opcional)
);

-- Ejemplo de registro
{
  id: 'abc-123',
  table_name: 'sales',
  record_id: 'sale-456',
  action: 'UPDATE',
  user_id: 'cajero1',
  user_role: 'EMPLEADO',
  timestamp: '2025-01-30 14:30:00',
  old_values: { total: 100, state: 'draft' },
  new_values: { total: 120, state: 'confirmed' },
  ip_address: '192.168.1.50',
  reason: 'Cliente agregó producto extra'
}
```

---

### **4. "¿Cómo manejan esto otras apps?"**

#### **SHOPIFY (E-commerce POS)**

```
Staff Role: "Cashier"
Permissions:
  - Create orders ✅
  - Edit OWN orders (only if NOT paid) ✅
  - View ALL orders ✅
  - Refund orders ❌ (requires Manager approval)

Audit:
  - Every action logged to "Timeline"
  - Manager sees: "John edited Order #1234: Changed total $100 → $120"
```

#### **SAP Business One (ERP)**

```
User: Salesperson
Document: Sales Order

Workflow:
  DRAFT → Can edit freely
  SUBMITTED → Requires approval
  APPROVED → Read-only (requires "Change Approved Documents" permission)
  CLOSED → Read-only

Audit:
  - Change Log tracks every field change
  - Document History shows who approved/rejected
```

#### **ODOO (Open Source ERP)**

```python
# Record Rule (Ownership)
record_rule = {
  'name': 'Sales: Own Orders Only',
  'model': 'sale.order',
  'domain': "[('user_id', '=', user.id)]",  # Solo registros donde user_id = yo
  'groups': ['sales.group_sale_salesman']
}

# Audit
- Every write() call logged
- Chatter widget shows timeline: "Alice changed Status: Draft → Confirmed"
```

#### **SUPABASE RLS (Tu stack actual)**

```sql
-- Row Level Security Policy
CREATE POLICY "Employees see only own sales"
ON sales
FOR SELECT
USING (
  auth.uid() = created_by  -- Solo registros donde created_by = mi user_id
);

CREATE POLICY "Employees edit only own draft sales"
ON sales
FOR UPDATE
USING (
  auth.uid() = created_by AND state = 'draft'
);

-- Audit Trigger (automático)
CREATE TRIGGER audit_sales_changes
AFTER UPDATE ON sales
FOR EACH ROW
EXECUTE FUNCTION log_audit();
```

---

## 🎯 ¿NECESITÁS RECORD-LEVEL PERMISSIONS?

### **SÍ, si tu app tiene**:

✅ **Múltiples usuarios con mismo role** (ej: 5 cajeros)
✅ **Usuarios no deben ver datos de otros** (privacidad)
✅ **Negocio multi-location** (cada usuario ve solo su sucursal)
✅ **Workflows de aprobación** (draft → pending → approved)
✅ **Auditoría requerida** (control de cambios)

### **NO, si tu app es**:

❌ **Single-user** (solo el dueño la usa)
❌ **Todos confían en todos** (negocio familiar chico)
❌ **No hay workflows** (todo es inmediato)

---

## 🛠️ CÓMO IMPLEMENTARLO EN TU APP

### **Opción 1: Supabase RLS** (RECOMENDADO para vos)

**Por qué**: Ya usás Supabase, es nativo de PostgreSQL, gratis.

#### **Paso 1: Agregar campos a tablas**

```sql
-- Agregar a TODAS las tablas importantes
ALTER TABLE sales ADD COLUMN created_by UUID REFERENCES auth.users(id);
ALTER TABLE sales ADD COLUMN state TEXT DEFAULT 'draft';

-- Index para performance
CREATE INDEX sales_created_by_idx ON sales(created_by);
CREATE INDEX sales_state_idx ON sales(state);
```

#### **Paso 2: Crear RLS Policies**

```sql
-- Policy 1: Ver todas las ventas (cualquier empleado)
CREATE POLICY "Employees can view all sales"
ON sales FOR SELECT
USING (true);  -- Todos ven todas

-- Policy 2: Editar solo propias en draft
CREATE POLICY "Employees edit own draft sales"
ON sales FOR UPDATE
USING (
  auth.uid() = created_by
  AND state = 'draft'
);

-- Policy 3: Supervisores editan cualquier draft
CREATE POLICY "Supervisors edit any draft sales"
ON sales FOR UPDATE
USING (
  (SELECT role FROM profiles WHERE id = auth.uid()) = 'SUPERVISOR'
  AND state = 'draft'
);

-- Policy 4: Admin edita todo
CREATE POLICY "Admins edit all sales"
ON sales FOR ALL
USING (
  (SELECT role FROM profiles WHERE id = auth.uid()) IN ('ADMINISTRADOR', 'SUPER_ADMIN')
);
```

#### **Paso 3: Auto-asignar created_by**

```sql
-- Trigger para auto-fill created_by
CREATE OR REPLACE FUNCTION set_created_by()
RETURNS TRIGGER AS $$
BEGIN
  NEW.created_by := auth.uid();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER sales_set_created_by
BEFORE INSERT ON sales
FOR EACH ROW
EXECUTE FUNCTION set_created_by();
```

#### **Paso 4: Client-side (tu app React)**

```typescript
// src/services/salesService.ts

export async function updateSale(saleId: string, updates: Partial<Sale>) {
  // Supabase RLS valida automáticamente
  const { data, error } = await supabase
    .from('sales')
    .update(updates)
    .eq('id', saleId)
    .single();

  if (error) {
    // Si RLS bloquea, error será:
    // "new row violates row-level security policy for table \"sales\""

    if (error.code === '42501') {  // RLS violation
      throw new Error('No tienes permiso para editar esta venta');
    }

    throw error;
  }

  return data;
}
```

---

### **Opción 2: Service-Layer Validation** (MÁS TRABAJO, más control)

```typescript
// src/lib/permissions/recordRules.ts

export function canUpdateRecord(
  user: AuthUser,
  record: any,
  action: PermissionAction
): { allowed: boolean; reason?: string } {

  // Module-level check (existing)
  if (!hasPermission(user.role, record._module, action)) {
    return { allowed: false, reason: 'Insufficient module permissions' };
  }

  // Ownership check (NEW)
  if (record.created_by && record.created_by !== user.id) {
    if (!['ADMINISTRADOR', 'GERENTE'].includes(user.role)) {
      return { allowed: false, reason: 'Can only modify own records' };
    }
  }

  // State-based check (NEW)
  if (record.state) {
    if (record.state === 'confirmed' && user.role === 'EMPLEADO') {
      return { allowed: false, reason: 'Cannot modify confirmed records' };
    }
    if (record.state === 'voided' && user.role !== 'ADMINISTRADOR') {
      return { allowed: false, reason: 'Only admin can modify voided records' };
    }
  }

  // Location check (existing)
  if (record.location_id && record.location_id !== user.location_id) {
    if (user.role !== 'ADMINISTRADOR') {
      return { allowed: false, reason: 'Different location' };
    }
  }

  return { allowed: true };
}
```

---

## 📊 COMPARACIÓN

| Aspecto | Supabase RLS | Service-Layer |
|---------|--------------|---------------|
| **Performance** | ✅ Database-level (más rápido) | ⚠️ App-level (más lento) |
| **Seguridad** | ✅ No se puede bypassear | ⚠️ Alguien puede llamar DB directo |
| **Complejidad** | ⚠️ SQL policies (learning curve) | ✅ TypeScript (ya conocés) |
| **Debugging** | ⚠️ Errores menos claros | ✅ Control total de errores |
| **Offline** | ❌ No funciona offline | ✅ Puede funcionar offline |
| **Costo** | ✅ Gratis (parte de Supabase) | ✅ Gratis (tu código) |

---

## 💡 MI RECOMENDACIÓN PARA VOS

### **Fase 1: Empezá simple** (2-3 días)

1. ✅ **Audit Log SOLO** (sin record-level permissions todavía)
   - Crear tabla `audit_logs`
   - Trigger en tablas importantes
   - Ver en UI "Historial de cambios"

2. ✅ **Location-based filtering** (ya lo tenés)
   - Seguir usando `requireLocationAccess()`

### **Fase 2: Agregar Ownership** (3-4 días después)

1. ✅ **Supabase RLS** para `sales`, `items`, `products`
   - Agregar `created_by` a tablas
   - Crear policies básicas
   - Testear con diferentes users

### **Fase 3: Agregar States** (cuando lo necesites)

1. ✅ **Workflow states** solo para módulos que lo requieran
   - Sales: `draft`, `confirmed`, `voided`
   - Materials: sin estados (no lo necesita)

---

## ❓ PREGUNTAS PARA VOS

1. **¿Cuántos usuarios simultáneos va a tener tu app?**
   - Si <5 usuarios: Record-level NO es urgente
   - Si >10 usuarios: SÍ lo necesitás

2. **¿Tus empleados deben poder editar ventas de otros?**
   - Si SÍ: No necesitás ownership
   - Si NO: SÍ necesitás ownership

3. **¿Necesitás saber quién cambió qué?**
   - Si SÍ: Audit Log es CRÍTICO
   - Si NO: Solo necesitás permisos básicos

4. **¿Tu negocio tiene aprobaciones? (ej: supervisor aprueba ventas grandes)**
   - Si SÍ: Necesitás workflow states
   - Si NO: Draft/Confirmed es suficiente

---

**¿Qué te parece? ¿Cuáles de estas preguntas te aplican?** 🤔
