import { describe, it, expect } from 'vitest';

/**
 * Business Logic Tests for Floor Module
 * Tests pure functions without UI dependencies
 */

// Helper functions extracted from FloorPlanView.tsx
export function getStatusColor(status: string) {
  switch (status) {
    case 'available': return 'success';
    case 'occupied': return 'warning';
    case 'reserved': return 'info';
    case 'cleaning': return 'gray';
    case 'ready_for_bill': return 'accent';
    case 'maintenance': return 'error';
    default: return 'gray';
  }
}

export function getPriorityIcon(priority: string) {
  switch (priority) {
    case 'vip': return '👑';
    case 'urgent': return '🚨';
    case 'attention_needed': return '⚠️';
    default: return '';
  }
}

export function formatDuration(minutes: number) {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
}

export function calculateOccupancyRate(occupied: number, total: number): number {
  if (total === 0) return 0;
  return (occupied / total) * 100;
}

describe('Floor Business Logic', () => {
  describe('getStatusColor', () => {
    it('should return correct color for each status', () => {
      expect(getStatusColor('available')).toBe('success');
      expect(getStatusColor('occupied')).toBe('warning');
      expect(getStatusColor('reserved')).toBe('info');
      expect(getStatusColor('cleaning')).toBe('gray');
      expect(getStatusColor('ready_for_bill')).toBe('accent');
      expect(getStatusColor('maintenance')).toBe('error');
    });

    it('should return gray for unknown status', () => {
      expect(getStatusColor('unknown')).toBe('gray');
      expect(getStatusColor('')).toBe('gray');
      expect(getStatusColor('invalid_status')).toBe('gray');
    });
  });

  describe('getPriorityIcon', () => {
    it('should return correct icon for each priority', () => {
      expect(getPriorityIcon('vip')).toBe('👑');
      expect(getPriorityIcon('urgent')).toBe('🚨');
      expect(getPriorityIcon('attention_needed')).toBe('⚠️');
      expect(getPriorityIcon('normal')).toBe('');
    });

    it('should return empty string for unknown priority', () => {
      expect(getPriorityIcon('unknown')).toBe('');
      expect(getPriorityIcon('')).toBe('');
    });
  });

  describe('formatDuration', () => {
    it('should format minutes only', () => {
      expect(formatDuration(45)).toBe('45m');
      expect(formatDuration(30)).toBe('30m');
      expect(formatDuration(5)).toBe('5m');
    });

    it('should format hours and minutes', () => {
      expect(formatDuration(125)).toBe('2h 5m');
      expect(formatDuration(90)).toBe('1h 30m');
      expect(formatDuration(185)).toBe('3h 5m');
    });

    it('should handle exact hours', () => {
      expect(formatDuration(60)).toBe('1h 0m');
      expect(formatDuration(120)).toBe('2h 0m');
      expect(formatDuration(180)).toBe('3h 0m');
    });

    it('should handle edge cases', () => {
      expect(formatDuration(0)).toBe('0m');
      expect(formatDuration(1)).toBe('1m');
      expect(formatDuration(59)).toBe('59m');
      expect(formatDuration(61)).toBe('1h 1m');
    });
  });

  describe('calculateOccupancyRate', () => {
    it('should calculate percentage correctly', () => {
      expect(calculateOccupancyRate(7, 20)).toBe(35.0);
      expect(calculateOccupancyRate(5, 10)).toBe(50.0);
      expect(calculateOccupancyRate(3, 12)).toBe(25.0);
    });

    it('should handle 0 total tables', () => {
      expect(calculateOccupancyRate(0, 0)).toBe(0);
      // Division by zero returns 0 (safe default)
    });

    it('should handle 100% occupancy', () => {
      expect(calculateOccupancyRate(10, 10)).toBe(100.0);
      expect(calculateOccupancyRate(5, 5)).toBe(100.0);
    });

    it('should handle 0% occupancy', () => {
      expect(calculateOccupancyRate(0, 10)).toBe(0);
      expect(calculateOccupancyRate(0, 20)).toBe(0);
    });

    it('should handle fractional results', () => {
      expect(calculateOccupancyRate(1, 3)).toBeCloseTo(33.33, 2);
      expect(calculateOccupancyRate(2, 3)).toBeCloseTo(66.67, 2);
    });
  });
});
