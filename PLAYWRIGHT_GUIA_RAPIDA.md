# 🎭 Guía Rápida de Playwright - G-Mini

## 📋 Requisitos Previos

1. **Servidor de desarrollo corriendo**:
   ```powershell
   pnpm dev
   ```
   Debe estar corriendo en `http://localhost:5173`

2. **Navegadores instalados**:
   ```powershell
   pnpm exec playwright install
   ```

## 🚀 Comandos Principales

### 🔐 **NUEVO: Probar con tu Sesión Activa (Login guardado)**

**Primera vez - Guardar tu sesión:**
```powershell
pnpm e2e:setup
```
- Se abrirá Chrome
- Tienes 60 segundos para hacer login manualmente
- Tu sesión se guardará en `.auth/user.json`
- Solo necesitas hacerlo una vez

**Ejecutar pruebas con tu sesión:**
```powershell
pnpm e2e:with-session
```
- Usa tu sesión guardada automáticamente
- No necesitas volver a hacer login
- Todas las pruebas correrán como si estuvieras logueado

### 1. **Modo UI (Interfaz Visual)** - ⭐ RECOMENDADO
```powershell
pnpm e2e:ui
```
- Abre una interfaz gráfica donde puedes:
  - Ver todas las pruebas disponibles
  - Ejecutar pruebas individuales
  - Ver el navegador en tiempo real
  - Inspeccionar cada paso
  - Ver screenshots y videos

### 2. **Modo Headed (Ver el Navegador)**
```powershell
pnpm e2e:headed
```
- Ejecuta las pruebas mostrando el navegador
- Útil para ver qué está pasando

### 3. **Modo Debug (Depuración Paso a Paso)**
```powershell
pnpm e2e:debug
```
- Pausa la ejecución en cada paso
- Puedes inspeccionar el estado
- Ver el selector de elementos

### 4. **Modo Normal (Headless)**
```powershell
pnpm e2e
```
- Ejecuta todas las pruebas sin mostrar navegador
- Más rápido, para CI/CD

### 5. **Ver Reportes**
```powershell
pnpm e2e:report
```
- Muestra el último reporte HTML con resultados
- Incluye screenshots y videos de fallos

## 🧪 Pruebas Disponibles

```
tests/e2e/
├── gmini-smoke.spec.ts           # Prueba básica de carga
├── gmini-navigation.spec.ts      # Navegación entre páginas
├── gmini-deep-inspection.spec.ts # Inspección detallada
├── gmini-debug.spec.ts           # Debug específico
├── achievements-takeaway.spec.ts # Sistema de logros
└── demo.spec.ts                  # Demo de ejemplo
```

## 📝 Ejecutar Pruebas Específicas

### Ejecutar un archivo específico:
```powershell
pnpm exec playwright test gmini-smoke.spec.ts --headed
```

### Ejecutar pruebas que coincidan con un patrón:
```powershell
pnpm exec playwright test --grep "smoke" --headed
```

### Ejecutar en un navegador específico:
```powershell
pnpm exec playwright test --project=chromium --headed
pnpm exec playwright test --project=firefox --headed
pnpm exec playwright test --project=webkit --headed
```

## 🎯 Workflow Recomendado

### Para Desarrollo:
1. **Inicia el servidor**: `pnpm dev` (en una terminal)
2. **Abre Playwright UI**: `pnpm e2e:ui` (en otra terminal)
3. Selecciona y ejecuta pruebas desde la interfaz
4. Observa los resultados en tiempo real

### Para Probar con Chrome (con tu sesión activa):
1. **Ejecuta pruebas en Chrome**: `pnpm e2e:chrome`
2. Verás Chrome abrirse y ejecutar las pruebas automáticamente
3. Útil si necesitas ver la app con tu sesión de usuario activa

### Para Depuración:
1. **Modo Debug**: `pnpm e2e:debug`
2. Usa el inspector de Playwright para:
   - Pausar en puntos específicos
   - Ver selectores de elementos
   - Ejecutar comandos manualmente

### Para Ver Resultados:
1. Ejecuta las pruebas: `pnpm e2e`
2. Si hay fallos, revisa: `pnpm e2e:report`
3. El reporte incluye:
   - Screenshots del momento del fallo
   - Videos de la ejecución
   - Traces detallados

## 🔍 Inspector de Playwright

Para inspeccionar elementos y generar selectores:
```powershell
pnpm exec playwright codegen http://localhost:5173
```

Esto abrirá:
- El navegador en tu aplicación
- Un inspector que graba tus acciones
- Genera código de prueba automáticamente

## 🛠️ Crear Nuevas Pruebas

```typescript
import { test, expect } from '@playwright/test';

test.describe('Mi Nueva Funcionalidad', () => {
  test('debería hacer algo específico', async ({ page }) => {
    // Ir a la página
    await page.goto('/');
    
    // Interactuar con elementos
    await page.click('button:text("Click me")');
    
    // Verificar resultados
    await expect(page.locator('.result')).toHaveText('Success');
  });
});
```

Guarda el archivo en `tests/e2e/mi-prueba.spec.ts`

## 📊 Configuración Actual

- **Base URL**: `http://localhost:5173`
- **Timeout por test**: 30 segundos
- **Navegadores**: Chromium, Firefox, WebKit
- **Screenshots**: Solo en fallos
- **Videos**: Solo en fallos
- **Traces**: En reintentos

Ver más en `playwright.config.ts`

## 🚨 Troubleshooting

### El servidor no está corriendo:
```
Error: connect ECONNREFUSED 127.0.0.1:5173
```
**Solución**: Ejecuta `pnpm dev` primero

### Navegadores no instalados:
```
Error: browserType.launch: Executable doesn't exist
```
**Solución**: `pnpm exec playwright install`

### Puerto ocupado:
Si el puerto 5173 está ocupado, cambia el puerto en:
- `vite.config.ts`
- `playwright.config.ts` (baseURL)

## 🎓 Recursos

- [Documentación Playwright](https://playwright.dev/docs/intro)
- [Selectores](https://playwright.dev/docs/selectors)
- [Best Practices](https://playwright.dev/docs/best-practices)
- Archivo de configuración: `playwright.config.ts`
- Guía detallada en inglés: `PLAYWRIGHT_E2E_GUIDE.md`

## 💡 Tips

1. **Usa `pnpm e2e:ui`** para desarrollo - es la forma más visual y fácil
2. **Inspecciona elementos** con `pnpm exec playwright codegen`
3. **Ve los reportes** después de cada ejecución
4. **Screenshots/videos** están en `playwright-report/` y `test-results/`
5. **Depura** con `page.pause()` en tus pruebas para pausar la ejecución

---

**¡Listo para probar!** 🚀

Comando más útil para empezar:
```powershell
pnpm e2e:ui
```
