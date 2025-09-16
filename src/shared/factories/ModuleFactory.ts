/**
 * Module Factory Pattern
 * Generates complete modules using validated patterns from customers, materials, and sales
 */
import { z, ZodSchema } from 'zod';
import { FormSectionConfig, DynamicForm } from '@/shared/components/forms';
import { useFormManager, useDataFetcher, useDataSearch, useModuleAnalytics } from '@/shared/hooks/business';
import { CRUDHandlers, handleAsyncOperation } from '@/shared/utils/errorHandling';
import { AnalyticsEngine } from '@/shared/services/AnalyticsEngine';

export interface ModuleConfig<TEntity, TMetrics = Record<string, any>> {
  // Module metadata
  name: string;
  displayName: string;
  description: string;
  version: string;

  // Entity configuration
  entitySchema: ZodSchema<TEntity>;
  entityName: string; // e.g., "Customer", "Material", "Sale"

  // Form configuration
  formSections: FormSectionConfig[];

  // Data configuration
  dataFetcher: () => Promise<TEntity[]>;
  searchFn?: (query: string, entities: TEntity[]) => TEntity[];

  // CRUD operations
  createFn: (data: Partial<TEntity>) => Promise<TEntity>;
  updateFn: (id: string, data: Partial<TEntity>) => Promise<TEntity>;
  deleteFn: (id: string) => Promise<void>;

  // Analytics configuration
  metricsDefinition: Array<{
    key: keyof TMetrics;
    label: string;
    format?: 'currency' | 'percentage' | 'number' | 'date';
    colorPalette?: string;
  }>;

  // UI customization
  pageHeader?: {
    title: string;
    subtitle: string;
    icon: React.ComponentType;
  };

  // Business logic
  customHooks?: Record<string, () => any>;
  businessRules?: Array<(entity: TEntity) => string | null>;

  // Analytics customization
  analyticsCustomizer?: (entities: TEntity[]) => Promise<any>;
}

export interface GeneratedModule<TEntity, TMetrics = Record<string, any>> {
  // Components
  MainPage: React.ComponentType;
  FormComponent: React.ComponentType<{
    entity?: TEntity;
    onSuccess?: () => void;
    onCancel?: () => void;
  }>;
  ListComponent: React.ComponentType;
  AnalyticsComponent: React.ComponentType;

  // Hooks
  useEnhanced: () => {
    data: TEntity[];
    loading: boolean;
    error: string | null;
    metrics: TMetrics;
    search: (query: string) => void;
    searchResults: TEntity[];
    clearSearch: () => void;
    create: (data: Partial<TEntity>) => Promise<TEntity | null>;
    update: (id: string, data: Partial<TEntity>) => Promise<TEntity | null>;
    delete: (id: string) => Promise<void>;
    refresh: () => void;
    generateAnalytics: () => Promise<any>;
  };

  // Metadata
  config: ModuleConfig<TEntity, TMetrics>;
}

/**
 * Factory function that creates a complete module
 */
export function createModule<TEntity extends { id: string }, TMetrics = Record<string, any>>(
  config: ModuleConfig<TEntity, TMetrics>
): GeneratedModule<TEntity, TMetrics> {

  // Generate Enhanced Hook
  const useEnhanced = () => {
    // Generic data fetching
    const {
      data,
      loading,
      error,
      refresh
    } = useDataFetcher<TEntity>({
      fetchFn: config.dataFetcher,
      module: config.name,
      dependencies: []
    });

    // Generic search
    const search = useDataSearch<TEntity>({
      searchFn: async (query: string) => {
        if (config.searchFn) {
          return config.searchFn(query, data);
        }
        // Default search implementation
        return data.filter((entity: any) =>
          Object.values(entity).some(value =>
            String(value).toLowerCase().includes(query.toLowerCase())
          )
        );
      }
    });

    // Generic analytics
    const analytics = useModuleAnalytics<TMetrics>({
      module: config.name,
      timeRange: '30d'
    });

    // CRUD operations with standardized error handling
    const create = async (entityData: Partial<TEntity>) => {
      return await CRUDHandlers.create(
        () => config.createFn(entityData),
        config.entityName,
        refresh
      );
    };

    const update = async (id: string, entityData: Partial<TEntity>) => {
      return await CRUDHandlers.update(
        () => config.updateFn(id, entityData),
        config.entityName,
        refresh
      );
    };

    const deleteEntity = async (id: string) => {
      await CRUDHandlers.delete(
        () => config.deleteFn(id),
        config.entityName,
        `¿Estás seguro de eliminar este ${config.entityName.toLowerCase()}?`,
        refresh
      );
    };

    // Generate analytics
    const generateAnalytics = async () => {
      try {
        const baseAnalytics = await AnalyticsEngine.generateAnalytics(data, {
          module: config.name,
          timeRange: '30d',
          includeForecasting: true,
          includeTrends: true
        });

        // Apply custom analytics if provided
        const customAnalytics = config.analyticsCustomizer
          ? await config.analyticsCustomizer(data)
          : {};

        return {
          ...baseAnalytics,
          ...customAnalytics
        };
      } catch (error) {
        console.error(`Error generating analytics for ${config.name}:`, error);
        return null;
      }
    };

    // Calculate metrics
    const metrics = React.useMemo(() => {
      if (!data.length) return {} as TMetrics;

      const baseMetrics: Record<string, any> = {
        total_count: data.length,
        // Add more base metrics calculations here
      };

      return baseMetrics as TMetrics;
    }, [data]);

    return {
      data,
      loading,
      error,
      metrics,
      search: search.search,
      searchResults: search.searchResults,
      clearSearch: search.clearSearch,
      create,
      update,
      delete: deleteEntity,
      refresh,
      generateAnalytics
    };
  };

  // Generate Form Component
  const FormComponent: React.FC<{
    entity?: TEntity;
    onSuccess?: () => void;
    onCancel?: () => void;
  }> = ({ entity, onSuccess, onCancel }) => {
    const isEditMode = !!entity;

    return React.createElement(DynamicForm, {
      title: isEditMode ? `✏️ Editar ${config.entityName}` : `➕ Nuevo ${config.entityName}`,
      description: config.description,
      schema: config.entitySchema,
      sections: config.formSections,
      defaultValues: entity,
      onSubmit: async (data: TEntity) => {
        if (isEditMode) {
          await config.updateFn(entity.id, data);
        } else {
          await config.createFn(data);
        }
        onSuccess?.();
      },
      onCancel,
      submitText: isEditMode ? `✅ Actualizar ${config.entityName}` : `✅ Crear ${config.entityName}`,
      successMessage: {
        title: isEditMode ? 'UPDATED' : 'CREATED',
        description: `${config.entityName} ${isEditMode ? 'actualizado' : 'creado'} correctamente`
      },
      resetOnSuccess: !isEditMode
    });
  };

  // Generate List Component
  const ListComponent: React.FC = () => {
    const { data, loading, search, searchResults, clearSearch } = useEnhanced();
    const [searchQuery, setSearchQuery] = React.useState('');

    const handleSearch = (value: string) => {
      setSearchQuery(value);
      if (value.length >= 2) {
        search(value);
      } else {
        clearSearch();
      }
    };

    if (loading) {
      return React.createElement('div', null, 'Loading...');
    }

    const displayData = searchQuery ? searchResults : data;

    return React.createElement('div', null,
      // Search input
      React.createElement('input', {
        type: 'text',
        placeholder: `Buscar ${config.entityName.toLowerCase()}s...`,
        value: searchQuery,
        onChange: (e: React.ChangeEvent<HTMLInputElement>) => handleSearch(e.target.value)
      }),

      // Results
      React.createElement('div', null,
        displayData.map((entity: TEntity) =>
          React.createElement('div', { key: entity.id },
            JSON.stringify(entity, null, 2) // Simple display - would be customizable
          )
        )
      )
    );
  };

  // Generate Analytics Component
  const AnalyticsComponent: React.FC = () => {
    const { data, generateAnalytics } = useEnhanced();
    const [analytics, setAnalytics] = React.useState<any>(null);
    const [loading, setLoading] = React.useState(false);

    const handleGenerateAnalytics = async () => {
      setLoading(true);
      const result = await generateAnalytics();
      setAnalytics(result);
      setLoading(false);
    };

    React.useEffect(() => {
      if (data.length > 0) {
        handleGenerateAnalytics();
      }
    }, [data]);

    return React.createElement('div', null,
      React.createElement('h2', null, `📊 Analytics de ${config.displayName}`),
      React.createElement('button', {
        onClick: handleGenerateAnalytics,
        disabled: loading
      }, loading ? 'Generando...' : 'Actualizar Analytics'),

      analytics && React.createElement('pre', null,
        JSON.stringify(analytics, null, 2)
      )
    );
  };

  // Generate Main Page Component
  const MainPage: React.FC = () => {
    return React.createElement('div', null,
      React.createElement('h1', null, config.displayName),
      React.createElement('p', null, config.description),
      React.createElement(ListComponent),
      React.createElement(AnalyticsComponent)
    );
  };

  return {
    MainPage,
    FormComponent,
    ListComponent,
    AnalyticsComponent,
    useEnhanced,
    config
  };
}

/**
 * Pre-configured module templates based on validated patterns
 */
export const ModuleTemplates = {
  /**
   * Standard CRUD Module Template
   * Based on customers and materials patterns
   */
  createCRUDModule: <TEntity extends { id: string; name: string }>(
    name: string,
    displayName: string,
    entitySchema: ZodSchema<TEntity>,
    dataFetcher: () => Promise<TEntity[]>,
    crudOps: {
      create: (data: Partial<TEntity>) => Promise<TEntity>;
      update: (id: string, data: Partial<TEntity>) => Promise<TEntity>;
      delete: (id: string) => Promise<void>;
    }
  ) => {
    return createModule<TEntity>({
      name,
      displayName,
      description: `Gestión completa de ${displayName.toLowerCase()}`,
      version: '1.0.0',
      entitySchema,
      entityName: displayName.slice(0, -1), // Remove 's' for singular
      formSections: [
        {
          title: 'Información Básica',
          description: 'Datos principales',
          fields: [
            {
              name: 'name',
              label: 'Nombre',
              type: 'text',
              required: true,
              gridColumn: '1 / -1'
            }
          ]
        }
      ],
      dataFetcher,
      createFn: crudOps.create,
      updateFn: crudOps.update,
      deleteFn: crudOps.delete,
      metricsDefinition: [
        { key: 'total_count' as any, label: 'Total', format: 'number' }
      ]
    });
  }
};

export default createModule;