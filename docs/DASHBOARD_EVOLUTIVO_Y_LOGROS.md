# Dashboard Evolutivo & Sistema de Logros
**Diseño y Arquitectura v1.0**

---

## 📋 Resumen Ejecutivo

### Problema Identificado

El componente actual `WelcomeWidget.tsx` presenta varios problemas conceptuales y de UX:

1. **Confusión de propósito**:
   - Se llama "Welcome" pero aparece **siempre** en el dashboard
   - No es una pantalla de bienvenida real, es un "progress tracker permanente"

2. **Flujo de navegación roto**:
   - Al hacer click en una configuración → te saca del dashboard
   - No está claro si el widget debe reaparecer al volver
   - Genera confusión sobre cuándo desaparece

3. **Falta de jerarquía**:
   - Todo tiene el mismo peso visual
   - No distingue entre configuraciones críticas vs opcionales
   - Ocupa espacio permanente para información que solo es relevante al inicio

4. **Protagonismo inadecuado**:
   - Los achievements no deberían estar en el header del dashboard permanentemente
   - Solo son importantes al inicio (guiar al usuario)
   - Una vez completados, deberían ceder el protagonismo a información operacional

### Solución Propuesta: Dashboard Evolutivo

**Concepto clave:** El dashboard cambia de propósito según la fase del usuario:

```
Estado Inicial (setup incompleto):
  Dashboard = Tutorial guiado con achievements prominentes

Estado Completado (setup listo):
  Dashboard = Herramienta operacional (alertas, métricas, acciones)
```

**Beneficios:**
- ✅ **Progressive Disclosure**: Mostrar lo relevante en el momento correcto
- ✅ **Feedback inmediato**: Usuario ve su progreso en tiempo real
- ✅ **No saturación**: Información temporal no ocupa espacio permanentemente
- ✅ **Escalable**: Switch puede tener más posiciones en el futuro

---

## 🏗️ Arquitectura del Dashboard Evolutivo

### Estado 1: Setup Incompleto (0-99%)

**Comportamiento:**
- Header muestra switch: `🔔 Alertas | 🏆 Setup`
- **Default:** Posición en Alertas (información urgente siempre accesible)
- **1 click:** Cambiar a vista de Setup/Logros (protagonismo sin saturar)
- Widget de setup muestra logros obligatorios según business model

**Vista Alertas (Default):**
```
┌─────────────────────────────────────────────────────────┐
│ Dashboard                          [🔔 Alertas | 🏆 Setup]
│                                         ▲ default
└─────────────────────────────────────────────────────────┘

┌─ Alertas Operacionales ────────────────────────────────┐
│ ⚠️ Stock bajo: Harina (2kg) [Ver →]                    │
│ ⚠️ Mesa 5 esperando hace 15min [Ir a POS →]            │
│ ℹ️ Sin alertas críticas                                │
└─────────────────────────────────────────────────────────┘
```

**Vista Setup (1 click):**
```
┌─ 🎯 Configuración de Negocio ──────────────────────────┐
│ [███████░░░░░░░░] 58% completado                        │
│ 7 pasos críticos pendientes                             │
│                                                          │
│ 🔴 CRÍTICO (2)  🟡 IMPORTANTE (3)  ✅ LISTO (7)         │
│                                                          │
│ ▼ 📍 Consumo en Local [███░░░] 60%                      │
│   ⏳ Staff asignado (0/2 requeridos) [Configurar →]     │
│   ⏳ Horario definido [Configurar →]                    │
│   ✅ Dirección física                                   │
│   ✅ Mesas creadas (5)                                  │
│                                                          │
│ ▶ 🚚 Delivery [█░░░░░░░] 20%                            │
│ ▶ 💳 Pagos Online [██████░░] 75%                        │
│                                                          │
│ [Ver Todos los Logros →]                                │
└─────────────────────────────────────────────────────────┘
```

### Estado 2: Setup Completo (100%)

**Comportamiento:**
- Header mantiene switch: `🔔 Alertas | 🏆 Logros`
- **Default:** Sigue en Alertas (prioridad operacional)
- **Vista Logros:** Evoluciona de "setup obligatorio" a "logros de maestría"

**Vista Alertas (Default):**
```
┌─ Alertas Operacionales ────────────────────────────────┐
│ ⚠️ Stock bajo: Harina (2kg) [Ver →]                    │
│ ⚠️ Pago pendiente: Mesa 3 ($45.000) [Cobrar →]         │
│ ✅ 3 alertas resueltas hoy                              │
└─────────────────────────────────────────────────────────┘
```

**Vista Logros (1 click):**
```
┌─ 🏆 Sistema de Logros ─────────────────────────────────┐
│ 🎉 ¡Configuración completa!                             │
│ [██████████████████] 100%                               │
│                                                          │
│ 🏆 Logros Recientes:                                    │
│ ✅ Primera venta (+50 XP) hace 2 horas                  │
│ ✅ 10 productos creados (+30 XP) ayer                   │
│ 🔒 100 ventas (+100 XP) ← próximo (87/100)              │
│                                                          │
│ 📊 Progreso por Dominio:                                │
│ • Ventas: ████████░░ 80%                                │
│ • Inventario: ██████░░░░ 60%                            │
│ • Staff: ████░░░░░░ 40%                                 │
│                                                          │
│ [Ver Todos los Logros →]                                │
└─────────────────────────────────────────────────────────┘
```

---

## 🎛️ Componente Switch Header

### Diseño y Justificación

**Propuesta:** Header intercambiable con switch de 2+ posiciones

**Estructura:**
```tsx
<HeaderSwitch
  defaultPosition="alerts"
  positions={[
    { id: 'alerts', icon: '🔔', label: 'Alertas' },
    { id: 'achievements', icon: '🏆', label: 'Setup' } // o "Logros" si completado
  ]}
  onPositionChange={(position) => {}}
/>
```

**Justificación:**

1. **Contextos Diferentes, No Excluyentes**:
   - Alertas: Información urgente operacional
   - Logros: Progreso y gamificación
   - **Solución:** Switch permite ambos sin saturar

2. **Precedentes en la Industria**:
   - **GitHub:** Header con "Overview/Repositories/Projects"
   - **Notion:** Sidebar con tabs "Favorites/Private/Shared"
   - **Linear:** Top bar con "Inbox/My Issues/All Issues"
   - **Jira:** Dashboard switch "Overview/Activity/Roadmap"

3. **Escalabilidad**:
   - Fácil agregar más posiciones (ej: "📊 Métricas", "📈 Reports")
   - No requiere refactor de arquitectura
   - Cada posición es un componente independiente

4. **UX Benefits**:
   - ✅ Default siempre en Alertas (info crítica nunca oculta)
   - ✅ 1 click para cambiar contexto (rápido)
   - ✅ Estado persistido en sesión (recuerda preferencia)

### Comportamiento del Switch

**Estado Inicial:**
- Default: `🔔 Alertas`
- Usuario puede cambiar a `🏆 Setup`

**Estado Completado:**
- Default: Sigue en `🔔 Alertas`
- Etiqueta cambia automáticamente: `🏆 Setup` → `🏆 Logros`

**Persistencia:**
- Session storage guarda última posición
- Al recargar página: vuelve a default (Alertas)
- Evita que usuario se "pierda" en vista no crítica

---

## 📦 BusinessSetupProgressWidget (Renombrado)

### Propósito y Comportamiento

**Antes:** `WelcomeWidget.tsx` (confuso, no desaparecía)

**Ahora:** `BusinessSetupProgressWidget.tsx`

**Propósito claro:**
- Tracker de progreso **temporal** hasta completar setup crítico
- Solo se muestra en vista `🏆 Setup` del header switch
- Desaparece cuando el widget evoluciona a "Logros de Maestría"

**Comportamiento:**

1. **Navegación:**
   ```
   User clicks "Staff asignado [Configurar →]"
     ↓
   Navega a /admin/staff
     ↓
   User crea 2 staff members
     ↓
   Navega back a /admin/dashboard
     ↓
   Achievement desbloqueado: "Primer Staff Contratado" (+20 XP)
     ↓
   Toast notification: 🎉 ¡Logro desbloqueado!
     ↓
   Setup widget actualiza: Staff ✅ → 80% completado
   ```

2. **Actualización en Tiempo Real:**
   - Widget se suscribe a eventos del AchievementsEngine
   - Al desbloquear milestone → recalcula progreso automáticamente
   - No requiere refresh manual

3. **Completitud:**
   - Al llegar a 100% crítico → widget muestra "🎉 ¡Configuración completa!"
   - Cambia comportamiento: de "pasos pendientes" a "logros recientes"

---

## 🎯 Sistema de Logros por Business Model

### Concepto Central

**Logros Obligatorios Atados al Business Model del Usuario**

En el `BusinessModelStep` del wizard `/setup`, el usuario selecciona:
- ✅ Consumo en Local
- ✅ Delivery
- ✅ Ecommerce
- ✅ Wholesale
- etc.

Cada selección asigna **logros obligatorios** específicos:

#### Ejemplo: "Consumo en Local"

**Logros obligatorios:**
```
📍 Consumo en Local [███░░░░░] 60%
├─ ✅ Dirección física configurada (+10 XP)
├─ ✅ Mesas creadas (5/5) (+20 XP)
├─ ⏳ Staff asignado (0/2) ← BLOQUEADOR (+30 XP)
└─ ⏳ Horario definido ← BLOQUEADOR (+15 XP)
```

**Lógica de bloqueo:**
- Mientras no complete staff y horario → **no puede operar un turno** en POS
- Al intentar abrir turno → modal: "⚠️ Completá estos pasos primero"

#### Ejemplo: "Delivery"

**Logros obligatorios:**
```
🚚 Delivery [█░░░░░░░] 20%
├─ ✅ Radio de entrega configurado (+10 XP)
├─ ⏳ Costo de envío definido ← BLOQUEADOR (+20 XP)
├─ ⏳ Repartidores asignados (0/1) ← BLOQUEADOR (+30 XP)
└─ ⏳ Integración con Google Maps (+40 XP)
```

### Categorización de Logros

#### 🔴 Críticos (Bloqueadores)
- **Definición:** Sin estos, NO se puede operar la capability
- **Ejemplos:**
  - CUIT/RUT configurado (fiscal)
  - Moneda del negocio
  - Primer producto creado (ventas)
  - Staff asignado (operaciones)

#### 🟡 Importantes (Recomendados)
- **Definición:** Se puede operar, pero con limitaciones
- **Ejemplos:**
  - 5+ productos en catálogo (no solo 1)
  - Categorías definidas (organización)
  - Logo del negocio (branding)

#### ✅ Completados
- **Definición:** Logros ya alcanzados
- **Comportamiento:** Colapsados por defecto, expandibles

---

## 🎨 UI: Acordeón Priorizado

### Problema de Carga Visual

Si el usuario seleccionó 3+ capabilities:
- Consumo en Local (4 logros)
- Delivery (4 logros)
- Ecommerce (5 logros)

**Total:** 13 ítems → sobrecarga visual

### Solución: Acordeón Inteligente

**Regla:** Solo la capability **más incompleta** se expande por defecto

**Ejemplo:**

```
┌─ 🎯 Configuración de Negocio ──────────────────────────┐
│ [███████░░░░░░░░] 58% completado                        │
│ 3 capabilities activas • 7 pasos pendientes             │
│                                                          │
│ 🔴 CRÍTICO (2)  🟡 IMPORTANTE (3)  ✅ (7)               │
│                                                          │
│ ▼ 📍 Consumo en Local [███░░░] 60% ← EXPANDIDO         │
│   🔴 ⏳ Staff asignado (0/2) [Configurar →]             │
│   🟡 ⏳ Horario definido [Configurar →]                 │
│   ✅ Dirección física                                   │
│   ✅ Mesas creadas (5)                                  │
│                                                          │
│ ▶ 🚚 Delivery [█░░░░░░░] 20% ← COLAPSADO               │
│                                                          │
│ ▶ 💳 Pagos Online [██████░░] 75% ← COLAPSADO            │
│                                                          │
│ [Ver Todos los Logros →]                                │
└─────────────────────────────────────────────────────────┘
```

**Click en "Delivery" →** Se expande Delivery, colapsa Consumo en Local

**Ventajas:**
- ✅ Enfoque en lo más urgente (menor %)
- ✅ Reduce carga visual (no 13 ítems juntos)
- ✅ Usuario puede ver overview rápido (progress bars)
- ✅ 1 click para detalles de otra capability

---

## 📐 Wireframes Detallados

### Layout Principal del Dashboard

```
┌─────────────────────────────────────────────────────────┐
│ G-Admin Mini                                    [User]   │
├─────────────────────────────────────────────────────────┤
│                                                          │
│ Dashboard                        [🔔 Alertas | 🏆 Setup]│
│                                       ▲ Switch Component │
│                                                          │
│ ┌─ CONTENIDO SEGÚN POSICIÓN DEL SWITCH ──────────────┐ │
│ │                                                      │ │
│ │ (Alertas o Setup/Logros)                            │ │
│ │                                                      │ │
│ └──────────────────────────────────────────────────────┘ │
│                                                          │
│ ┌─ MÉTRICAS EJECUTIVAS ────────────────────────────────┐│
│ │ (ExecutiveOverview - siempre visible)                ││
│ └──────────────────────────────────────────────────────┘│
│                                                          │
│ ┌─ CROSS-MODULE INSIGHTS ──────────────────────────────┐│
│ │ (CrossModuleInsights - siempre visible)              ││
│ └──────────────────────────────────────────────────────┘│
│                                                          │
└─────────────────────────────────────────────────────────┘
```

### Detalle: Switch Component

```
┌─ Switch Header ─────────────────────────────────────────┐
│                                                          │
│ [🔔 Alertas] │ [🏆 Setup]                                │
│    ▲ active     inactive                                │
│                                                          │
│ Estados:                                                 │
│ • Hover: border highlight                               │
│ • Active: border-bottom-2 color.500                     │
│ • Transition: 200ms ease                                │
│                                                          │
│ Responsive:                                              │
│ • Desktop: texto completo "Alertas"                     │
│ • Mobile: solo iconos 🔔 / 🏆                            │
└──────────────────────────────────────────────────────────┘
```

### Detalle: Widget de Setup Expandido

```
┌─ BusinessSetupProgressWidget ──────────────────────────┐
│                                                          │
│ 🎯 Configuración de Negocio                             │
│                                                          │
│ ┌─ Progress Bar Global ────────────────────────────┐   │
│ │ [███████░░░░░░░░] 58%                             │   │
│ │ 7 de 12 pasos completados                         │   │
│ └───────────────────────────────────────────────────┘   │
│                                                          │
│ ┌─ Filtros de Prioridad ──────────────────────────┐    │
│ │ [🔴 CRÍTICO (2)] [🟡 IMPORTANTE (3)] [✅ (7)]    │    │
│ └───────────────────────────────────────────────────┘   │
│                                                          │
│ ┌─ Capability 1: Consumo en Local ────────────────┐    │
│ │ ▼ 📍 Consumo en Local [███░░░] 60%               │    │
│ │                                                   │    │
│ │ ┌─ Logro 1 ─────────────────────────────────┐   │    │
│ │ │ 🔴 ⏳ Staff asignado (0/2 requeridos)      │   │    │
│ │ │ Sin staff, no puedes operar turnos        │   │    │
│ │ │ [Configurar Staff →]                       │   │    │
│ │ └────────────────────────────────────────────┘   │    │
│ │                                                   │    │
│ │ ┌─ Logro 2 ─────────────────────────────────┐   │    │
│ │ │ 🟡 ⏳ Horario definido                     │   │    │
│ │ │ Define horarios de atención               │   │    │
│ │ │ [Configurar Horario →]                     │   │    │
│ │ └────────────────────────────────────────────┘   │    │
│ │                                                   │    │
│ │ ✅ Dirección física (completado hace 2h)         │    │
│ │ ✅ Mesas creadas (5) (completado hace 1d)        │    │
│ └───────────────────────────────────────────────────┘   │
│                                                          │
│ ▶ 🚚 Delivery [█░░░░░░░] 20%                            │
│ ▶ 💳 Pagos Online [██████░░] 75%                         │
│                                                          │
│ [Ver Todos los Logros →] Link a /admin/achievements    │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

### Detalle: Estado Completado

```
┌─ Sistema de Logros (100%) ─────────────────────────────┐
│                                                          │
│ 🎉 ¡Configuración completa!                             │
│                                                          │
│ ┌─ Progress Bar ──────────────────────────────────┐    │
│ │ [██████████████████] 100%                        │    │
│ │ ¡Todas las capabilities están activas!           │    │
│ └───────────────────────────────────────────────────┘   │
│                                                          │
│ ┌─ Logros Recientes ──────────────────────────────┐    │
│ │ 🏆 Primera venta (+50 XP)                        │    │
│ │    hace 2 horas                                  │    │
│ │                                                   │    │
│ │ 🏆 10 productos creados (+30 XP)                 │    │
│ │    ayer a las 14:30                              │    │
│ │                                                   │    │
│ │ 🔒 100 ventas (+100 XP)                          │    │
│ │    Progreso: 87/100 (87%)                        │    │
│ └───────────────────────────────────────────────────┘   │
│                                                          │
│ ┌─ Progreso por Dominio ──────────────────────────┐    │
│ │ 💰 Ventas:      ████████░░ 80% (12/15)          │    │
│ │ 📦 Inventario:  ██████░░░░ 60% (9/15)           │    │
│ │ 👥 Staff:       ████░░░░░░ 40% (6/15)           │    │
│ │ 🎯 Operaciones: ██████████ 100% (8/8)           │    │
│ └───────────────────────────────────────────────────┘   │
│                                                          │
│ [Ver Todos los Logros →]                                │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

---

## 🔄 Flujos de Navegación

### Flujo 1: Completar Logro Obligatorio

```
1. Usuario está en Dashboard
   └─ Switch en posición 🏆 Setup
   └─ Ve: "⏳ Staff asignado (0/2) [Configurar →]"

2. Click en [Configurar →]
   └─ Navega a /admin/staff
   └─ (Dashboard queda en background)

3. Usuario crea 2 staff members
   └─ EventBus emite: "staff.member.created"
   └─ AchievementsEngine escucha evento
   └─ Verifica milestone "staff_configured"
   └─ Marca milestone como completado
   └─ Emite: "achievement:unlocked"

4. Usuario vuelve a /admin/dashboard
   └─ Toast aparece: 🎉 ¡Logro desbloqueado! "Primer Staff Contratado" +30 XP
   └─ Widget actualiza automáticamente:
       - Staff ✅ (antes ⏳)
       - Progress bar: 60% → 80%
       - "Consumo en Local": 60% → 80%
   └─ Si era el último crítico de esa capability:
       - Toast adicional: 🎊 ¡Capability "Consumo en Local" activada!
```

### Flujo 2: Cambiar Posición del Switch

```
1. Usuario está en Dashboard
   └─ Switch en posición 🔔 Alertas (default)
   └─ Ve: "⚠️ Stock bajo: Harina (2kg)"

2. Click en 🏆 Setup
   └─ Transición suave (200ms)
   └─ Componente Alertas → desmonta
   └─ Componente Setup → monta
   └─ Session storage: { switchPosition: 'setup' }

3. Usuario recarga página
   └─ Session storage detectado
   └─ PERO: siempre vuelve a 🔔 Alertas (default)
   └─ Razón: evitar que usuario "se pierda" en vista no crítica
```

### Flujo 3: Completar 100% del Setup

```
1. Usuario completa último logro crítico
   └─ Progress bar: 99% → 100%
   └─ Toast: 🎉 ¡Setup completo! Todas las capabilities activas

2. Widget evoluciona automáticamente
   └─ Header del widget cambia:
       "🎯 Configuración de Negocio"
       → "🏆 Sistema de Logros"

   └─ Contenido cambia:
       De: Acordeón con logros pendientes
       A: Vista de logros recientes + progreso por dominio

3. Switch mantiene posiciones
   └─ 🔔 Alertas (sigue siendo default)
   └─ 🏆 Logros (etiqueta ya no dice "Setup")

4. Comportamiento a futuro
   └─ Widget de logros muestra "Mastery Achievements"
   └─ Logros opcionales y reconocimientos
   └─ Sistema de XP y niveles
```

---

## ✅ Validación de Diseño

### Checklist: ¿Resuelve el Problema Original?

- ✅ **Achievements tienen protagonismo temporal** (necesario al inicio)
- ✅ **No saturan el dashboard permanentemente** (switch + colapsable)
- ✅ **Alertas mantienen prioridad** (default visible siempre)
- ✅ **Propósito claro** ("setup" vs "operational")
- ✅ **Flujo de navegación claro** (navega → completa → vuelve → widget actualiza)

### Checklist: ¿Cumple Estándares UX?

- ✅ **Progressive Disclosure** (Nielsen Norman Group)
  - Info relevante según contexto (setup vs operación)

- ✅ **Feedback Inmediato** (Don Norman: Principles of Design)
  - Toast al desbloquear logro
  - Progress bar actualiza en tiempo real

- ✅ **Affordances Claras**
  - Botones con "Configurar →" (call to action evidente)
  - Switch con iconos semánticos (🔔 = urgente, 🏆 = progreso)

- ✅ **Jerarquía Visual** (Gestalt Principles)
  - 🔴 Crítico → 🟡 Importante → ✅ Completado
  - Progress bars con colores diferenciados

- ✅ **Escalabilidad**
  - Switch puede tener 3+ posiciones sin refactor
  - Acordeón maneja 1 o 10 capabilities igual

### Checklist: ¿Maneja Edge Cases?

- ✅ **Usuario completa crítico pero ignora importante**
  - Widget sigue visible, muestra "58% completado"
  - Puede operar, pero con limitaciones visualizadas

- ✅ **Usuario tiene 1 sola capability seleccionada**
  - Acordeón no es necesario
  - Widget muestra lista simple de logros

- ✅ **Usuario tiene 5+ capabilities**
  - Acordeón mantiene 1 expandida
  - Scroll dentro del widget (max-height: 600px)

- ✅ **Usuario cierra toast de logro muy rápido**
  - Logro sigue registrado en widget
  - Puede ver en "Ver Todos los Logros →"

- ✅ **Usuario completa logro mientras está en otra página**
  - Al volver a dashboard → widget ya actualizado
  - Toast no aparece (evento ya pasó)
  - Badge de notificación en switch: "🏆 Setup (1 nuevo)"

---

## 🛠️ Especificaciones Técnicas

### Componentes a Crear

#### 1. `HeaderSwitch.tsx`
```tsx
interface HeaderSwitchProps {
  defaultPosition: 'alerts' | 'achievements';
  positions: SwitchPosition[];
  currentPosition?: string;
  onPositionChange: (position: string) => void;
}

interface SwitchPosition {
  id: string;
  icon: string;
  label: string;
  badge?: number; // Notificaciones (ej: nuevos logros)
}
```

**Ubicación:** `src/shared/ui/HeaderSwitch.tsx`

**Comportamiento:**
- Renderiza tabs clickeables
- Mantiene estado en session storage (opcional)
- Emite evento al cambiar posición
- Responsivo: full text en desktop, solo iconos en mobile

---

#### 2. `BusinessSetupProgressWidget.tsx` (renombrado)
```tsx
interface BusinessSetupProgressWidgetProps {
  userId: string;
  capabilities: string[]; // IDs de capabilities activas del usuario
  onNavigate: (path: string) => void;
}
```

**Ubicación:** `src/pages/admin/core/dashboard/components/BusinessSetupProgressWidget.tsx`

**Responsabilidades:**
- Fetch de milestones pendientes por capability
- Cálculo de % completado global y por capability
- Renderizar acordeón priorizado
- Suscribirse a eventos de AchievementsEngine
- Mostrar toasts al desbloquear logros

**State Management:**
```tsx
interface SetupProgressState {
  capabilities: CapabilityProgress[];
  globalProgress: number;
  criticalCount: number;
  importantCount: number;
  completedCount: number;
  expandedCapability: string | null;
}
```

---

#### 3. `CapabilityAccordionItem.tsx`
```tsx
interface CapabilityAccordionItemProps {
  capability: CapabilityProgress;
  isExpanded: boolean;
  onToggle: () => void;
  onMilestoneClick: (milestoneId: string, redirectUrl: string) => void;
}

interface CapabilityProgress {
  id: string;
  name: string;
  icon: string;
  progressPercent: number;
  milestones: MilestoneProgress[];
}

interface MilestoneProgress {
  id: string;
  name: string;
  description: string;
  priority: 'critical' | 'important' | 'completed';
  completed: boolean;
  redirectUrl: string;
  estimatedMinutes: number;
  xpReward: number;
}
```

**Ubicación:** `src/pages/admin/core/dashboard/components/CapabilityAccordionItem.tsx`

**Comportamiento:**
- Renderiza header con progress bar
- Expande/colapsa al hacer click
- Filtra milestones por prioridad (críticos primero)
- Muestra badges de XP y tiempo estimado

---

#### 4. `AchievementsWidget.tsx` (Estado Completado)
```tsx
interface AchievementsWidgetProps {
  userId: string;
  recentAchievements: Achievement[];
  domainProgress: DomainProgress[];
}

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  xp: number;
  unlockedAt: Date;
  tier: 'common' | 'rare' | 'epic' | 'legendary';
}

interface DomainProgress {
  domain: string;
  icon: string;
  completed: number;
  total: number;
  percentComplete: number;
}
```

**Ubicación:** `src/pages/admin/core/dashboard/components/AchievementsWidget.tsx`

**Comportamiento:**
- Se muestra cuando setup está al 100%
- Lista últimos 3-5 logros desbloqueados
- Progress bars por dominio (Ventas, Inventario, Staff, etc.)
- Link a página completa de achievements

---

### Integración con Sistemas Existentes

#### AchievementsEngine
**Ya existe:** `src/pages/admin/gamification/achievements/services/AchievementsEngine.ts`

**Modificaciones necesarias:**
1. Agregar método `getProgressByCapability(capabilityId: string)`
2. Agregar evento: `setup:progress:updated` (emit al completar milestone)
3. Suscripción a eventos en `BusinessSetupProgressWidget`

**Ejemplo:**
```tsx
// En BusinessSetupProgressWidget
useEffect(() => {
  const engine = AchievementsEngine.getInstance();

  const unsubscribe = eventBus.on('setup:progress:updated', (event) => {
    // Recalcular progreso
    fetchProgress();

    // Mostrar toast si desbloqueó logro
    if (event.achievementUnlocked) {
      notify.success(`🎉 ¡Logro desbloqueado! ${event.achievementName} +${event.xp} XP`);
    }
  });

  return () => unsubscribe();
}, []);
```

---

#### Capability Store
**Ya existe:** `src/store/capabilityStore.ts`

**Modificaciones necesarias:**
1. Agregar selector: `getActiveCapabilities()` (lista de IDs)
2. Agregar selector: `getProgressByCapability(capabilityId)`
3. Método: `refreshProgress()` (forzar recálculo)

**Ejemplo:**
```tsx
// En BusinessSetupProgressWidget
const activeCapabilities = useCapabilityStore(state => state.getActiveCapabilities());
const progress = useCapabilityStore(state =>
  activeCapabilities.map(id => state.getProgressByCapability(id))
);
```

---

#### EventBus Integration
**Ya existe:** `src/lib/events/`

**Eventos relevantes:**
- `staff.member.created` → milestone "staff_configured"
- `products.product.created` → milestone "first_product"
- `sales.order.completed` → milestone "first_sale"
- `scheduling.shift.created` → milestone "schedule_defined"

**Nuevos eventos a agregar:**
- `setup:progress:updated` → widget actualiza
- `setup:completed` → widget evoluciona a logros
- `capability:activated` → toast de capability desbloqueada

---

### Persistencia de Datos

#### Session Storage (Switch Position)
```ts
// Guardar posición actual del switch
sessionStorage.setItem('dashboardSwitchPosition', position);

// Recuperar al montar (pero siempre default a 'alerts')
const savedPosition = sessionStorage.getItem('dashboardSwitchPosition');
const initialPosition = savedPosition || 'alerts'; // Siempre vuelve a alerts
```

#### Supabase Tables (Ya Existentes)
- `user_achievement_progress` → progreso de milestones
- `capability_milestones` → estado de capabilities
- `achievement_definitions` → definiciones de logros

---

## 🔮 Ideas a Futuro

### Análisis del Sistema Actual

Basado en la investigación del código existente en G-Admin Mini, se identificaron las siguientes oportunidades:

**Arquitectura existente:**
- ✅ EventBus Enterprise v2.0 (encryption, rate limiting, deduplication, module registry)
- ✅ 13 stores de dominio (sales, materials, staff, scheduling, customers, fiscal, operations, products, etc.)
- ✅ Sistema de logros con 3 capas (Blocking Validations, Foundational Milestones, Mastery Achievements)
- ✅ 40+ mastery achievements definidos con tiers (bronze, silver, gold, platinum)
- ✅ AchievementsEngine que escucha eventos del EventBus
- ✅ 6 business activities + 4 infrastructure types configurables

---

## 🎮 **1. Sistema de Niveles y XP Unificado**

### **Concepto:**
Consolidar todos los puntos XP de achievements en un **sistema de progresión global del negocio**.

### **Implementación técnica:**

```tsx
// Nivel del negocio (evoluciona con el tiempo)
interface BusinessLevel {
  currentLevel: number; // 1 a 50+
  currentXP: number;
  xpToNextLevel: number;
  levelName: string; // "Emprendedor Novato", "Negocio Establecido", "Empresa en Crecimiento"
  unlockedPerks: string[]; // Beneficios por nivel
}
```

**Fórmula de XP:**
```ts
xpToNextLevel = baseXP * (currentLevel ^ 1.5)
// Ejemplo: Nivel 1→2 = 100 XP, Nivel 9→10 = 2,700 XP
```

**Integración con sistema actual:**
- **Evento:** Cada achievement desbloqueado emite `achievement:unlocked` con `points`
- **Store:** Nuevo `progressionStore.ts` escucha eventos y actualiza XP global
- **Dashboard:** Widget de nivel reemplaza progress bar simple

**Beneficios por nivel:**
```ts
const LEVEL_PERKS = {
  5: ['dashboard_customization', 'custom_reports'],
  10: ['advanced_analytics', 'bulk_operations'],
  15: ['api_access', 'webhooks'],
  20: ['white_label_option', 'priority_support'],
  25: ['ai_insights', 'predictive_analytics']
};
```

**UI propuesto:**
```
┌─ Progreso del Negocio ─────────────────────────────┐
│ 🏆 Nivel 12: Negocio Consolidado                   │
│ [████████████████░░░░] 8,450 / 10,200 XP           │
│                                                      │
│ Próximo nivel:                                      │
│ 🎁 Desbloqueas "Bulk Operations" + "AI Insights"   │
│                                                      │
│ Progreso reciente: +850 XP esta semana             │
└──────────────────────────────────────────────────────┘
```

---

## 🏅 **2. Logros de Colaboración Multi-Módulo**

### **Concepto:**
Achievements que requieren **combinar acciones de múltiples módulos** (ventas + inventario + staff).

### **Ejemplos concretos para G-Admin:**

#### **"Operación Perfecta"**
```ts
{
  id: 'perfect_operation',
  name: 'Operación Perfecta',
  description: 'Completa un turno con: 20+ ventas, 0 quiebres de stock, staff completo',
  type: 'cross_module',
  tier: 'gold',
  points: 500,
  conditions: {
    type: 'composite',
    requirements: [
      { module: 'sales', event: 'sales:order_completed', threshold: 20, timeframe: 'shift' },
      { module: 'materials', event: 'inventory:zero_stockouts', threshold: 1, timeframe: 'shift' },
      { module: 'staff', condition: 'all_positions_filled', timeframe: 'shift' }
    ]
  }
}
```

#### **"Maestro del Flujo"**
```ts
{
  id: 'workflow_master',
  name: 'Maestro del Flujo',
  description: 'Procesa 50 órdenes desde kitchen → delivery sin retrasos',
  tier: 'platinum',
  points: 1000,
  conditions: {
    modules: ['operations', 'delivery'],
    requirement: 'kitchen:order_completed → delivery:order_completed < 30min',
    threshold: 50
  }
}
```

**Implementación con EventBus:**
```ts
// AchievementsEngine ya escucha eventos, solo agregar lógica composite
class CompositeAchievementTracker {
  private activeTracking = new Map<string, CompositeProgress>();

  async trackEvent(event: NamespacedEvent) {
    // Buscar achievements composite que incluyan este evento
    const relevantAchievements = this.getCompositeAchievements(event.pattern);

    for (const achievement of relevantAchievements) {
      const progress = this.activeTracking.get(achievement.id) || this.initProgress(achievement);

      // Actualizar progreso del módulo específico
      this.updateModuleProgress(progress, event);

      // Verificar si se cumplieron TODAS las condiciones
      if (this.areAllConditionsMet(progress)) {
        await this.unlockAchievement(achievement);
      }
    }
  }
}
```

---

## 📊 **3. Dashboard Widgets Configurables**

### **Concepto:**
Permitir al usuario **personalizar el dashboard** según su business model y prioridades.

### **Implementación técnica:**

```tsx
interface DashboardLayout {
  userId: string;
  layout: WidgetPosition[];
  lastModified: Date;
}

interface WidgetPosition {
  id: string; // 'setup_progress', 'recent_sales', 'low_stock_alerts'
  gridArea: { x: number; y: number; w: number; h: number };
  visible: boolean;
  config?: Record<string, any>; // Configuración específica del widget
}
```

**Widgets disponibles:**

**1. Setup Progress Widget** (el que estamos diseñando)
**2. Recent Sales Widget**
**3. Low Stock Alerts**
**4. Staff Performance**
**5. Quick Actions** (botones rápidos: Nueva venta, Crear producto, etc.)
**6. Revenue Chart**
**7. Customer Insights**

**Integración con BusinessModelStep:**
```ts
// Al completar setup, sugerir layout basado en business model
function suggestDashboardLayout(activities: BusinessActivityId[]): WidgetPosition[] {
  if (activities.includes('sells_products_onsite')) {
    return [
      { id: 'setup_progress', gridArea: { x: 0, y: 0, w: 12, h: 2 } },
      { id: 'table_status', gridArea: { x: 0, y: 2, w: 6, h: 4 } }, // Relevante para onsite
      { id: 'kitchen_orders', gridArea: { x: 6, y: 2, w: 6, h: 4 } }
    ];
  }

  if (activities.includes('sells_products_delivery')) {
    return [
      { id: 'setup_progress', gridArea: { x: 0, y: 0, w: 12, h: 2 } },
      { id: 'delivery_map', gridArea: { x: 0, y: 2, w: 8, h: 6 } }, // Relevante para delivery
      { id: 'delivery_metrics', gridArea: { x: 8, y: 2, w: 4, h: 6 } }
    ];
  }

  // Layout genérico
  return defaultLayout;
}
```

**UI propuesta:**
```
[Modo Edición del Dashboard]

┌─ Personalizar Dashboard ───────────────────────────┐
│ [× Cerrar]  [Restaurar Default]  [Guardar]         │
│                                                      │
│ Widgets Disponibles:                                │
│ [+ Setup Progress]  [+ Recent Sales]  [+ Alerts]   │
│                                                      │
│ ┌─────────────────────────────────┐                │
│ │                                  │ ← Drag & Drop  │
│ │   [Setup Progress Widget]        │                │
│ │                                  │                │
│ └─────────────────────────────────┘                │
│ ┌──────────┐ ┌──────────┐                          │
│ │ Sales    │ │ Stock    │                          │
│ └──────────┘ └──────────┘                          │
└──────────────────────────────────────────────────────┘
```

**Persistencia:**
```ts
// Guardar en Supabase
await supabase
  .from('user_dashboard_layouts')
  .upsert({
    user_id: userId,
    layout: JSON.stringify(layout),
    updated_at: new Date()
  });
```

---

## 🔔 **4. Sistema de Notificaciones Inteligentes**

### **Concepto:**
**Agrupar notificaciones similares** y priorizar según impacto en el negocio.

### **Implementación técnica:**

```tsx
interface SmartNotification {
  id: string;
  category: 'critical' | 'warning' | 'info' | 'achievement';
  priority: number; // 1 = crítico, 5 = informativo
  grouped: boolean; // Si agrupa múltiples eventos
  groupedCount?: number;
  events: NamespacedEvent[];
  displayText: string;
  action?: { label: string; url: string };
  expiresAt?: Date;
}
```

**Agrupación de notificaciones:**
```ts
class NotificationAggregator {
  private pendingNotifications = new Map<string, SmartNotification>();

  async aggregateEvent(event: NamespacedEvent) {
    const category = this.categorizeEvent(event);

    // Agrupar eventos similares
    if (category === 'low_stock') {
      const existingNotif = this.pendingNotifications.get('low_stock_group');

      if (existingNotif) {
        existingNotif.groupedCount!++;
        existingNotif.events.push(event);
        existingNotif.displayText = `${existingNotif.groupedCount} productos con stock bajo`;
      } else {
        this.pendingNotifications.set('low_stock_group', {
          id: 'low_stock_group',
          category: 'warning',
          priority: 2,
          grouped: true,
          groupedCount: 1,
          events: [event],
          displayText: 'Stock bajo en 1 producto',
          action: { label: 'Ver inventario', url: '/admin/materials' }
        });
      }
    }
  }

  // Flush agrupadas cada 5 segundos
  async flushAggregated() {
    for (const [key, notif] of this.pendingNotifications) {
      await this.displayNotification(notif);
      this.pendingNotifications.delete(key);
    }
  }
}
```

**Priorización basada en business model:**
```ts
// Si el usuario tiene "delivery" activo, priorizar notificaciones de delivery
function prioritizeNotification(
  notification: SmartNotification,
  businessModel: BusinessActivityId[]
): number {
  let priority = notification.priority;

  if (notification.category === 'delivery' && businessModel.includes('sells_products_delivery')) {
    priority -= 1; // Mayor prioridad
  }

  if (notification.category === 'table_management' && businessModel.includes('sells_products_onsite')) {
    priority -= 1;
  }

  return Math.max(1, priority); // Mínimo 1
}
```

**UI propuesta:**
```
┌─ Notificaciones Agrupadas ─────────────────────────┐
│ 🔴 CRÍTICO (2)                                      │
│   ⚠️ Mesa 5 esperando hace 20min [Ir al POS →]     │
│   ⚠️ Pago pendiente: Mesa 3 ($45.000) [Cobrar →]   │
│                                                      │
│ 🟡 ADVERTENCIAS (5)                                 │
│   📦 5 productos con stock bajo [Ver inventario →]  │
│   👥 2 staff members ausentes hoy [Ver →]           │
│                                                      │
│ 🏆 LOGROS (3)                                       │
│   🎉 ¡Logro desbloqueado! "Primera venta" +50 XP   │
│   📊 Nivel 5 alcanzado [Ver beneficios →]           │
└──────────────────────────────────────────────────────┘
```

---

## 🎯 **5. Logros Condicionales por Business Model**

### **Concepto:**
Achievements **dinámicos** que solo aparecen si el usuario tiene ciertas capabilities activas.

### **Implementación:**

```ts
interface ConditionalAchievement extends MasteryAchievement {
  requiredActivities: BusinessActivityId[];
  requiredInfrastructure?: InfrastructureId[];
}

const CONDITIONAL_ACHIEVEMENTS: ConditionalAchievement[] = [
  {
    id: 'delivery_speed_demon',
    name: 'Demonio de la Velocidad',
    description: 'Completa 10 deliveries en <20min cada uno',
    requiredActivities: ['sells_products_delivery'], // Solo si tiene delivery activo
    tier: 'gold',
    points: 400,
    triggerEvent: 'delivery:order_completed',
    conditions: { type: 'cumulative', threshold: 10, metadata: { maxDurationMin: 20 } }
  },
  {
    id: 'multi_location_sync',
    name: 'Sincronización Perfecta',
    description: 'Gestiona inventario entre 3+ locales sin quiebres',
    requiredActivities: [],
    requiredInfrastructure: ['multi_location'], // Solo multi-location
    tier: 'platinum',
    points: 1500
  }
];
```

**Filtrado dinámico en AchievementsEngine:**
```ts
async loadMasteryAchievements(): Promise<void> {
  const { data } = await supabase
    .from('achievement_definitions')
    .select('*')
    .eq('is_active', true)
    .eq('type', 'mastery');

  // Filtrar por business model del usuario
  const userProfile = useCapabilityStore.getState().profile;
  const userActivities = userProfile?.selectedActivities || [];
  const userInfra = userProfile?.selectedInfrastructure || [];

  this.masteryAchievements = data.filter(achievement => {
    // Si tiene requiredActivities, verificar que el usuario las tenga
    if (achievement.requiredActivities && achievement.requiredActivities.length > 0) {
      return achievement.requiredActivities.some(activity => userActivities.includes(activity));
    }

    // Si tiene requiredInfrastructure, verificar
    if (achievement.requiredInfrastructure && achievement.requiredInfrastructure.length > 0) {
      return achievement.requiredInfrastructure.some(infra => userInfra.includes(infra));
    }

    // Sin requisitos = visible para todos
    return true;
  });
}
```

---

## 🤖 **6. Tutoriales Contextuales Adaptativos**

### **Concepto:**
**Product tours interactivos** que se activan según el progreso del usuario.

### **Implementación:**

```tsx
interface InteractiveTutorial {
  id: string;
  title: string;
  steps: TutorialStep[];
  triggerCondition: () => boolean; // Cuándo mostrar
  completedBy?: string[]; // User IDs que completaron
}

interface TutorialStep {
  targetElement: string; // CSS selector
  title: string;
  description: string;
  action?: 'click' | 'input' | 'navigate';
  highlightElement: boolean;
}
```

**Ejemplo: Tutorial "Primera Venta"**
```ts
const FIRST_SALE_TUTORIAL: InteractiveTutorial = {
  id: 'first_sale_tutorial',
  title: 'Realiza tu primera venta',
  triggerCondition: () => {
    const { completedMilestones } = useCapabilityStore.getState().features;
    return completedMilestones.includes('create_first_product') &&
           !completedMilestones.includes('first_sale');
  },
  steps: [
    {
      targetElement: '#nav-sales',
      title: 'Ir al POS',
      description: 'Hacé click acá para abrir el punto de venta',
      action: 'click',
      highlightElement: true
    },
    {
      targetElement: '#product-search',
      title: 'Buscar producto',
      description: 'Buscá el producto que creaste antes',
      action: 'input',
      highlightElement: true
    },
    {
      targetElement: '#checkout-button',
      title: 'Finalizar venta',
      description: 'Click acá para completar la venta',
      action: 'click',
      highlightElement: true
    }
  ]
};
```

**Integración con AchievementsEngine:**
```ts
// Al desbloquear milestone "create_first_product"
eventBus.on('milestone:completed', (event) => {
  if (event.milestoneId === 'create_first_product') {
    // Verificar si debe mostrar tutorial
    const tutorial = TUTORIALS.find(t =>
      t.id === 'first_sale_tutorial' && t.triggerCondition()
    );

    if (tutorial && !hasCompletedTutorial(tutorial.id)) {
      showInteractiveTutorial(tutorial);
    }
  }
});
```

---

## 📈 **7. Insights Predictivos Post-Setup**

### **Concepto:**
Una vez completado el setup, ofrecer **recomendaciones basadas en datos**.

### **Implementación:**

```tsx
interface PredictiveInsight {
  id: string;
  type: 'opportunity' | 'risk' | 'optimization';
  title: string;
  description: string;
  confidence: number; // 0-100%
  suggestedAction: { label: string; url: string };
  basedOn: string[]; // Qué datos se usaron
}
```

**Ejemplos de insights:**

#### **Oportunidad: Expandir horarios**
```ts
{
  id: 'expand_hours_opportunity',
  type: 'opportunity',
  title: 'Oportunidad: Expandir Horarios',
  description: 'Detectamos 15 intentos de pedidos fuera de horario esta semana. Podrías aumentar ventas 12% abriendo 2 horas más.',
  confidence: 78,
  suggestedAction: { label: 'Configurar horarios', url: '/admin/settings/hours' },
  basedOn: ['sales:order_attempted_outside_hours', 'historical_sales_data']
}
```

#### **Riesgo: Quiebre de stock inminente**
```ts
{
  id: 'stockout_risk_flour',
  type: 'risk',
  title: 'Riesgo: Quiebre de Stock',
  description: 'Al ritmo actual de ventas, se te acaba la Harina en 3 días. Pedí más ahora para evitar pérdidas.',
  confidence: 92,
  suggestedAction: { label: 'Crear pedido', url: '/admin/materials?action=order&product=flour' },
  basedOn: ['inventory:current_stock', 'sales:consumption_rate']
}
```

**Cálculo de insights:**
```ts
class InsightsEngine {
  async generateInsights(userId: string): Promise<PredictiveInsight[]> {
    const insights: PredictiveInsight[] = [];

    // Analizar ventas fuera de horario
    const outsideHoursSales = await this.getOutsideHoursSalesAttempts(userId);
    if (outsideHoursSales > 10) {
      insights.push({
        id: 'expand_hours_opportunity',
        type: 'opportunity',
        // ... (como arriba)
      });
    }

    // Analizar consumo de inventario
    const stockoutRisks = await this.predictStockoutRisks(userId);
    for (const risk of stockoutRisks) {
      insights.push({
        id: `stockout_risk_${risk.productId}`,
        type: 'risk',
        // ...
      });
    }

    return insights.sort((a, b) => b.confidence - a.confidence);
  }
}
```

**Widget en Dashboard:**
```
┌─ 💡 Insights del Negocio ──────────────────────────┐
│ 🚨 Riesgo: Quiebre de Stock (92% confianza)        │
│    Harina se acaba en 3 días                       │
│    [Crear pedido →]                                │
│                                                      │
│ 🎯 Oportunidad: Expandir Horarios (78% confianza) │
│    Podrías aumentar ventas 12% abriendo 2h más    │
│    [Configurar horarios →]                          │
│                                                      │
│ ⚡ Optimización: Staff Scheduling (65% confianza)  │
│    Jueves y Viernes necesitás 1 mesero más         │
│    [Ver horarios →]                                 │
└──────────────────────────────────────────────────────┘
```

---

## 🔗 **8. Workflows Automatizados por Milestone**

### **Concepto:**
Al completar ciertos milestones, **activar acciones automáticas** que simplifican el setup.

### **Ejemplos:**

#### **Al completar "create_first_product" → Auto-crear categoría "General"**
```ts
eventBus.on('milestone:completed', async (event) => {
  if (event.milestoneId === 'create_first_product') {
    // Auto-crear categoría default si no existe
    const hasCategories = await checkUserHasCategories(event.userId);

    if (!hasCategories) {
      await supabase.from('categories').insert({
        user_id: event.userId,
        name: 'General',
        description: 'Categoría predeterminada',
        created_by_system: true
      });

      notify.info('💡 Creamos una categoría "General" para organizar tus productos');
    }
  }
});
```

#### **Al completar "configure_tables" → Sugerir crear primer menú**
```ts
if (event.milestoneId === 'configure_tables') {
  // Verificar si ya tiene productos
  const hasProducts = await checkUserHasProducts(event.userId);

  if (hasProducts) {
    notify.success(
      '🎉 ¡Mesas configuradas! ¿Querés crear tu primer menú digital?',
      { action: { label: 'Crear menú', onClick: () => navigate('/admin/products/menu') } }
    );
  }
}
```

---

## 🏆 **9. Leaderboards y Competencia Saludable**

### **Concepto:**
**Tablas de clasificación** opcionales para equipos/sucursales (si multi-location activo).

### **Implementación:**

```tsx
interface Leaderboard {
  id: string;
  name: string;
  type: 'team' | 'location' | 'individual';
  metric: string; // 'total_sales', 'customer_satisfaction', 'achievements_unlocked'
  period: 'daily' | 'weekly' | 'monthly';
  entries: LeaderboardEntry[];
}

interface LeaderboardEntry {
  rank: number;
  entityId: string; // userId, locationId, teamId
  entityName: string;
  score: number;
  change: number; // +/- desde período anterior
}
```

**Leaderboard de Sucursales:**
```
┌─ 🏆 Top Sucursales (Esta Semana) ──────────────────┐
│ 1. 🥇 Centro ($125,000) ↑3                          │
│ 2. 🥈 Palermo ($98,500) ↓1                          │
│ 3. 🥉 Belgrano ($87,200) →                          │
│ 4.     Recoleta ($65,400) ↑2                        │
│ 5.     Caballito ($54,100) ↓2                       │
│                                                      │
│ [Ver Ranking Completo →]                            │
└──────────────────────────────────────────────────────┘
```

**Opt-in/Opt-out:**
```tsx
// Usuario puede desactivar leaderboards si no le interesa
await supabase
  .from('user_preferences')
  .update({ show_leaderboards: false })
  .eq('user_id', userId);
```

---

## ⚡ **10. Setup Ultra-Rápido con IA (Futuro)**

### **Concepto:**
Usar **IA para pre-completar** configuraciones basadas en descripción del negocio.

### **Ejemplo de flujo:**

```
User: "Tengo un restaurante de pizzas con delivery"

IA analiza y pre-configura:
  ✅ Business Model: sells_products_onsite + sells_products_delivery
  ✅ Productos sugeridos: 10 pizzas comunes (Muzzarella, Napolitana, etc.)
  ✅ Categorías: Pizzas, Bebidas, Postres
  ✅ Zonas de delivery: Radio de 5km
  ✅ Horarios: 11:00-15:00 y 19:00-23:00
  ✅ Mesas: 10 mesas (4 personas c/u)

Usuario solo revisa y ajusta si necesita
```

**Implementación (simplificada):**
```ts
interface AISetupSuggestion {
  businessDescription: string;
  suggestedActivities: BusinessActivityId[];
  suggestedInfrastructure: InfrastructureId;
  suggestedProducts: Array<{ name: string; price: number; category: string }>;
  suggestedConfig: {
    operatingHours?: any;
    deliveryZones?: any;
    tables?: any;
  };
}

async function generateAISetup(description: string): Promise<AISetupSuggestion> {
  // Llamada a API de IA (OpenAI, Claude, etc.)
  const response = await fetch('/api/ai/suggest-setup', {
    method: 'POST',
    body: JSON.stringify({ description })
  });

  return await response.json();
}
```

**Beneficio:**
- Setup en **2 minutos** en lugar de 20 minutos
- Reduce fricción inicial
- Usuario ve valor inmediato

---

## 📝 **Resumen de Prioridades**

### **Corto Plazo (1-2 sprints):**
1. ✅ **Dashboard Evolutivo** (este documento)
2. ✅ **HeaderSwitch Component**
3. ✅ **BusinessSetupProgressWidget**
4. 🆕 **Sistema de Niveles y XP** (#1)
5. 🆕 **Notificaciones Agrupadas** (#4)

### **Mediano Plazo (3-6 meses):**
6. 🎯 **Logros Multi-Módulo** (#2)
7. 🎯 **Dashboard Widgets Configurables** (#3)
8. 🎯 **Logros Condicionales** (#5)
9. 🎯 **Tutoriales Contextuales** (#6)

### **Largo Plazo (6-12 meses):**
10. 🔮 **Insights Predictivos** (#7)
11. 🔮 **Workflows Automatizados** (#8)
12. 🔮 **Leaderboards** (#9)
13. 🔮 **Setup con IA** (#10)

---

## 🎯 **Decisiones de Arquitectura**

**Por qué estas ideas son viables en G-Admin:**

1. **EventBus Enterprise ya existe** → Fácil agregar listeners para nuevos achievements
2. **13 Stores de dominio** → Datos listos para generar insights
3. **Supabase real-time** → Leaderboards y notificaciones en tiempo real
4. **Sistema de capabilities modular** → Fácil activar/desactivar features según business model
5. **RequirementsRegistry extensible** → Solo agregar nuevas definiciones de achievements

**Complejidad técnica:**
- ✅ **Baja:** Ideas #1, #4, #5 (usan infraestructura existente)
- 🟡 **Media:** Ideas #2, #3, #6, #8 (requieren nuevos componentes)
- 🔴 **Alta:** Ideas #7, #9, #10 (requieren ML/IA o analytics avanzados)

---

## 📚 Referencias y Estándares

### UX/UI Design Patterns
- **Progressive Disclosure:** Nielsen Norman Group - [Artículo](https://www.nngroup.com/articles/progressive-disclosure/)
- **Gamification Design:** Yu-kai Chou - Octalysis Framework
- **Dashboard Design:** Stephen Few - Information Dashboard Design
- **Accordion Patterns:** Material Design Guidelines

### Implementaciones de Referencia
- **GitHub Dashboard:** Switch entre vistas (Overview/Repositories/Projects)
- **Notion Workspace:** Sidebar con contextos (Favorites/Private/Shared)
- **Linear Issues:** Top bar con filtros (Inbox/My Issues/All)
- **Jira Dashboard:** Tabs de contexto (Overview/Activity/Roadmap)

### Accessibility (WCAG 2.1)
- Keyboard navigation en switch (Tab, Arrow keys)
- ARIA labels en progress bars
- Color contrast ratio 4.5:1 mínimo
- Focus indicators visibles

---

## ✅ Checklist Pre-Implementación

Antes de escribir código, verificar:

- [ ] Usuario revisó y aprobó este documento
- [ ] Ideas a Futuro completadas (investigación de código)
- [ ] Wireframes aprobados visualmente
- [ ] Todos los edge cases considerados
- [ ] Integración con AchievementsEngine clara
- [ ] Impacto en componentes existentes evaluado
- [ ] Plan de testing definido

---

**Documento creado:** 2025-10-06
**Versión:** 1.0
**Estado:** ⏳ Pendiente de aprobación
**Próximo paso:** Investigar código para completar "Ideas a Futuro"
