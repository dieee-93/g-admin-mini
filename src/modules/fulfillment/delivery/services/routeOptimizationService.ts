// Route optimization service for suggesting best drivers
import type { DriverPerformance, DeliveryOrder } from '../types';
import { logger } from '@/lib/logging';

export interface DriverSuggestion {
  driver: DriverPerformance;
  distance: number; // in km
  estimatedTime: number; // in minutes
  score: number; // 0-100
}

class RouteOptimizationService {
  /**
   * Get suggested drivers sorted by best fit
   */
  async getSuggestedDrivers(
    delivery: DeliveryOrder,
    availableDrivers: DriverPerformance[]
  ): Promise<DriverSuggestion[]> {
    const suggestions: DriverSuggestion[] = [];

    logger.info('RouteOptimization', 'Calculating suggestions', {
      deliveryId: delivery.id,
      availableDriversCount: availableDrivers.length
    });

    for (const driver of availableDrivers) {
      // Skip unavailable or busy drivers
      if (!driver.is_available || driver.current_delivery_id) {
        continue;
      }

      // Skip drivers without location
      if (!driver.last_location) {
        continue;
      }

      // Calculate distance using Haversine formula
      const distance = this.calculateDistance(
        driver.last_location.lat,
        driver.last_location.lng,
        delivery.delivery_coordinates.lat,
        delivery.delivery_coordinates.lng
      );

      // Calculate estimated time
      const estimatedTime = this.calculateETA(distance);

      // Calculate score (0-100)
      const score = this.calculateScore(driver, distance, estimatedTime);

      suggestions.push({
        driver,
        distance,
        estimatedTime,
        score
      });
    }

    // Sort by score (highest first)
    suggestions.sort((a, b) => b.score - a.score);

    logger.info('RouteOptimization', 'Suggestions calculated', {
      count: suggestions.length,
      topScore: suggestions[0]?.score
    });

    return suggestions;
  }

  /**
   * Calculate distance between two points using Haversine formula
   * Returns distance in kilometers
   */
  private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Earth radius in km
    const dLat = this.toRad(lat2 - lat1);
    const dLon = this.toRad(lon2 - lon1);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRad(lat1)) *
        Math.cos(this.toRad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;

    return distance;
  }

  /**
   * Calculate estimated time of arrival in minutes
   * Assumes average city speed of 30 km/h
   */
  private calculateETA(distanceKm: number): number {
    const AVERAGE_SPEED_KMH = 30; // City driving average
    const timeHours = distanceKm / AVERAGE_SPEED_KMH;
    const timeMinutes = Math.ceil(timeHours * 60);
    return timeMinutes;
  }

  /**
   * Calculate driver score based on multiple factors
   * Returns value between 0-100 (higher is better)
   */
  private calculateScore(
    driver: DriverPerformance,
    distance: number,
    estimatedTime: number
  ): number {
    let score = 100;

    // Factor 1: Distance penalty (max -40 points)
    // Penalize 2 points per km, capped at 40 points
    const distancePenalty = Math.min(distance * 2, 40);
    score -= distancePenalty;

    // Factor 2: Rating bonus (up to +20 points)
    if (driver.customer_rating && driver.customer_rating > 0) {
      const ratingBonus = (driver.customer_rating / 5) * 20;
      score += ratingBonus;
    }

    // Factor 3: Workload bonus (up to +20 points)
    // Reward drivers with lower current workload
    const deliveriesToday = driver.completed_today || 0;
    const workloadBonus = Math.max(20 - deliveriesToday, 0);
    score += workloadBonus;

    // Factor 4: On-time rate bonus (up to +15 points)
    if (driver.on_time_rate && driver.on_time_rate > 0) {
      const onTimeBonus = (driver.on_time_rate / 100) * 15;
      score += onTimeBonus;
    }

    // Factor 5: Time penalty (for very long ETAs)
    // Penalize 1 point for every 10 minutes over 30 minutes
    if (estimatedTime > 30) {
      const timePenalty = Math.floor((estimatedTime - 30) / 10);
      score -= timePenalty;
    }

    // Ensure score stays within 0-100
    return Math.max(0, Math.min(100, Math.round(score)));
  }

  /**
   * Convert degrees to radians
   */
  private toRad(degrees: number): number {
    return (degrees * Math.PI) / 180;
  }

  /**
   * Get optimal route for multiple deliveries (simple version)
   * For Phase 4, this is a basic nearest-neighbor algorithm
   * TODO: Implement more sophisticated algorithm (Traveling Salesman Problem)
   */
  async optimizeRoute(deliveries: DeliveryOrder[]): Promise<DeliveryOrder[]> {
    if (deliveries.length <= 1) return deliveries;

    logger.info('RouteOptimization', 'Optimizing route', {
      deliveryCount: deliveries.length
    });

    // Simple nearest-neighbor algorithm
    const optimized: DeliveryOrder[] = [];
    const remaining = [...deliveries];
    let current = remaining[0]; // Start with first delivery

    optimized.push(current);
    remaining.splice(0, 1);

    while (remaining.length > 0) {
      let nearestIndex = 0;
      let nearestDistance = Infinity;

      // Find nearest delivery to current position
      remaining.forEach((delivery, index) => {
        const distance = this.calculateDistance(
          current.delivery_coordinates.lat,
          current.delivery_coordinates.lng,
          delivery.delivery_coordinates.lat,
          delivery.delivery_coordinates.lng
        );

        if (distance < nearestDistance) {
          nearestDistance = distance;
          nearestIndex = index;
        }
      });

      current = remaining[nearestIndex];
      optimized.push(current);
      remaining.splice(nearestIndex, 1);
    }

    return optimized;
  }
}

// Singleton instance
export const routeOptimizationService = new RouteOptimizationService();
