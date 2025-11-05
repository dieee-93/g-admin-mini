/**
 * Centralized Zod Schemas
 * Eliminates validation duplication by leveraging Zod with React Hook Form
 */

import { z } from 'zod';

/**
 * Common validation messages in Spanish
 */
export const ValidationMessages = {
  required: 'Este campo es requerido',
  email: 'Ingresa un email válido',
  phone: 'Ingresa un teléfono válido',
  minLength: (min: number) => `Debe tener al menos ${min} caracteres`,
  maxLength: (max: number) => `No puede exceder ${max} caracteres`,
  minValue: (min: number) => `El valor mínimo es ${min}`,
  maxValue: (max: number) => `El valor máximo es ${max}`,
  positive: 'Debe ser un número positivo',
  currency: 'Ingresa un monto válido',
  name: 'Solo se permiten letras, espacios y acentos',
  alphanumeric: 'Solo se permiten letras y números',
  cuit: 'CUIT/CUIL inválido (formato: 20-12345678-9)',
  invalidDate: 'Fecha inválida',
  futureDate: 'La fecha debe ser futura',
  pastDate: 'La fecha debe ser pasada',
  minQuantity: (min: number) => `La cantidad mínima es ${min}`,
  maxQuantity: (max: number) => `La cantidad máxima es ${max}`,
  invalidUrl: 'URL inválida',
  invalidAddress: 'Dirección inválida'
} as const;

/**
 * Base field schemas that can be reused across the application
 */
export const BaseSchemas = {
  // String fields
  requiredString: z.string().min(1, ValidationMessages.required),
  optionalString: z.string().optional(),
  
  // Name fields
  personName: z.string()
    .min(2, ValidationMessages.minLength(2))
    .max(100, ValidationMessages.maxLength(100))
    .regex(/^[a-zA-Z\s\-\'áéíóúÁÉÍÓÚñÑüÜ]+$/, ValidationMessages.name),
  
  optionalPersonName: z.string()
    .min(2, ValidationMessages.minLength(2))
    .max(100, ValidationMessages.maxLength(100))
    .regex(/^[a-zA-Z\s\-\'áéíóúÁÉÍÓÚñÑüÜ]+$/, ValidationMessages.name)
    .optional()
    .or(z.literal('')),
  
  // Contact fields
  email: z.string()
    .min(1, ValidationMessages.required)
    .email(ValidationMessages.email),
  
  optionalEmail: z.string()
    .email(ValidationMessages.email)
    .optional()
    .or(z.literal('')),
  
  phoneAR: z.string()
    .min(1, ValidationMessages.required)
    .regex(/^(\+54\s?)?(\(?\d{2,4}\)?[\s.-]?)?\d{6,8}$/, ValidationMessages.phone),
  
  optionalPhoneAR: z.string()
    .regex(/^(\+54\s?)?(\(?\d{2,4}\)?[\s.-]?)?\d{6,8}$/, ValidationMessages.phone)
    .optional()
    .or(z.literal('')),
  
  // Numeric fields
  positiveNumber: z.number()
    .positive(ValidationMessages.positive),
  
  positiveInt: z.number()
    .int('Debe ser un número entero')
    .positive(ValidationMessages.positive),
  
  currency: z.number()
    .nonnegative('No puede ser negativo')
    .max(999999.99, ValidationMessages.maxValue(999999.99)),
  
  percentage: z.number()
    .min(0, ValidationMessages.minValue(0))
    .max(100, ValidationMessages.maxValue(100)),
  
  // Business fields
  productName: z.string()
    .min(2, ValidationMessages.minLength(2))
    .max(200, ValidationMessages.maxLength(200))
    .regex(/^[a-zA-Z0-9\s\-\.]+$/, ValidationMessages.alphanumeric),
  
  materialName: z.string()
    .min(2, ValidationMessages.minLength(2))
    .max(150, ValidationMessages.maxLength(150)),
  
  description: z.string()
    .max(1000, ValidationMessages.maxLength(1000))
    .optional()
    .or(z.literal('')),
  
  shortDescription: z.string()
    .max(255, ValidationMessages.maxLength(255))
    .optional()
    .or(z.literal('')),
  
  // ID fields
  uuid: z.string().uuid('ID inválido'),
  
  // Dates
  dateString: z.string().min(1, ValidationMessages.required),
  optionalDateString: z.string().optional(),
  
  // Boolean fields
  requiredBoolean: z.boolean(),
  optionalBoolean: z.boolean().optional(),

  // 🆕 Argentina-specific fields
  cuit: z.string()
    .min(1, ValidationMessages.required)
    .regex(/^\d{2}-\d{8}-\d{1}$/, ValidationMessages.cuit),

  optionalCuit: z.string()
    .regex(/^\d{2}-\d{8}-\d{1}$/, ValidationMessages.cuit)
    .optional()
    .or(z.literal('')),

  // 🆕 URL fields
  url: z.string()
    .min(1, ValidationMessages.required)
    .url(ValidationMessages.invalidUrl),

  optionalUrl: z.string()
    .url(ValidationMessages.invalidUrl)
    .optional()
    .or(z.literal('')),

  // 🆕 Quantity fields
  quantity: z.number()
    .int('Debe ser un número entero')
    .min(1, ValidationMessages.minQuantity(1))
    .max(999999, ValidationMessages.maxQuantity(999999)),

  optionalQuantity: z.number()
    .int('Debe ser un número entero')
    .min(0, 'No puede ser negativo')
    .max(999999, ValidationMessages.maxQuantity(999999))
    .optional(),

  // 🆕 Address field
  address: z.string()
    .min(5, ValidationMessages.minLength(5))
    .max(300, ValidationMessages.maxLength(300)),

  optionalAddress: z.string()
    .max(300, ValidationMessages.maxLength(300))
    .optional()
    .or(z.literal('')),
} as const;

/**
 * Commonly used entity schemas
 */
export const EntitySchemas = {
  // Customer schema
  customer: z.object({
    name: BaseSchemas.personName,
    email: BaseSchemas.optionalEmail,
    phone: BaseSchemas.optionalPhoneAR,
    address: z.string()
      .max(200, ValidationMessages.maxLength(200))
      .optional()
      .or(z.literal('')),
    notes: BaseSchemas.shortDescription
  }),

  // Supplier schema
  supplier: z.object({
    name: z.string().min(1, ValidationMessages.required).max(200, ValidationMessages.maxLength(200)),
    contact_person: z.string().max(150, ValidationMessages.maxLength(150)).optional().or(z.literal('')),
    email: BaseSchemas.optionalEmail,
    phone: BaseSchemas.optionalPhoneAR,
    address: z.string().max(500, ValidationMessages.maxLength(500)).optional().or(z.literal('')),
    tax_id: BaseSchemas.optionalCUIT,
    payment_terms: z.string().max(100, ValidationMessages.maxLength(100)).optional().or(z.literal('')),
    rating: z.number().min(1, 'La calificación debe ser entre 1 y 5').max(5, 'La calificación debe ser entre 1 y 5').optional().nullable(),
    notes: BaseSchemas.description,
    is_active: BaseSchemas.requiredBoolean
  }),

  // Material/Item schema (enhanced for G-Admin Mini)
  material: z.object({
    name: BaseSchemas.materialName
      .refine((name) => name.length >= 2, {
        message: 'El nombre debe tener al menos 2 caracteres'
      })
      .refine((name) => name.length <= 100, {
        message: 'El nombre no puede exceder 100 caracteres'
      }),
    type: z.string().min(1, 'Debes seleccionar un tipo de item'),
    category: z.string().optional(),
    unit: z.string().min(1, 'Debes especificar la unidad'),
    initial_stock: z.number()
      .nonnegative('El stock inicial no puede ser negativo')
      .max(1000000, 'Stock inicial demasiado alto'),
    unit_cost: z.number()
      .nonnegative('El costo unitario no puede ser negativo')
      .max(100000, 'Costo unitario demasiado alto'),
    supplier: z.string().optional().or(z.literal('')),
    description: BaseSchemas.description
  })
  .superRefine((data, ctx) => {
    // Conditional validation based on type
    if ((data.type === 'MEASURABLE' || data.type === 'ELABORATED') && !data.unit) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['unit'],
        message: 'Debes especificar la unidad para este tipo de material'
      });
    }
    
    if (data.type === 'MEASURABLE' && !data.category) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['category'],
        message: 'Debes seleccionar una categoría de medición'
      });
    }
  }),
  
  // Product schema
  product: z.object({
    name: BaseSchemas.productName,
    description: BaseSchemas.description,
    price: BaseSchemas.currency,
    category: z.string().min(1, ValidationMessages.required),
    is_active: BaseSchemas.requiredBoolean
  }),
  
  // Employee schema
  employee: z.object({
    name: BaseSchemas.personName,
    email: BaseSchemas.email,
    phone: BaseSchemas.optionalPhoneAR,
    position: z.string().min(1, ValidationMessages.required),
    hourly_rate: BaseSchemas.currency.optional(),
    department: z.string().min(1, ValidationMessages.required),
    hire_date: BaseSchemas.dateString
  }),
  
  // Recipe ingredient schema
  recipeIngredient: z.object({
    item_id: BaseSchemas.uuid,
    quantity: BaseSchemas.positiveNumber,
    unit: z.string().min(1, ValidationMessages.required),
    notes: BaseSchemas.shortDescription
  }),
  
  // Financial transaction schema
  transaction: z.object({
    amount: BaseSchemas.currency,
    description: z.string().min(1, ValidationMessages.required).max(255, ValidationMessages.maxLength(255)),
    category: z.string().min(1, ValidationMessages.required),
    date: BaseSchemas.dateString,
    payment_method: z.enum(['cash', 'card', 'transfer', 'other']),
    reference_number: z.string().optional().or(z.literal(''))
  }),

  // ========================================================================
  // 🔥 NEW SCHEMAS - PHASE 1 (HIGH PRIORITY)
  // ========================================================================

  // 🆕 Staff/Employee schema (PRIORITY: HIGH)
  employeeComplete: z.object({
    employee_id: z.string().min(1, ValidationMessages.required),
    first_name: BaseSchemas.personName,
    last_name: BaseSchemas.personName,
    email: BaseSchemas.email,
    phone: BaseSchemas.optionalPhoneAR,
    position: z.string().min(1, ValidationMessages.required),
    department: z.enum(['kitchen', 'service', 'admin', 'cleaning', 'management'], {
      errorMap: () => ({ message: 'Debes seleccionar un departamento válido' })
    }),
    hire_date: BaseSchemas.dateString,
    employment_type: z.enum(['full_time', 'part_time', 'contractor', 'temp'], {
      errorMap: () => ({ message: 'Debes seleccionar un tipo de empleo válido' })
    }),
    employment_status: z.enum(['active', 'inactive', 'terminated', 'on_leave']),
    salary: BaseSchemas.currency.optional(),
    hourly_rate: BaseSchemas.currency.optional(),
    weekly_hours: z.number()
      .int('Debe ser un número entero')
      .min(0, 'No puede ser negativo')
      .max(168, 'Máximo 168 horas por semana')
      .optional(),
    role: z.enum(['admin', 'manager', 'supervisor', 'employee']),
    home_location_id: BaseSchemas.uuid.optional(),
    can_work_multiple_locations: z.boolean()
  }),

  // 🆕 Sale schema (PRIORITY: HIGH)
  sale: z.object({
    location_id: BaseSchemas.uuid.optional(),
    customer_id: BaseSchemas.uuid.optional(),
    table_id: BaseSchemas.uuid.optional(),
    order_type: z.enum(['dine_in', 'takeout', 'delivery', 'pickup', 'catering']),
    fulfillment_type: z.enum(['dine_in', 'takeout', 'delivery', 'pickup']),
    payment_method: z.string().min(1, ValidationMessages.required),
    note: BaseSchemas.shortDescription,
    special_instructions: z.array(z.string()).optional(),
    // Financial totals (calculated fields, optional for form initialization)
    subtotal: BaseSchemas.currency.optional(),
    tax_amount: BaseSchemas.currency.optional(),
    total: BaseSchemas.currency.optional(),
    items: z.array(z.object({
      product_id: BaseSchemas.uuid,
      quantity: BaseSchemas.quantity,
      unit_price: BaseSchemas.currency,
      line_total: BaseSchemas.currency.optional(), // Calculated: quantity * unit_price
      special_instructions: z.string().optional()
    })).min(1, 'Debes agregar al menos un producto')
  })
  .superRefine((data, ctx) => {
    // Cart validation: calculate total
    const total = data.items.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0);

    if (total <= 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['items'],
        message: 'El total de la venta debe ser mayor a cero'
      });
    }

    // Validate delivery requires address
    if (data.fulfillment_type === 'delivery' && !data.customer_id) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['customer_id'],
        message: 'Debes seleccionar un cliente para entregas a domicilio'
      });
    }
  }),

  // 🆕 Fiscal Document schema (PRIORITY: HIGH)
  fiscalDocument: z.object({
    document_type: z.enum(['factura_a', 'factura_b', 'factura_c', 'nota_credito', 'nota_debito'], {
      errorMap: () => ({ message: 'Tipo de comprobante inválido' })
    }),
    point_of_sale: z.number()
      .int('Debe ser un número entero')
      .min(1, 'Punto de venta inválido')
      .max(9999, 'Punto de venta inválido'),
    document_number: z.number()
      .int('Debe ser un número entero')
      .min(1, 'Número de comprobante inválido'),
    issue_date: BaseSchemas.dateString,
    customer_name: BaseSchemas.personName,
    customer_cuit: BaseSchemas.cuit,
    customer_address: BaseSchemas.address,
    subtotal: BaseSchemas.currency,
    iva_amount: BaseSchemas.currency,
    total: BaseSchemas.currency,
    cae: z.string()
      .length(14, 'El CAE debe tener 14 dígitos')
      .regex(/^\d{14}$/, 'El CAE debe contener solo números'),
    cae_expiration: BaseSchemas.dateString,
    items: z.array(z.object({
      description: z.string().min(1, ValidationMessages.required),
      quantity: BaseSchemas.quantity,
      unit_price: BaseSchemas.currency,
      iva_rate: BaseSchemas.percentage,
      subtotal: BaseSchemas.currency
    })).min(1, 'Debes agregar al menos un ítem')
  })
  .superRefine((data, ctx) => {
    // Validate totals match
    const calculatedSubtotal = data.items.reduce((sum, item) => sum + item.subtotal, 0);

    if (Math.abs(calculatedSubtotal - data.subtotal) > 0.01) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['subtotal'],
        message: 'El subtotal no coincide con la suma de los ítems'
      });
    }

    const calculatedTotal = data.subtotal + data.iva_amount;
    if (Math.abs(calculatedTotal - data.total) > 0.01) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['total'],
        message: 'El total no coincide con subtotal + IVA'
      });
    }
  }),

  // ========================================================================
  // 🔥 NEW SCHEMAS - PHASE 2 (MEDIUM PRIORITY)
  // ========================================================================

  // 🆕 Supplier Order schema
  supplierOrder: z.object({
    supplier_id: BaseSchemas.uuid,
    order_date: BaseSchemas.dateString,
    expected_delivery_date: BaseSchemas.dateString,
    status: z.enum(['pending', 'confirmed', 'in_transit', 'received', 'cancelled']),
    payment_terms: z.enum(['cash', 'credit_7', 'credit_15', 'credit_30', 'credit_60']).optional(),
    notes: BaseSchemas.description,
    items: z.array(z.object({
      material_id: BaseSchemas.uuid,
      quantity: BaseSchemas.quantity,
      unit_price: BaseSchemas.currency,
      total: BaseSchemas.currency
    })).min(1, 'Debes agregar al menos un material')
  })
  .superRefine((data, ctx) => {
    // Validate expected delivery date is future
    const orderDate = new Date(data.order_date);
    const deliveryDate = new Date(data.expected_delivery_date);

    if (deliveryDate < orderDate) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['expected_delivery_date'],
        message: 'La fecha de entrega debe ser posterior a la fecha del pedido'
      });
    }
  }),

  // 🆕 Inventory Transfer schema
  inventoryTransfer: z.object({
    from_location_id: BaseSchemas.uuid,
    to_location_id: BaseSchemas.uuid,
    item_id: BaseSchemas.uuid,
    quantity: BaseSchemas.quantity,
    reason: z.string().min(1, ValidationMessages.required).max(100, ValidationMessages.maxLength(100)),
    notes: BaseSchemas.description,
    requested_by: z.string().min(1, ValidationMessages.required),
    status: z.enum(['pending', 'in_transit', 'completed', 'cancelled']),
    transfer_date: BaseSchemas.dateString.optional()
  })
  .superRefine((data, ctx) => {
    // Validate different locations
    if (data.from_location_id === data.to_location_id) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['to_location_id'],
        message: 'La ubicación de destino debe ser diferente a la de origen'
      });
    }
  }),

  // 🆕 Address schema (reusable for customers, suppliers, etc.)
  addressComplete: z.object({
    street: z.string().min(3, ValidationMessages.minLength(3)).max(200, ValidationMessages.maxLength(200)),
    number: z.string().min(1, ValidationMessages.required),
    floor: z.string().optional().or(z.literal('')),
    apartment: z.string().optional().or(z.literal('')),
    neighborhood: z.string().optional().or(z.literal('')),
    city: z.string().min(2, ValidationMessages.minLength(2)),
    state: z.string().min(2, ValidationMessages.minLength(2)),
    postal_code: z.string().min(4, ValidationMessages.minLength(4)).max(8, ValidationMessages.maxLength(8)),
    country: z.string(),
    latitude: z.number().min(-90).max(90).optional(),
    longitude: z.number().min(-180).max(180).optional(),
    delivery_instructions: BaseSchemas.shortDescription
  }),

  // 🆕 Scheduling/Shift schema
  shift: z.object({
    employee_id: BaseSchemas.uuid,
    start_time: z.string().regex(/^\d{2}:\d{2}$/, 'Formato inválido (HH:MM)'),
    end_time: z.string().regex(/^\d{2}:\d{2}$/, 'Formato inválido (HH:MM)'),
    date: BaseSchemas.dateString,
    position: z.string().min(1, ValidationMessages.required),
    location_id: BaseSchemas.uuid.optional(),
    notes: BaseSchemas.shortDescription,
    status: z.enum(['scheduled', 'confirmed', 'in_progress', 'completed', 'cancelled'])
  })
  .superRefine((data, ctx) => {
    // Validate end time is after start time
    const [startHour, startMin] = data.start_time.split(':').map(Number);
    const [endHour, endMin] = data.end_time.split(':').map(Number);

    const startMinutes = startHour * 60 + startMin;
    const endMinutes = endHour * 60 + endMin;

    if (endMinutes <= startMinutes) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['end_time'],
        message: 'La hora de finalización debe ser posterior a la de inicio'
      });
    }
  }),

  // ========================================================================
  // 🔥 NEW SCHEMAS - PHASE 3 (LOW PRIORITY)
  // ========================================================================

  // 🆕 Asset schema
  asset: z.object({
    name: z.string().min(2, ValidationMessages.minLength(2)).max(150, ValidationMessages.maxLength(150)),
    asset_type: z.enum(['equipment', 'furniture', 'vehicle', 'technology', 'other']),
    purchase_date: BaseSchemas.dateString,
    purchase_price: BaseSchemas.currency,
    current_value: BaseSchemas.currency.optional(),
    depreciation_rate: BaseSchemas.percentage.optional(),
    location_id: BaseSchemas.uuid.optional(),
    status: z.enum(['active', 'maintenance', 'retired', 'disposed']),
    serial_number: z.string().optional().or(z.literal('')),
    description: BaseSchemas.description
  }),

  // 🆕 Rental schema
  rental: z.object({
    customer_id: BaseSchemas.uuid,
    item_name: z.string().min(2, ValidationMessages.minLength(2)),
    start_date: BaseSchemas.dateString,
    end_date: BaseSchemas.dateString,
    daily_rate: BaseSchemas.currency,
    deposit_amount: BaseSchemas.currency.optional(),
    status: z.enum(['reserved', 'active', 'completed', 'cancelled']),
    notes: BaseSchemas.description
  })
  .superRefine((data, ctx) => {
    // Validate end date is after start date
    const startDate = new Date(data.start_date);
    const endDate = new Date(data.end_date);

    if (endDate <= startDate) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['end_date'],
        message: 'La fecha de finalización debe ser posterior a la de inicio'
      });
    }
  }),

  // 🆕 Membership schema
  membership: z.object({
    customer_id: BaseSchemas.uuid,
    membership_type: z.enum(['basic', 'premium', 'vip']),
    start_date: BaseSchemas.dateString,
    end_date: BaseSchemas.dateString.optional(),
    monthly_fee: BaseSchemas.currency,
    payment_method: z.enum(['cash', 'card', 'transfer', 'debit']),
    auto_renew: z.boolean(),
    status: z.enum(['active', 'suspended', 'cancelled', 'expired']),
    benefits: z.array(z.string()).optional()
  }),

  // 🆕 Recurring Billing schema
  recurringBilling: z.object({
    customer_id: BaseSchemas.uuid,
    service_description: z.string().min(1, ValidationMessages.required),
    amount: BaseSchemas.currency,
    frequency: z.enum(['daily', 'weekly', 'monthly', 'quarterly', 'yearly']),
    start_date: BaseSchemas.dateString,
    end_date: BaseSchemas.dateString.optional(),
    payment_method: z.enum(['cash', 'card', 'transfer', 'debit']),
    auto_charge: z.boolean(),
    status: z.enum(['active', 'paused', 'cancelled']),
    next_billing_date: BaseSchemas.dateString
  }),

  // 🆕 Payment Integration schema
  paymentIntegration: z.object({
    provider: z.enum(['mercadopago', 'modo', 'stripe', 'paypal', 'other']),
    api_key: z.string().min(10, 'La API key debe tener al menos 10 caracteres'),
    api_secret: z.string().min(10, 'El API secret debe tener al menos 10 caracteres'),
    webhook_url: BaseSchemas.url.optional(),
    is_production: z.boolean(),
    enabled: z.boolean(),
    supported_methods: z.array(z.enum(['card', 'qr', 'transfer', 'cash'])).min(1, 'Debes seleccionar al menos un método'),
    configuration: z.record(z.string(), z.any()).optional()
  }),

  // 🆕 Driver Assignment schema
  driverAssignment: z.object({
    order_id: BaseSchemas.uuid,
    driver_id: BaseSchemas.uuid,
    assigned_at: BaseSchemas.dateString,
    estimated_delivery_time: z.string().regex(/^\d{2}:\d{2}$/, 'Formato inválido (HH:MM)'),
    status: z.enum(['assigned', 'picked_up', 'in_transit', 'delivered', 'cancelled']),
    pickup_location: BaseSchemas.address.optional(),
    delivery_location: BaseSchemas.address,
    notes: BaseSchemas.shortDescription
  }),

  // 🆕 Report Configuration schema
  reportConfig: z.object({
    report_name: z.string().min(2, ValidationMessages.minLength(2)),
    report_type: z.enum(['sales', 'inventory', 'staff', 'financial', 'custom']),
    date_range: z.enum(['today', 'week', 'month', 'quarter', 'year', 'custom']),
    custom_start_date: BaseSchemas.optionalDateString,
    custom_end_date: BaseSchemas.optionalDateString,
    filters: z.record(z.string(), z.any()).optional(),
    columns: z.array(z.string()).min(1, 'Debes seleccionar al menos una columna'),
    format: z.enum(['pdf', 'excel', 'csv']),
    schedule: z.enum(['manual', 'daily', 'weekly', 'monthly']),
    recipients: z.array(BaseSchemas.email).optional()
  })
  .superRefine((data, ctx) => {
    // Validate custom date range
    if (data.date_range === 'custom' && (!data.custom_start_date || !data.custom_end_date)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['date_range'],
        message: 'Debes especificar fechas de inicio y fin para rango personalizado'
      });
    }
  })
} as const;

/**
 * Form-specific schemas with different validation rules
 */
export const FormSchemas = {
  // Login form
  login: z.object({
    email: BaseSchemas.email,
    password: z.string().min(1, ValidationMessages.required)
  }),
  
  // Quick customer creation (fewer required fields)
  quickCustomer: z.object({
    name: BaseSchemas.personName,
    phone: BaseSchemas.phoneAR
  }),
  
  // Material quick entry
  quickMaterial: z.object({
    name: BaseSchemas.materialName,
    unit: z.string().min(1, ValidationMessages.required),
    cost: BaseSchemas.currency
  }),
  
  // Recipe basic info
  recipeBasic: z.object({
    name: BaseSchemas.productName,
    servings: BaseSchemas.positiveInt,
    prep_time: BaseSchemas.positiveInt.optional(),
    description: BaseSchemas.description
  }),
  
  // Search/filter forms
  searchFilter: z.object({
    query: z.string().optional().or(z.literal('')),
    category: z.string().optional().or(z.literal('')),
    date_from: BaseSchemas.optionalDateString,
    date_to: BaseSchemas.optionalDateString,
    min_amount: z.number().nonnegative('No puede ser negativo').optional(),
    max_amount: z.number().nonnegative('No puede ser negativo').optional()
  })
} as const;

/**
 * Utility function to create conditional schemas
 */
export function createConditionalSchema<T extends z.ZodRawShape>(
  baseSchema: z.ZodObject<T>,
  condition: (data: z.infer<z.ZodObject<T>>) => boolean,
  additionalRules: z.ZodObject<any>
) {
  return baseSchema.superRefine((data, ctx) => {
    if (condition(data)) {
      const result = additionalRules.safeParse(data);
      if (!result.success) {
        result.error.errors.forEach(error => {
          ctx.addIssue(error);
        });
      }
    }
  });
}

/**
 * Utility to transform form data before validation
 */
export const DataTransformers = {
  trimStrings: <T extends Record<string, any>>(data: T): T => {
    const result = { ...data };
    Object.keys(result).forEach(key => {
      if (typeof result[key] === 'string') {
        result[key] = result[key].trim();
      }
    });
    return result;
  },
  
  numberify: <T extends Record<string, any>>(data: T, fields: (keyof T)[]): T => {
    const result = { ...data };
    fields.forEach(field => {
      if (result[field] && typeof result[field] === 'string') {
        const num = Number(result[field]);
        if (!isNaN(num)) {
          result[field] = num as T[keyof T];
        }
      }
    });
    return result;
  },
  
  emptyStringToUndefined: <T extends Record<string, any>>(data: T): T => {
    const result = { ...data };
    Object.keys(result).forEach(key => {
      if (result[key] === '') {
        result[key] = undefined;
      }
    });
    return result;
  }
} as const;

/**
 * Type helpers for React Hook Form integration
 */
export type SchemaType<T extends z.ZodType> = z.infer<T>;

// Existing types
export type CustomerFormData = SchemaType<typeof EntitySchemas.customer>;
export type SupplierFormData = SchemaType<typeof EntitySchemas.supplier>;
export type MaterialFormData = SchemaType<typeof EntitySchemas.material>;
export type ProductFormData = SchemaType<typeof EntitySchemas.product>;
export type EmployeeFormData = SchemaType<typeof EntitySchemas.employee>;
export type LoginFormData = SchemaType<typeof FormSchemas.login>;

// 🆕 NEW TYPES - Phase 1 (High Priority)
export type EmployeeCompleteFormData = SchemaType<typeof EntitySchemas.employeeComplete>;
export type SaleFormData = SchemaType<typeof EntitySchemas.sale>;
export type FiscalDocumentFormData = SchemaType<typeof EntitySchemas.fiscalDocument>;

// 🆕 NEW TYPES - Phase 2 (Medium Priority)
export type SupplierOrderFormData = SchemaType<typeof EntitySchemas.supplierOrder>;
export type InventoryTransferFormData = SchemaType<typeof EntitySchemas.inventoryTransfer>;
export type AddressFormData = SchemaType<typeof EntitySchemas.addressComplete>;
export type ShiftFormData = SchemaType<typeof EntitySchemas.shift>;

// 🆕 NEW TYPES - Phase 3 (Low Priority)
export type AssetFormData = SchemaType<typeof EntitySchemas.asset>;
export type RentalFormData = SchemaType<typeof EntitySchemas.rental>;
export type MembershipFormData = SchemaType<typeof EntitySchemas.membership>;
export type RecurringBillingFormData = SchemaType<typeof EntitySchemas.recurringBilling>;
export type PaymentIntegrationFormData = SchemaType<typeof EntitySchemas.paymentIntegration>;
export type DriverAssignmentFormData = SchemaType<typeof EntitySchemas.driverAssignment>;
export type ReportConfigFormData = SchemaType<typeof EntitySchemas.reportConfig>;

/**
 * Common Zod resolver configurations for React Hook Form
 */
export const getZodResolver = (schema: z.ZodType) => {
  return {
    resolver: async (data: any) => {
      try {
        const result = schema.parse(data);
        return { values: result, errors: {} };
      } catch (error) {
        if (error instanceof z.ZodError) {
          const errors: Record<string, { type: string; message: string }> = {};
          error.errors.forEach(err => {
            const path = err.path.join('.');
            errors[path] = {
              type: err.code,
              message: err.message
            };
          });
          return { values: {}, errors };
        }
        throw error;
      }
    }
  };
};