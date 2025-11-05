import { createListCollection } from '@/shared/ui';
import { 
  type ItemType, 
  type MeasurableUnit, 
  type CountUnit 
} from '../../../types';

// Common type for all select options with labels
export type LabeledOption<T> = {
  label: string;
  value: T;
  description?: string;
};

export const ITEM_TYPE_COLLECTION = createListCollection<LabeledOption<ItemType>>({
  items: [
    { 
      label: '📏 Conmensurable (peso, volumen)', 
      value: 'MEASURABLE',
      description: 'Items que se miden por peso, volumen o longitud'
    },
    { 
      label: '🔢 Contable (unidades)', 
      value: 'COUNTABLE',
      description: 'Items que se cuentan por unidades, pueden tener packaging'
    },
    { 
      label: '🍳 Elaborado (tiene receta)', 
      value: 'ELABORATED',
      description: 'Items producidos con ingredientes, requieren receta'
    }
  ]
});

export const CATEGORY_COLLECTION = createListCollection<LabeledOption<string>>({
  items: [
    { label: 'Sin categoría', value: 'Sin categoría' },
    { label: '🥛 Lácteos', value: 'Lácteos' },
    { label: '🥩 Carnes', value: 'Carnes' },
    { label: '🥬 Verduras', value: 'Verduras' },
    { label: '🍎 Frutas', value: 'Frutas' },
    { label: '🧂 Condimentos', value: 'Condimentos' },
    { label: '🥤 Bebidas', value: 'Bebidas' },
    { label: '🍞 Panadería', value: 'Panadería' }
  ]
});

export const MEASURABLE_UNITS_COLLECTION = createListCollection<LabeledOption<MeasurableUnit>>({
  items: [
    // Weight units
    { label: 'Kilogramos (kg)', value: 'kg' },
    { label: 'Gramos (g)', value: 'g' },
    // Volume units  
    { label: 'Litros (L)', value: 'l' },
    { label: 'Mililitros (ml)', value: 'ml' },
    // Length units
    { label: 'Metros (m)', value: 'm' },
    { label: 'Centímetros (cm)', value: 'cm' }
  ]
});

export const COUNTABLE_UNITS_COLLECTION = createListCollection<LabeledOption<CountUnit>>({
  items: [
    { label: 'Unidad', value: 'unidad' },
    { label: 'Docena', value: 'docena' },
    { label: 'Caja', value: 'caja' },
    { label: 'Paquete', value: 'paquete' }
  ]
});
