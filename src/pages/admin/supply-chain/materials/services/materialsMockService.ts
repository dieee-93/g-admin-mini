import type { MaterialItem } from '../types/materialTypes';

import { logger } from '@/lib/logging';
/**
 * Mock data service for Materials module
 * Provides realistic test data for development and testing
 */

export class MaterialsMockService {
  private static mockItems: MaterialItem[] = [
    // Clase A items (Alto valor, alta rotación)
    {
      id: '1',
      name: 'Carne Premium de Res',
      description: 'Corte premium para platos principales',
      category: 'Carnes',
      type: 'MEASURABLE',
      unit: 'kg',
      stock: 15.5,
      minStock: 10,
      maxStock: 50,
      unit_cost: 1200,
      supplier_id: 'sup_001',
      supplier_name: 'Frigorífico San José',
      location: 'Freezer A1',
      lastUpdated: new Date('2024-01-15'),
      created_at: new Date('2024-01-01'),
      // ABC Classification
      abcClass: 'A',
      totalValue: 18600, // 15.5 * 1200
      turnoverRate: 24, // Alta rotación
      demandPattern: 'steady'
    },
    {
      id: '2',
      name: 'Salmón Fresco',
      description: 'Salmón importado para sushi y platos especiales',
      category: 'Pescados',
      type: 'MEASURABLE',
      unit: 'kg',
      stock: 8.2,
      minStock: 5,
      maxStock: 25,
      unit_cost: 2500,
      supplier_id: 'sup_002',
      supplier_name: 'Pescados del Atlántico',
      location: 'Freezer B2',
      lastUpdated: new Date('2024-01-14'),
      created_at: new Date('2024-01-01'),
      abcClass: 'A',
      totalValue: 20500,
      turnoverRate: 20,
      demandPattern: 'seasonal'
    },
    {
      id: '3',
      name: 'Aceite de Oliva Extra Virgen',
      description: 'Aceite premium español para cocina',
      category: 'Aceites',
      type: 'MEASURABLE',
      unit: 'L',
      stock: 12.5,
      minStock: 8,
      maxStock: 30,
      unit_cost: 850,
      supplier_id: 'sup_003',
      supplier_name: 'Importadora Mediterránea',
      location: 'Despensa A3',
      lastUpdated: new Date('2024-01-13'),
      created_at: new Date('2024-01-01'),
      abcClass: 'A',
      totalValue: 10625,
      turnoverRate: 18,
      demandPattern: 'steady'
    },

    // Clase B items (Valor medio, rotación media)
    {
      id: '4',
      name: 'Harina 0000',
      description: 'Harina refinada para panificación',
      category: 'Harinas',
      type: 'MEASURABLE',
      unit: 'kg',
      stock: 45.0,
      minStock: 20,
      maxStock: 100,
      unit_cost: 120,
      supplier_id: 'sup_004',
      supplier_name: 'Molino Central',
      location: 'Despensa B1',
      lastUpdated: new Date('2024-01-12'),
      created_at: new Date('2024-01-01'),
      abcClass: 'B',
      totalValue: 5400,
      turnoverRate: 12,
      demandPattern: 'steady'
    },
    {
      id: '5',
      name: 'Queso Mozzarella',
      description: 'Queso fresco para pizzas y ensaladas',
      category: 'Lácteos',
      type: 'MEASURABLE',
      unit: 'kg',
      stock: 6.8,
      minStock: 5,
      maxStock: 20,
      unit_cost: 450,
      supplier_id: 'sup_005',
      supplier_name: 'Lácteos La Pradera',
      location: 'Heladera C1',
      lastUpdated: new Date('2024-01-11'),
      created_at: new Date('2024-01-01'),
      abcClass: 'B',
      totalValue: 3060,
      turnoverRate: 15,
      demandPattern: 'weekly_cycle'
    },
    {
      id: '6',
      name: 'Tomate Perita',
      description: 'Tomate fresco para salsas y ensaladas',
      category: 'Verduras',
      type: 'MEASURABLE',
      unit: 'kg',
      stock: 18.5,
      minStock: 10,
      maxStock: 40,
      unit_cost: 180,
      supplier_id: 'sup_006',
      supplier_name: 'Huerta Orgánica',
      location: 'Cámara Fría A',
      lastUpdated: new Date('2024-01-10'),
      created_at: new Date('2024-01-01'),
      abcClass: 'B',
      totalValue: 3330,
      turnoverRate: 25,
      demandPattern: 'daily'
    },

    // Clase C items (Bajo valor, baja rotación)
    {
      id: '7',
      name: 'Servilletas de Papel',
      description: 'Servilletas blancas para mesa',
      category: 'Descartables',
      type: 'COUNTABLE',
      unit: 'paquete',
      stock: 15,
      minStock: 10,
      maxStock: 50,
      unit_cost: 25,
      supplier_id: 'sup_007',
      supplier_name: 'Papelería Industrial',
      location: 'Depósito D1',
      lastUpdated: new Date('2024-01-09'),
      created_at: new Date('2024-01-01'),
      abcClass: 'C',
      totalValue: 375,
      turnoverRate: 8,
      demandPattern: 'steady'
    },
    {
      id: '8',
      name: 'Sal Fina',
      description: 'Sal de mesa refinada',
      category: 'Condimentos',
      type: 'MEASURABLE',
      unit: 'kg',
      stock: 8.5,
      minStock: 5,
      maxStock: 20,
      unit_cost: 35,
      supplier_id: 'sup_008',
      supplier_name: 'Salinera del Sur',
      location: 'Despensa C2',
      lastUpdated: new Date('2024-01-08'),
      created_at: new Date('2024-01-01'),
      abcClass: 'C',
      totalValue: 297.5,
      turnoverRate: 6,
      demandPattern: 'low'
    },

    // Items con stock crítico para testear alertas
    {
      id: '9',
      name: 'Pollo Entero',
      description: 'Pollo fresco de granja',
      category: 'Carnes',
      type: 'MEASURABLE',
      unit: 'kg',
      stock: 3.2, // Stock crítico (< minStock)
      minStock: 8,
      maxStock: 30,
      unit_cost: 650,
      supplier_id: 'sup_009',
      supplier_name: 'Avícola San Miguel',
      location: 'Freezer A2',
      lastUpdated: new Date('2024-01-07'),
      created_at: new Date('2024-01-01'),
      abcClass: 'A',
      totalValue: 2080,
      turnoverRate: 22,
      demandPattern: 'steady'
    },
    {
      id: '10',
      name: 'Vino Tinto Casa Reserva',
      description: 'Vino de la casa para maridajes',
      category: 'Bebidas',
      type: 'COUNTABLE',
      unit: 'botella',
      stock: 2, // Stock crítico
      minStock: 6,
      maxStock: 24,
      unit_cost: 420,
      supplier_id: 'sup_010',
      supplier_name: 'Bodega Premium',
      location: 'Cava B1',
      lastUpdated: new Date('2024-01-06'),
      created_at: new Date('2024-01-01'),
      abcClass: 'B',
      totalValue: 840,
      turnoverRate: 10,
      demandPattern: 'weekend_peak'
    }
  ];

  private static suppliers = [
    { id: 'sup_001', name: 'Frigorífico San José', reliability: 95, leadTime: 2 },
    { id: 'sup_002', name: 'Pescados del Atlántico', reliability: 88, leadTime: 1 },
    { id: 'sup_003', name: 'Importadora Mediterránea', reliability: 92, leadTime: 7 },
    { id: 'sup_004', name: 'Molino Central', reliability: 98, leadTime: 3 },
    { id: 'sup_005', name: 'Lácteos La Pradera', reliability: 85, leadTime: 1 },
    { id: 'sup_006', name: 'Huerta Orgánica', reliability: 75, leadTime: 1 },
    { id: 'sup_007', name: 'Papelería Industrial', reliability: 90, leadTime: 5 },
    { id: 'sup_008', name: 'Salinera del Sur', reliability: 99, leadTime: 10 },
    { id: 'sup_009', name: 'Avícola San Miguel', reliability: 87, leadTime: 2 },
    { id: 'sup_010', name: 'Bodega Premium', reliability: 93, leadTime: 4 }
  ];

  /**
   * Get all mock materials
   */
  static async getItems(): Promise<MaterialItem[]> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800));
    return [...this.mockItems];
  }

  /**
   * Get material by ID
   */
  static async getItem(id: string): Promise<MaterialItem | null> {
    await new Promise(resolve => setTimeout(resolve, 300));
    return this.mockItems.find(item => item.id === id) || null;
  }

  /**
   * Update material stock
   */
  static async updateStock(id: string, newStock: number): Promise<MaterialItem> {
    await new Promise(resolve => setTimeout(resolve, 500));

    const itemIndex = this.mockItems.findIndex(item => item.id === id);
    if (itemIndex === -1) {
      throw new Error(`Material with id ${id} not found`);
    }

    const item = this.mockItems[itemIndex];
    const updatedItem = {
      ...item,
      stock: newStock,
      totalValue: newStock * item.unitCost,
      lastUpdated: new Date()
    };

    this.mockItems[itemIndex] = updatedItem;
    return updatedItem;
  }

  /**
   * Create new material
   */
  static async createMaterial(materialData: Partial<MaterialItem>): Promise<MaterialItem> {
    await new Promise(resolve => setTimeout(resolve, 1000));

    const newItem: MaterialItem = {
      id: `mock_${Date.now()}`,
      name: materialData.name || 'Nuevo Material',
      description: materialData.description || '',
      category: materialData.category || 'General',
      type: materialData.type || 'COUNTABLE',
      unit: materialData.unit || 'unidad',
      stock: materialData.stock || 0,
      minStock: materialData.minStock || 1,
      maxStock: materialData.maxStock || 100,
      unit_cost: materialData.unit_cost || 0,
      supplier_id: materialData.supplier_id || 'sup_001',
      supplier_name: materialData.supplier_name || 'Proveedor Default',
      location: materialData.location || 'Depósito General',
      lastUpdated: new Date(),
      created_at: new Date(),
      abcClass: 'C', // Default for new items
      totalValue: (materialData.stock || 0) * (materialData.unit_cost || 0),
      turnoverRate: 1,
      demandPattern: 'new'
    };

    this.mockItems.push(newItem);
    return newItem;
  }

  /**
   * Bulk operations
   */
  static async bulkAction(action: string, itemIds: string[]): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 1500));

    switch (action) {
      case 'delete':
        this.mockItems = this.mockItems.filter(item => !itemIds.includes(item.id));
        break;
      case 'update_supplier':
        this.mockItems = this.mockItems.map(item =>
          itemIds.includes(item.id)
            ? { ...item, supplier_id: 'sup_001', supplier_name: 'Proveedor Actualizado' }
            : item
        );
        break;
      default:
        logger.info('MaterialsStore', `Bulk action ${action} applied to items:`, itemIds);
    }
  }

  /**
   * Generate report
   */
  static async generateReport(): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 2000));
    logger.info('MaterialsStore', 'Reporte de inventario generado exitosamente');
  }

  /**
   * Get suppliers list
   */
  static async getSuppliers() {
    await new Promise(resolve => setTimeout(resolve, 400));
    return [...this.suppliers];
  }

  /**
   * Get analytics data
   */
  static getAnalytics() {
    const totalItems = this.mockItems.length;
    const totalValue = this.mockItems.reduce((sum, item) => sum + item.totalValue, 0);
    const lowStockItems = this.mockItems.filter(item => item.stock <= item.minStock).length;
    const criticalStockItems = this.mockItems.filter(item => item.stock < item.minStock * 0.5).length;

    const abcDistribution = {
      A: this.mockItems.filter(item => item.abcClass === 'A').length,
      B: this.mockItems.filter(item => item.abcClass === 'B').length,
      C: this.mockItems.filter(item => item.abcClass === 'C').length
    };

    return {
      totalItems,
      totalValue,
      lowStockItems,
      criticalStockItems,
      supplierCount: this.suppliers.length,
      abcDistribution,
      lastUpdate: new Date(),
      valueGrowth: 5.2,
      stockTurnover: 12.5
    };
  }
}