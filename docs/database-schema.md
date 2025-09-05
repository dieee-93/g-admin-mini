# G-Admin Mini: Database Schema - Referencia Completa v3.0

**Fecha de actualización:** 20 de Agosto, 2025  
**Versión:** 3.0

## Resumen del Schema

Este documento describe la estructura completa de la base de datos PostgreSQL para la plataforma de gestión de negocio G-admin-mini, incluyendo todas las funcionalidades de restaurante, POS, analytics y gestión de clientes.

### Entidades Principales
- **Inventory Management**: Items, Stock, Recipes, Products
- **Restaurant Operations**: Tables, Parties, Orders, QR Ordering  
- **Sales & Payments**: Sales, Payment Methods, Bill Splitting
- **Customer Intelligence**: Customer Analytics, RFM Profiles
- **Analytics & Performance**: Daily Analytics, Menu Performance
- **Async Operations**: Background Processing, Dead Letter Queue
- **POS System**: Advanced Order Processing, Table Management
- **Financial**: AFIP Integration, Invoices, Tax Reports

---

## 📦 Inventory Management

### Items (Insumos y Materias Primas)

```sql
CREATE TABLE public.items (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name character varying NOT NULL,
  type text NOT NULL CHECK (type = ANY (ARRAY['MEASURABLE'::text, 'COUNTABLE'::text, 'ELABORATED'::text])),
  stock numeric NOT NULL DEFAULT 0,
  unit_cost numeric DEFAULT 0,
  unit character varying NOT NULL,
  category text CHECK (category = ANY (ARRAY['weight'::text, 'volume'::text, 'length'::text])),
  precision_digits integer DEFAULT 2,
  package_size integer,
  package_unit character varying,
  package_cost numeric,
  display_mode text CHECK (display_mode = ANY (ARRAY['individual'::text, 'packaged'::text, 'both'::text])),
  recipe_id uuid,
  requires_production boolean DEFAULT false,
  auto_calculate_cost boolean DEFAULT false,
  ingredients_available boolean DEFAULT false,
  production_time integer,
  batch_size numeric,
  min_stock numeric DEFAULT 0,
  max_stock numeric,
  location character varying,
  notes text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT items_pkey PRIMARY KEY (id)
);
```

### Stock Entries (Movimientos de Stock)

```sql
CREATE TABLE public.stock_entries (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  item_id uuid NOT NULL,
  supplier_id uuid,
  quantity numeric NOT NULL,
  unit_cost numeric DEFAULT 0,
  entry_type text DEFAULT 'purchase'::text CHECK (entry_type = ANY (ARRAY['purchase'::text, 'production'::text, 'adjustment'::text, 'return'::text])),
  batch_number character varying,
  expiry_date date,
  purchase_date date DEFAULT CURRENT_DATE,
  invoice_number text,
  delivery_date date,
  quality_rating smallint CHECK (quality_rating >= 1 AND quality_rating <= 5),
  note text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT stock_entries_pkey PRIMARY KEY (id),
  CONSTRAINT stock_entries_supplier_id_fkey FOREIGN KEY (supplier_id) REFERENCES public.suppliers(id),
  CONSTRAINT stock_entries_item_id_fkey FOREIGN KEY (item_id) REFERENCES public.items(id)
);
```

### Suppliers (Proveedores)

```sql
CREATE TABLE public.suppliers (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name text NOT NULL CHECK (TRIM(BOTH FROM name) <> ''::text),
  contact_person text,
  email text CHECK (email IS NULL OR email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'::text),
  phone text,
  address text,
  tax_id text,
  payment_terms text DEFAULT '30 días'::text,
  rating numeric CHECK (rating >= 1::numeric AND rating <= 5::numeric),
  notes text,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT suppliers_pkey PRIMARY KEY (id)
);
```

### Categories (Categorías)

```sql
CREATE TABLE public.categories (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name character varying NOT NULL UNIQUE,
  description text,
  color character varying,
  icon character varying,
  sort_order integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT categories_pkey PRIMARY KEY (id)
);
```

---

## 🧾 Recipes & Products

### Recipes (Recetas)

```sql
CREATE TABLE public.recipes (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name text NOT NULL,
  output_item_id uuid,
  output_quantity integer NOT NULL,
  created_at timestamp without time zone DEFAULT now(),
  description text,
  difficulty_level text,
  recipe_category text,
  kitchen_station text,
  base_cost numeric DEFAULT 0.00,
  yield_percentage numeric DEFAULT 100.0,
  updated_at timestamp without time zone DEFAULT now(),
  preparation_time integer,
  menu_category text,
  popularity_score numeric DEFAULT 0.0,
  profitability_score numeric DEFAULT 0.0,
  labor_cost numeric DEFAULT 0.00,
  overhead_cost numeric DEFAULT 0.00,
  instructions text,
  serving_size integer DEFAULT 1,
  allergens ARRAY DEFAULT '{}'::text[],
  dietary_tags ARRAY DEFAULT '{}'::text[],
  image_url text,
  waste_percentage numeric DEFAULT 5.0,
  packaging_cost numeric DEFAULT 0.00,
  nutritional_info jsonb DEFAULT '{}'::jsonb,
  temperature_requirements jsonb DEFAULT '{}'::jsonb,
  shelf_life interval DEFAULT '24:00:00'::interval,
  quality_checks ARRAY DEFAULT '{}'::text[],
  CONSTRAINT recipes_pkey PRIMARY KEY (id)
);
```

### Recipe Ingredients (Ingredientes de Recetas)

```sql
CREATE TABLE public.recipe_ingredients (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  recipe_id uuid,
  item_id uuid,
  quantity integer NOT NULL,
  conversion_factor numeric DEFAULT 1.0,
  yield_percentage numeric DEFAULT 100.0,
  waste_percentage numeric DEFAULT 0.0,
  unit_cost_override numeric,
  CONSTRAINT recipe_ingredients_pkey PRIMARY KEY (id),
  CONSTRAINT recipe_ingredients_recipe_id_fkey FOREIGN KEY (recipe_id) REFERENCES public.recipes(id)
);
```

### Products (Productos)

```sql
CREATE TABLE public.products (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name character varying NOT NULL,
  description text,
  price numeric NOT NULL DEFAULT 0,
  category character varying,
  is_active boolean DEFAULT true,
  requires_ingredients boolean DEFAULT false,
  preparation_time integer,
  calories integer,
  allergens ARRAY,
  image_url text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT products_pkey PRIMARY KEY (id)
);
```

### Product Components (Componentes de Productos)

```sql
CREATE TABLE public.product_components (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL,
  item_id uuid NOT NULL,
  quantity_required numeric NOT NULL,
  unit character varying,
  is_optional boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT product_components_pkey PRIMARY KEY (id),
  CONSTRAINT product_components_item_id_fkey FOREIGN KEY (item_id) REFERENCES public.items(id),
  CONSTRAINT product_components_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id)
);
```

---

## 🍽️ Restaurant Operations

### Tables (Gestión de Mesas)

```sql
CREATE TABLE public.tables (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  number integer NOT NULL UNIQUE,
  name character varying,
  capacity integer NOT NULL DEFAULT 4,
  section character varying,
  status text DEFAULT 'available'::text CHECK (status = ANY (ARRAY['available'::text, 'occupied'::text, 'reserved'::text, 'maintenance'::text])),
  location_x numeric,
  location_y numeric,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT tables_pkey PRIMARY KEY (id)
);
```

### Parties (Grupos de Clientes)

```sql
CREATE TABLE public.parties (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  table_id uuid NOT NULL,
  customer_id uuid,
  party_size integer NOT NULL,
  status text DEFAULT 'waiting'::text CHECK (status = ANY (ARRAY['waiting'::text, 'seated'::text, 'dining'::text, 'paying'::text, 'completed'::text])),
  seated_at timestamp with time zone,
  completed_at timestamp with time zone,
  estimated_duration integer,
  actual_duration integer,
  notes text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT parties_pkey PRIMARY KEY (id),
  CONSTRAINT parties_table_id_fkey FOREIGN KEY (table_id) REFERENCES public.tables(id),
  CONSTRAINT parties_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES public.customers(id)
);
```

### Orders (Órdenes)

```sql
CREATE TABLE public.orders (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  order_number character varying NOT NULL UNIQUE,
  sale_id uuid,
  table_id uuid,
  customer_id uuid,
  party_id uuid,
  status text NOT NULL DEFAULT 'pending'::text CHECK (status = ANY (ARRAY['pending'::text, 'confirmed'::text, 'preparing'::text, 'ready'::text, 'served'::text, 'completed'::text, 'cancelled'::text, 'refunded'::text])),
  order_type text NOT NULL CHECK (order_type = ANY (ARRAY['dine_in'::text, 'takeout'::text, 'delivery'::text, 'pickup'::text, 'catering'::text, 'drive_thru'::text])),
  fulfillment_type text NOT NULL CHECK (fulfillment_type = ANY (ARRAY['dine_in'::text, 'takeout'::text, 'delivery'::text, 'pickup'::text, 'curbside'::text])),
  priority_level text DEFAULT 'normal'::text CHECK (priority_level = ANY (ARRAY['low'::text, 'normal'::text, 'high'::text, 'rush'::text, 'vip'::text, 'urgent'::text])),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  estimated_ready_time timestamp with time zone,
  actual_ready_time timestamp with time zone,
  pickup_time timestamp with time zone,
  completed_at timestamp with time zone,
  preparation_time interval,
  kitchen_notes text,
  special_instructions ARRAY DEFAULT '{}'::text[],
  allergy_warnings ARRAY DEFAULT '{}'::text[],
  dietary_requirements ARRAY DEFAULT '{}'::text[],
  subtotal numeric NOT NULL DEFAULT 0.00,
  taxes numeric NOT NULL DEFAULT 0.00,
  tips numeric NOT NULL DEFAULT 0.00,
  discounts numeric NOT NULL DEFAULT 0.00,
  total numeric NOT NULL DEFAULT 0.00,
  customer_rating smallint CHECK (customer_rating >= 1 AND customer_rating <= 10),
  feedback text,
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT orders_pkey PRIMARY KEY (id)
);
```

### Order Items (Items de Órdenes)

```sql
CREATE TABLE public.order_items (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL,
  product_id uuid NOT NULL,
  quantity smallint NOT NULL CHECK (quantity > 0),
  unit_price numeric NOT NULL CHECK (unit_price >= 0::numeric),
  line_total numeric NOT NULL DEFAULT 0.00,
  status text DEFAULT 'pending'::text CHECK (status = ANY (ARRAY['pending'::text, 'in_progress'::text, 'ready'::text, 'served'::text, 'cancelled'::text])),
  station_assigned text CHECK (station_assigned = ANY (ARRAY['cold_station'::text, 'hot_station'::text, 'grill'::text, 'fryer'::text, 'dessert'::text, 'bar'::text, 'prep'::text])),
  preparation_time_estimate interval DEFAULT '00:15:00'::interval,
  actual_prep_time interval,
  special_instructions text,
  allergy_warnings ARRAY DEFAULT '{}'::text[],
  modifications ARRAY DEFAULT '{}'::text[],
  temperature_preference text CHECK (temperature_preference = ANY (ARRAY['rare'::text, 'medium_rare'::text, 'medium'::text, 'medium_well'::text, 'well_done'::text, 'extra_hot'::text, 'warm'::text, 'cold'::text])),
  spice_level smallint CHECK (spice_level >= 0 AND spice_level <= 10),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  started_prep_at timestamp with time zone,
  ready_at timestamp with time zone,
  served_at timestamp with time zone,
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT order_items_pkey PRIMARY KEY (id),
  CONSTRAINT order_items_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(id)
);
```

---

## 🛒 QR Ordering System

### QR Orders (Órdenes por QR)

```sql
CREATE TABLE public.qr_orders (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  table_id uuid NOT NULL,
  qr_code text NOT NULL UNIQUE,
  session_token text NOT NULL UNIQUE,
  status text DEFAULT 'active'::text CHECK (status = ANY (ARRAY['active'::text, 'expired'::text, 'completed'::text, 'cancelled'::text])),
  customer_name text,
  customer_phone character varying,
  customer_email character varying,
  party_size smallint CHECK (party_size >= 1 AND party_size <= 20),
  special_requests text,
  dietary_restrictions ARRAY DEFAULT '{}'::text[],
  allergy_warnings ARRAY DEFAULT '{}'::text[],
  service_preference text CHECK (service_preference = ANY (ARRAY['standard'::text, 'quick'::text, 'leisurely'::text, 'family_friendly'::text])),
  subtotal numeric NOT NULL DEFAULT 0.00,
  estimated_total numeric NOT NULL DEFAULT 0.00,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  expires_at timestamp with time zone NOT NULL,
  submitted_at timestamp with time zone,
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT qr_orders_pkey PRIMARY KEY (id)
);
```

### QR Order Items (Items de Órdenes QR)

```sql
CREATE TABLE public.qr_order_items (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  qr_order_id uuid NOT NULL,
  product_id uuid NOT NULL,
  quantity smallint NOT NULL CHECK (quantity > 0),
  unit_price numeric NOT NULL CHECK (unit_price >= 0::numeric),
  line_total numeric NOT NULL DEFAULT 0.00,
  special_instructions text,
  modifications ARRAY DEFAULT '{}'::text[],
  size_option text,
  status text DEFAULT 'pending'::text CHECK (status = ANY (ARRAY['pending'::text, 'confirmed'::text, 'cancelled'::text])),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT qr_order_items_pkey PRIMARY KEY (id),
  CONSTRAINT qr_order_items_qr_order_id_fkey FOREIGN KEY (qr_order_id) REFERENCES public.qr_orders(id)
);
```

---

## 💰 Sales & Payments

### Sales (Ventas)

```sql
CREATE TABLE public.sales (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  customer_id uuid,
  table_id uuid,
  total numeric NOT NULL DEFAULT 0,
  subtotal numeric NOT NULL DEFAULT 0,
  tax numeric NOT NULL DEFAULT 0,
  discount numeric DEFAULT 0,
  payment_method text DEFAULT 'cash'::text CHECK (payment_method = ANY (ARRAY['cash'::text, 'card'::text, 'transfer'::text, 'other'::text])),
  status text DEFAULT 'pending'::text CHECK (status = ANY (ARRAY['pending'::text, 'completed'::text, 'cancelled'::text])),
  notes text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT sales_pkey PRIMARY KEY (id),
  CONSTRAINT sales_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES public.customers(id)
);
```

### Sale Items (Items de Ventas)

```sql
CREATE TABLE public.sale_items (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  sale_id uuid NOT NULL,
  product_id uuid,
  item_id uuid,
  quantity numeric NOT NULL,
  unit_price numeric NOT NULL,
  total_price numeric NOT NULL,
  notes text,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT sale_items_pkey PRIMARY KEY (id),
  CONSTRAINT sale_items_sale_id_fkey FOREIGN KEY (sale_id) REFERENCES public.sales(id),
  CONSTRAINT sale_items_item_id_fkey FOREIGN KEY (item_id) REFERENCES public.items(id)
);
```

### Payment Methods (Métodos de Pago)

```sql
CREATE TABLE public.payment_methods (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  sale_id uuid NOT NULL,
  order_id uuid,
  type text NOT NULL CHECK (type = ANY (ARRAY['cash'::text, 'credit_card'::text, 'debit_card'::text, 'nfc_card'::text, 'mobile_wallet'::text, 'qr_code'::text, 'digital_wallet'::text, 'crypto'::text, 'bnpl'::text, 'gift_card'::text, 'store_credit'::text])),
  amount numeric NOT NULL CHECK (amount > 0::numeric),
  provider text CHECK (provider = ANY (ARRAY['visa'::text, 'mastercard'::text, 'amex'::text, 'discover'::text, 'paypal'::text, 'apple_pay'::text, 'google_pay'::text, 'venmo'::text, 'square'::text, 'stripe'::text])),
  transaction_id text,
  authorization_code text,
  reference_number text,
  batch_id text,
  status text DEFAULT 'pending'::text CHECK (status = ANY (ARRAY['pending'::text, 'processing'::text, 'authorized'::text, 'captured'::text, 'completed'::text, 'failed'::text, 'cancelled'::text, 'refunded'::text, 'disputed'::text])),
  processed_at timestamp with time zone,
  is_contactless boolean NOT NULL DEFAULT false,
  processing_time interval,
  tip_amount numeric NOT NULL DEFAULT 0.00,
  tip_percentage numeric,
  receipt_method text CHECK (receipt_method = ANY (ARRAY['email'::text, 'sms'::text, 'app_notification'::text, 'printed'::text, 'none'::text])),
  customer_signature text,
  terminal_id text,
  last_four_digits character varying,
  card_brand text,
  is_emv boolean DEFAULT false,
  cvv_verified boolean DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT payment_methods_pkey PRIMARY KEY (id),
  CONSTRAINT payment_methods_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(id)
);
```

### Split Bills (División de Cuentas)

```sql
CREATE TABLE public.split_bills (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  sale_id uuid NOT NULL,
  order_id uuid,
  total_amount numeric NOT NULL CHECK (total_amount > 0::numeric),
  split_type text NOT NULL CHECK (split_type = ANY (ARRAY['even'::text, 'item_based'::text, 'custom'::text, 'percentage'::text])),
  number_of_splits smallint NOT NULL CHECK (number_of_splits >= 2 AND number_of_splits <= 20),
  status text DEFAULT 'pending'::text CHECK (status = ANY (ARRAY['pending'::text, 'in_progress'::text, 'completed'::text, 'cancelled'::text])),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  completed_at timestamp with time zone,
  CONSTRAINT split_bills_pkey PRIMARY KEY (id),
  CONSTRAINT split_bills_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(id)
);
```

### Bill Splits (Divisiones de Cuenta)

```sql
CREATE TABLE public.bill_splits (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  split_bill_id uuid NOT NULL,
  customer_name text,
  customer_phone character varying,
  customer_email character varying,
  amount numeric NOT NULL CHECK (amount > 0::numeric),
  tip_amount numeric NOT NULL DEFAULT 0.00,
  status text DEFAULT 'pending'::text CHECK (status = ANY (ARRAY['pending'::text, 'paid'::text, 'failed'::text, 'cancelled'::text])),
  assigned_items ARRAY DEFAULT '{}'::uuid[],
  custom_percentage numeric CHECK (custom_percentage >= 0::numeric AND custom_percentage <= 100::numeric),
  payment_method_id uuid,
  paid_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT bill_splits_pkey PRIMARY KEY (id),
  CONSTRAINT bill_splits_split_bill_id_fkey FOREIGN KEY (split_bill_id) REFERENCES public.split_bills(id),
  CONSTRAINT bill_splits_payment_method_id_fkey FOREIGN KEY (payment_method_id) REFERENCES public.payment_methods(id)
);
```

---

## 👥 Customer Management

### Customers (Clientes)

```sql
CREATE TABLE public.customers (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name character varying NOT NULL,
  email character varying,
  phone character varying,
  address text,
  tax_id character varying,
  notes text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT customers_pkey PRIMARY KEY (id)
);
```

### Customer RFM Profiles (Perfiles RFM de Clientes)

```sql
CREATE TABLE public.customer_rfm_profiles (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  customer_id bigint UNIQUE,
  rfm_segment text,
  churn_risk text CHECK (churn_risk = ANY (ARRAY['low'::text, 'medium'::text, 'high'::text])),
  recency_days integer,
  lifetime_value numeric,
  last_purchase_date date,
  avg_order_value numeric,
  visit_frequency numeric,
  is_vip boolean DEFAULT false,
  frequency_count integer,
  loyalty_tier text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT customer_rfm_profiles_pkey PRIMARY KEY (id)
);
```

### Customer RFM Update Queue (Cola de Actualizaciones RFM)

```sql
CREATE TABLE public.customer_rfm_update_queue (
  customer_id uuid NOT NULL,
  queued_at timestamp with time zone DEFAULT now(),
  CONSTRAINT customer_rfm_update_queue_pkey PRIMARY KEY (customer_id)
);
```

### Customer Update Log (Log de Actualizaciones de Clientes)

```sql
CREATE TABLE public.customer_update_log (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  table_name text NOT NULL,
  record_id uuid NOT NULL,
  updated_at timestamp with time zone DEFAULT now(),
  updated_columns jsonb,
  CONSTRAINT customer_update_log_pkey PRIMARY KEY (id)
);
```

---

## 📊 Analytics & Performance

### Daily Analytics (Analíticos Diarios)

```sql
CREATE TABLE public.daily_analytics (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  date date NOT NULL UNIQUE,
  total_revenue numeric NOT NULL DEFAULT 0.00,
  total_orders integer NOT NULL DEFAULT 0,
  average_order_value numeric NOT NULL DEFAULT 0.00,
  total_covers integer NOT NULL DEFAULT 0,
  table_turnover_rate numeric NOT NULL DEFAULT 0.00,
  average_service_time interval DEFAULT '01:30:00'::interval,
  customer_satisfaction_avg numeric NOT NULL DEFAULT 0.0,
  total_tips numeric NOT NULL DEFAULT 0.00,
  total_discounts numeric NOT NULL DEFAULT 0.00,
  refund_amount numeric NOT NULL DEFAULT 0.00,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT daily_analytics_pkey PRIMARY KEY (id)
);
```

### Menu Performance (Rendimiento del Menú)

```sql
CREATE TABLE public.menu_performance (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL,
  date date NOT NULL,
  units_sold integer NOT NULL DEFAULT 0,
  revenue numeric NOT NULL DEFAULT 0.00,
  average_rating numeric,
  rank_by_revenue smallint,
  rank_by_volume smallint,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT menu_performance_pkey PRIMARY KEY (id)
);
```

### Recipe Performance (Rendimiento de Recetas)

```sql
CREATE TABLE public.recipe_performance (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  recipe_id uuid NOT NULL,
  date date NOT NULL DEFAULT CURRENT_DATE,
  times_produced integer NOT NULL DEFAULT 0,
  actual_cost numeric NOT NULL DEFAULT 0.00,
  times_sold integer DEFAULT 0,
  revenue_generated numeric DEFAULT 0.00,
  created_at timestamp without time zone DEFAULT now(),
  CONSTRAINT recipe_performance_pkey PRIMARY KEY (id),
  CONSTRAINT recipe_performance_recipe_id_fkey FOREIGN KEY (recipe_id) REFERENCES public.recipes(id)
);
```

### Menu Engineering Analysis (Análisis de Ingeniería de Menú)

```sql
CREATE TABLE public.menu_engineering_analysis (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  recipe_id uuid NOT NULL,
  analysis_date date NOT NULL DEFAULT CURRENT_DATE,
  popularity_index numeric NOT NULL DEFAULT 0.0,
  profitability_index numeric NOT NULL DEFAULT 0.0,
  menu_category text,
  recommendation text,
  created_at timestamp without time zone DEFAULT now(),
  CONSTRAINT menu_engineering_analysis_pkey PRIMARY KEY (id),
  CONSTRAINT menu_engineering_analysis_recipe_id_fkey FOREIGN KEY (recipe_id) REFERENCES public.recipes(id)
);
```

---

## 🔄 Async Operations

### Async Update Queue (Cola de Actualizaciones Asíncronas)

```sql
CREATE TABLE public.async_update_queue (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  entity_type text NOT NULL CHECK (entity_type = ANY (ARRAY['order'::text, 'sale'::text, 'table'::text, 'party'::text])),
  entity_id uuid NOT NULL,
  update_type text NOT NULL CHECK (update_type = ANY (ARRAY['totals'::text, 'analytics'::text, 'performance'::text, 'metrics'::text])),
  priority smallint DEFAULT 5 CHECK (priority >= 1 AND priority <= 10),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  processed_at timestamp with time zone,
  CONSTRAINT async_update_queue_pkey PRIMARY KEY (id)
);
```

### POS Async Operations (Operaciones Asíncronas POS)

```sql
CREATE TABLE public.pos_async_operations (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  entity_type USER-DEFINED NOT NULL,
  entity_id uuid NOT NULL,
  operation_type USER-DEFINED NOT NULL,
  priority smallint NOT NULL DEFAULT 5 CHECK (priority >= 1 AND priority <= 10),
  retry_count smallint NOT NULL DEFAULT 0 CHECK (retry_count >= 0),
  max_retries smallint NOT NULL DEFAULT 3 CHECK (max_retries > 0),
  status USER-DEFINED NOT NULL DEFAULT 'pending'::pos_async_status,
  error_message text,
  error_code text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  started_at timestamp with time zone,
  completed_at timestamp with time zone,
  next_retry_at timestamp with time zone,
  operation_payload jsonb DEFAULT '{}'::jsonb,
  CONSTRAINT pos_async_operations_pkey PRIMARY KEY (id)
);
```

### POS Async Dead Letter Queue (Cola de Letras Muertas Asíncronas POS)

```sql
CREATE TABLE public.pos_async_dead_letter_queue (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  original_operation_id uuid,
  entity_type USER-DEFINED NOT NULL,
  entity_id uuid NOT NULL,
  operation_type USER-DEFINED NOT NULL,
  final_error_message text NOT NULL,
  failed_at timestamp with time zone NOT NULL DEFAULT now(),
  total_retry_count smallint NOT NULL,
  original_payload jsonb,
  CONSTRAINT pos_async_dead_letter_queue_pkey PRIMARY KEY (id),
  CONSTRAINT pos_async_dead_letter_queue_original_operation_id_fkey FOREIGN KEY (original_operation_id) REFERENCES public.pos_async_operations(id)
);
```

---

## 💼 Financial Management

### AFIP Configuration (Configuración AFIP)

```sql
CREATE TABLE public.afip_configuration (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  business_name character varying NOT NULL,
  tax_id character varying NOT NULL,
  certificate_path text,
  private_key_path text,
  environment text DEFAULT 'testing'::text CHECK (environment = ANY (ARRAY['testing'::text, 'production'::text])),
  punto_venta integer NOT NULL DEFAULT 1,
  is_active boolean DEFAULT true,
  last_used_number_a integer DEFAULT 0,
  last_used_number_b integer DEFAULT 0,
  last_used_number_c integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT afip_configuration_pkey PRIMARY KEY (id)
);
```

### Invoices (Facturas)

```sql
CREATE TABLE public.invoices (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  invoice_number character varying NOT NULL UNIQUE,
  customer_id uuid,
  sale_id uuid,
  invoice_type text NOT NULL CHECK (invoice_type = ANY (ARRAY['A'::text, 'B'::text, 'C'::text, 'E'::text])),
  subtotal numeric NOT NULL DEFAULT 0,
  tax_amount numeric NOT NULL DEFAULT 0,
  total numeric NOT NULL DEFAULT 0,
  status text DEFAULT 'draft'::text CHECK (status = ANY (ARRAY['draft'::text, 'sent'::text, 'paid'::text, 'cancelled'::text, 'overdue'::text])),
  due_date date,
  afip_cae character varying,
  afip_cae_due_date date,
  qr_code text,
  notes text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT invoices_pkey PRIMARY KEY (id),
  CONSTRAINT invoices_sale_id_fkey FOREIGN KEY (sale_id) REFERENCES public.sales(id),
  CONSTRAINT invoices_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES public.customers(id)
);
```

### Tax Reports (Reportes de Impuestos)

```sql
CREATE TABLE public.tax_reports (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  report_type text NOT NULL CHECK (report_type = ANY (ARRAY['iva'::text, 'ganancias'::text, 'ingresos_brutos'::text])),
  period_year integer NOT NULL,
  period_month integer CHECK (period_month >= 1 AND period_month <= 12),
  status text DEFAULT 'draft'::text CHECK (status = ANY (ARRAY['draft'::text, 'generated'::text, 'submitted'::text])),
  file_path text,
  generated_at timestamp with time zone,
  submitted_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT tax_reports_pkey PRIMARY KEY (id)
);
```

### Financial Reports (Reportes Financieros)

```sql
CREATE TABLE public.financial_reports (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  report_name character varying NOT NULL,
  report_type text NOT NULL CHECK (report_type = ANY (ARRAY['balance'::text, 'income_statement'::text, 'cash_flow'::text, 'tax_summary'::text])),
  start_date date NOT NULL,
  end_date date NOT NULL,
  data jsonb,
  status text DEFAULT 'generating'::text CHECK (status = ANY (ARRAY['generating'::text, 'completed'::text, 'error'::text])),
  file_url text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT financial_reports_pkey PRIMARY KEY (id)
);
```

### Percepciones y Retenciones

```sql
CREATE TABLE public.percepciones_retenciones (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  invoice_id uuid NOT NULL,
  type text NOT NULL CHECK (type = ANY (ARRAY['percepcion'::text, 'retencion'::text])),
  tax_type character varying NOT NULL,
  percentage numeric NOT NULL,
  amount numeric NOT NULL,
  jurisdiction character varying,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT percepciones_retenciones_pkey PRIMARY KEY (id),
  CONSTRAINT percepciones_retenciones_invoice_id_fkey FOREIGN KEY (invoice_id) REFERENCES public.invoices(id)
);
```

---

## 📋 Staff & Scheduling

### Schedules (Horarios)

```sql
CREATE TABLE public.schedules (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name character varying NOT NULL,
  start_date date NOT NULL,
  end_date date NOT NULL,
  status text DEFAULT 'draft'::text CHECK (status = ANY (ARRAY['draft'::text, 'published'::text, 'archived'::text])),
  created_by uuid,
  notes text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT schedules_pkey PRIMARY KEY (id)
);
```

### Shifts (Turnos)

```sql
CREATE TABLE public.shifts (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  employee_id uuid NOT NULL,
  start_time timestamp with time zone NOT NULL,
  end_time timestamp with time zone NOT NULL,
  role character varying,
  status text DEFAULT 'scheduled'::text CHECK (status = ANY (ARRAY['scheduled'::text, 'confirmed'::text, 'in_progress'::text, 'completed'::text, 'cancelled'::text])),
  break_duration integer DEFAULT 0,
  hourly_rate numeric,
  notes text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT shifts_pkey PRIMARY KEY (id)
);
```

### Shift Templates (Plantillas de Turnos)

```sql
CREATE TABLE public.shift_templates (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name character varying NOT NULL,
  start_time time without time zone NOT NULL,
  end_time time without time zone NOT NULL,
  days_of_week ARRAY NOT NULL,
  role character varying,
  min_employees integer DEFAULT 1,
  max_employees integer DEFAULT 1,
  hourly_rate numeric,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT shift_templates_pkey PRIMARY KEY (id)
);
```

### Time Off Requests (Solicitudes de Tiempo Libre)

```sql
CREATE TABLE public.time_off_requests (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  employee_id uuid NOT NULL,
  start_date date NOT NULL,
  end_date date NOT NULL,
  request_type text NOT NULL CHECK (request_type = ANY (ARRAY['vacation'::text, 'sick'::text, 'personal'::text, 'emergency'::text])),
  status text DEFAULT 'pending'::text CHECK (status = ANY (ARRAY['pending'::text, 'approved'::text, 'rejected'::text])),
  reason text,
  approved_by uuid,
  approved_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT time_off_requests_pkey PRIMARY KEY (id)
);
```

---

## 🏨 Reservations & Events

### Reservations (Reservas)

```sql
CREATE TABLE public.reservations (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  customer_id uuid,
  table_id uuid,
  party_size integer NOT NULL,
  reservation_date date NOT NULL,
  reservation_time time without time zone NOT NULL,
  status text DEFAULT 'pending'::text CHECK (status = ANY (ARRAY['pending'::text, 'confirmed'::text, 'seated'::text, 'completed'::text, 'cancelled'::text, 'no_show'::text])),
  special_requests text,
  contact_phone character varying,
  notes text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT reservations_pkey PRIMARY KEY (id),
  CONSTRAINT reservations_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES public.customers(id),
  CONSTRAINT reservations_table_id_fkey FOREIGN KEY (table_id) REFERENCES public.tables(id)
);
```

### Service Events (Eventos de Servicio)

```sql
CREATE TABLE public.service_events (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  party_id uuid NOT NULL,
  table_id uuid,
  event_type text NOT NULL CHECK (event_type = ANY (ARRAY['order_taken'::text, 'food_served'::text, 'drinks_served'::text, 'check_requested'::text, 'payment_processed'::text, 'table_cleaned'::text])),
  server_id uuid,
  notes text,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT service_events_pkey PRIMARY KEY (id),
  CONSTRAINT service_events_party_id_fkey FOREIGN KEY (party_id) REFERENCES public.parties(id),
  CONSTRAINT service_events_table_id_fkey FOREIGN KEY (table_id) REFERENCES public.tables(id)
);
```

---

## 🔧 Item Modifications

### Item Modifications (Modificaciones de Items)

```sql
CREATE TABLE public.item_modifications (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  order_item_id uuid NOT NULL,
  type text NOT NULL CHECK (type = ANY (ARRAY['addition'::text, 'substitution'::text, 'removal'::text, 'preparation_style'::text, 'extra_portion'::text, 'sauce_on_side'::text])),
  description text NOT NULL,
  price_adjustment numeric NOT NULL DEFAULT 0.00,
  ingredients_affected ARRAY DEFAULT '{}'::text[],
  preparation_notes text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT item_modifications_pkey PRIMARY KEY (id),
  CONSTRAINT item_modifications_order_item_id_fkey FOREIGN KEY (order_item_id) REFERENCES public.order_items(id)
);
```

---

## 📝 Notas Importantes

### Cambios Principales en v3.0
1. **Expansión del sistema POS**: Nuevas tablas para gestión avanzada de órdenes y pagos
2. **Sistema QR mejorado**: Funcionalidad completa de pedidos por QR
3. **Analytics avanzados**: Métricas de rendimiento y análisis de menú
4. **Integración AFIP**: Sistema completo de facturación electrónica
5. **Gestión de personal**: Horarios, turnos y solicitudes de tiempo libre
6. **Operaciones asíncronas**: Sistema robusto de procesamiento en background
7. **Tipos de datos actualizados**: Cambio de integer a numeric para mayor precisión
8. **Nuevos campos de audit**: Timestamps y tracking mejorado

### Tipos de Datos Personalizados (ENUMs)
- `pos_entity_type`: Para operaciones asíncronas
- `pos_operation_type`: Tipos de operaciones del sistema
- `pos_async_status`: Estados de operaciones asíncronas

### Índices Recomendados
- Índices en campos de búsqueda frecuente (email, phone, order_number)
- Índices compuestos para consultas de analíticos por fecha
- Índices en foreign keys para mejor performance de JOINs

---
**Documento generado automáticamente - G-Admin Mini v3.0**
