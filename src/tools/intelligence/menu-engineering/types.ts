// Menu Engineering Types
export interface MenuCategory {
  id: string;
  name: 'stars' | 'plowhorses' | 'puzzles' | 'dogs';
  label: string;
  description: string;
  color: string;
  strategy: string;
}

export interface MenuEngineering {
  categories: MenuCategory[];
  recommendations: string[];
  metrics: {
    averageMargin: number;
    averagePopularity: number;
    totalItems: number;
  };
}