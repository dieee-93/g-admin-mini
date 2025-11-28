# PAYMENTS STORE - QUICK START GUIDE

## 📦 Importar el Store

```typescript
import { usePaymentsStore, usePaymentMethods, usePaymentGateways } from '@/store/paymentsStore';
```

## 🎯 Uso Básico

### 1. Agregar Payment Method

```typescript
function AddPaymentMethodButton() {
  const addPaymentMethod = usePaymentsStore((state) => state.addPaymentMethod);
  
  const handleAdd = () => {
    addPaymentMethod({
      id: crypto.randomUUID(),
      name: 'Efectivo',
      is_active: true,
      type: 'cash'
    });
  };
  
  return <Button onClick={handleAdd}>Agregar Método</Button>;
}
```

### 2. Listar Payment Methods Activos

```typescript
function PaymentMethodsList() {
  // Opción 1: Selector optimizado
  const activeMethods = useActivePaymentMethods();
  
  // Opción 2: Usar computed getter
  const getActiveMethods = usePaymentsStore((state) => state.getActiveMethods);
  const methods = getActiveMethods();
  
  return (
    <ul>
      {activeMethods.map(method => (
        <li key={method.id}>{method.name}</li>
      ))}
    </ul>
  );
}
```

### 3. Agregar Payment Gateway

```typescript
function AddGatewayButton() {
  const addPaymentGateway = usePaymentsStore((state) => state.addPaymentGateway);
  
  const handleAdd = () => {
    addPaymentGateway({
      id: 'mercadopago-1',
      type: 'online',
      name: 'MercadoPago',
      is_active: true,
      supports_subscriptions: true
    });
  };
  
  return <Button onClick={handleAdd}>Integrar MercadoPago</Button>;
}
```

### 4. Toggle Payment Method

```typescript
function PaymentMethodToggle({ methodId }: { methodId: string }) {
  const togglePaymentMethod = usePaymentsStore((state) => state.togglePaymentMethod);
  
  return (
    <Switch 
      onChange={(checked) => togglePaymentMethod(methodId, checked)}
    />
  );
}
```

### 5. Ver Stats

```typescript
function PaymentsStats() {
  const stats = usePaymentsStats();
  
  return (
    <div>
      <p>Métodos activos: {stats.activeMethods}</p>
      <p>Gateways online: {stats.onlineGateways}</p>
      <p>Soportan suscripciones: {stats.subscriptionCapable}</p>
    </div>
  );
}
```

## 🎨 Selectores Optimizados

Para prevenir re-renders innecesarios, usa selectores específicos:

```typescript
// ✅ BUENO: Solo se re-renderiza cuando cambian los payment methods
const methods = usePaymentMethods();

// ✅ MEJOR: Solo métodos activos
const activeMethods = useActivePaymentMethods();

// ✅ MEJOR: Solo gateways online
const onlineGateways = useOnlinePaymentGateways();

// ⚠️ USAR CON CUIDADO: Acceso completo al store
const store = usePayments();
```

## 🔄 Integración con ValidationContext

El store está automáticamente integrado en `useValidationContext`:

```typescript
function MyComponent() {
  const context = useValidationContext();
  
  // context.paymentMethods viene del store
  console.log('Métodos configurados:', context.paymentMethods.length);
  
  // context.paymentGateways viene del store
  console.log('Gateways activos:', context.paymentGateways.filter(g => g.is_active).length);
}
```

## 📊 Datos de Ejemplo

```typescript
// Payment Methods
const methods = [
  { id: '1', name: 'Efectivo', is_active: true, type: 'cash' },
  { id: '2', name: 'Tarjeta de Débito', is_active: true, type: 'card' },
  { id: '3', name: 'Transferencia', is_active: true, type: 'transfer' },
];

// Payment Gateways
const gateways = [
  { 
    id: 'mp-1', 
    type: 'online', 
    name: 'MercadoPago', 
    is_active: true, 
    supports_subscriptions: true 
  },
  { 
    id: 'modo-1', 
    type: 'online', 
    name: 'MODO', 
    is_active: true, 
    supports_subscriptions: false 
  },
  { 
    id: 'pos-1', 
    type: 'pos', 
    name: 'Terminal POS', 
    is_active: false 
  },
];
```

## 🧪 Testing

```typescript
import { renderHook, act } from '@testing-library/react';
import { usePaymentsStore } from '@/store/paymentsStore';

test('should add payment method', () => {
  const { result } = renderHook(() => usePaymentsStore());
  
  act(() => {
    result.current.addPaymentMethod({
      id: 'test-1',
      name: 'Test Method',
      is_active: true,
      type: 'cash'
    });
  });
  
  expect(result.current.paymentMethods).toHaveLength(1);
  expect(result.current.stats.activeMethods).toBe(1);
});
```

## 🔗 Próximos Pasos

1. **Crear API Backend:**
   - `src/services/paymentMethodsApi.ts`
   - `src/services/paymentGatewaysApi.ts`

2. **Crear Tablas Supabase:**
   - `payment_methods` table
   - `payment_gateways` table

3. **Componentes UI:**
   - Form para agregar/editar payment methods
   - Form para configurar gateways (MercadoPago, MODO)
   - Settings page para gestionar pagos

## 📚 Referencias

- **Implementación:** `src/store/paymentsStore.ts`
- **Integración:** `src/hooks/useValidationContext.ts`
- **Requirements:** `src/modules/achievements/constants.ts`
- **Documentación:** `FASE_2.1_PAYMENTS_STORE_COMPLETE.md`
