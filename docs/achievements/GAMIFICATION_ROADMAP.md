# Gamification System - Roadmap

**Fecha de creación:** 2025-01-18  
**Estado:** 🟡 PREPARATORIO - Infraestructura lista, no implementado  
**Versión:** 1.0.0

---

## 📋 TABLA DE CONTENIDOS

1. [Estado Actual](#estado-actual)
2. [Propósito del Sistema](#propósito-del-sistema)
3. [Arquitectura Preparada](#arquitectura-preparada)
4. [Plan de Implementación](#plan-de-implementación)
5. [Migraciones Necesarias](#migraciones-necesarias)

---

## 🎯 ESTADO ACTUAL {#estado-actual}

### ✅ Infraestructura Completada

- **Store**: `gamificationStore.ts` creado y listo
- **Persistencia**: LocalStorage configurado (temporal)
- **Tipos**: Interfaces definidas
- **Acciones**: Placeholder functions listos

### ⚠️ NO Implementado

- ❌ Lógica de detección de achievements
- ❌ Notificaciones cuando se completan
- ❌ UI para mostrar progreso
- ❌ Integración con EventBus
- ❌ Migración a Supabase

---

## 💡 PROPÓSITO DEL SISTEMA {#propósito-del-sistema}

### ❌ NO es para:

- **Tracking comercial/operacional** → Eso son los requirements (ver `requirements/`)
- **Métricas de negocio** → Eso es analytics
- **Validaciones bloqueantes** → Eso son mandatory requirements

### ✅ ES para:

#### **Fase 1 (Q2 2025): Onboarding/Tutoriales**
Sistema de guía para nuevos administradores:
- "¡Completaste tu primer producto!" 
- "¡Configuraste tu primera mesa!"
- "¡Procesaste tu primera venta!"

**Beneficios:**
- Reduce curva de aprendizaje
- Sensación de progreso
- Motivación para completar setup

#### **Fase 2 (Q3 2025): Motivación de Empleados**
Achievements para staff/operadores:
- "¡100 ventas procesadas!" (+50 pts)
- "¡Empleado del mes!" (badge)
- "¡Turno perfecto sin errores!" (+100 pts)

**Beneficios:**
- Aumenta engagement del staff
- Competencia sana entre empleados
- Reconocimiento de buen desempeño

#### **Fase 3 (2026+): Loyalty Program Clientes**
Programa de lealtad para clientes finales:
- Points por compras
- Badges por frecuencia
- Rewards/descuentos
- Tiers de membresía

**Beneficios:**
- Retención de clientes
- Incremento de ventas
- Base de clientes leales

---

## 🏗️ ARQUITECTURA PREPARADA {#arquitectura-preparada}

### Stores Creados

```
src/store/
├── achievementsStore.ts          ← UI state (modals)
└── gamificationStore.ts          ← Gamification data (futuro)
```

**gamificationStore.ts:**
```typescript
interface GamificationState {
  userId: string | null;
  userType: 'admin' | 'employee' | 'customer' | null;
  completedAchievements: Set<string>;
  totalPoints: number;
  unlockedBadges: string[];
  lastUpdated: Date | null;
  
  completeAchievement(id: string, points?: number): void;
  unlockBadge(id: string): void;
}
```

### Base de Datos (TODO - Fase de Implementación)

```sql
-- Tabla para achievements de usuarios
CREATE TABLE user_achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users NOT NULL,
  user_type TEXT CHECK (user_type IN ('admin', 'employee', 'customer')),
  achievement_id TEXT NOT NULL,
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  points_awarded INTEGER DEFAULT 0,
  
  -- Constraints
  UNIQUE(user_id, achievement_id)
);

-- Índices
CREATE INDEX idx_user_achievements_user_id ON user_achievements(user_id);
CREATE INDEX idx_user_achievements_type ON user_achievements(user_type);
CREATE INDEX idx_user_achievements_completed ON user_achievements(completed_at DESC);

-- Tabla para badges
CREATE TABLE user_badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users NOT NULL,
  badge_id TEXT NOT NULL,
  unlocked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Constraints
  UNIQUE(user_id, badge_id)
);

-- Vista para resumen por usuario
CREATE VIEW user_gamification_summary AS
SELECT 
  u.id as user_id,
  u.email,
  COUNT(DISTINCT a.id) as total_achievements,
  COALESCE(SUM(a.points_awarded), 0) as total_points,
  COUNT(DISTINCT b.id) as total_badges
FROM auth.users u
LEFT JOIN user_achievements a ON u.id = a.user_id
LEFT JOIN user_badges b ON u.id = b.user_id
GROUP BY u.id, u.email;
```

---

## 📅 PLAN DE IMPLEMENTACIÓN {#plan-de-implementación}

### Fase 1: Onboarding (Q2 2025)

**Objetivos:**
- Sistema básico de achievements para administradores
- Notificaciones toast cuando se completan
- Panel simple de progreso

**Tareas:**

1. **Definir achievements de onboarding** (2 días)
   - [ ] Listar achievements clave para setup
   - [ ] Diseñar iconos y mensajes
   - [ ] Definir puntos por achievement

2. **Implementar detección** (3 días)
   - [ ] Integrar con EventBus
   - [ ] Listeners para eventos clave:
     - `products.created` → "+1 producto"
     - `staff.added` → "+1 empleado"
     - `sales.completed` → "+1 venta"
   - [ ] Lógica para verificar achievements

3. **Sistema de notificaciones** (2 días)
   - [ ] Toast notification cuando se completa
   - [ ] Sonido opcional
   - [ ] Link a panel de achievements

4. **UI de achievements** (3 días)
   - [ ] Página `/admin/achievements`
   - [ ] Lista de achievements con progreso
   - [ ] Badges desbloqueados
   - [ ] Total de puntos

5. **Testing y pulido** (2 días)
   - [ ] Tests unitarios
   - [ ] Tests de integración con EventBus
   - [ ] Feedback de usuarios

**Total estimado: 12 días (2.5 semanas)**

### Fase 2: Empleados (Q3 2025)

**Objetivos:**
- Extender sistema a empleados
- Leaderboard de staff
- Reconocimiento mensual

**Tareas:**

1. **Migrar a Supabase** (5 días)
   - [ ] Crear tablas en DB
   - [ ] Migrar de localStorage a Supabase
   - [ ] Sync automático

2. **Achievements de empleados** (3 días)
   - [ ] Definir achievements para staff
   - [ ] Tracking por rol (cajero, cocinero, etc.)
   - [ ] Diferentes categorías

3. **Leaderboard** (4 días)
   - [ ] Ranking por puntos
   - [ ] Filtros por período (semanal, mensual)
   - [ ] Badges especiales para top performers

4. **Notificaciones mejoradas** (2 días)
   - [ ] Notificaciones push (opcional)
   - [ ] Email semanal con resumen
   - [ ] Banner en dashboard

**Total estimado: 14 días (3 semanas)**

### Fase 3: Clientes (2026+)

**Objetivos:**
- Loyalty program completo
- Integración con ventas
- Rewards/descuentos

**Tareas:** (A definir cuando se implemente)

---

## 🔄 MIGRACIONES NECESARIAS {#migraciones-necesarias}

### De localStorage a Supabase

**Cuándo:** Antes de Fase 2

**Pasos:**

1. Crear tablas en Supabase
2. Crear hook `useUserAchievements()` con TanStack Query
3. Migrar datos existentes (si hay)
4. Actualizar `gamificationStore` para usar Supabase
5. Eliminar persist middleware

**Script de migración (ejemplo):**

```typescript
// scripts/migrate-gamification.ts
import { supabase } from '@/lib/supabase';

async function migrateLocalStorageToSupabase() {
  // 1. Leer de localStorage
  const localData = localStorage.getItem('gamification-storage');
  if (!localData) return;
  
  const parsed = JSON.parse(localData);
  
  // 2. Insertar en Supabase
  for (const achievementId of parsed.completedAchievements) {
    await supabase.from('user_achievements').insert({
      user_id: parsed.userId,
      achievement_id: achievementId,
      points_awarded: 0, // Calcular si está disponible
    });
  }
  
  // 3. Limpiar localStorage
  localStorage.removeItem('gamification-storage');
  console.log('✅ Migración completada');
}
```

---

## 📝 NOTAS IMPORTANTES

### Separación de Responsabilidades

**achievements/** (actual - requirements del sistema):
- ✅ Validaciones bloqueantes
- ✅ Requirements obligatorios
- ✅ Progress de capabilities
- ❌ NO es gamificación

**gamificationStore** (futuro - motivación):
- ✅ Points/badges de usuarios
- ✅ Achievements opcionales
- ✅ Reconocimiento/recompensas
- ❌ NO bloquea operaciones

### Consideraciones

1. **Performance**: Usar TanStack Query con staleTime apropiado
2. **Privacy**: Datos de empleados deben ser privados
3. **Fairness**: Sistema debe ser justo y transparente
4. **Gamification balance**: No sobre-gamificar (evitar burnout)

---

## 🚀 PRÓXIMOS PASOS

**Inmediatos (cuando se apruebe):**

1. Review y aprobación de este roadmap
2. Priorización de Fase 1 vs otras features
3. Asignación de recursos/tiempo
4. Kick-off de Fase 1

**Preguntas a responder:**

- ¿Qué achievements son prioritarios para onboarding?
- ¿Queremos sonido en las notificaciones?
- ¿Panel de achievements visible desde dónde?
- ¿Migrar a Supabase desde Fase 1 o esperar a Fase 2?

---

**Última actualización:** 2025-01-18  
**Próxima revisión:** Q2 2025 (antes de implementar Fase 1)
