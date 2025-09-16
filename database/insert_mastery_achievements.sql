/**
 * Script SQL para insertar definiciones de logros de maestría
 * 
 * Ejecutar este script en Supabase para poblar la tabla achievement_definitions
 * con los logros iniciales del sistema.
 */

-- Insertar logros de maestría de VENTAS
INSERT INTO achievement_definitions (id, name, description, icon, domain, trigger_event, conditions, type, tier, points, is_active) VALUES

-- Logros de Ventas
('sales_first_sale', 'Primera Venta', 'Registra tu primera venta en el sistema', 'party', 'sales', 'sales:sale_completed', '{"type": "single_event"}', 'mastery', 'bronze', 10, true),
('sales_bronze_seller', 'Vendedor de Bronce', 'Completa 10 ventas exitosas', 'trophy', 'sales', 'sales:sale_completed', '{"type": "cumulative", "field": "sale_count", "threshold": 10, "comparison": "gte"}', 'mastery', 'bronze', 50, true),
('sales_silver_seller', 'Vendedor de Plata', 'Completa 50 ventas exitosas', 'star', 'sales', 'sales:sale_completed', '{"type": "cumulative", "field": "sale_count", "threshold": 50, "comparison": "gte"}', 'mastery', 'silver', 100, true),
('sales_gold_seller', 'Vendedor de Oro', 'Completa 100 ventas exitosas', 'crown', 'sales', 'sales:sale_completed', '{"type": "cumulative", "field": "sale_count", "threshold": 100, "comparison": "gte"}', 'mastery', 'gold', 200, true),
('sales_revenue_1k', 'Primeros $1,000', 'Genera $1,000 pesos en ventas', 'money', 'sales', 'sales:sale_completed', '{"type": "cumulative", "field": "sale_amount", "threshold": 1000, "comparison": "gte"}', 'mastery', 'bronze', 75, true),

-- Logros de Inventario
('inventory_first_product', 'Primer Producto', 'Crea tu primer producto en el catálogo', 'package', 'inventory', 'products:product_created', '{"type": "single_event"}', 'mastery', 'bronze', 10, true),
('inventory_curator', 'Curador de Catálogo', 'Crea 25 productos únicos', 'grid', 'inventory', 'products:product_created', '{"type": "cumulative", "field": "product_count", "threshold": 25, "comparison": "gte"}', 'mastery', 'silver', 80, true),
('inventory_organizer', 'Organizador Maestro', 'Crea 5 categorías de productos', 'folder', 'inventory', 'products:category_created', '{"type": "cumulative", "field": "category_count", "threshold": 5, "comparison": "gte"}', 'mastery', 'bronze', 30, true),
('inventory_stock_master', 'Maestro de Stock', 'Realiza 50 movimientos de inventario', 'trending-up', 'inventory', 'inventory:movement_recorded', '{"type": "cumulative", "field": "movement_count", "threshold": 50, "comparison": "gte"}', 'mastery', 'gold', 120, true),

-- Logros de Personal
('staff_first_member', 'Primer Miembro del Equipo', 'Registra tu primer empleado', 'user-plus', 'staff', 'staff:member_created', '{"type": "single_event"}', 'mastery', 'bronze', 15, true),
('staff_team_builder', 'Constructor de Equipos', 'Gestiona un equipo de 5 personas', 'users', 'staff', 'staff:member_created', '{"type": "cumulative", "field": "staff_count", "threshold": 5, "comparison": "gte"}', 'mastery', 'silver', 70, true),
('staff_scheduler', 'Maestro de Horarios', 'Programa 20 turnos de trabajo', 'calendar', 'staff', 'staff:schedule_created', '{"type": "cumulative", "field": "schedule_count", "threshold": 20, "comparison": "gte"}', 'mastery', 'bronze', 40, true),

-- Logros de Finanzas
('finance_first_report', 'Primer Reporte', 'Genera tu primer reporte financiero', 'bar-chart', 'finance', 'finance:report_generated', '{"type": "single_event"}', 'mastery', 'bronze', 20, true),
('finance_analyst', 'Analista Financiero', 'Genera 10 reportes financieros', 'trending-up', 'finance', 'finance:report_generated', '{"type": "cumulative", "field": "report_count", "threshold": 10, "comparison": "gte"}', 'mastery', 'silver', 60, true),
('finance_tax_master', 'Maestro Fiscal', 'Configura integración fiscal con AFIP', 'shield', 'finance', 'finance:afip_configured', '{"type": "single_event"}', 'mastery', 'gold', 150, true),

-- Logros de Operaciones
('operations_first_delivery', 'Primera Entrega', 'Completa tu primera entrega a domicilio', 'truck', 'operations', 'operations:delivery_completed', '{"type": "single_event"}', 'mastery', 'bronze', 15, true),
('operations_delivery_expert', 'Experto en Entregas', 'Completa 50 entregas exitosas', 'check-circle', 'operations', 'operations:delivery_completed', '{"type": "cumulative", "field": "delivery_count", "threshold": 50, "comparison": "gte"}', 'mastery', 'gold', 100, true),
('operations_event_host', 'Anfitrión de Eventos', 'Organiza tu primer evento', 'calendar-check', 'operations', 'operations:event_created', '{"type": "single_event"}', 'mastery', 'silver', 80, true),

-- Logros de Crecimiento
('growth_first_customer', 'Primer Cliente', 'Registra tu primer cliente en el CRM', 'heart', 'growth', 'crm:customer_created', '{"type": "single_event"}', 'mastery', 'bronze', 10, true),
('growth_customer_builder', 'Constructor de Relaciones', 'Registra 100 clientes en tu base de datos', 'users', 'growth', 'crm:customer_created', '{"type": "cumulative", "field": "customer_count", "threshold": 100, "comparison": "gte"}', 'mastery', 'gold', 150, true),
('growth_online_presence', 'Presencia Online', 'Configura tu tienda online', 'globe', 'growth', 'online:store_configured', '{"type": "single_event"}', 'mastery', 'silver', 90, true);

-- Verificar inserción
SELECT 
  domain,
  COUNT(*) as achievement_count,
  STRING_AGG(tier, ', ') as tiers
FROM achievement_definitions 
WHERE type = 'mastery'
GROUP BY domain
ORDER BY domain;

-- Verificar total de puntos por dominio
SELECT 
  domain,
  COUNT(*) as total_achievements,
  SUM(points) as total_points,
  AVG(points) as avg_points_per_achievement
FROM achievement_definitions 
WHERE type = 'mastery'
GROUP BY domain
ORDER BY total_points DESC;

-- Comentarios sobre el sistema
COMMENT ON TABLE achievement_definitions IS 'Contiene 21 logros de maestría distribuidos en 6 dominios de negocio';
COMMENT ON COLUMN achievement_definitions.conditions IS 'Condiciones JSON: single_event (eventos únicos) o cumulative (acumulativos con threshold)';
COMMENT ON COLUMN achievement_definitions.tier IS 'Niveles: bronze (fácil), silver (medio), gold (difícil), platinum (excepcional)';
COMMENT ON COLUMN achievement_definitions.points IS 'Sistema de puntos: bronze=10-50, silver=60-90, gold=100-200';