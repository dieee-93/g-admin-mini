# 📋 MILESTONE REQUIREMENTS QUESTIONNAIRE

**Objetivo**: Definir qué configuraciones son CRITICAL (bloquean operación) vs REQUIRED (recomendadas) vs OPTIONAL (mejoras) para cada feature del sistema.

**Criterio de decisión**:
- **CRITICAL**: Sin esto, NO puedo hacer ni UNA operación
- **REQUIRED**: Funciona, pero falta organización/profesionalismo
- **OPTIONAL**: Mejora que no bloquea nada (va a achievements)

---

## 🎯 ROUND 1: Features de PRODUCTOS

### **Feature: `product_catalog`**

**Escenario**: Usuario elige "sells_products" en BusinessModel

#### Pregunta 1.1: Pricing
```
¿Un producto PUEDE existir sin precio?
(ej: precio $0, TBD, "Consultar")

Respuesta: _______________
```

#### Pregunta 1.2: Flujo de creación
```
¿Cómo funciona crear un producto en tu sistema?

A) Crear producto ya incluye precio obligatorio en el mismo formulario
   → Solo milestone: `create_first_product`

B) Puedo crear producto sin precio y completarlo después
   → 2 milestones: `create_first_product` + `configure_pricing`
   

Respuesta:  Este deberia ser el flujo correcto, de hecho el precio se llena automaticamente en base al costo de sus materiales sumado al porcentaje de ganancia, aun no decidi como manejar esta logica y no investigue como lo hacen pero quiza seria bueno usar la formula de (costo materiales * algun numero modificable que represente un multiplicador o porcentaje que indique la ganancia, lo normal),pero si bien podriamos flexibilizar el tema de fijar el precio lo que si creo que no deberia existir es que un articulo pueda puiblicarse sin precio dado que no tiene sentido(cuanto lo va apagar el usuario ?, con que precio va a aprecer en la tienda online ?```

#### Pregunta 1.3: Categorías
```
¿Con 2-3 productos, es OBLIGATORIO tener categorías?

A) SÍ, debo crear al menos 1 categoría → CRITICAL
B) NO, funciona sin categorías (desorganizado) → REQUIRED
C) NO, categorías son solo para 10+ productos → OPTIONAL

Respuesta: No, no deberia ser obligatorio, mas bien seria required u optional
```

---

### **Feature: `inventory_tracking`**

**Escenario**: Usuario elige "sells_products" (activa inventory automáticamente)

#### Pregunta 1.4: ¿Qué significa "configurar inventory tracking"?
```
Marca todas las que apliquen:

□ A) Solo activar un toggle ON/OFF
□ B) Configurar unidades de medida (kg, litros, unidades)
□ C) Configurar alertas de stock mínimo
□ D) Hacer primer conteo de inventario
□ E) Definir proveedores
X F) Otro: No lo se, podria no tener sentido o ser muy amplio en realidad, justamente estas cosas quiero editar o poner a juicio, pero definitivamente presenta un gran problema de ambiguead, al punto que ninguno puede inferir que es lo que significa configure inventory_tracking

De las que marcaste, ¿cuáles son OBLIGATORIAS para operar?
Respuesta: _______________
```

---

## 🎯 ROUND 2: Features de ONSITE (Consumo en Local)

### **Feature: `table_management`**

**Escenario**: Usuario elige "sells_products_onsite" (restaurant/café)

#### Pregunta 2.1: Dining Areas
```
Usuario tiene 3 mesas configuradas.
¿Es OBLIGATORIO crear áreas (salón, terraza)?

A) SÍ, debe tener al menos 1 área (aunque sea "General") → CRITICAL
B) NO, funciona sin áreas (todas en "Sin área") → REQUIRED
C) NO, áreas son solo para 10+ mesas → OPTIONAL

Respuesta: Si, aunque sea general o algo random, pero me gustaria para acostumbrar al usuario a la organizacion y demas
```

---

### **Feature: `kitchen_display`**

**Escenario**: Usuario elige "sells_products_onsite"

#### Pregunta 2.2: Kitchen Display
```
¿Un restaurant PUEDE operar sin kitchen display?

A) NO, kitchen display es OBLIGATORIO para operar digitalmente → CRITICAL
B) SÍ, pueden usar tickets en papel → OPTIONAL (solo achievement)
C) SÍ, pero es muy recomendado → REQUIRED

Respuesta: Podria ser optional, pero aca es otra vez confuso no entiendo porque lo que planteas es una feature y no un logro, osea el usuario podria operar con papel, o no, entiendo que kitchen display es solo para mostrar ordenes a preparar a la gente de la cocina verdad ? si ese es el caso no entiendo cual seria la configuracion obligatoria, seria mas bien algo que viene agregado, en otras palabras por mas que Kitchen display sea obligatorio y critical, asi planteado como lo planteas vos no me termina de quedar en claro cual es el logro o configuracion obligatoria.
Igualmente aca quiero hacer un parentensis porque la arquitectura nuestro sistema presenta una ambiguedad que no termina de quedar en claro. Quiza deberiamos diferenciar las funciones o pensar otra solucion pero definitivamente hay que tomar cartas en el asunto, explicando el problema con pocas palabras, hay locales que venden cosas para consumir y nisiquiera producen lo que venden, etc, o hay locales que ofreceran retiro en tienda pero no necesariamente ejerceran actividad gastronomica, podria ser simplemente ofrecer servicio de retiro de otro tipo de mercaderia que venda
```

#### Pregunta 2.3: Kitchen Stations
```
Si kitchen_display es obligatorio:
¿Debe configurar estaciones (Parrilla, Ensaladas, Postres)?

A) SÍ, al menos 1 estación → CRITICAL
B) NO, funciona con 1 estación default "Cocina General" → REQUIRED
C) NO, estaciones son para optimización → OPTIONAL

Respuesta: Si, si el usuario indica que cocina o el negocio tiene requisitos gastronomicos estaria bueno obligar al usuario a uysar todas las herramietnas que mejoren la experiencia de usuario, al menos una estacion o algo como bien decis, si no entiendo que habra gaps entre los flujos de informacion y de operacion
```

---

## 🎯 ROUND 3: Features de PICKUP

### **Feature: `pickup_management`**

**Escenario**: Usuario elige "sells_products_pickup"

#### Pregunta 3.1: Pickup Hours (CONFIRMACIÓN)
```
Usuario tiene operating_hours: Lunes-Viernes 9-18hs ✅

¿Puede ofrecer pickup sin configurar horarios ESPECÍFICOS de retiro?

A) SÍ, usa operating_hours → pickup_hours es OPTIONAL
B) NO, debe definir ventanas de retiro (ej: cada 30min) → pickup_hours es CRITICAL

Respuesta: Si, la opcion esa es una bunea solucion, si el usuario no especifica un hoirario de retiro el sistema podria usar su horario de atencion u operativo lo que si es importante es que no pueda operar sin horarios
```

#### Pregunta 3.2: Configuraciones adicionales de Pickup
```
¿Qué otras configuraciones necesita pickup?

Marca las OBLIGATORIAS:
X A) Confirmar pedidos manualmente antes de preparar
X B) Tiempo de preparación estimado
□ C) Ubicación específica de retiro (mostrador, ventanilla)
□ D) Ninguna, con horarios alcanza

Respuesta: _______________
```

---

## 🎯 ROUND 4: Features de STAFF & SCHEDULING

### **Feature: `staff_management`**

**Escenario**: Es CORE (siempre activa)

#### Pregunta 4.1: Empleados
```
¿Un negocio PUEDE operar sin registrar ni un empleado?

A) SÍ, solo el dueño sin registrar empleados → NO milestones
B) NO, debe registrar al menos 1 persona (el dueño) → Milestone CRITICAL

Respuesta: Si, incluso si es un emprendimiento de 1 sola persona y el dueño haga todo se asignara y considerara como unico empleado pero debe ser obligatorio setear empleados, igual que como funciona un negocio real, sin personas fisicas que se encarguen de las cosas realmente creo que ningun negocio funciona
```

---

### **Feature: `service_calendar` (Scheduling)**

**Escenario**: Es CORE (siempre activa)

#### Pregunta 4.2: Horarios de trabajo
```
¿Un negocio PUEDE operar sin crear horarios de trabajo/turnos?

A) SÍ, solo registra empleados sin turnos → NO milestones
B) NO, debe crear turnos para operar → Milestone CRITICAL

Respuesta: No, podriamos pensar alguna felxibilidad segun el tipo de negocio o considerar algun edge case que se me escape, pero en principio el mismo criterio de arriba, los negocios funcionan con un horario operativo, es importante para asignar personal a cada turno, controlar los cierres o cambios de turnos, salidas de personal y demas cosas, asi que en este caso si. la mayoria de los negocios creo que deberia considerarse ccritical
```

---

## 🎯 ROUND 5: Features de APPOINTMENTS (Servicios con Cita)

### **Feature: `appointment_booking`**

**Escenario**: Usuario elige "sells_services_appointment" (peluquería, consultorios)

Ya existen validaciones:
- ✅ `service_types_required` (qué servicios ofrece)
- ✅ `available_hours_required` (cuándo atiende)

#### Pregunta 5.1: Configuraciones adicionales
```
¿Qué más debe configurar para appointment booking?

Marca las OBLIGATORIAS:
X A) Duración de cada servicio
X B) Precio de cada servicio
□ C) Capacidad simultánea (¿cuántas citas en paralelo?)
□ D) Nada más, con service_types + hours alcanza

Respuesta: _______________
```

---

## 🎯 ROUND 6: Features de B2B

### **Feature: `corporate_accounts`**

**Escenario**: Usuario elige "is_b2b_focused"

Ya existe validación:
- ✅ `business_license_required`

#### Pregunta 6.1: Configuraciones B2B
```
¿Qué configuraciones adicionales DEBE hacer para operar B2B?

Marca las OBLIGATORIAS:
X A) Configurar términos de pago (30/60/90 días)
X B) Definir descuentos por volumen
X C) Crear tipos de cuenta corporativa
X D) Configurar límites de crédito
□ E) Nada, con business_license alcanza

Respuesta: _______________
```

---

## 🎯 ROUND 7: Features de MULTI-LOCATION

### **Feature: `multi_location_analytics`**

**Escenario**: Usuario elige "multi_location"

Ya existen validaciones:
- ✅ `primary_location_required`
- ✅ `additional_locations_required` (al menos 1)

#### Pregunta 7.1: Cantidad mínima de locales
```
¿Cuántos locales MÍNIMO debe tener configurados?

A) 2 locales (primary + 1 adicional)
B) 3+ locales para que analytics tenga sentido
C) Solo validar que tenga primary, adicionales pueden ser 0

Respuesta: La opcion mas adecuada creo que seria A, pero bueno obligatoriamente deberia ser solo configurar el primer local, si no configura el segundo y demas cosas no cumple la condicion de multilocales al 100% y no llena la barra de progreso
```

---

## 🎯 ROUND 8: Features de MOBILE BUSINESS

### **Feature: `mobile_pos`**

**Escenario**: Usuario elige "mobile_business" (food truck)

Ya existe validación:
- ✅ `mobile_equipment_required`

#### Pregunta 8.1: Mobile Equipment
```
¿Qué debe configurar en "mobile_equipment"?

A) Tipo de vehículo/equipment + ubicaciones frecuentes → Milestone CRITICAL
B) Solo checkbox declarativo "tengo equipo móvil" → No milestone
C) Configuración opcional, puede operar igual → OPTIONAL

Respuesta: A, y si hay algo mas que se te ocurra para investigar o sumar en este caso que aun no esta muy desarollado es bienvenido, pero si en principio si el usuario elige esa opcion deberioa tener como MILESTONE CRITICAL todo lo que implique de obligatoriedad para poder operar con normalidad ese tipo de negocios
```

---

## 🎯 ROUND 9: Features de ECOMMERCE

### **Feature: `online_payments`**

**Escenario**: Usuario elige "has_online_store"

Ya existe validación:
- ✅ `payment_methods_required`

#### Pregunta 9.1: Payment Gateway
```
¿"Configurar métodos de pago online" implica:

A) Conectar API keys de MercadoPago/Stripe/etc → Milestone CRITICAL
B) Solo marcar checkbox "acepto Visa/Master" → No milestone
C) Puede vender sin payment gateway (transferencia manual) → Milestone OPTIONAL

Respuesta: Si en realidad este es otro punto critico y otra ambiguedad que presenta nusetro sistema y deemos tratar, lo que identificaste como MIlestone criticals, como conectar las api keys y demas configuraciones de pago podria llegar a ser critico en otro modelo de neegocios tambien pero la ambiguedad se da en que has_online_store lo unico que proporciona es una tienda asincrona que opera 24hs y es disstinto a un menu online o una carta(tenbiendo en cuenta que ofrecemos tambien soporte para negocxios con take awaay y consumo en el local, tambien otra ambiguedad respecto a esto debido a que una tienda online tambien puede ofrecer servicio de retiro, normalmente tmabien ofrece envio en su mayoria)
```

---

## 🎯 ROUND 10: FISCAL (Core Feature)

### **Feature: `fiscal_compliance`**

**Escenario**: Es CORE (siempre activa)

Ya existe validación:
- ✅ `tax_id_required` (CUIT/RUT)

#### Pregunta 10.1: Configuraciones fiscales
```
¿Qué configuraciones fiscales SON OBLIGATORIAS antes de primera venta?

Marca las OBLIGATORIAS:
□ A) Configurar tipos de comprobante (Factura A/B/C)
□ B) Conectar con AFIP/autoridad fiscal
X C) Configurar punto de venta
□ D) Configurar impuestos/tasas aplicables
□ E) Nada, con CUIT/RUT alcanza (factura después)

Respuesta: Todo lo que tenga que ver y sugeriste en las opciones es bienvenido valido y deberia ser considerado, pero no como critico, debido a que en mi pais por ejemplo el 60% de los negocios operan en negro, osea sin pagar impuestos, la idea es que en este puntoi sea mas flexible considerando esas personas.
```

---

## 🎯 ROUND 11: CUSTOMER MANAGEMENT (Core Feature)

### **Feature: `customer_management`**

**Escenario**: Es CORE (siempre activa)

#### Pregunta 11.1: CRM Setup
```
¿Debe configurar algo ANTES de poder registrar clientes?

A) SÍ, debe crear campos personalizados/segmentos → Milestone CRITICAL
B) NO, puede registrar clientes directamente → NO milestones (solo achievements)

Respuesta: Podria ser la respuesta A, la verdad no lo habia pensado y no tengo mucho conocimiento tecnico de como llevarlo a cabo, pero podriamos decidirlo o discturilo
```

---

## 🎯 ROUND 12: DELIVERY (Continuación)

### **Feature: `delivery_management`**

**Escenario**: Usuario elige "sells_products_delivery"

Ya discutido:
- ✅ `configure_delivery_zones` → CRITICAL
- ✅ `define_business_hours` → CRITICAL
- ⚠️ `set_delivery_fees` → Validation con default $0

#### Pregunta 12.1: Configuraciones adicionales de Delivery
```
¿Qué otras configuraciones necesita delivery?

Marca las OBLIGATORIAS:
X A) Radio máximo de entrega (km)
X B) Tiempo estimado de preparación
X C) Mínimo de compra para delivery
X D) Método de tracking (GPS, manual)
□ E) Ninguna, con zones + hours alcanza

Respuesta: Aclaro que el metodo de tracking no es oibligatorio ni nada
```

---

## 📊 PREGUNTAS ADICIONALES GENERALES

### Pregunta General 1: Threshold de bloqueo
```
Para desbloquear una feature:

A) Debe completar SOLO milestones CRITICAL (100% de critical)
B) Debe completar CRITICAL + REQUIRED (100% de ambos)
C) Con 80% de CRITICAL alcanza (permite operar con mínimo)

Respuesta: No se si bloquear features, aca habria que pensar como y donde poner las limitaciones, por un lado por ejemplo habra configuraciones que no tengan sentido si otras no existen, o habra algunas configuraciones coodependientes de otras antes de poder ser ejecutadas, quitando estos casos me gustaria limitar mas que nada la operacion general del negocio, no pensar tanto en bloquear pantallas o demas. Pero me parece bueno partirt de la base de que yo no puedo aceptar un pedido de delivery si nisiquiera se a que zonas llego, lo cual seria contraproducente que me dejaran abrir la tienda y empezar un turno sin zonas de delivery, sin articulos en la tienda o sin precios, y asi applicarlo a otros ejemplos pero tambien podemos discutirlo 
```

### Pregunta General 2: Warnings de REQUIRED
```
Si feature está desbloqueada pero faltan milestones REQUIRED:

A) Mostrar banner warning en la página de la feature
B) Mostrar solo notificación toast al entrar
C) No mostrar nada, solo en dashboard de setup

Respuesta: Definimos despues
```

### Pregunta General 3: Orden de milestones
```
¿Los milestones DEBEN completarse en orden específico?

A) SÍ, hay dependencias (ej: primero productos, luego categorías)
B) NO, puede completarlos en cualquier orden
C) Solo algunos tienen prerequisitos

Respuesta: Si, como bien decis algunos tendran dependencias de otras asi que habria que pensar un poco este aspecto, al menos en no cometer errores

```

---

## ✅ INSTRUCCIONES FINALES

**Por favor, responde:**
1. Todas las preguntas marcando con una X o escribiendo tu respuesta
2. Si alguna pregunta no aplica o está mal planteada, indicalo
3. Si falta alguna configuración importante que no pregunté, agregala al final

**Formato de respuesta sugerido:**
```
Pregunta 1.1: B
Pregunta 1.2: A - El precio es obligatorio en el formulario
Pregunta 1.3: B
...
```

Una vez completes este documento, lo leeré y armaré:
- ✅ Matriz completa de milestones
- ✅ Lógica de bloqueo por feature
- ✅ Dashboard setup progress widgets
- ✅ Sistema de validaciones vs milestones

🚀 **¡Gracias por la paciencia en responder todo!**
