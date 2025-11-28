# 🧪 Guía de Testing Manual - Sistema de Alertas

**Fecha:** 19 de Noviembre, 2025  
**URL de Testing:** http://localhost:5175/debug/alerts  
**Requiere:** SUPER_ADMIN role

---

## 🎯 Objetivo

Validar el funcionamiento completo del sistema de alertas refactorizado:
- ✅ Toast Stack (top-right)
- ✅ NotificationCenter (drawer lateral)
- ✅ Badges (Nav, Sidebar, Stock, Critical)
- ✅ Animaciones Framer Motion
- ✅ Progress tracking & auto-dismiss
- ✅ Filtros, tabs, timeline grouping
- ✅ Bulk actions

---

## 📋 Checklist de Testing (15 items)

### Toast Stack
- [✓] **1. Toast aparece en top-right**
  - Acción: Click "Create INFO"
  - Resultado esperado: Toast azul aparece en esquina superior derecha

- [✓] **2. Auto-dismiss funciona**
  - Acción: Click "Create INFO" y esperar 3 segundos
  - Resultado esperado: Toast desaparece automáticamente
  - Duraciones: INFO=3s, SUCCESS=3s, WARNING=5s, ERROR=8s, CRITICAL=∞

- [✓] **3. Progress bar visible y animado**
  - Acción: Click "Create WARNING"
  - Resultado esperado: Barra naranja en bottom del toast que avanza de 0% a 100% en 5 segundos

- [✓] **4. Max 3 toasts visible**
  - Acción: Click "Create 5 Alerts (Sequential)"
  - Resultado esperado: Solo 3 toasts visibles simultáneamente, resto encolado
 Con problemas porque no se encolan se muestran los 3 como maximo pero pasan los 5 haciendose que los 2 primeros no queden visibles, por algun motivo el ultimo nunca se activa la cuenta atras, el progres no se llena

- [✓] **5. Animaciones suaves**
  - Acción: Crear varios toasts
  - Resultado esperado: Slide-in desde derecha, fade, spring physics suave

### NotificationCenter

- [X] **6. Drawer opens/closes**
  - Acción: Click "Open NotificationCenter" o click en badge
  - Resultado esperado: Drawer se abre desde la derecha
El notification center no se abre al hacer click en el boton, solo se muestra el modal vacio, el badge parece ni siquiera funcionar
- [ ] **7. Tabs filtran correctamente**
  - Acción: Crear alertas mixtas, cambiar entre tabs (All, Unread, Critical, Acknowledged)
  - Resultado esperado: Contenido filtra según tab seleccionado

- [ ] **8. Search funciona**
  - Acción: Escribir en input de búsqueda
  - Resultado esperado: Lista filtra en tiempo real por title/description

- [ ] **9. Timeline grouping**
  - Acción: Crear alertas (aparecerán en "Hoy")
  - Resultado esperado: Alertas agrupadas por "Hoy", "Ayer", "Esta semana", "Anterior"

- [ ] **10. Bulk actions funcionan**
  - Acción: Click "Mark all read" y "Clear all"
  - Resultado esperado: 
    - "Mark all read": readAt timestamp se actualiza, badge count → 0
    - "Clear all": Alertas archivadas, desaparecen de lista activa

### Badges

- [ ] **11. Badge click abre NotificationCenter**
  - Acción: Click en NavAlertBadge o SidebarAlertBadge
  - Resultado esperado: NotificationCenter se abre automáticamente

- [ ] **12. Badge count actualiza en tiempo real**
  - Acción: Crear alertas, observar badges
  - Resultado esperado: Número en badge actualiza inmediatamente

- [ ] **13. Mark as read actualiza unread count**
  - Acción: Abrir NotificationCenter, click en alerta
  - Resultado esperado: Alerta se marca como leída, badge count decrementa

### Advanced Features

- [ ] **14. Snooze reappears después de delay**
  - Acción: Click "Snooze First (1 min)", esperar 1 minuto
  - Resultado esperado: Alerta reappears como activa después de 1 minuto

- [ ] **15. Archive remueve de active list**
  - Acción: Click "Clear all" o archive individual
  - Resultado esperado: Alertas archivadas no aparecen en lista activa ni toasts

---

## 🚀 Flujo de Testing Recomendado

### Fase 1: Toast Stack Básico (5 min)
```
1. Click "Create INFO" → Verificar toast azul top-right
2. Esperar 3s → Verificar auto-dismiss
3. Click "Create WARNING" → Verificar progress bar naranja
4. Click "Create 5 Alerts (Sequential)" → Verificar max 3 visible
5. Observar animaciones → Verificar suavidad (spring physics)
```

### Fase 2: NotificationCenter (5 min)
```
6. Click NavAlertBadge o "Open NotificationCenter" → Drawer abre
7. Click tabs (All, Unread, Critical, Acknowledged) → Verificar filtros
8. Escribir en search "test" → Verificar filtrado en tiempo real
9. Verificar timeline grouping (Today, Yesterday, etc.)
10. Click "Mark all read" → Verificar unread count → 0
```

### Fase 3: Bulk Operations (3 min)
```
11. Click "Bulk Create 10 Alerts" → Verificar creación rápida
12. Abrir NotificationCenter → Verificar 10+ alertas en lista
13. Click "Clear all" → Verificar archivado masivo
```

### Fase 4: Advanced Features (5 min)
```
14. Click "Create CRITICAL" → Verificar duration = ∞ (no auto-dismiss)
15. Click "Snooze First (1 min)" → Esperar 60s → Verificar reappears
16. Crear custom alert con severity mixto → Verificar todos los campos
17. Probar badges (Nav, Sidebar, Stock, Critical) → Verificar filtros contextuales
```

---

## 🐛 Problemas Conocidos / Esperados

### ✅ Comportamientos Correctos (NO son bugs)

1. **Critical alerts no desaparecen automáticamente**
   - ✅ Correcto: duration = Infinity, requieren dismissal manual

2. **Snooze reactivation tarda 1 minuto**
   - ✅ Correcto: setTimeout configurado a 1 minuto para testing

3. **Badge count puede ser > 99**
   - ✅ Correcto: Badge muestra "99+" pero internamente maneja count real

4. **Toast stack solo muestra 3**
   - ✅ Correcto: maxVisible = 3 por configuración (evita saturación UI)

5. **Archived alerts no reappears**
   - ✅ Correcto: Archive es permanente, no hay "unarchive"

---

## 📊 Métricas de Performance

### Esperadas
- **Toast rendering:** < 16ms (60fps)
- **NotificationCenter open:** < 100ms
- **Filter/search response:** < 50ms (debounced si necesario)
- **Bulk create 10 alerts:** < 200ms
- **Animation frame rate:** 60fps constante

### Cómo Medir
```javascript
// En Chrome DevTools Console:
performance.measure('toast-render')
```

O usar `PerformanceProvider` integrado en la app.

---

## 🎨 Testing Visual

### Colores por Severidad
- **INFO:** Azul (`blue.500`)
- **SUCCESS:** Verde (`green.500`)
- **WARNING:** Naranja (`orange.500`)
- **ERROR:** Rojo (`red.500`)
- **CRITICAL:** Rojo intenso (`red.600`)

### Animaciones
- **Slide-in:** x: 100 → 0 (desde derecha)
- **Fade:** opacity: 0 → 1
- **Exit:** x: 0 → 100, opacity: 1 → 0
- **Spring:** stiffness: 500, damping: 30

### Progress Bar
- **Height:** 2px
- **Position:** absolute bottom
- **Background:** gray.200
- **Bar color:** severity-based (blue/green/orange/red)
- **Transition:** width 0.1s linear

---

## ✅ Criterios de Aceptación

### Funcional
- ✅ Todas las alertas crean toasts
- ✅ Auto-dismiss funciona según duración
- ✅ NotificationCenter lista todas las alertas
- ✅ Filtros y búsqueda funcionan
- ✅ Bulk actions ejecutan correctamente
- ✅ Badges actualizan en tiempo real
- ✅ Snooze reactivation funciona

### Performance
- ✅ 60fps en animaciones
- ✅ No lag al crear 10+ alertas
- ✅ Search response < 50ms

### UX
- ✅ Animaciones suaves (no robóticas)
- ✅ Colores distinguibles por severidad
- ✅ Progress bar visible y claro
- ✅ Empty states informativos
- ✅ Badges intuitivos (click → open drawer)

---

## 🎉 Resultado Esperado

**Si todos los items del checklist pasan:**
- ✅ Sistema de alertas 100% operacional
- ✅ Toast stack + NotificationCenter integrados
- ✅ Performance optimizada
- ✅ UX moderna y fluida
- ✅ Listo para producción

**Siguiente paso:** Playwright visual tests (opcional)

---

## 📝 Notas de Testing

### Para reportar bugs:
1. Item del checklist que falla (#)
2. Pasos para reproducir
3. Comportamiento esperado vs actual
4. Console logs / screenshots

### Para sugerencias UX:
1. Área específica (toast, drawer, badges)
2. Problema de usabilidad observado
3. Sugerencia de mejora

---

**Happy Testing! 🚀**
