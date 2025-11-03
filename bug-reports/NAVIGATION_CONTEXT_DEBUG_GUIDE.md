# 🐛 Guía de Debugging: NavigationContext Re-renders

## 📊 Entendiendo React DevTools

### Image 2: Lista de Componentes con Contadores
```
chakra(div)         x41
MaterialsTable      x25
Stack2              x41
```

**¿Qué significa esto?**
- `x41` = El componente se ha renderizado **41 veces en total** desde que abriste DevTools
- **NO** significa que se está renderizando 41 veces por segundo
- Es un **contador acumulado** histórico

**¿Es malo?**
- ❌ Si los números aumentan sin parar = Re-renders infinitos (MUY MALO)
- ⚠️ Si aumentan solo al navegar/interactuar = Normal pero mejorable
- ✅ Si se quedan estables = Perfecto

### Image 1: Panel "Why Did You Render"

Cuando haces click en un componente, te muestra **por qué se renderizó la ÚLTIMA vez**:

| Columna | Significado |
|---------|-------------|
| **Changed Props** | Props que cambiaron desde el render anterior |
| **Changed State** | Estado interno (useState/useReducer) que cambió |
| **Changed Context** | Contextos (useContext) que cambiaron |

**Tu problema:**
```
Changed Context:
  NavigationContext
```

Esto significa que **NavigationContext está cambiando constantemente**, causando que todos los componentes hijos se re-rendericen.

---

## 🔍 Cómo Debuggear en el Navegador

### Paso 1: Abrir la Consola del Navegador

1. Abre `http://localhost:5173`
2. Presiona `F12` o `Ctrl+Shift+I`
3. Ve a la pestaña **Console**

### Paso 2: Habilitar Logging Detallado

Ya agregué logging automático. Verás mensajes como:

```
[DEBUG] NavigationContext: 🎯 Creating new contextValue object
[WARN] NavigationContext: ⚠️ Context dependencies changed: modules, breadcrumbs
[WARN] NavigationContext: 🔄 Provider re-rendered 15 times
```

### Paso 3: Identificar el Culpable

**Busca estos patrones:**

#### 🔴 PROBLEMA: Re-renders Infinitos
```
[WARN] NavigationContext: ⚠️ Context dependencies changed: modules
[DEBUG] NavigationContext: 🎯 Creating new contextValue object
[WARN] NavigationContext: ⚠️ Context dependencies changed: modules
[DEBUG] NavigationContext: 🎯 Creating new contextValue object
... (se repite constantemente)
```

**Solución:** El valor `modules` está cambiando de referencia cada vez.

#### ⚠️ PROBLEMA: Re-renders Frecuentes
```
[Usuario navega a /sales]
[WARN] NavigationContext: ⚠️ Context dependencies changed: currentModule, breadcrumbs
[DEBUG] NavigationContext: 🎯 Creating new contextValue object

[Usuario navega a /materials]
[WARN] NavigationContext: ⚠️ Context dependencies changed: currentModule, breadcrumbs
[DEBUG] NavigationContext: 🎯 Creating new contextValue object
```

**Esto es normal:** NavigationContext debe actualizarse al navegar.

#### ✅ NORMAL: Re-renders Solo al Interactuar
```
[Usuario carga la app]
[DEBUG] NavigationContext: 🎯 Creating new contextValue object

[10 segundos sin actividad - no hay logs]

[Usuario hace click en Sales]
[WARN] NavigationContext: ⚠️ Context dependencies changed: currentModule
[DEBUG] NavigationContext: 🎯 Creating new contextValue object
```

**Esto está bien:** Solo se actualiza cuando hay interacción.

---

## 🧪 Test de Diagnóstico

### Test 1: ¿Hay Re-renders Infinitos?

1. Recarga la página (`Ctrl+R`)
2. **NO TOQUES NADA** por 5 segundos
3. Observa la consola

**Resultado esperado:**
- ✅ 1-2 logs al cargar, luego silencio
- ❌ Logs apareciendo constantemente = PROBLEMA

### Test 2: ¿Qué Valor Está Cambiando?

1. Observa los logs
2. Busca el mensaje: `⚠️ Context dependencies changed: XXX`
3. Identifica qué valores aparecen más frecuentemente

**Valores sospechosos comunes:**

| Valor | ¿Por qué cambia? | ¿Es problema? |
|-------|------------------|---------------|
| `modules` | Array nuevo en cada render | ⚠️ MALO si es constante |
| `breadcrumbs` | Ruta actual | ✅ Normal al navegar |
| `currentModule` | Módulo activo | ✅ Normal al navegar |
| `navigationHistory` | Historial de navegación | ⚠️ MALO si no navegaste |
| `showBottomNav` | Media query cambió | ⚠️ MALO si no redimensionaste |

### Test 3: ¿Cuántas Veces Se Re-renderiza?

1. Recarga la página
2. Espera que cargue completamente
3. Busca en la consola: `🔄 Provider re-rendered X times`

**Resultado esperado:**
- ✅ 1-3 renders = Perfecto
- ⚠️ 4-10 renders = Mejorable
- ❌ >10 renders = PROBLEMA

---

## 🛠️ Soluciones Según el Problema

### Si `modules` cambia constantemente:

**Causa:** El array `modules` se está recreando cada vez.

**Solución aplicada:**
```typescript
// ✅ Ahora preservamos la referencia si el contenido no cambió
const prevModulesRef = React.useRef<NavigationModule[]>([]);

const modules = useMemo(() => {
  const newModules = /* ... */;

  // Solo retorna nueva referencia si hay cambios reales
  if (hasChanges) {
    prevModulesRef.current = newModules;
    return newModules;
  }

  return prevModulesRef.current; // ✅ Misma referencia
}, [accessibleModules, moduleState]);
```

### Si `breadcrumbs` cambia sin navegar:

**Causa:** El efecto que calcula breadcrumbs se ejecuta demasiado.

**Verifica:** `location.pathname` en el useEffect (línea 483).

### Si `showBottomNav` cambia sin redimensionar:

**Causa:** Media queries no debounced.

**Solución aplicada:**
```typescript
// ✅ Debounce de 100ms
const [debouncedIsMobile, setDebouncedIsMobile] = useState(isMobile);

useEffect(() => {
  const timeout = setTimeout(() => {
    setDebouncedIsMobile(isMobile);
  }, 100);
  return () => clearTimeout(timeout);
}, [isMobile]);
```

---

## 📸 Cómo Usar React DevTools Profiler

### Paso 1: Abrir Profiler

1. Abre React DevTools (icono React en F12)
2. Ve a la pestaña **Profiler**
3. Click en el círculo azul para **Start Recording**

### Paso 2: Reproducir el Problema

1. Navega a `/admin/supply-chain/materials`
2. Espera 3 segundos sin tocar nada
3. Click en **Stop Recording** (círculo rojo)

### Paso 3: Analizar el Flamegraph

Verás barras de colores:
- 🟩 **Verde claro**: Render rápido (< 5ms) - OK
- 🟨 **Amarillo**: Render lento (5-50ms) - Mejorable
- 🟥 **Rojo**: Render muy lento (>50ms) - PROBLEMA

**Busca barras que aparezcan múltiples veces seguidas sin interacción del usuario.**

---

## 📝 Reporte de Resultados

Copia esto y llénalo con lo que veas:

```
### Test 1: Re-renders Infinitos
- [ ] ✅ Solo 1-2 logs al cargar
- [ ] ❌ Logs constantes sin parar

### Test 2: Valor que Cambia
Valores que aparecen en los logs:
- modules: [ ] Sí [ ] No [ ] A veces
- breadcrumbs: [ ] Sí [ ] No [ ] A veces
- navigationHistory: [ ] Sí [ ] No [ ] A veces
- Otro: ___________

### Test 3: Cantidad de Re-renders
Número en "Provider re-rendered X times": _____

### Logs de Ejemplo
Copia 5-10 líneas de los logs aquí:
```

---

## 🎯 Próximos Pasos

1. **Ejecuta los 3 tests** y reporta los resultados
2. Basándome en los resultados, te diré exactamente qué optimizar
3. Aplicamos la solución específica
4. Verificamos con Profiler que funcionó

¿Estás listo para ejecutar los tests?
