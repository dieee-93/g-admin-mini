/**
 * Supplier Module Example
 * Generated using ModuleFactory with all validated patterns
 */
import { z } from 'zod';
import { createModule, ModuleTemplates } from '../ModuleFactory';

// Supplier entity schema
const SupplierSchema = z.object({
  id: z.string(),
  name: z.string().min(1, "El nombre es obligatorio"),
  contact_person: z.string().optional(),
  email: z.string().email("Email inválido").optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
  payment_terms: z.enum(['cash', '15_days', '30_days', '60_days']).default('30_days'),
  status: z.enum(['active', 'inactive', 'pending']).default('active'),
  category: z.string().default('general'),
  tax_id: z.string().optional(),
  notes: z.string().optional(),
  created_at: z.string(),
  updated_at: z.string().optional(),
  // Analytics fields
  total_orders: z.number().default(0),
  total_value: z.number().default(0),
  average_delivery_time: z.number().default(0),
  quality_rating: z.number().min(1).max(5).default(5),
  last_activity: z.string().optional()
});

type Supplier = z.infer<typeof SupplierSchema>;

// Mock data functions (would be replaced with real API calls)
const mockSuppliers: Supplier[] = [
  {
    id: '1',
    name: 'Distribuidora San Juan',
    contact_person: 'Juan Pérez',
    email: 'juan@distribuidora.com',
    phone: '+54 11 1234-5678',
    address: 'Av. Corrientes 1234, CABA',
    payment_terms: '30_days',
    status: 'active',
    category: 'food',
    tax_id: '20-12345678-9',
    created_at: '2024-01-15T10:00:00Z',
    total_orders: 25,
    total_value: 15000,
    average_delivery_time: 2,
    quality_rating: 4.5,
    last_activity: '2024-01-15T10:00:00Z'
  },
  {
    id: '2',
    name: 'Bebidas del Sur',
    contact_person: 'María García',
    email: 'maria@bebidasdelsur.com',
    phone: '+54 11 9876-5432',
    address: 'San Martín 567, Buenos Aires',
    payment_terms: '15_days',
    status: 'active',
    category: 'beverages',
    tax_id: '20-87654321-9',
    created_at: '2024-01-10T14:30:00Z',
    total_orders: 40,
    total_value: 22000,
    average_delivery_time: 1,
    quality_rating: 5,
    last_activity: '2024-01-14T16:00:00Z'
  }
];

// Create the complete Supplier module using ModuleFactory
export const SupplierModule = createModule<Supplier>({
  name: 'suppliers',
  displayName: 'Gestión de Proveedores',
  description: 'Sistema completo de gestión de proveedores con análisis de performance',
  version: '1.0.0',
  entitySchema: SupplierSchema,
  entityName: 'Proveedor',

  // Form configuration using DynamicForm patterns
  formSections: [
    {
      title: 'Información Básica',
      description: 'Datos principales del proveedor',
      fields: [
        {
          name: 'name',
          label: 'Nombre de la Empresa',
          type: 'text',
          placeholder: 'Ej: Distribuidora San Juan',
          required: true,
          gridColumn: '1 / -1'
        },
        {
          name: 'contact_person',
          label: 'Persona de Contacto',
          type: 'text',
          placeholder: 'Ej: Juan Pérez'
        },
        {
          name: 'category',
          label: 'Categoría',
          type: 'text', // Would be select in real implementation
          placeholder: 'food, beverages, cleaning, etc.'
        }
      ]
    },
    {
      title: 'Información de Contacto',
      description: 'Datos de contacto y comunicación',
      fields: [
        {
          name: 'email',
          label: 'Email',
          type: 'email',
          placeholder: 'proveedor@empresa.com'
        },
        {
          name: 'phone',
          label: 'Teléfono',
          type: 'tel',
          placeholder: '+54 11 1234-5678'
        },
        {
          name: 'address',
          label: 'Dirección',
          type: 'textarea',
          placeholder: 'Dirección completa del proveedor',
          gridColumn: '1 / -1'
        }
      ]
    },
    {
      title: 'Términos Comerciales',
      description: 'Condiciones de pago y comerciales',
      fields: [
        {
          name: 'payment_terms',
          label: 'Términos de Pago',
          type: 'text', // Would be select: cash, 15_days, 30_days, 60_days
          placeholder: 'cash, 15_days, 30_days, 60_days'
        },
        {
          name: 'tax_id',
          label: 'CUIT/CUIL',
          type: 'text',
          placeholder: '20-12345678-9'
        }
      ]
    },
    {
      title: 'Información Adicional',
      description: 'Notas y observaciones',
      fields: [
        {
          name: 'notes',
          label: 'Notas',
          type: 'textarea',
          placeholder: 'Observaciones adicionales sobre el proveedor...',
          gridColumn: '1 / -1'
        }
      ]
    }
  ],

  // Data operations (would connect to real API)
  dataFetcher: async () => {
    // Simulate API call
    return new Promise((resolve) => {
      setTimeout(() => resolve(mockSuppliers), 500);
    });
  },

  // Search function
  searchFn: (query: string, suppliers: Supplier[]) => {
    return suppliers.filter(supplier =>
      supplier.name.toLowerCase().includes(query.toLowerCase()) ||
      supplier.contact_person?.toLowerCase().includes(query.toLowerCase()) ||
      supplier.email?.toLowerCase().includes(query.toLowerCase()) ||
      supplier.category.toLowerCase().includes(query.toLowerCase())
    );
  },

  // CRUD operations
  createFn: async (data: Partial<Supplier>) => {
    const newSupplier: Supplier = {
      id: Date.now().toString(),
      created_at: new Date().toISOString(),
      total_orders: 0,
      total_value: 0,
      average_delivery_time: 0,
      quality_rating: 5,
      payment_terms: '30_days',
      status: 'active',
      category: 'general',
      ...data
    } as Supplier;

    mockSuppliers.push(newSupplier);
    return newSupplier;
  },

  updateFn: async (id: string, data: Partial<Supplier>) => {
    const index = mockSuppliers.findIndex(s => s.id === id);
    if (index === -1) throw new Error('Supplier not found');

    const updatedSupplier = {
      ...mockSuppliers[index],
      ...data,
      updated_at: new Date().toISOString()
    };

    mockSuppliers[index] = updatedSupplier;
    return updatedSupplier;
  },

  deleteFn: async (id: string) => {
    const index = mockSuppliers.findIndex(s => s.id === id);
    if (index === -1) throw new Error('Supplier not found');
    mockSuppliers.splice(index, 1);
  },

  // Analytics configuration
  metricsDefinition: [
    { key: 'total_count', label: 'Total Proveedores', format: 'number' },
    { key: 'active_count', label: 'Activos', format: 'number', colorPalette: 'green' },
    { key: 'average_rating', label: 'Rating Promedio', format: 'number', colorPalette: 'blue' },
    { key: 'total_value', label: 'Valor Total Órdenes', format: 'currency', colorPalette: 'purple' }
  ],

  // Custom analytics
  analyticsCustomizer: async (suppliers: Supplier[]) => {
    // Supplier-specific analytics
    const categoryBreakdown = suppliers.reduce((acc, supplier) => {
      acc[supplier.category] = (acc[supplier.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const paymentTermsBreakdown = suppliers.reduce((acc, supplier) => {
      acc[supplier.payment_terms] = (acc[supplier.payment_terms] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const qualityStats = {
      averageRating: suppliers.reduce((sum, s) => sum + s.quality_rating, 0) / suppliers.length,
      highQuality: suppliers.filter(s => s.quality_rating >= 4.5).length,
      needsImprovement: suppliers.filter(s => s.quality_rating < 3).length
    };

    return {
      categoryBreakdown,
      paymentTermsBreakdown,
      qualityStats,
      topPerformers: suppliers
        .sort((a, b) => (b.quality_rating * b.total_value) - (a.quality_rating * a.total_value))
        .slice(0, 5),
      insights: [
        `${suppliers.filter(s => s.status === 'active').length} proveedores activos`,
        `Rating promedio: ${qualityStats.averageRating.toFixed(1)}/5`,
        `${qualityStats.highQuality} proveedores de alta calidad (4.5+ estrellas)`,
        qualityStats.needsImprovement > 0 &&
          `⚠️ ${qualityStats.needsImprovement} proveedores necesitan mejoras`
      ].filter(Boolean)
    };
  }
});

// Export components and hooks for use in the application
export const {
  MainPage: SupplierPage,
  FormComponent: SupplierForm,
  ListComponent: SupplierList,
  AnalyticsComponent: SupplierAnalytics,
  useEnhanced: useSuppliers
} = SupplierModule;

// Usage examples:
/*
// In a React component:
import { SupplierPage, useSuppliers } from './SupplierModuleExample';

import { logger } from '@/lib/logging';
function App() {
  return <SupplierPage />;
}

// Or use individual components:
function CustomSupplierManagement() {
  const { data, loading, create, update, delete: deleteSupplier } = useSuppliers();

  // All the CRUD operations, search, analytics are available
  return (
    <div>
      <SupplierForm
        onSuccess={() => logger.info('App', 'Supplier created!')}
        onCancel={() => logger.debug('SupplierModuleExample', 'Cancelled')}
      />
      <SupplierList />
      <SupplierAnalytics />
    </div>);
}
*/