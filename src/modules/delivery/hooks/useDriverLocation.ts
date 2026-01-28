// React hook for tracking driver location in real-time
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';
import { logger } from '@/lib/logging';

interface DriverLocation {
  driver_id: string;
  latitude: number;
  longitude: number;
  accuracy?: number;
  speed?: number;
  heading?: number;
  timestamp: string;
}

export function useDriverLocation(driverId: string | null) {
  const [location, setLocation] = useState<DriverLocation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!driverId) {
      setLoading(false);
      return;
    }

    // Fetch initial location
    const fetchLocation = async () => {
      try {
        setLoading(true);
        setError(null);

        const { data, error: fetchError } = await supabase
          .from('driver_locations')
          .select('*')
          .eq('driver_id', driverId)
          .order('timestamp', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (fetchError) throw fetchError;

        if (data) {
          setLocation(data as DriverLocation);
        } else {
          logger.warn('useDriverLocation', 'No location found for driver', { driverId });
        }
      } catch (err) {
        logger.error('useDriverLocation', 'Error fetching location', { error: err });
        setError('Failed to fetch driver location');
      } finally {
        setLoading(false);
      }
    };

    fetchLocation();

    // Subscribe to real-time updates
    const channel = supabase
      .channel(`driver-location-${driverId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'driver_locations',
          filter: `driver_id=eq.${driverId}`
        },
        (payload) => {
          logger.info('useDriverLocation', 'Real-time location update', payload.new);
          setLocation(payload.new as DriverLocation);
        }
      )
      .subscribe();

    // Cleanup
    return () => {
      supabase.removeChannel(channel);
    };
  }, [driverId]);

  return { location, loading, error };
}
