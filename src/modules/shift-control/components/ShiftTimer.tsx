/**
 * ShiftTimer Component
 *
 * Real-time timer displaying elapsed time since shift opened
 * Updates every second with format HH:MM:SS or DD días HH:MM for shifts over 24 hours
 *
 * @module shift-control/components
 * @version 1.0
 */

import { useState, useEffect, useMemo } from 'react';
import { Badge } from '@/shared/ui';

interface ShiftTimerProps {
  /**
   * ISO timestamp when shift was opened
   */
  startTime: string;
}

/**
 * Formats elapsed time as HH:MM:SS or DD días HH:MM
 */
function formatElapsedTime(startTime: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - startTime.getTime();

  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diffMs % (1000 * 60)) / 1000);

  // If more than 1 day, show days + hours
  if (days > 0) {
    return `${days}d ${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  }

  // Otherwise show HH:MM:SS
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

/**
 * Real-time timer badge for shift elapsed time
 */
export function ShiftTimer({ startTime }: ShiftTimerProps) {
  const [elapsedTime, setElapsedTime] = useState<string>('00:00:00');

  const startTimeDate = useMemo(() => {
    return new Date(startTime);
  }, [startTime]);

  // Update timer every second
  useEffect(() => {
    // Initial update
    setElapsedTime(formatElapsedTime(startTimeDate));

    // Update every second
    const interval = setInterval(() => {
      setElapsedTime(formatElapsedTime(startTimeDate));
    }, 1000);

    return () => clearInterval(interval);
  }, [startTimeDate]);

  return (
    <Badge
      colorPalette="blue"
      size="lg"
      variant="outline"
      fontFamily="mono"
    >
      ⏱️ {elapsedTime}
    </Badge>
  );
}
