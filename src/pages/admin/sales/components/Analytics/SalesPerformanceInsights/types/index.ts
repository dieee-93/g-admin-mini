export interface PerformanceInsight {
  category: 'revenue' | 'efficiency' | 'customer' | 'operational';
  type: 'success' | 'warning' | 'critical' | 'opportunity';
  title: string;
  description: string;
  value: number | string;
  trend: 'up' | 'down' | 'stable';
  action_required: boolean;
  recommendation: string;
  impact: 'high' | 'medium' | 'low';
}

export interface PerformanceMetrics {
  overall_score: number;
  category_scores: {
    revenue: number;
    efficiency: number;
    customer: number;
    operational: number;
  };
  insights: PerformanceInsight[];
  benchmarks: {
    industry_average: number;
    top_performers: number;
    your_position: 'leader' | 'strong' | 'average' | 'below_average';
  };
  recommendations: {
    immediate_actions: string[];
    strategic_initiatives: string[];
    long_term_goals: string[];
  };
}
