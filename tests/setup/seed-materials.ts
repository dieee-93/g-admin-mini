/**
 * Seed Script - Materials Test Data
 * 
 * Populates test database with sample materials for e2e testing.
 * 
 * Usage:
 *   Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY environment variables
 *   pnpm seed:materials
 */

import { createClient } from '@supabase/supabase-js';

// Get environment variables from CLI or process.env
const supabaseUrl = process.argv[2] || process.env.VITE_SUPABASE_URL || 'https://ocwjrkxjwqmxvhckgtud.supabase.co';
const supabaseAnonKey = process.argv[3] || process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9jd2pya3hqd3FteHZoY2tndHVkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM4MTQ2NDQsImV4cCI6MjA2OTM5MDY0NH0.2xKgIkDZ1ghSnD1zt1akW4EnILfJanIB7tNlUySPVfI';

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// ============================================================================
// SEED DATA - Materials
// ============================================================================

const MATERIALS = [
  // ========== CLASE A - Alto Valor (20% items, 80% valor) ==========
  {
    name: 'Carne Vacuna Premium',
    type: 'MEASURABLE',
    unit: 'kg',
    stock: 150.5,
    min_stock: 100,
    
    unit_cost: 15.50,
    category: 'Carnes',
  },
  {
    name: 'Salmón Noruego',
    type: 'MEASURABLE',
    unit: 'kg',
    stock: 45.0,
    min_stock: 30,
    
    unit_cost: 28.00,
    category: 'Pescados',
  },
  {
    name: 'Queso Parmesano Importado',
    type: 'MEASURABLE',
    unit: 'kg',
    stock: 25.0,
    min_stock: 15,
    
    unit_cost: 32.00,
    category: 'Lácteos',
  },
  {
    name: 'Jamón Serrano',
    type: 'MEASURABLE',
    unit: 'kg',
    stock: 9.0, // CRITICAL - stock below minimum/2
    min_stock: 20,
    
    unit_cost: 42.00,
    category: 'Carnes',
  },

  // ========== CLASE B - Valor Medio (30% items, 15% valor) ==========
  {
    name: 'Pollo Entero',
    type: 'MEASURABLE',
    unit: 'kg',
    stock: 250.0,
    min_stock: 150,
    
    unit_cost: 5.50,
    category: 'Carnes',
  },
  {
    name: 'Leche Entera',
    type: 'MEASURABLE',
    unit: 'l',
    stock: 180.0,
    min_stock: 200, // LOW - stock below minimum
    
    unit_cost: 1.80,
    category: 'Lácteos',
  },
  {
    name: 'Harina 000',
    type: 'MEASURABLE',
    unit: 'kg',
    stock: 500.0,
    min_stock: 300,
    
    unit_cost: 1.20,
    category: 'Secos',
  },
  {
    name: 'Aceite de Oliva',
    type: 'MEASURABLE',
    unit: 'l',
    stock: 75.0,
    min_stock: 50,
    
    unit_cost: 8.50,
    category: 'Aceites',
  },
  {
    name: 'Tomate Perita',
    type: 'MEASURABLE',
    unit: 'kg',
    stock: 120.0,
    min_stock: 80,
    
    unit_cost: 2.50,
    category: 'Verduras',
  },
  {
    name: 'Cebolla',
    type: 'MEASURABLE',
    unit: 'kg',
    stock: 95.0,
    min_stock: 100, // LOW - stock below minimum
    
    unit_cost: 1.50,
    category: 'Verduras',
  },

  // ========== CLASE C - Bajo Valor (50% items, 5% valor) ==========
  {
    name: 'Sal Fina',
    type: 'MEASURABLE',
    unit: 'kg',
    stock: 800.0,
    min_stock: 400,
    
    unit_cost: 0.50,
    category: 'Condimentos',
  },
  {
    name: 'Pimienta Negra',
    type: 'MEASURABLE',
    unit: 'kg',
    stock: 15.0,
    min_stock: 10,
    
    unit_cost: 4.00,
    category: 'Condimentos',
  },
  {
    name: 'Azúcar',
    type: 'MEASURABLE',
    unit: 'kg',
    stock: 600.0,
    min_stock: 400,
    
    unit_cost: 0.85,
    category: 'Secos',
  },
  {
    name: 'Servilletas de Papel',
    type: 'COUNTABLE',
    unit: 'paquetes',
    stock: 250,
    min_stock: 150,
    
    unit_cost: 0.65,
    category: 'Descartables',
  },
  {
    name: 'Vasos Plásticos 500ml',
    type: 'COUNTABLE',
    unit: 'unidades',
    stock: 1200,
    min_stock: 800,
    
    unit_cost: 0.15,
    category: 'Descartables',
  },
  {
    name: 'Papel Aluminio',
    type: 'COUNTABLE',
    unit: 'unidades',
    stock: 45,
    min_stock: 30,
    
    unit_cost: 2.80,
    category: 'Cocina',
  },
  {
    name: 'Detergente Lavavajillas',
    type: 'MEASURABLE',
    unit: 'l',
    stock: 25.0,
    min_stock: 15,
    
    unit_cost: 3.20,
    category: 'Limpieza',
  },
  {
    name: 'Lavandina',
    type: 'MEASURABLE',
    unit: 'l',
    stock: 30.0,
    min_stock: 20,
    
    unit_cost: 1.90,
    category: 'Limpieza',
  },
  {
    name: 'Ajo en Polvo',
    type: 'MEASURABLE',
    unit: 'kg',
    stock: 8.0,
    min_stock: 5,
    
    unit_cost: 6.50,
    category: 'Condimentos',
  },
  {
    name: 'Orégano',
    type: 'MEASURABLE',
    unit: 'kg',
    stock: 12.0,
    min_stock: 8,
    
    unit_cost: 5.00,
    category: 'Condimentos',
  },
];

// ============================================================================
// SEED FUNCTIONS
// ============================================================================

async function clearExistingMaterials() {
  console.log('🗑️  Clearing existing test materials...');
  
  // Delete test materials by name pattern
  const { error } = await supabase
    .from('materials')
    .delete()
    .or('name.like.%Vacuna%,name.like.%Salmón%,name.like.%Parmesano%,name.like.%Serrano%');

  if (error) {
    console.warn('⚠️  Warning clearing materials:', error.message);
    // Continue anyway - might be empty table
  } else {
    console.log('✅ Existing materials cleared');
  }
}

async function seedMaterials() {
  console.log('🌱 Seeding materials...');
  
  const { data, error } = await supabase
    .from('materials')
    .insert(MATERIALS)
    .select();

  if (error) {
    console.error('❌ Error seeding materials:', error);
    throw error;
  }

  console.log(`✅ Seeded ${data?.length || 0} materials`);
  
  // Print summary by value (ABC analysis will be calculated client-side)
  const totalValue = data?.reduce((sum, m) => sum + (m.stock * m.unit_cost), 0) || 0;
  const sortedByValue = data?.sort((a, b) => (b.stock * b.unit_cost) - (a.stock * a.unit_cost)) || [];
  
  const top20Percent = Math.ceil((sortedByValue.length * 20) / 100);
  const next30Percent = Math.ceil((sortedByValue.length * 30) / 100);
  
  console.log('\n📊 Materials by Value (Client will calculate ABC):');
  console.log(`   Top 20% (Class A): ~${top20Percent} items`);
  console.log(`   Next 30% (Class B): ~${next30Percent} items`);
  console.log(`   Rest 50% (Class C): ~${sortedByValue.length - top20Percent - next30Percent} items`);
  
  console.log(`\n💰 Valor Total Inventario: $${totalValue.toFixed(2)}`);
  
  // Stock status
  const critical = data?.filter(m => m.stock < m.min_stock * 0.5).length || 0;
  const low = data?.filter(m => m.stock >= m.min_stock * 0.5 && m.stock <= m.min_stock).length || 0;
  const ok = data?.filter(m => m.stock > m.min_stock).length || 0;
  
  console.log('\n📦 Estado de Stock:');
  console.log(`   Crítico: ${critical} items`);
  console.log(`   Bajo:    ${low} items`);
  console.log(`   OK:      ${ok} items`);
}

// ============================================================================
// MAIN
// ============================================================================

async function main() {
  console.log('🚀 Starting materials seed script...\n');
  
  try {
    await clearExistingMaterials();
    await seedMaterials();
    
    console.log('\n✅ Seed completed successfully!');
    console.log('🧪 You can now run: pnpm e2e:materials\n');
  } catch (error) {
    console.error('\n❌ Seed failed:', error);
    process.exit(1);
  }
}

main();
