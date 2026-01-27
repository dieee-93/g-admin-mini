/**
 * Unified Analytics Engine
 * Consolidates RFM, trends, predictions from customers, sales, materials modules
 */
import { DecimalUtils } from '@/lib/decimal';

export interface AnalyticsConfig {
  module: string;
  timeRange?: '7d' | '30d' | '90d' | '1y';
  includeForecasting?: boolean;
  includeTrends?: boolean;
}

export interface TimeSeriesData {
  date: string;
  value: number;
  label?: string;
}

export interface AnalyticsResult {
  metrics: Record<string, number | string>;
  timeSeries?: TimeSeriesData[];
  insights?: string[];
  recommendations?: string[];
}

/**
 * RFM Analysis for any entity with transactional data
 */
export class RFMAnalytics {
  static calculateRFM<T extends {
    id: string;
    last_activity?: string;
    frequency?: number;
    total_value?: number;
  }>(entities: T[]): Record<string, { r: number; f: number; m: number; segment: string }> {
    const now = new Date();
    const results: Record<string, { r: number; f: number; m: number; segment: string }> = {};

    // Calculate Recency (days since last activity)
    const recencyScores = entities.map(entity => {
      if (!entity.last_activity) return { id: entity.id, score: 365 };
      const daysSince = Math.floor((now.getTime() - new Date(entity.last_activity).getTime()) / (1000 * 60 * 60 * 24));
      return { id: entity.id, score: daysSince };
    });

    // Calculate Frequency
    const frequencyScores = entities.map(entity => ({
      id: entity.id,
      score: entity.frequency || 0
    }));

    // Calculate Monetary
    const monetaryScores = entities.map(entity => ({
      id: entity.id,
      score: entity.total_value || 0
    }));

    // Assign quintiles (1-5 scale)
    const assignQuintiles = (scores: { id: string; score: number }[], reverse = false) => {
      const sorted = [...scores].sort((a, b) => reverse ? b.score - a.score : a.score - b.score);
      const quintileSize = Math.ceil(sorted.length / 5);

      return sorted.reduce((acc, item, index) => {
        const quintile = Math.min(5, Math.ceil((index + 1) / quintileSize));
        acc[item.id] = quintile;
        return acc;
      }, {} as Record<string, number>);
    };

    const rScores = assignQuintiles(recencyScores, true); // Recent = high score
    const fScores = assignQuintiles(frequencyScores);
    const mScores = assignQuintiles(monetaryScores);

    // Combine scores and segment
    entities.forEach(entity => {
      const r = rScores[entity.id] || 1;
      const f = fScores[entity.id] || 1;
      const m = mScores[entity.id] || 1;

      let segment = 'At Risk';
      if (r >= 4 && f >= 4 && m >= 4) segment = 'Champions';
      else if (r >= 3 && f >= 3 && m >= 3) segment = 'Loyal Customers';
      else if (r >= 4 && f <= 2) segment = 'New Customers';
      else if (r <= 2 && f >= 3) segment = 'Cannot Lose Them';
      else if (f >= 3 && m >= 3) segment = 'Potential Loyalists';

      results[entity.id] = { r, f, m, segment };
    });

    return results;
  }
}

/**
 * Trend Analysis for time series data
 */
export class TrendAnalytics {
  static calculateTrend(data: TimeSeriesData[]): {
    direction: 'up' | 'down' | 'stable';
    percentage: number;
    confidence: number;
  } {
    if (data.length < 2) {
      return { direction: 'stable', percentage: 0, confidence: 0 };
    }

    const values = data.map(d => d.value);
    const firstHalf = values.slice(0, Math.floor(values.length / 2));
    const secondHalf = values.slice(Math.floor(values.length / 2));

    const firstAvg = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;

    const change = ((secondAvg - firstAvg) / firstAvg) * 100;
    const direction = Math.abs(change) < 5 ? 'stable' : change > 0 ? 'up' : 'down';

    // Simple confidence based on data consistency
    const variance = values.reduce((acc, val) => acc + Math.pow(val - (values.reduce((a, b) => a + b) / values.length), 2), 0) / values.length;
    const confidence = Math.max(0, Math.min(100, 100 - (variance / (secondAvg || 1)) * 10));

    return {
      direction,
      percentage: Math.abs(change),
      confidence: Math.round(confidence)
    };
  }

  static generateInsights(trend: ReturnType<typeof TrendAnalytics.calculateTrend>, module: string): string[] {
    const insights: string[] = [];

    if (trend.direction === 'up' && trend.percentage > 10) {
      insights.push(`📈 ${module} showing strong growth of ${trend.percentage.toFixed(1)}%`);
    } else if (trend.direction === 'down' && trend.percentage > 15) {
      insights.push(`📉 ${module} declining by ${trend.percentage.toFixed(1)}% - requires attention`);
    } else if (trend.direction === 'stable') {
      insights.push(`📊 ${module} performance is stable`);
    }

    if (trend.confidence < 50) {
      insights.push(`⚠️ Low confidence (${trend.confidence}%) - more data needed for reliable insights`);
    }

    return insights;
  }
}

/**
 * Main Analytics Engine
 */
export class AnalyticsEngine {
  static async generateAnalytics<T extends Record<string, any>>(
    data: T[],
    config: AnalyticsConfig
  ): Promise<AnalyticsResult> {
    const { module, timeRange = '30d', includeForecasting = true, includeTrends = true } = config;

    const result: AnalyticsResult = {
      metrics: {},
      insights: [],
      recommendations: []
    };

    // Basic metrics
    result.metrics.total_count = data.length;
    result.metrics.period = timeRange;

    // Active count (entities with recent activity)
    const activeThreshold = this.getActiveThreshold(timeRange);
    const activeCount = data.filter(item => {
      if (!item.last_activity && !item.updated_at && !item.created_at) return true;
      const lastDate = new Date(item.last_activity || item.updated_at || item.created_at);
      return (Date.now() - lastDate.getTime()) < activeThreshold;
    }).length;

    result.metrics.active_count = activeCount;
    result.metrics.activity_rate = data.length > 0 ? (activeCount / data.length * 100) : 0;

    // Value-based metrics
    if (data.some(item => item.total_value || item.value || item.amount)) {
      const values = data.map(item => item.total_value || item.value || item.amount || 0);
      result.metrics.total_value = values.reduce((sum, val) => sum + val, 0);
      result.metrics.average_value = values.length > 0 ? result.metrics.total_value / values.length : 0;
      result.metrics.max_value = Math.max(...values);
    }

    // Generate insights
    result.insights = this.generateBasicInsights(result.metrics, module);

    // Trend analysis
    if (includeTrends && data.length > 0) {
      const timeSeries = this.generateTimeSeries(data, timeRange);
      if (timeSeries.length > 1) {
        const trend = TrendAnalytics.calculateTrend(timeSeries);
        result.timeSeries = timeSeries;
        result.insights.push(...TrendAnalytics.generateInsights(trend, module));
      }
    }

    // Recommendations
    result.recommendations = this.generateRecommendations(result.metrics, module);

    return result;
  }

  private static getActiveThreshold(timeRange: string): number {
    const day = 24 * 60 * 60 * 1000;
    switch (timeRange) {
      case '7d': return 7 * day;
      case '30d': return 30 * day;
      case '90d': return 90 * day;
      case '1y': return 365 * day;
      default: return 30 * day;
    }
  }

  private static generateTimeSeries<T extends Record<string, any>>(
    data: T[],
    timeRange: string
  ): TimeSeriesData[] {
    // Simple implementation - group by day and count
    const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90;
    const series: TimeSeriesData[] = [];

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];

      const dayData = data.filter(item => {
        const itemDate = item.created_at || item.updated_at;
        return itemDate && itemDate.startsWith(dateStr);
      });

      series.push({
        date: dateStr,
        value: dayData.length,
        label: date.toLocaleDateString('es-ES', { month: 'short', day: 'numeric' })
      });
    }

    return series;
  }

  private static generateBasicInsights(metrics: Record<string, any>, module: string): string[] {
    const insights: string[] = [];

    if (metrics.activity_rate < 30) {
      insights.push(`⚠️ Low activity rate (${metrics.activity_rate.toFixed(1)}%) in ${module}`);
    } else if (metrics.activity_rate > 70) {
      insights.push(`✅ High activity rate (${metrics.activity_rate.toFixed(1)}%) in ${module}`);
    }

    if (metrics.total_value) {
      insights.push(`💰 Total value: ${DecimalUtils.formatCurrency(metrics.total_value)}`);
    }

    if (metrics.average_value && metrics.max_value) {
      const ratio = metrics.average_value / metrics.max_value;
      if (ratio < 0.1) {
        insights.push(`📊 High value concentration - top items drive most value`);
      }
    }

    return insights;
  }

  private static generateRecommendations(metrics: Record<string, any>, module: string): string[] {
    const recommendations: string[] = [];

    if (metrics.activity_rate < 50) {
      recommendations.push(`Increase engagement in ${module} - current activity is below average`);
    }

    if (metrics.total_count < 10) {
      recommendations.push(`Build up ${module} data - more entries needed for reliable insights`);
    }

    if (metrics.average_value && metrics.average_value > 0) {
      recommendations.push(`Focus on high-value ${module} items to maximize ROI`);
    }

    return recommendations;
  }
}