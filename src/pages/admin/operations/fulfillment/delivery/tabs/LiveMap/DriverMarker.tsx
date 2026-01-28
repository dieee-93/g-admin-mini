// DriverMarker component for rendering driver markers on Leaflet
import { useMemo } from 'react';
import { CircleMarker, Popup } from 'react-leaflet';
import { useDriverLocation } from '@/modules/delivery/hooks/useDriverLocation';

interface DriverMarkerProps {
  driverId: string;
  driverName: string;
}

export function DriverMarker({ driverId, driverName }: DriverMarkerProps) {
  const { location } = useDriverLocation(driverId);

  // Memoize position to avoid unnecessary re-renders
  const position: [number, number] | null = useMemo(() => {
    if (!location) return null;
    return [location.latitude, location.longitude];
  }, [location]);

  if (!location || !position) {
    return null;
  }

  // Calculate speed in km/h if available
  const speedKmh = location.speed ? Math.round(location.speed * 3.6) : null;
  const accuracyMeters = location.accuracy ? Math.round(location.accuracy) : null;
  const lastUpdate = new Date(location.timestamp).toLocaleTimeString('es-AR', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });

  return (
    <CircleMarker
      center={position}
      radius={12}
      pathOptions={{
        fillColor: '#10B981',    // Green for active driver
        fillOpacity: 1,
        color: '#FFFFFF',        // White border
        weight: 3,
        opacity: 1
      }}
      // Higher zIndex to render above delivery markers
      pane="markerPane"
    >
      <Popup maxWidth={250} minWidth={180}>
        <div style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
          <h3 style={{
            margin: '0 0 8px 0',
            fontSize: '14px',
            fontWeight: 'bold',
            display: 'flex',
            alignItems: 'center',
            gap: '4px'
          }}>
            🚗 {driverName}
          </h3>
          <div style={{ fontSize: '12px', lineHeight: '1.6' }}>
            {speedKmh !== null && (
              <div style={{ marginBottom: '4px' }}>
                <strong>Velocidad:</strong> {speedKmh} km/h
              </div>
            )}
            {accuracyMeters !== null && (
              <div style={{ marginBottom: '4px' }}>
                <strong>Precisión:</strong> {accuracyMeters}m
              </div>
            )}
            <div style={{
              marginTop: '8px',
              paddingTop: '8px',
              borderTop: '1px solid #e5e7eb',
              color: '#6b7280',
              fontSize: '11px'
            }}>
              Última actualización: {lastUpdate}
            </div>
          </div>
        </div>
      </Popup>
    </CircleMarker>
  );
}
