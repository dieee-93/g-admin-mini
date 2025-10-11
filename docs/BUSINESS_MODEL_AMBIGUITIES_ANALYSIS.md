# 🚨 ANÁLISIS DE AMBIGÜEDADES EN BUSINESS MODEL

**Problema**: Activities con funcionalidades SUPERPUESTAS que generan confusión en qué elegir.

---

## ❌ PROBLEMAS IDENTIFICADOS

### **PROBLEMA 1: Pickup/Retiro - Superposición Triple**

**Activities actuales**:
1. `sells_products_pickup` - "Retiro en tienda"
2. `has_online_store` - "Tienda online" (también permite pickup)
3. `sells_products_onsite` - "Consumo en local" (podría ofrecer pickup también)

**Confusión del usuario**:
```
Escenario: Panadería que vende para llevar
- ¿Qué elijo?
  - ¿pickup? (suena a que solo retiro, no puedo vender online)
  - ¿online_store? (pero no tengo e-commerce, solo quiero que reserven)
  - ¿onsite? (pero no se consume en el local)
```

**Superposición**:
- Pickup puede ser: gastronómico (panadería) o retail (farmacia)
- Online store incluye: pickup + delivery usualmente
- Onsite puede ofrecer: pickup de sobras (doggy bag)

---

### **PROBLEMA 2: Delivery - ¿Integrado o Standalone?**

**Activities actuales**:
1. `sells_products_delivery` - "Delivery"
2. `has_online_store` - "Tienda online"

**Confusión del usuario**:
```
Escenario: Restaurant con delivery
- ¿Qué elijo?
  - ¿delivery? (pero también quiero que pidan online)
  - ¿online_store? (pero no soy e-commerce, soy restaurant)
  - ¿ambos? (¿se superponen?)
```

**Superposición**:
- Delivery puede venir de: pedido telefónico, pedido online, pedido presencial
- Online store normalmente incluye: delivery como opción de envío

---

### **PROBLEMA 3: Online Store - Demasiado Abarcativo**

**Activity actual**:
`has_online_store` - "Tienda online"

**¿Qué incluye?**:
- E-commerce asincrónico (tienda 24/7)
- Menu digital para restaurants
- Catálogo online con pickup
- Reservas/pedidos online

**Confusión del usuario**:
```
Escenario 1: Restaurant que quiere menu digital
- ¿Es "online_store"? (suena a e-commerce)

Escenario 2: Panadería que quiere que reserven por WhatsApp y retiren
- ¿Es "online_store"? (no tengo web)

Escenario 3: Tienda de ropa con e-commerce + pickup + delivery
- Obviamente sí, pero... ¿elijo solo online_store o también pickup y delivery?
```

---

### **PROBLEMA 4: Onsite Consumption - ¿Solo Restaurant?**

**Activity actual**:
`sells_products_onsite` - "Consumo en local"

**¿Qué incluye?**:
- Restaurant con mesas
- Café con barra
- Heladería con mesitas
- Bar con tragos
- Food court en shopping

**Confusión del usuario**:
```
Escenario: Heladería con mostrador (sin mesas)
- ¿Es "onsite"? (no tengo mesas para gestionar)
- ¿O solo pickup? (pero se consume en el local parado)
```

---

### **PROBLEMA 5: Services with Appointment - ¿Solo Servicios?**

**Activity actual**:
`sells_services_appointment` - "Servicios con cita"

**¿Qué incluye?**:
- Peluquería
- Consultorio médico
- Taller mecánico
- Restaurant con reservas (¿?)

**Confusión del usuario**:
```
Escenario: Restaurant que toma reservas
- ¿Es "onsite" o "appointment"?
- ¿O ambos?
```

---

### **PROBLEMA 6: B2B - ¿Modificador o Activity?**

**Activity actual**:
`is_b2b_focused` - "Enfoque B2B"

**¿Es excluyente con B2C?**:
- Negocio puede ser B2B + B2C simultáneamente
- ¿Qué pasa si hace ambos?

**Confusión del usuario**:
```
Escenario: Distribuidora que vende a negocios Y al público
- ¿Elijo B2B? (pierdo features de B2C)
- ¿No elijo B2B? (pierdo features de crédito corporativo)
```

---

## 🎯 MATRIZ DE SUPERPOSICIONES

| Activity | Puede incluir | Se superpone con |
|----------|---------------|------------------|
| `sells_products_onsite` | Pickup, Reservas | `sells_products_pickup`, `sells_services_appointment` |
| `sells_products_pickup` | Online orders, Delivery pickup | `has_online_store`, `sells_products_delivery` |
| `sells_products_delivery` | Online orders, Pickup orders | `has_online_store`, `sells_products_pickup` |
| `has_online_store` | Pickup, Delivery, Reservas | TODO lo anterior |
| `sells_services_appointment` | Reservas de mesa, Eventos | `sells_products_onsite` |
| `is_b2b_focused` | Venta retail también | Se combina con otros |

---

## 💡 RAÍZ DEL PROBLEMA

**Mezclamos 3 conceptos en un solo nivel**:

### **Concepto 1: CANAL DE VENTA**
- Presencial (onsite)
- Telefónico
- Online
- Por cita

### **Concepto 2: MÉTODO DE ENTREGA**
- Consumo in-situ
- Pickup/Retiro
- Delivery/Envío

### **Concepto 3: TIPO DE CLIENTE**
- B2C (consumidor final)
- B2B (empresas)

**Problema**: Están todos mezclados en "Activities"

---

## 🎯 SOLUCIONES POSIBLES

### **SOLUCIÓN 1: Separar en 3 preguntas**

```
Pregunta 1: ¿CÓMO VENDEN?
□ Presencial en local
□ Online (web/app)
□ Telefónico
□ Por cita/reserva

Pregunta 2: ¿CÓMO ENTREGAN?
□ Consumo en el local
□ Retiro del cliente (pickup)
□ Envío a domicilio (delivery)

Pregunta 3: ¿A QUIÉN VENDEN?
□ Consumidores finales (B2C)
□ Empresas (B2B)
□ Ambos
```

**Ventaja**: Claridad total, cero ambigüedad
**Desventaja**: 3 preguntas en setup (más fricción)

---

### **SOLUCIÓN 2: Merge conflictivos + checkboxes dinámicos**

```
Pregunta 1: ¿Qué hace tu negocio? (Seleccioná todas las que apliquen)

□ Venta de productos
  └─ ¿Cómo entregan?
     □ Consumo en el local (restaurant, café)
     □ Retiro del cliente (panadería, farmacia)
     □ Envío a domicilio (delivery)

□ Servicios con cita previa (peluquería, consultorio)

□ Tienda online 24/7 (e-commerce)
  └─ ¿Con qué opciones de entrega?
     □ Solo pickup
     □ Solo delivery
     □ Ambos
```

**Ventaja**: Sigue siendo 1 pregunta principal con sub-opciones
**Desventaja**: UI más compleja (árbol de opciones)

---

### **SOLUCIÓN 3: Eliminar ambigüedades - Merge total**

```
Nueva estructura de Activities (SIN superposiciones):

1. restaurant_dine_in (restaurant con mesas - incluye TODO: pickup, delivery, reservas)
2. quick_service_food (panadería, fast food - incluye pickup + delivery)
3. retail_store (tienda física - incluye pickup)
4. ecommerce_only (tienda online pura - incluye pickup + delivery)
5. service_appointments (servicios por cita)
6. mobile_business (food truck, ambulante)

Cada una activa TODO lo que puede necesitar.
Usuario NO elige canales, elige MODELO DE NEGOCIO completo.
```

**Ventaja**: Cero ambigüedad, experiencia guiada
**Desventaja**: Menos flexible, más específico (lo que NO querías)

---

### **SOLUCIÓN 4: Dos-tier selection**

```
TIER 1: Business Type (específico)
- Restaurant
- Café/Bakery
- Retail Store
- E-commerce
- Services
- Food Truck

TIER 2: Available Channels (checkboxes)
Según lo que elegiste en Tier 1, te mostramos:
□ Delivery
□ Pickup/Takeaway
□ Online ordering
□ Table reservations
```

**Ventaja**: Específico en tipo, flexible en canales
**Desventaja**: Tier 1 es muy específico (perdemos abstracción)

---

## 🎯 SOLUCIÓN PROPUESTA HÍBRIDA

### **Approach: "Activities no superpuestas + Multi-select inteligente"**

**Redefinir Activities SIN superposiciones**:

```typescript
export type BusinessActivityId =
  // PRODUCTOS - Physical/Digital
  | 'sells_physical_products'      // Vende productos físicos
  | 'sells_digital_products'       // Vende productos digitales (software, cursos)

  // FOOD & BEVERAGE - Con subdivisiones claras
  | 'food_service_seated'          // Restaurant, café (con mesas)
  | 'food_service_counter'         // Panadería, fast food (counter)

  // SERVICIOS
  | 'provides_scheduled_services'  // Servicios por cita (peluquería, etc.)
  | 'provides_instant_services'    // Servicios inmediatos (car wash, etc.)
```

**Nuevo layer: FULFILLMENT METHODS** (cómo entregan)

```typescript
export type FulfillmentMethodId =
  | 'consume_onsite'      // Se consume/usa en el local
  | 'customer_pickup'     // Cliente retira
  | 'delivery_shipping'   // Envío/delivery
  | 'digital_delivery';   // Descarga digital
```

**Nuevo layer: SALES CHANNELS** (cómo venden)

```typescript
export type SalesChannelId =
  | 'in_person'          // Presencial (POS en local)
  | 'online_web'         // Web/app
  | 'phone_orders'       // Telefónico
  | 'social_media';      // Redes sociales
```

**Setup wizard**:
```
1. ¿Qué vende tu negocio?
   □ Productos físicos (ropa, electrónicos, etc.)
   □ Comida/bebida con servicio de mesa
   □ Comida/bebida para llevar (counter)
   □ Servicios por cita

2. ¿Cómo entregan? (puede elegir varios)
   □ Se consume en el local
   □ Cliente retira
   □ Hacemos delivery/envío

3. ¿Cómo venden? (puede elegir varios)
   □ Presencial en el local (POS)
   □ Online (web/app)
   □ Por teléfono
```

---

## ❓ PREGUNTAS PARA DECIDIR

1. **¿Cuál de las 4 soluciones te hace más sentido?**
No se la solucion hibrida parece bastante coherente, lo unico que me preocupaes que cubra todos los edge cases y que no sea redundante, lo unico que me hace ruido es la ultima pregunta, lo de presencia en el local, online y por telefono, igual no descarto la pregunta ni nada, incluso nos puede servir para personalizar un poco mas los tutoriales y milestones(configurar un numero de telefono, configurar un numero de whatsapp, etc) pero no entiendo por ejemplo la opcion de POS, no entiendo la relevancia o la diferencia entre preguntar arriba si hay consumo si hay mesas etc,etc.
Por otro lado en cuanto a los canales de venta yo aun no habia pensado como iba a diferenciar lo que la app ofrece o como iba a ser la experiencia
Pero te dejo la diferencia clave porque creo que se malentendio ladiferencia entre la tienda-online y la tienda comun o que pasaba si no seleccionabas la opcion de tienda online.
Ambas elecciones contaban con una tienda online, de hecho el catalogo de productos es un requisito para que la app funcione basicamente porque el flujo es se agregan a Stock(Materials) -> y luego los Products son una lista de esos materials hablando basicamente que al ser comprados se descuentan de stock(al menos los productos fisicos con elaboracion, en el caso de que la persona no produzca lo que consume) entonces sabiendo esto tenemos 2 ambiguedades, carta online van a tener ambos, tambien la capacidad de tomar pedidos manualmente por los emnpleados(para casos whatsapp o telefono de linea fija).
La diferencia con la online store no es justamente la funcionalidad de "online" si no la asincronia, osea funciona 24 hs con un flujo de trabajo distinto. y aca encontramos otra ambiguedad porque la tienda online a pesar de vender productos asincronos no necesariamente tienen que ser digitales, podria haberu n restaurant que venda productos congelados 24 hs, o una tienda de galletas que ofrezca ambos canales de venta(en un local en un horario determinado y a su vez vender su mismo producto en la tienda online 24hs y manejar la logistica aparte(correo, delivery en moto,etc)) asi que hay que pensar como lidiar con esto tambien
2. **¿O combinamos elementos de varias?**
No se cual es la solucion mas apta, realmente debemos estudiar mas casos en profundidad para pulir el enfoque aunque ya se acerca bastante, pero a pesar de que el enfoque hibrido de preguntas al final se acerca bastante a  poder configurar esto pero aun noto algunas redundancias o cosas confusas en el formulario
3. **¿Estás dispuesto a agregar 1-2 preguntas más al setup wizard para eliminar ambigüedades?**
Si, estoy dispuesto a modificar completamente el setup wizard, interfaz, componentes, enfoques etc, la idea es que el formulario realmente aporte valor y claridad, como veras es algo abrumador no solo de pensar como diseñarlo tambien puede ser dificil o agobiante para el usuario.

---

## 🔄 ANÁLISIS DE TU FEEDBACK

### ✅ ENTENDIMIENTOS CORREGIDOS:

1. **"Online Store" NO es sobre tener web**
   - ❌ Pensé: Online store = tiene sitio web
   - ✅ Realidad: Online store = **operación ASINCRÓNICA 24/7** (sin horarios)

2. **TODOS tienen "catálogo online"**
   - Todos los negocios tienen Products (que vienen de Materials)
   - Todos pueden mostrar carta/menú online
   - Todos pueden tomar pedidos por WhatsApp/teléfono

3. **La diferencia es el MODO DE OPERACIÓN**
   - Sincrónico: Negocio abierto 9-18hs, fuera de horario NO opera
   - Asincrónico: Acepta pedidos 24/7, procesa cuando puede

### ❌ REDUNDANCIAS IDENTIFICADAS:

**Pregunta 3 (Canales de venta) ES REDUNDANTE**:
- "Presencial (POS)" → Ya implícito si tiene local físico
- "Online" → TODOS tienen online (catálogo/carta)
- "Por teléfono" → Es un medio de comunicación, no un canal

**Conclusión**: Pregunta 3 debe eliminarse o reconceptualizarse.

---

## 🎯 NUEVA PROPUESTA - Versión 2.0

Basado en tu explicación, el problema real es:

### **DIMENSIÓN 1: ¿QUÉ VENDE?**
```
□ Productos físicos (requieren stock)
□ Comida/bebida con servicio de mesa
□ Comida/bebida sin mesas (counter)
□ Servicios por cita
```

### **DIMENSIÓN 2: ¿CÓMO ENTREGA?**
```
□ Consumo en el local
□ Cliente retira (pickup/takeaway)
□ Delivery/envío
```

### **DIMENSIÓN 3: ¿CÓMO OPERA? (LA CLAVE)**
```
( ) Sincrónico - Opera con horarios fijos
    Ejemplo: Restaurant 12-23hs, fuera de horario NO toma pedidos

( ) Híbrido - Opera con horarios + acepta pedidos asincrónicos
    Ejemplo: Restaurant 12-23hs pero acepta pedidos para el día siguiente

( ) Asincrónico 24/7 - Siempre acepta pedidos
    Ejemplo: E-commerce que procesa cuando puede
```

---

## 🤔 CASOS DE USO PARA VALIDAR

### **Caso 1: Restaurant tradicional**
```
¿Qué vende? → Comida/bebida con mesas
¿Cómo entrega? → Consumo en local + Delivery
¿Cómo opera? → Sincrónico (12-23hs)

Features activadas:
- table_management ✅
- delivery_management ✅
- online_catalog ✅ (para que vean la carta)
- phone_orders ✅
- pos_system ✅

Features NO activadas:
- asynchronous_orders ❌ (no opera 24/7)
```

### **Caso 2: Restaurant con productos congelados 24/7**
```
¿Qué vende? → Comida/bebida con mesas
¿Cómo entrega? → Consumo en local + Delivery + Pickup
¿Cómo opera? → Híbrido

Features activadas:
- table_management ✅ (para el restaurant)
- delivery_management ✅
- pickup_management ✅
- asynchronous_orders ✅ (para congelados 24/7)
- inventory_split ✅ (stock separado: fresh vs frozen)
```

### **Caso 3: Panadería takeaway**
```
¿Qué vende? → Comida/bebida sin mesas
¿Cómo entrega? → Cliente retira
¿Cómo opera? → Sincrónico (6-20hs)

Features activadas:
- pickup_management ✅
- online_catalog ✅
- phone_orders ✅
- pos_system ✅

Features NO activadas:
- table_management ❌
- asynchronous_orders ❌
```

### **Caso 4: Tienda de galletas con local + e-commerce**
```
¿Qué vende? → Productos físicos
¿Cómo entrega? → Cliente retira + Delivery
¿Cómo opera? → Híbrido

Features activadas:
- pickup_management ✅ (retiro en local)
- delivery_management ✅ (envío)
- asynchronous_orders ✅ (e-commerce 24/7)
- inventory_split ✅ (stock local vs online)
- pos_system ✅ (ventas en local)
```

### **Caso 5: E-commerce puro (sin local físico)**
```
¿Qué vende? → Productos físicos
¿Cómo entrega? → Delivery
¿Cómo opera? → Asincrónico 24/7

Features activadas:
- asynchronous_orders ✅
- delivery_management ✅
- online_catalog ✅
- inventory_management ✅

Features NO activadas:
- pos_system ❌ (no tiene local)
- pickup_management ❌ (no hay dónde retirar)
```

---

## ❓ PREGUNTAS CRÍTICAS PARA VOS

### **Pregunta 1: Modo de operación**
```
Los 3 modos (Sincrónico, Híbrido, Asincrónico) ¿cubren todos los casos?

¿O falta algún modo de operación?
Ejemplos que me preocupan:
- Dark kitchen (solo delivery, sin local físico)
- Food truck (móvil, sin ubicación fija)
- Pop-up store (temporal)
```


### **Pregunta 2: Stock separado**
```
Caso: Restaurant con productos congelados 24/7

¿Cómo manejan el stock?
A) Stock unificado (mismo producto en restaurant y online)
B) Stock separado (productos "frescos" vs "congelados")
C) El usuario decide por producto
```

### **Pregunta 3: Horarios múltiples**
```
Caso: Restaurant con 2 horarios (almuerzo 12-15, cena 20-23)

¿El sistema debe soportar:
A) Horarios únicos por día (Lunes 12-23)
B) Múltiples franjas por día (Lunes 12-15 + 20-23)
C) Horarios diferentes por delivery vs local


```

### **Pregunta 4: Redundancia en preguntas**
```
¿Te parece que "¿Cómo opera?" es clara?

Opciones de redacción:
A) "¿Cuándo aceptas pedidos?"
   - Solo durante horario de atención
   - También fuera de horario (para después)
   - 24/7 (siempre)

B) "¿Tu negocio opera con horarios fijos?"
   - Sí, solo opero en horarios específicos
   - No, acepto pedidos 24/7

C) Otra redacción que sugieras
```



### **Pregunta 5: Validación de combinaciones**
```
¿Hay combinaciones INVÁLIDAS que debemos bloquear?

Ejemplos:
- ❌ Consumo en local + Asincrónico 24/7 (no tiene sentido)
- ❌ Servicios por cita + Delivery (¿se puede?)
- ❌ Sin local físico + Pickup (no hay dónde retirar)

¿O dejamos que el usuario elija cualquier combinación?
```

---

## 🎯 PROPUESTA DE SETUP WIZARD v2.0

```
┌─────────────────────────────────────────────┐
│ Paso 1: ¿Qué vende tu negocio?             │
│                                             │
│ □ Productos físicos                        │
│ □ Comida/bebida con servicio de mesa       │
│ □ Comida/bebida para llevar (sin mesas)    │
│ □ Servicios por cita                       │
│ □ Productos digitales                      │
└─────────────────────────────────────────────┘

┌─────────────────────────────────────────────┐
│ Paso 2: ¿Cómo entregan?                    │
│         (Seleccioná todas las que apliquen)│
│                                             │
│ □ Se consume/usa en el local               │
│ □ Cliente retira                           │
│ □ Hacemos delivery/envío                   │
└─────────────────────────────────────────────┘

┌─────────────────────────────────────────────┐
│ Paso 3: ¿Cuándo aceptas pedidos?           │
│                                             │
│ ○ Solo durante horario de atención         │
│   Ejemplo: Restaurant 12-23hs              │
│                                             │
│ ○ También fuera de horario                 │
│   Ejemplo: Restaurant + congelados 24/7    │
│                                             │
│ ○ Siempre (24/7)                           │
│   Ejemplo: E-commerce que procesa cuando   │
│   puede                                     │
└─────────────────────────────────────────────┘

┌─────────────────────────────────────────────┐
│ Paso 4: Infraestructura                    │
│                                             │
│ ○ Local único                              │
│ ○ Múltiples locales                        │
│ ○ Negocio móvil (food truck)               │
│ ○ Solo online (sin local físico)           │
└─────────────────────────────────────────────┘
```

---

## 📝 RESPONDE ESTAS 5 PREGUNTAS

Por favor, editá este documento agregando tus respuestas:

**Respuesta Pregunta 1 (Modos de operación)**:

Bueno para empezar el formulario maneja o contempla estos casos, habria que revisar quiza la interfaz o demas pero justamente es la gracia de la abstraccion de los componentes y modulos, osea Dark kitchen no es una configuracion como tal o clasificacion pero si el usuario esta tratando de configurar su negocio y al llenar el formulario elije que solo trabaja con delivery, se le activaran las funciones necesarias, el planteo anterior al menos lo maneajba asi, pero bueno lo que si me preocupa un poco mas es que la capacity de delivery en sells products contemplaba a comida mas que nada y no deberia tener que ver con la tienda online, pero tambien a su vez hay que considerar que es una buena oportunidad para reutiilizar logica en ambos casos es decir que el delivery incluso podria ser de una verduleria, que no necesariamente cocina y solo ofrece servicio de delivery en un horario o momentos determinado(me refiero a una verduleria pequeña con un reparto en el dia, o un almacen con delivery propio), no quiero seguir poniendo ejemplos que agreguen complejidad, y si bien esto que menciono anteriormente es algo a tener en cuenta, la verduleria basta con que seleccione delivery probablemente pueda operar el flujo de la app normal guarda verduras en stock, (soporta materias x peso x cantidad o con preparacion), gestiona ventas, se descuenta de stock osea que la flexibilidad de la app hace que multiples negocios puedan operar sin importar el tipo, logicamente solo resta definir que la interfaz no sea confusa, el sistema tampoco, y todo esto sea una ecosistema en lugar de una ensalada. Pero presta atencion a esto mencionado sobre la abstraccion, es la que nos permite gestionar negocios x funciones sin importar, por ejemplo en el caso del foodtruck tambien contemplamos eso en el formulario, pero si seguimos este principio de abstraccion, quitando algunas funciones especificas de foodtruck que podriamos cubrir(mantenimiento del vehiculo, papeles, lo que fuere, laverdad que no tengo experiencia en el mantenimiento especifico deun foodtruck) el resto podriamos abstraerlo a que es un foodtruck ? un lugar de comidas con direccion movil, pero como vende ? tiene retiro en tienda y suponete que tiene mesas, tranquilamente si el usuario seleccionara esas dos opciones deberia poder usar la app
**Respuesta Pregunta 2 (Stock separado)**:
Bueno hay que pensar no solo esto si no como convive con el otro tipo de productos, respondiendo en pocas palabras, podrian estar tranquilamente unificados en el stock, la diferencia deberia ser en la tienda que se ofrecen, osea si es un producto congelado que va por canal asincrono, lo diferente sera el post compra, en caso de los productos comprados fuera del horario laboral normal o en la tienda asincrona se pactara logicamente una distinta entrega(retirar a partir de mañana o a pactar, envios por correo, incluso motomensajeria) y la diferenciacion entiendo se encontrara en esa parte del flujo de la app, en cambio el otro pedido se realiza, en el momento se empieza a preparar, en el momento se envia(con la demora logica correspondiente)


**Respuesta Pregunta 3 (Horarios múltiples)**:
Bueno en cuanto a esta solucion se supone que la decision tomada fue que el sistema de schedule y demas maneje todo como por bloques de horarios, no se actualmente como se encuentra eso o si aun falta logica por desarrollar, pero en teoria iba a haber como un sistema central de almanaque o algo asi, y todo iban a ser bloques de tiempo en dicho sistema(turnos de atencion, turnos de cocina, turnos de empleados, incluso citas y demas)

**Respuesta Pregunta 4 (Redacción pregunta 3)**:
No estan mal las preguntas, pero recorda que mas bien el sistema actua como una gran union de cosas, osea que el usuario peude seleccionar mas de 1 opcion, entiendo que en el caso de la pregunta A no seria algo correcto, por otro lado la pregunta B parece ser mas acorde para definirlo o mas directa pero me preocupa que no termine de quedar en claro la diferencia entre tener una tiendao nline y no tenerla, sobre todo para el usuario, me refiero que quiza el usuario piense que para tener una carta visible por internet o whatsapp necesite activar la opcion de tienda online, cuando simplemente basta con activar la opcion de Take away para que incluya todo el paquete de funciones con la carta online

**Respuesta Pregunta 5 (Combinaciones inválidas)**:
Exactamente, la idea es felxibilidad absoluta, sacando algunos casos completamente antagonicos como Una surcursal-Multisurcursal, logicamente la idea es sin compeljizar mucho las relaciones y la abstraccion lograr que un usuario pueda administrar cualquier cosa, incluso te pongo mi ejemplo en carne propia tengo pizzeria hace 6 años, imaginemos que hace 2 años empeze a usar la app, yo hasta este momento solo trabajaba con delivery, porque tengo una dark Kitchen, pero logre mudarme y ahora alquile un local un poco mas grande y tengo 3 mesas y tambien hago retiro en tienda, la app ya funcionaba para mi, el cliente hacia pedidos por el catalogo y luego de confirmarse se le daba el tiempo de demora etxcetc lo que hace cualquier app, bueno teniendo en cuenta que ahora doy mas servicios que antes voy a settings, activo estos servicios, y ahora tengo la capacidad de gestionar mesas, un salon y tambien que el usuario retire los pedidos. Ahora se le ofreceran mas opciones de retiro en la tienda online(no asincronica), reservas(opcional), y todas las funciones relacionadas o que ayuden a gestionar estos aspectos, y usando las mismas recetas que ya tenia guardado, el mismo stock que ya tenia construido, incluso manteniendo la  base de clientes, staff, y demas configuraciones que haya guardado. Incluso ahora imaginemos que despues de trabajar 4 años mas en mi bnuevo local decido sumar un foodtruck y trabajar los fines de semana en otro lugar manteniendo ambos abiertos, seria bueno poder seguir gestionando y administrando de manera practica


---

## 🎯 DISEÑO DEFINITIVO - Basado en tus respuestas

### ✅ INSIGHTS CLAVE DE TUS RESPUESTAS:

1. **Abstracción > Especificidad**
   - Dark kitchen = usuario elige solo "delivery"
   - Food truck = usuario elige "retiro" + "mesas" + infrastructure "móvil"
   - Delivery NO es solo comida (verdulería, almacén, etc.)

2. **Stock UNIFICADO, diferencia en POST-COMPRA**
   - Mismo producto en ambos canales (síncrono y asíncrono)
   - Diferencia: timing de entrega (inmediato vs pactado)

3. **Sistema de bloques de tiempo centralizados**
   - Ya existe decisión: almanaque central
   - Todo son bloques (turnos, citas, horarios)

4. **MULTI-SELECT, no radio buttons**
   - Usuario puede combinar múltiples opciones
   - Features activables/desactivables en settings DESPUÉS del setup

5. **Problema de nomenclatura: "Tienda Online"**
   - "Take away" YA incluye carta online
   - "Tienda online" debe significar SOLO asincronía 24/7

---

## 🚨 PROBLEMA IDENTIFICADO: Nomenclatura confusa

**Problema**: "Tienda Online" suena a "tener presencia web"

**Casos que confunden**:
```
❌ Restaurant con carta online → NO es "tienda online"
❌ Panadería con WhatsApp → NO es "tienda online"
✅ E-commerce 24/7 → SÍ es "tienda online"
```

**SOLUCIÓN**: Cambiar el nombre de la opción

---

## 🎯 PROPUESTA FINAL - WIZARD v3.0

### **Cambios vs v2.0**:
1. ❌ Eliminada pregunta 3 "¿Cómo opera?" (redundante)
2. ✅ Renombrar "Tienda Online" → "Venta asincrónica 24/7"
3. ✅ Todas las opciones son CHECKBOXES (multi-select)
4. ✅ Agregar tooltips explicativos

---

### **PASO 1: ¿Qué vende tu negocio?**

```
Seleccioná todas las que apliquen:

□ Productos físicos
  💡 Ropa, electrónicos, alimentos envasados, etc.

□ Comida/bebida para consumir en el local
  💡 Restaurant, café, bar con mesas

□ Comida/bebida para llevar
  💡 Panadería, pizzería, fast food (sin mesas)
  ✅ Incluye: carta online, pedidos por WhatsApp/teléfono

□ Servicios profesionales
  💡 Peluquería, consultorios, talleres

□ Productos digitales
  💡 Cursos online, software, ebooks
```

---

### **PASO 2: ¿Cómo entregan?**

```
Seleccioná todas las que apliquen:

□ Se consume/usa en el local
  💡 Mesas, barra, área de consumo

□ Cliente retira
  💡 Pickup, takeaway en mostrador

□ Hacemos delivery/envío
  💡 Entrega a domicilio, envío por correo
```

---

### **PASO 3: Opciones avanzadas**

```
□ Venta asincrónica 24/7
  💡 E-commerce que acepta pedidos fuera de horario
  💡 Ejemplo: Productos congelados, tienda online
  💡 NOTA: Tu negocio YA tiene carta online con las opciones anteriores

□ Enfoque B2B
  💡 Venta mayorista, cuentas corporativas
```

---

### **PASO 4: Infraestructura**

```
Seleccioná una:

○ Local único
  💡 Un solo punto de venta fijo

○ Múltiples locales
  💡 Cadena, sucursales, franquicias

○ Negocio móvil
  💡 Food truck, venta ambulante

○ Solo online (sin local físico)
  💡 E-commerce puro, dark kitchen
```

---

## 🔄 EJEMPLO: Tu caso personal (Pizzería)

### **Año 1: Dark Kitchen**
```
Setup inicial:
□ Comida/bebida para llevar ✅
□ Hacemos delivery ✅
○ Local único ✅

Features activadas:
- delivery_management
- online_catalog (carta)
- phone_orders
- pos_system
```

### **Año 3: Local con mesas**
```
Settings → Activar nuevas features:
□ Se consume en el local ✅
□ Cliente retira ✅

Features agregadas:
- table_management
- pickup_management
- dining_areas
```

### **Año 7: Food truck adicional**
```
Settings → Infraestructura:
Cambio de "Local único" → "Múltiples locales"
Agregar segunda ubicación: "Food Truck"

Features agregadas:
- multi_location_management
- mobile_location_tracking
```

**✅ Resultado**: Misma data (stock, recetas, clientes, staff)

---

## 🛠️ MATRIZ DE ACTIVACIÓN DE FEATURES

| User Selection | Features Activadas | Milestones CRITICAL |
|----------------|-------------------|---------------------|
| "Comida con mesas" | table_management, kitchen_display, pos_onsite | configure_tables, define_dining_areas, create_first_product |
| "Comida para llevar" | pickup_management, online_catalog, phone_orders | create_first_product, configure_pickup_hours |
| "Delivery" | delivery_management | configure_delivery_zones |
| "Cliente retira" | pickup_management | configure_pickup_hours (OPTIONAL si ya tiene operating_hours) |
| "Venta asincrónica 24/7" | asynchronous_orders, ecommerce_features | configure_async_fulfillment |
| "Enfoque B2B" | corporate_accounts, credit_management | configure_payment_terms |

---

## 🎨 UI IMPROVEMENTS

### **Tooltips dinámicos**

```tsx
// Comida/bebida para llevar
<Tooltip>
  ✅ Incluye:
  - Carta/menú online
  - Pedidos por WhatsApp
  - Pedidos telefónicos

  ❌ NO incluye:
  - Gestión de mesas
  - Kitchen display
</Tooltip>

// Venta asincrónica 24/7
<Tooltip>
  💡 Solo activá esto si:
  - Tu negocio acepta pedidos fuera de horario
  - Tenés productos que se entregan después (congelados, envíos)

  ⚠️ Tu negocio YA tiene carta online sin activar esto
</Tooltip>
```

### **Validaciones inteligentes**

```tsx
// Si usuario NO selecciona nada en Paso 2 (Cómo entregan)
if (fulfillmentMethods.length === 0) {
  showWarning("Debés elegir al menos una forma de entrega");
}

// Si selecciona "Solo online" pero también "Se consume en local"
if (infrastructure === 'online_only' && fulfillmentMethods.includes('consume_onsite')) {
  showWarning("Si no tenés local físico, no podés ofrecer consumo en el local");
  // Pero NO bloqueamos, solo advertimos
}
```

---

## 📋 NUEVA ESTRUCTURA DE BusinessModelRegistry.ts

```typescript
// NUEVO: Fulfillment Methods (cómo entregan)
export type FulfillmentMethodId =
  | 'consume_onsite'
  | 'customer_pickup'
  | 'delivery_shipping'
  | 'digital_delivery';

// MODIFICADO: Activities (qué venden)
export type BusinessActivityId =
  | 'sells_physical_products'
  | 'sells_food_dine_in'
  | 'sells_food_takeaway'
  | 'provides_services'
  | 'sells_digital_products';

// NUEVO: Operation Modes (modos especiales)
export type OperationModeId =
  | 'asynchronous_24_7'
  | 'b2b_focused';

// MANTENIDO: Infrastructure
export type InfrastructureId =
  | 'single_location'
  | 'multi_location'
  | 'mobile_business'
  | 'online_only';

// NUEVO: User Profile completo
export interface BusinessModelProfile {
  activities: BusinessActivityId[];
  fulfillmentMethods: FulfillmentMethodId[];
  operationModes: OperationModeId[];
  infrastructure: InfrastructureId;
}
```

---

## ❓ PREGUNTAS FINALES PARA IMPLEMENTACIÓN

### **Pregunta A: Nombres de opciones**
```
¿Te gustan estos nombres o preferís otros?

Paso 1:
- "Comida/bebida para consumir en el local" → ¿OK o cambiar?
- "Comida/bebida para llevar" → ¿OK o "Take away"?

Paso 3:
- "Venta asincrónica 24/7" → ¿OK o "E-commerce 24/7"?
```

### **Pregunta B: Orden de pasos**
```
¿El orden actual tiene sentido?
1. Qué vende
2. Cómo entrega
3. Opciones avanzadas
4. Infraestructura

¿O preferís otro orden?
```

### **Pregunta C: Settings post-setup**
```
¿Dónde puede el usuario activar/desactivar features después?

Opción A) Settings → Business Model (re-hace wizard)
Opción B) Settings → Features (checkboxes directos)
Opción C) Cada módulo tiene su propio "Activar feature"
```

### **Pregunta D: Transición de data**
```
Cuando usuario activa nueva feature (ej: agrega mesas):

¿Debe pasar por setup de esa feature inmediatamente?
- Opción A) Sí, modal con wizard: "Configurá tus mesas ahora"
- Opción B) No, solo activa y muestra en dashboard como milestone pendiente
```

---

## ✅ PRÓXIMOS PASOS

Con tu OK en las 4 preguntas finales, procedo a:

1. ✅ Refactorizar `BusinessModelRegistry.ts`
2. ✅ Actualizar `FeatureRegistry.ts` con nueva lógica
3. ✅ Modificar `BusinessModelStep.tsx` con nuevo wizard
4. ✅ Crear sistema de activación dinámica en settings
5. ✅ Actualizar matriz de milestones según nuevas combinaciones

**Respondé las 4 preguntas editando este doc** y arrancamos con la implementación. 🚀
