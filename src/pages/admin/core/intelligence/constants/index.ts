import { createListCollection } from '@/shared/ui';

export const competitorTypeOptions = createListCollection({
  items: [
    { value: 'all', label: 'Todos los Competidores' },
    { value: 'direct', label: 'Competencia Directa' },
    { value: 'indirect', label: 'Competencia Indirecta' },
    { value: 'substitute', label: 'Productos Sustitutos' }
  ]
});

export const marketPositionOptions = createListCollection({
  items: [
    { value: 'all', label: 'Todas las Posiciones' },
    { value: 'leader', label: 'Líder' },
    { value: 'challenger', label: 'Retador' },
    { value: 'follower', label: 'Seguidor' },
    { value: 'niche', label: 'Nicho' }
  ]
});
