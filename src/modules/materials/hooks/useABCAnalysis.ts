/**
 * useABCAnalysis Hook
 * 
 * TanStack Query hook for ABC analysis of inventory materials.
 * Reuses existing ABCAnalysisEngine.
 * 
 * Features:
 * - Automatic classification (A/B/C) based on revenue/cost
 * - Configurable thresholds
 * - Caching for expensive calculations
 * - Smart recommendations
 * 
 * @module materials/hooks
 */

import { useQuery } from '@tanstack/react-query';
import { ABCAnalysisEngine } from '@/modules/materials/services';
import { materialsKeys } from './queryKeys';
import type { MaterialItem } from '@/modules/materials/types';
import type { ABCAnalysisConfig, ABCAnalysisResult } from '@/pages/admin/supply-chain/materials/types/abc-analysis';

interface UseABCAnalysisOptions {
  materials: MaterialItem[];
  config?: Partial<ABCAnalysisConfig>;
  enabled?: boolean;
}

/**
 * Perform ABC analysis on inventory materials
 * 
 * ABC Analysis classifies inventory into three categories:
 * - Class A: High value items (top 80% of revenue/cost) - tight control
 * - Class B: Medium value items (next 15%) - moderate control
 * - Class C: Low value items (remaining 5%) - minimal control
 * 
 * @example
 * ```typescript
 * function ABCAnalysisTab() {
 *   const { data: materials } = useMaterials();
 *   const { data: analysis, isLoading } = useABCAnalysis({
 *     materials: materials || [],
 *     config: {
 *       primaryCriteria: 'revenue',
 *       classAThreshold: 80,
 *       classBThreshold: 15,
 *     },
 *     enabled: !!materials?.length,
 *   });
 *   
 *   if (isLoading) return <Spinner />;
 *   
 *   return (
 *     <div>
 *       <h3>Class A: {analysis?.classA.length} items</h3>
 *       <h3>Class B: {analysis?.classB.length} items</h3>
 *       <h3>Class C: {analysis?.classC.length} items</h3>
 *     </div>
 *   );
 * }
 * ```
 * 
 * @param options - Analysis configuration and materials data
 * @returns TanStack Query result with ABC analysis
 */
export function useABCAnalysis({ materials, config, enabled = true }: UseABCAnalysisOptions) {
  return useQuery<ABCAnalysisResult>({
    queryKey: materialsKeys.abcAnalysis(config),
    queryFn: async () => {
      // ✅ REUSE existing ABCAnalysisEngine.analyzeInventory()
      // This already handles:
      // - DecimalUtils for precise calculations
      // - Classification algorithm
      // - Summary generation
      // - Recommendations
      return ABCAnalysisEngine.analyzeInventory(materials, config);
    },
    enabled: enabled && materials.length > 0,
    staleTime: 10 * 60 * 1000, // 10 minutes - analysis is expensive
    gcTime: 30 * 60 * 1000, // Keep in cache for 30 minutes
    refetchOnWindowFocus: false, // Don't refetch on window focus (expensive)
  });
}

/**
 * Quick ABC classification lookup for a single material
 * 
 * @example
 * ```typescript
 * function MaterialCard({ material }: { material: MaterialItem }) {
 *   const { data: materials } = useMaterials();
 *   const { data: analysis } = useABCAnalysis({ materials: materials || [] });
 *   
 *   const abcClass = useABCClassification(material.id, analysis);
 *   
 *   return (
 *     <Badge colorScheme={abcClass === 'A' ? 'red' : abcClass === 'B' ? 'yellow' : 'green'}>
 *       Clase {abcClass}
 *     </Badge>
 *   );
 * }
 * ```
 */
export function useABCClassification(
  materialId: string,
  analysis?: ABCAnalysisResult
): 'A' | 'B' | 'C' | null {
  if (!analysis) return null;
  
  // Check each class for the material
  if (analysis.classA.some(m => m.id === materialId)) return 'A';
  if (analysis.classB.some(m => m.id === materialId)) return 'B';
  if (analysis.classC.some(m => m.id === materialId)) return 'C';
  
  return null;
}
