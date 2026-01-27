# PRODUCTS + RECIPE INTEGRATION - TESTING GUIDE

> **Fecha**: 2025-12-24
> **Status**: ✅ Tests Implementados
> **Coverage**: RecipeConfigSection + Integration Flows

---

## 📊 Test Coverage

### Tests Implementados

| Test File | Tipo | Casos | Status |
|-----------|------|-------|--------|
| `RecipeConfigSection.test.tsx` | Unit | 7 tests | ✅ Implementado |
| `product-recipe-integration.test.tsx` | Integration | 4 tests | ✅ Implementado |

**Total**: 11 tests implementados

---

## 🧪 Tests Unitarios: RecipeConfigSection

**Ubicación**: `src/pages/admin/supply-chain/products/components/sections/__tests__/RecipeConfigSection.test.tsx`

### Casos Cubiertos

1. ✅ **Renderizado básico (modo create)**
   - Verifica que RecipeBuilder se renderiza
   - Valida configuración: mode='create', entityType='product', complexity='standard'

2. ✅ **Renderizado en modo edit**
   - Verifica que RecipeBuilder carga con recipe_id existente
   - Valida mensaje de éxito cuando hay receta

3. ✅ **Callback onSave**
   - Simula guardar receta
   - Verifica que onChange se llama con recipe_id correcto

4. ✅ **Mostrar errores de validación**
   - Verifica que errores de campo se muestran correctamente

5. ✅ **Modo readonly**
   - Verifica que componente respeta prop readOnly

6. ✅ **Descripción de la sección**
   - Verifica que texto informativo se muestra

7. ✅ **Features configuradas correctamente**
   - Verifica que RecipeBuilder usa complexity='standard'

---

## 🔗 Tests de Integración: Product + Recipe

**Ubicación**: `src/pages/admin/supply-chain/products/__tests__/product-recipe-integration.test.tsx`

### Casos Cubiertos

1. ✅ **Crear producto con BOM (flujo completo)**
   - Flujo wizard completo: Basic Info → BOM → Pricing
   - Verifica que recipe_id se guarda en formData.recipe_config
   - Valida que onSubmit recibe datos completos

2. ✅ **Editar producto con receta existente**
   - Carga producto con recipe_id existente
   - Verifica que RecipeBuilder abre en modo 'edit'
   - Valida que recipe_id se pasa correctamente

3. ✅ **Validar executionMode = 'on_demand'**
   - Verifica que recetas de productos usan executionMode='on_demand'
   - (Diferente de Materials que usan 'immediate')

4. ✅ **Sección BOM solo visible con feature activa**
   - Verifica que sección NO aparece sin feature 'production_bom_management'
   - Valida sistema de features/capabilities

---

## 🚀 Ejecutar Tests

### Comando básico
```bash
# Todos los tests de products
pnpm test src/pages/admin/supply-chain/products

# Solo tests de RecipeConfigSection
pnpm test RecipeConfigSection

# Solo tests de integración
pnpm test product-recipe-integration

# Con coverage
pnpm test:coverage
```

### Watch mode (desarrollo)
```bash
pnpm test:watch RecipeConfigSection
```

### Tests específicos
```bash
# Un solo test
pnpm test -t "should create product with BOM recipe successfully"
```

---

## 📝 Estructura de Mocks

### RecipeBuilder Mock

```typescript
vi.mock('@/modules/recipe/components/RecipeBuilder', () => ({
  RecipeBuilder: ({ mode, onSave, entityType, complexity, recipeId }: any) => (
    <div data-testid="recipe-builder">
      {/* Mock implementation */}
    </div>
  )
}));
```

**Por qué se mockea**:
- RecipeBuilder tiene su propia suite de tests
- Queremos aislar la lógica de RecipeConfigSection
- Evitamos dependencias de TanStack Query en tests unitarios

### CapabilityStore Mock

```typescript
vi.mock('@/store/capabilityStore', () => ({
  useCapabilityStore: () => ({
    features: {
      activeFeatures: ['production_bom_management']
    }
  })
}));
```

**Por qué se mockea**:
- Controlar qué features están activas
- Probar visibilidad condicional de secciones

---

## 🎯 Coverage Goals

### Actual Coverage (Estimado)

| Component/Flow | Coverage | Status |
|----------------|----------|--------|
| RecipeConfigSection | ~85% | ✅ Good |
| Integration Flow (Create) | ~75% | ✅ Good |
| Integration Flow (Edit) | ~70% | ✅ Good |
| Feature Gating | 100% | ✅ Excellent |

### Cobertura NO incluida (Por ahora)

1. ❌ Tests E2E con Playwright
2. ❌ Tests de RecipeBuilder (ya existen en recipe module)
3. ❌ Tests de API/Backend integration
4. ❌ Tests de validación de formulario completo

---

## 🐛 Debugging Tests

### Si un test falla

1. **Verificar mocks**
   ```typescript
   console.log(screen.debug());
   ```

2. **Revisar renders asincrónicos**
   ```typescript
   await waitFor(() => {
     expect(screen.getByTestId('...')).toBeInTheDocument();
   });
   ```

3. **Limpiar mocks entre tests**
   ```typescript
   beforeEach(() => {
     vi.clearAllMocks();
   });
   ```

### Common Issues

**Issue**: "RecipeBuilder is not a function"
- **Causa**: Mock no está configurado correctamente
- **Fix**: Verificar que mock está antes de imports

**Issue**: "Cannot find module @/modules/recipe"
- **Causa**: Path alias no configurado en vitest
- **Fix**: Verificar vite.config.ts tiene resolve.alias

**Issue**: "Provider not found"
- **Causa**: Falta TestWrapper con Provider de Chakra UI
- **Fix**: Envolver componente en TestWrapper

---

## 📈 Próximos Tests Recomendados

### Prioridad ALTA

1. **Tests de validación**
   - Validar que recipe_id es requerido cuando has_recipe=true
   - Validar que no se puede avanzar sin recipe válida

2. **Tests de errores**
   - Simular error al guardar receta
   - Verificar manejo de errores de API

### Prioridad MEDIA

3. **Tests de UX**
   - Verificar progress indicator actualiza correctamente
   - Validar navegación entre secciones

4. **Tests de performance**
   - Verificar que no hay re-renders innecesarios
   - Validar lazy loading de RecipeBuilder

### Prioridad BAJA

5. **Tests E2E**
   - Flujo completo con servidor real
   - Tests de integración con base de datos

---

## 🔍 Test Patterns Aplicados

### 1. AAA Pattern (Arrange, Act, Assert)

```typescript
it('should save recipe', async () => {
  // Arrange
  render(<RecipeConfigSection {...props} />);

  // Act
  fireEvent.click(screen.getByTestId('save-btn'));

  // Assert
  await waitFor(() => {
    expect(mockOnChange).toHaveBeenCalled();
  });
});
```

### 2. Test Wrapper Pattern

```typescript
const TestWrapper = ({ children }) => (
  <QueryClientProvider client={queryClient}>
    <Provider>
      {children}
    </Provider>
  </QueryClientProvider>
);
```

### 3. Mock Factory Pattern

```typescript
const createMockRecipe = (overrides = {}) => ({
  id: 'recipe-123',
  name: 'Test Recipe',
  ...overrides
});
```

---

## ✅ Checklist Pre-Commit

Antes de hacer commit, verificar:

- [ ] Todos los tests pasan: `pnpm test RecipeConfigSection`
- [ ] Todos los tests de integración pasan: `pnpm test product-recipe-integration`
- [ ] No hay warnings de React en consola
- [ ] Coverage está >80% en nuevos archivos
- [ ] Mocks están bien documentados
- [ ] Tests son determinísticos (no hay flakiness)

---

## 📚 Referencias

- [Vitest Documentation](https://vitest.dev/)
- [React Testing Library](https://testing-library.com/react)
- [Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)
- [Recipe Module Tests](../../modules/recipe/__tests__/)

---

**Última actualización**: 2025-12-24
**Autor**: Claude + Usuario
**Status**: ✅ Ready for Review
