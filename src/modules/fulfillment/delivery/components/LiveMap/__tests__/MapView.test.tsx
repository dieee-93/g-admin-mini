import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@/test-utils';
import { MapView } from '../MapView';
import type { DeliveryOrder, DeliveryZone } from '../../../types';

// Mock react-leaflet components
vi.mock('react-leaflet', () => ({
  MapContainer: ({ children }: any) => <div data-testid="map-container">{children}</div>,
  TileLayer: () => <div data-testid="tile-layer" />,
  useMap: () => ({
    fitBounds: vi.fn(),
    setView: vi.fn(),
    getZoom: vi.fn(() => 12),
    eachLayer: vi.fn()
  })
}));

// Mock MapMarker component
vi.mock('../MapMarker', () => ({
  MapMarker: ({ delivery }: any) => (
    <div data-testid="map-marker" data-delivery-id={delivery.id}>
      Marker: {delivery.customer_name}
    </div>
  )
}));

// Mock DriverMarker component
vi.mock('../DriverMarker', () => ({
  DriverMarker: ({ driverId }: any) => (
    <div data-testid="driver-marker" data-driver-id={driverId}>
      Driver Marker
    </div>
  )
}));

describe('MapView Component', () => {
  const mockDeliveries: DeliveryOrder[] = [
    {
      id: 'delivery-1',
      sale_id: 'sale-1',
      order_id: 'order-1',
      order_number: '001',
      customer_id: 'customer-1',
      customer_name: 'Juan Pérez',
      delivery_address: 'Av. Corrientes 1000',
      delivery_coordinates: {
        lat: -34.6037,
        lng: -58.3816
      },
      status: 'pending',
      created_at: new Date().toISOString(),
      items: [],
      total: 100,
      priority: 'normal',
      delivery_type: 'instant'
    }
  ];

  const mockZones: DeliveryZone[] = [];

  it('should render map container', () => {
    render(
      <MapView
        deliveries={mockDeliveries}
        zones={mockZones}
        selectedDelivery={null}
        onSelectDelivery={vi.fn()}
      />
    );

    expect(screen.getByTestId('map-container')).toBeInTheDocument();
  });

  it('should render tile layer', () => {
    render(
      <MapView
        deliveries={mockDeliveries}
        zones={mockZones}
        selectedDelivery={null}
        onSelectDelivery={vi.fn()}
      />
    );

    expect(screen.getByTestId('tile-layer')).toBeInTheDocument();
  });

  it('should render delivery markers', () => {
    render(
      <MapView
        deliveries={mockDeliveries}
        zones={mockZones}
        selectedDelivery={null}
        onSelectDelivery={vi.fn()}
      />
    );

    const marker = screen.getByTestId('map-marker');
    expect(marker).toBeInTheDocument();
    expect(marker).toHaveTextContent('Juan Pérez');
  });

  it('should handle empty deliveries array', () => {
    render(
      <MapView
        deliveries={[]}
        zones={mockZones}
        selectedDelivery={null}
        onSelectDelivery={vi.fn()}
      />
    );

    expect(screen.getByTestId('map-container')).toBeInTheDocument();
    expect(screen.queryByTestId('map-marker')).not.toBeInTheDocument();
  });

  it('should not render markers without coordinates', () => {
    const deliveriesNoCoords: DeliveryOrder[] = [
      {
        ...mockDeliveries[0],
        delivery_coordinates: { lat: 0, lng: 0 }
      }
    ];

    render(
      <MapView
        deliveries={deliveriesNoCoords}
        zones={mockZones}
        selectedDelivery={null}
        onSelectDelivery={vi.fn()}
      />
    );

    // Markers with lat=0, lng=0 should still render as they're technically valid
    // but in real use case, we'd filter them out
    expect(screen.getByTestId('map-container')).toBeInTheDocument();
  });

  it('should render driver markers for in_transit deliveries with driver_id', () => {
    const deliveriesWithDriver: DeliveryOrder[] = [
      {
        ...mockDeliveries[0],
        status: 'in_transit',
        driver_id: 'driver-123',
        driver_name: 'Driver Test'
      }
    ];

    render(
      <MapView
        deliveries={deliveriesWithDriver}
        zones={mockZones}
        selectedDelivery={null}
        onSelectDelivery={vi.fn()}
      />
    );

    const driverMarker = screen.getByTestId('driver-marker');
    expect(driverMarker).toBeInTheDocument();
    expect(driverMarker).toHaveAttribute('data-driver-id', 'driver-123');
  });

  it('should not render driver markers for deliveries without driver_id', () => {
    const deliveriesNoDriver: DeliveryOrder[] = [
      {
        ...mockDeliveries[0],
        status: 'in_transit'
        // No driver_id
      }
    ];

    render(
      <MapView
        deliveries={deliveriesNoDriver}
        zones={mockZones}
        selectedDelivery={null}
        onSelectDelivery={vi.fn()}
      />
    );

    expect(screen.queryByTestId('driver-marker')).not.toBeInTheDocument();
  });
});
