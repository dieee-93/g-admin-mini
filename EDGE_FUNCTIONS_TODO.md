# Planificación de Edge Functions (Backend)

Este documento describe las especificaciones para las futuras Edge Functions de Supabase. El objetivo es mover toda la lógica de negocio crítica al backend para que actúe como la única fuente de verdad (`Single Source of Truth`), garantizando la integridad, seguridad y consistencia de los datos.

El frontend realizará cálculos "optimistas" para la UI, pero **nunSW-Admin** enviará los datos de entrada brutos (la "intención" del usuario) a estas funciones. Las funciones ejecutarán la lógica de negocio autoritativa, persistirán los datos correctos en la base de datos y devolverán el resultado verificado.

---

## 1. Función: `create-sale`

- **Propósito:** Gestionar la creación de una nueva venta. Esta es la función más crítica para garantizar que los totales, impuestos y el stock se calculen y actualicen correctamente sin confiar nunca en el cliente.
- **Input (Payload):**
  ```json
  {
    "customerId": "uuid-del-cliente" | null,
    "items": [
      {
        "productId": "uuid-del-producto",
        "quantity": 2,
        "unitPrice": 550.00 // El precio unitario al momento de la venta
      }
    ],
    "note": "string" | null
  }
  ```
- **Lógica Central:**
  1. Recibir el payload.
  2. **Ignorar cualquier total que el cliente pueda haber enviado.**
  3. Para cada item, verificar la disponibilidad de stock usando una función de base de datos. Si no hay stock, devolver un error.
  4. Calcular el subtotal sumando `quantity * unitPrice` para cada item. Utilizar la lógica de `Decimal.js` que ahora está centralizada.
  5. **Invocar el `taxService` del backend** (una versión portada de `taxCalculationService.ts`) para calcular los impuestos autoritativos sobre el subtotal.
  6. Calcular el total final (subtotal + impuestos).
  7. Crear el registro de la venta (`sales`) en la base de datos con los totales calculados en el backend.
  8. Crear los registros de los items de la venta (`sale_items`).
  9. Invocar una función de base de datos (`adjust_stock_after_sale`) para disminuir el stock de los productos vendidos.
  10. Emitir un evento de `SALE_COMPLETED` en el bus de eventos del backend si existe.
- **Output (Success):**
  ```json
  {
    "success": true,
    "saleId": "uuid-de-la-nueva-venta",
    "totalAmount": 665.50,
    "subtotal": 550.00,
    "taxes": 115.50
  }
  ```
- **Output (Error):**
  ```json
  {
    "success": false,
    "error": "insufficient_stock",
    "message": "No hay suficiente stock para el producto 'Coca-Cola'",
    "productId": "uuid-del-producto-fallido"
  }
  ```

---

## 2. Función: `adjust-inventory`

- **Propósito:** Centralizar todos los ajustes de inventario manuales (por ejemplo, por rotura, merma, o conteo físico) para asegurar que cada cambio en el stock quede registrado y auditado.
- **Input (Payload):**
  ```json
  {
    "itemId": "uuid-del-material",
    "adjustment": -5.5, // Cantidad a ajustar (puede ser positiva o negativa)
    "reason": "breakage" | "waste" | "physical_count" | "other",
    "notes": "Se cayeron 3 botellas y 2 se vencieron." | null
  }
  ```
- **Lógica Central:**
  1. Recibir el payload.
  2. Validar que el `itemId` y `reason` sean válidos.
  3. Iniciar una transacción en la base de datos.
  4. Obtener el stock actual del item.
  5. Calcular el nuevo stock (`currentStock + adjustment`) usando `Decimal.js`.
  6. **Validar que el nuevo stock no sea negativo** si la configuración del negocio no lo permite.
  7. Actualizar el campo `stock` en la tabla `materials`.
  8. Crear un registro en una tabla de auditoría de inventario (`inventory_log`) con el `itemId`, la cantidad ajustada, la razón, las notas y el usuario que realizó la acción.
  9. Finalizar la transacción.
- **Output (Success):**
  ```json
  {
    "success": true,
    "itemId": "uuid-del-material",
    "newStock": 94.5
  }
  ```
- **Output (Error):**
  ```json
  {
    "success": false,
    "error": "negative_stock_not_allowed",
    "message": "El ajuste resultaría en stock negativo."
  }
  ```

---

## 3. Función: `calculate-recipe-cost`

- **Propósito:** Calcular el costo autoritativo de una receta o producto elaborado. Este cálculo debe vivir en el backend para asegurar que siempre utiliza los costos más recientes de los materiales, no los costos que el cliente pueda tener en su estado local.
- **Input (Payload):**
  ```json
  {
    "recipeId": "uuid-de-la-receta"
  }
  ```
- **Lógica Central:**
  1. Recibir el `recipeId`.
  2. Consultar la base de datos para obtener todos los ingredientes (`recipe_items`) de esa receta, incluyendo la cantidad requerida de cada uno.
  3. Para cada ingrediente, obtener su `unit_cost` actual desde la tabla `materials`.
  4. **Utilizar la lógica de `Decimal.js`** para calcular el costo de cada ingrediente (`quantity_required * unit_cost`).
  5. Sumar los costos de todos los ingredientes para obtener el costo total de la receta.
  6. Opcionalmente, añadir otros costos (mano de obra, overhead) si el modelo de datos lo soporta.
  7. Devolver el costo calculado. Esta función puede ser de solo lectura y no necesita escribir en la base de datos, a menos que se quiera cachear el resultado.
- **Output (Success):**
  ```json
  {
    "success": true,
    "recipeId": "uuid-de-la-receta",
    "totalCost": 125.78,
    "breakdown": [
      { "materialId": "uuid-harina", "cost": 15.50 },
      { "materialId": "uuid-tomate", "cost": 40.28 },
      { "materialId": "uuid-queso", "cost": 70.00 }
    ]
  }
  ```
- **Output (Error):**
  ```json
  {
    "success": false,
    "error": "recipe_not_found",
    "message": "La receta especificada no existe."
  }
  ```
