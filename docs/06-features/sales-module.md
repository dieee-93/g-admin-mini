# SALES MODULE - TECHNICAL IMPLEMENTATION SPECIFICATION v3.0

## 🚀 PROMPT PARA NUEVA SESIÓN:
```
Hola! Necesito que implementes el módulo Sales de G-Admin Mini siguiendo exactamente esta especificación técnica. 

CONTEXTO CRÍTICO:
- Esta especificación fue creada después de un análisis coordinado completo con agentes especializados (Explorador, Criterio, Arquitecto, Coordinador)
- Todas las decisiones arquitecturales fueron validadas con casos de mercado (Toast POS, Square, ChowNow)
- El sistema ya tiene módulos avanzados funcionando: Customers (Enterprise CRM + RFM), Kitchen Display System, Fiscal (AFIP), Operations
- EventBus enterprise ya implementado con 111+ eventos predefinidos

INSTRUCCIONES:
1. Implementar exactamente según las FASES definidas en este documento
2. NO modificar decisiones arquitecturales ya tomadas
3. Usar EventBus para ALL cross-module communication
4. Aprovechar módulos existentes (NO recrear funcionalidad)
5. Seguir design system v2.0 patterns
6. Testing después de cada fase

COMENZAR CON: Fase 0 - Event-Driven Connections (1 semana)
```

---

# 📋 SALES MODULE IMPLEMENTATION SPECIFICATION

## 🎯 EXECUTIVE SUMMARY

**OBJETIVO:** Implementar módulo Sales multi-canal event-driven que conecte con todos los módulos existentes del sistema.

**TIMELINE:** 5-6 semanas total  
**ARQUITECTURA:** Event-driven multi-channel sales hub  
**PRIORIDAD:** CRÍTICA (74/100 score) - Sin ventas no hay negocio

---

## 🔍 ANÁLISIS SITUACIONAL

### ESTADO ACTUAL CONFIRMADO:
- ✅ **UI Sales** existe (design system v2.0 compliant)
- ✅ **salesStore** Zustand implementado con lógica básica
- ❌ **Backend** completamente hardcodeado/mockdata
- ❌ **Cross-module integration** no implementada
- ❌ **EventBus adoption** sub-utilizada (solo 5 archivos usan EventBus)

### MÓDULOS EXISTENTES CONFIRMADOS:
- ✅ **Customers**: Enterprise CRM + RFM Analytics (90% completo)
- ✅ **Kitchen Display System**: Dual implementation (Sales + Operations)
- ✅ **Fiscal**: AFIP compliance + tax calculation services
- ✅ **Operations**: Multi-dashboard con offline capabilities
- ✅ **EventBus**: Enterprise system (111+ eventos, correlation IDs, middleware)

---

## 🏗️ ARQUITECTURA CONFIRMADA

### MULTI-CHANNEL SALES HUB
Sales module es el punto central para TODAS las ventas:

```typescript
// VALIDATED ARCHITECTURE - Toast/Square pattern
enum OrderEntryType {
  MANUAL = 'manual',      // Staff-operated POS
  SELF = 'self',          // Customer self-service
  API = 'api'             // External system integration
}

// CHANNEL MAPPING VALIDATED
const CHANNEL_CONFIG = {
  manual: {
    interface: 'unified_pos_terminal',
    channels: ['mostrador', 'telefono', 'whatsapp', 'facebook'],
    workflow: 'staff_assisted_checkout'
  },
  self: {
    interface: 'customer_menu_display', 
    channels: ['qr_mesa'],
    workflow: 'table_service'
  },
  api: {
    interface: 'webhook_integration',
    channels: ['rappi', 'pedidosya', 'online_store'],
    workflow: 'automated_fulfillment'
  }
}
```

### EVENT-DRIVEN INTEGRATION
```typescript
// CORE EVENT FLOW CONFIRMED
SALE_COMPLETED → [
  KITCHEN_ORDER_CREATED,    // → KitchenDisplaySystem
  CUSTOMER_RFM_UPDATED,     // → Customer Analytics
  INVOICE_GENERATED,        // → Fiscal/AFIP
  INVENTORY_DECREMENTED     // → Materials Store
]
```

---

## 📋 IMPLEMENTATION PHASES

### FASE 0: EVENT-DRIVEN CONNECTIONS (1 semana)

#### OBJETIVO: Migrar salesStore a EventBus pattern y conectar módulos existentes

#### TAREAS CRÍTICAS:
1. **Migrar salesStore completamente a EventBus**
   ```typescript
   // BEFORE: Direct store calls
   completeSale() {
     this.updateKitchenOrders();
     this.updateCustomerStats();
   }
   
   // AFTER: Event emission
   completeSale: async (saleData) => {
     const sale = await createSale(saleData);
     await EventBus.emit(eventos tipados.SALE_COMPLETED, {
       saleId: sale.id,
       customerId: sale.customer_id,
       items: sale.items,
       totalAmount: sale.total
     }, 'SalesStore');
   }
   ```

2. **Implementar Event Listeners cross-module**
   ```typescript
   // Auto-integration con módulos existentes
   EventBus.on(eventos tipados.SALE_COMPLETED, async (event) => {
     // Kitchen Display System integration
     kitchenDisplayStore.addOrder({
       orderId: event.payload.saleId,
       items: event.payload.items.map(item => ({
         ...item,
         station: getKitchenStation(item.productId),
         status: KitchenItemStatus.PENDING
       }))
     });
     
     // Customer RFM Analytics integration
     if (event.payload.customerId) {
       await customerApi.updateRFMAfterSale(
         event.payload.customerId,
         event.payload
       );
     }
     
     // Fiscal AFIP integration
     await fiscalApi.generateInvoice({
       saleId: event.payload.saleId,
       customerId: event.payload.customerId,
       items: event.payload.items
     });
   });
   ```

3. **Implementar correlation IDs para workflows**
   ```typescript
   // Complete workflow tracking
   const checkoutCorrelationId = 'checkout_' + Date.now();
   const scopedEventBus = EventBus.createScope(checkoutCorrelationId);
   
   // Sequence: SALE_STARTED → PAYMENT_PROCESSING → SALE_COMPLETED
   ```

4. **Customer Intelligence Integration**
   ```typescript
   // Aprovechar RFM data del módulo Customers existente
   const customerLookup = async (customerId) => {
     const customer = await customerApi.fetchCustomer(customerId);
     
     // Apply business rules basado en RFM segment
     if (customer.rfm_profile?.segment === 'CHAMPIONS') {
       applyVIPDiscount(0.05); // 5% automático
       prioritizeKitchenOrder(); // Priority en cocina
     }
   };
   ```

#### ENTREGABLES FASE 0:
- [ ] salesStore 100% event-driven (no direct calls)
- [ ] Event listeners configurados para Kitchen/Customer/Fiscal
- [ ] Correlation ID tracking implementado
- [ ] Customer RFM integration funcional
- [ ] Testing completo de event flows

---

### FASE 1: POS TERMINAL + QR ORDERING (2 semanas)

#### OBJETIVO: Terminal POS funcional con backend real + QR table ordering

#### 1.1 BACKEND REAL IMPLEMENTATION
```typescript
// Supabase integration con event triggers
const createSale = async (saleData: CreateSaleData) => {
  // 1. Validate customer (if provided) using existing Customer API
  if (saleData.customerId) {
    const customer = await customerApi.fetchCustomer(saleData.customerId);
    // Apply VIP logic if customer is Champions/VIP
  }
  
  // 2. Validate stock using existing Materials API
  const stockValidation = await materialsApi.validateStock(saleData.items);
  if (!stockValidation.valid) throw new Error('Stock insuficiente');
  
  // 3. Calculate taxes using existing Fiscal API
  const taxes = await fiscalApi.calculateTaxes(saleData.items);
  
  // 4. Create sale in Supabase
  const sale = await supabaseApi.sales.create({
    ...saleData,
    taxes,
    total: saleData.subtotal + taxes,
    status: 'confirmed'
  });
  
  // 5. Emit events for automatic integrations
  await EventBus.emit(eventos tipados.SALE_COMPLETED, {
    saleId: sale.id,
    customerId: sale.customer_id,
    items: sale.items,
    totalAmount: sale.total,
    channel: saleData.channel
  });
  
  return sale;
};
```

#### 1.2 UNIFIED POS TERMINAL
```typescript
// Una interfaz para todos los canales manuales
interface UnifiedPOSProps {
  channel: 'mostrador' | 'telefono' | 'whatsapp' | 'facebook';
}

// Workflow idéntico independiente del canal
const POSWorkflow = {
  1: customerLookup(),      // Optional customer selection
  2: productSelection(),    // Add items to cart
  3: modifiers(),          // Special instructions, modifications  
  4: paymentProcessing(),  // Process payment
  5: kitchenDispatch()     // Auto-send to kitchen via events
};
```

#### 1.3 QR TABLE ORDERING
```typescript
// Aprovechar componentes QR existentes
// QROrderPage.tsx y QRCodeGenerator.tsx ya implementados
// Solo conectar con EventBus pattern

EventBus.on(eventos tipados.QR_ORDER_PLACED, async (event) => {
  // Same workflow as POS but different source
  await createSale({
    ...event.payload,
    channel: 'qr_mesa',
    entry_type: 'self'
  });
});
```

#### ENTREGABLES FASE 1:
- [ ] Terminal POS funcional con backend Supabase
- [ ] Customer lookup integration (RFM data utilizada)
- [ ] QR ordering conectado a workflow principal
- [ ] Stock validation real-time
- [ ] Payment processing funcional
- [ ] Kitchen orders auto-created via events

---

### FASE 2: REAL-TIME KITCHEN-SALES SYNC (1 semana)

#### OBJETIVO: Bidirectional sync entre Sales y Kitchen Display System

#### 2.1 KITCHEN → SALES STATUS UPDATES
```typescript
// Kitchen staff updates order status → Sales reflects in real-time
EventBus.on(eventos tipados.KITCHEN_ITEM_READY, (event) => {
  // Auto-update sale kitchen status
  salesStore.updateKitchenStatus(event.payload.orderId, 'ready');
  
  // Customer notification (if QR/online order)
  if (event.payload.customerNotification) {
    notificationService.notifyCustomer(event.payload.customerId, {
      message: 'Tu pedido está listo',
      orderId: event.payload.orderId
    });
  }
});
```

#### 2.2 REAL-TIME DASHBOARD INTEGRATION
```typescript
// Sales dashboard shows kitchen status real-time
const SalesDashboard = () => {
  const { sales } = useSalesStore();
  const { kitchenOrders } = useKitchenStore();
  
  // Real-time mapping
  const salesWithKitchenStatus = sales.map(sale => ({
    ...sale,
    kitchenStatus: kitchenOrders.find(o => o.saleId === sale.id)?.status
  }));
};
```

#### ENTREGABLES FASE 2:
- [ ] Bidirectional Kitchen ↔ Sales sync
- [ ] Real-time order status updates
- [ ] Customer notifications (QR orders)
- [ ] Dashboard con kitchen status real-time

---

### FASE 3: DELIVERY APPS + ADVANCED FEATURES (1-2 semanas)

#### OBJETIVO: Delivery apps integration + advanced customer experience

#### 3.1 DELIVERY APPS INTEGRATION
```typescript
// Webhook endpoints para delivery apps
app.post('/webhook/rappi', async (req, res) => {
  const rappiOrder = parseRappiOrder(req.body);
  
  await createSale({
    ...rappiOrder,
    channel: 'rappi',
    entry_type: 'api',
    commission: 0.25 // 25% Rappi commission
  });
  
  res.json({ status: 'accepted' });
});
```

#### 3.2 FISCAL COMPLIANCE AUTOMÁTICO
```typescript
// AFIP integration using existing fiscal services
EventBus.on(eventos tipados.SALE_COMPLETED, async (event) => {
  // Auto-generate invoice
  const invoice = await fiscalApi.generateInvoice({
    saleId: event.payload.saleId,
    items: event.payload.items,
    requiresCAE: true // Argentina AFIP compliance
  });
  
  // Auto-request CAE from AFIP
  await fiscalApi.requestCAE(invoice.id);
});
```

#### 3.3 CUSTOMER EXPERIENCE AUTOMATION
```typescript
// Basado en RFM analytics del módulo Customers
EventBus.on(eventos tipados.CUSTOMER_RFM_UPDATED, async (event) => {
  const { customerId, newSegment, churnRisk } = event.payload;
  
  if (churnRisk === 'HIGH') {
    // Auto-trigger retention campaign
    EventBus.emit(eventos tipados.RETENTION_CAMPAIGN_TRIGGERED, {
      customerId,
      offerType: 'comeback_discount',
      discountPercentage: 15
    });
  }
});
```

#### ENTREGABLES FASE 3:
- [ ] Rappi/PedidosYa webhook integration
- [ ] AFIP compliance automático
- [ ] Customer retention automation
- [ ] Advanced analytics dashboard

---

## 🎯 DECISIONES TÉCNICAS CRÍTICAS

### ❌ NO HACER:
- **NO extraer customer management** de Sales (no existe duplicación)
- **NO crear Zustand stores nuevos** (ya existen stores centralizados)
- **NO implementar event orchestration manual** (EventBus lo maneja)
- **NO usar imports directos de @chakra-ui/react** (usar design system)
- **NO crear componentes desde cero** (aprovechar componentes existentes)

### ✅ SÍ HACER:
- **SÍ usar EventBus para TODO** communication cross-module
- **SÍ aprovechar CRM enterprise existente** (Customer module)
- **SÍ usar KitchenDisplaySystem existente** (Sales + Operations)
- **SÍ aprovechar fiscal services existentes** (AFIP integration)
- **SÍ implementar correlation IDs** para workflow tracking

---

## 📊 TESTING STRATEGY

### FASE 0 TESTING:
```typescript
describe('Event-driven Sales Integration', () => {
  test('SALE_COMPLETED triggers all downstream events', async () => {
    const mockSale = createMockSale();
    await salesStore.completeSale(mockSale);
    
    expect(EventBus.emit).toHaveBeenCalledWith(
      eventos tipados.SALE_COMPLETED,
      expect.objectContaining({
        saleId: mockSale.id,
        customerId: mockSale.customer_id
      })
    );
  });
});
```

---

## 🎯 SUCCESS CRITERIA

### TECHNICAL KPIs:
- [ ] 100% event-driven architecture (no direct store calls)
- [ ] Customer RFM data integrated in sales logic  
- [ ] EventBus correlation tracking functional
- [ ] All existing modules connected via events

### BUSINESS KPIs:
- [ ] Multi-channel orders unified (POS + QR + delivery)
- [ ] Kitchen orders created automatically
- [ ] Customer analytics updated real-time
- [ ] Fiscal compliance automated (AFIP)

---

## 🚨 IMPORTANT REMINDERS

### CONTEXT FROM COORDINATION SESSION:
- Esta spec fue creada después de análisis con agentes especializados
- Arquitectura validada con casos Toast POS/Square
- EventBus enterprise YA existe (111+ eventos predefinidos)  
- Módulos Customers/Kitchen/Fiscal YA están 80-90% implementados
- Design system v2.0 patterns deben seguirse estrictamente

### ARCHITECTURE PRINCIPLES:
- **Event-driven first** - All cross-module communication via EventBus
- **Leverage existing** - Don't recreate what already exists
- **Multi-channel unified** - One system, multiple entry points
- **Customer intelligence** - Use RFM data for business logic

---

**READY FOR IMPLEMENTATION** 🚀

*Última actualización: Basada en coordinación completa agentes especializados + validación casos mercado*