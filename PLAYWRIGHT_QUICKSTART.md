# 🚀 PLAYWRIGHT - INSTALADO Y FUNCIONANDO ✅

## ✅ LO QUE YA TIENES

- ✅ Playwright v1.56.1 instalado
- ✅ Chromium descargado
- ✅ Test de demostración funcionando
- ✅ 3/3 tests passing

---

## 🎯 COMANDOS ESENCIALES

### Ver Tests en Modo UI (MÁS RECOMENDADO)

```bash
# UI interactivo - puedes ver cada paso, pausar, debug
pnpm exec playwright test --ui
```

**Esto abre una interfaz donde puedes:**
- ▶️ Ejecutar tests uno por uno
- ⏸️ Pausar en cualquier momento
- 🔍 Ver el DOM en cada paso
- 📸 Ver screenshots
- 🐛 Debug interactivo

---

### Ejecutar Tests

```bash
# Todos los tests
pnpm exec playwright test

# Solo un archivo
pnpm exec playwright test tests/e2e/demo.spec.ts

# Con navegador visible (headed mode)
pnpm exec playwright test --headed

# Solo en Chrome
pnpm exec playwright test --project=chromium

# Debug mode (pausa en cada paso)
pnpm exec playwright test --debug

# Un test específico por nombre
pnpm exec playwright test -g "puede navegar"
```

---

### Ver Reportes

```bash
# Ver último reporte HTML
pnpm exec playwright show-report

# Ejecutar y mostrar reporte
pnpm exec playwright test && pnpm exec playwright show-report
```

---

## 📁 ARCHIVOS CREADOS

### 1. Tests de Demostración
- `tests/e2e/demo.spec.ts` - Tests básicos que YA funcionan

### 2. Tests de Achievements (listos pero requieren app)
- `tests/e2e/achievements-takeaway.spec.ts` - 8 tests E2E completos

### 3. Configuración
- `playwright.config.ts` - Config lista para usar

### 4. Documentación
- `PLAYWRIGHT_E2E_GUIDE.md` - Guía completa en español

---

## 🎬 PRÓXIMO PASO: TESTEAR G-MINI

### Paso 1: Iniciar tu app

```bash
# En una terminal
pnpm dev
```

### Paso 2: En otra terminal, ejecutar tests

```bash
# Ver tests en UI mode
pnpm exec playwright test --ui

# O ejecutar directamente
pnpm exec playwright test tests/e2e/achievements-takeaway.spec.ts
```

---

## 🔧 AGREGAR data-testid A TUS COMPONENTES

Para que los tests de achievements funcionen, necesitas agregar `data-testid` a tus componentes:

### Ejemplo 1: Toggle TakeAway

```tsx
// En tu componente de Sales
<Switch 
  data-testid="toggle-takeaway-public"
  onChange={handleToggle}
/>
```

### Ejemplo 2: Modal de Requirements

```tsx
// En tu modal de requirements
<Modal 
  data-testid="requirements-modal"
  isOpen={isOpen}
>
  <ModalHeader>
    <Heading data-testid="modal-title">
      Configuración Requerida
    </Heading>
  </ModalHeader>
  
  <ModalBody>
    <Text data-testid="missing-count">
      {missingCount} pendientes
    </Text>
    
    {requirements.map(req => (
      <Box 
        key={req.id}
        data-testid="requirement-item"
      >
        <Text>{req.name}</Text>
        <Button data-testid={`requirement-${req.id}`}>
          Configurar
        </Button>
      </Box>
    ))}
  </ModalBody>
</Modal>
```

### Ejemplo 3: Progress Bar

```tsx
<Progress 
  data-testid="requirements-progress"
  value={progress}
  role="progressbar"
  aria-valuenow={progress}
  aria-valuemin={0}
  aria-valuemax={100}
/>
```

---

## 🎨 TIPS ÚTILES

### 1. Ver Trace de Test Fallido

Si un test falla, Playwright guarda un trace:

```bash
pnpm exec playwright show-trace test-results/.../trace.zip
```

### 2. Screenshot Manual

```typescript
// En tu test
await page.screenshot({ path: 'screenshot.png' });
```

### 3. Slow Motion (más fácil de ver)

```bash
pnpm exec playwright test --headed --slow-mo=1000
```

Esto ejecuta cada acción con 1 segundo de delay.

### 4. Ver en Múltiples Navegadores

```bash
# Ejecutar en Chrome, Firefox y Safari
pnpm exec playwright test --project=chromium --project=firefox --project=webkit
```

---

## 📊 LO QUE VISTE EN ACCIÓN

### Test 1: Navegación
```typescript
await page.goto('https://playwright.dev');
await expect(page).toHaveTitle(/Playwright/);
```
👉 Abrió Chrome, fue a la página, verificó el título

### Test 2: Click
```typescript
await page.getByRole('link', { name: /get started/i }).click();
await expect(page).toHaveURL(/docs/);
```
👉 Hizo click en "Get Started", verificó que navegó

### Test 3: Formulario
```typescript
await searchButton.click();
await searchInput.fill('testing');
```
👉 Abrió búsqueda, escribió texto

---

## 🐛 TROUBLESHOOTING

### "Browser not found"
```bash
pnpm exec playwright install chromium
```

### "Port 5173 not available"
Asegúrate que `pnpm dev` esté corriendo en otra terminal.

### "Element not found"
Agrega `await page.waitForSelector('[data-testid="element"]')` antes de interactuar.

### Tests muy lentos
Usa `--workers=1` para ejecutar secuencialmente en desarrollo.

---

## 📚 RECURSOS

### Documentación
- **Playwright Docs:** https://playwright.dev
- **Guía G-Mini:** `PLAYWRIGHT_E2E_GUIDE.md`

### Videos Útiles
- **Playwright Crash Course:** https://www.youtube.com/watch?v=Xz6lhEzgI5I
- **Testing Best Practices:** https://www.youtube.com/watch?v=LM4yqrOzmFE

---

## ✅ CHECKLIST SIGUIENTE SESIÓN

Si quieres continuar con E2E tests para achievements:

- [ ] Agregar `data-testid` a componentes de Sales
- [ ] Agregar `data-testid` a modal de requirements
- [ ] Agregar `data-testid` a items de checklist
- [ ] Ejecutar `pnpm dev` en una terminal
- [ ] Ejecutar `pnpm exec playwright test --ui` en otra
- [ ] Ver tests de achievements en acción

---

**¡Playwright está listo y funcionando! 🎉**

Para continuar: `pnpm exec playwright test --ui`
