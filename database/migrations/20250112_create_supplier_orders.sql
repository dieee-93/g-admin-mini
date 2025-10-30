-- ============================================
-- SUPPLIER ORDERS MIGRATION
-- ============================================
-- Created: 2025-01-12
-- Purpose: Purchase orders from suppliers to restock materials
--
-- Tables:
--   - supplier_orders: Main PO table
--   - supplier_order_items: Line items per PO
--
-- Features:
--   - Auto-generated PO numbers (PO-YYYYMMDD-XXXX)
--   - Status workflow: draft → pending → approved → received/cancelled
--   - Multi-item support (multiple materials per order)
--   - Auto-calculate totals
--   - Track received quantities
-- ============================================

-- ============================================
-- TABLE: supplier_orders
-- ============================================

CREATE TABLE IF NOT EXISTS supplier_orders (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- PO Identification
  po_number varchar(50) UNIQUE NOT NULL,

  -- Relationships
  supplier_id uuid NOT NULL REFERENCES suppliers(id) ON DELETE RESTRICT,

  -- Status & Workflow
  status varchar(20) NOT NULL DEFAULT 'draft',
  -- Status values: 'draft', 'pending', 'approved', 'received', 'cancelled'

  -- Financial
  total_amount numeric(12,2) DEFAULT 0 CHECK (total_amount >= 0),

  -- Delivery
  expected_delivery_date date,
  actual_delivery_date date,

  -- Notes & Metadata
  notes text,
  internal_notes text, -- Private notes, not shown to supplier

  -- Audit
  created_by uuid REFERENCES auth.users(id),
  approved_by uuid REFERENCES auth.users(id),
  received_by uuid REFERENCES auth.users(id),

  -- Timestamps
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  approved_at timestamptz,
  received_at timestamptz,
  cancelled_at timestamptz,

  -- Constraints
  CONSTRAINT valid_status CHECK (
    status IN ('draft', 'pending', 'approved', 'received', 'cancelled')
  )
);

-- ============================================
-- TABLE: supplier_order_items
-- ============================================

CREATE TABLE IF NOT EXISTS supplier_order_items (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Relationships
  supplier_order_id uuid NOT NULL REFERENCES supplier_orders(id) ON DELETE CASCADE,
  material_id uuid NOT NULL REFERENCES items(id) ON DELETE RESTRICT,

  -- Order Details
  quantity numeric(12,3) NOT NULL CHECK (quantity > 0),
  unit_cost numeric(12,2) NOT NULL CHECK (unit_cost >= 0),

  -- Calculated total (quantity * unit_cost)
  total_cost numeric(12,2) GENERATED ALWAYS AS (quantity * unit_cost) STORED,

  -- Reception
  received_quantity numeric(12,3) DEFAULT 0 CHECK (received_quantity >= 0),

  -- Notes
  notes text,

  -- Timestamps
  created_at timestamptz NOT NULL DEFAULT now(),

  -- Constraints
  CONSTRAINT valid_received_quantity CHECK (received_quantity <= quantity)
);

-- ============================================
-- INDEXES
-- ============================================

-- Performance indexes
CREATE INDEX IF NOT EXISTS idx_supplier_orders_supplier ON supplier_orders(supplier_id);
CREATE INDEX IF NOT EXISTS idx_supplier_orders_status ON supplier_orders(status);
CREATE INDEX IF NOT EXISTS idx_supplier_orders_po_number ON supplier_orders(po_number);
CREATE INDEX IF NOT EXISTS idx_supplier_orders_created_at ON supplier_orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_supplier_orders_expected_delivery ON supplier_orders(expected_delivery_date);

CREATE INDEX IF NOT EXISTS idx_supplier_order_items_order ON supplier_order_items(supplier_order_id);
CREATE INDEX IF NOT EXISTS idx_supplier_order_items_material ON supplier_order_items(material_id);

-- ============================================
-- FUNCTIONS
-- ============================================

-- Function: Generate next PO number
CREATE OR REPLACE FUNCTION generate_po_number()
RETURNS varchar AS $$
DECLARE
  today_str varchar;
  sequence_num integer;
  po_number varchar;
BEGIN
  -- Format: PO-YYYYMMDD-XXXX
  today_str := to_char(now(), 'YYYYMMDD');

  -- Get next sequence number for today
  SELECT COALESCE(MAX(
    CAST(
      SUBSTRING(po_number FROM 'PO-[0-9]{8}-([0-9]{4})') AS integer
    )
  ), 0) + 1
  INTO sequence_num
  FROM supplier_orders
  WHERE po_number LIKE 'PO-' || today_str || '-%';

  -- Generate PO number
  po_number := 'PO-' || today_str || '-' || LPAD(sequence_num::text, 4, '0');

  RETURN po_number;
END;
$$ LANGUAGE plpgsql;

-- Function: Update supplier_orders.total_amount when items change
CREATE OR REPLACE FUNCTION update_supplier_order_total()
RETURNS trigger AS $$
BEGIN
  -- Recalculate total from all items
  UPDATE supplier_orders
  SET
    total_amount = (
      SELECT COALESCE(SUM(total_cost), 0)
      FROM supplier_order_items
      WHERE supplier_order_id = COALESCE(NEW.supplier_order_id, OLD.supplier_order_id)
    ),
    updated_at = now()
  WHERE id = COALESCE(NEW.supplier_order_id, OLD.supplier_order_id);

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Function: Update updated_at on supplier_orders
CREATE OR REPLACE FUNCTION update_supplier_orders_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- TRIGGERS
-- ============================================

-- Trigger: Update total_amount when items are inserted/updated/deleted
CREATE TRIGGER trigger_update_supplier_order_total_insert
AFTER INSERT ON supplier_order_items
FOR EACH ROW
EXECUTE FUNCTION update_supplier_order_total();

CREATE TRIGGER trigger_update_supplier_order_total_update
AFTER UPDATE ON supplier_order_items
FOR EACH ROW
EXECUTE FUNCTION update_supplier_order_total();

CREATE TRIGGER trigger_update_supplier_order_total_delete
AFTER DELETE ON supplier_order_items
FOR EACH ROW
EXECUTE FUNCTION update_supplier_order_total();

-- Trigger: Update updated_at on supplier_orders
CREATE TRIGGER trigger_supplier_orders_updated_at
BEFORE UPDATE ON supplier_orders
FOR EACH ROW
EXECUTE FUNCTION update_supplier_orders_updated_at();

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Enable RLS
ALTER TABLE supplier_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE supplier_order_items ENABLE ROW LEVEL SECURITY;

-- Policies: Allow authenticated users to manage supplier orders
-- (Adjust based on your auth setup)

-- SELECT policy
CREATE POLICY "Allow authenticated users to view supplier orders"
ON supplier_orders FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Allow authenticated users to view supplier order items"
ON supplier_order_items FOR SELECT
TO authenticated
USING (true);

-- INSERT policy
CREATE POLICY "Allow authenticated users to create supplier orders"
ON supplier_orders FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Allow authenticated users to create supplier order items"
ON supplier_order_items FOR INSERT
TO authenticated
WITH CHECK (true);

-- UPDATE policy
CREATE POLICY "Allow authenticated users to update supplier orders"
ON supplier_orders FOR UPDATE
TO authenticated
USING (true);

CREATE POLICY "Allow authenticated users to update supplier order items"
ON supplier_order_items FOR UPDATE
TO authenticated
USING (true);

-- DELETE policy
CREATE POLICY "Allow authenticated users to delete supplier orders"
ON supplier_orders FOR DELETE
TO authenticated
USING (true);

CREATE POLICY "Allow authenticated users to delete supplier order items"
ON supplier_order_items FOR DELETE
TO authenticated
USING (true);

-- ============================================
-- SAMPLE DATA (Optional - for testing)
-- ============================================

-- Uncomment to insert sample data
/*
INSERT INTO supplier_orders (po_number, supplier_id, status, expected_delivery_date, notes)
VALUES
  ('PO-20250112-0001', (SELECT id FROM suppliers LIMIT 1), 'draft', '2025-01-20', 'Sample order 1'),
  ('PO-20250112-0002', (SELECT id FROM suppliers LIMIT 1), 'pending', '2025-01-25', 'Sample order 2');
*/

-- ============================================
-- MIGRATION COMPLETE
-- ============================================

COMMENT ON TABLE supplier_orders IS 'Purchase orders from suppliers to restock materials';
COMMENT ON TABLE supplier_order_items IS 'Line items for each purchase order';
COMMENT ON FUNCTION generate_po_number() IS 'Generates unique PO number in format PO-YYYYMMDD-XXXX';
