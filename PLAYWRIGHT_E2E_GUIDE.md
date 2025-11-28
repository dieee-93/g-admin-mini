# PLAYWRIGHT E2E TESTING - GUÍA DE INSTALACIÓN Y USO

## 🎭 ¿Qué es Playwright?

Playwright es una herramienta de **testing End-to-End (E2E)** que simula un usuario real interactuando con tu aplicación en un navegador real. Es como tener un robot que:

- ✅ Abre tu app en Chrome, Firefox y Safari
- ✅ Hace click en botones
- ✅ Llena formularios
- ✅ Navega entre páginas
- ✅ Verifica que todo funciona correctamente

### Diferencia con Tests Unitarios

```typescript
// ❌ Test Unitario - testea código aislado
test('validator returns true', () => {
  expect(validator(context)).toBe(true);
});

// ✅ Test E2E - testea experiencia completa del usuario
test('user can toggle TakeAway public', async ({ page }) => {
  await page.goto('/admin/sales');
  await page.click('[data-testid="toggle-public"]');
  await expect(page.locator('.modal')).toBeVisible();
});
```

---

## 📦 INSTALACIÓN

### Paso 1: Instalar Playwright

```bash
# En la raíz del proyecto g-mini
pnpm add -D @playwright/test
```

### Paso 2: Instalar Navegadores

```bash
# Instala Chrome, Firefox y Safari
pnpm exec playwright install

# O solo uno si prefieres:
pnpm exec playwright install chromium
```

### Paso 3: Verificar Instalación

```bash
# Ver versión
pnpm exec playwright --version
# Debería mostrar: Version 1.40.0 (o similar)
```

---

## 🚀 USO BÁSICO

### Ejecutar Tests

```bash
# Correr todos los tests E2E
pnpm exec playwright test

# Correr en modo UI (recomendado para desarrollo)
pnpm exec playwright test --ui

# Correr solo un archivo
pnpm exec playwright test achievements-takeaway.spec.ts

# Correr con navegador visible (headed mode)
pnpm exec playwright test --headed

# Correr solo en Chrome
pnpm exec playwright test --project=chromium

# Debug mode (pausa en cada paso)
pnpm exec playwright test --debug
```

### Ver Reporte

```bash
# Generar y abrir reporte HTML
pnpm exec playwright show-report
```

---

## 📝 ESTRUCTURA DE UN TEST

### Anatomía Básica

```typescript
import { test, expect } from '@playwright/test';

test('descripción del test', async ({ page }) => {
  // 1. ARRANGE - Preparar el escenario
  await page.goto('http://localhost:5173/admin/sales');
  
  // 2. ACT - Ejecutar la acción
  await page.click('[data-testid="toggle-public"]');
  
  // 3. ASSERT - Verificar resultado
  await expect(page.locator('.modal')).toBeVisible();
});
```

### Selectores Comunes

```typescript
// Por data-testid (recomendado)
page.locator('[data-testid="my-button"]')

// Por texto
page.getByText('Configurar')

// Por role
page.getByRole('button', { name: 'Enviar' })

// Por placeholder
page.getByPlaceholder('Email')

// Por label
page.getByLabel('Contraseña')

// CSS selector
page.locator('.my-class')
page.locator('#my-id')

// XPath
page.locator('xpath=//button[@type="submit"]')
```

### Acciones Comunes

```typescript
// Click
await page.click('[data-testid="button"]');

// Fill input
await page.fill('[name="email"]', 'test@example.com');

// Check checkbox
await page.check('[name="agree"]');

// Select dropdown
await page.selectOption('[name="country"]', 'Argentina');

// Upload file
await page.setInputFiles('[name="file"]', 'path/to/file.pdf');

// Hover
await page.hover('[data-testid="menu"]');

// Keyboard
await page.keyboard.press('Enter');
await page.keyboard.type('Hello');

// Wait
await page.waitForSelector('[data-testid="result"]');
await page.waitForTimeout(1000); // 1 segundo
```

### Assertions Comunes

```typescript
// Elemento visible
await expect(page.locator('.modal')).toBeVisible();

// Elemento no visible
await expect(page.locator('.modal')).not.toBeVisible();

// Texto contiene
await expect(page.locator('h1')).toContainText('Bienvenido');

// Valor del input
await expect(page.locator('[name="email"]')).toHaveValue('test@example.com');

// Checkbox checked
await expect(page.locator('[name="agree"]')).toBeChecked();

// URL
await expect(page).toHaveURL('/admin/settings');

// Count
await expect(page.locator('.item')).toHaveCount(5);

// Attribute
await expect(page.locator('button')).toHaveAttribute('disabled', '');
```

---

## 🎯 EJEMPLO PRÁCTICO: ACHIEVEMENTS

### Test 1: Modal de Requirements Aparece

```typescript
test('muestra modal cuando faltan requirements', async ({ page }) => {
  // Login
  await page.goto('http://localhost:5173/login');
  await page.fill('[name="email"]', 'admin@test.com');
  await page.fill('[name="password"]', 'password');
  await page.click('button[type="submit"]');
  
  // Ir a Sales
  await page.goto('http://localhost:5173/admin/operations/sales');
  
  // Intentar toggle
  await page.click('[data-testid="toggle-takeaway-public"]');
  
  // Verificar modal aparece
  const modal = page.locator('[data-testid="requirements-modal"]');
  await expect(modal).toBeVisible();
  
  // Verificar tiene título correcto
  await expect(modal).toContainText('Configuración Requerida');
  
  // Verificar muestra 5 requirements
  await expect(modal.locator('[data-testid="requirement-item"]')).toHaveCount(5);
});
```

### Test 2: Redirección al Click

```typescript
test('redirige a settings al click en requirement', async ({ page }) => {
  await page.goto('http://localhost:5173/admin/operations/sales');
  await page.click('[data-testid="toggle-takeaway-public"]');
  
  // Click en requirement de dirección
  await page.click('[data-testid="requirement-takeaway_address"] button');
  
  // Verificar redirección
  await expect(page).toHaveURL('**/admin/settings/business**');
  
  // Verificar campo está enfocado
  await expect(page.locator('[name="address"]')).toBeFocused();
});
```

### Test 3: Progress Tracking

```typescript
test('muestra progreso al completar requirements', async ({ page }) => {
  // Login y ir a sales
  await page.goto('http://localhost:5173/admin/operations/sales');
  await page.click('[data-testid="toggle-takeaway-public"]');
  
  // Verificar 0/5
  await expect(page.locator('[data-testid="progress"]')).toContainText('0 / 5');
  
  // Cerrar modal
  await page.click('[data-testid="close-modal"]');
  
  // Completar business name
  await page.goto('http://localhost:5173/admin/settings/business');
  await page.fill('[name="businessName"]', 'Test Restaurant');
  await page.click('button[type="submit"]');
  
  // Volver a sales
  await page.goto('http://localhost:5173/admin/operations/sales');
  await page.click('[data-testid="toggle-takeaway-public"]');
  
  // Verificar 1/5
  await expect(page.locator('[data-testid="progress"]')).toContainText('1 / 5');
  
  // Verificar progress bar muestra 20%
  await expect(page.locator('[role="progressbar"]')).toHaveAttribute('aria-valuenow', '20');
});
```

---

## 🔧 TIPS Y BEST PRACTICES

### 1. Usar data-testid

```tsx
// ✅ Bueno - en tu componente React
<Button data-testid="toggle-public">Activar</Button>

// En el test
await page.click('[data-testid="toggle-public"]');
```

### 2. Auto-waiting

Playwright **espera automáticamente** que elementos estén visibles y clickeables:

```typescript
// ❌ No necesitas esto:
await page.waitForSelector('[data-testid="button"]');
await page.click('[data-testid="button"]');

// ✅ Playwright ya espera automáticamente:
await page.click('[data-testid="button"]');
```

### 3. Fixtures para Setup

```typescript
// tests/fixtures/auth.ts
export async function login(page: Page) {
  await page.goto('/login');
  await page.fill('[name="email"]', 'admin@test.com');
  await page.fill('[name="password"]', 'password');
  await page.click('button[type="submit"]');
  await page.waitForURL('**/admin/**');
}

// En tu test
import { login } from './fixtures/auth';

test('mi test', async ({ page }) => {
  await login(page);
  // ... resto del test
});
```

### 4. Page Object Pattern

```typescript
// pages/SalesPage.ts
export class SalesPage {
  constructor(private page: Page) {}
  
  async goto() {
    await this.page.goto('/admin/operations/sales');
  }
  
  async toggleTakeaway() {
    await this.page.click('[data-testid="toggle-takeaway-public"]');
  }
  
  async getRequirementsModal() {
    return this.page.locator('[data-testid="requirements-modal"]');
  }
}

// En tu test
const salesPage = new SalesPage(page);
await salesPage.goto();
await salesPage.toggleTakeaway();
await expect(salesPage.getRequirementsModal()).toBeVisible();
```

---

## 📊 DEBUG Y TROUBLESHOOTING

### Ver Tests en UI Mode

```bash
pnpm exec playwright test --ui
```

Esto abre una UI donde puedes:
- ▶️ Ejecutar tests paso a paso
- 🔍 Ver el DOM en cada paso
- 📸 Ver screenshots
- 🎥 Ver videos
- 🐛 Debug interactivo

### Inspector (Debug Mode)

```bash
pnpm exec playwright test --debug
```

Pausa en cada paso, permite:
- Ejecutar comandos manualmente
- Inspeccionar elementos
- Ver logs en tiempo real

### Screenshots y Videos

```typescript
// Screenshot manual
await page.screenshot({ path: 'screenshot.png' });

// Screenshot de elemento específico
await page.locator('.modal').screenshot({ path: 'modal.png' });

// Video se graba automáticamente en failures (configurado en playwright.config.ts)
```

### Ver Trace

Si un test falla, Playwright guarda un "trace" (grabación detallada):

```bash
pnpm exec playwright show-trace trace.zip
```

---

## 🎨 INTEGRATION CON CI/CD

### GitHub Actions

```yaml
# .github/workflows/e2e.yml
name: E2E Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18
      
      - name: Install dependencies
        run: pnpm install
      
      - name: Install Playwright
        run: pnpm exec playwright install --with-deps
      
      - name: Run E2E tests
        run: pnpm exec playwright test
      
      - name: Upload report
        if: always()
        uses: actions/upload-artifact@v3
        with:
          name: playwright-report
          path: playwright-report/
```

---

## 📚 RECURSOS

### Documentación Oficial
- **Playwright Docs:** https://playwright.dev
- **Best Practices:** https://playwright.dev/docs/best-practices
- **API Reference:** https://playwright.dev/docs/api/class-page

### Ejemplos
- **Playwright Examples:** https://github.com/microsoft/playwright/tree/main/examples
- **Real World App:** https://github.com/playwright-community/playwright-examples

### Videos
- **Playwright Tutorial:** https://www.youtube.com/watch?v=Xz6lhEzgI5I
- **Advanced Patterns:** https://www.youtube.com/watch?v=LM4yqrOzmFE

---

## ✅ PRÓXIMOS PASOS

1. **Instalar Playwright**
   ```bash
   pnpm add -D @playwright/test
   pnpm exec playwright install
   ```

2. **Agregar data-testid a componentes**
   ```tsx
   <Button data-testid="toggle-takeaway-public">Toggle</Button>
   <Modal data-testid="requirements-modal">...</Modal>
   ```

3. **Ejecutar primer test**
   ```bash
   pnpm exec playwright test tests/e2e/achievements-takeaway.spec.ts --headed
   ```

4. **Ver resultados**
   ```bash
   pnpm exec playwright show-report
   ```

---

**¿Necesitas ayuda?** Ejecuta `pnpm exec playwright --help` para ver todos los comandos disponibles.
