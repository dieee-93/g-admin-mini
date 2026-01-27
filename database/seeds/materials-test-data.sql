-- Seed Data - Materials for E2E Testing
-- Run this via Supabase SQL Editor with admin privileges

-- Clear existing test data (optional)
DELETE FROM materials WHERE name LIKE '%Vacuna%' OR name LIKE '%Salmón%' OR name LIKE '%Parmesano%';

-- Insert test materials
INSERT INTO materials (name, type, unit, stock, min_stock, unit_cost, category) VALUES
-- CLASE A - Alto Valor
('Carne Vacuna Premium', 'MEASURABLE', 'kg', 150.5, 100, 15.50, 'Carnes'),
('Salmón Noruego', 'MEASURABLE', 'kg', 45.0, 30, 28.00, 'Pescados'),
('Queso Parmesano Importado', 'MEASURABLE', 'kg', 25.0, 15, 32.00, 'Lácteos'),
('Jamón Serrano', 'MEASURABLE', 'kg', 9.0, 20, 42.00, 'Carnes'),

-- CLASE B - Valor Medio
('Pollo Entero', 'MEASURABLE', 'kg', 250.0, 150, 5.50, 'Carnes'),
('Leche Entera', 'MEASURABLE', 'l', 180.0, 200, 1.80, 'Lácteos'),
('Harina 000', 'MEASURABLE', 'kg', 500.0, 300, 1.20, 'Secos'),
('Aceite de Oliva', 'MEASURABLE', 'l', 75.0, 50, 8.50, 'Aceites'),
('Tomate Perita', 'MEASURABLE', 'kg', 120.0, 80, 2.50, 'Verduras'),
('Cebolla', 'MEASURABLE', 'kg', 95.0, 100, 1.50, 'Verduras'),

-- CLASE C - Bajo Valor
('Sal Fina', 'MEASURABLE', 'kg', 800.0, 400, 0.50, 'Condimentos'),
('Pimienta Negra', 'MEASURABLE', 'kg', 15.0, 10, 4.00, 'Condimentos'),
('Azúcar', 'MEASURABLE', 'kg', 600.0, 400, 0.85, 'Secos'),
('Servilletas de Papel', 'COUNTABLE', 'paquetes', 250, 150, 0.65, 'Descartables'),
('Vasos Plásticos 500ml', 'COUNTABLE', 'unidades', 1200, 800, 0.15, 'Descartables'),
('Papel Aluminio', 'COUNTABLE', 'unidades', 45, 30, 2.80, 'Cocina'),
('Detergente Lavavajillas', 'MEASURABLE', 'l', 25.0, 15, 3.20, 'Limpieza'),
('Lavandina', 'MEASURABLE', 'l', 30.0, 20, 1.90, 'Limpieza'),
('Ajo en Polvo', 'MEASURABLE', 'kg', 8.0, 5, 6.50, 'Condimentos'),
('Orégano', 'MEASURABLE', 'kg', 12.0, 8, 5.00, 'Condimentos');

-- Verify
SELECT 
  category,
  COUNT(*) as count,
  ROUND(SUM(stock * unit_cost)::numeric, 2) as total_value
FROM materials
WHERE name IN ('Carne Vacuna Premium', 'Salmón Noruego', 'Queso Parmesano Importado')
   OR name LIKE '%Serrano%' OR name LIKE '%Pollo%' OR name LIKE '%Leche%'
GROUP BY category
ORDER BY total_value DESC;

SELECT 
  COUNT(*) as total_materials,
  ROUND(SUM(stock * unit_cost)::numeric, 2) as total_inventory_value
FROM materials;
