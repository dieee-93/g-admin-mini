# 🚀 Navigation Bug Debugging - Quick Start

**5 minutos para empezar a debuggear el bug de navegación**

---

## ⚡ Opción 1: Ejecutar Test Ahora Mismo

```bash
# Ejecutar test con interfaz visual
npx playwright test navigation-bug-detector --headed

# O mejor aún, con la UI interactiva
npx playwright test navigation-bug-detector --ui
```

**Qué hace:**
- ✅ Navega automáticamente entre módulos
- ✅ Detecta si hay intentos repetidos de navegación
- ✅ Captura screenshots cuando detecta el bug
- ✅ Genera reporte detallado con todos los logs

---

## 🔍 Opción 2: Habilitar Debugging en Desarrollo

**Paso 1:** Abre la consola del browser en tu app (localhost:5173)

**Paso 2:** Pega este código:

```javascript
window.__ENABLE_NAVIGATION_DEBUGGER__ = true;
```

**Paso 3:** Navega normalmente entre módulos

**Paso 4:** Si ocurre el bug, verás en consola:

```
🐛 BUG DETECTED: Rapid navigation attempts
   moduleId: "products"
   attemptCount: 7
```

**Paso 5:** Ver el reporte completo:

```javascript
console.log(window.__NAVIGATION_DEBUG_INFO__);
```

---

## 📊 Ver Resultados

### Reporte HTML (después de ejecutar tests):

```bash
npx playwright show-report
```

### Screenshots capturados:

```bash
# Los screenshots están en:
test-screenshots/navigation-bug-*.png
test-screenshots/rapid-click-bug.png
```

### Videos (si el test falla):

```bash
# Los videos están en:
test-results/**/video.webm
```

---

## 🎯 ¿Qué Buscar?

Cuando veas el reporte, busca:

1. **Intentos repetidos**: 3+ intentos al mismo módulo en <5 segundos
2. **Stack trace**: ¿Qué componente está llamando a navigate()?
3. **Timing**: ¿Cuánto tiempo entre intentos?
4. **Estado del lock**: ¿El lock estaba activado?
5. **Logs de React Router**: ¿Algún error de navegación?

---

## 🔧 Comandos Útiles

```bash
# Ejecutar solo un test específico
npx playwright test "debería detectar intentos repetidos"

# Ejecutar en modo debug (paso a paso)
npx playwright test navigation-bug-detector --debug

# Ejecutar todos los tests de navegación
npx playwright test navigation-bug-detector

# Ver todos los tests disponibles
npx playwright test --list
```

---

## 📝 Información de Logs

### En NavigationContext ahora verás:

```javascript
🔍 [DEBUG] handleNavigateToModule called {
  moduleId: "products",
  lockStatus: {
    isNavigating: false,
    attemptCount: 0,
    timeSinceLastAttempt: 0
  },
  currentLocation: "/admin/dashboard",
  callStack: "at Sidebar.tsx:123 | at onClick"  // 🎯 IMPORTANTE
}
```

El **callStack** te dice QUIÉN está disparando la navegación.

### Cuando detecta el bug:

```javascript
⚠️ [WARN] 🐛 BUG DETECTED: Rapid navigation attempts {
  moduleId: "products",
  attemptCount: 7,
  timeSinceLastAttempt: 188,  // ms
  currentPath: "/admin/dashboard"
}
```

---

## 🎬 Script Interactivo (Bash)

Si estás en Linux/Mac/Git Bash:

```bash
chmod +x scripts/debug-navigation.sh
./scripts/debug-navigation.sh
```

Te mostrará un menú con todas las opciones de debugging.

---

## 📚 Documentación Completa

Para entender todo el sistema de debugging:

```bash
cat NAVIGATION_BUG_DEBUGGING_STRATEGY.md
```

O abrelo en tu editor favorito.

---

## ❓ FAQ Rápido

**P: ¿El debugger afecta el performance?**
R: Sólo cuando está habilitado. En producción está desactivado automáticamente.

**P: ¿Puedo dejar el debugger siempre activo en dev?**
R: Sí, pero genera muchos logs. Actívalo solo cuando necesites investigar el bug.

**P: ¿Los tests Playwright requieren que la app esté corriendo?**
R: No, Playwright inicia el servidor automáticamente (configurado en `playwright.config.ts`).

**P: ¿Puedo ejecutar los tests en CI/CD?**
R: Sí, pero desactiva el modo `--headed`. El test funcionará en headless automáticamente.

**P: ¿Cómo capturo el bug si es intermitente?**
R: Ejecuta el test de "sesión extendida" que navega durante varios minutos:
```bash
npx playwright test "debería monitorear navegación durante sesión extendida"
```

---

## 🚨 Si Capturas el Bug

**Guarda esta información:**

1. Screenshot del momento exacto
2. Logs completos de consola
3. Stack trace del primer intento
4. `window.__NAVIGATION_DEBUG_INFO__` completo
5. URL actual vs URL destino

**Compártelo:**

Copia el output de:
```javascript
const report = window.__NAVIGATION_DEBUG_INFO__;
console.log(JSON.stringify(report, null, 2));
```

---

## ✅ Checklist Rápido

Antes de debuggear, verifica:

- [ ] Tienes Playwright instalado (`pnpm add -D @playwright/test`)
- [ ] El servidor dev está corriendo en :5173 (o Playwright lo iniciará)
- [ ] Tienes permisos de escritura en `test-screenshots/`
- [ ] Chrome/Chromium está instalado

---

## 🎯 Próximo Paso Recomendado

**Ejecuta esto AHORA:**

```bash
npx playwright test navigation-bug-detector --ui
```

La UI te permite:
- ✅ Ver el test ejecutándose en vivo
- ✅ Pausar en cualquier momento
- ✅ Inspeccionar el DOM
- ✅ Ver todos los logs en tiempo real
- ✅ Re-ejecutar tests específicos

Es la mejor forma de entender qué está pasando.

---

**¿Listo? Ejecuta el comando y observa! 🚀**
